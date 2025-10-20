'use server';

import { generateEmailResponse } from '@/agents/generate-responses';
import { ComposioService } from '@/lib/services/composio';
import { getCurrentUser } from '@/lib/supabase/server';

const maxDuration = 60;

interface EmailDraftInput {
  email: {
    id: string;
    from: string;
    subject: string;
    body: string;
    category?: string;
    reasoning?: string;
  };
  priority: {
    priority: 'critical' | 'high' | 'medium' | 'low';
    responseDeadline: string;
    reasoning: string;
  };
  courseName: string;
  professorName?: string;
  connectedAccountId: string;
  language?: string;
}

interface EmailDraftResult {
  success: boolean;
  data?: {
    draftResponse: string;
  };
  error?: string;
  details?: unknown;
}

/**
 * Server action to generate a draft email response without sending
 */
export async function generateEmailDraft(input: EmailDraftInput): Promise<EmailDraftResult> {
  try {
    const { email, priority, courseName, professorName, connectedAccountId, language = 'Spanish' } = input;

    // Get current user
    const user = await getCurrentUser();

    if (!user) {
      return {
        success: false,
        error: 'unauthenticated',
      };
    }

    // Validate required email information
    if (!email || !email.id || !email.from || !email.subject || !email.body) {
      return {
        success: false,
        error: 'Missing required email information',
      };
    }

    // Validate priority information
    if (!priority) {
      return {
        success: false,
        error: 'Missing required priority information',
      };
    }

    // Validate courseName
    if (!courseName) {
      return {
        success: false,
        error: 'Missing required courseName',
      };
    }

    // Validate connectedAccountId
    if (!connectedAccountId) {
      return {
        success: false,
        error: 'Missing required connectedAccountId',
      };
    }

    // Check Gmail connection before processing
    console.log('🔍 Checking Gmail connection...');
    const connectedAccount = await ComposioService.getConnectedAccountById(connectedAccountId);

    if (connectedAccount.status !== 'ACTIVE') {
      return {
        success: false,
        error: 'Gmail not connected',
      };
    }

    // Generate draft response using AI
    console.log('\n📝 Generating draft response...');
    const draftResponse = await generateEmailResponse({
      email: {
        id: email.id,
        from: email.from,
        subject: email.subject,
        body: email.body,
        category: email.category,
        reasoning: email.reasoning,
      },
      priority: {
        priority: priority.priority,
        responseDeadline: priority.responseDeadline,
        reasoning: priority.reasoning,
      },
      courseName,
      professorName,
      language,
    });

    console.log('✅ Draft response generated');

    return {
      success: true,
      data: draftResponse,
    };
  } catch (error) {
    console.error('❌ Error generating draft:', error);

    return {
      success: false,
      error: 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    };
  }
}
