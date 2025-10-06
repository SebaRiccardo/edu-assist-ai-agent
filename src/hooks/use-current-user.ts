'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

/**
 * Hook to get the current authenticated user (client-side)
 */
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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

  return { user, loading, error };
}

/**
 * Hook to get user initials for avatar display
 */
export function useUserInitials() {
  const { user } = useCurrentUser();

  if (!user) return 'U';

  // Try to get initials from user metadata
  const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
  if (fullName) {
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return fullName[0].toUpperCase();
  }

  // Try to get initials from email
  if (user.email) {
    return user.email[0].toUpperCase();
  }

  return 'U';
}

/**
 * Hook to get user display name
 */
export function useUserDisplayName() {
  const { user } = useCurrentUser();

  if (!user) return 'User';

  // Try to get name from user metadata
  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.username;

  if (fullName) return fullName;

  // Fallback to email prefix
  if (user.email) {
    return user.email.split('@')[0];
  }

  return 'User';
}
