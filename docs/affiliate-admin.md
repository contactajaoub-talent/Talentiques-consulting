# Affiliate administration

The private back office is available at `/admin/affiliates`. It is deliberately separate from the public affiliate portal and is excluded from search indexing.

## Access and environment

Set these server-only variables in every deployment environment:

- `AFFILIATE_ADMIN_EMAIL`: the single email address allowed to request an administrator link.
- `AFFILIATE_SESSION_SECRET`: a long random value used to hash administrator sessions.
- `SUPABASE_SERVICE_ROLE_KEY`: service-role access used only by server routes.
- `SUPABASE_URL` (or the existing `NEXT_PUBLIC_SUPABASE_URL`).
- `RESEND_API_KEY` and `RESEND_FROM_EMAIL` for login, approval, rejection, and payout notices.

Apply `supabase/affiliate_program.sql` before enabling the UI. An administrator requests a one-use link at `/admin/affiliates/login`. The link expires after 15 minutes; the resulting HttpOnly, SameSite=Lax session expires after 30 days. Requests for any other email receive the same generic browser response and no access.

`AFFILIATE_ADMIN_SECRET` remains supported only for trusted server-to-server calls to the legacy status endpoint. Never expose either secret through a `NEXT_PUBLIC_` variable or a browser URL.

## Daily workflow

1. Review pending applications oldest first. Approve, reject, suspend, or reactivate from the application or affiliate record. Destructive/status actions require explicit confirmation and are written to the audit log.
2. Review commissions by lifecycle state. Mature pending commissions are released server-side after the 30-day hold; refunded or disputed paid orders create a debit adjustment instead of rewriting payout history.
3. On the payout screen, select eligible affiliates for one currency and create a draft batch. Eligibility and totals are recalculated inside the database transaction; balances under 20 EUR/USD are excluded.
4. Review and approve the draft. Record each item as paid or failed. Paid items create an immutable payout record, mark reserved commissions paid, apply reserved adjustments, and send the affiliate a confirmation email. Failed or cancelled items release their reservations.
5. Export the reviewed batch CSV when needed for manual payment operations. The export contains payout-only fields and is protected by the administrator session.

There is no automated PayPal, bank, or other payout API. Money movement remains a manual administrative operation.

## Safety and recovery

- Currency totals are never combined; EUR and USD remain separate throughout eligibility, batches, dashboards, and exports.
- Batch creation, reservation, completion, adjustment application, and cancellation are transactional database functions. Replaying a terminal item is idempotent and does not create a second payout or email.
- A failed item can be included in a later batch after its commissions and adjustments are released. A cancelled draft can likewise be recreated safely.
- Paid commissions are not cancelled by a later refund/dispute. A unique open debit adjustment is created and deducted from the next eligible payout.
- Administrator notes, status transitions, batch changes, and payout completions are auditable. Do not put secrets, full payment credentials, or unnecessary personal data in notes.
- If email delivery fails after a payout is recorded, the payment remains recorded. Confirm delivery separately; do not replay payment completion merely to resend email.

## Legacy status API

Trusted tooling may call `POST /api/affiliate/admin/status` with `Authorization: Bearer $AFFILIATE_ADMIN_SECRET`. Supported transitions are `pending → active/rejected` and `active ↔ suspended`. Prefer the back office for normal operations.

## Validation checklist

Before production deployment, run `npx tsc --noEmit`, `npm run test:affiliate`, targeted ESLint for affiliate/admin files, and `npm run build`. Verify the login screen at 375 px, 768 px, 1280 px, and 1536 px, then verify authenticated tables with representative data in both currencies.
