# Affiliate program production readiness

This runbook covers deployment and controlled launch of the V1 affiliate program. It does not authorize automated payouts or changes to commission, attribution, or maturity rules.

## Source and migration

Deploy branch `codex/affilationprogram` only after normal review. It is based on production `main` commit `a5c689b` and contains the four implementation commits listed in the Phase 5 brief. Do not merge or push as part of this runbook.

Apply [`supabase/affiliate_program.sql`](../supabase/affiliate_program.sql) through the Supabase SQL editor or the team’s reviewed migration process, using the production project selected explicitly. Take a database backup first. The script contains no table/data drops; the only `drop` recreates the normalization trigger. It preserves existing `store_orders` and affiliate rows, enables RLS, exposes no public policies, and restricts security-definer RPCs to `service_role`.

The complete script is rerunnable for the schema it creates: tables, columns, indexes, extension, trigger removal, RLS, functions, revokes, and grants are repeat-safe. Important limitation: `create table if not exists` does not repair a manually created or divergent table. On a database with partial/manual affiliate schema changes, compare `information_schema.columns`, constraints, and function signatures before running it. Apply to Preview/staging first, then production. After execution, verify all `affiliate_%` tables, foreign keys, indexes, RLS flags, and RPC grants.

## Environment matrix

| Variable | Classification | Production | Preview | Development |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | required, client-visible | `https://talentiques.com` | preview origin | `http://localhost:3000` |
| `SUPABASE_URL` | required, server-only | production project | separate preview project recommended | local/test project |
| `SUPABASE_SERVICE_ROLE_KEY` | critical, server-only | required | preview key only | local/test key only |
| `RESEND_API_KEY` | required for email, server-only | production key | test/restricted key | test key or absent for static QA |
| `RESEND_FROM_EMAIL` | required for email, server-only | verified Talentiques sender | verified test sender | test sender |
| `AFFILIATE_ADMIN_EMAIL` | required, server-only | controlled admin mailbox | controlled test mailbox | developer/test mailbox |
| `AFFILIATE_ADMIN_SECRET` | legacy, critical, server-only | required only while legacy status API is retained | separate value if used | separate local value |
| `AFFILIATE_SESSION_SECRET` | required, critical, server-only | unique production value | unique preview value | unique local value |

Never give the three critical secrets a `NEXT_PUBLIC_` prefix. Do not reuse production database, admin, or session secrets in Preview. Generate `AFFILIATE_SESSION_SECRET` with at least 32 random bytes, for example `openssl rand -base64 48`, and store the output only in the deployment secret manager. Rotating it invalidates outstanding magic links and sessions, so schedule rotations deliberately.

The HMAC requirement also invalidates any magic links or sessions created by an older build before `AFFILIATE_SESSION_SECRET` was configured. For launch, configure the secret before deploying the Phase 5 build and expect affected users to request a new link; no affiliate or financial records are lost.

In Vercel, add each variable under Project Settings → Environment Variables with the scopes shown above. Confirm Production has the production values, Preview has isolated safe credentials where available, and Development contains no production financial/admin credentials. Redeploy after changes.

## Canonical routes and email

Canonical production origin is `https://talentiques.com`. Public routes are `/affiliation`, `/affiliation/conditions`, `/en/affiliate`, and `/en/affiliate/terms`. Affiliate login/dashboard routes and every `/admin/affiliates` route are private and `noindex`. Only the four public routes belong in the sitemap.

Application confirmation, administrator notification, approval, rejection, affiliate/admin login, and successful-payout emails use the configured Resend sender. Login links are generated from `NEXT_PUBLIC_APP_URL`; production must therefore use the canonical origin. Approval referral links are explicitly canonical. Never log raw email-login URLs or tokens. Verify the sender domain and FR/EN rendering with controlled mailboxes before launch.

## Controlled smoke test

Until each step runs against the deployed environment, record it as `PENDING LIVE VERIFICATION`.

1. Submit one Talentiques-controlled application; verify pending row, unique code, applicant confirmation, administrator notice, and no active attribution.
2. Request an administrator link; verify receipt, 15-minute one-use behavior, dashboard access, and applicant visibility. Approve the applicant and verify `active`, `approved_at`, `0.5000`, and both canonical referral links.
3. Request the affiliate link; verify generic response, one-use URL, dashboard redirect, logout revocation, and inability to reuse the old URL.
4. In a clean browser visit `/en/tools?ref=TESTCODE`; verify click storage, distinct 30-day cookies, persistence across Store pages, last-valid-click behavior, and invalid references not clearing valid attribution.
5. Verify referral state changes neither products, prices, currency, checkout UX, nor PayPal amount. Perform a real purchase only with explicit owner approval. Never mark it passed without a completed payment.
6. With isolated fixture data, verify maturity, self-referral suppression, payout-ready calculation, draft/review/CSV/approval, paid and failed transitions, audit entries, payout history, and replay-safe refund adjustments. Do not send money.
7. Review public, login, dashboard, and administrator pages at 375, 390, 430, 768, 1024, and 1440 px. Check navigation, forms, tables, horizontal page overflow, and browser console.

## Monthly operating procedure

1. Review new affiliates.
2. Review transparent risk signals; never treat a heuristic as an accusation or automatic cancellation.
3. Review mature available commissions and adjustments.
4. Create one currency-specific payout batch.
5. Review and export the payout list.
6. Send payments manually outside Talentiques.
7. Mark successful items paid and failed items failed.
8. Confirm failed reservations became eligible again.
9. Review adjustments and audit events.
10. Confirm affiliate payout histories.

## Retention and observability

Schedule the conservative token/session cleanup SQL documented in [`affiliate-auth.md`](./affiliate-auth.md). Never automatically delete commissions, payouts, adjustments, or audit logs.

Monitor counts and sanitized errors for application failures, magic-link delivery/consumption failures, commission creation failures, and payout transition failures. Logs may include internal event IDs and status categories, but not raw tokens, login URLs, secrets, buyer email, PayPal credentials, or payment payloads. Existing platform logs are sufficient for launch; no new monitoring dependency is required.

## Final launch gate

- DATABASE — migration backed up, applied, and schema/grants verified.
- ENV — production variables present; Preview isolated; canonical URL exact.
- DEPLOY — reviewed commit deployed; production routes return expected status.
- EMAIL — sender verified; all controlled emails received and links canonical.
- ADMIN LOGIN — one-use link and logout verified.
- AFFILIATE LOGIN — one-use link, session, dashboard, and logout verified.
- REFERRAL — valid, invalid, last-click, persistence, and cookies verified.
- PAYMENT — checkout unchanged; real payment either explicitly tested or recorded as not performed.
- COMMISSION — creation, self-referral suppression, maturity, and refund behavior verified.
- PAYOUT — fixture batch, CSV, paid/failed recovery, adjustment, and audit verified without money movement.
- MOBILE — required widths and pages verified with no blocking overflow.
- SECURITY — secrets server-only, RLS/grants verified, private routes noindex, no customer PII exposed.

Launch only when every non-live item is `PASS` and the owner accepts or completes every remaining live-verification item.
