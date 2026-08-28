/**
 * Server configuration is read at request time so a missing secret never
 * becomes a module-load crash (or gets accidentally bundled for the client).
 */
export type ServerConfig = {
  supabaseUrl: string;
  supabaseServiceRoleKey: string;
  turnstileSecretKey: string;
  rateLimitSecret: string;
  resendApiKey: string | undefined;
  contactToEmail: string | undefined;
  contactFromEmail: string | undefined;
};

export type Configured<T> = { ok: true; value: T } | { ok: false; missing: string[] };

function env(name: keyof ImportMetaEnv): string | undefined {
  // import.meta.env is the Astro-supported path. The process fallback keeps
  // runtime-injected Vercel secrets available when they are not build-time env.
  const runtimeProcess = (globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }).process;
  const value = import.meta.env?.[name] ?? runtimeProcess?.env?.[name];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

export function getServerConfig(options: { contact?: boolean } = {}): Configured<ServerConfig> {
  const values = {
    SUPABASE_URL: env('SUPABASE_URL'),
    SUPABASE_SERVICE_ROLE_KEY: env('SUPABASE_SERVICE_ROLE_KEY'),
    TURNSTILE_SECRET_KEY: env('TURNSTILE_SECRET_KEY'),
    RATE_LIMIT_SECRET: env('RATE_LIMIT_SECRET'),
    RESEND_API_KEY: env('RESEND_API_KEY'),
    CONTACT_TO_EMAIL: env('CONTACT_TO_EMAIL'),
    CONTACT_FROM_EMAIL: env('CONTACT_FROM_EMAIL'),
  };

  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'TURNSTILE_SECRET_KEY', 'RATE_LIMIT_SECRET'];
  if (options.contact) required.push('RESEND_API_KEY', 'CONTACT_TO_EMAIL', 'CONTACT_FROM_EMAIL');

  const missing = required.filter((name) => !values[name as keyof typeof values]);
  if (missing.length) return { ok: false, missing };

  return {
    ok: true,
    value: {
      supabaseUrl: values.SUPABASE_URL as string,
      supabaseServiceRoleKey: values.SUPABASE_SERVICE_ROLE_KEY as string,
      turnstileSecretKey: values.TURNSTILE_SECRET_KEY as string,
      rateLimitSecret: values.RATE_LIMIT_SECRET as string,
      resendApiKey: values.RESEND_API_KEY,
      contactToEmail: values.CONTACT_TO_EMAIL,
      contactFromEmail: values.CONTACT_FROM_EMAIL,
    },
  };
}

export class ConfigurationError extends Error {
  readonly code = 'CONFIGURATION_ERROR';

  constructor(readonly missing: string[]) {
    super('The server is not configured to process this request.');
    this.name = 'ConfigurationError';
  }
}

export function requireServerConfig(options: { contact?: boolean } = {}): ServerConfig {
  const result = getServerConfig(options);
  if (!result.ok) throw new ConfigurationError(result.missing);
  return result.value;
}
