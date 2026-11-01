import assert from 'node:assert/strict';
import test from 'node:test';
import { validateCareerQuote, careerQuotePayload, serializeCareerQuote, quoteDeliveryEnabled, MAX_CV_SIZE } from '../src/lib/services/career-quote.ts';
import { submitCareerQuote } from '../src/lib/services/career-quote-client.ts';

function validForm() {
  const form = new FormData();
  for (const [key, value] of Object.entries({ fullName: 'Camille Exemple', email: 'camille@example.test', phone: '+33 6 12 34 56 78', country: 'France', ancienClient: 'Non', situation: 'Étudiant', experience: 'Étudiant / débutant', objectifProfessionnel: 'Trouver un stage PFE en gestion de projet.', mobilite: 'Internationale', privacy: 'on' })) form.set(key, value);
  form.append('opportunites', 'Stage'); form.append('opportunites', 'Stage PFE');
  form.append('postes', 'Chef de projet'); form.append('postes', 'Consultant');
  form.append('paysCibles', 'FR'); form.append('paysCibles', 'CA');
  form.set('cv', new File(['%PDF-1.7\n/Type /Page\n' + ' '.repeat(100) + '\n%%EOF'], 'cv.pdf', { type: 'application/pdf' }));
  return form;
}

test('quote retains multiple opportunities, roles and countries', () => {
  const quote = validateCareerQuote(validForm());
  assert.deepEqual(quote.opportunities, ['Stage', 'Stage PFE']);
  assert.deepEqual(quote.roles, ['Chef de projet', 'Consultant']);
  assert.deepEqual(quote.countries, ['FR', 'CA']);
});

test('required fields, consent, selections and lengths are validated server-side', () => {
  for (const key of ['fullName', 'email', 'phone', 'country', 'ancienClient', 'situation', 'experience', 'objectifProfessionnel', 'mobilite', 'privacy', 'opportunites', 'postes', 'paysCibles', 'cv']) {
    const form = validForm(); form.delete(key);
    assert.throws(() => validateCareerQuote(form), undefined, key);
  }
  for (const [key, value] of [['email', 'invalid'], ['phone', 'invalid'], ['situation', 'unlisted'], ['paysCibles', 'XX'], ['opportunites', 'unlisted'], ['postes', 'x'.repeat(101)], ['commentaires', 'x'.repeat(2001)], ['profilLinkedIn', 'https://linkedin.com.evil.test/in/test']]) {
    const form = validForm(); form.set(key, value);
    assert.throws(() => validateCareerQuote(form), undefined, key);
  }
});

test('CV is mandatory with supported extension and bounded size', () => {
  for (const file of [new File([], 'cv.pdf'), new File(['data'], 'cv.exe'), new File([new Uint8Array(512)], 'cv.doc'), new File([new Uint8Array(MAX_CV_SIZE + 1)], 'cv.docx')]) {
    const form = validForm(); form.set('cv', file);
    assert.throws(() => validateCareerQuote(form));
  }
  for (const extension of ['pdf', 'docx']) {
    const form = validForm(); form.set('cv', new File([new Uint8Array(512)], `cv.${extension}`));
    assert.equal(validateCareerQuote(form).extension, extension);
  }
});

test('CRM payload preserves every quote field and consent without forwarding payment or marketing data', () => {
  const form = validForm();
  for (const key of ['montantPrevu', 'statutPaiement', 'statutActuel', 'anneesExperience', 'budgetEnvisage', 'marketing']) form.set(key, 'untrusted');
  const payload = careerQuotePayload(serializeCareerQuote(form));
  assert.equal(payload.service_id, 'career-a-z');
  assert.equal(payload.kind, 'quote');
  assert.deepEqual(payload.details.roles, ['Chef de projet', 'Consultant']);
  assert.deepEqual(payload.markets, ['France', 'Canada']);
  assert.match(payload.notes, /Stage, Stage PFE/);
  assert.equal(payload.marketing, false);
  assert.equal(payload.consent_version, 'career-quote-2026-11-01');
  for (const key of ['montantPrevu', 'statutPaiement', 'budgetEnvisage']) assert.equal(payload[key], undefined);
  assert.throws(() => careerQuotePayload({ ...serializeCareerQuote(form), consentVersion: 'outdated' }));
});

