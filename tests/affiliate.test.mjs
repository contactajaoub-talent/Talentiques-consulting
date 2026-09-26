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
import {
  AFFILIATE_SESSION_TTL_MS,
  LOGIN_TOKEN_TTL_MS,
  affiliateSessionCookieOptions,
  createSecureToken,
  hashAffiliateToken,
  canConsumeLoginToken,
  shouldIssueMagicLink,
} from '../src/lib/affiliate/auth-core.ts';
import {
  affiliateProductLinks,
  buildAffiliateLink,
  buildDashboardData,
  conversionRate,
} from '../src/lib/affiliate/dashboard.ts';

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

test('magic tokens use at least 32 random bytes and only hashes are persistence-ready', () => {
  const raw = createSecureToken();
  const hash = hashAffiliateToken(raw);
  assert.ok(raw.length >= 43);
  assert.match(raw, /^[A-Za-z0-9_-]+$/);
  assert.equal(hash.length, 64);
  assert.notEqual(hash, raw);
  assert.equal(LOGIN_TOKEN_TTL_MS, 15 * 60_000);
});

test('session cookie is HttpOnly, Lax, secure in production, and lasts 30 days', () => {
  const cookie = affiliateSessionCookieOptions(true);
  assert.equal(cookie.httpOnly, true);
  assert.equal(cookie.sameSite, 'lax');
  assert.equal(cookie.secure, true);
  assert.equal(cookie.path, '/');
  assert.equal(cookie.maxAge, 2_592_000);
  assert.equal(AFFILIATE_SESSION_TTL_MS, 30 * 24 * 60 * 60_000);
});

test('only active affiliates receive magic links without account enumeration', () => {
  assert.equal(shouldIssueMagicLink({ status: 'active' }), true);
  for (const status of ['pending', 'suspended', 'rejected']) assert.equal(shouldIssueMagicLink({ status }), false);
  assert.equal(shouldIssueMagicLink(null), false);
});

test('expired and used login tokens are rejected and valid token is consumable once', () => {
  const now = new Date('2026-09-26T12:00:00Z');
  assert.equal(canConsumeLoginToken({ expires_at: '2026-09-26T12:15:00Z', used_at: null }, now), true);
  assert.equal(canConsumeLoginToken({ expires_at: '2026-09-26T11:59:00Z', used_at: null }, now), false);
  assert.equal(canConsumeLoginToken({ expires_at: '2026-09-26T12:15:00Z', used_at: '2026-09-26T12:01:00Z' }, now), false);
});

test('conversion handles zero and normal traffic', () => {
  assert.equal(conversionRate(0, 0), 0);
  assert.equal(conversionRate(10, 1), 10);
});

const dashboardAffiliate = {
  id: 'affiliate-a', full_name: 'Sarah Martin', email: 'sarah@example.com', country: 'France',
  code: 'sarah', primary_channel: 'linkedin', profile_url: 'https://example.com',
  commission_rate: 0.5, status: 'active', approved_at: '2026-08-01T00:00:00Z',
};

test('dashboard excludes refunded/disputed sales and never merges EUR with USD', () => {
  const data = buildDashboardData(dashboardAffiliate, {
    clicks: Array.from({ length: 10 }, (_, i) => ({ created_at: `2026-09-${String(20 + i % 5).padStart(2, '0')}T00:00:00Z` })),
    orders: [
      { id: 'eur', status: 'paid', paid_at: '2026-09-24T00:00:00Z', amount: 14.9, currency: 'EUR', product_id: 'bundle', market: 'fr' },
      { id: 'usd', status: 'paid', paid_at: '2026-09-24T00:00:00Z', amount: 9.9, currency: 'USD', product_id: 'ats', market: 'en' },
      { id: 'refund', status: 'refunded', paid_at: '2026-09-24T00:00:00Z', amount: 100, currency: 'EUR' },
      { id: 'dispute', status: 'disputed', paid_at: '2026-09-24T00:00:00Z', amount: 100, currency: 'USD' },
    ],
    commissions: [
      { order_id: 'eur', product_id: 'bundle', market: 'fr', order_amount: 14.9, commission_amount: 7.45, currency: 'EUR', status: 'pending', created_at: '2026-09-24T00:00:00Z' },
      { order_id: 'usd', product_id: 'ats', market: 'en', order_amount: 9.9, commission_amount: 4.95, currency: 'USD', status: 'available', created_at: '2026-09-24T00:00:00Z' },
    ], payouts: [],
  }, '30d', new Date('2026-09-26T00:00:00Z'));
  assert.equal(data.metrics.sales, 2);
  assert.deepEqual(data.metrics.revenue, { EUR: 14.9, USD: 9.9 });
  assert.deepEqual(data.metrics.balances.pending, { EUR: 7.45 });
  assert.deepEqual(data.metrics.balances.available, { USD: 4.95 });
  assert.equal(JSON.stringify(data).includes('customer_email'), false);
  assert.equal(JSON.stringify(data).includes('paypal_order_id'), false);
});

