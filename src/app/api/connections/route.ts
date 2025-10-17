import { getCurrentUser } from '@/lib/supabase/server';
import { Composio, ConnectedAccountListResponse } from '@composio/core';
import { NextRequest, NextResponse } from 'next/server';
import { decodeJwt } from 'jose/jwt/decode';
import { ComposioService } from '@/lib/services/composio';

export interface ComposioConnectedAccount {
  id: string;
  status: string;
  toolkitSlug: string;
  email: string;
  name: string;
  redirectUrl?: string;
  avatarUrl: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Connections API Response
 */
export interface ConnectionsResponse {
  success: boolean;
  data?: {
    userId: string;
    accounts: ComposioConnectedAccount[];
    count: number;
  };
  error?: string;
  details?: any;
}

/**
 * GET /api/connections
 *
 * Retrieves all connected accounts for a user from Composio
 * Query params:
 * - userId: The user ID to fetch connections for (required)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    // Validation
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: userId',
        },
        { status: 400 }
      );
    }
    const { id } = user;
    // Initialize Composio client

    // Fetch connected accounts for the user
    const connectedAccounts: ConnectedAccountListResponse =
      await ComposioService.listConnectedAccounts(id, 'GMAIL');

    const connectedComposioAccounts = connectedAccounts?.items.map(
      (item: any) => {
        const { state } = item;
        const { val } = state;

        const idToken = val?.id_token;
        const decoded = idToken ? decodeJwt(idToken || '') : {};

        //console.log('Decoded ID Token:', decoded);
        return {
          id: item.id,
          status: val.status,
          toolkitSlug: item.toolkit.slug,
          email: decoded.email || '',
          name: decoded.name || '',
          avatarUrl: decoded.picture || '',
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          redirectUrl: val.redirectUrl,
        } as ComposioConnectedAccount;
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        userId: id,
        accounts: connectedComposioAccounts,
        count: connectedAccounts.items.length,
      },
    } as ConnectionsResponse);
  } catch (error) {
    console.error('❌ Error fetching connected accounts:', error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch connected accounts',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
