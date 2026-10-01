import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { buildCvDiagnosisLeadForm, submitCvDiagnosisLead } from '../src/lib/cv-analysis/crm.ts';
import { executeCvAnalysisRequest } from '../src/lib/cv-analysis/endpoint.ts';
import { fetchEscoContext } from '../src/lib/cv-analysis/esco.ts';
import { MAX_CV_FILE_SIZE, MAX_JOB_OFFER_LENGTH, parseCvInput } from '../src/lib/cv-analysis/input.ts';
import { calculateJobMatch } from '../src/lib/cv-analysis/job-match.ts';
import { analyzeCvWithModels, MAX_OUTPUT_TOKENS } from '../src/lib/cv-analysis/openai.ts';
import { recommendOffer } from '../src/lib/cv-analysis/recommendation.ts';
import { validateCvObservations } from '../src/lib/cv-analysis/schema.ts';
import { calculateAtsReadiness } from '../src/lib/cv-analysis/scoring.ts';

const complete = observations();
const incomplete = observations({
  document: { extraction_quality: 'poor', layout_assessable: false, layout_risk: 'high', heading_clarity: 'poor' },
  structure: { summary_section: false, experience_section: false, education_section: false, skills_section: false, languages_section: false },
  contact: { email_present: false, phone_present: false, linkedin_present: false },
  experience: { positions_count: 0, positions_with_dates: 0, positions_with_bullets: 0, bullet_count: 0, action_oriented_bullets: 0, quantified_bullets: 0, outcome_or_impact_bullets: 0 },
  skills: { explicit_section: false, detected: [], skills_supported_by_experience: [] },
  content: { word_count: 50, generic_phrase_count: 8, language_issue_count: 8, date_consistency_issue_count: 3, contradiction_count: 2 },
});

test('ATS readiness is deterministic and clamped to 0..100', () => {
  assert.deepEqual(calculateAtsReadiness(complete), calculateAtsReadiness(complete));
  for (const fixture of [complete, incomplete]) {
    const score = calculateAtsReadiness(fixture).total;
    assert.ok(score >= 0 && score <= 100);
  }
});

test('a structured resume scores higher than an incomplete resume', () => {
  assert.ok(calculateAtsReadiness(complete).total > calculateAtsReadiness(incomplete).total);
});

test('ATS breakdown respects exact category maxima', () => {
  assert.deepEqual(calculateAtsReadiness(complete).breakdown, {
    parseability: 20, structure: 15, experience: 20, impact: 15,
    skills: 15, contact: 5, consistency: 5, readability: 5,
  });
});

test('pasted text layout uses the neutral 3/5 layout allocation', () => {
  const pasted = observations({ document: { ...complete.document, layout_assessable: false } });
  assert.equal(calculateAtsReadiness(pasted).breakdown.parseability, 18);
});

test('recommended rewrite fixture never invents a metric', () => {
  assert.match(complete.issues[0].example_rewrite, /\[.*compléter\]/);
  assert.doesNotMatch(complete.issues[0].example_rewrite, /\+\d+%|\d+\s*€/);
});

test('gpt-6-luna is default and no fallback occurs for a healthy response', async () => {
  const calls = [];
  const result = await withApiKey(() => analyzeCvWithModels(modelOptions(), mockOpenAi(calls, [complete])));
  assert.equal(result.modelUsed, 'gpt-6-luna');
  assert.equal(result.fallbackUsed, false);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].model, 'gpt-6-luna');
  assert.equal(calls[0].reasoning.effort, 'low');
  assert.equal(calls[0].max_output_tokens, MAX_OUTPUT_TOKENS);
  assert.equal(calls[0].text.format.strict, true);
  assert.equal(calls[0].tools, undefined);
});

