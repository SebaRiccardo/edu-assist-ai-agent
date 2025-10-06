import { createClient } from '@/lib/supabase/client';

export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  error?: string;
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(data: SignUpData): Promise<AuthResponse> {
  try {
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          displayName: data.displayName,
        },
      },
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Sign in an existing user with email and password
 */
export async function signIn(data: SignInData): Promise<AuthResponse> {
  try {
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResponse> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<AuthResponse> {
  try {
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
