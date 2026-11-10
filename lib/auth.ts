export const AUTH_COOKIE_NAME = 'agentic_session';

/**
 * Returns the configured access password.
 * Defaults to 'agentic-2026' if not explicitly configured in .env.local,
 * ensuring out-of-the-box protection without crashing.
 */
export function getAppPassword(): string {
  return process.env.APP_PASSWORD || process.env.ADMIN_PASSWORD || 'agentic-2026';
}

/**
 * Generates an HMAC-SHA256 signature for the session cookie using Web Crypto
 */
async function getSecretKey(): Promise<CryptoKey> {
  const secret = process.env.AUTH_SECRET || getAppPassword() + '_secret_salt_2026';
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Creates a signed session token: payload.signature
 */
export async function createSessionToken(): Promise<string> {
  const payload = JSON.stringify({
    authenticated: true,
    issuedAt: Date.now(),
  });
  const encoder = new TextEncoder();
  const key = await getSecretKey();
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const signatureBase64 = Buffer.from(signatureBuffer).toString('base64url');
  const payloadBase64 = Buffer.from(payload).toString('base64url');

  return `${payloadBase64}.${signatureBase64}`;
}

/**
 * Verifies a signed session token
 */
export async function verifySessionToken(token?: string | null): Promise<boolean> {
  if (!token) return false;
  try {
    const [payloadBase64, signatureBase64] = token.split('.');
    if (!payloadBase64 || !signatureBase64) return false;

    const payload = Buffer.from(payloadBase64, 'base64url').toString('utf8');
    const signature = Buffer.from(signatureBase64, 'base64url');

    const key = await getSecretKey();
    const encoder = new TextEncoder();
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      encoder.encode(payload)
    );

    if (!isValid) return false;

    const data = JSON.parse(payload);
    // Token valid for 30 days
    const isExpired = Date.now() - data.issuedAt > 30 * 24 * 60 * 60 * 1000;
    return !isExpired;
  } catch (err) {
    return false;
  }
}

