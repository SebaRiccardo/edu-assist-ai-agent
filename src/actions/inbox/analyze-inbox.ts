'use server';

import { inboxAnalyzerAgent } from '@/agents/inbox-analyzer';
import { ComposioService } from '@/lib/services/composio';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import type { CategorizedEmail, CategorizedEmailWithPriority, InboxAnalysisResult } from '@/types';
import type { Course } from '@/lib/supabase/types/courses.types';
import { getPriorityStats, priorityClassificatorAgent } from '@/agents/priority-classificator';

interface AnalyzeInboxInput {
  course: Course;
  connectedAccountId: string;
  maxEmails?: number;
  includeRead?: boolean;
  reasoningLanguage?: string;
  verbose?: boolean;
  withPriorityClassification: boolean
}

interface AnalyzeInboxResponseData extends InboxAnalysisResult {
  priorityAnalysis?: {
    summary: string,
    critical: number,
    high: number,
    medium: number,
    low: number,
    total: number
  }
  emails: CategorizedEmail[] | CategorizedEmailWithPriority[];
}

interface AnalyzeInboxResponse {
  success: boolean;
  data?: AnalyzeInboxResponseData;
  error?: string;
  details?: unknown;
  account?: {
    status: "INITIALIZING" | "INITIATED" | "FAILED" | "EXPIRED" | "INACTIVE" | "ACTIVE"
  };
}

/**
 * Server action to analyze inbox emails for a specific course
 */
export async function analyzeInbox(input: AnalyzeInboxInput): Promise<AnalyzeInboxResponse> {
  try {
    const { withPriorityClassification = true, course, connectedAccountId, maxEmails = 50, includeRead = false, reasoningLanguage, verbose = true } = input;

    const supabase = await createClient();

    const user = await getCurrentUser(supabase);

    // Validation
    if (!user) {
      return {
        success: false,
        error: 'unauthorized',
      };
    }

    if (!course) {
      return {
        success: false,
        error: 'Course ID is required',
      };
    }

    if (!connectedAccountId) {
      return {
        success: false,
        error: 'Connected Account ID is required',
      };
    }

    const connectedEmail = await ComposioService.getConnectedAccountById(connectedAccountId);

    if (!connectedEmail) {
      return {
        success: false,
        error: `Connected Account not found`,
      };
    }

    if (connectedEmail.status !== 'ACTIVE') {
      return {
        success: false,
        error: ` ${connectedEmail.toolkit.slug} account is not active`,
        account: {
          status: connectedEmail.status
        },
      };
    }

    // Call the encapsulated analysis function
    const inboxAnalysisResult = await inboxAnalyzerAgent({
      course,
      connectedAccountId,
      maxEmails,
      includeRead,
      reasoningLanguage: reasoningLanguage || 'Spanish',
      verbose,
    });

    let finalResponse: AnalyzeInboxResponse = {
      success: true,
      data: inboxAnalysisResult

    }

    if (withPriorityClassification) {

      const originalEmailsMap = new Map<string, CategorizedEmail>()

      const emailsToBePrioritized = inboxAnalysisResult.emails.map((e) => {
        originalEmailsMap.set(e.id, e)
        return {
          id: e.id,
          from: e.from,
          subject: e.subject,
          body: e.body,
          category: e.category,
          reasoning: e.reasoning,
        }
      })

      const prioritizationResult = await priorityClassificatorAgent({
        emails: emailsToBePrioritized,
        language: reasoningLanguage || 'Spanish',
        courseName: course.name,
        analysisSummary: inboxAnalysisResult.analysis.summary,
      });

      const { summary, priorities } = prioritizationResult

      const priorityCounts = getPriorityStats(prioritizationResult);

      console.log(`   • Critical: ${priorityCounts.critical}`);
      console.log(`   • High: ${priorityCounts.high}`);
      console.log(`   • Medium: ${priorityCounts.medium}`);
      console.log(`   • Low: ${priorityCounts.low}`);

      const emailsWithPriority: CategorizedEmailWithPriority[] = priorities.map((email) => {
        const originalEmail = originalEmailsMap.get(email.emailId)!
        return {
          ...originalEmail,
          priority: {
            level: email.priority,
            reasoning: email.reasoning,
            responseDeadline: email.responseDeadline
          }

        }
      })

      finalResponse = {
        ...finalResponse,
        data: {
          ...finalResponse.data!,
          emails: emailsWithPriority,
          priorityAnalysis: {
            summary: summary,
            ...priorityCounts
          }
        }
      }
    }

    console.log(finalResponse.data)
    console.log(finalResponse.data?.emails)
    return finalResponse;

  } catch (error) {
    console.error('❌ Error in email analysis:', error);

    return {
      success: false,
      error: 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    };
  }
}
