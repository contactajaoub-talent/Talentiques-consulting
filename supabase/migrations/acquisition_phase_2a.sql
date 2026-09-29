-- Phase 2A: Supabase persistence, assisted deduplication and archival.
-- Apply after supabase/acquisition_os.sql.

alter table acquisition.prospects add column if not exists archived_at timestamptz;
alter table acquisition.tasks add column if not exists notes text;

-- Duplicates are warnings, not hard failures: explicit "create anyway" remains possible.
drop index if exists acquisition.acquisition_prospects_linkedin_unique;
drop index if exists acquisition.acquisition_contact_email_unique;
drop index if exists acquisition.acquisition_contact_phone_unique;
create index if not exists acquisition_prospects_linkedin_lookup
  on acquisition.prospects (lower(linkedin_url)) where linkedin_url is not null and linkedin_url <> '' and archived_at is null;
create index if not exists acquisition_contact_email_lookup
  on acquisition.contact_methods (lower(normalized_value)) where type = 'email' and normalized_value is not null;
create index if not exists acquisition_contact_phone_lookup
  on acquisition.contact_methods (normalized_value) where type in ('phone','whatsapp') and normalized_value is not null;
create index if not exists acquisition_prospects_active_updated_idx
  on acquisition.prospects (updated_at desc) where archived_at is null;
create index if not exists acquisition_campaign_prospects_prospect_idx
  on acquisition.campaign_prospects (prospect_id, status);

grant select on acquisition.actions_due_today to service_role;
