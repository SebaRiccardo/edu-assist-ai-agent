import composio from '@/lib/services/composio';
import { getCurrentUser } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Type for the connection status response
type ConnectionStatus = {
  id: string;
  status: 'INITIALIZING' | 'INITIATED' | 'ACTIVE' | 'FAILED' | 'EXPIRED';
  authConfig: {
    id: string;
    isComposioManaged: boolean;
    isDisabled: boolean;
  };
  data: Record<string, unknown>;
  params?: Record<string, unknown>;
};

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const connectionId = searchParams.get('connectionId');

  if (!connectionId) {
    return NextResponse.json({ error: 'connection id required' }, { status: 401 });
  }

  try {
    // Wait for connection to complete (with timeout)
    const connection = (await composio.connectedAccounts.waitForConnection(connectionId)) as ConnectionStatus;

    return NextResponse.json({
      id: connection.id,
      status: connection.status,
      callbackUrl: connection.data?.callback_url,
    });
  } catch (error) {
    console.error('Failed to get connection status:', error);

    if (error instanceof Error && 'code' in error) {
      // Handle Composio specific errors
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to get connection status' }, { status: 500 });
  }
}
