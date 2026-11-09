begin;

-- Keep historical MAD and EUR orders valid without updating their amounts.
alter table public.monportfolio_leads drop constraint mp_price;
alter table public.monportfolio_leads add constraint mp_price check ((amount=25 and currency='EUR') or (country='Maroc' and amount=100 and currency='MAD') or (country<>'Maroc' and amount=10 and currency='EUR') or (consent_version='monportfolio-2026-11-03' and amount=100 and currency='MAD'));

create or replace function public.monportfolio_create_lead(p_key text,p_payload_hash text,p_nonce text,p_data jsonb)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare r monportfolio_leads; c text=p_data->>'country'; m text=p_data->>'payment';
begin
 if p_key is null or p_key !~ '^[a-f0-9]{64}$' or p_payload_hash is null or p_payload_hash !~ '^[a-f0-9]{64}$' or p_nonce is null or p_nonce !~ '^[a-f0-9]{32}$'
  or p_data->>'consent' is distinct from 'true' then raise exception 'CRM:Demande invalide.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_key,0));
 select * into r from monportfolio_leads where idempotency_hash=p_key;
 if r.id is not null then
  if r.payload_hash<>p_payload_hash then raise exception 'CRM:Clé déjà utilisée pour une autre demande.'; end if;
  return jsonb_build_object('id',r.id,'reference',r.reference);
 end if;
 if c is null or c not in ('Maroc','France','Belgique','Suisse','Canada','Tunisie','Autre') or m is null or m not in ('PayPal','Carte bancaire') then raise exception 'CRM:Pays ou paiement invalide.'; end if;
 insert into monportfolio_leads(idempotency_hash,payload_hash,challenge_nonce,name,country,payment_method,consent,utm,amount,currency)
 values(p_key,p_payload_hash,p_nonce,p_data->>'name',c,m,true,coalesce(p_data->'utm','{}'),25,'EUR') returning * into r;
 insert into monportfolio_dossiers(lead_id) values(r.id);
 insert into monportfolio_events(lead_id,action) values(r.id,'created');
 return jsonb_build_object('id',r.id,'reference',r.reference);
end $$;

create or replace function public.monportfolio_create_phone_lead(p_key text,p_payload_hash text,p_nonce text,p_data jsonb)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare r monportfolio_leads; c text=p_data->>'country'; m text=p_data->>'payment'; v_phone text=p_data->>'phone';
begin
 if p_key is null or p_key !~ '^[a-f0-9]{64}$' or p_payload_hash is null or p_payload_hash !~ '^[a-f0-9]{64}$' or p_nonce is null or p_nonce !~ '^[a-f0-9]{32}$'
  or v_phone is null or v_phone !~ '^\+[1-9][0-9]{1,14}$' or p_data->>'consent' is distinct from 'true' then raise exception 'CRM:Demande invalide.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_key,0));
 select * into r from monportfolio_leads where idempotency_hash=p_key;
 if r.id is not null then
  if r.payload_hash<>p_payload_hash or r.phone is distinct from v_phone then raise exception 'CRM:Clé déjà utilisée pour une autre demande.'; end if;
  return jsonb_build_object('id',r.id,'reference',r.reference,'phoneSaved',true,'amount',r.amount,'currency',r.currency);
 end if;
 if c is null or c not in ('Maroc','France','Belgique','Suisse','Canada','Tunisie','Autre') or m is null or m not in ('PayPal','Carte bancaire') then raise exception 'CRM:Pays ou paiement invalide.'; end if;
 insert into monportfolio_leads(idempotency_hash,payload_hash,challenge_nonce,name,country,payment_method,consent,utm,amount,currency,phone,consent_version)
 values(p_key,p_payload_hash,p_nonce,p_data->>'name',c,m,true,coalesce(p_data->'utm','{}'),25,'EUR',v_phone,'mp-commande-2026-11-06-phone') returning * into r;
 insert into monportfolio_dossiers(lead_id) values(r.id);
 insert into monportfolio_events(lead_id,action) values(r.id,'created');
 return jsonb_build_object('id',r.id,'reference',r.reference,'phoneSaved',true,'amount',r.amount,'currency',r.currency);
end $$;

commit;
