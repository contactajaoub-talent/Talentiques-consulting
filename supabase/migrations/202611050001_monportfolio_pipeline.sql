-- Phase 4. Additive; apply after Phase 3, on an isolated Supabase first.
begin;
alter table public.monportfolio_leads drop constraint monportfolio_leads_amount_check;
alter table public.monportfolio_leads drop constraint monportfolio_leads_currency_check;
alter table public.monportfolio_leads drop constraint monportfolio_leads_payment_status_check;
alter table public.monportfolio_leads drop constraint monportfolio_leads_status_check;
alter table public.monportfolio_leads drop constraint monportfolio_leads_payment_method_check;
-- Preserve any isolated Phase 3 fixtures with the old single tariff; Phase 4 inserts use a new version.
alter table public.monportfolio_leads alter column consent_version set default 'mp-commande-2026-11-05';
alter table public.monportfolio_leads add constraint mp_price check ((country='Maroc' and amount=100 and currency='MAD') or (country<>'Maroc' and amount=10 and currency='EUR') or (consent_version='monportfolio-2026-11-03' and amount=100 and currency='MAD'));
alter table public.monportfolio_leads add constraint mp_payment check(payment_status in ('unconfirmed','confirmed'));
alter table public.monportfolio_leads add constraint mp_method check(payment_method in ('CIH Bank','Attijariwafa bank','Banque Populaire','PayPal','Cash Plus','Carte bancaire'));
update public.monportfolio_leads set status=case status when 'assigned' then 'new' when 'closed' then 'cancelled' else status end;
alter table public.monportfolio_leads add constraint mp_state check(status in ('new','payment_pending','payment_confirmed','form_sent','received','needs_info','complete','production','delivered','revision_requested','finished','cancelled'));
alter table public.monportfolio_events drop constraint monportfolio_events_action_check;
alter table public.monportfolio_events add constraint mp_event check(action in ('created','assigned','payment_confirm','link_generated','link_revoked','form_sent','received','needs_info','complete','production','delivered','revision_requested','revision_done','finished','cancelled','payment_pending','notes','documents_deleted'));

