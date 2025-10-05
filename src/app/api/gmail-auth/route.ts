import { NextRequest, NextResponse } from 'next/server';
import { Composio, ConnectedAccountListResponse } from '@composio/core';
import { VercelProvider } from '@composio/vercel';

// Initialize Composio with Vercel provider
const composio = new Composio({
  provider: new VercelProvider(),
  apiKey: process.env.COMPOSIO_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user already has a Gmail connection
    const connectedAccounts: ConnectedAccountListResponse = await composio.connectedAccounts.list({
      userIds: [userId],
    });
    console.log('Connected accounts:', connectedAccounts);
    const gmailConnection = connectedAccounts.items.find((account: any) => account.toolkit.slug.toUpperCase() === 'GMAIL');

    if (gmailConnection && gmailConnection.status === 'ACTIVE') {
      return NextResponse.json({
        isConnected: true,
        connectionId: gmailConnection.id,
        email: gmailConnection.data?.email,
        message: 'Gmail account already connected'
      });
    }

    // Get Gmail auth config ID from environment
    const gmailAuthConfigId = process.env.GMAIL_AUTH_CONFIG_ID;

    if (!gmailAuthConfigId) {
      return NextResponse.json(
        { error: 'Gmail auth config not found. Please set GMAIL_AUTH_CONFIG_ID environment variable.' },
        { status: 500 }
      );
    }

    // Initiate Gmail connection
    const connectionRequest = await composio.connectedAccounts.initiate(
      userId,
      gmailAuthConfigId
    );

    return NextResponse.json({
      isConnected: false,
      redirectUrl: connectionRequest.redirectUrl,
      connectionId: connectionRequest.id,
      message: 'Please complete Gmail authentication'
    });

  } catch (error) {
    console.error('Error initiating Gmail connection:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate Gmail connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check Gmail connection status
    const connectedAccounts = await composio.connectedAccounts.list({
      userIds: [userId],
    });

    const gmailConnection = connectedAccounts.items.find((account: any) => account.toolkit.slug.toUpperCase() === 'GMAIL'
    );

    if (gmailConnection && gmailConnection.status === 'ACTIVE') {
      return NextResponse.json({
        isConnected: true,
        connectionId: gmailConnection.id,
        email: gmailConnection.data?.email || 'Unknown',
        status: gmailConnection.status
      });
    }

    return NextResponse.json({
      isConnected: false,
      status: gmailConnection?.status || 'NOT_CONNECTED'
    });

  } catch (error) {
    console.error('Error checking Gmail connection:', error);
    return NextResponse.json(
      {
        error: 'Failed to check Gmail connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}