const reply = (value, status = 200) => new Response(JSON.stringify(value), { status });
const saved = { requestId: 'saved-request', documentId: 'private-cv' };

test('direct signed upload occurs before commit; success requires a saved request and linked CV', async () => {
  const calls = [], state = { current: null };
  const send = async (url, init) => {
    calls.push({ url, init });
    if (init.method === 'POST') return reply({ uploadUrl: 'https://storage.example.test/signed', mime: 'application/pdf' });
    if (String(url).startsWith('https://storage.')) return reply({});
    return reply(saved);
  };
  assert.deepEqual(await submitCareerQuote(validForm(), state, send), saved);
  assert.deepEqual(calls.map(c => c.init.method), ['POST', 'PUT', 'PUT']);
  assert.ok(calls[1].init.body instanceof File);
  assert.equal(calls[1].init.headers['x-upsert'], 'false');
  assert.equal(JSON.parse(calls[0].init.body).consentVersion, 'career-quote-2026-11-01');
});

test('lost commit response retries the same capability without a new upload or request', async () => {
  const state = { current: null }, calls = [];
  let commits = 0;
  const send = async (url, init) => {
    calls.push({ url, init });
    if (init.method === 'POST') return reply({ uploadUrl: 'https://storage.example.test/signed', mime: 'application/pdf' });
    if (String(url).startsWith('https://storage.')) return reply({});
    if (++commits === 1) throw new Error('Response lost after commit');
    return reply(saved);
  };
  await assert.rejects(submitCareerQuote(validForm(), state, send));
  const id = state.current.uploadId;
  assert.deepEqual(await submitCareerQuote(validForm(), state, send), saved);
  assert.equal(state.current.uploadId, id);
  assert.equal(calls.filter(c => c.init.method === 'POST').length, 1);
  assert.equal(calls.filter(c => String(c.url).startsWith('https://storage.')).length, 1);
  assert.equal(calls.at(-1).init.body, calls.at(-2).init.body);
});

test('lost initialization response is retried with the same ID and token', async () => {
  const state = { current: null }, starts = [];
  const send = async (url, init) => {
    if (init.method === 'POST') {
      starts.push(JSON.parse(init.body));
      if (starts.length === 1) throw new Error('Init response lost');
      return reply({ committed: true, ...saved });
    }
    throw new Error('Unexpected upload or commit');
  };
  await assert.rejects(submitCareerQuote(validForm(), state, send));
  await submitCareerQuote(validForm(), state, send);
  assert.equal(starts[0].uploadId, starts[1].uploadId);
  assert.equal(starts[0].token, starts[1].token);
});

test('storage errors and incomplete commit responses never produce success', async () => {
  for (const failure of ['storage', 'commit']) {
    const state = { current: null };
    const send = async (url, init) => {
      if (init.method === 'POST') return reply({ uploadUrl: 'https://storage.example.test/signed', mime: 'application/pdf' });
      if (String(url).startsWith('https://storage.')) return reply({}, failure === 'storage' ? 503 : 200);
      return reply({ requestId: 'missing-linked-document' });
    };
    await assert.rejects(submitCareerQuote(validForm(), state, send));
  }
});

test('delivery requires production and explicit enablement; preview and tests remain blocked', () => {
  for (const env of [{}, { NODE_ENV: 'development', CAREER_QUOTE_ENABLED: 'true' }, { NODE_ENV: 'test', CAREER_QUOTE_ENABLED: 'true' }, { NODE_ENV: 'production' }, { NODE_ENV: 'production', VERCEL_ENV: 'preview', CAREER_QUOTE_ENABLED: 'true' }]) assert.equal(quoteDeliveryEnabled(env), false);
  assert.equal(quoteDeliveryEnabled({ NODE_ENV: 'production', VERCEL_ENV: 'production', CAREER_QUOTE_ENABLED: 'true' }), true);
});
