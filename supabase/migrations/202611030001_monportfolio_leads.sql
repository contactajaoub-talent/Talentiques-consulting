-- Additive only. Apply in isolation/staging first; never apply automatically in production.
begin;
create table public.monportfolio_leads (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('MP-' || upper(replace(gen_random_uuid()::text,'-',''))),
  idempotency_hash text not null unique check (idempotency_hash ~ '^[a-f0-9]{64}$'),
  payload_hash text not null check (payload_hash ~ '^[a-f0-9]{64}$'),
  challenge_nonce text not null unique,
  name text not null check(length(name) between 3 and 90),
  country text not null check(country in ('Maroc','France','Belgique','Suisse','Canada','Tunisie','Algérie','Espagne','Autre')),
  payment_method text not null check(payment_method in ('CIH Bank','Attijariwafa bank','Banque Populaire','PayPal','Cash Plus')),
  service text not null default 'Portfolio digital' check(service='Portfolio digital'),
  amount numeric(10,2) not null default 100 check(amount=100),
  currency text not null default 'MAD' check(currency='MAD'),
  source text not null default 'monportfolio.app' check(source='monportfolio.app'),
  payment_status text not null default 'unconfirmed' check(payment_status='unconfirmed'),
  status text not null default 'new' check(status in ('new','assigned','closed')),
  owner_id uuid references public.crm_members(user_id),
  consent boolean not null check(consent),
  consent_version text not null default 'monportfolio-2026-11-03',
  utm jsonb not null default '{}' check(jsonb_typeof(utm)='object'),
  created_at timestamptz not null default now()
);
create index on public.monportfolio_leads(created_at desc);
create index on public.monportfolio_leads(owner_id,created_at desc);
create table public.monportfolio_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.monportfolio_leads(id),
  actor_id uuid references auth.users(id),
  action text not null check(action in ('created','assigned')),
  created_at timestamptz not null default now()
);
alter table public.monportfolio_leads enable row level security;
alter table public.monportfolio_events enable row level security;
revoke all on public.monportfolio_leads,public.monportfolio_events from public,anon,authenticated;
grant select(id,reference,name,country,payment_method,service,amount,currency,source,payment_status,status,owner_id,consent,consent_version,utm,created_at) on public.monportfolio_leads to authenticated;
grant select on public.monportfolio_events to authenticated;
create policy monportfolio_read on public.monportfolio_leads for select to authenticated
 using(public.crm_role()='admin' or (public.crm_role()='sales' and owner_id=auth.uid()));
create policy monportfolio_events_read on public.monportfolio_events for select to authenticated
 using(exists(select 1 from public.monportfolio_leads l where l.id=lead_id));

create function public.monportfolio_create_lead(p_key text,p_payload_hash text,p_nonce text,p_data jsonb)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare r monportfolio_leads;
begin
  if p_key !~ '^[a-f0-9]{64}$' or p_payload_hash !~ '^[a-f0-9]{64}$' or p_nonce !~ '^[a-f0-9]{32}$'
    or p_data->>'consent' is distinct from 'true' then raise exception 'CRM:Demande invalide.'; end if;
  -- Serialize retries across application instances; result and audit event commit atomically.
  perform pg_advisory_xact_lock(hashtextextended(p_key,0));
  select * into r from monportfolio_leads where idempotency_hash=p_key;
  if r.id is not null then
    if r.payload_hash<>p_payload_hash then raise exception 'CRM:Clé déjà utilisée pour une autre demande.'; end if;
    return jsonb_build_object('id',r.id,'reference',r.reference);
  end if;
  insert into monportfolio_leads(idempotency_hash,payload_hash,challenge_nonce,name,country,payment_method,consent,utm)
  values(p_key,p_payload_hash,p_nonce,p_data->>'name',p_data->>'country',p_data->>'payment',true,coalesce(p_data->'utm','{}')) returning * into r;
  insert into monportfolio_events(lead_id,action) values(r.id,'created');
  return jsonb_build_object('id',r.id,'reference',r.reference);
end $$;
revoke all on function public.monportfolio_create_lead(text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.monportfolio_create_lead(text,text,text,jsonb) to service_role;

create function public.monportfolio_assign(p_id uuid,p_owner uuid)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if public.crm_role() is distinct from 'admin' then raise exception 'CRM:Accès refusé.'; end if;
  if not exists(select 1 from crm_members where user_id=p_owner and active and role in ('admin','sales')) then raise exception 'CRM:Collaborateur commercial indisponible.'; end if;
  update monportfolio_leads set owner_id=p_owner,status='assigned' where id=p_id;
  if not found then raise exception 'CRM:Demande introuvable.'; end if;
  insert into monportfolio_events(lead_id,actor_id,action) values(p_id,auth.uid(),'assigned');
end $$;
revoke all on function public.monportfolio_assign(uuid,uuid) from public,anon,authenticated;
grant execute on function public.monportfolio_assign(uuid,uuid) to authenticated;
commit;
