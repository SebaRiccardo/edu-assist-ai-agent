'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchConnectedAccounts, connectionsKeys } from './queries/connections';

/**
 * Hook to fetch connected accounts for the current user
 *
 * @returns TanStack Query result with connected accounts data
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useConnections();
 *
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 *
 * const accounts = data?.data?.accounts || [];
 * ```
 */
export function useConnections(refetchInterval?: number) {
  return useQuery({
    queryKey: connectionsKeys.list(),
    queryFn: fetchConnectedAccounts,
    refetchInterval: refetchInterval ?? 60000, // Refetch every 60 seconds if hasInboxes is false
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
