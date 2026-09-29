-- Talentiques Acquisition OS v1
-- Run in the Supabase SQL editor. All tables live in a dedicated schema so the
-- Store, PayPal and affiliate program remain isolated and unchanged.

create extension if not exists pgcrypto;
create schema if not exists acquisition;

create or replace function acquisition.set_updated_at()
returns trigger language plpgsql set search_path = acquisition, public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists acquisition.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  linkedin_url text,
  country text,
  city text,
  industry text,
  size_label text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists acquisition.data_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  source_type text not null check (source_type in ('manual','linkedin','referral','import','partner','other')),
  external_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists acquisition.campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  market text not null,
  language text not null check (language in ('FR','EN')),
  product text,
  status text not null default 'draft' check (status in ('draft','active','paused','completed','archived')),
  starts_at timestamptz,
  ends_at timestamptz,
  target_count integer not null default 0 check (target_count >= 0),
  revenue_target numeric(14,2) not null default 0 check (revenue_target >= 0),
  currency text not null default 'EUR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists acquisition.prospects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references acquisition.companies(id) on delete set null,
  data_source_id uuid references acquisition.data_sources(id) on delete set null,
  first_name text not null,
  last_name text not null,
  country text,
  city text,
  language text not null default 'FR' check (language in ('FR','EN')),
  job_title text,
  linkedin_url text,
  linkedin_relation text check (linkedin_relation in ('1st','2nd','3rd','out_of_network')),
  source_label text,
  verification_status text not null default 'unverified' check (verification_status in ('verified','to_verify','unverified','invalid')),
  score smallint not null default 0 check (score between 0 and 100),
  segment text,
  market text,
  active_search boolean,
  potential_product text,
  status text not null default 'new' check (status in ('new','to_qualify','to_contact','contacted','replied','interested','offer_sent','follow_up','client','lost')),
  last_action_label text,
  last_action_at timestamptz,
  next_action_label text,
  next_action_at timestamptz,
  next_action_type text check (next_action_type in ('linkedin','email','whatsapp','call','follow_up','qualification','offer','other')),
  task_status text check (task_status in ('todo','in_progress','done','cancelled')),
  owner_email text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists acquisition.contact_methods (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references acquisition.prospects(id) on delete cascade,
  type text not null check (type in ('email','phone','whatsapp','linkedin','other')),
  value text not null,
  normalized_value text,
  is_primary boolean not null default false,
  verification_status text not null default 'unverified' check (verification_status in ('verified','to_verify','unverified','invalid')),
  source_label text,
  consent_status text check (consent_status in ('unknown','granted','denied','withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (prospect_id, type, value)
);

create table if not exists acquisition.campaign_prospects (
  campaign_id uuid not null references acquisition.campaigns(id) on delete cascade,
  prospect_id uuid not null references acquisition.prospects(id) on delete cascade,
  status text not null default 'queued' check (status in ('queued','active','paused','completed','removed')),
  added_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (campaign_id, prospect_id)
);

create table if not exists acquisition.activities (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references acquisition.prospects(id) on delete cascade,
  campaign_id uuid references acquisition.campaigns(id) on delete set null,
  activity_type text not null check (activity_type in ('created','linkedin_message','email','whatsapp','call','reply','status_change','offer_sent','follow_up','sale','note','task')),
  channel text check (channel in ('linkedin','email','whatsapp','phone','internal')),
  direction text check (direction in ('inbound','outbound','internal')),
  title text not null,
  detail text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists acquisition.tasks (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references acquisition.prospects(id) on delete cascade,
  campaign_id uuid references acquisition.campaigns(id) on delete set null,
  action_type text not null check (action_type in ('linkedin','email','whatsapp','call','follow_up','qualification','offer','other')),
  title text not null,
  description text,
  due_at timestamptz not null,
  status text not null default 'todo' check (status in ('todo','in_progress','done','cancelled')),
  priority smallint not null default 2 check (priority between 1 and 4),
  owner_email text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists acquisition.message_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  channel text not null check (channel in ('linkedin','email','whatsapp')),
  language text not null check (language in ('FR','EN')),
  product text,
  stage text not null,
  campaign_id uuid references acquisition.campaigns(id) on delete set null,
  subject text,
  body text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists acquisition.messages (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references acquisition.prospects(id) on delete cascade,
  campaign_id uuid references acquisition.campaigns(id) on delete set null,
  template_id uuid references acquisition.message_templates(id) on delete set null,
  channel text not null check (channel in ('linkedin','email','whatsapp')),
  direction text not null check (direction in ('inbound','outbound')),
  subject text,
  body text not null,
  delivery_status text not null default 'draft' check (delivery_status in ('draft','copied','sent','delivered','read','replied','failed')),
  external_id text,
  sent_at timestamptz,
  received_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists acquisition.offers (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references acquisition.prospects(id) on delete restrict,
  campaign_id uuid references acquisition.campaigns(id) on delete set null,
  product text not null,
  amount numeric(14,2) not null check (amount >= 0),
  currency text not null default 'EUR',
  status text not null default 'draft' check (status in ('draft','sent','viewed','accepted','declined','expired')),
  sent_at timestamptz,
  expires_at timestamptz,
  accepted_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists acquisition.orders (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references acquisition.prospects(id) on delete restrict,
  offer_id uuid references acquisition.offers(id) on delete set null,
  product text not null,
  amount numeric(14,2) not null check (amount >= 0),
  currency text not null default 'EUR',
  status text not null default 'pending' check (status in ('pending','paid','refunded','cancelled','failed')),
  external_order_id text,
  ordered_at timestamptz not null default now(),
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists acquisition.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references acquisition.orders(id) on delete restrict,
  provider text not null,
  external_payment_id text,
  amount numeric(14,2) not null check (amount >= 0),
  currency text not null,
  status text not null check (status in ('pending','completed','failed','refunded','partially_refunded')),
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists acquisition.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists acquisition.prospect_tags (
  prospect_id uuid not null references acquisition.prospects(id) on delete cascade,
  tag_id uuid not null references acquisition.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (prospect_id, tag_id)
);

create table if not exists acquisition.consents (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references acquisition.prospects(id) on delete cascade,
  channel text not null check (channel in ('email','phone','whatsapp','linkedin','data_processing')),
  status text not null check (status in ('unknown','granted','denied','withdrawn')),
  legal_basis text,
  source_label text,
  recorded_at timestamptz not null default now(),
  expires_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (prospect_id, channel)
);

-- Future duplicate detection: one normalized identity per LinkedIn URL, e-mail or phone.
create unique index if not exists acquisition_prospects_linkedin_unique
  on acquisition.prospects (lower(linkedin_url)) where linkedin_url is not null and linkedin_url <> '';
create unique index if not exists acquisition_contact_email_unique
  on acquisition.contact_methods (lower(normalized_value)) where type = 'email' and normalized_value is not null;
create unique index if not exists acquisition_contact_phone_unique
  on acquisition.contact_methods (normalized_value) where type in ('phone','whatsapp') and normalized_value is not null;
create index if not exists acquisition_prospects_status_idx on acquisition.prospects (status);
create index if not exists acquisition_prospects_market_idx on acquisition.prospects (market);
create index if not exists acquisition_prospects_score_idx on acquisition.prospects (score desc);
create index if not exists acquisition_prospects_next_action_idx on acquisition.prospects (next_action_at) where status not in ('client','lost');
create index if not exists acquisition_tasks_due_idx on acquisition.tasks (due_at, priority desc) where status in ('todo','in_progress');
create index if not exists acquisition_activities_timeline_idx on acquisition.activities (prospect_id, occurred_at desc);
create index if not exists acquisition_messages_prospect_idx on acquisition.messages (prospect_id, created_at desc);

do $$
declare table_name text;
begin
  foreach table_name in array array['companies','data_sources','campaigns','prospects','contact_methods','tasks','message_templates','messages','offers','orders','payments','tags','consents']
  loop
    execute format('drop trigger if exists set_updated_at on acquisition.%I', table_name);
    execute format('create trigger set_updated_at before update on acquisition.%I for each row execute function acquisition.set_updated_at()', table_name);
  end loop;
end $$;

-- Service-role only. No public/anon policy is created.
do $$
declare table_name text;
begin
  foreach table_name in array array['companies','data_sources','campaigns','prospects','contact_methods','campaign_prospects','activities','tasks','message_templates','messages','offers','orders','payments','tags','prospect_tags','consents']
  loop
    execute format('alter table acquisition.%I enable row level security', table_name);
    execute format('revoke all on acquisition.%I from anon, authenticated', table_name);
    execute format('grant all on acquisition.%I to service_role', table_name);
  end loop;
end $$;
grant usage on schema acquisition to service_role;
grant execute on function acquisition.set_updated_at() to service_role;

-- Next Action Engine: actions due today in the requested timezone.
create or replace view acquisition.actions_due_today as
select
  t.id as task_id,
  t.prospect_id,
  p.first_name,
  p.last_name,
  p.market,
  p.score,
  t.action_type,
  t.title,
  t.due_at,
  t.priority,
  t.status
from acquisition.tasks t
join acquisition.prospects p on p.id = t.prospect_id
where t.status in ('todo','in_progress')
  and (t.due_at at time zone 'Africa/Casablanca')::date = (now() at time zone 'Africa/Casablanca')::date
  and p.status not in ('client','lost');
revoke all on acquisition.actions_due_today from anon, authenticated;
grant select on acquisition.actions_due_today to service_role;

