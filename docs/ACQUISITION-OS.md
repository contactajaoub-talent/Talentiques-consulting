# Talentiques Acquisition OS

## Purpose

Acquisition OS is the internal prospecting CRM for Talentiques. It is separate from the affiliate administration area.

- Acquisition OS route: `/acquisition`
- Affiliate administration route: `/admin/affiliates`
- Both routes may reuse the same secure administrator session, but their UI, data model and workflows are separate.

## Architecture

- Next.js App Router
- Supabase PostgreSQL
- Dedicated PostgreSQL schema: `acquisition`
- Server-only access with `SUPABASE_SERVICE_ROLE_KEY`
- Admin session required for all Acquisition UI and API routes
- No CRM persistence in `localStorage`

## Required environment variables

Existing server configuration is reused:

- `SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AFFILIATE_ADMIN_EMAIL`
- `AFFILIATE_SESSION_SECRET`

The service-role key must never be exposed to client components.

## Supabase installation order

Do not use the Acquisition UI between these two SQL steps.

1. Run `supabase/acquisition_os.sql`
2. Run `supabase/migrations/acquisition_phase_2a.sql`

Do **not** run `supabase/acquisition_demo_seed.sql` in production unless demo records are explicitly wanted.

After the SQL scripts are applied, add `acquisition` to the Supabase API/PostgREST exposed schemas. The schema remains protected because `anon` and `authenticated` have no table privileges and the application accesses it server-side with `service_role`.

## Phase 2A persistence

Supabase is the source of truth for:

- prospects
- companies
- contact methods
- campaigns
- activities
- tasks and next actions
- templates
- tags
- offers, orders and payments
- consent records

Prospect reads are paged internally so the CRM is not limited to the first 500 rows.

## Duplicate handling

Duplicate detection checks Supabase directly instead of relying on the currently loaded UI list.

Identity checks:

- normalized LinkedIn URL
- normalized email
- normalized phone

Creation supports warning, create-anyway and merge flows. Merge preserves existing non-empty data, fills missing information, unions tags, keeps the highest verification level and avoids destructive replacement of good contact information.

Updates to LinkedIn, email or phone also run duplicate detection and reject a conflicting identity.

## Contact updates

Email, phone and WhatsApp are synchronized by contact type. Existing contact records are updated in place when possible instead of deleting every contact method and recreating it. This preserves record identity and future metadata such as consent status.

## CSV

Import supports mapped prospect fields and reports imported, duplicate, skipped and error rows.

Export includes the campaign linked by `campaignId`, not a substituted market label.

## Security

- `/acquisition` requires the private administrator session.
- `/api/acquisition` and `/api/acquisition/export` also verify the administrator session.
- `SUPABASE_SERVICE_ROLE_KEY` is imported only from server-only modules.
- Acquisition tables have RLS enabled.
- No `anon` or `authenticated` policies are created for the Acquisition schema.

## Validation before production

Run:

```powershell
npx.cmd tsc --noEmit
npm.cmd test
npm.cmd run build
```

Also run `git diff --check` before committing.

## Production smoke test

Start with one real test prospect and verify:

1. create prospect
2. save email and phone
3. assign campaign
4. create next action
5. move pipeline status
6. add note
7. trigger duplicate detection
8. export CSV
9. archive prospect

Only after this smoke test should bulk imports or external integrations be enabled.

## Phase 2B order

Recommended integration sequence:

1. Gmail
2. PayPal
3. OpenAI
4. Apollo selective enrichment
5. WhatsApp

LinkedIn outreach remains semi-manual; Acquisition OS can prepare and track the workflow without automated scraping or automated direct-message sending.