test('gpt-6-sol is used once only when confidence triggers fallback', async () => {
  const calls = [];
  const lowConfidence = observations({ confidence: 0.5 });
  const result = await withApiKey(() => analyzeCvWithModels(modelOptions(), mockOpenAi(calls, [lowConfidence, complete])));
  assert.equal(result.modelUsed, 'gpt-6-sol');
  assert.equal(result.fallbackUsed, true);
  assert.deepEqual(calls.map((call) => call.model), ['gpt-6-luna', 'gpt-6-sol']);
  assert.equal(result.usage.total_tokens, 300);
});

test('invalid Structured Output triggers at most one fallback', async () => {
  const calls = [];
  const result = await withApiKey(() => analyzeCvWithModels(modelOptions(), mockOpenAi(calls, [{ invalid: true }, complete])));
  assert.equal(result.fallbackUsed, true);
  assert.equal(calls.length, 2);
});

test('a failing Sol fallback is never retried a third time', async () => {
  const calls = [];
  await assert.rejects(
    withApiKey(() => analyzeCvWithModels(modelOptions(), mockOpenAi(calls, [{ invalid: true }, { invalid: true }]))),
    (error) => error?.kind === 'invalid',
  );
  assert.deepEqual(calls.map((call) => call.model), ['gpt-6-luna', 'gpt-6-sol']);
});

test('poor extraction quality triggers one Sol fallback', async () => {
  const calls = [];
  const poorExtraction = observations({ document: { ...complete.document, extraction_quality: 'poor' } });
  const result = await withApiKey(() => analyzeCvWithModels(modelOptions(), mockOpenAi(calls, [poorExtraction, complete])));
  assert.equal(result.fallbackUsed, true);
  assert.deepEqual(calls.map((call) => call.model), ['gpt-6-luna', 'gpt-6-sol']);
});

test('OpenAI 401 never triggers the Sol fallback', async () => {
  const calls = [];
  await assert.rejects(
    withApiKey(() => analyzeCvWithModels(modelOptions(), mockOpenAiError(calls, 401, 'invalid_api_key'))),
    (error) => error?.kind === 'authentication',
  );
  assert.deepEqual(calls.map((call) => call.model), ['gpt-6-luna']);
});

test('OpenAI quota and global rate-limit errors never trigger the Sol fallback', async () => {
  for (const code of ['insufficient_quota', 'rate_limit_exceeded']) {
    const calls = [];
    await assert.rejects(
      withApiKey(() => analyzeCvWithModels(modelOptions(), mockOpenAiError(calls, 429, code))),
      (error) => error?.kind === (code === 'insufficient_quota' ? 'quota' : 'rate_limit'),
    );
    assert.deepEqual(calls.map((call) => call.model), ['gpt-6-luna']);
  }
});

test('OpenAI invalid configuration never triggers the Sol fallback', async () => {
  const calls = [];
  await assert.rejects(
    withApiKey(() => analyzeCvWithModels(modelOptions(), mockOpenAiError(calls, 400, 'invalid_request_error'))),
    (error) => error?.kind === 'configuration',
  );
  assert.deepEqual(calls.map((call) => call.model), ['gpt-6-luna']);
});

test('is_cv=false does not trigger an unnecessary fallback', async () => {
  const calls = [];
  const notCv = observations({ is_cv: false, confidence: 0.2, document: { ...complete.document, extraction_quality: 'poor' } });
  const result = await withApiKey(() => analyzeCvWithModels(modelOptions(), mockOpenAi(calls, [notCv])));
  assert.equal(result.observations.is_cv, false);
  assert.equal(calls.length, 1);
});

test('Structured Output validator rejects incomplete observations', () => {
  assert.equal(validateCvObservations(complete), true);
  assert.equal(validateCvObservations({ ...complete, contact: {} }), false);
});

test('ESCO outage is non-blocking', async () => {
  const esco = await fetchEscoContext('Business Developer', 'fr', async () => { throw new Error('offline'); });
  assert.deepEqual(esco, { used: false, occupation: null, skills: [] });
});

