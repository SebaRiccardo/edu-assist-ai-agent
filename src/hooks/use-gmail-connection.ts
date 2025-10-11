'use client';

import { useState, useRef, useEffect } from 'react';
import { ComposioConnectedAccount } from '@/app/api/connections/route';
import { createInbox } from './use-inboxes';
import { on } from 'events';

type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'checking'
  | 'active'
  | 'failed'
  | 'expired';

interface UseGmailConnectionProps {
  courseId: string;
  onSuccess?: () => void;
  onConnectionSuccess?: (account: ComposioConnectedAccount) => void;
}

export function useGmailConnection({
  courseId,
  onSuccess,
  onConnectionSuccess,
}: UseGmailConnectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>('idle');
  const [pendingConnectionId, setPendingConnectionId] = useState<string | null>(
    null
  );
  const [addingAccountId, setAddingAccountId] = useState<string | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

  const checkConnectionStatus = async (connectionId: string) => {
    setConnectionStatus('checking');

    try {
      const response = await fetch(
        `/api/connections/status?connectionId=${connectionId}`,
        { method: 'GET' }
      );

      const data = await response.json();

      if (data.status === 'ACTIVE') {
        setConnectionStatus('active');
        setPendingConnectionId(null);
        onConnectionSuccess?.(data.account);
      } else if (data.status === 'INITIATED') {
        // Poll again after 3 seconds
        pollingTimeoutRef.current = setTimeout(() => {
          checkConnectionStatus(connectionId);
        }, 3000);
      } else {
        setConnectionStatus('failed');
      }
    } catch (error) {
      console.error('Failed to check connection status:', error);
      setConnectionStatus('failed');
    }
  };

  const initiateConnection = async () => {
    setConnectionStatus('connecting');

    try {
      const response = await fetch('/api/connections/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate connection');
      }

      const data: { id: string; redirectUrl: string; status: string } =
        await response.json();

      if (data.redirectUrl && data.id) {
        setPendingConnectionId(data.id);

        // Open auth window
        const width = 600;
        const height = 700;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const authWindow = window.open(
          data.redirectUrl,
          'Gmail Authorization',
          `width=${width},height=${height},left=${left},top=${top}`
        );

        if (!authWindow) {
          throw new Error('Popup blocked');
        }

        // Start polling for status
        setTimeout(() => checkConnectionStatus(data.id), 2000);
      }
    } catch (error) {
      console.error('Error initiating Gmail auth:', error);
      setConnectionStatus('failed');
    } finally {
      setIsDialogOpen(false);
    }
  };

  const addAccountToCourse = async (account: ComposioConnectedAccount) => {
    setAddingAccountId(account.id);

    try {
      // API call to add inbox
      await createInbox({
        courseId: courseId,
        email: account.email,
        composioConnectionId: account.id,
      });
      onSuccess?.();
    } catch (error) {
      console.error('Error adding account:', error);
    } finally {
      setAddingAccountId(null);
    }
  };

  const cancelConnection = () => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
    }
    setConnectionStatus('idle');
    setPendingConnectionId(null);
    setIsDialogOpen(false);
  };

  const retryConnection = () => {
    setConnectionStatus('idle');
    setIsDialogOpen(true);
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    connectionStatus,
    addingAccountId,
    initiateConnection,
    addAccountToCourse,
    cancelConnection,
    retryConnection,
  };
}
