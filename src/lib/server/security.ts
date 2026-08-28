import { createHmac, randomUUID } from 'node:crypto';

export const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

type TurnstileResult = {
  success?: boolean;
  hostname?: string;
  'error-codes'?: string[];
};

/** Verify Turnstile on the server. The token is deliberately never logged. */
export async function verifyTurnstile(token: string, secret: string): Promise<boolean> {
  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ secret, response: token }),
    });
    if (!response.ok) return false;
    const result = (await response.json()) as TurnstileResult;
    return result.success === true;
  } catch {
    return false;
  }
}

/**
 * The address is used only in memory to derive a keyed, non-reversible value.
 * Callers must persist the returned fingerprint, never the address itself.
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip')?.trim() ||
    request.headers.get('x-real-ip')?.trim() ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

export function fingerprintIp(ip: string, secret: string): string {
  return createHmac('sha256', secret).update(ip, 'utf8').digest('hex');
}

export function newVisitorSessionId(): string {
  return randomUUID();
}

export function getScatterPosition(random = Math.random): { x: number; y: number } {
  const bounded = (value: number) => Math.round((10 + value * 80) * 100) / 100;
  return { x: bounded(random()), y: bounded(random()) };
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character] ?? character;
  });
}
