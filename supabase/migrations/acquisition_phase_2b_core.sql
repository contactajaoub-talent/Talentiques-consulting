-- Talentiques Acquisition OS Phase 2B core
-- Additive/idempotent migration. Run manually after Phase 2A. Never auto-run.

create table if not exists acquisition.markets (
  id uuid primary key default gen_random_uuid(), name text not null unique,
  country text not null, country_code text not null, region text,
  language text not null check (language in ('FR','EN')),
  default_currency text not null check (default_currency in ('EUR','USD')),
  timezone text not null default 'UTC', active boolean not null default true, notes text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create unique index if not exists acquisition_markets_name_normalized_uidx
on acquisition.markets(lower(btrim(name)));

create table if not exists acquisition.catalog_items (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
  category text not null, offer_type text not null check (offer_type in ('service','digital_product','bundle','system')),
  audience text, description text, price_eur numeric(14,2), price_usd numeric(14,2),
  active boolean not null default true, sales_enabled boolean not null default false,
  public_url text, eligibility_rules jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb, tags text[] not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (price_eur is null or price_eur >= 0), check (price_usd is null or price_usd >= 0)
);

alter table acquisition.prospects add column if not exists market_id uuid references acquisition.markets(id) on delete restrict;
alter table acquisition.prospects add column if not exists recommended_offer_id uuid references acquisition.catalog_items(id) on delete set null;
alter table acquisition.prospects add column if not exists recommendation_reason text;
alter table acquisition.prospects add column if not exists recommendation_confidence numeric(4,3);
alter table acquisition.prospects add column if not exists profile_type text;
alter table acquisition.prospects add column if not exists years_experience integer;
alter table acquisition.prospects add column if not exists current_situation text;
alter table acquisition.prospects add column if not exists career_goal text;
alter table acquisition.prospects add column if not exists opportunity_type text;
alter table acquisition.prospects add column if not exists main_need text;
alter table acquisition.prospects add column if not exists budget_range text;
alter table acquisition.prospects add column if not exists priority smallint default 2;
alter table acquisition.prospects add column if not exists suggested_score smallint;
alter table acquisition.prospects add column if not exists do_not_contact boolean not null default false;
alter table acquisition.prospects add column if not exists email_unsubscribed boolean not null default false;
alter table acquisition.prospects add column if not exists email_bounced boolean not null default false;

alter table acquisition.campaigns add column if not exists market_id uuid references acquisition.markets(id) on delete restrict;
alter table acquisition.campaigns add column if not exists catalog_item_id uuid references acquisition.catalog_items(id) on delete set null;
alter table acquisition.campaigns add column if not exists audience text;

create table if not exists acquisition.opportunities (
  id uuid primary key default gen_random_uuid(), prospect_id uuid not null references acquisition.prospects(id) on delete restrict,
  catalog_item_id uuid not null references acquisition.catalog_items(id) on delete restrict,
  campaign_id uuid references acquisition.campaigns(id) on delete set null,
  stage text not null default 'identified', quoted_amount numeric(14,2),
  currency text not null check (currency in ('EUR','USD')),
  status text not null default 'open' check (status in ('open','won','lost','cancelled')),
  recommendation_source text not null default 'manual', created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), won_at timestamptz, lost_at timestamptz, lost_reason text
);

