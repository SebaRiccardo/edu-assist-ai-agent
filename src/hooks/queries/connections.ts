/**
 * Query functions for Composio connected accounts
 */

import { ComposioConnectedAccount } from '@/app/api/connections/route';

/**
 * Fetch connected accounts from API
 */
export async function fetchConnectedAccounts(): Promise<
  ComposioConnectedAccount[]
> {
  const response = await fetch('/api/connections');

  if (!response.ok) {
    throw new Error(`Failed to fetch connected accounts`);
  }

  const res = await response.json();
  return res.data.accounts || [];
}

/**
 * Query key factory for connections
 */
export const connectionsKeys = {
  all: ['connections'] as const,
  lists: () => [...connectionsKeys.all, 'list'] as const,
  list: (userId?: string) => [...connectionsKeys.lists(), { userId }] as const,
};
