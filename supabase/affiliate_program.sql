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

create table if not exists public.affiliate_login_tokens (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id),
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  requested_language text check (requested_language is null or requested_language in ('fr', 'en')),
  created_at timestamptz not null default now()
);
create index if not exists affiliate_login_tokens_affiliate_created_idx
  on public.affiliate_login_tokens (affiliate_id, created_at desc);
create index if not exists affiliate_login_tokens_expires_idx
  on public.affiliate_login_tokens (expires_at);
alter table public.affiliate_login_tokens enable row level security;

create table if not exists public.affiliate_sessions (
  id uuid primary key default gen_random_uuid(),
  affiliate_id uuid not null references public.affiliates(id),
  session_hash text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_seen_at timestamptz,
  revoked_at timestamptz
);
create index if not exists affiliate_sessions_affiliate_idx
  on public.affiliate_sessions (affiliate_id);
create index if not exists affiliate_sessions_expires_idx
  on public.affiliate_sessions (expires_at);
alter table public.affiliate_sessions enable row level security;

create or replace function public.consume_affiliate_login_token(p_token_hash text)
returns table (affiliate_id uuid, requested_language text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.affiliate_login_tokens
  set used_at = now()
  where token_hash = p_token_hash
    and used_at is null
    and expires_at > now()
  returning affiliate_login_tokens.affiliate_id, affiliate_login_tokens.requested_language;
end;
$$;

create or replace function public.release_mature_affiliate_commissions(p_affiliate_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare released integer;
begin
  update public.affiliate_commissions
  set status = 'available'
  where affiliate_id = p_affiliate_id
    and status = 'pending'
    and available_at <= now();
  get diagnostics released = row_count;
  return released;
end;
$$;

revoke all on function public.consume_affiliate_login_token(text) from public, anon, authenticated;
revoke all on function public.release_mature_affiliate_commissions(uuid) from public, anon, authenticated;
grant execute on function public.consume_affiliate_login_token(text) to service_role;
grant execute on function public.release_mature_affiliate_commissions(uuid) to service_role;

create table if not exists public.affiliate_admin_login_tokens (
  id uuid primary key default gen_random_uuid(), email text not null,
  token_hash text not null unique, expires_at timestamptz not null,
  used_at timestamptz, created_at timestamptz not null default now()
);
alter table public.affiliate_admin_login_tokens enable row level security;

create table if not exists public.affiliate_admin_sessions (
  id uuid primary key default gen_random_uuid(), email text not null,
  session_hash text not null unique, created_at timestamptz not null default now(),
  expires_at timestamptz not null, last_seen_at timestamptz, revoked_at timestamptz
);
create index if not exists affiliate_admin_sessions_expires_idx on public.affiliate_admin_sessions (expires_at);
alter table public.affiliate_admin_sessions enable row level security;

create table if not exists public.affiliate_payout_batches (
  id uuid primary key default gen_random_uuid(), currency text not null check (currency in ('EUR','USD')),
  status text not null default 'draft' check (status in ('draft','approved','processing','completed','cancelled')),
  total_amount numeric(10,2) not null default 0, affiliate_count integer not null default 0,
  created_by text, created_at timestamptz not null default now(), approved_at timestamptz,
  completed_at timestamptz, notes text
);
alter table public.affiliate_payout_batches enable row level security;

create table if not exists public.affiliate_payout_batch_items (
  id uuid primary key default gen_random_uuid(), batch_id uuid not null references public.affiliate_payout_batches(id),
  affiliate_id uuid not null references public.affiliates(id), currency text not null check (currency in ('EUR','USD')),
  amount numeric(10,2) not null check (amount >= 0), payout_method text,
  status text not null default 'pending' check (status in ('pending','processing','paid','failed','cancelled')),
  external_reference text, failure_reason text, created_at timestamptz not null default now(), processed_at timestamptz,
  unique (batch_id, affiliate_id, currency)
);
create index if not exists affiliate_batch_items_batch_idx on public.affiliate_payout_batch_items (batch_id);
create index if not exists affiliate_batch_items_affiliate_idx on public.affiliate_payout_batch_items (affiliate_id);
alter table public.affiliate_payout_batch_items enable row level security;

alter table public.affiliate_commissions add column if not exists payout_batch_item_id uuid references public.affiliate_payout_batch_items(id);
create index if not exists affiliate_commissions_status_currency_idx on public.affiliate_commissions (affiliate_id, status, currency);
create index if not exists store_orders_affiliate_paid_idx on public.store_orders (affiliate_id, status, paid_at desc);
create index if not exists affiliate_payouts_affiliate_created_idx on public.affiliate_payouts (affiliate_id, created_at desc);

alter table public.affiliate_payouts add column if not exists payout_batch_item_id uuid unique references public.affiliate_payout_batch_items(id);

create table if not exists public.affiliate_admin_notes (
  id uuid primary key default gen_random_uuid(), affiliate_id uuid not null references public.affiliates(id),
  note text not null, created_by text, created_at timestamptz not null default now()
);
alter table public.affiliate_admin_notes enable row level security;

create table if not exists public.affiliate_admin_audit_log (
  id uuid primary key default gen_random_uuid(), admin_identity text, action text not null,
  affiliate_id uuid references public.affiliates(id), commission_id uuid references public.affiliate_commissions(id),
  payout_batch_id uuid references public.affiliate_payout_batches(id),
  payout_batch_item_id uuid references public.affiliate_payout_batch_items(id), metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists affiliate_admin_audit_created_idx on public.affiliate_admin_audit_log (created_at desc);
alter table public.affiliate_admin_audit_log enable row level security;

create table if not exists public.affiliate_adjustments (
  id uuid primary key default gen_random_uuid(), affiliate_id uuid not null references public.affiliates(id),
  commission_id uuid not null references public.affiliate_commissions(id), currency text not null check (currency in ('EUR','USD')),
  amount numeric(10,2) not null check (amount > 0), type text not null check (type in ('debit','credit')),
  reason text not null, status text not null default 'open' check (status in ('open','applied','waived')),
  created_at timestamptz not null default now(), applied_at timestamptz,
  unique (commission_id, type, reason)
);
alter table public.affiliate_adjustments add column if not exists payout_batch_item_id uuid references public.affiliate_payout_batch_items(id);
create index if not exists affiliate_adjustments_open_idx on public.affiliate_adjustments (affiliate_id,currency,status) where status='open';
alter table public.affiliate_adjustments enable row level security;

create or replace function public.consume_affiliate_admin_login_token(p_token_hash text)
returns table (email text) language plpgsql security definer set search_path = public as $$
begin return query update public.affiliate_admin_login_tokens set used_at=now()
where token_hash=p_token_hash and used_at is null and expires_at>now()
returning affiliate_admin_login_tokens.email; end; $$;

create or replace function public.create_affiliate_payout_batch(
  p_currency text, p_affiliate_ids uuid[], p_admin text, p_notes text default null
) returns uuid language plpgsql security definer set search_path=public as $$
declare v_batch uuid; v_affiliate uuid; v_item uuid; v_amount numeric(10,2); v_adjustment numeric(10,2); v_count int:=0;
begin
  if p_currency not in ('EUR','USD') then raise exception 'invalid currency'; end if;
  insert into affiliate_payout_batches(currency,created_by,notes) values(p_currency,p_admin,left(p_notes,1000)) returning id into v_batch;
  foreach v_affiliate in array p_affiliate_ids loop
    perform release_mature_affiliate_commissions(v_affiliate);
    select coalesce(sum(commission_amount),0) into v_amount from affiliate_commissions
      where affiliate_id=v_affiliate and currency=p_currency and status='available' and payout_batch_item_id is null;
    select coalesce(sum(case when type='debit' then amount else -amount end),0) into v_adjustment
      from affiliate_adjustments where affiliate_id=v_affiliate and currency=p_currency and status='open' and payout_batch_item_id is null;
    v_amount:=round(greatest(v_amount-v_adjustment,0),2);
    if v_amount>=20 then
      insert into affiliate_payout_batch_items(batch_id,affiliate_id,currency,amount,payout_method)
      select v_batch,v_affiliate,p_currency,v_amount,payout_method from affiliates where id=v_affiliate
      returning id into v_item;
      update affiliate_commissions set payout_batch_item_id=v_item where affiliate_id=v_affiliate and currency=p_currency and status='available' and payout_batch_item_id is null;
      update affiliate_adjustments set payout_batch_item_id=v_item where affiliate_id=v_affiliate and currency=p_currency and status='open' and payout_batch_item_id is null;
      v_count:=v_count+1;
    end if;
  end loop;
  update affiliate_payout_batches b set total_amount=coalesce((select sum(amount) from affiliate_payout_batch_items where batch_id=v_batch),0), affiliate_count=v_count where id=v_batch;
  if v_count=0 then raise exception 'no eligible payouts'; end if;
  insert into affiliate_admin_audit_log(admin_identity,action,payout_batch_id,metadata) values(p_admin,'payout_batch_created',v_batch,jsonb_build_object('currency',p_currency));
  return v_batch;
end; $$;

create or replace function public.update_affiliate_payout_batch(
  p_batch_id uuid, p_action text, p_admin text
) returns text language plpgsql security definer set search_path=public as $$
declare v_status text;
begin
  if p_action='approve' then
    update affiliate_payout_batches set status='approved',approved_at=coalesce(approved_at,now()) where id=p_batch_id and status='draft' returning status into v_status;
    if v_status is not null then update affiliate_payout_batch_items set status='processing' where batch_id=p_batch_id and status='pending'; end if;
  elsif p_action='cancel' then
    update affiliate_payout_batches set status='cancelled',completed_at=now() where id=p_batch_id and status='draft' returning status into v_status;
    if v_status is not null then
      update affiliate_commissions set payout_batch_item_id=null where payout_batch_item_id in (select id from affiliate_payout_batch_items where batch_id=p_batch_id);
      update affiliate_adjustments set payout_batch_item_id=null where payout_batch_item_id in (select id from affiliate_payout_batch_items where batch_id=p_batch_id) and status='open';
      update affiliate_payout_batch_items set status='cancelled',processed_at=now() where batch_id=p_batch_id and status='pending';
    end if;
  else raise exception 'invalid action'; end if;
  if v_status is null then raise exception 'invalid transition'; end if;
  insert into affiliate_admin_audit_log(admin_identity,action,payout_batch_id) values(p_admin,'payout_batch_'||p_action,p_batch_id);
  return v_status;
end; $$;

create or replace function public.complete_affiliate_payout_item(
  p_item_id uuid, p_result text, p_admin text, p_external_reference text default null, p_reason text default null
) returns text language plpgsql security definer set search_path=public as $$
declare v_item affiliate_payout_batch_items%rowtype; v_now timestamptz:=now();
begin
  select * into v_item from affiliate_payout_batch_items where id=p_item_id for update;
  if not found then raise exception 'item not found'; end if;
  if v_item.status in ('paid','failed','cancelled') then return 'already_'||v_item.status; end if;
  if v_item.status not in ('processing','pending') then raise exception 'invalid state'; end if;
  if p_result='paid' then
    update affiliate_payout_batch_items set status='paid',external_reference=left(p_external_reference,500),processed_at=v_now where id=p_item_id;
    update affiliate_commissions set status='paid',paid_at=v_now where payout_batch_item_id=p_item_id and status='available';
    update affiliate_adjustments set status='applied',applied_at=v_now where payout_batch_item_id=p_item_id and status='open';
    insert into affiliate_payouts(affiliate_id,currency,amount,status,method,external_reference,processed_at,payout_batch_item_id)
      values(v_item.affiliate_id,v_item.currency,v_item.amount,'paid',v_item.payout_method,left(p_external_reference,500),v_now,p_item_id)
      on conflict(payout_batch_item_id) do nothing;
  elsif p_result='failed' then
    update affiliate_payout_batch_items set status='failed',failure_reason=left(p_reason,1000),processed_at=v_now where id=p_item_id;
    update affiliate_commissions set payout_batch_item_id=null where payout_batch_item_id=p_item_id and status='available';
    update affiliate_adjustments set payout_batch_item_id=null where payout_batch_item_id=p_item_id and status='open';
  else raise exception 'invalid result'; end if;
  insert into affiliate_admin_audit_log(admin_identity,action,affiliate_id,payout_batch_id,payout_batch_item_id)
    values(p_admin,'payout_marked_'||p_result,v_item.affiliate_id,v_item.batch_id,p_item_id);
  update affiliate_payout_batches set status='completed',completed_at=v_now where id=v_item.batch_id
    and not exists(select 1 from affiliate_payout_batch_items where batch_id=v_item.batch_id and status not in ('paid','failed','cancelled'));
  return p_result;
end; $$;

create or replace function public.create_paid_affiliate_adjustment(p_order_id uuid,p_reason text)
returns uuid language plpgsql security definer set search_path=public as $$
declare v_commission affiliate_commissions%rowtype; v_id uuid;
begin
  select * into v_commission from affiliate_commissions where order_id=p_order_id and status='paid';
  if not found then return null; end if;
  insert into affiliate_adjustments(affiliate_id,commission_id,currency,amount,type,reason)
    values(v_commission.affiliate_id,v_commission.id,v_commission.currency,v_commission.commission_amount,'debit',p_reason)
    on conflict(commission_id,type,reason) do update set commission_id=excluded.commission_id returning id into v_id;
  return v_id;
end; $$;

create or replace function public.affiliate_admin_overview()
returns jsonb language sql security definer set search_path=public as $$
select jsonb_build_object(
  'pendingApplications',(select count(*) from affiliates where status='pending'),
  'activeAffiliates',(select count(*) from affiliates where status='active'),
  'suspendedAffiliates',(select count(*) from affiliates where status='suspended'),
  'clicks30d',(select count(*) from affiliate_clicks where created_at>=now()-interval '30 days'),
  'sales30d',(select count(*) from store_orders where status='paid' and affiliate_id is not null and paid_at>=now()-interval '30 days'),
  'revenue30d',(select coalesce(jsonb_object_agg(currency,total),'{}'::jsonb) from (select currency,sum(amount) total from store_orders where status='paid' and affiliate_id is not null and paid_at>=now()-interval '30 days' group by currency)s),
  'commissions',(select coalesce(jsonb_object_agg(status_currency,total),'{}'::jsonb) from (select status||'_'||currency status_currency,sum(commission_amount) total from affiliate_commissions group by status,currency)c),
  'oldPending',(select count(*) from affiliates where status='pending' and created_at<now()-interval '3 days'),
  'activeWithClicks',(select count(distinct affiliate_id) from affiliate_clicks where created_at>=now()-interval '30 days'),
  'affiliatesWithSales',(select count(distinct affiliate_id) from store_orders where status='paid' and paid_at>=now()-interval '30 days')
); $$;

create or replace function public.affiliate_payout_ready()
returns table(affiliate_id uuid,full_name text,email text,country text,status text,payout_method text,payout_email text,currency text,available_balance numeric,open_adjustment numeric,net_balance numeric,commission_count bigint,oldest_commission timestamptz,latest_commission timestamptz)
language sql security definer set search_path=public as $$
with balances as (
 select c.affiliate_id,c.currency,sum(c.commission_amount) available_balance,count(*) commission_count,min(c.created_at) oldest_commission,max(c.created_at) latest_commission
 from affiliate_commissions c where c.status='available' and c.payout_batch_item_id is null group by c.affiliate_id,c.currency
), adjustments as (
 select affiliate_id,currency,sum(case when type='debit' then amount else -amount end) open_adjustment
 from affiliate_adjustments where status='open' and payout_batch_item_id is null group by affiliate_id,currency
)
select a.id,a.full_name,a.email,a.country,a.status,a.payout_method,a.payout_email,b.currency,b.available_balance,coalesce(d.open_adjustment,0),greatest(b.available_balance-coalesce(d.open_adjustment,0),0),b.commission_count,b.oldest_commission,b.latest_commission
from balances b join affiliates a on a.id=b.affiliate_id left join adjustments d on d.affiliate_id=b.affiliate_id and d.currency=b.currency
where a.status in ('active','suspended') and greatest(b.available_balance-coalesce(d.open_adjustment,0),0)>=20;
$$;

create or replace function public.release_all_mature_affiliate_commissions()
returns integer language plpgsql security definer set search_path=public as $$
declare released integer;
begin
  update affiliate_commissions set status='available' where status='pending' and available_at<=now();
  get diagnostics released=row_count;
  return released;
end; $$;

revoke all on function public.consume_affiliate_admin_login_token(text) from public,anon,authenticated;
revoke all on function public.create_affiliate_payout_batch(text,uuid[],text,text) from public,anon,authenticated;
revoke all on function public.update_affiliate_payout_batch(uuid,text,text) from public,anon,authenticated;
revoke all on function public.complete_affiliate_payout_item(uuid,text,text,text,text) from public,anon,authenticated;
revoke all on function public.create_paid_affiliate_adjustment(uuid,text) from public,anon,authenticated;
grant execute on function public.consume_affiliate_admin_login_token(text) to service_role;
grant execute on function public.create_affiliate_payout_batch(text,uuid[],text,text) to service_role;
grant execute on function public.update_affiliate_payout_batch(uuid,text,text) to service_role;
grant execute on function public.complete_affiliate_payout_item(uuid,text,text,text,text) to service_role;
grant execute on function public.create_paid_affiliate_adjustment(uuid,text) to service_role;
revoke all on function public.affiliate_admin_overview() from public,anon,authenticated;
revoke all on function public.affiliate_payout_ready() from public,anon,authenticated;
grant execute on function public.affiliate_admin_overview() to service_role;
grant execute on function public.affiliate_payout_ready() to service_role;
revoke all on function public.release_all_mature_affiliate_commissions() from public,anon,authenticated;
grant execute on function public.release_all_mature_affiliate_commissions() to service_role;

-- No public policies: all access is through server-side service-role requests.
