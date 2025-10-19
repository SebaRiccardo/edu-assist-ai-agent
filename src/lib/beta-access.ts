import { SignJWT, jwtVerify } from 'jose';

// List of valid beta access codes
export const VALID_BETA_CODES = ['789012', '345678', '901234', '567890', '246813'];

const JWT_SECRET = new TextEncoder().encode(process.env.BETA_ACCESS_SECRET || 'your-secret-key-change-this-in-production');

const COOKIE_NAME = 'beta_access_token';

export interface BetaAccessPayload {
  code: string;
  accessedAt: number;
}

/**
 * Verifies if the provided code is a valid beta access code
 */
export function isValidBetaCode(code: string): boolean {
  return VALID_BETA_CODES.includes(code);
}

/**
 * Creates a JWT token for beta access
 */
export async function createBetaAccessToken(code: string): Promise<string> {
  const token = await new SignJWT({ code, accessedAt: Date.now() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d') // Token expires in 30 days
    .sign(JWT_SECRET);

  return token;
}

/**
 * Verifies a beta access JWT token
 */
export async function verifyBetaAccessToken(token: string): Promise<BetaAccessPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (payload && typeof payload.code === 'string' && typeof payload.accessedAt === 'number') {
      return {
        code: payload.code,
        accessedAt: payload.accessedAt,
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Gets the beta access cookie name
 */
export function getBetaAccessCookieName(): string {
  return COOKIE_NAME;
}
