import { ActionError, defineAction } from 'astro:actions';
import { Resend } from 'resend';
import { ConfigurationError, requireServerConfig } from '../lib/server/config';
import { escapeHtml, fingerprintIp, getClientIp, getScatterPosition, newVisitorSessionId, verifyTurnstile } from '../lib/server/security';
import { getSupabaseAdmin } from '../lib/server/supabase';
import { contactInput, guestbookInput, visitorInput } from '../lib/server/validation';

const RATE_LIMITS = { guestbook: 5, contact: 3 } as const;
const VISITOR_COOKIE = 'mota-visitor-session';

function fail(code: string, message: string): never {
  // Astro documents standard HTTP codes, but preserving this stable application
  // code lets the UI distinguish a missing deployment secret from a bad input.
  throw new ActionError({ code: code as never, message });
}

function configurationFailure(error: unknown): never {
  if (error instanceof ConfigurationError) {
    return fail('INTERNAL_SERVER_ERROR', 'This form is temporarily unavailable.');
  }
  return fail('INTERNAL_SERVER_ERROR', 'Something went wrong. Please try again.');
}

async function protectSubmission(
  request: Request,
  token: string,
  honeypotValue: string,
  action: keyof typeof RATE_LIMITS,
  secret: string,
  turnstileSecret: string,
) {
  if (honeypotValue.trim()) fail('BAD_REQUEST', 'Unable to process this submission.');
  if (!(await verifyTurnstile(token, turnstileSecret))) {
    fail('BAD_REQUEST', 'Please complete the verification challenge and try again.');
  }

  const fingerprint = fingerprintIp(getClientIp(request), secret);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.rpc('consume_submission_rate_limit', {
    p_action: action,
    p_fingerprint: fingerprint,
    p_max_count: RATE_LIMITS[action],
  });
  if (error) throw error;
  if (data !== true) fail('TOO_MANY_REQUESTS', 'Please wait before sending another message.');
}

export const server = {
  guestbook: {
    submit: defineAction({
      accept: 'form',
      input: guestbookInput,
      async handler(input, context) {
        let config;
        try {
          config = requireServerConfig();
          await protectSubmission(
            context.request,
            input.turnstileToken,
            input.honeypot,
            'guestbook',
            config.rateLimitSecret,
            config.turnstileSecretKey,
          );
          const { x, y } = getScatterPosition();
          const { error } = await getSupabaseAdmin().from('guestbook_entries').insert({
            name: input.name,
            message: input.message,
            x,
            y,
            status: 'pending',
          });
          if (error) throw error;
          return { submitted: true };
        } catch (error) {
          if (error instanceof ActionError) throw error;
          configurationFailure(error);
        }
      },
    }),
  },
  contact: {
    send: defineAction({
      accept: 'form',
      input: contactInput,
      async handler(input, context) {
        try {
          const config = requireServerConfig({ contact: true });
          await protectSubmission(
            context.request,
            input.turnstileToken,
            input.honeypot,
            'contact',
            config.rateLimitSecret,
            config.turnstileSecretKey,
          );
          const resend = new Resend(config.resendApiKey as string);
          const subject = (input.subject || `Portfolio contact from ${input.name}`).replace(/[\r\n]/g, ' ');
          const { error } = await resend.emails.send({
            from: config.contactFromEmail as string,
            to: [config.contactToEmail as string],
            replyTo: input.email,
            subject,
            text: `Name: ${input.name}\nEmail: ${input.email}\n\n${input.message}`,
            html: `<p><strong>Name:</strong> ${escapeHtml(input.name)}</p><p><strong>Email:</strong> ${escapeHtml(input.email)}</p><p>${escapeHtml(input.message).replace(/\n/g, '<br>')}</p>`,
          });
          if (error) throw error;
          return { sent: true };
        } catch (error) {
          if (error instanceof ActionError) throw error;
          configurationFailure(error);
        }
      },
    }),
  },
  visitor: {
    record: defineAction({
      input: visitorInput,
      async handler(_input, context) {
        try {
          requireServerConfig();
          if (context.cookies.has(VISITOR_COOKIE)) {
            const { data, error } = await getSupabaseAdmin()
              .from('site_counters')
              .select('value')
              .eq('counter_name', 'visitors')
              .single();
            if (error) throw error;
            return { counted: false, count: Number(data.value) };
          }

          const { data, error } = await getSupabaseAdmin().rpc('increment_site_counter', {
            p_counter_name: 'visitors',
          });
          if (error) throw error;
          context.cookies.set(VISITOR_COOKIE, newVisitorSessionId(), {
            httpOnly: true,
            sameSite: 'lax',
            secure: new URL(context.request.url).protocol === 'https:',
            path: '/',
          });
          return { counted: true, count: Number(data) };
        } catch (error) {
          if (error instanceof ActionError) throw error;
          configurationFailure(error);
        }
      },
    }),
  },
};
