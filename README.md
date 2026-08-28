# Aadrika’s Archive

An Astro 7 server-rendered portfolio for research, projects, writing, reading, a moderated guestbook, and contact. The production adapter is Vercel; Supabase stores guestbook/counter data and Resend delivers contact messages.

## Requirements

- Node.js 24 (npm is included with Node)
- A Supabase project for the guestbook and visitor counter
- Cloudflare Turnstile keys for the form protections
- A Resend account and verified sending domain if contact delivery is enabled

## Local development

```sh
cp .env.example .env
npm install
npm run dev
```

The site is available at `http://localhost:4321`. Run the checks used by CI/deploys with:

```sh
npm run check       # Astro/TypeScript checks
npm test            # Vitest
npm run build       # check + production build
npm run preview     # serve the built output locally
npm run test:e2e    # Playwright (requires its browser setup)
npm run test:all    # unit tests, build, and e2e tests
```

The server routes remain usable for content-only previews without Supabase, but guestbook, visitor count, and forms need the server variables below.

## Environment variables

Copy `.env.example` to `.env` locally. `PUBLIC_` values are safe for the browser; all other values are server-only and must never be committed or exposed to client code.

| Variable | Purpose |
| --- | --- |
| `PUBLIC_SITE_URL` | Canonical HTTPS site URL (also used by sitemap, RSS, and robots). |
| `PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key rendered in guestbook/contact forms. |
| `SUPABASE_URL` | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase service-role key. Keep secret. |
| `TURNSTILE_SECRET_KEY` | Server-only key used to verify Turnstile tokens. |
| `RATE_LIMIT_SECRET` | Long random secret used to HMAC IP fingerprints. |
| `RESEND_API_KEY` | Server-only Resend API key. |
| `CONTACT_TO_EMAIL` | Recipient for contact form messages. |
| `CONTACT_FROM_EMAIL` | From address accepted by Resend (use the verified domain). |

The contact action requires the three Resend variables; guestbook and visitor actions require Supabase, Turnstile, and `RATE_LIMIT_SECRET`.

## Content editing

Projects live in `src/content/projects/*.md`; writing lives in `src/content/writing/*.md` or `.mdx`. Each file has validated frontmatter. Project fields are `title`, URL-safe `slug`, `period`, numeric `order`, `summary`, and optional `featured`/`draft`. Writing additionally requires `year`, `kind` (`ESSAY`, `NOTE`, `FIELD NOTE`, `TALK`, or `LIST`), and `status` (`published` or `unfinished`). Keep slugs unique and run `npm run check` after edits.

Shared portfolio copy and links are in `src/data/` (`site.ts`, `about.ts`, `reading.ts`, `resume.ts`). Update the real site URL and supplied social/profile links there when they become available; do not leave example links in a public deployment.

## Supabase and moderation

Run `supabase/migrations/20260811000000_create_guestbook_and_analytics.sql` once in the Supabase SQL editor or through your migration workflow. It creates the guestbook, visitor counter, and short-lived rate-limit buckets, enables/forces RLS, and grants access only to the service role. The application intentionally has no anon Data API policies.

Guestbook submissions are inserted as `pending`; only approved rows are rendered. There is no admin UI in this repository, so review in Supabase (with an appropriately privileged operator account):

```sql
select id, name, message, created_at
from public.guestbook_entries
where status = 'pending'
order by created_at asc;

update public.guestbook_entries
set status = 'approved'
where id = 'REPLACE_WITH_UUID';
```

Use `rejected` for submissions that should not appear. Never grant the service-role key to a browser or commit it.

## Turnstile

Create a Cloudflare Turnstile widget and add `localhost` (and/or `127.0.0.1`) to its allowed hostnames for local development. Put its site key in `PUBLIC_TURNSTILE_SITE_KEY` and secret in `TURNSTILE_SECRET_KEY`. Create a production widget restricted to the final custom domain (for example `www.example.com`), or explicitly include every hostname that serves the app, then set the matching keys in the deployment environment. The server verifies tokens with Cloudflare and also applies per-hour HMAC-fingerprinted limits (5 guestbook submissions and 3 contact submissions per fingerprint).

## Resend

Verify the sending domain in Resend (DNS SPF/DKIM records), then set `CONTACT_FROM_EMAIL` to an address on that verified domain. Set `CONTACT_TO_EMAIL` to the mailbox that should receive messages. Do not use the `.env.example` `onboarding@example.com` value in production; it is only a placeholder.

## Vercel deployment and domain

Import the repository into Vercel. The `@astrojs/vercel` adapter and server output are already configured; use Node 24 in the project settings, install with `npm install`, and deploy the standard build command `npm run build`. Add all variables from the table above in the relevant Preview/Production environments (use separate Turnstile keys where appropriate), then redeploy after changing secrets. Add the custom domain in Vercel and configure its DNS as instructed by Vercel. Update `PUBLIC_SITE_URL`, `src/data/site.ts`, and the Turnstile allowed hostname to the final URL.

## Security and privacy

Supabase service-role access is server-only and RLS is forced on the data tables. Turnstile, honeypots, input validation, output escaping, and rate limits protect the public actions. The visitor counter uses a secure, HTTP-only session cookie; the database stores only a keyed HMAC fingerprint for hourly rate-limit buckets, not a raw IP address, and old buckets are removed after 48 hours. Contact submissions are sent through Resend to `CONTACT_TO_EMAIL`; review Resend/Supabase retention and your applicable privacy notice before launch.

## Known placeholders and reference artifact

`example.com` remains the default in `.env.example`, `astro.config.mjs`, and `src/data/site.ts`; replace it before launch. GitHub and Scholar links are intentionally marked “link forthcoming” because the reference did not provide profile URLs. `reference/portfolio.html` is a bundled design/reference artifact only—it is not the Astro runtime, source of truth, or deployment entry point.

