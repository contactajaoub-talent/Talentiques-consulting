// Run against a local build or an explicit Preview. External requests are blocked.
/* eslint-disable @typescript-eslint/no-require-imports -- Standalone Node harness, no bundler or extra project dependencies. */
// PLAYWRIGHT_MODULE may point to a preinstalled Playwright package (no project dependency needed).
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3100';
const baseOrigin = new URL(base).origin;
const screenshots = process.env.SMOKE_SCREENSHOT_DIR || os.tmpdir();
const routes = ['/', '/outils', '/outils/opportunity-tracker', '/outils/cv-ats', '/outils/bundle', '/outils/checkout?product=bundle', '/outils/acces', '/en', '/en/tools', '/en/tools/opportunity-tracker', '/en/tools/ats-resume', '/en/tools/bundle', '/en/tools/checkout?product=bundle', '/en/tools/access'];
const secondary = ['/en/resources', '/en/coaching', '/en/blog', '/en/resume-review', '/en/careers', '/en/careers/client-acquisition', '/en/terms', '/en/privacy', '/en/legal'];

(async () => {
  const browser = await chromium.launch({ headless: true, channel: process.env.SMOKE_BROWSER_CHANNEL || 'msedge' });
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [], failures = [], writes = [], screenshotsTaken = [];
  let createBody;
  let captureSuccess = false;
  page.on('pageerror', error => errors.push(error.message));
  await context.addInitScript(() => {
    window.__testEvents = [];
    for (const name of ['fbq', 'gtag', 'clarity']) {
      const callback = (...args) => window.__testEvents.push([name, ...args]);
      Object.defineProperty(window, name, { configurable: true, get: () => callback, set: () => {} });
    }
    window.__testPayPalOptions = null;
    window.paypal = { Buttons: options => { window.__testPayPalOptions = options; return { render: async selector => {
      const button = document.createElement('button'); button.textContent = 'OFFLINE PAYPAL TEST';
      button.onclick = () => options.createOrder().catch(() => {});
      document.querySelector(selector).append(button);
    } }; } };
  });
  await context.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.hostname === 'www.paypal.com' && url.pathname === '/sdk/js') return route.fulfill({ contentType: 'text/javascript', body: '// Offline SDK is supplied by the test harness.' });
    if (url.origin !== baseOrigin) return route.abort();
    if (request.method() !== 'GET') {
      writes.push(url.pathname);
      if (url.pathname === '/api/store/paypal/create-order') {
        createBody = request.postDataJSON();
        return route.fulfill({ json: { id: 'OFFLINE-ORDER' } });
      }
      if (url.pathname === '/api/store/paypal/capture-order') return route.fulfill({ status: captureSuccess ? 200 : 400, json: captureSuccess ? { ok: true, accessToken: 'offline-token', amount: '14.99', currency: 'USD' } : { error: 'Offline failure' } });
      if (url.pathname === '/api/salesforce-lead') return route.fulfill({ json: { ok: true } });
      return route.abort();
    }
    if (url.searchParams.get('token') === 'offline-token') return route.fulfill({ contentType: 'text/html', body: '<html lang="en"><body>Offline confirmed access navigation</body></html>' });
    return route.continue();
  });
  try {
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        const response = await page.goto(base + route, { waitUntil: 'networkidle' });
        assert.equal(response.status(), 200, `${route}: HTTP status`);
        await page.locator('h1').first().waitFor({ state: 'visible' });
        // The existing brand preloader deliberately covers the page for two seconds.
        await page.waitForTimeout(2300);
        const info = await page.evaluate(() => ({ lang: document.documentElement.lang, overflow: document.documentElement.scrollWidth > innerWidth + 1, canonical: document.querySelector('link[rel="canonical"]')?.href, robots: document.querySelector('meta[name="robots"]')?.content, title: document.title, content: document.body.innerText, scripts: [...document.scripts].map(s => s.id || s.src), events: window.__testEvents }));
        assert.equal(info.lang, route.startsWith('/en') ? 'en' : 'fr', `${route}: HTML language`);
        if (info.overflow) failures.push(`${width}px overflow: ${route}`);
        assert.ok(info.content.length > 100, `${route}: content`);
        if (route.includes('/acces') || route.includes('/access')) {
          assert.match(info.robots, /noindex/);
          assert.ok(!info.scripts.some(s => /store-meta-pixel|store-clarity|store-ga4/.test(s)), 'Access must not load tracking');
          assert.ok(!info.events.some(e => /purchase/i.test(String(e[2]))));
        } else if (!route.includes('checkout')) assert.equal(info.canonical, 'https://www.talentiques.com' + route);
        if (width === 375 || (width === 1440 && ['/en', '/en/tools', '/en/tools/bundle', '/en/tools/checkout?product=bundle', '/outils'].includes(route))) {
          const file = path.join(screenshots, `talentiques-${width}-${route.replace(/[^a-z0-9]/gi, '_') || 'home'}.png`);
          await page.screenshot({ path: file, fullPage: true }); screenshotsTaken.push(file);
        }
      }
    }
    for (const route of secondary) {
      assert.equal((await page.goto(base + route, { waitUntil: 'networkidle' })).status(), 200, route);
      assert.equal(await page.locator('html').getAttribute('lang'), 'en');
    }
    await page.goto(base + '/en/tools/opportunity-tracker?utm_source=meta&utm_medium=paid&utm_campaign=english&utm_content=video&utm_term=career&fbclid=offline-fb&gclid=offline-g', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2300);
    await page.getByRole('link', { name: 'FR', exact: true }).click();
    await page.waitForURL('**/outils/opportunity-tracker?**');
    assert.equal(new URL(page.url()).searchParams.get('utm_campaign'), 'english');
    await page.waitForTimeout(2300);
    await page.getByRole('link', { name: 'EN', exact: true }).click();
    await page.waitForURL('**/en/tools/opportunity-tracker?**');
    await page.waitForTimeout(2300);
    await page.getByRole('link', { name: /Get Opportunity Tracker Pro/ }).first().click();
    await page.waitForURL('**/en/tools/checkout?**');
    assert.equal(new URL(page.url()).searchParams.get('gclid'), 'offline-g');
    assert.equal(new URL(page.url()).searchParams.get('product'), 'tracker');

    await page.goto(base + '/en/tools/checkout?product=bundle', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2300);
    await page.locator('input[name="fullName"]').fill('Offline Test');
    await page.locator('input[name="email"]').fill('offline@example.test');
    await page.locator('input[name="phone"]').fill('+14155550123');
    await page.locator('input[name="country"]').fill('Canada');
    await page.locator('select').selectOption({ label: 'Job seeker' });
    await page.locator('input[type="checkbox"]').check();
    if (await page.getByRole('button', { name: 'OFFLINE PAYPAL TEST' }).count()) {
      await page.getByRole('button', { name: 'OFFLINE PAYPAL TEST' }).click();
      await page.waitForTimeout(100);
      assert.equal(createBody.market, 'en'); assert.equal(createBody.productId, 'bundle');
      assert.equal(createBody.tracking.utm_campaign, 'english'); assert.equal(Object.keys(createBody.tracking).length, 7);
      assert.equal(createBody.customer.currentStatus, 'En recherche d’emploi');
      await page.evaluate(async () => { try { await window.__testPayPalOptions.onApprove({ orderID: 'OFFLINE-ORDER' }); } catch {} });
      assert.ok(!(await page.evaluate(() => window.__testEvents)).some(e => e[2] === 'Purchase'));
      captureSuccess = true;
      // Capture is intercepted above. This never reaches the application backend or PayPal.
      await page.evaluate(async () => { await window.__testPayPalOptions.onApprove({ orderID: 'OFFLINE-ORDER' }); });
      await page.waitForURL('**/en/tools/access?token=offline-token');
    } else console.log('CHECKOUT_API_SIMULATION_SKIPPED: public PayPal client ID absent; form rendered and validated.');

    await page.goto(base + '/en/coaching', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2300);
    await page.getByLabel('First name', { exact: true }).fill('Offline');
    await page.getByLabel('Last name', { exact: true }).fill('Test');
    await page.getByLabel('Email', { exact: true }).fill('offline@example.test');
    await page.getByLabel('Your goals and current challenges').fill('Offline browser test. This request is intercepted and never submitted.');
    await page.locator('input[name="privacy"]').check();
    await page.getByRole('button', { name: 'Send my request' }).click();
    await page.getByText('Thank you. Your request has been submitted.').waitFor();
    assert.deepEqual(errors, [], 'Browser JavaScript errors');
    assert.deepEqual(failures, [], 'Responsive failures');
    console.log(JSON.stringify({ result: 'PASS', responsiveChecks: routes.length * 3, secondaryPages: secondary.length, consoleErrors: errors, overflow: failures, interceptedWrites: writes, screenshots: screenshotsTaken }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
