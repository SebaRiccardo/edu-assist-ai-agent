import { inboxAnalyzerAgent } from '@/agents/inbox-analyzer';
import { ComposioService } from '@/lib/services/composio';
import { createClient, getCurrentUser } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const {
      maxEmails = 50,
      includeRead = false,
      reasoningLanguage,
      verbose,
      courseId,
      course,
      connectedAccountId,
    } = await request.json();

    const supabase = await createClient();

    const user = await getCurrentUser(supabase);

    // Validation
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    if (!course) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    if (!connectedAccountId) {
      return NextResponse.json(
        { error: 'Connected Account ID is required' },
        { status: 400 }
      );
    }

    const connectedGmailAccount =
      await ComposioService.getConnectedAccountById(connectedAccountId);

    if (!connectedGmailAccount) {
      return NextResponse.json(
        { error: 'Connected Account not found' },
        { status: 404 }
      );
    }

    if (connectedGmailAccount.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          error: 'Connected Account is not active',
          account: connectedGmailAccount,
        },
        { status: 401 }
      );
    }

    // Call the encapsulated analysis function
    const result = await inboxAnalyzerAgent({
      course,
      connectedAccountId,
      maxEmails,
      includeRead,
      reasoningLanguage,
      verbose: verbose ?? true,
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('❌ Error in email analysis:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Unknown error occurred',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
