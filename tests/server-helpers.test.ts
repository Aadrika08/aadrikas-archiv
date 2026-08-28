import { describe, expect, it } from 'vitest';
import {
  escapeHtml,
  fingerprintIp,
  getClientIp,
  getScatterPosition,
  newVisitorSessionId,
} from '@/lib/server/security';
import { contactInput, guestbookInput } from '@/lib/server/validation';

describe('security helpers', () => {
  it('escapes every HTML-significant character', () => {
    expect(escapeHtml(`<script>alert("x" & 'y')</script>`)).toBe(
      '&lt;script&gt;alert(&quot;x&quot; &amp; &#39;y&#39;)&lt;/script&gt;',
    );
    expect(escapeHtml('plain text')).toBe('plain text');
  });

  it('produces a stable keyed fingerprint that is not the source IP', () => {
    const first = fingerprintIp('203.0.113.10', 'test-secret');
    expect(first).toBe(fingerprintIp('203.0.113.10', 'test-secret'));
    expect(first).not.toBe('203.0.113.10');
    expect(first).not.toBe(fingerprintIp('203.0.113.11', 'test-secret'));
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });

  it('selects the most trusted available client IP header', () => {
    expect(getClientIp(new Request('https://example.test', {
      headers: {
        'cf-connecting-ip': ' 203.0.113.1 ',
        'x-real-ip': '203.0.113.2',
        'x-forwarded-for': '203.0.113.3, 203.0.113.4',
      },
    }))).toBe('203.0.113.1');
    expect(getClientIp(new Request('https://example.test', {
      headers: { 'x-forwarded-for': '203.0.113.3, 203.0.113.4' },
    }))).toBe('203.0.113.3');
    expect(getClientIp(new Request('https://example.test'))).toBe('unknown');
  });

  it('keeps scatter positions inside the intended 10–90% field', () => {
    for (const random of [0, 0.001, 0.5, 0.99999]) {
      const position = getScatterPosition(() => random);
      expect(position.x).toBeGreaterThanOrEqual(10);
      expect(position.x).toBeLessThanOrEqual(90);
      expect(position.y).toBeGreaterThanOrEqual(10);
      expect(position.y).toBeLessThanOrEqual(90);
    }
  });

  it('creates UUID visitor session identifiers', () => {
    expect(newVisitorSessionId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });
});

describe('guestbook validation boundaries', () => {
  const valid = {
    name: ' Ada ',
    message: ' A note ',
    'cf-turnstile-response': 'turnstile-token',
    website: '',
  };

  it('normalizes Turnstile and honeypot aliases and trims text', () => {
    expect(guestbookInput.parse(valid)).toMatchObject({
      name: 'Ada',
      message: 'A note',
      turnstileToken: 'turnstile-token',
      honeypot: '',
    });
  });

  it('accepts values exactly at the documented maximum lengths', () => {
    expect(guestbookInput.parse({
      ...valid,
      name: 'n'.repeat(40),
      message: 'm'.repeat(280),
      turnstileToken: 't'.repeat(2048),
      honeypot: 'h'.repeat(100),
    })).toMatchObject({ name: 'n'.repeat(40), message: 'm'.repeat(280) });
  });

  it.each([
    ['empty name', { ...valid, name: ' ' }],
    ['empty message', { ...valid, message: '' }],
    ['missing token', { ...valid, 'cf-turnstile-response': '' }],
    ['name over 40 chars', { ...valid, name: 'x'.repeat(41) }],
    ['message over 280 chars', { ...valid, message: 'x'.repeat(281) }],
    ['honeypot over 100 chars', { ...valid, website: 'x'.repeat(101) }],
  ])('rejects %s', (_label, input) => {
    expect(() => guestbookInput.parse(input)).toThrow();
  });
});

describe('contact validation boundaries', () => {
  const valid = {
    name: 'Ada',
    email: 'ada@example.test',
    subject: 'Hello',
    message: 'A message',
    turnstileToken: 'turnstile-token',
    honeypot: '',
  };

  it('accepts a valid contact payload and optional subject', () => {
    expect(contactInput.parse({ ...valid, subject: undefined })).toMatchObject({
      name: 'Ada',
      email: 'ada@example.test',
      subject: '',
    });
  });

  it('accepts contact values exactly at the documented maximum lengths', () => {
    expect(contactInput.parse({
      ...valid,
      name: 'n'.repeat(80),
      subject: 's'.repeat(120),
      message: 'm'.repeat(2000),
      turnstileToken: 't'.repeat(2048),
      honeypot: 'h'.repeat(100),
    })).toMatchObject({ name: 'n'.repeat(80), subject: 's'.repeat(120) });
  });

  it.each([
    ['invalid email', { ...valid, email: 'not-an-email' }],
    ['empty message', { ...valid, message: '' }],
    ['name over 80 chars', { ...valid, name: 'x'.repeat(81) }],
    ['subject over 120 chars', { ...valid, subject: 'x'.repeat(121) }],
    ['message over 2000 chars', { ...valid, message: 'x'.repeat(2001) }],
    ['token over 2048 chars', { ...valid, turnstileToken: 'x'.repeat(2049) }],
  ])('rejects %s', (_label, input) => {
    expect(() => contactInput.parse(input)).toThrow();
  });
});
