import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getServiceOffer,
  isServiceId,
  isServiceMarket,
  serviceMoneyMatches,
} from '../src/lib/services/catalog.ts';

test('service catalog keeps trusted server-side prices for both markets', () => {
  assert.deepEqual(
    [
      getServiceOffer('professional-profile', 'fr'),
      getServiceOffer('student-jobseeker', 'fr'),
      getServiceOffer('professional-profile', 'en'),
      getServiceOffer('student-jobseeker', 'en'),
    ].map(({ id, market, amount, currency }) => ({ id, market, amount, currency })),
    [
      { id: 'professional-profile', market: 'fr', amount: '45.00', currency: 'EUR' },
      { id: 'student-jobseeker', market: 'fr', amount: '30.00', currency: 'EUR' },
      { id: 'professional-profile', market: 'en', amount: '45.00', currency: 'USD' },
      { id: 'student-jobseeker', market: 'en', amount: '30.00', currency: 'USD' },
    ],
  );
});

test('service identifiers, markets, and captured values are strictly validated', () => {
  assert.equal(isServiceId('professional-profile'), true);
  assert.equal(isServiceId('bundle'), false);
  assert.equal(isServiceMarket('fr'), true);
  assert.equal(isServiceMarket('eur'), false);
  assert.equal(serviceMoneyMatches('45.00', '45.00'), true);
  assert.equal(serviceMoneyMatches('45.00', '30.00'), false);
  assert.equal(serviceMoneyMatches('45.00', undefined), false);
});
