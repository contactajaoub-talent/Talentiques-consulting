# Affiliate authentication operations

Magic links expire after 15 minutes and are single-use. Only SHA-256 hashes are stored. Affiliate sessions expire after 30 days and are revalidated against the affiliate’s active status on every private request.

Expired and used tokens may be retained briefly for security review. A scheduled maintenance job may safely remove old records with queries equivalent to:

```sql
delete from public.affiliate_login_tokens
where (used_at is not null or expires_at < now())
  and created_at < now() - interval '7 days';

delete from public.affiliate_sessions
where (revoked_at is not null or expires_at < now())
  and created_at < now() - interval '30 days';
```

These queries do not delete active, unexpired sessions. Cleanup is intentionally not automated in Phase 3 so deployment operators can choose the appropriate scheduler.

