'use server';

import { generateEmailResponse } from '@/agents/generate-responses';
import { sendEmail } from '@/agents/send-email';
import { ComposioService } from '@/lib/services/composio';
import { getCurrentUser } from '@/lib/supabase/server';

const maxDuration = 60;

interface EmailReplyInput {
  email: {
    id: string;
    from: string;
    subject: string;
    body: string;
    category?: string;
    reasoning?: string;
    threadId?: string;
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

interface EmailReplyResult {
  success: boolean;
  data?: {
    draft: {
      draftResponse: string;
    };
    sent: {
      success: boolean;
      messageId?: string;
      error?: string;
    };
  };
  error?: string;
  details?: unknown;
  draftResponse?: {
    draftResponse: string;
  };
}

/**
 * Server action to generate and send an email reply
 * Workflow: Generate draft response → Send email via Gmail
 */
export async function sendEmailReply(
  input: EmailReplyInput
): Promise<EmailReplyResult> {
  try {
    const {
      email,
      priority,
      courseName,
      professorName = 'Professor',
      connectedAccountId,
      language = 'English',
    } = input;

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
    const connectedAccount =
      await ComposioService.getConnectedAccountById(connectedAccountId);

    if (!connectedAccount) {
      return {
        success: false,
        error: 'Gmail not connected',
      };
    }

    console.log('✅ Gmail connection verified');

    // STEP 1: Generate draft response using AI
    console.log('\n📝 STEP 1: Generating draft response...');
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

    // STEP 2: Send email using Gmail
    console.log('\n📧 STEP 2: Sending email via Gmail...');
    const sendResult = await sendEmail({
      userId: user.id,
      to: email.from,
      draft: draftResponse.draftResponse,
      replyToMessageId: email.id,
      threadId: email.threadId,
    });

    console.log('✅ Email workflow complete');

    if (!sendResult.success) {
      return {
        success: false,
        error: 'Failed to send email',
        details: sendResult.error,
        draftResponse, // Return draft even if send fails
      };
    }

    return {
      success: true,
      data: {
        draft: draftResponse,
        sent: sendResult,
      },
    };
  } catch (error) {
    console.error('❌ Error in email reply workflow:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error : undefined,
    };
  }
}
