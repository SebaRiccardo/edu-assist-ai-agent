'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { connectionsKeys } from '../queries/connections';

interface InitiateConnectionParams {
  emailProvider: string;
}

interface DeleteConnectionParams {
  connectionId: string;
}

/**
 * Initiate a new email connection
 */
const initiateConnection = async (params: InitiateConnectionParams) => {
  const response = await fetch('/api/connections/initiate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ emailProvider: params.emailProvider }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to initiate connection');
  }

  return data;
};

/**
 * Delete an existing connection
 */
const deleteConnection = async (params: DeleteConnectionParams) => {
  const response = await fetch('/api/connections/delete', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ connectionId: params.connectionId }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to delete connection');
  }

  return response.json();
};

/**
 * Hook to initiate a new email connection
 */
export const useInitiateConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: initiateConnection,
    onSuccess: data => {
      if (data.redirectUrl) {
        window.open(data.redirectUrl, '_blank');
        toast.success('Opening email authorization...', {
          description: 'Complete the authorization to connect your account.',
        });

        // Poll for updates
        const pollInterval = setInterval(() => {
          queryClient.invalidateQueries({
            queryKey: connectionsKeys.list(),
          });
        }, 3000);

        // Stop polling after 5 minutes
        setTimeout(() => clearInterval(pollInterval), 300000);
      }
    },
    onError: error => {
      console.error('Error connecting email:', error);
      toast.error('Failed to connect email account', {
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
    },
  });
};

/**
 * Hook to delete a connection
 */
export const useDeleteConnection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConnection,
    onSuccess: () => {
      toast.success('Connection deleted successfully');
      queryClient.invalidateQueries({
        queryKey: connectionsKeys.list(),
      });
    },
    onError: error => {
      console.error('Error deleting connection:', error);
      toast.error('Failed to delete connection', {
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
    },
  });
};