create table if not exists acquisition.acquisition_settings (
  id text primary key default 'default', timezone text not null default 'Africa/Casablanca',
  followup_after_contact_days integer not null default 3 check (followup_after_contact_days between 1 and 30),
  followup_after_offer_days integer not null default 3 check (followup_after_offer_days between 1 and 30),
  automation_enabled boolean not null default true, default_owner text not null default '',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists acquisition.automation_runs (
  id uuid primary key default gen_random_uuid(), event_type text not null,
  prospect_id uuid references acquisition.prospects(id) on delete cascade,
  status text not null check (status in ('running','completed','failed','skipped')),
  action text not null, idempotency_key text not null unique, metadata jsonb not null default '{}'::jsonb,
  error text, started_at timestamptz not null default now(), completed_at timestamptz, created_at timestamptz not null default now()
);

alter table acquisition.messages add column if not exists provider text;
alter table acquisition.messages add column if not exists thread_id text;
alter table acquisition.messages add column if not exists read_at timestamptz;

-- Validate only newly inserted or explicitly changed legacy currencies. This deliberately
-- leaves existing CAD rows repairable through unrelated updates such as market_id/status.
create or replace function acquisition.require_eur_or_usd_currency() returns trigger language plpgsql as $$
begin
  if new.currency is null or new.currency not in ('EUR','USD') then
    raise exception 'Acquisition currency must be EUR or USD';
  end if;
  return new;
end $$;
do $$ declare t text; trigger_name text; begin
  foreach t in array array['campaigns','offers','orders','payments'] loop
    trigger_name := 'require_eur_or_usd_currency_' || t;
    if not exists (
      select 1 from pg_trigger g
      join pg_class c on c.oid=g.tgrelid
      join pg_namespace n on n.oid=c.relnamespace
      where not g.tgisinternal and n.nspname='acquisition' and c.relname=t and g.tgname=trigger_name
    ) then
      execute format('create trigger %I before insert or update of currency on acquisition.%I for each row execute function acquisition.require_eur_or_usd_currency()', trigger_name, t);
    end if;
  end loop;
end $$;

-- Phase 2B fields are optional, but values supplied for them must remain coherent.
do $$ begin
  if not exists (select 1 from pg_constraint where conname='acquisition_prospects_years_experience_valid') then
    alter table acquisition.prospects add constraint acquisition_prospects_years_experience_valid check (years_experience is null or years_experience >= 0) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname='acquisition_prospects_suggested_score_valid') then
    alter table acquisition.prospects add constraint acquisition_prospects_suggested_score_valid check (suggested_score is null or suggested_score between 0 and 100) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname='acquisition_prospects_priority_valid') then
    alter table acquisition.prospects add constraint acquisition_prospects_priority_valid check (priority is null or priority between 1 and 4) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname='acquisition_prospects_recommendation_confidence_valid') then
    alter table acquisition.prospects add constraint acquisition_prospects_recommendation_confidence_valid check (recommendation_confidence is null or recommendation_confidence between 0 and 1) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname='acquisition_opportunities_quoted_amount_valid') then
    alter table acquisition.opportunities add constraint acquisition_opportunities_quoted_amount_valid check (quoted_amount is null or quoted_amount >= 0) not valid;
  end if;
end $$;

-- Build markets from both legacy sources. A trailing FR/EN suffix is separated from
-- the country; otherwise the original label is preserved as the name and geography
-- remains explicitly unknown instead of being guessed.
with legacy_labels as (
  select trim(market) as name, language from acquisition.prospects
  where market is not null and trim(market) <> '' and lower(trim(market)) <> 'null'
  union
  select trim(market) as name, language from acquisition.campaigns
  where market is not null and trim(market) <> '' and lower(trim(market)) <> 'null'
), canonical as (
  select distinct on (lower(name)) name, language
  from legacy_labels
  order by lower(name), name
), prepared as (
  select
    name,
    case when name ~* '\s+(FR|EN)$' then nullif(trim(regexp_replace(name, '\s+(FR|EN)$', '', 'i')), '') else 'Non renseigné' end as country,
    case when name ~* '\s+EN$' then 'EN' when name ~* '\s+FR$' then 'FR' when language='EN' then 'EN' else 'FR' end as language,
    case when name ~* '\s+(FR|EN)$' then 'Suffixe de langue séparé du libellé legacy; code pays non inféré.' else 'Libellé legacy conservé; pays et code pays non inférés.' end as notes
  from canonical
)
insert into acquisition.markets(name,country,country_code,language,default_currency,timezone,notes)
select name, coalesce(country,'Non renseigné'), 'XX', language, 'EUR', 'UTC', notes
from prepared p
where not exists (select 1 from acquisition.markets m where lower(trim(m.name))=lower(trim(p.name)))
on conflict(name) do nothing;
update acquisition.prospects p set market_id=m.id from acquisition.markets m
where p.market_id is null and lower(trim(p.market))=lower(trim(m.name)) and p.market is not null and trim(p.market)<>'' and lower(trim(p.market))<>'null';
update acquisition.campaigns c set market_id=m.id from acquisition.markets m
where c.market_id is null and lower(trim(c.market))=lower(trim(m.name)) and c.market is not null and trim(c.market)<>'' and lower(trim(c.market))<>'null';

