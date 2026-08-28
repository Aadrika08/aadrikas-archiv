# Operations notes

This document records the small amount of manual operational work required after the Astro app is deployed.

## First deployment checklist

1. Create the Supabase project and apply the migration in `supabase/migrations/20260811000000_create_guestbook_and_analytics.sql`.
2. Create Turnstile widgets for `localhost` and the final production hostname.
3. Verify the Resend sending domain and choose the recipient mailbox.
4. Add the variables in `.env.example` to Vercel; keep service-role, Turnstile secret, Resend, and rate-limit values server-only.
5. Configure the Vercel custom domain, then set `PUBLIC_SITE_URL` and the site metadata URL to the final HTTPS origin.
6. Submit one guestbook and one contact test, then approve the guestbook row manually.

## Guestbook review

The public form does not publish immediately. Every row starts as `pending`, and the application reads only rows whose status is `approved`. Review and update rows from Supabase SQL or a protected internal process. The migration permits the service role to read/insert guestbook rows; it intentionally creates no anonymous policies. Keep the Supabase dashboard/operator access separate from deployment secrets.

## Privacy and incident response

The app sets `mota-visitor-session` as an HTTP-only, SameSite cookie to avoid counting the same browser session repeatedly. Rate limiting derives a SHA-256 HMAC from the client address and `RATE_LIMIT_SECRET`; raw addresses are not persisted, and buckets older than 48 hours are cleaned during rate-limit calls. Rotate `RATE_LIMIT_SECRET` if it is exposed (existing fingerprints will simply stop matching). Rotate Supabase and Resend credentials through their providers and redeploy Vercel if any server secret leaks.

## Content release

Content changes are file changes, not database records. Validate frontmatter with `npm run check`, build with `npm run build`, and review the generated canonical URLs after changing `PUBLIC_SITE_URL`. Draft entries remain available to the content loader but are excluded by the page queries; mark `draft: false` only when ready to publish.

## Reference artifact

`reference/portfolio.html` is a design-only bundled HTML reference. It is useful for visual comparison but is not loaded by Astro and should not be edited as an implementation route.
