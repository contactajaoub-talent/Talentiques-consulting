-- TalentiQues Store - informations client collectées avant paiement.
-- Migration additive et compatible avec les commandes existantes.

alter table public.store_orders
  add column if not exists customer_phone text;

alter table public.store_orders
  add column if not exists customer_country text;

alter table public.store_orders
  add column if not exists customer_status text;
