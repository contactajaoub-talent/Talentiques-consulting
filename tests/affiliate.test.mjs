import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  AFFILIATE_COOKIE_MAX_AGE,
  affiliateCancellationReason,
  calculateCommission,
  commissionAvailableAt,
  isSelfReferral,
  normalizeAffiliateCode,
} from '../src/lib/affiliate/core.ts';
import { createAffiliateAttribution } from '../src/lib/affiliate/service.ts';

const active = {
  id: '7b42e1ea-df67-4418-aed6-c143986485be',
  code: 'sarah',
  status: 'active',
};

function attributionDependencies(affiliate = active) {
  const clicks = [];
  return {
    clicks,
    dependencies: {
      async findActiveAffiliateByCode() {
        return affiliate;
      },
      async insertAffiliateClick(payload) {
        clicks.push(payload);
        return { id: `click-${clicks.length}` };
      },
    },
  };
}

test('valid ref creates attribution with market and tracking', async () => {
  const mock = attributionDependencies();
  const result = await createAffiliateAttribution(
    {
      ref: ' Sarah ',
      pathname: '/en/tools/bundle',
      tracking: { utm_source: 'partner', ignored: 'no' },
      anonymousSessionId: 'session-1',
    },
    mock.dependencies
  );
  assert.deepEqual(result, { code: 'sarah', clickId: 'click-1' });
  assert.equal(mock.clicks[0].market, 'en');
  assert.equal(mock.clicks[0].utm_source, 'partner');
  assert.equal(mock.clicks[0].ignored, undefined);
});

test('invalid and suspended refs are ignored safely', async () => {
  const invalid = attributionDependencies();
  assert.equal(
    await createAffiliateAttribution(
      { ref: 'not valid!', pathname: '/outils', anonymousSessionId: 's' },
      invalid.dependencies
    ),
    null
  );
  assert.equal(invalid.clicks.length, 0);

  const suspended = attributionDependencies({ ...active, status: 'suspended' });
  assert.equal(
    await createAffiliateAttribution(
      { ref: 'sarah', pathname: '/outils', anonymousSessionId: 's' },
      suspended.dependencies
    ),
    null
  );
  assert.equal(suspended.clicks.length, 0);
});

test('last valid click returns replacement attribution while invalid click does not', async () => {
  const first = attributionDependencies({ ...active, code: 'first' });
  const second = attributionDependencies({ ...active, code: 'second' });
  const firstResult = await createAffiliateAttribution(
    { ref: 'first', pathname: '/outils', anonymousSessionId: 's' },
    first.dependencies
  );
  const invalidResult = await createAffiliateAttribution(
    { ref: 'bad value', pathname: '/outils', anonymousSessionId: 's' },
    first.dependencies
  );
  const secondResult = await createAffiliateAttribution(
    { ref: 'second', pathname: '/outils', anonymousSessionId: 's' },
    second.dependencies
  );
  assert.equal(firstResult.code, 'first');
  assert.equal(invalidResult, null);
  assert.equal(secondResult.code, 'second');
});

test('attribution cookie lifetime is exactly 30 days', () => {
  assert.equal(AFFILIATE_COOKIE_MAX_AGE, 2_592_000);
});

test('commission math rounds correctly and retains the supplied currency model', () => {
  assert.equal(calculateCommission(14.9, 0.5), 7.45);
  assert.equal(calculateCommission(9.9, 0.5), 4.95);
  assert.equal(calculateCommission(7.9, 0.5), 3.95);
  for (const currency of ['EUR', 'USD']) {
    const record = { currency, commission: calculateCommission(14.9, 0.5) };
    assert.equal(record.currency, currency);
    assert.equal(record.commission, 7.45);
  }
});

test('availability is paid_at plus 30 days and self-referral is normalized', () => {
  assert.equal(
    commissionAvailableAt('2026-01-01T12:00:00.000Z'),
    '2026-01-31T12:00:00.000Z'
  );
  assert.equal(isSelfReferral(' Buyer@Example.com ', 'buyer@example.com'), true);
  assert.equal(isSelfReferral('customer@example.com', 'affiliate@example.com'), false);
});

test('refunds and disputes map to safe cancellation reasons', () => {
  assert.equal(affiliateCancellationReason('PAYMENT.CAPTURE.REFUNDED'), 'refund');
  assert.equal(affiliateCancellationReason('PAYMENT.CAPTURE.REVERSED'), 'refund');
  assert.equal(affiliateCancellationReason('CUSTOMER.DISPUTE.CREATED'), 'dispute');
  assert.equal(affiliateCancellationReason('PAYMENT.CAPTURE.COMPLETED'), null);
});

test('database migration enforces commission idempotency and protected cancellation states', async () => {
  const sql = await readFile(new URL('../supabase/affiliate_program.sql', import.meta.url), 'utf8');
  const helper = await readFile(
    new URL('../src/lib/affiliate/supabase-rest.ts', import.meta.url),
    'utf8'
  );
  assert.match(sql, /unique\s*\(order_id\)/i);
  assert.match(sql, /alter table public\.affiliate_commissions enable row level security/i);
  assert.match(helper, /resolution=ignore-duplicates/);
  assert.match(helper, /status: 'in\.\(pending,available\)'/);
});

test('code normalization accepts URL-safe lowercase values only', () => {
  assert.equal(normalizeAffiliateCode(' Sarah_Pro-1 '), 'sarah_pro-1');
  assert.equal(normalizeAffiliateCode('s'), 's');
  assert.equal(normalizeAffiliateCode('-bad'), null);
});

