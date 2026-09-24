// Offline regression tests. All external delivery/storage/order operations are stubbed.
/* eslint-disable @typescript-eslint/no-require-imports -- This standalone Node test harness intentionally uses CommonJS. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

function loader({ mocks = {}, globals = {}, env = {} } = {}) {
  const cache = new Map();
  function load(name, parent = root) {
    if (Object.hasOwn(mocks, name)) return mocks[name];
    if (!name.startsWith('@/') && !name.startsWith('.')) return require(name);
    const base = name.startsWith('@/') ? path.join(root, 'src', name.slice(2)) : path.resolve(parent, name);
    const file = [base, base + '.ts', base + '.tsx'].find(p => fs.existsSync(p) && fs.statSync(p).isFile());
    assert.ok(file, `Missing module ${name}`);
    if (cache.has(file)) return cache.get(file).exports;
    const mod = { exports: {} };
    cache.set(file, mod);
    const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
    }, fileName: file }).outputText;
    vm.runInNewContext(source, { module: mod, exports: mod.exports, require: n => load(n, path.dirname(file)),
      process: { env }, URL, URLSearchParams, Request, Response, AbortSignal, console: { ...console, error() {} }, ...globals,
    }, { filename: file });
    return mod.exports;
  }
  return load;
}
const configured = { NEXT_PUBLIC_APP_URL: 'https://preview.example.test', STORE_TRACKER_PACKAGE_EN_URL: 'https://files.example.test/tracker.zip', STORE_ATS_PACKAGE_EN_URL: 'https://files.example.test/ats.zip' };

test('catalog and reciprocal language routes preserve the two markets', () => {
  const load = loader();
  const { getStoreProduct } = load('@/lib/store/catalog');
  for (const [market, currency, amounts] of [['fr', 'EUR', ['7.90', '9.90', '14.90']], ['en', 'USD', ['7.99', '9.99', '14.99']]]) {
    ['tracker', 'ats', 'bundle'].forEach((id, i) => { const p = getStoreProduct(id, market); assert.equal(p.currency, currency); assert.equal(p.amount, amounts[i]); });
  }
  const { languageRoutes, equivalentPath, localizedMetadata } = load('@/lib/i18n');
  for (const [fr, en] of languageRoutes) {
    assert.equal(equivalentPath(fr, 'en'), en); assert.equal(equivalentPath(en, 'fr'), fr);
    assert.equal(localizedMetadata(en, 'Test', 'Description').alternates.canonical, 'https://www.talentiques.com' + en);
  }
  assert.equal(equivalentPath('/unknown', 'en'), '/en');
});

test('tracking uses catalog amounts, emits one product event per call and deduplicates purchases', () => {
  const events = [];
  const saved = new Map();
  const window = { fbq: (...args) => events.push(['meta', ...args]), gtag: (...args) => events.push(['ga', ...args]), clarity: (...args) => events.push(['clarity', ...args]), sessionStorage: { getItem: k => saved.get(k), setItem: (k, v) => saved.set(k, v) } };
  const load = loader({ globals: { window } });
  const a = load('@/lib/store/analytics');
  const catalog = load('@/lib/store/catalog');
  for (const market of ['fr', 'en']) {
    events.length = 0;
    a.trackStorePage(market === 'fr' ? '/outils' : '/en/tools');
    assert.equal(events.filter(e => e[2] === 'view_item_list').length, 1);
    assert.equal(events.filter(e => e[2] === 'ViewContent').length, 0);
    for (const [id, slug] of [['tracker', 'opportunity-tracker'], ['ats', market === 'fr' ? 'cv-ats' : 'ats-resume'], ['bundle', 'bundle']]) {
      events.length = 0;
      a.trackStorePage(`${market === 'fr' ? '/outils' : '/en/tools'}/${slug}`);
      assert.deepEqual(events.map(e => e[2]), ['PageView', 'ViewContent', 'view_item', 'store_product_view']);
      assert.equal(events[1][3].value, Number(catalog.getStoreProduct(id, market).amount));
      assert.equal(events[1][3].currency, market === 'fr' ? 'EUR' : 'USD');
      a.trackStoreProductClick(id, market);
      a.trackStoreCheckoutStarted(catalog.getStoreProduct(id, market));
      assert.equal(events.filter(e => e[2] === 'select_item').length, 1);
      assert.equal(events.filter(e => e[2] === 'begin_checkout').length, 1);
    }
    events.length = 0;
    a.trackStorePage(market === 'fr' ? '/outils/acces' : '/en/tools/access');
    assert.ok(!events.some(e => /purchase/i.test(e[2])));
  }
  events.length = 0;
  const purchase = { product: catalog.getStoreProduct('bundle', 'en'), transactionId: 'OFFLINE-TEST', amount: 14.99, currency: 'USD' };
  assert.equal(a.trackStorePurchaseOnce(purchase), true);
  assert.equal(a.trackStorePurchaseOnce(purchase), false);
  assert.deepEqual(events.map(e => e[2]), ['Purchase', 'purchase', 'store_purchase']);
  assert.ok(!/customer|email|phone|fullName|access_token/.test(JSON.stringify(events)));
});

test('all seven attribution keys survive navigation without storing other query data', () => {
  const saved = new Map();
  const window = { location: { search: '?utm_source=meta&utm_medium=paid&utm_campaign=en&utm_content=video&utm_term=career&fbclid=fb-test&gclid=g-test&email=do-not-store&token=do-not-store' }, sessionStorage: { getItem: k => saved.get(k), setItem: (k, v) => saved.set(k, v) } };
  const a = loader({ globals: { window } })('@/lib/store/attribution');
  a.rememberStoreAttribution(); window.location.search = '';
  assert.equal(Object.keys(a.readStoreAttribution()).length, 7);
  assert.ok(!JSON.stringify([...saved.values()]).includes('do-not-store'));
  window.location.search = '?utm_campaign=new';
  assert.equal(a.readStoreAttribution().utm_campaign, 'new');
});

test('FR/EN delivery items always use absolute token-protected routes and correct entitlements', () => {
  const { getDeliveryItems } = loader({ env: configured, mocks: { '@/lib/store/supabase-rest': {} } })('@/lib/store/delivery');
  for (const market of ['fr', 'en']) for (const id of ['tracker', 'ats', 'bundle']) {
    const items = getDeliveryItems(id, market, 'offline-token');
    assert.equal(items.length, id === 'bundle' ? 2 : 1);
    for (const item of items) {
      const url = new URL(item.url);
      assert.equal(url.origin, configured.NEXT_PUBLIC_APP_URL);
      assert.equal(url.pathname, '/api/store/download');
      assert.equal(url.searchParams.get('token'), 'offline-token');
      if (id !== 'bundle') assert.equal(url.searchParams.get('item'), id);
      assert.ok(!item.url.includes('files.example.test'));
    }
  }
});

test('delivery renders HTML and text in both languages; sent and claimed orders never resend', async () => {
  for (const market of ['fr', 'en']) {
    const sends = [], updates = [];
    let deliveryStatus = 'pending', claim = true;
    const load = loader({ env: { ...configured, RESEND_API_KEY: 'offline-not-a-key' }, mocks: {
      resend: { Resend: class { emails = { send: async message => { sends.push(message); return { data: { id: 'offline-email' } }; } }; } },
      '@/lib/store/supabase-rest': { findStoreOrderById: async () => ({ id: 'offline', status: 'paid', delivery_status: deliveryStatus, market, product_id: 'bundle', access_token: 'offline-token', customer_email: 'test@example.test', customer_name: 'Test Person' }), claimOrderDelivery: async () => claim, updateStoreOrder: async (_, changes) => updates.push(changes) },
    } });
    const { deliverPaidStoreOrder } = load('@/lib/store/delivery');
    assert.equal((await deliverPaidStoreOrder('offline')).status, 'sent');
    assert.equal(sends.length, 1);
    assert.equal(typeof sends[0].html, 'string'); assert.equal(typeof sends[0].text, 'string');
    assert.ok(sends[0].html.includes(market === 'en' ? '/en/tools/access?' : '/outils/acces?'));
    assert.ok(sends[0].text.includes(market === 'en' ? 'Access your product' : 'Accéder à mon espace'));
    assert.ok(!('react' in sends[0]));
    assert.equal(updates.at(-1).delivery_status, 'sent');
    deliveryStatus = 'sent';
    await deliverPaidStoreOrder('offline'); assert.equal(sends.length, 1);
    deliveryStatus = 'pending'; claim = false;
    assert.equal((await deliverPaidStoreOrder('offline')).status, 'already_processing'); assert.equal(sends.length, 1);
  }
});

test('secure downloads reject unpaid/wrong-product requests and stream both markets without redirects', async () => {
  let order = null, blobCalls = 0, sourceCalls = 0;
  const load = loader({ env: configured, globals: { fetch: async () => { sourceCalls++; return new Response('offline-package'); } }, mocks: {
    '@vercel/blob': { get: async () => { blobCalls++; return { statusCode: 200, stream: new Response('offline-blob').body, blob: { contentType: 'application/zip' } }; } },
    '@/lib/store/supabase-rest': { findStoreOrderByAccessToken: async () => order },
  } });
  const { GET } = load('@/app/api/store/download/route');
  const request = item => new Request(`https://preview.example.test/api/store/download?token=offline-token&item=${item}`);
  assert.equal((await GET(new Request('https://preview.example.test/api/store/download'))).status, 400);
  assert.equal((await GET(request('tracker'))).status, 403);
  order = { status: 'pending', product_id: 'bundle', market: 'en' };
  assert.equal((await GET(request('tracker'))).status, 403);
  order = { status: 'paid', product_id: 'tracker', market: 'en' };
  assert.equal((await GET(request('ats'))).status, 403);
  assert.equal(blobCalls + sourceCalls, 0);
  for (const market of ['fr', 'en']) {
    order = { status: 'paid', product_id: 'bundle', market };
    for (const item of ['tracker', 'ats']) {
      const response = await GET(request(item));
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('location'), null);
      assert.equal(response.headers.get('cache-control'), 'private, no-store');
      await response.text();
    }
  }
  assert.equal(blobCalls, 2); assert.equal(sourceCalls, 2);
});