test('Job Match is absent without observations and distinct from ATS readiness', () => {
  assert.equal(calculateJobMatch(null), null);
  const job = calculateJobMatch({ required_skills_total: 10, required_skills_detected: 5, responsibilities_total: 4, responsibilities_matched: 2, experience_relevance: 0.8, keywords_total: 10, keywords_detected: 7, strengths: [], gaps: [] });
  assert.equal(job.total, 57);
  assert.notEqual(job.total, calculateAtsReadiness(complete).total);
});

test('recommendation engine always recommends Career Search 360 and personalizes only its reason', () => {
  const base = { atsScore: 72, experienceLevel: 'senior', currentStatus: 'Salarié en poste' };
  const expectedReasons = new Map([
    ['', 'Un système complet pour structurer votre recherche, renforcer votre profil et garder chaque opportunité sous contrôle.'],
    ['Je candidate sans obtenir de réponses', 'Structurez votre recherche, renforcez vos candidatures et suivez chaque opportunité avec un système complet et réutilisable.'],
    ['Mon CV / LinkedIn ne me valorise pas', 'Renforcez votre CV, votre profil LinkedIn et la cohérence de votre candidature tout en structurant votre recherche d’opportunités.'],
    ['Je ne sais pas quelles opportunités cibler', 'Identifiez, priorisez et suivez les opportunités les plus pertinentes grâce à un système structuré de recherche et de pilotage.'],
    ['Je manque d’organisation dans ma recherche', 'Centralisez vos candidatures, relances, entretiens et prochaines actions dans un seul système de recherche structuré.'],
    ['Je bloque aux entretiens', 'Structurez votre recherche jusqu’au suivi des entretiens avec des outils et guides conçus pour mieux préparer chaque étape.'],
    ['Autre', 'Un système complet pour structurer votre recherche, renforcer votre profil et garder chaque opportunité sous contrôle.'],
  ]);

  for (const [difficulty, reason] of expectedReasons) {
    const recommendation = recommendOffer({ ...base, difficulty });
    assert.equal(recommendation.offerName, 'Career Search 360');
    assert.equal(recommendation.href, '/outils/bundle');
    assert.equal(recommendation.cta, 'Découvrir Career Search 360');
    assert.equal(recommendation.reason, reason);
  }
});

test('client source contains no OpenAI key and env exposes no public OpenAI key', async () => {
  const [page, env] = await Promise.all([
    readFile(new URL('../src/app/cv-diagnosis/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../.env.example', import.meta.url), 'utf8'),
  ]);
  assert.doesNotMatch(page, /OPENAI_API_KEY/);
  assert.doesNotMatch(env, /NEXT_PUBLIC_OPENAI_API_KEY/);
});

test('server logs only operational metadata, not resume contents or PII', async () => {
  const route = await readFile(new URL('../src/lib/cv-analysis/endpoint.ts', import.meta.url), 'utf8');
  const logBlock = route.slice(route.indexOf("console.info('CV analysis completed"), route.indexOf('return {', route.indexOf("console.info('CV analysis completed")));
  assert.doesNotMatch(logBlock, /cvText|email|phone|firstName|lastName|jobOffer/);
  assert.match(logBlock, /model_used/);
  assert.match(logBlock, /total_tokens/);
});

test('BotID verification failure fails closed before ESCO and OpenAI', async () => {
  const harness = endpointHarness();

  harness.dependencies.checkBotId = async () => {
    harness.calls.bot += 1;
    throw new Error('BotID unavailable');
  };

  const response = await executeCvAnalysisRequest(validRequest(), harness.dependencies);

  assert.equal(response.status, 503);
  assert.deepEqual(harness.calls, { bot: 1, esco: 0, openai: 0 });
});
test('BotID rejection returns 403 before ESCO and OpenAI', async () => {
  const harness = endpointHarness({ isBot: true });
  const response = await executeCvAnalysisRequest(validRequest(), harness.dependencies);
  assert.equal(response.status, 403);
  assert.deepEqual(response.body, { error: 'Accès refusé.' });
  assert.deepEqual(harness.calls, { bot: 1, esco: 0, openai: 0 });
});