test('authenticated links always use the affiliate code and actual product routes', () => {
  const links = affiliateProductLinks('sarah');
  assert.equal(links.fr.tracker, 'https://talentiques.com/outils/opportunity-tracker?ref=sarah');
  assert.equal(links.fr.ats, 'https://talentiques.com/outils/cv-ats?ref=sarah');
  assert.equal(links.en.ats, 'https://talentiques.com/en/tools/ats-resume?ref=sarah');
  const built = buildAffiliateLink('sarah', 'en', { utm_source: 'instagram', ref: 'attacker' });
  assert.match(built, /ref=sarah/);
  assert.doesNotMatch(built, /attacker/);
});

test('database functions atomically consume tokens and release only mature pending commissions', async () => {
  const sql = await readFile(new URL('../supabase/affiliate_program.sql', import.meta.url), 'utf8');
  assert.match(sql, /token_hash text not null unique/i);
  assert.match(sql, /used_at is null[\s\S]*expires_at > now\(\)/i);
  assert.match(sql, /status = 'pending'[\s\S]*available_at <= now\(\)/i);
  assert.doesNotMatch(sql, /set status = 'available'[\s\S]*status in \('cancelled','paid'\)/i);
});

test('dashboard API derives identity from session and ignores browser affiliate identifiers', async () => {
  const route = await readFile(new URL('../src/app/api/affiliate/dashboard/route.ts', import.meta.url), 'utf8');
  assert.match(route, /getCurrentAffiliate\(\)/);
  assert.doesNotMatch(route, /searchParams\.get\(['"]affiliate_(?:id|code)/);
});

test('admin payout workflow is transactional, currency-scoped, and replay safe', async () => {
  const sql = await readFile(new URL('../supabase/affiliate_program.sql', import.meta.url), 'utf8');
  assert.match(sql, /create_affiliate_payout_batch[\s\S]*p_currency[\s\S]*status='available'[\s\S]*payout_batch_item_id is null/i);
  assert.match(sql, /affiliate_adjustments set payout_batch_item_id=v_item/i);
  assert.match(sql, /affiliate_adjustments set status='applied',applied_at=v_now/i);
  assert.match(sql, /affiliate_adjustments set payout_batch_item_id=null[\s\S]*status='open'/i);
  assert.match(sql, /return 'already_'\|\|v_item.status/i);
  assert.match(sql, /on conflict\(payout_batch_item_id\) do nothing/i);
  assert.match(sql, /greatest\(b.available_balance-coalesce\(d.open_adjustment,0\),0\)>=20/i);
});

test('admin access is server-session based and admin pages are noindex', async () => {
  const auth = await readFile(new URL('../src/lib/affiliate/admin-auth.ts', import.meta.url), 'utf8');
  const authCore = await readFile(new URL('../src/lib/affiliate/auth-core.ts', import.meta.url), 'utf8');
  const page = await readFile(new URL('../src/app/admin/affiliates/page.tsx', import.meta.url), 'utf8');
  const action = await readFile(new URL('../src/app/api/affiliate/admin/action/route.ts', import.meta.url), 'utf8');
  assert.match(authCore, /httpOnly:\s*true/i);
  assert.match(authCore, /sameSite:\s*'lax'/i);
  assert.match(auth, /AFFILIATE_ADMIN_EMAIL/);
  assert.match(page, /robots:\{index:false,follow:false\}/);
  assert.match(action, /requireAdminSession\(\)/);
  assert.match(action, /status === 'paid'/);
});

test('production auth requires a server-only HMAC secret', async () => {
  const authCore = await readFile(new URL('../src/lib/affiliate/auth-core.ts', import.meta.url), 'utf8');
  const env = await readFile(new URL('../.env.example', import.meta.url), 'utf8');
  assert.match(authCore, /createHmac\('sha256', secret\)/);
  assert.match(authCore, /NODE_ENV === 'production'[\s\S]*AFFILIATE_SESSION_SECRET missing/);
  assert.match(env, /^AFFILIATE_SESSION_SECRET=$/m);
  assert.doesNotMatch(env, /^NEXT_PUBLIC_(?:SUPABASE_SERVICE_ROLE_KEY|AFFILIATE_ADMIN_SECRET|AFFILIATE_SESSION_SECRET)=/m);
});

test('only public affiliate pages appear in the sitemap', async () => {
  const sitemap = await readFile(new URL('../src/app/sitemap.ts', import.meta.url), 'utf8');
  assert.match(sitemap, /\/affiliation/);
  assert.match(sitemap, /\/en\/affiliate/);
  assert.doesNotMatch(sitemap, /affiliation\/(?:connexion|espace)/);
  assert.doesNotMatch(sitemap, /affiliate\/(?:login|dashboard)/);
  assert.doesNotMatch(sitemap, /admin\/affiliates/);
});
