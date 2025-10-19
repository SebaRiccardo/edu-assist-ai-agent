'use server';

import { cookies } from 'next/headers';
import { isValidBetaCode, createBetaAccessToken, getBetaAccessCookieName } from '@/lib/beta-access';

export interface VerifyBetaCodeResult {
  success: boolean;
  message: string;
}

/**
 * Server action to verify beta access code and set cookie
 */
export async function verifyBetaCode(code: string): Promise<VerifyBetaCodeResult> {
  try {
    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return {
        success: false,
        message: 'Code must be 6 digits',
      };
    }

    // Check if code is valid
    if (!isValidBetaCode(code)) {
      return {
        success: false,
        message: 'Invalid beta access code',
      };
    }

    // Create JWT token
    const token = await createBetaAccessToken(code);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set(getBetaAccessCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return {
      success: true,
      message: 'Access granted',
    };
  } catch (error) {
    console.error('Beta code verification error:', error);
    return {
      success: false,
      message: 'An error occurred. Please try again.',
    };
  }
}
