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
 * Safely decode Microsoft/Outlook access token
 */
const decodeMicrosoftToken = (token: string) => {
  try {
    // Microsoft tokens are sometimes base64 encoded or encrypted
    // Try JWT decode first
    return decodeJwt(token);
  } catch (jwtError) {
    try {
      // If not JWT, try base64 decode
      const base64Decoded = Buffer.from(token, 'base64').toString('utf-8');
      // Check if it's now a valid JWT
      if (base64Decoded.includes('.')) {
        return decodeJwt(base64Decoded);
      }
      // Otherwise return partial info
      return { token_type: 'microsoft_access_token' };
    } catch (base64Error) {
      console.warn('Unable to decode token, returning empty object');
      return {};
    }
  }
};

/**
 * Extract user info from Composio connection state
 */
const extractUserInfo = (item: any) => {
  const { state } = item;
  const { val } = state;

  // Try to decode id_token first (preferred)
  let decoded = {};
  if (val?.id_token) {
    decoded = decodeJwt(val.id_token);
  }
  // Fallback: try to decode access_token
  else if (val?.access_token) {
    decoded = decodeMicrosoftToken(val.access_token);
  }

  // Extract email from multiple possible locations
  //@ts-ignore
  const email = decoded.email || decoded.preferred_username || decoded.upn || val?.email || '';

  // Extract name from multiple possible locations
  //@ts-ignore
  const name = decoded.name || decoded.given_name || decoded.family_name || val?.name || '';

  // Extract avatar
  //@ts-ignore
  const avatarUrl = decoded.picture || val?.picture || '';

  return { email, name, avatarUrl, decoded };
};

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

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

    const connectedAccounts: ConnectedAccountListResponse = await ComposioService.getConnectedEmailAccounts(id);

    const connectedComposioAccounts = connectedAccounts?.items.map((item: any) => {
      const { state } = item;
      const { val } = state;

      // Extract user information using helper function
      const { email, name, avatarUrl, decoded } = extractUserInfo(item);

      // Log for debugging (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 Connection Debug:', {
          toolkit: item.toolkit.slug,
          hasIdToken: !!val?.id_token,
          hasAccessToken: !!val?.access_token,
          decodedKeys: Object.keys(decoded),
          email,
          name,
          avatarUrl,
        });
      }

      return {
        id: item.id,
        status: val?.status || 'unknown',
        toolkitSlug: item.toolkit.slug,
        email,
        name,
        avatarUrl,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        redirectUrl: val?.redirectUrl,
      } as ComposioConnectedAccount;
    });

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
        error: error instanceof Error ? error.message : 'Failed to fetch connected accounts',
        details: process.env.NODE_ENV === 'development' ? error : undefined,
      },
      { status: 500 }
    );
  }
}
