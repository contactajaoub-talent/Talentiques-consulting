-- TalentiQues Affiliate Program - Phase 1 backend foundation.
-- Safe to run repeatedly after public.store_orders exists.

create extension if not exists pgcrypto;

create table if not exists public.affiliates (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (
    code = lower(code) and code ~ '^[a-z0-9](?:[a-z0-9_-]{0,62}[a-z0-9])?$'
  ),
  full_name text not null,
  email text not null,
  country text,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'suspended', 'rejected')),
  commission_rate numeric(5,4) not null default 0.5000
    check (commission_rate >= 0 and commission_rate <= 1),
  payout_method text,
  payout_email text,
  website_url text,
  instagram_url text,
  tiktok_url text,
  linkedin_url text,
  notes text,
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create index if not exists affiliates_status_idx on public.affiliates (status);
create index if not exists affiliates_email_idx on public.affiliates (lower(email));
alter table public.affiliates enable row level security;

alter table public.affiliates add column if not exists primary_channel text;
alter table public.affiliates add column if not exists profile_url text;
alter table public.affiliates add column if not exists audience_size text;
alter table public.affiliates add column if not exists content_focus jsonb;
alter table public.affiliates add column if not exists motivation text;
alter table public.affiliates add column if not exists application_language text;
alter table public.affiliates add column if not exists terms_accepted_at timestamptz;
alter table public.affiliates add column if not exists terms_version text;
alter table public.affiliates add column if not exists rejection_reason text;

create unique index if not exists affiliates_open_email_uidx
  on public.affiliates (lower(email))
  where status <> 'rejected';

create or replace function public.normalize_affiliate_code()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.code := lower(trim(new.code));
  return new;
end;
$$;

drop trigger if exists affiliates_normalize_code on public.affiliates;
create trigger affiliates_normalize_code
before insert or update of code on public.affiliates
for each row execute function public.normalize_affiliate_code();

create table if not exists public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id),
  affiliate_code text not null,
  market text check (market is null or market in ('fr', 'en')),
  landing_path text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  fbclid text,
  gclid text,
  anonymous_session_id text,
  created_at timestamptz not null default now()
);

create index if not exists affiliate_clicks_affiliate_id_idx on public.affiliate_clicks (affiliate_id);
create index if not exists affiliate_clicks_created_at_idx on public.affiliate_clicks (created_at desc);
create index if not exists affiliate_clicks_affiliate_created_idx on public.affiliate_clicks (affiliate_id, created_at desc);
alter table public.affiliate_clicks enable row level security;

alter table public.store_orders add column if not exists affiliate_id uuid references public.affiliates(id);
alter table public.store_orders add column if not exists affiliate_ref text;
alter table public.store_orders add column if not exists affiliate_click_id uuid references public.affiliate_clicks(id);
create index if not exists store_orders_affiliate_id_idx on public.store_orders (affiliate_id);
create index if not exists store_orders_affiliate_click_id_idx on public.store_orders (affiliate_click_id);

create table if not exists public.affiliate_commissions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id),
  order_id uuid not null references public.store_orders(id),
  product_id text not null check (product_id in ('tracker', 'ats', 'bundle')),
  market text not null check (market in ('fr', 'en')),
  order_amount numeric(10,2) not null check (order_amount > 0),
  commission_rate numeric(5,4) not null check (commission_rate >= 0 and commission_rate <= 1),
  commission_amount numeric(10,2) not null check (commission_amount >= 0),
  currency text not null check (currency in ('EUR', 'USD')),
  status text not null default 'pending'
    check (status in ('pending', 'available', 'paid', 'cancelled')),
  reason text,
  created_at timestamptz not null default now(),
  available_at timestamptz not null,
  paid_at timestamptz,
  unique (order_id)
);

create index if not exists affiliate_commissions_affiliate_status_idx
  on public.affiliate_commissions (affiliate_id, status);
create index if not exists affiliate_commissions_available_at_idx
  on public.affiliate_commissions (available_at) where status = 'pending';
alter table public.affiliate_commissions enable row level security;

create table if not exists public.affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id),
  currency text not null check (currency in ('EUR', 'USD')),
  amount numeric(10,2) not null check (amount > 0),
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'paid', 'failed')),
  method text,
  external_reference text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists affiliate_payouts_affiliate_status_idx
  on public.affiliate_payouts (affiliate_id, status);
alter table public.affiliate_payouts enable row level security;

-- No public policies: all access is through server-side service-role requests.
