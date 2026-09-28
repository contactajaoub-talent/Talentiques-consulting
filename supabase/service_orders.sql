create extension if not exists pgcrypto;

create table if not exists public.service_orders (
  id uuid primary key default gen_random_uuid(),
  service_id text not null check (service_id in ('professional-profile', 'student-jobseeker')),
  market text not null check (market in ('fr', 'en')),
  service_name text not null,
  amount numeric(10,2) not null check (amount > 0),
  currency text not null check (currency in ('EUR', 'USD')),
  status text not null default 'pending' check (status in ('pending', 'paypal_create_failed', 'paid')),
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_country text,
  paypal_order_id text unique,
  paypal_capture_id text unique,
  salesforce_reference text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.service_orders enable row level security;

comment on table public.service_orders is
  'Server-only payment records for human services. No public RLS policies by design.';