-- Existing crm_documents/links require crm_request foreign keys and broad CRM bucket rules.
-- Extend Phase 3 instead of creating a duplicate CRM contact/request.
create table public.monportfolio_dossiers (
 lead_id uuid primary key references public.monportfolio_leads(id),
 production_owner_id uuid references public.crm_members(user_id),
 objective text check(objective in ('employment','services','image','other')),
 objective_other text check(length(objective_other)<=240),
 projects text check(length(projects)<=3000), achievements text check(length(achievements)<=3000),
 consent_at timestamptz, consent_version text,
 received_at timestamptz, complete_at timestamptz, started_at timestamptz, due_at timestamptz,
 cv_path text, cv_name text, cv_mime text, cv_size integer, cv_hash text,
 notes text not null default '' check(length(notes)<=6000),
 delivery_url text, delivered_at timestamptz, closed_at timestamptz,
 revision_status text not null default 'available' check(revision_status in ('available','requested','done')),
 revision_requested_at timestamptz, revision_done_at timestamptz,
 deleted_at timestamptz
);
insert into public.monportfolio_dossiers(lead_id) select id from public.monportfolio_leads;
create table public.monportfolio_payments (
 lead_id uuid primary key references public.monportfolio_leads(id),
 amount numeric(10,2) not null check(amount>0), currency text not null check(currency in ('MAD','EUR')),
 method text not null check(method in ('CIH Bank','Attijariwafa bank','Banque Populaire','PayPal','Cash Plus','Carte bancaire')),
 confirmed_at timestamptz not null default now(), confirmed_by uuid not null references public.crm_members(user_id)
);
create table public.monportfolio_links (
 id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.monportfolio_leads(id),
 token_hash text not null unique check(token_hash ~ '^[a-f0-9]{64}$'),
 created_at timestamptz not null default now(), expires_at timestamptz not null default (now()+interval '14 days'),
 revoked_at timestamptz, created_by uuid not null references public.crm_members(user_id)
);
create index on public.monportfolio_links(lead_id,created_at desc);
create table public.monportfolio_uploads (
 id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.monportfolio_leads(id),
 link_id uuid not null references public.monportfolio_links(id), upload_key uuid not null,
 path text not null unique, name text not null, mime text not null,
 size integer not null check(size between 100 and 5242880),
 created_at timestamptz not null default now(), expires_at timestamptz not null default(now()+interval '2 hours'),
 committed_at timestamptz, purged_at timestamptz,
 unique(lead_id,upload_key)
);
create index on public.monportfolio_uploads(expires_at) where committed_at is null;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
 values('monportfolio-cvs','monportfolio-cvs',false,5242880,array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
-- No authenticated or anonymous Storage policy for this bucket. Only server-signed capabilities.
-- Fence against any pre-existing permissive policy on storage.objects.
create policy monportfolio_storage_fence on storage.objects as restrictive for all to anon,authenticated
 using(bucket_id<>'monportfolio-cvs') with check(bucket_id<>'monportfolio-cvs');
do $$ declare t text; begin
 foreach t in array array['monportfolio_dossiers','monportfolio_payments','monportfolio_links','monportfolio_uploads'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from public,anon,authenticated',t);
  execute format('grant all on public.%I to service_role',t);
 end loop;
end $$;

create function public.monportfolio_can(p_id uuid) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
 select coalesce(crm_role()='admin' or (crm_role()='sales' and exists(select 1 from monportfolio_leads where id=p_id and owner_id=auth.uid()))
  or (crm_role()='production' and exists(select 1 from monportfolio_dossiers where lead_id=p_id and production_owner_id=auth.uid())),false)
$$;
-- All reads use a narrow projection. Production receives no financial, UTM or commercial-owner data.
create function public.monportfolio_snapshot(p_id uuid default null,p_search text default '',p_status text default '',p_page integer default 0)
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
  result=result||jsonb_build_object('amount',l.amount,'currency',l.currency,'payment_method',l.payment_method,'payment_status',l.payment_status,'owner_id',l.owner_id,'utm',l.utm,
   'payment',(select to_jsonb(p) from monportfolio_payments p where lead_id=p_id),
   'link',(select to_jsonb(t)-'token_hash' from monportfolio_links t where lead_id=p_id order by created_at desc,id desc limit 1));
 end if;
 return result;
end $$;

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
 if c is null or c not in ('Maroc','France','Belgique','Suisse','Canada','Tunisie','Autre') or m is null
  or (c='Maroc' and m not in ('CIH Bank','Attijariwafa bank','Banque Populaire','PayPal','Cash Plus'))
  or (c<>'Maroc' and m not in ('PayPal','Carte bancaire')) then raise exception 'CRM:Pays ou paiement invalide.'; end if;
 insert into monportfolio_leads(idempotency_hash,payload_hash,challenge_nonce,name,country,payment_method,consent,utm,amount,currency)
 values(p_key,p_payload_hash,p_nonce,p_data->>'name',c,m,true,coalesce(p_data->'utm','{}'),case when c='Maroc' then 100 else 10 end,case when c='Maroc' then 'MAD' else 'EUR' end) returning * into r;
 insert into monportfolio_dossiers(lead_id) values(r.id);
 insert into monportfolio_events(lead_id,action) values(r.id,'created');
 return jsonb_build_object('id',r.id,'reference',r.reference);
end $$;

create function public.monportfolio_action(p_id uuid,p_action text,p_data jsonb default '{}')
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare l monportfolio_leads; d monportfolio_dossiers; role_name text=crm_role(); target uuid; next_state text;
begin
 if not monportfolio_can(p_id) then raise exception 'CRM:Accès refusé.'; end if;
 select * into l from monportfolio_leads where id=p_id for update;
 select * into d from monportfolio_dossiers where lead_id=p_id for update;
 if p_action in ('payment_confirm','link_generated','link_revoked','assigned','delivered','revision_requested','revision_done','finished','cancelled','documents_deleted') and role_name<>'admin' then raise exception 'CRM:Action réservée aux administrateurs.'; end if;
 if p_action in ('payment_pending','form_sent') and role_name not in ('admin','sales') then raise exception 'CRM:Accès commercial requis.'; end if;
 if l.status in ('cancelled','finished') and p_action not in ('documents_deleted','link_revoked') then raise exception 'CRM:Commande clôturée.'; end if;
 if p_action='payment_confirm' then
  if l.payment_status='confirmed' then return '{}'; end if;
  if l.status not in ('new','payment_pending') or p_data->>'currency' is null or p_data->>'currency' not in ('MAD','EUR')
   or p_data->>'method' is null or p_data->>'method' not in ('CIH Bank','Attijariwafa bank','Banque Populaire','PayPal','Cash Plus','Carte bancaire')
   or jsonb_typeof(p_data->'amount') is distinct from 'number' then raise exception 'CRM:Paiement invalide.'; end if;
  if (p_data->>'amount')::numeric not between 0.01 and 99999999.99 or round((p_data->>'amount')::numeric,2)<>(p_data->>'amount')::numeric then raise exception 'CRM:Montant reçu invalide.'; end if;
  insert into monportfolio_payments(lead_id,amount,currency,method,confirmed_by) values(p_id,(p_data->>'amount')::numeric,p_data->>'currency',p_data->>'method',auth.uid());
  update monportfolio_leads set payment_status='confirmed',status='payment_confirmed' where id=p_id;
 elsif p_action='link_generated' then
  if l.payment_status<>'confirmed' or l.status not in ('payment_confirmed','form_sent','received','needs_info') or d.deleted_at is not null
   or p_data->>'hash' is null or p_data->>'hash' !~ '^[a-f0-9]{64}$' then raise exception 'CRM:Accès impossible avant paiement confirmé ou à ce stade.'; end if;
  update monportfolio_links set revoked_at=now() where lead_id=p_id and revoked_at is null;
  insert into monportfolio_links(lead_id,token_hash,created_by) values(p_id,p_data->>'hash',auth.uid());
 elsif p_action='link_revoked' then
  update monportfolio_links set revoked_at=now() where lead_id=p_id and revoked_at is null;
 elsif p_action='assigned' then
  target=(p_data->>'owner')::uuid;
  if p_data->>'kind'='production' then
   if target is not null and not exists(select 1 from crm_members where user_id=target and active and role in ('admin','production')) then raise exception 'CRM:Responsable de production invalide.'; end if;
   update monportfolio_dossiers set production_owner_id=target where lead_id=p_id;
  else
   if target is not null and not exists(select 1 from crm_members where user_id=target and active and role in ('admin','sales')) then raise exception 'CRM:Responsable commercial invalide.'; end if;
   update monportfolio_leads set owner_id=target where id=p_id;
  end if;
 elsif p_action='notes' then
  if role_name not in ('admin','production') then raise exception 'CRM:Accès refusé.'; end if;
  update monportfolio_dossiers set notes=coalesce(p_data->>'notes','') where lead_id=p_id;
 elsif p_action='documents_deleted' then
  if d.deleted_at is not null then return '{}'; end if;
  update monportfolio_links set revoked_at=now() where lead_id=p_id and revoked_at is null;
  update monportfolio_dossiers set deleted_at=now(),cv_path=null,cv_name=null,cv_mime=null,cv_size=null,cv_hash=null,objective=null,objective_other=null,projects=null,achievements=null,notes='' where lead_id=p_id;
 elsif p_action in ('payment_pending','form_sent','needs_info','complete','production','delivered','revision_requested','revision_done','finished','cancelled') then
  next_state=p_action;
  if p_action='payment_pending' and l.status<>'new' then raise exception 'CRM:Transition invalide.'; end if;
  if p_action='form_sent' and (l.status<>'payment_confirmed' or not exists(select 1 from monportfolio_links where lead_id=p_id and revoked_at is null and expires_at>now())) then raise exception 'CRM:Lien valide requis.'; end if;
  if p_action='needs_info' and l.status not in ('received','complete') then raise exception 'CRM:Transition invalide.'; end if;
  if p_action='complete' then
   if role_name not in ('admin','production') or l.status not in ('received','needs_info') or l.payment_status<>'confirmed' or d.cv_path is null or d.deleted_at is not null or d.received_at is null then raise exception 'CRM:Paiement et CV valide requis.'; end if;
   update monportfolio_dossiers set complete_at=now(),due_at=now()+interval '24 hours' where lead_id=p_id;
  end if;
  if p_action='production' then
   if role_name not in ('admin','production') or l.status<>'complete' or l.payment_status<>'confirmed' or d.cv_path is null or d.deleted_at is not null or d.production_owner_id is null then raise exception 'CRM:Dossier complet, paiement et responsable requis.'; end if;
   update monportfolio_dossiers set started_at=now() where lead_id=p_id;
  end if;
  if p_action='delivered' then
   if l.status<>'production' or length(coalesce(p_data->>'url',''))>2048 or coalesce(p_data->>'url','') !~ '^https://[[:alnum:]][^[:space:]@]+$' then raise exception 'CRM:URL HTTPS et production requises.'; end if;
   update monportfolio_dossiers set delivery_url=p_data->>'url',delivered_at=now() where lead_id=p_id;
  end if;
  if p_action='revision_requested' then
   if l.status<>'delivered' or d.revision_status<>'available' then raise exception 'CRM:Une seule modification incluse.'; end if;
   update monportfolio_dossiers set revision_status='requested',revision_requested_at=now() where lead_id=p_id;
  end if;
  if p_action='revision_done' then
   if l.status<>'revision_requested' or d.revision_status<>'requested' then raise exception 'CRM:Modification non demandée.'; end if;
   next_state='delivered';
   update monportfolio_dossiers set revision_status='done',revision_done_at=now() where lead_id=p_id;
  end if;
  if p_action='finished' then
   if l.status<>'delivered' or d.delivery_url is null then raise exception 'CRM:Livraison requise.'; end if;
   update monportfolio_dossiers set closed_at=now() where lead_id=p_id;
  end if;
  if p_action='cancelled' then
   update monportfolio_dossiers set closed_at=now() where lead_id=p_id;
   update monportfolio_links set revoked_at=now() where lead_id=p_id and revoked_at is null;
  end if;
  update monportfolio_leads set status=next_state where id=p_id;
 else raise exception 'CRM:Action inconnue.';
 end if;
 insert into monportfolio_events(lead_id,actor_id,action) values(p_id,auth.uid(),p_action);
 return '{}';
end $$;
-- Keep the validated Phase 3 assign endpoint compatible without resetting the pipeline.
create or replace function public.monportfolio_assign(p_id uuid,p_owner uuid) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin perform monportfolio_action(p_id,'assigned',jsonb_build_object('owner',p_owner)); end $$;

-- Public capabilities: these functions are service-only, never callable with an anon JWT.
create function public.monportfolio_access(p_hash text) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare l monportfolio_leads; t monportfolio_links; d monportfolio_dossiers;
begin
 select * into t from monportfolio_links where token_hash=p_hash and revoked_at is null and expires_at>now();
 select * into l from monportfolio_leads where id=t.lead_id;
 select * into d from monportfolio_dossiers where lead_id=t.lead_id;
 if t.id is null or l.payment_status<>'confirmed' or l.status in ('cancelled','finished') or d.deleted_at is not null then raise exception 'CRM:Lien invalide, expiré ou révoqué. Contactez notre équipe sur WhatsApp.'; end if;
 return jsonb_build_object('id',l.id,'link_id',t.id,'reference',l.reference,'submitted',d.received_at is not null);
end $$;
create function public.monportfolio_prepare(p_hash text,p_key uuid,p_name text,p_mime text,p_size integer,p_ext text)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare a jsonb; u monportfolio_uploads;
begin
 a=monportfolio_access(p_hash);
 perform 1 from monportfolio_leads where id=(a->>'id')::uuid for update;
 a=monportfolio_access(p_hash);
 if (a->>'submitted')::boolean then return a; end if;
 if p_key is null or p_ext is null or p_ext not in ('pdf','docx') or p_mime is distinct from (case when p_ext='pdf' then 'application/pdf' else 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' end) or p_name is null or length(p_name) not between 1 and 180 or p_size is null or p_size not between 100 and 5242880 then raise exception 'CRM:CV invalide.'; end if;
 select * into u from monportfolio_uploads where lead_id=(a->>'id')::uuid and upload_key=p_key;
 if u.id is not null then
  if u.name<>p_name or u.mime<>p_mime or u.size<>p_size or u.expires_at<=now() or u.link_id<>(a->>'link_id')::uuid then raise exception 'CRM:Préparation expirée ou différente. Sélectionnez à nouveau votre CV.'; end if;
  return to_jsonb(u);
 end if;
 if (select count(*) from monportfolio_uploads where lead_id=(a->>'id')::uuid and created_at>now()-interval '1 day')>=12 then raise exception 'CRM:Trop de fichiers. Contactez notre équipe.'; end if;
 insert into monportfolio_uploads(lead_id,link_id,upload_key,path,name,mime,size)
 values((a->>'id')::uuid,(a->>'link_id')::uuid,p_key,(a->>'id')||'/'||gen_random_uuid()||'.'||p_ext,p_name,p_mime,p_size) returning * into u;
 return to_jsonb(u);
end $$;
create function public.monportfolio_upload(p_hash text,p_upload uuid) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare a jsonb; u monportfolio_uploads;
begin
 a=monportfolio_access(p_hash);
 if (a->>'submitted')::boolean then return a; end if;
 select * into u from monportfolio_uploads where id=p_upload and lead_id=(a->>'id')::uuid and link_id=(a->>'link_id')::uuid and expires_at>now() and purged_at is null;
 if u.id is null then raise exception 'CRM:Envoi introuvable ou expiré.'; end if;
 return to_jsonb(u);
end $$;
create function public.monportfolio_submit(p_hash text,p_upload uuid,p_data jsonb,p_cv_hash text) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare a jsonb; u monportfolio_uploads; l monportfolio_leads; d monportfolio_dossiers;
begin
 a=monportfolio_access(p_hash);
 select * into l from monportfolio_leads where id=(a->>'id')::uuid for update;
 -- Recheck after acquiring the same lock used by revoke/regenerate/cancel.
 a=monportfolio_access(p_hash);
 select * into d from monportfolio_dossiers where lead_id=l.id for update;
 if d.received_at is not null then return jsonb_build_object('reference',l.reference,'submitted',true); end if;
 select * into u from monportfolio_uploads where id=p_upload and lead_id=l.id and link_id=(a->>'link_id')::uuid and expires_at>now() and purged_at is null for update;
 if u.id is null or p_cv_hash is null or p_cv_hash !~ '^[a-f0-9]{64}$' or p_data->>'consent' is distinct from 'true'
  or p_data->>'objective' is null or p_data->>'objective' not in ('employment','services','image','other') or (p_data->>'objective'='other' and length(trim(coalesce(p_data->>'other','')))=0)
  or length(coalesce(p_data->>'other',''))>240 or length(coalesce(p_data->>'projects',''))>3000 or length(coalesce(p_data->>'achievements',''))>3000 then raise exception 'CRM:Dossier invalide.'; end if;
 update monportfolio_dossiers set objective=p_data->>'objective',objective_other=case when p_data->>'objective'='other' then p_data->>'other' else null end,
  projects=coalesce(p_data->>'projects',''),achievements=coalesce(p_data->>'achievements',''),consent_at=now(),consent_version='mp-dossier-2026-11-05',
  received_at=now(),cv_path=u.path,cv_name=u.name,cv_mime=u.mime,cv_size=u.size,cv_hash=p_cv_hash where lead_id=l.id;
 update monportfolio_uploads set committed_at=now() where id=u.id;
 update monportfolio_leads set status='received' where id=l.id;
 insert into monportfolio_events(lead_id,action) values(l.id,'received');
 return jsonb_build_object('reference',l.reference,'submitted',true);
end $$;

create function public.monportfolio_document(p_id uuid) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if not monportfolio_can(p_id) then raise exception 'CRM:Accès refusé.'; end if;
 return (select jsonb_build_object('path',cv_path,'name',cv_name,'mime',cv_mime) from monportfolio_dossiers where lead_id=p_id and deleted_at is null and cv_path is not null);
end $$;
-- Explicit admin retention operation: orphan uploads > 2h, documents >90d after closure,
-- and immediate deletion requests. Tombstones retained so late signed uploads can be purged again.
create function public.monportfolio_cleanup(p_id uuid default null) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if crm_role() is distinct from 'admin' then raise exception 'CRM:Accès refusé.'; end if;
 if p_id is not null then perform monportfolio_action(p_id,'documents_deleted'); end if;
 return (select coalesce(jsonb_agg(jsonb_build_object('id',u.id,'lead_id',u.lead_id,'path',u.path)),'[]')
  from monportfolio_uploads u join monportfolio_dossiers d on d.lead_id=u.lead_id
  where (p_id is null or u.lead_id=p_id) and (d.deleted_at is not null or d.closed_at<now()-interval '90 days' or (u.committed_at is null and u.expires_at<now()))
   and (u.purged_at is null or (u.purged_at<u.expires_at+interval '2 hours' and now()>=u.expires_at+interval '2 hours')));
end $$;
create function public.monportfolio_cleanup_done(p_upload uuid) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare u monportfolio_uploads; d monportfolio_dossiers;
begin
 if crm_role() is distinct from 'admin' then raise exception 'CRM:Accès refusé.'; end if;
 select * into u from monportfolio_uploads where id=p_upload;
 select * into d from monportfolio_dossiers where lead_id=u.lead_id;
 if d.deleted_at is null and d.closed_at is not null and d.closed_at<now()-interval '90 days' then perform monportfolio_action(u.lead_id,'documents_deleted'); end if;
 if d.deleted_at is null and not (d.closed_at is not null and d.closed_at<now()-interval '90 days') and not (u.committed_at is null and u.expires_at<now()) then raise exception 'CRM:Suppression non autorisée.'; end if;
 update monportfolio_uploads set purged_at=now(),name='' where id=p_upload;
end $$;

do $$ declare f record; begin
 for f in select oid::regprocedure sig from pg_proc where pronamespace='public'::regnamespace and proname like 'monportfolio_%' loop
  execute format('revoke all on function %s from public,anon,authenticated',f.sig);
  execute format('grant execute on function %s to service_role',f.sig);
 end loop;
end $$;
grant execute on function public.monportfolio_can(uuid),public.monportfolio_snapshot(uuid,text,text,integer),public.monportfolio_action(uuid,text,jsonb),public.monportfolio_assign(uuid,uuid),public.monportfolio_document(uuid),public.monportfolio_cleanup(uuid),public.monportfolio_cleanup_done(uuid) to authenticated;
commit;
