import { z } from 'astro/zod';

const turnstileToken = z.string().trim().min(1).max(2048);
const optionalText = (max: number) => z.preprocess((value) => value ?? '', z.string().trim().max(max));
const honeypot = optionalText(100);

/** Accept both the explicit client field and Turnstile's default form field. */
const normalizeSecurityFields = (raw: unknown) => {
  if (!raw || typeof raw !== 'object') return raw;
  const value = raw as Record<string, unknown>;
  return {
    ...value,
    turnstileToken: value.turnstileToken ?? value['cf-turnstile-response'],
    honeypot: value.honeypot ?? value.website ?? '',
  };
};

export const guestbookInput = z.preprocess(
  normalizeSecurityFields,
  z.object({
    name: z.string().trim().min(1).max(40),
    message: z.string().trim().min(1).max(280),
    turnstileToken,
    honeypot,
  }),
);

export const contactInput = z.preprocess(
  normalizeSecurityFields,
  z.object({
    name: z.string().trim().min(1).max(80),
    email: z.string().trim().pipe(z.email()),
    subject: optionalText(120),
    message: z.string().trim().min(1).max(2000),
    turnstileToken,
    honeypot,
  }),
);

export const visitorInput = z.object({}).optional();

export type GuestbookInput = z.infer<typeof guestbookInput>;
export type ContactInput = z.infer<typeof contactInput>;
