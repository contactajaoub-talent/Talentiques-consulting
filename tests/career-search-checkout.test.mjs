import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import ts from 'typescript';

async function proxy(name, fetch) {
  const source = await readFile(new URL(`../src/app/api/career-search/paypal/${name}/route.ts`, import.meta.url), 'utf8');
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
    { module, exports: module.exports, Request, Response, AbortSignal, fetch });
  return module.exports.POST;
}
const request = body => new Request('https://www.talentiques.com/api/checkout', { method: 'POST', body: JSON.stringify(body) });
const json = (body, status = 200) => Response.json(body, { status });

test('create proxy forwards only normalized checkout identity and strips upstream details', async () => {
  const post = await proxy('create-order', async (url, options) => {
    assert.equal(url, 'https://app.talentiques.com/api/payments/career-search/create-order');
    assert.equal(options.cache, 'no-store'); assert.equal(options.redirect, 'error'); assert.ok(options.signal);
    assert.deepEqual(JSON.parse(options.body), { name: 'Buyer Name', email: 'buyer@example.test', locale: 'en' });
    return json({ id: 'PAYPAL-ORDER-123', private: 'upstream-internal-data' });
  });
  const response = await post(request({ name: ' Buyer Name ', email: ' Buyer@Example.test ', locale: 'en', price: '0.01', currency: 'USD', custom_id: 'other' }));
  assert.deepEqual(await response.json(), { id: 'PAYPAL-ORDER-123' });
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), null);
});

test('invalid checkout identity is rejected locally; backend errors stay generic', async () => {
  const post = await proxy('create-order', async () => { throw new Error('unexpected upstream request'); });
  for (const body of [null, [], {}, { name: 'Buyer', email: 'bad', locale: 'fr' }, { name: 'Buyer', email: 'buyer@example.test', locale: 'de' }]) {
    const response = await post(request(body));
    assert.equal(response.status, 400); assert.deepEqual(await response.json(), { error: 'invalid_request' });
  }
  const rejected = await proxy('create-order', async () => json({ error: 'private server details' }, 400));
  const response = await rejected(request({ name: 'Buyer', email: 'buyer@example.test', locale: 'fr' }));
  assert.equal(response.status, 400); assert.deepEqual(await response.json(), { error: 'checkout_unavailable' });
});

test('capture proxy cannot replace account identity and requires authoritative ok:true', async () => {
  for (const emailSent of [true, false]) {
    const post = await proxy('capture-order', async (url, options) => {
      assert.equal(url, 'https://app.talentiques.com/api/payments/career-search/capture-order');
      assert.deepEqual(JSON.parse(options.body), { orderId: 'PAYPAL-ORDER-123' });
      return json({ ok: true, emailSent, email: 'private@example.test', token: 'private-token' });
    });
    const response = await post(request({ orderId: 'PAYPAL-ORDER-123', email: 'attacker@example.test', amount: '0.01' }));
    assert.deepEqual(await response.json(), { ok: true, emailSent });
  }
  for (const payload of [{ ok: 'true' }, { ok: false }, { error: 'sensitive backend error' }]) {
    const post = await proxy('capture-order', async () => json(payload));
    const response = await post(request({ orderId: 'PAYPAL-ORDER-123' }));
    assert.equal(response.status, 502); assert.deepEqual(await response.json(), { error: 'payment_failed' });
  }
});
