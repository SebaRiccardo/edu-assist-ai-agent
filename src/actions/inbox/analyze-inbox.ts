'use server';

import { inboxAnalyzerAgent } from '@/agents/inbox-analyzer';
import { ComposioService } from '@/lib/services/composio';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import type { InboxAnalysisResult } from '@/types';
import type { Course } from '@/lib/supabase/types/courses.types';

interface AnalyzeInboxInput {
  course: Course;
  connectedAccountId: string;
  maxEmails?: number;
  includeRead?: boolean;
  reasoningLanguage?: string;
  verbose?: boolean;
}

interface AnalyzeInboxResponse {
  success: boolean;
  data?: InboxAnalysisResult;
  error?: string;
  details?: unknown;
  account?: any;
}

/**
 * Server action to analyze inbox emails for a specific course
 */
export async function analyzeInbox(input: AnalyzeInboxInput): Promise<AnalyzeInboxResponse> {
  try {
    const { course, connectedAccountId, maxEmails = 50, includeRead = false, reasoningLanguage, verbose = true } = input;

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
        account: connectedEmail,
      };
    }

    // Call the encapsulated analysis function
    const result = await inboxAnalyzerAgent({
      course,
      connectedAccountId,
      maxEmails,
      includeRead,
      reasoningLanguage: reasoningLanguage || 'English',
      verbose,
    });

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('❌ Error in email analysis:', error);

    return {
      success: false,
      error: 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    };
  }
}