test('unsupported file returns before ESCO and OpenAI', async () => {
  const form = validForm();
  form.delete('cvText');
  form.set('cvFile', new File(['not a resume'], 'cv.exe', { type: 'application/octet-stream' }));
  const harness = endpointHarness();
  const response = await executeCvAnalysisRequest(formRequest(form), harness.dependencies);
  assert.equal(response.status, 400);
  assert.deepEqual(harness.calls, { bot: 1, esco: 0, openai: 0 });
});

test('file with an invalid signature returns before ESCO and OpenAI', async () => {
  const form = validForm();
  form.delete('cvText');
  form.set('cvFile', new File(['not a pdf '.repeat(20)], 'cv.pdf', { type: 'application/pdf' }));
  const harness = endpointHarness();
  const response = await executeCvAnalysisRequest(formRequest(form), harness.dependencies);
  assert.equal(response.status, 400);
  assert.deepEqual(harness.calls, { bot: 1, esco: 0, openai: 0 });
});

test('short resume text returns before ESCO and OpenAI', async () => {
  const form = validForm();
  form.set('cvText', 'trop court');
  const harness = endpointHarness();
  const response = await executeCvAnalysisRequest(formRequest(form), harness.dependencies);
  assert.equal(response.status, 400);
  assert.deepEqual(harness.calls, { bot: 1, esco: 0, openai: 0 });
});

test('oversized job offer returns before ESCO and OpenAI', async () => {
  const form = validForm();
  form.set('jobOffer', 'x'.repeat(MAX_JOB_OFFER_LENGTH + 1));
  const harness = endpointHarness();
  const response = await executeCvAnalysisRequest(formRequest(form), harness.dependencies);
  assert.equal(response.status, 400);
  assert.deepEqual(harness.calls, { bot: 1, esco: 0, openai: 0 });
});

test('files over 5 MB and unsupported formats are refused', async () => {
  const tooLarge = new FormData();
  tooLarge.set('cvFile', new File([new Uint8Array(MAX_CV_FILE_SIZE + 1)], 'cv.pdf', { type: 'application/pdf' }));
  assert.equal((await parseCvInput(tooLarge)).ok, false);
  const unsupported = new FormData();
  unsupported.set('cvFile', new File(['resume'], 'cv.exe', { type: 'application/octet-stream' }));
  assert.equal((await parseCvInput(unsupported)).ok, false);
});

test('PDF is passed as an ephemeral low-detail input_file', async () => {
  const calls = [];
  await withApiKey(() => analyzeCvWithModels({ ...modelOptions(), input: { kind: 'file', filename: 'cv.pdf', mimeType: 'application/pdf', bytes: new Uint8Array([1, 2, 3]) } }, mockOpenAi(calls, [complete])));
  const file = calls[0].input[0].content.find((part) => part.type === 'input_file');
  assert.equal(file.detail, 'low');
  assert.match(file.file_data, /^data:application\/pdf;base64,/);
  assert.equal(calls[0].store, false);
});

test('successful diagnosis CRM payload excludes CV and job-offer bodies', () => {
  const data = buildCvDiagnosisLeadForm(contact(false), analysisResult(null));
  assert.equal(data.get('typeDemande'), 'Diagnostic CV');
  assert.equal(data.get('offreRessource'), 'Diagnostic CV');
  assert.equal(data.get('nomRessource'), 'Diagnostic CV IA Talentiques');
  assert.equal(data.has('cv'), false);
  assert.equal(data.has('cvFile'), false);
  assert.equal(data.has('cvText'), false);
  assert.equal(data.has('jobOffer'), false);
  assert.match(String(data.get('informationsComplementaires')), /ATS Readiness : 82\/100/);
  assert.doesNotMatch(String(data.get('informationsComplementaires')), /FULL CV SECRET/);
});

