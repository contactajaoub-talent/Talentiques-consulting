import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { parseCsv, mapCsvRows } from '../src/lib/acquisition/csv.ts';
import { detectDuplicates } from '../src/lib/acquisition/dedupe.ts';
import { normalizeEmail, normalizeLinkedIn, normalizePhone, statusToDb } from '../src/lib/acquisition/mappers.ts';
import { automationKey, planNextAction, recommendOffer, sortProspectingQueue, validCurrency, validMarketId } from '../src/lib/acquisition/automation-engine.ts';

const root = new URL('../', import.meta.url);
const source = (path) => readFileSync(new URL(path, root), 'utf8');
const baseProspect = { id:'p1',firstName:'Alice',lastName:'Demo',country:'Canada',city:'Montréal',language:'FR',jobTitle:'Manager',company:'Example',linkedinUrl:'https://www.linkedin.com/in/alice-demo/',email:'Alice.Demo@Example.com',phone:'+1 (555) 000-0000',whatsapp:'',verificationStatus:'Vérifié',dataSource:'Test',source:'Test',linkedinRelation:'2e niveau',score:80,segment:'Test',marketId:'11111111-1111-4111-8111-111111111111',market:'Canada FR',activeSearch:true,potentialProduct:'Test',tags:[],status:'Nouveau',lastAction:'',nextAction:'Qualifier',nextActionAt:new Date().toISOString(),nextActionType:'Qualification',taskStatus:'À faire',owner:'admin@example.com',notes:'',campaignId:'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),activities:[] };

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

test('dynamic markets reject null and campaigns keep a distinct name and market reference', () => {
  assert.equal(validMarketId('null'), false);
  assert.equal(validMarketId('11111111-1111-4111-8111-111111111111'), true);
  const mutations = source('src/lib/acquisition/mutations.ts');
  assert.match(mutations, /name: campaign\.name\.trim\(\), market_id: campaign\.marketId/);
  assert.doesNotMatch(mutations, /market: campaign\.name/);
  assert.match(source('supabase/migrations/acquisition_phase_2b_core.sql'), /require_active_market/);
});

test('Acquisition accepts only EUR and USD and analytics never combines them', () => {
  assert.equal(validCurrency('EUR'), true);
  assert.equal(validCurrency('USD'), true);
  assert.equal(validCurrency('CAD'), false);
  assert.equal(validCurrency('CHF'), false);
  const analytics = source('src/components/acquisition/AnalyticsView.tsx');
  assert.match(analytics, /revenue\.EUR/);
  assert.match(analytics, /revenue\.USD/);
  assert.doesNotMatch(analytics, /campaigns\.reduce/);
});

test('catalog matching is deterministic and supports known audience signals', () => {
  const catalog = [{ id:'offer-1', name:'Alternance', slug:'kit-alternance-90-jours', category:'career', offerType:'bundle', audience:'Alternants', description:'', priceEur:30, priceUsd:null, active:true, salesEnabled:true, tags:[] }];
  assert.equal(recommendOffer({ profileType:'Alternant', yearsExperience:0, currentSituation:'', mainNeed:'', opportunityType:'', activeSearch:true }, catalog)?.offerId, 'offer-1');
  assert.match(source('supabase/acquisition_catalog_seed.sql'), /on conflict\(slug\) do update/i);
});

test('next-action rules schedule follow-ups, close won work and expose stable idempotency keys', () => {
  const settings = { timezone:'Africa/Casablanca', followupAfterContactDays:3, followupAfterOfferDays:4, automationEnabled:true, defaultOwner:'' };
  const contacted = planNextAction('prospect.contacted', settings, new Date('2026-09-28T09:00:00Z'));
  assert.equal(contacted.status, 'Contacté');
  assert.equal(contacted.cancelOpenTasks, true);
  assert.equal(planNextAction('prospect.won', settings).task, undefined);
  assert.equal(planNextAction('prospect.won', settings).cancelOpenTasks, true);
  assert.equal(automationKey('task.completed', 'p1', 'task-1'), automationKey('task.completed', 'p1', 'task-1'));
  assert.match(source('src/lib/acquisition/mutations.ts'), /idempotency_key/);
});

test('prospecting queue prioritizes replies, overdue work and high scores while excluding blocked contacts', () => {
  const now = new Date('2026-09-29T12:00:00Z');
  const rows = [
    { ...baseProspect, id:'high', score:95, status:'À contacter', nextActionAt:'2026-10-10T12:00:00Z' },
    { ...baseProspect, id:'reply', score:20, status:'A répondu', nextActionAt:'2026-10-10T12:00:00Z' },
    { ...baseProspect, id:'overdue', score:30, status:'Contacté', nextActionAt:'2026-09-28T12:00:00Z' },
    { ...baseProspect, id:'blocked', doNotContact:true },
  ];
  assert.deepEqual(sortProspectingQueue(rows, now).map((item) => item.id), ['reply','overdue','high']);
});

test('dashboard and analytics contain no fabricated revenue or template performance', () => {
  const dashboard = source('src/components/acquisition/DashboardView.tsx');
  const analytics = source('src/components/acquisition/AnalyticsView.tsx');
  assert.doesNotMatch(dashboard, /790\s*€/);
  assert.doesNotMatch(analytics, /templates\.length\s*-\s*index/);
});

test('phase 2B keeps legacy currencies repairable and validates currency writes with triggers', () => {
  const migration = source('supabase/migrations/acquisition_phase_2b_core.sql');
  assert.doesNotMatch(migration, /acquisition_campaign_currency_eur_usd/);
  assert.doesNotMatch(migration, /acquisition_order_currency_eur_usd/);
  assert.match(migration, /before insert or update of currency/);
  for (const table of ['campaigns','offers','orders','payments']) assert.match(migration, new RegExp(`array\\['campaigns','offers','orders','payments'\\]`));
  assert.match(migration, /require_eur_or_usd_currency/);
});

test('market backfill uses prospects and campaigns without guessing invalid null markets', () => {
  const migration = source('supabase/migrations/acquisition_phase_2b_core.sql');
  assert.match(migration, /from acquisition\.prospects[\s\S]*union[\s\S]*from acquisition\.campaigns/);
  assert.match(migration, /lower\(trim\(market\)\) <> 'null'/);
  assert.match(migration, /regexp_replace\(name, '\\s\+\(FR\|EN\)\$'/);
  assert.match(migration, /'Non renseigné'/);
  assert.doesNotMatch(migration, /delete from acquisition\.(prospects|campaigns)/i);
});

test('market trigger handles inserts, legacy repair, unlink prevention and inactive linked markets', () => {
  const migration = source('supabase/migrations/acquisition_phase_2b_core.sql');
  const detail = source('src/components/acquisition/ProspectDetailView.tsx');
  assert.match(migration, /if tg_op='INSERT'[\s\S]*if new\.market_id is null/);
  assert.match(migration, /old\.market_id is null and new\.market_id is null then return new/);
  assert.match(migration, /old\.market_id is not null and new\.market_id is null/);
  assert.match(migration, /old\.market_id is distinct from new\.market_id[\s\S]*where id=new\.market_id and active/);
  assert.match(migration, /Ordinary updates remain possible after a linked market is deactivated\.[\s\S]*where id=new\.market_id;/);
  assert.match(migration, /new\.market := market_name/);
  assert.match(migration, /before insert or update on acquisition/);
  assert.match(detail, /updateProspect\(id, \{ marketId: selected\.id, market: selected\.name \}/);
});

test('market names are unique case-insensitively and the migration contains no mojibake', () => {
  const migration = source('supabase/migrations/acquisition_phase_2b_core.sql');
  assert.match(migration, /create unique index if not exists acquisition_markets_name_normalized_uidx[\s\S]*lower\(btrim\(name\)\)/);
  assert.doesNotMatch(migration, /[ÃÂ]/);
  assert.match(migration, /Non renseigné/);
  assert.match(migration, /séparé/);
  assert.match(migration, /inféré/);
  assert.match(migration, /Libellé/);
});

test('phase 2B validates optional qualification values without making them mandatory', () => {
  const migration = source('supabase/migrations/acquisition_phase_2b_core.sql');
  assert.match(migration, /years_experience is null or years_experience >= 0/);
  assert.match(migration, /suggested_score is null or suggested_score between 0 and 100/);
  assert.match(migration, /priority is null or priority between 1 and 4/);
  assert.match(migration, /recommendation_confidence is null or recommendation_confidence between 0 and 1/);
  assert.match(migration, /quoted_amount is null or quoted_amount >= 0/);
});
