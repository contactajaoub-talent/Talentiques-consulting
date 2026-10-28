-- OPTIONAL. Execute only after explicit production approval and successful staging validation.
-- Requires pg_cron, pg_net and Supabase Vault in the EXISTING project.
-- Create a Vault secret named talentiques_crm_cron_secret containing the same value as CRON_SECRET.
-- No credential is stored in this file or in cron.job.command.
create extension if not exists pg_cron;
create extension if not exists pg_net;
do $$ begin
  if not exists(select 1 from vault.decrypted_secrets where name='talentiques_crm_cron_secret') then
    raise exception 'Configure the talentiques_crm_cron_secret Vault secret first';
  end if;
end $$;
select cron.schedule('talentiques-crm-jobs','*/10 * * * *',$job$
  select net.http_get(
    url := (select site_url from public.crm_settings where id='business') || '/api/crm/jobs',
    headers := jsonb_build_object('Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='talentiques_crm_cron_secret' limit 1)),
    timeout_milliseconds := 60000
  );
$job$);
-- Pause, when authorized: select cron.unschedule('talentiques-crm-jobs');
