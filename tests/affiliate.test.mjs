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
import {
  affiliateCodeBase,
  affiliateCodeCandidate,
  duplicateApplicationMessage,
  validateAffiliateApplication,
} from '../src/lib/affiliate/application.ts';
import {
  AFFILIATE_STATUS_TRANSITIONS,
  hasValidAffiliateAdminAuthorization,
} from '../src/lib/affiliate/admin.ts';
import { approvalEmail, applicationConfirmationEmail } from '../src/lib/affiliate/emails.ts';

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

const validApplication = {
  full_name: 'Sarah Martin', email: 'SARAH@example.com', country: 'France',
  primary_channel: 'linkedin', profile_url: 'https://linkedin.com/in/sarah',
  audience_size: '1k_5k', content_focus: ['career', 'linkedin'],
  motivation: 'I create practical career content.', payout_preference: 'paypal',
  terms_accepted: true, application_language: 'en',
};

test('valid affiliate application is normalized and remains a 50% pending application', () => {
  const result = validateAffiliateApplication(validApplication, new Date('2026-09-26T12:00:00Z'));
  assert.equal(result.success, true);
  assert.equal(result.data.email, 'sarah@example.com');
  assert.equal(result.data.terms_accepted_at, '2026-09-26T12:00:00.000Z');
  assert.equal(Number('0.5000'), 0.5);
});

test('invalid email and missing terms are rejected', () => {
  const invalidEmail = validateAffiliateApplication({ ...validApplication, email: 'bad' });
  const missingTerms = validateAffiliateApplication({ ...validApplication, terms_accepted: false });
  assert.equal(invalidEmail.success, false);
  assert.equal(invalidEmail.errors.email, 'invalid');
  assert.equal(missingTerms.success, false);
  assert.equal(missingTerms.errors.terms_accepted, 'required');
});

test('duplicate application statuses return safe messages and rejected can reapply', () => {
  assert.match(duplicateApplicationMessage('pending', 'en'), /under review/i);
  assert.match(duplicateApplicationMessage('active', 'en'), /active affiliate/i);
  assert.match(duplicateApplicationMessage('suspended', 'en'), /cannot submit/i);
  assert.equal(duplicateApplicationMessage('rejected', 'en'), null);
});

test('affiliate codes are unique-ready, accent-free and avoid reserved names', () => {
  assert.equal(affiliateCodeBase('Sarah Étoile'), 'sarahetoile');
  assert.equal(affiliateCodeBase('Admin'), 'partneradmin');
  assert.equal(affiliateCodeCandidate('Sarah', '7K!'), 'sarah7k');
});

test('only active affiliate status can create attribution', async () => {
  for (const status of ['pending', 'rejected', 'suspended']) {
    const mock = attributionDependencies({ ...active, status });
    const result = await createAffiliateAttribution(
      { ref: 'sarah', pathname: '/outils', anonymousSessionId: 's' }, mock.dependencies
    );
    assert.equal(result, null);
  }
  const mock = attributionDependencies(active);
  assert.equal((await createAffiliateAttribution(
    { ref: 'sarah', pathname: '/outils', anonymousSessionId: 's' }, mock.dependencies
  )).code, 'sarah');
});

test('admin authorization rejects invalid secret and accepts valid secret', () => {
  const unauthorized = new Request('https://talentiques.com/api/affiliate/admin/status', {
    headers: { authorization: 'Bearer wrong' },
  });
  const authorized = new Request('https://talentiques.com/api/affiliate/admin/status', {
    headers: { authorization: 'Bearer strong-secret' },
  });
  assert.equal(hasValidAffiliateAdminAuthorization(unauthorized, 'strong-secret'), false);
  assert.equal(hasValidAffiliateAdminAuthorization(authorized, 'strong-secret'), true);
  assert.deepEqual(AFFILIATE_STATUS_TRANSITIONS.approve, { from: 'pending', to: 'active' });
});

test('application and approval emails contain safe status and correct FR/EN links', () => {
  const data = { fullName: 'Sarah Martin', email: 'sarah@example.com', code: 'sarah', language: 'fr' };
  assert.match(applicationConfirmationEmail(data).text, /aucun lien affilié n’est encore actif/i);
  const approved = approvalEmail(data);
  assert.match(approved.text, /https:\/\/talentiques\.com\/outils\?ref=sarah/);
  assert.match(approved.text, /https:\/\/talentiques\.com\/en\/tools\?ref=sarah/);
  assert.match(approved.text, /50 %/);
});
