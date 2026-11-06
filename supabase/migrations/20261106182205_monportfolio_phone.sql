begin;

alter table public.monportfolio_leads
  add column phone text,
  add constraint monportfolio_phone_e164
    check (phone is null or phone ~ '^\+[1-9][0-9]{1,14}$');

-- Existing column grants and policies are unchanged. Only authorized
-- commercial detail views receive the new field; list views stay narrow.
create or replace function public.monportfolio_snapshot(p_id uuid default null,p_search text default '',p_status text default '',p_page integer default 0)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare items jsonb; l monportfolio_leads; d monportfolio_dossiers; result jsonb;
begin
 if crm_role() is null then raise exception 'CRM:Accès refusé.'; end if;
 if p_id is null then
  select coalesce(jsonb_agg(x),'[]') into items from (
   select a.id,a.reference,a.name,a.country,a.status,a.created_at,b.production_owner_id,
    b.received_at,b.due_at,
    case when crm_role()<>'production' then a.amount end as amount,
    case when crm_role()<>'production' then a.currency end as currency,
    case when crm_role()<>'production' then a.payment_status end as payment_status,
    case when crm_role()<>'production' then a.owner_id end as owner_id
   from monportfolio_leads a join monportfolio_dossiers b on b.lead_id=a.id
   where monportfolio_can(a.id) and (p_status='' or a.status=p_status)
    and (p_search='' or a.name ilike '%'||left(p_search,90)||'%' or a.reference ilike '%'||left(p_search,90)||'%')
   order by a.created_at desc,a.id desc limit 26 offset least(10000,greatest(0,p_page))*25
  ) x;
  return jsonb_build_object('data',items,'members',case when crm_role()='admin' then (
   select coalesce(jsonb_agg(jsonb_build_object('user_id',user_id,'name',name,'role',role,'active',active) order by name),'[]') from crm_members where active
  ) else '[]'::jsonb end);
 end if;
 if not monportfolio_can(p_id) then raise exception 'CRM:Dossier inaccessible.'; end if;
 select * into l from monportfolio_leads where id=p_id;
 select * into d from monportfolio_dossiers where lead_id=p_id;
 result=jsonb_build_object('id',l.id,'reference',l.reference,'name',l.name,'country',l.country,'status',l.status,'created_at',l.created_at,
  'source',l.source,'service',l.service,'dossier',to_jsonb(d)-'cv_path'-'cv_hash',
  'events',(select coalesce(jsonb_agg(x order by x.created_at),'[]') from (select action,created_at,actor_id from monportfolio_events where lead_id=p_id and (crm_role()<>'production' or action not in ('payment_confirm','link_generated','link_revoked','assigned'))) x));
 if crm_role() in ('admin','sales') then
  result=result||jsonb_build_object('phone',l.phone,'amount',l.amount,'currency',l.currency,'payment_method',l.payment_method,'payment_status',l.payment_status,'owner_id',l.owner_id,'utm',l.utm,
   'payment',(select to_jsonb(p) from monportfolio_payments p where lead_id=p_id),
   'link',(select to_jsonb(t)-'token_hash' from monportfolio_links t where lead_id=p_id order by created_at desc,id desc limit 1));
 end if;
 return result;
end $$;

create function public.monportfolio_create_phone_lead(p_key text,p_payload_hash text,p_nonce text,p_data jsonb)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare r monportfolio_leads; c text=p_data->>'country'; m text=p_data->>'payment'; v_phone text=p_data->>'phone';
begin
 if p_key is null or p_key !~ '^[a-f0-9]{64}$' or p_payload_hash is null or p_payload_hash !~ '^[a-f0-9]{64}$' or p_nonce is null or p_nonce !~ '^[a-f0-9]{32}$'
  or v_phone is null or v_phone !~ '^\+[1-9][0-9]{1,14}$' or p_data->>'consent' is distinct from 'true' then raise exception 'CRM:Demande invalide.'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_key,0));
 select * into r from monportfolio_leads where idempotency_hash=p_key;
 if r.id is not null then
  if r.payload_hash<>p_payload_hash or r.phone is distinct from v_phone then raise exception 'CRM:Clé déjà utilisée pour une autre demande.'; end if;
  return jsonb_build_object('id',r.id,'reference',r.reference,'phoneSaved',true);
 end if;
 if c is null or c not in ('Maroc','France','Belgique','Suisse','Canada','Tunisie','Autre') or m is null
  or (c='Maroc' and m not in ('CIH Bank','Attijariwafa bank','Banque Populaire','PayPal','Cash Plus'))
  or (c<>'Maroc' and m not in ('PayPal','Carte bancaire')) then raise exception 'CRM:Pays ou paiement invalide.'; end if;
 insert into monportfolio_leads(idempotency_hash,payload_hash,challenge_nonce,name,country,payment_method,consent,utm,amount,currency,phone,consent_version)
 values(p_key,p_payload_hash,p_nonce,p_data->>'name',c,m,true,coalesce(p_data->'utm','{}'),case when c='Maroc' then 100 else 10 end,case when c='Maroc' then 'MAD' else 'EUR' end,v_phone,'mp-commande-2026-11-06-phone') returning * into r;
 insert into monportfolio_dossiers(lead_id) values(r.id);
 insert into monportfolio_events(lead_id,action) values(r.id,'created');
 return jsonb_build_object('id',r.id,'reference',r.reference,'phoneSaved',true);
end $$;

revoke all on function public.monportfolio_create_phone_lead(text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.monportfolio_create_phone_lead(text,text,text,jsonb) to service_role;

commit;
