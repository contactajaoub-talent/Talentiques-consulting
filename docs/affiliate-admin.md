# Affiliate administration — Phase 2

There is intentionally no public admin interface in Phase 2. Status changes use the server-only endpoint `POST /api/affiliate/admin/status` and the `AFFILIATE_ADMIN_SECRET` environment variable.

Set a long random secret in the deployment environment. Never use a `NEXT_PUBLIC_` name and never place the secret in a browser URL.

Send the secret as a Bearer authorization header from a trusted terminal or API client:

```bash
curl -X POST https://talentiques.com/api/affiliate/admin/status \
  -H "Authorization: Bearer $AFFILIATE_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"email":"applicant@example.com","action":"approve"}'
```

Supported actions and required current status:

- `approve`: `pending` → `active`
- `reject`: `pending` → `rejected`; optional `rejectionReason`
- `suspend`: `active` → `suspended`
- `reactivate`: `suspended` → `active`

An `affiliateId` may be supplied instead of `email`. Approval and reactivation keep the commission rate at exactly `0.5000`. Approval sends both personal Store links to the affiliate. Rejection reasons are stored internally and are not included in the rejection email.

