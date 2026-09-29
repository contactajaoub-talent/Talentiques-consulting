import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { parseCsv, mapCsvRows } from '../src/lib/acquisition/csv.ts';
import { detectDuplicates } from '../src/lib/acquisition/dedupe.ts';
import { normalizeEmail, normalizeLinkedIn, normalizePhone, statusToDb } from '../src/lib/acquisition/mappers.ts';

const root = new URL('../', import.meta.url);
const source = (path) => readFileSync(new URL(path, root), 'utf8');
const baseProspect = { id:'p1',firstName:'Alice',lastName:'Demo',country:'Canada',city:'Montréal',language:'FR',jobTitle:'Manager',company:'Example',linkedinUrl:'https://www.linkedin.com/in/alice-demo/',email:'Alice.Demo@Example.com',phone:'+1 (555) 000-0000',whatsapp:'',verificationStatus:'Vérifié',dataSource:'Test',source:'Test',linkedinRelation:'2e niveau',score:80,segment:'Test',market:'Canada FR',activeSearch:true,potentialProduct:'Test',tags:[],status:'Nouveau',lastAction:'',nextAction:'Qualifier',nextActionAt:new Date().toISOString(),nextActionType:'Qualification',taskStatus:'À faire',owner:'admin@example.com',notes:'',campaignId:'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),activities:[] };

test('normalization supports LinkedIn, email and phone deduplication', () => {
  assert.equal(normalizeLinkedIn('HTTPS://www.LinkedIn.com/in/Alice-Demo/'), 'linkedin.com/in/alice-demo');
  assert.equal(normalizeEmail(' Alice@Example.COM '), 'alice@example.com');
  assert.equal(normalizePhone('00 212 600-00-00-00'), '+212600000000');
});

test('duplicate detection reports every matching identity without merging', () => {
  const matches = detectDuplicates([baseProspect], { linkedinUrl: 'linkedin.com/in/alice-demo', email: 'alice.demo@example.com', phone: '+15550000000' });
  assert.equal(matches.length, 1); assert.deepEqual(matches[0].fields, ['linkedin','email','phone']);
});

test('CSV parser supports quoted values and explicit mapping', () => {
  const parsed = parseCsv('Name,Email,Company\r\n"Doe, Alice",alice@example.com,"Example, Inc"');
  assert.deepEqual(parsed.rows[0], ['Doe, Alice','alice@example.com','Example, Inc']);
  assert.deepEqual(mapCsvRows(parsed.headers, parsed.rows, { Name:'first_name', Email:'email', Company:'company' })[0], { first_name:'Doe, Alice', email:'alice@example.com', company:'Example, Inc' });
});

test('prospect creation and updates persist related activity, contacts and tasks', () => {
  const mutations = source('src/lib/acquisition/mutations.ts');
  assert.match(mutations, /createProspect[\s\S]*insertRows\('prospects'/);
  assert.match(mutations, /replaceContacts/); assert.match(mutations, /insertActivity/); assert.match(mutations, /upsertTask/);
  assert.equal(statusToDb['A répondu'], 'replied');
});

test('task completion, campaign persistence and server route protection are present', () => {
  const mutations = source('src/lib/acquisition/mutations.ts'); const route = source('src/app/api/acquisition/route.ts');
  assert.match(mutations, /completeTask[\s\S]*completed_at/); assert.match(mutations, /saveCampaign[\s\S]*campaigns/);
  assert.match(route, /getAdminSession/); assert.match(route, /status: 401/); assert.match(route, /action === 'complete_task'/);
});

test('service-role remains confined to server-only repository', () => {
  const repository = source('src/lib/acquisition/repository.ts'); const provider = source('src/components/acquisition/AcquisitionProvider.tsx');
  assert.match(repository, /import 'server-only'/); assert.match(repository, /SUPABASE_SERVICE_ROLE_KEY/); assert.doesNotMatch(provider, /SUPABASE_SERVICE_ROLE_KEY/);
});
