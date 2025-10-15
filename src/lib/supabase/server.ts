import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from './types';
import { TypedSupabaseClient } from './types/client.types';

/**
 * If using Fluid compute: Don't put this client in a global variable. Always create a new client within each
 * function when using it.
 */
export async function createClient(): Promise<TypedSupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Get the current authenticated user (server-side)
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(supabase?: TypedSupabaseClient) {
  const client = supabase ? supabase : await createClient();

  try {
    const {
      data: { user },
      error,
    } = await client.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get the current user's session (server-side)
 */
export async function getCurrentSession() {
  const supabase = await createClient();

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
}

/**
 * Get the current user's claims (server-side)
 */
export async function getCurrentClaims(supabase?: TypedSupabaseClient) {
  const client = supabase ? supabase : await createClient();

  try {
    const { data, error } = await client.auth.getClaims();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

export async function isAdminUser(
  client: TypedSupabaseClient
): Promise<boolean> {
  const jwt = await getCurrentClaims(client);

  return !!jwt?.claims.app_metadata.admin;
}
