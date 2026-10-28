-- Additive migration. Apply service_orders.sql first. Never run on production without approval.
begin;
create extension if not exists pgcrypto;

create table public.crm_members (
  user_id uuid primary key references auth.users(id), name text not null check(length(name) between 1 and 150),
  role text not null check(role in ('admin','sales','production')), active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.crm_settings (
  id text primary key default 'business' check(id='business'), value jsonb not null,
  updated_at timestamptz not null default now(), site_url text not null default 'https://talentiques.com'
);
insert into public.crm_settings(value) values ('{"timezone":"Europe/Paris","days":[1,2,3,4,5],"start":9,"end":18,"diagnostic_hours":3,"production_hours":27,"promise_enabled":false,"retention_days":90,"reminder_days":3,"auto_assign":false}');
create table public.crm_contacts (
  id uuid primary key default gen_random_uuid(), email text not null unique check(email=lower(email)), name text not null,
  phone text, linkedin text, marketing boolean not null default false, marketing_opted_out_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.crm_requests (
  id uuid primary key default gen_random_uuid(), contact_id uuid not null references public.crm_contacts(id),
  kind text not null check(kind in ('diagnostic','service')), service_id text check(service_id in ('professional-profile','student-jobseeker')),
  market text not null default 'fr' check(market in ('fr','en')), current_status text not null, objective text not null, markets text[] not null,
  notes text, source text, utm jsonb not null default '{}', status text not null default 'new' check(status in ('new','assigned','analyzing','review','report_sent','proposal_needed','proposal_sent','converted','closed')),
  owner_id uuid references public.crm_members(user_id), priority text not null default 'normal' check(priority in ('normal','high','urgent')),
  due_at timestamptz not null, report_text text not null default '', report_approved_at timestamptz, report_sent_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.crm_proposals (
  id uuid primary key default gen_random_uuid(), request_id uuid not null references public.crm_requests(id),
  service_id text not null check(service_id in ('professional-profile','student-jobseeker')), amount numeric(10,2) not null check(amount>0 and amount<10000),
  currency text not null check(currency in ('EUR','USD')), inclusions text not null, message text not null, conditions text not null,
  student_evidence text, expires_at timestamptz, status text not null default 'draft' check(status in ('draft','approved','proposal_sent','rejected','expired','converted')),
  reminder_opt_in boolean not null default false, approved_by uuid references public.crm_members(user_id), approved_at timestamptz, sent_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
-- Reuse the existing service ledger. Existing rows/checkout behavior are preserved.
alter table public.service_orders add column crm_request_id uuid references public.crm_requests(id);
alter table public.service_orders add column crm_proposal_id uuid unique references public.crm_proposals(id);
alter table public.service_orders add column checkout_hash text;
alter table public.service_orders add column checkout_expires_at timestamptz;
alter table public.service_orders add column manual_reference text;
alter table public.service_orders add column updated_at timestamptz not null default now();
-- Replace only the known status constraint; no data is removed.
alter table public.service_orders drop constraint if exists service_orders_status_check;
alter table public.service_orders add constraint service_orders_status_check check(status in ('pending','paypal_create_failed','paid','failed','refunded','verification_needed'));
create table public.crm_cases (
  id uuid primary key default gen_random_uuid(), order_id uuid not null unique references public.service_orders(id),
  request_id uuid not null references public.crm_requests(id), owner_id uuid references public.crm_members(user_id),
  status text not null default 'missing_info' check(status in ('missing_info','unassigned','production','quality','delivery','corrections','completed','cancelled')),
  priority text not null default 'normal' check(priority in ('normal','high','urgent')), instructions text not null default '', eligibility_evidence text not null default '',
  due_at timestamptz, ready_at timestamptz, delivered_at timestamptz, approved_at timestamptz, revision integer not null default 1,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.crm_tasks (
  id uuid primary key default gen_random_uuid(), request_id uuid references public.crm_requests(id), case_id uuid references public.crm_cases(id),
  owner_id uuid references public.crm_members(user_id), title text not null, status text not null default 'open' check(status in ('open','done')),
  due_at timestamptz, dedupe_key text not null unique, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.crm_documents (
  id uuid primary key default gen_random_uuid(), request_id uuid not null references public.crm_requests(id), case_id uuid references public.crm_cases(id),
  kind text not null check(kind in ('cv','report','cv_word','cv_pdf','letter','linkedin','tracker')), name text not null,
  path text not null unique, mime text not null, size integer not null check(size between 100 and 5242880),
  approved_at timestamptz, approved_by uuid references public.crm_members(user_id), deleted_at timestamptz,
  uploaded_by uuid references public.crm_members(user_id), created_at timestamptz not null default now()
);
create table public.crm_activity_logs (
  id uuid primary key default gen_random_uuid(), request_id uuid references public.crm_requests(id), case_id uuid references public.crm_cases(id),
  actor_id uuid references public.crm_members(user_id), action text not null, detail text not null default '',
  created_at timestamptz not null default now()
);
create table public.crm_consents (
  id uuid primary key default gen_random_uuid(), request_id uuid not null references public.crm_requests(id),
  privacy boolean not null check(privacy), marketing boolean not null, version text not null, source text,
  created_at timestamptz not null default now()
);
create table public.crm_outbox (
  id uuid primary key default gen_random_uuid(), request_id uuid not null references public.crm_requests(id), case_id uuid references public.crm_cases(id),
  proposal_id uuid references public.crm_proposals(id), recipient text not null, subject text not null, body text not null,
  document_ids uuid[] not null default '{}', category text not null check(category in ('receipt','report','proposal','reminder','payment','delivery','missing_info')),
  dedupe_key text not null unique, status text not null default 'queued' check(status in ('queued','sending','accepted','failed','manual','manual_sent','cancelled')),
  attempts integer not null default 0, available_at timestamptz not null default now(), locked_at timestamptz, provider_id text, error text,
  accepted_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.crm_notifications (
  id uuid primary key default gen_random_uuid(), member_id uuid not null references public.crm_members(user_id), title text not null,
  request_id uuid references public.crm_requests(id), case_id uuid references public.crm_cases(id), dedupe_key text not null unique,
  read_at timestamptz, created_at timestamptz not null default now()
);
create table public.crm_uploads (
  id uuid primary key, token_hash text not null unique, path text not null unique, payload jsonb not null, result jsonb,
  member_id uuid references public.crm_members(user_id), expires_at timestamptz not null default now()+interval '20 minutes', created_at timestamptz not null default now()
);
create table public.crm_rate_limits (key text primary key, hits integer not null default 1, window_at timestamptz not null default now());
create table public.crm_payment_events (event_id text primary key, order_id uuid not null references public.service_orders(id), event_type text not null, created_at timestamptz not null default now());
create table public.crm_info_links (
  id uuid primary key default gen_random_uuid(), case_id uuid not null references public.crm_cases(id), token_hash text not null unique,
  expires_at timestamptz not null default now()+interval '3 days', used_at timestamptz, created_at timestamptz not null default now()
);

create index on public.crm_requests(owner_id,status,due_at);
create index on public.crm_requests(contact_id);
create index on public.crm_requests(created_at desc);
create index on public.crm_cases(owner_id,status,due_at);
create index on public.crm_cases(created_at desc);
create index on public.crm_proposals(request_id);
create index on public.crm_proposals(created_at desc);
create index on public.crm_tasks(owner_id,status,due_at);
create index on public.crm_documents(request_id,case_id);
create index on public.crm_outbox(status,available_at);
create index on public.crm_outbox(created_at desc);
create index on public.crm_activity_logs(request_id,created_at desc);
create index on public.crm_activity_logs(case_id,created_at desc);
create index on public.crm_notifications(member_id,created_at desc);
create index on public.service_orders(crm_request_id);
create index on public.service_orders(created_at desc) where crm_request_id is not null;
create index on public.crm_uploads(expires_at);
create index on public.crm_contacts(lower(name) text_pattern_ops);

create function public.crm_role() returns text language sql stable security definer set search_path=public,pg_temp as $$
  select role from crm_members where user_id=auth.uid() and active
$$;
create function public.crm_can_request(p_id uuid) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
  select coalesce(crm_role()='admin' or (crm_role() is not null and exists(select 1 from crm_requests where id=p_id and owner_id=auth.uid())),false)
$$;
create function public.crm_can_case(p_id uuid) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
  select coalesce(crm_role()='admin' or (crm_role() is not null and exists(select 1 from crm_cases where id=p_id and owner_id=auth.uid())),false)
$$;
create function public.crm_can_contact(p_id uuid) returns boolean language sql stable security definer set search_path=public,pg_temp as $$
  select crm_role()='admin' or exists(select 1 from crm_requests r where r.contact_id=p_id and (crm_can_request(r.id) or exists(select 1 from crm_cases c where c.request_id=r.id and crm_can_case(c.id))))
$$;
create function public.crm_touch() returns trigger language plpgsql set search_path=public,pg_temp as $$ begin new.updated_at=now(); return new; end $$;
do $$ declare t text; begin
  foreach t in array array['crm_members','crm_contacts','crm_requests','crm_proposals','crm_cases','crm_tasks','crm_outbox','service_orders'] loop
    execute format('create trigger crm_updated before update on public.%I for each row execute function public.crm_touch()',t);
  end loop;
  foreach t in array array['crm_members','crm_settings','crm_contacts','crm_requests','crm_proposals','crm_cases','crm_tasks','crm_documents','crm_activity_logs','crm_consents','crm_outbox','crm_notifications','crm_uploads','crm_rate_limits','crm_payment_events','crm_info_links'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon, authenticated',t);
    execute format('grant all on public.%I to service_role',t);
  end loop;
end $$;
grant select on public.crm_members,public.crm_settings,public.crm_contacts,public.crm_requests,public.crm_proposals,public.crm_cases,public.crm_tasks,public.crm_documents,public.crm_activity_logs,public.crm_outbox,public.crm_notifications to authenticated;
grant select on public.service_orders to authenticated;
create policy crm_member_read on public.crm_members for select to authenticated using(crm_role()='admin' or (crm_role() is not null and user_id=auth.uid()));
create policy crm_settings_read on public.crm_settings for select to authenticated using(crm_role() is not null);
create policy crm_contacts_read on public.crm_contacts for select to authenticated using(crm_can_contact(id));
create policy crm_requests_read on public.crm_requests for select to authenticated using(crm_can_request(id));
create policy crm_cases_read on public.crm_cases for select to authenticated using(crm_can_case(id));
create policy crm_proposals_read on public.crm_proposals for select to authenticated using(crm_role() in ('admin','sales') and crm_can_request(request_id));
create policy crm_orders_read on public.service_orders for select to authenticated using(crm_role() in ('admin','sales') and crm_can_request(crm_request_id));
create policy crm_tasks_read on public.crm_tasks for select to authenticated using(crm_role() is not null and (crm_role()='admin' or owner_id=auth.uid()));
create policy crm_documents_read on public.crm_documents for select to authenticated using(deleted_at is null and (crm_can_request(request_id) or crm_can_case(case_id) or (kind='cv' and exists(select 1 from crm_cases c where c.request_id=crm_documents.request_id and crm_can_case(c.id)))));
create policy crm_logs_read on public.crm_activity_logs for select to authenticated using((crm_can_request(request_id) or crm_can_case(case_id)) and (crm_role()<>'production' or action not in ('proposal_create','proposal_approve','payment_confirm','manual_payment','proposal_reject')));
create policy crm_outbox_read on public.crm_outbox for select to authenticated using(crm_role() in ('admin','sales') and crm_can_request(request_id));
create policy crm_notification_read on public.crm_notifications for select to authenticated using(member_id=auth.uid() and crm_role() is not null);
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('crm-documents','crm-documents',false,5242880,array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
-- No browser storage policies: short signed upload/download capabilities are issued by authorized server endpoints only.
-- Restrictive fence also protects this bucket if a legacy broad permissive policy exists.
create policy crm_storage_fence on storage.objects as restrictive for all to anon,authenticated using(bucket_id<>'crm-documents') with check(bucket_id<>'crm-documents');

create function public.crm_rate_limit(p_key text,p_limit integer) returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare n integer; begin
  insert into crm_rate_limits(key) values(p_key) on conflict(key) do update set hits=case when crm_rate_limits.window_at<now()-interval '15 minutes' then 1 else crm_rate_limits.hits+1 end, window_at=case when crm_rate_limits.window_at<now()-interval '15 minutes' then now() else crm_rate_limits.window_at end returning hits into n;
  return n<=p_limit;
end $$;

create function public.crm_audit(p_request uuid,p_case uuid,p_action text,p_detail text default '') returns void language sql security definer set search_path=public,pg_temp as $$
  insert into crm_activity_logs(request_id,case_id,actor_id,action,detail) values(p_request,p_case,auth.uid(),p_action,left(p_detail,4000))
$$;
create function public.crm_queue(p_request uuid,p_case uuid,p_category text,p_key text,p_subject text,p_body text,p_docs uuid[] default '{}',p_proposal uuid default null,p_at timestamptz default now()) returns void language sql security definer set search_path=public,pg_temp as $$
  insert into crm_outbox(request_id,case_id,recipient,subject,body,category,dedupe_key,document_ids,proposal_id,available_at)
  select r.id,p_case,c.email,p_subject,p_body,p_category,p_key,p_docs,p_proposal,p_at from crm_requests r join crm_contacts c on c.id=r.contact_id where r.id=p_request on conflict(dedupe_key) do nothing
$$;

-- Public intake committed only after server-side inspection of an immutable storage object.
create function public.crm_commit_intake(p_upload uuid,p_hash text,p_due timestamptz,p_checkout_hash text) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare u crm_uploads; p jsonb; ct uuid; r uuid; o uuid; v_result jsonb; begin
  select * into u from crm_uploads where id=p_upload and token_hash=p_hash for update;
  if u.id is null or u.member_id is not null then raise exception 'CRM:Référence invalide.'; end if;
  if u.result is not null then return u.result; end if;
  if u.expires_at<now() then raise exception 'CRM:Envoi expiré. Recommencez.'; end if;
  p=u.payload;
  insert into crm_contacts(email,name,phone,linkedin,marketing) values(p->>'email',p->>'name',p->>'phone',p->>'linkedin',(p->>'marketing')::boolean)
  on conflict(email) do update set updated_at=now() returning id into ct;
  -- Existing contact identity/marketing cannot be overwritten by an unauthenticated submission.
  insert into crm_requests(contact_id,kind,service_id,market,current_status,objective,markets,notes,source,utm,due_at)
  values(ct,p->>'kind',p->>'service_id',p->>'market',p->>'current_status',p->>'objective',array(select jsonb_array_elements_text(p->'markets')),p->>'notes',p->>'source',jsonb_build_object('source',p->>'utm_source','medium',p->>'utm_medium','campaign',p->>'utm_campaign','content',p->>'utm_content','term',p->>'utm_term'),p_due) returning id into r;
  insert into crm_consents(request_id,privacy,marketing,version,source) values(r,true,(p->>'marketing')::boolean,p->>'consent_version',p->>'source');
  insert into crm_documents(request_id,kind,name,path,mime,size) values(r,'cv',p->>'filename',u.path,p->>'mime',(p->>'size')::integer);
  insert into crm_tasks(request_id,title,due_at,dedupe_key) values(r,case when p->>'kind'='diagnostic' then 'Préparer le diagnostic' else 'Vérifier le paiement et les informations' end,p_due,'intake:'||r);
  if p->>'kind'='service' then
    insert into service_orders(service_id,market,service_name,amount,currency,status,customer_name,customer_email,customer_phone,customer_country,crm_request_id,checkout_hash,checkout_expires_at)
    values(p->>'service_id',p->>'market',case when p->>'service_id'='professional-profile' then 'Valorisation professionnelle complète' else 'Pack Étudiant & Demandeur d’emploi' end,case when p->>'service_id'='professional-profile' then 45 else 35 end,case when p->>'market'='en' then 'USD' else 'EUR' end,'pending',p->>'name',p->>'email',p->>'phone',array_to_string(array(select jsonb_array_elements_text(p->'markets')),', '),r,p_checkout_hash,now()+interval '7 days') returning id into o;
  end if;
  perform crm_queue(r,null,'receipt','receipt:'||r,case when p->>'kind'='diagnostic' then 'Votre demande de diagnostic TALENTIQUES' else 'Votre demande d’accompagnement TALENTIQUES' end,'Votre demande et votre CV ont bien été reçus. Notre équipe va examiner votre dossier. Le démarrage d’une prestation reste conditionné à la confirmation du paiement et à la réception des informations nécessaires.');
  perform crm_audit(r,null,'intake','Demande reçue — document privé validé');
  v_result=jsonb_build_object('requestId',r,'orderId',o);
  update crm_uploads set result=v_result where id=u.id;
  return v_result;
end $$;

create function public.crm_add_document(p_upload uuid,p_hash text) returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare u crm_uploads; p jsonb; d uuid; rid uuid; cid uuid; begin
  select * into u from crm_uploads where id=p_upload and token_hash=p_hash for update;
  if u.id is null or u.member_id is distinct from auth.uid() or crm_role() is null then raise exception 'CRM:Accès refusé.'; end if;
  if u.result is not null then return u.result; end if;
  if u.expires_at<now() then raise exception 'CRM:Envoi expiré.'; end if;
  p=u.payload; rid=(p->>'request_id')::uuid; cid=(p->>'case_id')::uuid;
  if not (crm_can_request(rid) or crm_can_case(cid)) then raise exception 'CRM:Accès refusé.'; end if;
  if p->>'kind' in ('cv','report') and not crm_can_request(rid) then raise exception 'CRM:Accès refusé.'; end if;
  if cid is not null and not exists(select 1 from crm_cases where id=cid and request_id=rid and crm_can_case(id) and status not in ('completed','cancelled')) then raise exception 'CRM:Dossier invalide.'; end if;
  if cid is not null and exists(select 1 from crm_outbox where case_id=cid and category='delivery' and status in ('queued','sending','manual')) then raise exception 'CRM:Livraison déjà en transmission. Attendez sa réconciliation.'; end if;
  if p->>'kind'='report' and exists(select 1 from crm_outbox where request_id=rid and category='report' and status not in ('cancelled','failed')) then raise exception 'CRM:Rapport déjà en transmission.'; end if;
  insert into crm_documents(request_id,case_id,kind,name,path,mime,size,uploaded_by) values(rid,cid,p->>'kind',p->>'filename',u.path,p->>'mime',(p->>'size')::integer,auth.uid()) returning id into d;
  if p->>'kind'='report' then update crm_requests set report_approved_at=null,status='review' where id=rid; end if;
  if cid is not null then update crm_cases set approved_at=null where id=cid; end if;
  update crm_uploads set result=jsonb_build_object('id',d) where id=u.id;
  perform crm_audit(rid,cid,'document_upload',p->>'kind');
  return jsonb_build_object('id',d);
end $$;

-- All interactive writes pass through this narrow command interface; tables have SELECT-only RLS grants.
create function public.crm_action(p_action text,p_id uuid default null,p_data jsonb default '{}') returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare role_name text=crm_role(); r crm_requests; c crm_cases; pr crm_proposals; o service_orders; d crm_documents; m crm_outbox; rid uuid; cid uuid; target uuid; raw text; link text; ids uuid[]; begin
  if role_name is null then raise exception 'CRM:Accès refusé.'; end if;
  if p_action='contact_optout' then
    if role_name not in ('admin','sales') or not crm_can_contact(p_id) then raise exception 'CRM:Accès refusé.'; end if;
    update crm_contacts set marketing=false,marketing_opted_out_at=now() where id=p_id;
    update crm_outbox set status='cancelled' where category='reminder' and status in ('queued','failed','manual') and request_id in(select id from crm_requests where contact_id=p_id);
    insert into crm_activity_logs(request_id,actor_id,action) select id,auth.uid(),'contact_optout' from crm_requests where contact_id=p_id;
    return '{}';
  end if;
  if p_action='member_save' then
    if role_name<>'admin' then raise exception 'CRM:Accès refusé.'; end if;
    if p_data->>'role' not in ('admin','sales','production') or length(p_data->>'name') not between 1 and 150 then raise exception 'CRM:Membre invalide.'; end if;
    perform pg_advisory_xact_lock(987123);
    if p_id=auth.uid() and (p_data->>'role'<>'admin' or not (p_data->>'active')::boolean) then raise exception 'CRM:Votre propre accès administrateur doit être conservé.'; end if;
    insert into crm_members(user_id,name,role,active) values(p_id,p_data->>'name',p_data->>'role',coalesce((p_data->>'active')::boolean,true)) on conflict(user_id) do update set name=excluded.name,role=excluded.role,active=excluded.active;
    perform crm_audit(null,null,p_action,p_id::text); return '{}';
  elsif p_action='settings_save' then
    if role_name<>'admin' then raise exception 'CRM:Accès refusé.'; end if;
    if not (p_data ?& array['timezone','days','start','end','diagnostic_hours','production_hours','promise_enabled','retention_days','reminder_days','auto_assign']) or (p_data->>'start')::int<0 or (p_data->>'end')::int>24 or (p_data->>'start')::int >= (p_data->>'end')::int or (p_data->>'diagnostic_hours')::numeric not between 1 and 72 or (p_data->>'production_hours')::numeric not between 1 and 720 or (p_data->>'retention_days')::int not between 7 and 3650 or (p_data->>'reminder_days')::int not between 1 and 30 or jsonb_array_length(p_data->'days')=0 or exists(select 1 from jsonb_array_elements_text(p_data->'days') x where x::int not between 0 and 6) or not exists(select 1 from pg_timezone_names where name=p_data->>'timezone') then raise exception 'CRM:Paramètres invalides.'; end if;
    update crm_settings set value=p_data,updated_at=now() where id='business'; perform crm_audit(null,null,p_action); return '{}';
  elsif p_action='notification_read' then
    update crm_notifications set read_at=now() where id=p_id and member_id=auth.uid(); return '{}';
  elsif p_action='task_done' then
    update crm_tasks set status='done' where id=p_id and (role_name='admin' or owner_id=auth.uid()); return '{}';
  elsif p_action in ('request_save','report_save','report_approve','report_send','note','proposal_create') then
    select * into r from crm_requests where id=p_id for update; rid=r.id;
    if rid is null or not crm_can_request(rid) then raise exception 'CRM:Accès refusé.'; end if;
    if p_action='request_save' then
      if p_data ? 'owner_id' then
        if role_name<>'admin' then raise exception 'CRM:Affectation réservée à l’administration.'; end if;
        target=nullif(p_data->>'owner_id','')::uuid;
        if target is not null and not exists(select 1 from crm_members where user_id=target and active) then raise exception 'CRM:Responsable inactif.'; end if;
        update crm_requests set owner_id=target where id=rid;
        update crm_tasks set owner_id=target where request_id=rid and case_id is null and status='open';
        if target is not null then insert into crm_notifications(member_id,title,request_id,dedupe_key) values(target,'Diagnostic attribué',rid,'assigned:'||rid||':'||target||':'||gen_random_uuid()); end if;
      end if;
      if p_data ? 'status' and p_data->>'status' is distinct from r.status and p_data->>'status' not in ('new','assigned','analyzing','review','closed') then raise exception 'CRM:Utilisez les actions de validation et d’envoi pour avancer.'; end if;
      update crm_requests set status=coalesce(p_data->>'status',status),priority=coalesce(p_data->>'priority',priority),due_at=coalesce(nullif(p_data->>'due_at','')::timestamptz,due_at) where id=rid;
    elsif p_action='report_save' then
      if exists(select 1 from crm_outbox where request_id=rid and category='report' and status not in ('failed','cancelled')) then raise exception 'CRM:Rapport déjà en transmission.'; end if;
      update crm_requests set report_text=left(p_data->>'text',20000),report_approved_at=null,status='review' where id=rid;
    elsif p_action='report_approve' then
      if role_name<>'admin' then raise exception 'CRM:Validation administrateur requise.'; end if;
      select * into d from crm_documents where request_id=rid and kind='report' and deleted_at is null order by created_at desc limit 1;
      if d.id is null then raise exception 'CRM:Importez le rapport PDF final.'; end if;
      update crm_documents set approved_at=now(),approved_by=auth.uid() where id=d.id;
      update crm_requests set report_approved_at=now() where id=rid;
    elsif p_action='report_send' then
      if role_name not in ('admin','sales') or r.report_approved_at is null then raise exception 'CRM:Rapport approuvé requis.'; end if;
      select array[id] into ids from crm_documents where request_id=rid and kind='report' and approved_at is not null and deleted_at is null order by created_at desc limit 1;
      if ids is null then raise exception 'CRM:Rapport PDF approuvé requis.'; end if;
      perform crm_queue(rid,null,'report','report:'||rid,'Votre diagnostic CV TALENTIQUES','Veuillez trouver votre rapport de diagnostic en pièce jointe. Notre équipe reste disponible pour échanger sur ces recommandations.',ids);
    elsif p_action='note' then
      if length(trim(coalesce(p_data->>'text','')))=0 then raise exception 'CRM:Note vide.'; end if;
    elsif p_action='proposal_create' then
      if role_name not in ('admin','sales') then raise exception 'CRM:Accès commercial requis.'; end if;
      insert into crm_proposals(request_id,service_id,amount,currency,inclusions,message,conditions,student_evidence,expires_at,reminder_opt_in)
      values(rid,p_data->>'service_id',(p_data->>'amount')::numeric,p_data->>'currency',left(p_data->>'inclusions',4000),left(p_data->>'message',4000),left(p_data->>'conditions',2000),left(p_data->>'student_evidence',500),nullif(p_data->>'expires_at','')::timestamptz,coalesce((p_data->>'reminder_opt_in')::boolean,false)) returning id into target;
      perform crm_audit(rid,null,p_action); return jsonb_build_object('id',target);
    end if;
    perform crm_audit(rid,null,p_action,case when p_action='note' then p_data->>'text' else '' end); return '{}';
  elsif p_action in ('proposal_approve','proposal_send','proposal_reject') then
    select * into pr from crm_proposals where id=p_id for update; rid=pr.request_id;
    if pr.id is null or role_name not in ('admin','sales') or not crm_can_request(rid) then raise exception 'CRM:Accès refusé.'; end if;
    if p_action='proposal_reject' then
      if pr.status='converted' then raise exception 'CRM:Proposition déjà convertie.'; end if;
      update crm_proposals set status='rejected' where id=pr.id;
      update crm_outbox set status='cancelled' where proposal_id=pr.id and status in ('queued','failed','manual');
      update service_orders set checkout_expires_at=now() where crm_proposal_id=pr.id and status<>'paid';
    elsif p_action='proposal_approve' then
      if role_name<>'admin' then raise exception 'CRM:Approbation admin requise, y compris pour les exceptions tarifaires.'; end if;
      if pr.status<>'draft' then raise exception 'CRM:Seul un brouillon peut être approuvé.'; end if;
      if pr.service_id='student-jobseeker' and coalesce(length(trim(pr.student_evidence)),0)<5 then raise exception 'CRM:Renseignez la preuve d’éligibilité étudiant / demandeur d’emploi.'; end if;
      if pr.expires_at is not null and pr.expires_at<now() then raise exception 'CRM:Proposition expirée.'; end if;
      update crm_proposals set status='approved',approved_by=auth.uid(),approved_at=now() where id=pr.id;
    else
      if pr.status<>'approved' or (pr.expires_at is not null and pr.expires_at<now()) then raise exception 'CRM:Proposition approuvée et valide requise.'; end if;
      if exists(select 1 from crm_outbox where proposal_id=pr.id and category='proposal') then return '{}'; end if;
      select * into r from crm_requests where id=rid;
      raw=encode(gen_random_bytes(32),'hex');
      insert into service_orders(service_id,market,service_name,amount,currency,status,customer_name,customer_email,crm_request_id,crm_proposal_id,checkout_hash,checkout_expires_at)
      select pr.service_id,r.market,pr.inclusions,pr.amount,pr.currency,'pending',ct.name,ct.email,rid,pr.id,encode(digest(raw,'sha256'),'hex'),coalesce(pr.expires_at,now()+interval '7 days') from crm_contacts ct where ct.id=r.contact_id returning * into o;
      link=(select site_url from crm_settings where id='business')||'/paiement-service?order='||o.id||'&token='||raw;
      perform crm_queue(rid,null,'proposal','proposal:'||pr.id,'Votre proposition personnalisée TALENTIQUES',pr.message||E'\n\n'||pr.inclusions||E'\n\n'||pr.amount||' '||pr.currency||E'\n'||pr.conditions||E'\n\nPaiement sécurisé : '||link,'{}',pr.id);
    end if;
    perform crm_audit(rid,null,p_action); return '{}';
  elsif p_action in ('case_save','case_ready','case_submit','case_approve','case_deliver','case_note','case_request_info','case_reopen') then
    select * into c from crm_cases where id=p_id for update; cid=c.id; rid=c.request_id;
    if cid is null or not crm_can_case(cid) then raise exception 'CRM:Accès refusé.'; end if;
    if p_action='case_reopen' then
      if role_name<>'admin' or c.status<>'completed' then raise exception 'CRM:Réouverture admin d’un dossier finalisé requise.'; end if;
      update crm_cases set status='corrections',revision=revision+1,approved_at=null where id=cid;
      update crm_tasks set status='open' where case_id=cid;
      perform crm_audit(rid,cid,p_action); return '{}';
    end if;
    if c.status in ('completed','cancelled') then raise exception 'CRM:Dossier clôturé.'; end if;
    if p_action='case_save' then
      if role_name<>'admin' then raise exception 'CRM:Supervision administrateur requise.'; end if;
      target=nullif(p_data->>'owner_id','')::uuid;
      if target is not null and not exists(select 1 from crm_members where user_id=target and active and role in ('admin','production')) then raise exception 'CRM:Responsable production invalide.'; end if;
      if p_data ? 'status' and p_data->>'status' is distinct from c.status and p_data->>'status' not in ('missing_info','unassigned','production','corrections','cancelled') then raise exception 'CRM:Transition réservée à une action de validation.'; end if;
      if p_data->>'status'='production' and (c.ready_at is null or target is null) then raise exception 'CRM:Informations vérifiées et responsable requis.'; end if;
      if exists(select 1 from crm_outbox where case_id=cid and category='delivery' and status in ('queued','sending','manual')) then raise exception 'CRM:Livraison en transmission : réconciliez cet envoi avant modification.'; end if;
      update crm_cases set owner_id=target,status=coalesce(p_data->>'status',status),priority=coalesce(p_data->>'priority',priority),due_at=coalesce(nullif(p_data->>'due_at','')::timestamptz,due_at),instructions=coalesce(p_data->>'instructions',instructions),approved_at=case when p_data->>'status'='corrections' then null else approved_at end where id=cid;
      update crm_tasks set owner_id=target,due_at=coalesce(nullif(p_data->>'due_at','')::timestamptz,due_at) where case_id=cid and status='open';
      if target is not null then insert into crm_notifications(member_id,title,case_id,dedupe_key) values(target,'Mission attribuée',cid,'mission:'||cid||':'||gen_random_uuid()); end if;
    elsif p_action='case_ready' then
      if role_name<>'admin' or c.ready_at is not null then raise exception 'CRM:Informations déjà validées ou accès refusé.'; end if;
      if exists(select 1 from service_orders where id=c.order_id and service_id='student-jobseeker') and length(trim(coalesce(p_data->>'student_evidence','')))<5 then raise exception 'CRM:Preuve d’éligibilité étudiant / demandeur d’emploi requise avant production.'; end if;
      update crm_cases set ready_at=now(),eligibility_evidence=coalesce(p_data->>'student_evidence',''),due_at=(p_data->>'due_at')::timestamptz,status=case when owner_id is null then 'unassigned' else 'production' end where id=cid;
      update crm_tasks set due_at=(p_data->>'due_at')::timestamptz where case_id=cid;
    elsif p_action='case_submit' then
      if c.ready_at is null or c.owner_id is null then raise exception 'CRM:Complétez les informations et l’affectation.'; end if;
      if exists(select 1 from unnest(array['cv_word','cv_pdf','letter','linkedin','tracker']) k where not exists(select 1 from crm_documents cd where cd.case_id=cid and cd.kind=k and cd.deleted_at is null)) then raise exception 'CRM:Les cinq livrables sont requis.'; end if;
      update crm_cases set status='quality',approved_at=null where id=cid;
      insert into crm_notifications(member_id,title,case_id,dedupe_key) select user_id,'Livrables à valider',cid,'quality:'||cid||':'||user_id||':'||gen_random_uuid() from crm_members where active and role='admin';
    elsif p_action='case_approve' then
      if role_name<>'admin' or c.status<>'quality' then raise exception 'CRM:Contrôle qualité admin requis.'; end if;
      update crm_documents set approved_at=now(),approved_by=auth.uid() where id in (select distinct on(kind) id from crm_documents where case_id=cid and deleted_at is null and kind in ('cv_word','cv_pdf','letter','linkedin','tracker') order by kind,created_at desc);
      update crm_cases set status='delivery',approved_at=now() where id=cid;
    elsif p_action='case_deliver' then
      if role_name<>'admin' or c.approved_at is null or c.status<>'delivery' then raise exception 'CRM:Autorisation de livraison admin requise.'; end if;
      select array_agg(id) into ids from (select distinct on(kind) id from crm_documents where case_id=cid and deleted_at is null and approved_at is not null and kind in ('cv_word','cv_pdf','letter','linkedin','tracker') order by kind,created_at desc) docs;
      if coalesce(array_length(ids,1),0)<5 then raise exception 'CRM:Livrables approuvés incomplets.'; end if;
      perform crm_queue(rid,cid,'delivery','delivery:'||cid||':'||c.revision,'Vos livrables TALENTIQUES','Veuillez trouver vos livrables validés en pièces jointes. Répondez à cet email pour demander les corrections nécessaires jusqu’à finalisation.',ids);
    elsif p_action='case_request_info' then
      if role_name<>'admin' or length(trim(coalesce(p_data->>'text','')))<5 then raise exception 'CRM:Précisez les informations demandées.'; end if;
      raw=encode(gen_random_bytes(32),'hex');
      insert into crm_info_links(case_id,token_hash) values(cid,encode(digest(raw,'sha256'),'hex')) returning id into target;
      perform crm_queue(rid,cid,'missing_info','info:'||target,'Informations nécessaires à votre accompagnement',left(p_data->>'text',3000)||E'\n\nComplétez votre dossier sous 3 jours : '||(select site_url from crm_settings where id='business')||'/completer-dossier?token='||raw);
    end if;
    perform crm_audit(rid,cid,p_action,case when p_action in ('case_note','case_save') then left(coalesce(p_data->>'text',p_data->>'instructions',''),4000) else '' end); return '{}';
  elsif p_action in ('manual_payment','payment_refund') then
    if role_name<>'admin' then raise exception 'CRM:Accès refusé.'; end if;
    select * into o from service_orders where id=p_id for update;
    if o.crm_request_id is null or length(trim(coalesce(p_data->>'reference','')))<8 then raise exception 'CRM:Référence de vérification réelle requise.'; end if;
    if p_action='manual_payment' then
      if p_data->>'currency' is distinct from o.currency or (p_data->>'amount')::numeric is distinct from o.amount or length(trim(coalesce(p_data->>'beneficiary','')))<3 then raise exception 'CRM:Montant, devise et bénéficiaire vérifiés requis.'; end if;
      perform crm_confirm_payment(o.id,'manual:'||gen_random_uuid(),null,true,p_data->>'reference'||' / bénéficiaire: '||p_data->>'beneficiary');
    else
      update service_orders set status='refunded',manual_reference=p_data->>'reference' where id=o.id;
      update crm_cases set status='cancelled' where order_id=o.id;
      update crm_outbox set status='cancelled' where request_id=o.crm_request_id and category in ('reminder','delivery') and status in ('queued','failed','manual');
    end if;
    perform crm_audit(o.crm_request_id,null,p_action,p_data->>'reference'); return '{}';
  elsif p_action in ('message_retry','message_manual') then
    select * into m from crm_outbox where id=p_id for update;
    if m.id is null or role_name not in ('admin','sales') or not crm_can_request(m.request_id) then raise exception 'CRM:Accès refusé.'; end if;
    if p_action='message_retry' then
      if m.status not in ('failed','manual') or m.attempts>=5 then raise exception 'CRM:Reprise non autorisée.'; end if;
      update crm_outbox set status='queued',available_at=now(),error=null where id=m.id;
    else
      if m.status not in ('failed','manual') or length(trim(coalesce(p_data->>'reference','')))<8 then raise exception 'CRM:Référence de transmission manuelle requise.'; end if;
      perform crm_finish_message(m.id,'manual_sent',p_data->>'reference',null);
    end if;
    perform crm_audit(m.request_id,m.case_id,p_action); return '{}';
  end if;
  raise exception 'CRM:Action inconnue.';
end $$;

create function public.crm_confirm_payment(p_order uuid,p_event text,p_capture text,p_manual boolean default false,p_reference text default null) returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare o service_orders; cid uuid; owner uuid; begin
  select * into o from service_orders where id=p_order for update;
  if o.crm_request_id is null then raise exception 'CRM:Commande CRM introuvable.'; end if;
  if o.status='refunded' then raise exception 'CRM:Commande remboursée.'; end if;
  insert into crm_payment_events(event_id,order_id,event_type) values(p_event,o.id,case when p_manual then 'manual' else 'capture' end) on conflict(event_id) do nothing;
  if (select order_id from crm_payment_events where event_id=p_event)<>o.id then raise exception 'CRM:Événement déjà rapproché.'; end if;
  update service_orders set status='paid',paid_at=coalesce(paid_at,now()),paypal_capture_id=coalesce(paypal_capture_id,p_capture),manual_reference=coalesce(manual_reference,p_reference) where id=o.id;
  if (select (value->>'auto_assign')::boolean from crm_settings where id='business') then
    perform pg_advisory_xact_lock(987124);
    select m.user_id into owner from crm_members m left join crm_cases c on c.owner_id=m.user_id and c.status not in ('completed','cancelled') where m.active and m.role='production' group by m.user_id order by count(c.id),m.user_id limit 1;
  end if;
  insert into crm_cases(order_id,request_id,owner_id) values(o.id,o.crm_request_id,owner) on conflict(order_id) do nothing returning id into cid;
  if cid is null then select id into cid from crm_cases where order_id=o.id; end if;
  insert into crm_tasks(request_id,case_id,owner_id,title,dedupe_key) select o.crm_request_id,cid,owner,k,'case:'||cid||':'||k from unnest(array['CV Word','CV PDF','Lettre de motivation','Optimisation LinkedIn','Tableau de suivi']) k on conflict(dedupe_key) do nothing;
  update crm_requests set status='converted' where id=o.crm_request_id;
  update crm_proposals set status='converted' where id=o.crm_proposal_id;
  update crm_outbox set status='cancelled' where request_id=o.crm_request_id and category='reminder' and status in ('queued','failed','manual');
  perform crm_queue(o.crm_request_id,cid,'payment','payment:'||o.id,'Paiement confirmé — TALENTIQUES','Votre paiement est confirmé. Le délai de 48–72 heures ouvrées commence après réception et vérification des informations nécessaires. Notre équipe vous contactera si votre dossier est incomplet.');
  if owner is not null then insert into crm_notifications(member_id,title,case_id,dedupe_key) values(owner,'Nouvelle mission payée à compléter',cid,'paid:'||o.id) on conflict(dedupe_key) do nothing; end if;
  if not exists(select 1 from crm_activity_logs where request_id=o.crm_request_id and action='payment_confirm') then perform crm_audit(o.crm_request_id,cid,'payment_confirm'); end if;
  return cid;
end $$;

create function public.crm_finish_message(p_id uuid,p_status text,p_provider text,p_error text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare m crm_outbox; begin
  select * into m from crm_outbox where id=p_id for update;
  if m.status in ('accepted','manual_sent','cancelled') then return; end if;
  if p_status not in ('accepted','failed','manual','manual_sent') then raise exception 'CRM:État d’envoi invalide.'; end if;
  update crm_outbox set status=p_status,provider_id=p_provider,error=p_error,accepted_at=case when p_status in ('accepted','manual_sent') then now() end,available_at=now()+make_interval(mins=>least(60,power(2,attempts)::int)) where id=p_id;
  if p_status not in ('accepted','manual_sent') then return; end if;
  if m.category='report' then
    update crm_requests set status=case when status in ('new','assigned','analyzing','review') then 'report_sent' else status end,report_sent_at=coalesce(report_sent_at,now()) where id=m.request_id;
    update crm_tasks set status='done' where dedupe_key='intake:'||m.request_id;
    insert into crm_tasks(request_id,owner_id,title,dedupe_key,due_at) select id,owner_id,'Préparer une proposition personnalisée','proposal:'||id,now()+interval '1 day' from crm_requests where id=m.request_id on conflict(dedupe_key) do nothing;
  elsif m.category='proposal' then
    update crm_proposals set status=case when status='approved' then 'proposal_sent' else status end,sent_at=coalesce(sent_at,now()) where id=m.proposal_id;
    update crm_requests set status=case when status<>'converted' then 'proposal_sent' else status end where id=m.request_id;
  elsif m.category='delivery' then
    update crm_cases set status='completed',delivered_at=now() where id=m.case_id and status='delivery';
    update crm_tasks set status='done' where case_id=m.case_id;
  end if;
  perform crm_audit(m.request_id,m.case_id,'message_'||p_status,m.category);
end $$;

create function public.crm_claim_messages() returns setof public.crm_outbox language plpgsql security definer set search_path=public,pg_temp as $$ begin
  -- Lost responses cannot be retried past Resend's 24h idempotency retention without human reconciliation.
  update crm_outbox set status='manual',error='Résultat ambigu ancien : vérifier le fournisseur avant tout nouvel envoi.' where status in ('sending','failed','queued') and locked_at<now()-interval '23 hours';
  return query with claim as (select id from crm_outbox where ((status in ('queued','failed') and attempts<5 and available_at<=now()) or (status='sending' and locked_at<now()-interval '10 minutes' and locked_at>now()-interval '23 hours')) order by available_at for update skip locked limit 5)
  update crm_outbox m set status='sending',attempts=attempts+1,locked_at=coalesce(locked_at,now()) from claim where m.id=claim.id returning m.*;
end $$;

create function public.crm_sweep() returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare pr crm_proposals; days integer; begin
  select (value->>'reminder_days')::int into days from crm_settings where id='business';
  update crm_proposals set status='expired' where expires_at<now() and status in ('draft','approved','proposal_sent');
  update crm_outbox m set status='cancelled' where category in ('reminder','proposal') and status in ('queued','failed','manual') and exists(select 1 from crm_proposals p where p.id=m.proposal_id and p.status in ('rejected','expired','converted'));
  for pr in select p.* from crm_proposals p join crm_requests r on r.id=p.request_id join crm_contacts ct on ct.id=r.contact_id where p.status='proposal_sent' and p.reminder_opt_in and ct.marketing_opted_out_at is null and p.sent_at<now()-make_interval(days=>days) and not exists(select 1 from service_orders o where o.crm_request_id=p.request_id and o.status='paid') and exists(select 1 from crm_consents s where s.request_id=r.id and s.marketing) loop
    perform crm_queue(pr.request_id,null,'reminder','reminder:'||pr.id,'Votre proposition TALENTIQUES','Souhaitez-vous poursuivre votre accompagnement ? Vous pouvez répondre à notre proposition ou nous indiquer que vous ne souhaitez plus être relancé.','{}',pr.id);
  end loop;
  insert into crm_notifications(member_id,title,request_id,dedupe_key)
  select owner_id,case when due_at<now() then 'Diagnostic en retard' else 'Diagnostic à échéance proche' end,id,'due-request:'||id||':'||due_at::text from crm_requests where owner_id is not null and due_at<now()+interval '1 hour' and status in ('new','assigned','analyzing','review') on conflict(dedupe_key) do nothing;
  insert into crm_notifications(member_id,title,case_id,dedupe_key)
  select owner_id,case when due_at<now() then 'Livraison en retard' else 'Livraison à échéance proche' end,id,'due-case:'||id||':'||due_at::text from crm_cases where owner_id is not null and due_at<now()+interval '3 hours' and status not in ('completed','cancelled') on conflict(dedupe_key) do nothing;
  insert into crm_notifications(member_id,title,case_id,dedupe_key)
  select m.user_id,'Livraison en retard',c.id,'late-admin:'||c.id||':'||m.user_id||':'||c.due_at::text from crm_cases c cross join crm_members m where c.due_at<now() and c.status not in ('completed','cancelled') and m.active and m.role='admin' on conflict(dedupe_key) do nothing;
  delete from crm_rate_limits where window_at<now()-interval '1 day';
end $$;

create function public.crm_complete_info(p_hash text,p_text text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare l crm_info_links; r uuid; begin
  select * into l from crm_info_links where token_hash=p_hash and used_at is null and expires_at>now() for update;
  if l.id is null or length(trim(p_text)) not between 5 and 4000 then raise exception 'CRM:Lien expiré, déjà utilisé ou informations invalides.'; end if;
  update crm_info_links set used_at=now() where id=l.id;
  select request_id into r from crm_cases where id=l.case_id;
  perform crm_audit(r,l.case_id,'client_information',p_text);
  insert into crm_notifications(member_id,title,case_id,dedupe_key) select user_id,'Informations client reçues — à vérifier',l.case_id,'info-received:'||l.id||':'||user_id from crm_members where active and (role='admin' or user_id=(select owner_id from crm_cases where id=l.case_id));
end $$;

create function public.crm_refund_payment(p_capture text,p_event text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare o service_orders; begin
  select * into o from service_orders where paypal_capture_id=p_capture for update;
  if o.id is null or o.crm_request_id is null then return; end if;
  insert into crm_payment_events(event_id,order_id,event_type) values(p_event,o.id,'refund') on conflict(event_id) do nothing;
  if (select order_id from crm_payment_events where event_id=p_event)<>o.id then raise exception 'CRM:Événement déjà rapproché.'; end if;
  update service_orders set status='refunded' where id=o.id;
  update crm_cases set status='cancelled' where order_id=o.id;
  update crm_outbox set status='cancelled' where request_id=o.crm_request_id and category in ('reminder','delivery') and status in ('queued','failed','manual');
  perform crm_audit(o.crm_request_id,null,'payment_refund');
end $$;

create function public.crm_case_summaries(p_offset integer default 0,p_search text default '',p_status text default '',p_contact uuid default null) returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
  select coalesce(jsonb_agg(x),'[]') from (
    select c.*,o.service_id,ct.name as contact_name,ct.email as contact_email,r.objective,r.markets,r.contact_id,r.current_status,ct.linkedin
    from crm_cases c join crm_requests r on r.id=c.request_id join service_orders o on o.id=c.order_id join crm_contacts ct on ct.id=r.contact_id
    where crm_can_case(c.id) and (p_contact is null or ct.id=p_contact) and (p_search='' or ct.name ilike '%'||left(p_search,100)||'%' or ct.email ilike '%'||left(p_search,100)||'%') and (p_status='' or c.status=p_status)
    order by c.created_at desc limit 26 offset greatest(0,p_offset)
  ) x
$$;
create function public.crm_case_context(p_id uuid) returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
  select to_jsonb(x) from (select c.*,o.service_id,ct.name as contact_name,ct.email as contact_email,r.objective,r.markets,r.contact_id,r.current_status,ct.linkedin
  from crm_cases c join crm_requests r on r.id=c.request_id join service_orders o on o.id=c.order_id join crm_contacts ct on ct.id=r.contact_id where c.id=p_id and crm_can_case(c.id)) x
$$;
create function public.crm_search(p_query text) returns jsonb language sql stable security definer set search_path=public,pg_temp as $$
  select coalesce(jsonb_agg(x),'[]') from (
    select r.id,'requests' as kind,ct.name,r.objective,r.status from crm_requests r join crm_contacts ct on ct.id=r.contact_id
    where crm_can_request(r.id) and length(p_query)>1 and (ct.name ilike '%'||left(p_query,100)||'%' or ct.email ilike '%'||left(p_query,100)||'%' or r.objective ilike '%'||left(p_query,100)||'%')
    union all
    select c.id,'cases',ct.name,r.objective,c.status from crm_cases c join crm_requests r on r.id=c.request_id join crm_contacts ct on ct.id=r.contact_id
    where crm_can_case(c.id) and length(p_query)>1 and (ct.name ilike '%'||left(p_query,100)||'%' or ct.email ilike '%'||left(p_query,100)||'%' or r.objective ilike '%'||left(p_query,100)||'%') limit 12
  ) x
$$;
create function public.crm_dashboard(p_from timestamptz,p_to timestamptz) returns jsonb language sql stable security invoker set search_path=public,pg_temp as $$
  select jsonb_build_object(
    'requests',(select count(*) from crm_requests where created_at between p_from and p_to),
    'new_requests',(select count(*) from crm_requests where status='new'),
    'active_diagnostics',(select count(*) from crm_requests where kind='diagnostic' and status in ('new','assigned','analyzing','review')),
    'urgent',(select count(*) from crm_requests where due_at<now()+interval '1 hour' and status in ('new','assigned','analyzing','review')),
    'processed',(select count(*) from crm_requests where report_sent_at between p_from and p_to),
    'processing_hours',(select round(avg(extract(epoch from (report_sent_at-created_at))/3600)::numeric,1) from crm_requests where report_sent_at between p_from and p_to),
    'active_cases',(select count(*) from crm_cases where status not in ('completed','cancelled')),
    'late_cases',(select count(*) from crm_cases where due_at<now() and status not in ('completed','cancelled')),
    'delivered',(select count(*) from crm_cases where delivered_at between p_from and p_to),
    'proposals',case when crm_role() in ('admin','sales') then (select count(*) from crm_proposals where status in ('approved','proposal_sent')) else null end,
    'paid',case when crm_role() in ('admin','sales') then (select count(*) from service_orders where paid_at between p_from and p_to and status='paid' and crm_request_id is not null) else null end,
    'revenue',case when crm_role() in ('admin','sales') then (select coalesce(jsonb_agg(x),'[]') from (select currency,sum(amount) as amount from service_orders where status='paid' and paid_at between p_from and p_to and crm_request_id is not null group by currency) x) else null end,
    'conversion',case when crm_role() in ('admin','sales') then (select round(100.0*count(*) filter(where status='converted')/nullif(count(*),0),1) from crm_requests where created_at between p_from and p_to) else null end,
    'sources',case when crm_role() in ('admin','sales') then (select coalesce(jsonb_agg(x),'[]') from (select coalesce(nullif(utm->>'source',''),'Direct') as source,count(*) as leads,count(*) filter(where status='converted') as converted from crm_requests where created_at between p_from and p_to group by 1 order by count(*) desc limit 10) x) else null end,
    'workload',(select coalesce(jsonb_agg(x),'[]') from (select m.name,count(c.id) as active from crm_members m left join crm_cases c on c.owner_id=m.user_id and c.status not in ('completed','cancelled') where m.active and (crm_role()='admin' or m.user_id=auth.uid()) group by m.user_id,m.name) x)
  ) where crm_role() is not null
$$;
create function public.crm_retention_candidates() returns setof public.crm_documents language sql stable security definer set search_path=public,pg_temp as $$
  select d.* from crm_documents d join crm_requests r on r.id=d.request_id
  where d.deleted_at is null and d.created_at<now()-make_interval(days=>(select (value->>'retention_days')::int from crm_settings where id='business'))
  and (r.status='closed' or (r.status='converted' and exists(select 1 from crm_cases c where c.request_id=r.id) and not exists(select 1 from crm_cases c where c.request_id=r.id and c.status not in ('completed','cancelled'))))
  and not exists(select 1 from crm_outbox m where d.id=any(m.document_ids) and m.status in ('queued','failed','manual','sending')) limit 25
$$;

-- Prevent permissive default function EXECUTE privileges, including internal helpers.
do $$ declare f record; begin for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'crm_%' loop
  execute format('revoke all on function %s from public,anon,authenticated',f.signature);
  execute format('grant execute on function %s to service_role',f.signature);
end loop; end $$;
grant execute on function public.crm_role(),public.crm_can_request(uuid),public.crm_can_case(uuid),public.crm_can_contact(uuid),public.crm_action(text,uuid,jsonb),public.crm_add_document(uuid,text) to authenticated;
grant execute on function public.crm_case_summaries(integer,text,text,uuid),public.crm_case_context(uuid),public.crm_dashboard(timestamptz,timestamptz) to authenticated;
grant execute on function public.crm_search(text) to authenticated;
commit;