insert into acquisition.acquisition_settings(id) values ('default') on conflict(id) do nothing;

-- market_id is authoritative. New rows require it; legacy rows with NULL remain editable.
-- Whenever it is present, the legacy text column is synchronized from markets.name.
create or replace function acquisition.require_active_market() returns trigger language plpgsql as $$
declare market_name text;
begin
  if tg_op='INSERT' then
    if new.market_id is null then raise exception 'A valid active acquisition market is required'; end if;
    select name into market_name from acquisition.markets where id=new.market_id and active;
    if market_name is null then raise exception 'A valid active acquisition market is required'; end if;
    new.market := market_name;
    return new;
  end if;

  if old.market_id is null and new.market_id is null then return new; end if;
  if old.market_id is not null and new.market_id is null then
    raise exception 'A valid acquisition market cannot be removed';
  end if;

  if old.market_id is distinct from new.market_id then
    select name into market_name from acquisition.markets where id=new.market_id and active;
    if market_name is null then raise exception 'A valid active acquisition market is required'; end if;
  else
    -- Ordinary updates remain possible after a linked market is deactivated.
    select name into market_name from acquisition.markets where id=new.market_id;
    if market_name is null then raise exception 'The linked acquisition market no longer exists'; end if;
  end if;
  new.market := market_name;
  return new;
end $$;
do $$ declare t text; trigger_name text; begin
  foreach t in array array['prospects','campaigns'] loop
    trigger_name := 'validate_and_sync_market_' || t;
    if not exists (
      select 1 from pg_trigger g
      join pg_class c on c.oid=g.tgrelid
      join pg_namespace n on n.oid=c.relnamespace
      where not g.tgisinternal and n.nspname='acquisition' and c.relname=t and g.tgname=trigger_name
    ) then
      execute format('create trigger %I before insert or update on acquisition.%I for each row execute function acquisition.require_active_market()', trigger_name, t);
    end if;
  end loop;
end $$;

create index if not exists acquisition_prospects_market_id_idx on acquisition.prospects(market_id) where archived_at is null;
create index if not exists acquisition_campaigns_market_id_idx on acquisition.campaigns(market_id,status);
create index if not exists acquisition_opportunities_prospect_idx on acquisition.opportunities(prospect_id,status);
create index if not exists acquisition_automation_runs_prospect_idx on acquisition.automation_runs(prospect_id,created_at desc);

do $$ declare t text; begin
  foreach t in array array['markets','catalog_items','opportunities','acquisition_settings','automation_runs'] loop
    execute format('alter table acquisition.%I enable row level security',t);
    execute format('revoke all on acquisition.%I from anon,authenticated',t);
    execute format('grant all on acquisition.%I to service_role',t);
  end loop;
end $$;

drop trigger if exists set_updated_at on acquisition.markets;
create trigger set_updated_at before update on acquisition.markets for each row execute function acquisition.set_updated_at();
drop trigger if exists set_updated_at on acquisition.catalog_items;
create trigger set_updated_at before update on acquisition.catalog_items for each row execute function acquisition.set_updated_at();
drop trigger if exists set_updated_at on acquisition.opportunities;
create trigger set_updated_at before update on acquisition.opportunities for each row execute function acquisition.set_updated_at();
drop trigger if exists set_updated_at on acquisition.acquisition_settings;
create trigger set_updated_at before update on acquisition.acquisition_settings for each row execute function acquisition.set_updated_at();
