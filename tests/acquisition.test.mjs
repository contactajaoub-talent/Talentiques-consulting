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

test('duplicate detection utility reports every matching identity without merging', () => {
  const matches = detectDuplicates([baseProspect], { linkedinUrl: 'linkedin.com/in/alice-demo', email: 'alice.demo@example.com', phone: '+15550000000' });
  assert.equal(matches.length, 1);
  assert.deepEqual(matches[0].fields, ['linkedin','email','phone']);
});

test('CSV parser supports quoted values and explicit mapping', () => {
  const parsed = parseCsv('Name,Email,Company\r\n"Doe, Alice",alice@example.com,"Example, Inc"');
  assert.deepEqual(parsed.rows[0], ['Doe, Alice','alice@example.com','Example, Inc']);
  assert.deepEqual(mapCsvRows(parsed.headers, parsed.rows, { Name:'first_name', Email:'email', Company:'company' })[0], { first_name:'Doe, Alice', email:'alice@example.com', company:'Example, Inc' });
});

test('database duplicate lookup is independent from the 500-row UI state', () => {
  const queries = source('src/lib/acquisition/queries.ts');
  assert.match(queries, /findDuplicates[\s\S]*selectRows\('prospects'/);
  assert.match(queries, /selectRows\('contact_methods'/);
  assert.match(queries, /getProspectsByIds/);
  assert.doesNotMatch(queries.match(/export async function findDuplicates[\s\S]*?export async function getDueToday/)?.[0] ?? '', /getAcquisitionState\(/);
});

test('prospect creation, safe merge and contact synchronization persist server-side', () => {
  const mutations = source('src/lib/acquisition/mutations.ts');
  assert.match(mutations, /createProspect[\s\S]*insertRows\('prospects'/);
  assert.match(mutations, /mergeProspects/);
  assert.match(mutations, /syncContacts/);
  assert.match(mutations, /updateRows\('contact_methods'/);
  assert.match(mutations, /findDuplicates[\s\S]*id/);
  assert.equal(statusToDb['A répondu'], 'replied');
});

test('repository can page through more than the first Supabase response window', () => {
  const repository = source('src/lib/acquisition/repository.ts');
  assert.match(repository, /selectAllRows/);
  assert.match(repository, /offset/);
  assert.match(repository, /while \(true\)/);
});

test('task completion, campaign persistence and server route protection are present', () => {
  const mutations = source('src/lib/acquisition/mutations.ts');
  const route = source('src/app/api/acquisition/route.ts');
  assert.match(mutations, /completeTask[\s\S]*completed_at/);
  assert.match(mutations, /saveCampaign[\s\S]*campaigns/);
  assert.match(route, /getAdminSession/);
  assert.match(route, /status: 401/);
  assert.match(route, /action === 'complete_task'/);
});

test('CSV export resolves the linked campaign rather than substituting market', () => {
  const route = source('src/app/api/acquisition/export/route.ts');
  assert.match(route, /campaignNames/);
  assert.match(route, /campaignNames\.get\(item\.campaignId\)/);
});

test('service-role remains confined to server-only repository', () => {
  const repository = source('src/lib/acquisition/repository.ts');
  const provider = source('src/components/acquisition/AcquisitionProvider.tsx');
  assert.match(repository, /import 'server-only'/);
  assert.match(repository, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(provider, /SUPABASE_SERVICE_ROLE_KEY/);
});
