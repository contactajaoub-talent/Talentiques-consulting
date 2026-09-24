-- TalentiQues Store - commandes digitales
-- À exécuter UNE SEULE FOIS dans Supabase SQL Editor avant d'activer les paiements.

create extension if not exists pgcrypto;

create table if not exists public.store_orders (
  id uuid primary key default gen_random_uuid(),
  access_token text not null unique,

  market text not null check (market in ('fr', 'en')),
  product_id text not null check (product_id in ('tracker', 'ats', 'bundle')),
  product_name text not null,
  amount numeric(10,2) not null check (amount > 0),
  currency text not null check (currency in ('EUR', 'USD')),

  status text not null default 'pending'
    check (status in ('pending', 'paypal_create_failed', 'paid', 'refunded', 'disputed')),
  delivery_status text not null default 'pending'
    check (delivery_status in ('pending', 'sending', 'sent', 'failed')),

  paypal_order_id text unique,
  paypal_capture_id text unique,
  paypal_error text,

  customer_email text,
  customer_name text,
  customer_phone text,
  customer_country text,
  customer_status text,

  resend_email_id text,
  delivery_error text,

  digital_content_consent_at timestamptz,
  consent_version text,

  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  fbclid text,
  gclid text,

  created_at timestamptz not null default now(),
  paid_at timestamptz,
  delivered_at timestamptz
);

create index if not exists store_orders_created_at_idx
  on public.store_orders (created_at desc);

create index if not exists store_orders_status_idx
  on public.store_orders (status, delivery_status);

create index if not exists store_orders_customer_email_idx
  on public.store_orders (lower(customer_email));

alter table public.store_orders enable row level security;

-- Aucune policy publique volontairement.
-- Toutes les écritures/lectures passent par la clé service_role côté serveur.


-- Compatibilité si la table existait déjà avant l'ajout du consentement numérique.
alter table public.store_orders
  add column if not exists digital_content_consent_at timestamptz;

alter table public.store_orders
  add column if not exists consent_version text;

-- Compatibilité pour les informations client collectées au checkout.
alter table public.store_orders
  add column if not exists customer_phone text;

alter table public.store_orders
  add column if not exists customer_country text;

alter table public.store_orders
  add column if not exists customer_status text;
