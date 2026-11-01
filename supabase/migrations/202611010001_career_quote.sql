-- Extend the existing CRM intake. No new table, bucket, payment or automatic message.
begin;

alter table public.crm_requests drop constraint crm_requests_kind_check;
alter table public.crm_requests add constraint crm_requests_kind_check
  check (kind in ('diagnostic', 'service', 'quote'));
alter table public.crm_requests drop constraint crm_requests_service_id_check;
alter table public.crm_requests add constraint crm_requests_service_id_check
  check (service_id in ('professional-profile', 'student-jobseeker', 'career-a-z'));
alter table public.crm_requests add column intake_data jsonb not null default '{}';

-- The same signed upload capability is locked before committing. A retry returns the original result.
create function public.crm_commit_career_quote(p_upload uuid, p_hash text, p_due timestamptz)
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare u crm_uploads; p jsonb; ct uuid; r uuid; d uuid; v_result jsonb;
begin
  select * into u from crm_uploads where id=p_upload and token_hash=p_hash for update;
  if u.id is null or u.member_id is not null or u.payload->>'kind' is distinct from 'quote' then
    raise exception 'CRM:Référence de devis invalide.';
  end if;
  if u.result is not null then return u.result; end if;
  if u.expires_at<now() then raise exception 'CRM:Envoi expiré. Recommencez.'; end if;
  p=u.payload;
  if p->>'service_id' is distinct from 'career-a-z' or coalesce(p->>'market','') not in ('fr','en')
    or p->>'privacy' is distinct from 'true' or p->>'marketing' is distinct from 'false'
    or p->>'consent_version' is distinct from 'career-quote-2026-11-01'
    or jsonb_typeof(p->'details') is distinct from 'object' then
    raise exception 'CRM:Demande de devis invalide.';
  end if;
  insert into crm_contacts(email,name,phone,linkedin,marketing)
  values(p->>'email',p->>'name',p->>'phone',p->>'linkedin',false)
  on conflict(email) do update set updated_at=now() returning id into ct;
  -- Anonymous intake cannot overwrite an existing contact's identity or preferences.
  insert into crm_requests(contact_id,kind,service_id,market,current_status,objective,markets,notes,source,utm,status,due_at,intake_data)
  values(ct,'quote','career-a-z',p->>'market',p->>'current_status',p->>'objective',
    array(select jsonb_array_elements_text(p->'markets')),p->>'notes',p->>'source',
    jsonb_build_object('source',p->>'utm_source','medium',p->>'utm_medium','campaign',p->>'utm_campaign','content',p->>'utm_content','term',p->>'utm_term'),
    'new',p_due,p->'details') returning id into r;
  insert into crm_consents(request_id,privacy,marketing,version,source)
  values(r,true,false,p->>'consent_version',p->>'source');
  insert into crm_documents(request_id,kind,name,path,mime,size)
  values(r,'cv',p->>'filename',u.path,p->>'mime',(p->>'size')::integer) returning id into d;
  insert into crm_tasks(request_id,title,due_at,dedupe_key)
  values(r,'Étudier le profil et préparer le devis carrière de A à Z',p_due,'intake:'||r);
  perform crm_audit(r,null,'intake','Devis carrière A à Z reçu — CV privé validé');
  v_result=jsonb_build_object('requestId',r,'documentId',d);
  update crm_uploads set result=v_result where id=u.id;
  return v_result;
end $$;

revoke all on function public.crm_commit_career_quote(uuid,text,timestamptz) from public,anon,authenticated;
grant execute on function public.crm_commit_career_quote(uuid,text,timestamptz) to service_role;
commit;
