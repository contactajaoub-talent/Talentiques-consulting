import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { getServiceOffer, isServiceId, serviceMoneyMatches } from '../src/lib/services/catalog.ts';

test('service catalog resolves authoritative FR and EN totals', () => {
  assert.deepEqual([getServiceOffer('professional-profile','fr').amount, getServiceOffer('professional-profile','fr').currency], ['45.00','EUR']);
  assert.deepEqual([getServiceOffer('professional-profile','en').amount, getServiceOffer('professional-profile','en').currency], ['45.00','USD']);
  assert.deepEqual([getServiceOffer('student-jobseeker','fr').amount, getServiceOffer('student-jobseeker','fr').currency], ['30.00','EUR']);
  assert.deepEqual([getServiceOffer('student-jobseeker','en').amount, getServiceOffer('student-jobseeker','en').currency], ['30.00','USD']);
  assert.equal(isServiceId('invented-service'), false);
});

test('money validation requires an exact total', () => {
  assert.equal(serviceMoneyMatches('45.00','45.00'), true);
  assert.equal(serviceMoneyMatches('45.00','44.99'), false);
  assert.equal(serviceMoneyMatches('30.00','30.00'), true);
  assert.equal(serviceMoneyMatches('30.00','30.01'), false);
});

test('service create route ignores browser amounts and resolves the catalog server-side', async () => {
  const source = await readFile(new URL('../src/app/api/services/paypal/create-order/route.ts', import.meta.url), 'utf8');
  assert.match(source, /getServiceOffer\(body\.serviceId, body\.market\)/);
  assert.doesNotMatch(source, /body\.amount/);
  assert.match(source, /currency_code: service\.currency/);
  assert.match(source, /value: service\.amount/);
});

test('capture route validates order and captured currency and amount', async () => {
  const source = await readFile(new URL('../src/app/api/services/paypal/capture-order/route.ts', import.meta.url), 'utf8');
  assert.ok((source.match(/serviceMoneyMatches/g) || []).length >= 2);
  assert.ok((source.match(/expected\.currency/g) || []).length >= 2);
  assert.match(source, /stored\.status === 'paid'/);
});

test('service payment never triggers store fulfillment or affiliate commission', async () => {
  const create = await readFile(new URL('../src/app/api/services/paypal/create-order/route.ts', import.meta.url), 'utf8');
  const capture = await readFile(new URL('../src/app/api/services/paypal/capture-order/route.ts', import.meta.url), 'utf8');
  const combined = create + capture;
  assert.doesNotMatch(combined, /fulfillStorePayment|affiliate|commission/i);
});