test('CRM summary includes Job Match only when it exists and includes recommendation', () => {
  const without = String(buildCvDiagnosisLeadForm(contact(false), analysisResult(null)).get('informationsComplementaires'));
  const withJob = String(buildCvDiagnosisLeadForm(contact(false), analysisResult({ total: 64, breakdown: {} })).get('informationsComplementaires'));
  assert.doesNotMatch(without, /Job Match/);
  assert.match(withJob, /Job Match : 64\/100/);
  assert.match(withJob, /Career Search 360/);
});

test('marketing consent, UTM and privacy remain separate in CRM payload', () => {
  const off = buildCvDiagnosisLeadForm(contact(false), analysisResult(null));
  const on = buildCvDiagnosisLeadForm(contact(true), analysisResult(null));
  assert.equal(off.get('marketing'), '0');
  assert.equal(on.get('marketing'), '1');
  assert.equal(off.get('privacy'), '1');
  assert.equal(off.get('utmSource'), 'linkedin');
  assert.equal(off.get('utmCampaign'), 'cv-launch');
});

test('Salesforce outage resolves false and cannot fail or rerun OpenAI', async () => {
  let crmCalls = 0;
  const ok = await submitCvDiagnosisLead(new FormData(), async () => { crmCalls += 1; throw new Error('offline'); });
  assert.equal(ok, false);
  assert.equal(crmCalls, 1);
});

