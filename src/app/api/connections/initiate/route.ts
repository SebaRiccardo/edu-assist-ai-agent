import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/supabase/server';
import { ComposioService } from '@/lib/services/composio';
import { error } from 'console';

// Types
interface GmailConnectionRequest {
  userId: string;
  emailProvider: 'gmail' | 'outlook';
  gmailAddress: string;
}

// Helper Functions
const validateRequest = (data: Partial<GmailConnectionRequest>) => {
  if (!data.userId) {
    return { error: 'User ID is required', status: 400 };
  }
  if (!data.emailProvider) {
    return { error: 'Email provider is required', status: 400 };
  }
  return null;
};

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
    }
    const { emailProvider } = await req.json();

    const validationError = validateRequest({ userId: user.id, emailProvider });

    if (validationError) {
      return NextResponse.json(
        { error: validationError.error },
        { status: validationError.status }
      );
    }

    const emailAccounts = await ComposioService.getConnectedEmailAccounts(
      user.id
    );

    //todo:
    //Using emailAccounts.length
    //must check the amount of connected accounts and check if allowed given the subscription type.

    const res = await ComposioService.initEmailConnection(
      user.id,
      emailProvider
    );

    return NextResponse.json(
      {
        ...res,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error initiating Email connection:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate Email connection',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
