-- OPTIONAL DEVELOPMENT/DEMO SEED ONLY. Do not run in production unless wanted.
-- Uses example.com and fictional LinkedIn URLs; no real personal contact data.

insert into acquisition.data_sources (name, source_type) values
  ('Recherche LinkedIn démo','linkedin'), ('Import manuel démo','manual')
on conflict (name) do nothing;

insert into acquisition.campaigns (name, market, language, product, status, currency) values
  ('Canada FR','Canada FR','FR','Pack Carrière 360','active','CAD'),
  ('Canada EN','Canada EN','EN','CV ATS Premium','active','CAD'),
  ('Belgique','Belgique','FR','Optimisation LinkedIn','active','EUR'),
  ('Suisse','Suisse','FR','Coaching Entretien','active','CHF'),
  ('Luxembourg','Luxembourg','FR','Pack Carrière 360','paused','EUR')
on conflict (name) do nothing;

insert into acquisition.prospects (first_name,last_name,country,city,language,job_title,linkedin_url,source_label,score,segment,market,active_search,potential_product,status,next_action_label,next_action_at,next_action_type,task_status,owner_email)
values
  ('Amélie','Gagnon','Canada','Montréal','FR','Talent Acquisition Partner','linkedin.com/in/talentiques-demo-amelie','LinkedIn démo',92,'Talent à forte intention','Canada FR',true,'Pack Carrière 360','to_contact','Envoyer le premier message',now() + interval '2 hours','linkedin','todo','owner@example.com'),
  ('Daniel','Brooks','Canada','Toronto','EN','Product Operations Manager','linkedin.com/in/talentiques-demo-daniel','Import manuel démo',87,'Cadre confirmé','Canada EN',true,'CV ATS Premium','contacted','Relancer avec un cas client',now() + interval '1 day','follow_up','todo','owner@example.com'),
  ('Sophie','Lambert','Belgique','Bruxelles','FR','HR Business Partner','linkedin.com/in/talentiques-demo-sophie','LinkedIn démo',82,'Cadre confirmé','Belgique',false,'Optimisation LinkedIn','replied','Traiter la réponse',now() + interval '3 hours','email','todo','owner@example.com')
on conflict do nothing;

insert into acquisition.contact_methods (prospect_id,type,value,normalized_value,is_primary,verification_status,source_label)
select id,'email',lower(first_name)||'.'||lower(last_name)||'@example.com',lower(first_name)||'.'||lower(last_name)||'@example.com',true,'verified','Donnée fictive'
from acquisition.prospects where linkedin_url like 'linkedin.com/in/talentiques-demo-%'
on conflict do nothing;