test('frontend guards CRM submission against rerenders and preserves restricted picklist value', async () => {
  const page = await readFile(new URL('../src/app/cv-diagnosis/page.tsx', import.meta.url), 'utf8');
  assert.match(page, /if \(!crmSent\.current\)/);
  assert.match(page, /crmSent\.current = true/);
  const crm = await readFile(new URL('../src/lib/cv-analysis/crm.ts', import.meta.url), 'utf8');
  assert.match(crm, /offreRessource', 'Diagnostic CV'/);
  assert.doesNotMatch(crm, /offreRessource', contact\./);
});

test('failed diagnosis cannot reach the CRM submission branch', async () => {
  const page = await readFile(new URL('../src/app/cv-diagnosis/page.tsx', import.meta.url), 'utf8');
  const failureGuard = page.indexOf('if (!response.ok || !payload.success)');
  const resultStored = page.indexOf('setAnalysis(result)');
  const crmSubmission = page.lastIndexOf('submitCvDiagnosisLead');
  assert.ok(failureGuard >= 0 && failureGuard < resultStored);
  assert.ok(resultStored >= 0 && resultStored < crmSubmission);
});

function observations(overrides = {}) {
  const base = {
    is_cv: true,
    language: 'fr',
    confidence: 0.95,
    document: { extraction_quality: 'good', layout_assessable: true, layout_risk: 'low', heading_clarity: 'clear' },
    candidate: { target_role_detected: 'Business Developer', experience_level: 'senior' },
    structure: { summary_section: true, experience_section: true, education_section: true, skills_section: true, languages_section: true },
    contact: { email_present: true, phone_present: true, linkedin_present: true },
    experience: { positions_count: 3, positions_with_dates: 3, positions_with_bullets: 3, bullet_count: 10, action_oriented_bullets: 10, quantified_bullets: 10, outcome_or_impact_bullets: 10 },
    skills: { explicit_section: true, detected: ['CRM', 'Prospection', 'Négociation', 'Salesforce', 'Excel', 'Reporting', 'B2B', 'Pipeline'], skills_supported_by_experience: ['CRM', 'Prospection', 'Négociation', 'B2B', 'Pipeline'] },
    content: { word_count: 450, generic_phrase_count: 1, language_issue_count: 0, date_consistency_issue_count: 0, contradiction_count: 0 },
    strengths: ['Expériences structurées'],
    issues: [{ category: 'impact', severity: 'high', evidence: 'Gestion de campagnes', explanation: 'Le résultat n’est pas précisé.', recommended_action: 'Ajouter un résultat réel.', example_rewrite: 'Pilotage de campagnes avec [résultat réel à compléter].' }],
    remove_or_reduce: ['Formulations génériques'],
    add_or_strengthen: ['Résultats démontrables'],
    job_match_observations: null,
  };
  return { ...base, ...overrides };
}

function modelOptions() {
  return { input: { kind: 'text', text: 'CV '.repeat(80) }, targetRole: '', jobOffer: '', locale: 'fr', esco: { used: false, occupation: null, skills: [] } };
}

function mockOpenAi(calls, outputs) {
  return async (_url, init) => {
    calls.push(JSON.parse(init.body));
    const output = outputs[Math.min(calls.length - 1, outputs.length - 1)];
    return new Response(JSON.stringify({ output_text: JSON.stringify(output), usage: { input_tokens: 100, output_tokens: 50, total_tokens: 150 } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
}

function mockOpenAiError(calls, status, code) {
  return async (_url, init) => {
    calls.push(JSON.parse(init.body));
    return new Response(JSON.stringify({ error: { code, type: code, message: code } }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}

function endpointHarness({ isBot = false, model = complete } = {}) {
  const calls = { bot: 0, esco: 0, openai: 0 };
  return {
    calls,
    dependencies: {
      checkBotId: async () => { calls.bot += 1; return { isBot }; },
      fetchEscoContext: async () => { calls.esco += 1; return { used: false, occupation: null, skills: [] }; },
      analyzeCvWithModels: async () => {
        calls.openai += 1;
        return {
          observations: model,
          usage: { input_tokens: 100, output_tokens: 50, total_tokens: 150 },
          modelUsed: 'gpt-6-luna',
          fallbackUsed: false,
        };
      },
    },
  };
}

function validForm() {
  const form = new FormData();
  form.set('cvText', 'CV professionnel avec expériences, compétences et formation. '.repeat(4));
  form.set('locale', 'fr');
  form.set('targetRole', 'Business Developer');
  form.set('jobOffer', '');
  form.set('currentStatus', 'Salarié en poste');
  form.set('website', '');
  return form;
}

function formRequest(form) {
  return new Request('http://localhost/api/analyze-cv', { method: 'POST', body: form });
}

function validRequest() {
  return formRequest(validForm());
}

async function withApiKey(action) {
  const before = process.env.OPENAI_API_KEY;
  const model = process.env.CV_ANALYSIS_MODEL;
  const fallback = process.env.CV_ANALYSIS_FALLBACK_MODEL;
  process.env.OPENAI_API_KEY = 'test-key';
  delete process.env.CV_ANALYSIS_MODEL;
  delete process.env.CV_ANALYSIS_FALLBACK_MODEL;
  try { return await action(); }
  finally {
    if (before === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = before;
    if (model === undefined) delete process.env.CV_ANALYSIS_MODEL; else process.env.CV_ANALYSIS_MODEL = model;
    if (fallback === undefined) delete process.env.CV_ANALYSIS_FALLBACK_MODEL; else process.env.CV_ANALYSIS_FALLBACK_MODEL = fallback;
  }
}

function contact(marketing) {
  return { firstName: 'Ada', lastName: 'Lovelace', email: 'ada@example.com', phone: '', country: 'FR', currentStatus: 'Salarié en poste', linkedin: '', targetRole: 'Business Developer', privacy: true, marketing, utmSource: 'linkedin', utmMedium: 'social', utmCampaign: 'cv-launch' };
}

function analysisResult(jobMatch) {
  return { atsReadiness: { total: 82, breakdown: calculateAtsReadiness(complete).breakdown }, jobMatch, strengths: [], priorities: complete.issues, removeOrReduce: [], addOrStrengthen: [], rewrites: complete.issues, esco: { used: false, occupation: null, skills: [] }, recommendation: { offerId: 'bundle', offerName: 'Career Search 360', href: '/outils/bundle', reason: 'Base correcte.', cta: 'Découvrir Career Search 360' }, profile: { experienceLevel: 'senior', currentStatus: 'Salarié en poste' }, layoutAssessed: true, modelUsed: 'gpt-6-luna', fallbackUsed: false };
}
