'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

/**
 * Hook to get the current authenticated user (client-side)
 */
export function useCurrentUser(user?: User | null) {
  const [_user, setUser] = useState<User | null | undefined>(user);
  const [loading, setLoading] = useState(!user);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          setError(error.message);
          setUser(null);
        } else {
          setUser(user);
          setError(null);
        }
      } catch (err) {
        setError('Failed to get user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user: _user, loading, error };
}

/**
 * Hook to get user initials for avatar display
 */
export function useUserInitials(user?: User | null) {
  const { user: _user } = useCurrentUser(user);

  if (!_user) return 'U';

  // Try to get initials from user metadata
  const fullName = _user.user_metadata?.full_name || _user.user_metadata?.name;
  if (fullName) {
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return fullName[0].toUpperCase();
  }

  // Try to get initials from email
  if (_user.email) {
    return _user.email[0].toUpperCase();
  }

  return 'U';
}

/**
 * Hook to get user display name
 */
export function useUserDisplayName(user?: User | null) {
  const { user: _user } = useCurrentUser(user);

  if (!_user) return 'User';

  // Try to get name from user metadata
  const fullName = _user.user_metadata.first_name;
  if (fullName) return fullName;

  // Fallback to email prefix
  if (_user.email) {
    return _user.email.split('@')[0];
  }

  return '';
}
