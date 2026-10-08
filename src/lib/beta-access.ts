import { SignJWT, jwtVerify } from 'jose';

const COOKIE_NAME = 'beta_access_token';
const BETA_CODE_LENGTH = 6;
const MIN_JWT_SECRET_BYTES = 32;

function getBetaAccessCodes(): string[] {
  return (process.env.BETA_ACCESS_CODES ?? '')
    .split(',')
    .map(code => code.trim())
    .filter(code => new RegExp(`^\\d{${BETA_CODE_LENGTH}}$`).test(code));
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.BETA_ACCESS_SECRET;

  if (!secret || new TextEncoder().encode(secret).byteLength < MIN_JWT_SECRET_BYTES) {
    throw new Error(`BETA_ACCESS_SECRET must be set to at least ${MIN_JWT_SECRET_BYTES} bytes`);
  }

  return new TextEncoder().encode(secret);
}

export interface BetaAccessPayload {
  code: string;
  accessedAt: number;
}

/**
 * Verifies if the provided code is a valid beta access code
 */
export function isValidBetaCode(code: string): boolean {
  if (!new RegExp(`^\\d{${BETA_CODE_LENGTH}}$`).test(code)) {
    return false;
  }

  return getBetaAccessCodes().includes(code);
}

/**
 * Creates a JWT token for beta access
 */
export async function createBetaAccessToken(code: string): Promise<string> {
  const token = await new SignJWT({ code, accessedAt: Date.now() })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d') // Token expires in 30 days
    .sign(getJwtSecret());

  return token;
}

/**
 * Verifies a beta access JWT token
 */
export async function verifyBetaAccessToken(token: string): Promise<BetaAccessPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

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
