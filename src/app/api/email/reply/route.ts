import { NextRequest, NextResponse } from 'next/server';
import { generateEmailResponse } from '@/agents/generate-responses';
import { sendEmail } from '@/agents/send-email';
import { checkGmailConnection } from '@/lib/services/composio/composio';

export const maxDuration = 60;

/**
 * POST /api/email/reply
 *
 * Workflow: Generate draft response → Send email via Gmail
 */
export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      email,
      priority,
      courseName,
      professorName,
      language = 'English',
    } = await request.json();

    // Validation
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }

    if (!email || !email.id || !email.from || !email.subject || !email.body) {
      return NextResponse.json(
        { error: 'Missing required email information' },
        { status: 400 }
      );
    }

    if (!priority) {
      return NextResponse.json(
        { error: 'Missing required priority information' },
        { status: 400 }
      );
    }

    if (!courseName) {
      return NextResponse.json(
        { error: 'Missing required courseName' },
        { status: 400 }
      );
    }

    // Check Gmail connection before processing
    console.log('🔍 Checking Gmail connection...');
    const connectionStatus = await checkGmailConnection(userId);

    if (!connectionStatus.isConnected) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gmail not connected',
          authRequired: true,
          connectionStatus,
        },
        { status: 401 }
      );
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
      userId,
      to: email.from,
      draft: draftResponse.draftResponse,
      replyToMessageId: email.id,
      threadId: email.threadId,
    });

    console.log('✅ Email workflow complete');

    if (!sendResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send email',
          details: sendResult.error,
          draftResponse, // Return draft even if send fails
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        draft: draftResponse,
        sent: sendResult,
      },
    });
  } catch (error) {
    console.error('❌ Error in email reply workflow:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
