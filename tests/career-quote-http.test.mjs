// HTTP boundary test: real Next routes + real isolated PostgreSQL; Supabase Storage/Auth are emulated.
// Never uses production credentials, sends mail, or contacts an external host.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { submitCareerQuote } from '../src/lib/services/career-quote-client.ts';

test('HTTP quote flow saves a private CV, retries without duplicate, and enforces staff-only downloads', { skip: !process.env.CRM_PGLITE_PATH, timeout: 60000 }, async () => {
  const root = process.env.CRM_PGLITE_PATH;
  const { PGlite } = await import(pathToFileURL(path.join(root, 'dist/index.js')).href);
  const { pgcrypto } = await import(pathToFileURL(path.join(root, 'dist/contrib/pgcrypto.js')).href);
  const db = new PGlite({ extensions: { pgcrypto } });
  const admin = randomUUID(), other = randomUUID(), files = new Map(), caps = new Map();
  const serviceKey = 'isolated-test-service', app = 'http://127.0.0.1:3137';
  let backendOrigin, chain = Promise.resolve(), failReadOnce = false, signedSeconds;
  const q = async (sql, params = []) => (await db.query(sql, params)).rows;
  await db.exec("create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to authenticated,anon,service_role;grant execute on function auth.uid() to authenticated,anon,service_role;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;");
  for (const file of ['supabase/service_orders.sql', 'supabase/migrations/202610280001_crm_v1.sql', 'supabase/migrations/202611010001_career_quote.sql']) await db.exec(await readFile(file, 'utf8'));
  for (const [id, role] of [[admin, 'admin'], [other, 'production']]) {
    await q('insert into auth.users values($1)', [id]);
    await q('insert into crm_members(user_id,name,role) values($1,$2,$3)', [id, 'Synthetic staff', role]);
  }
  const server = createServer((req, res) => {
    chain = chain.then(async () => {
      const respond = (body, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(body)); };
      try {
        const url = new URL(req.url, backendOrigin), auth = req.headers.authorization;
        const chunks = []; for await (const chunk of req) chunks.push(chunk);
        const bytes = Buffer.concat(chunks);
        const isService = auth === `Bearer ${serviceKey}`;
        const user = auth === 'Bearer local-admin' ? admin : auth === 'Bearer local-other' ? other : null;
        if (url.pathname === '/auth/v1/user') return respond(user ? { id: user } : {}, user ? 200 : 401);
        if (url.pathname.startsWith('/storage/v1/')) {
          const p = decodeURIComponent(url.pathname.slice('/storage/v1'.length));
          const uploadPrefix = '/object/upload/sign/crm-documents/';
          if (p.startsWith(uploadPrefix)) {
            const name = p.slice(uploadPrefix.length);
            if (req.method === 'POST' && isService) {
              const token = randomUUID(); caps.set(token, name);
              return respond({ url: `${uploadPrefix}${name}?token=${token}` });
            }
            if (req.method !== 'PUT' || caps.get(url.searchParams.get('token')) !== name) return respond({}, 403);
            if (files.has(name)) return respond({ error: 'Duplicate', statusCode: '409' }, 409);
            if (bytes.length > 5 * 1024 * 1024) return respond({}, 413);
            files.set(name, bytes); return respond({});
          }
          const privatePrefix = '/object/authenticated/crm-documents/';
          if (p.startsWith(privatePrefix)) {
            if (!isService) return respond({}, 403);
            if (failReadOnce) { failReadOnce = false; return respond({}, 503); }
            const file = files.get(p.slice(privatePrefix.length));
            if (!file) return respond({}, 404);
            res.writeHead(200, { 'Content-Type': 'application/pdf', 'Content-Length': file.length }); return res.end(file);
          }
          if (p === '/object/crm-documents' && req.method === 'DELETE' && isService) {
            for (const name of JSON.parse(bytes.toString()).prefixes) files.delete(name);
            return respond({});
          }
          if (p.startsWith('/object/sign/crm-documents/') && isService) {
            signedSeconds = JSON.parse(bytes.toString()).expiresIn;
            return respond({ signedURL: `${p}?token=isolated-download` });
          }
          return respond({}, 403); // No public read path, even if the path is known.
        }
        await db.exec('reset role; reset request.jwt.claim.sub;');
        if (user) { await q("select set_config('request.jwt.claim.sub',$1,false)", [user]); await db.exec('set role authenticated'); }
        else if (isService) await db.exec('set role service_role');
        else await db.exec('set role anon');
        const body = bytes.length ? JSON.parse(bytes.toString()) : {};
        if (url.pathname.startsWith('/rest/v1/rpc/')) {
          const fn = url.pathname.split('/').at(-1);
          assert.ok(['crm_rate_limit', 'crm_commit_career_quote'].includes(fn));
          const keys = Object.keys(body); assert.ok(keys.every(key => /^p_[a-z_]+$/.test(key)));
          return respond((await q(`select ${fn}(${keys.map((key, i) => `${key}=>$${i + 1}`).join(',')}) as value`, Object.values(body)))[0].value);
        }
        const table = url.pathname.split('/').at(-1);
        assert.ok(['crm_uploads', 'crm_settings', 'crm_members', 'crm_documents'].includes(table));
        if (req.method === 'POST' && table === 'crm_uploads') {
          await q('insert into crm_uploads(id,token_hash,path,member_id,payload) values($1,$2,$3,$4,$5)', [body.id, body.token_hash, body.path, body.member_id, JSON.stringify(body.payload)]);
          return respond({}, 201);
        }
        assert.equal(req.method, 'GET');
        const values = [], clauses = [];
        for (const [key, value] of url.searchParams) {
          if (['select', 'limit'].includes(key)) continue;
          assert.ok(['id', 'token_hash', 'user_id', 'active', 'deleted_at'].includes(key));
          if (value === 'is.null') clauses.push(`${key} is null`);
          else { assert.ok(value.startsWith('eq.')); values.push(value.slice(3)); clauses.push(`${key}=$${values.length}`); }
        }
        return respond(await q(`select * from ${table}${clauses.length ? ` where ${clauses.join(' and ')}` : ''} limit 100`, values));
      } catch (error) { console.error('Isolated fixture error:', error.message); respond({ message: 'Isolated fixture refused this operation.' }, 503); }
    });
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  backendOrigin = `http://127.0.0.1:${server.address().port}`;
  const next = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3137'], {
    env: { ...process.env, NODE_ENV: 'production', VERCEL_ENV: '', CAREER_QUOTE_ENABLED: 'true', SUPABASE_URL: backendOrigin, SUPABASE_ANON_KEY: 'isolated-anon', SUPABASE_SERVICE_ROLE_KEY: serviceKey, CRM_RATE_LIMIT_SECRET: 'isolated-test-rate-limit-secret', NEXT_PUBLIC_APP_URL: app }, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true,
  });
  try {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Local Next server did not start.')), 30000);
      next.stdout.on('data', data => { if (String(data).includes('Ready in')) { clearTimeout(timer); resolve(); } });
      next.once('exit', code => { clearTimeout(timer); reject(new Error(`Local Next server exited: ${code}`)); });
    });
    const send = (url, init) => {
      const target = new URL(url, app);
      assert.ok([app, backendOrigin].includes(target.origin), 'Tests must never contact an external host');
      return fetch(target, { ...init, headers: { ...init?.headers, Origin: app } });
    };
    const form = new FormData();
    for (const [key, value] of Object.entries({ fullName: 'Synthetic Candidate', email: 'synthetic@example.test', phone: '+33 6 12 34 56 78', country: 'France', ancienClient: 'Non', situation: 'Étudiant', experience: 'Étudiant / débutant', objectifProfessionnel: 'Stage PFE en conseil', mobilite: 'Internationale', privacy: 'on' })) form.set(key, value);
    for (const [key, values] of Object.entries({ opportunites: ['Stage PFE'], postes: ['Consultant', 'Chef de projet'], paysCibles: ['FR', 'CA'] })) for (const value of values) form.append(key, value);
    const pdf = '%PDF-1.7\n/Type /Page\n' + ' '.repeat(4_700_000) + '\n%%EOF';
    form.set('cv', new File([pdf], 'synthetic.pdf', { type: 'application/pdf' }));
    const state = { current: null };
    failReadOnce = true;
    let initialError;
    await assert.rejects(submitCareerQuote(form, state, send), error => { initialError = error.message; return true; });
    assert.equal(files.size, 1, `Storage outage must not delete the uploaded CV (${initialError})`);
    const result = await submitCareerQuote(form, state, send);
    assert.deepEqual(await submitCareerQuote(form, state, send), result);
    await chain; await db.exec('reset role');
    assert.equal((await q('select count(*)::int as n from crm_requests'))[0].n, 1);
    assert.equal((await q('select count(*)::int as n from service_orders'))[0].n, 0);
    assert.equal((await q('select count(*)::int as n from crm_outbox'))[0].n, 0);
    const document = (await q('select * from crm_documents where id=$1', [result.documentId]))[0];
    assert.equal(document.request_id, result.requestId);
    assert.equal((await fetch(`${backendOrigin}/storage/v1/object/public/crm-documents/${document.path}`)).status, 403);
    assert.equal((await fetch(`${app}/api/crm/documents?id=${document.id}`)).status, 401);
    assert.equal((await fetch(`${app}/api/crm/documents?id=${document.id}`, { headers: { Cookie: 'tq_crm_access=local-other' } })).status, 404);
    const download = await fetch(`${app}/api/crm/documents?id=${document.id}`, { headers: { Cookie: 'tq_crm_access=local-admin' } });
    assert.equal(download.status, 200); assert.ok((await download.json()).url.includes('isolated-download')); assert.equal(signedSeconds, 120);
    const rejected = await send('/api/crm/career-quote', { method: 'PUT', body: JSON.stringify({ uploadId: state.current.uploadId, token: '0'.repeat(64) }) });
    assert.equal(rejected.status, 404);
    const forbiddenOrigin = await fetch(`${app}/api/crm/career-quote`, { method: 'POST', headers: { Origin: 'https://untrusted.example.test' }, body: '{}' });
    assert.equal(forbiddenOrigin.status, 403);
    const otherIntake = await send('/api/crm/intake', { method: 'PUT', body: JSON.stringify({ uploadId: state.current.uploadId, token: state.current.token }) });
    assert.equal(otherIntake.status, 404, 'Generic intake must not bypass the quote gateway');
    const invalid = new FormData(); for (const [key, value] of form) invalid.append(key, value);
    invalid.set('cv', new File(['This is not a PDF.'.repeat(20)], 'invalid.pdf', { type: 'application/pdf' }));
    await assert.rejects(submitCareerQuote(invalid, { current: null }, send));
    assert.equal(files.size, 1, 'Only the invalid pending upload is deleted');
    await chain; await db.exec('reset role');
    assert.equal((await q('select count(*)::int as n from crm_requests'))[0].n, 1);
  } finally {
    if (next.exitCode === null && next.signalCode === null) { const exited = once(next, 'exit'); next.kill(); await exited; }
    server.close(); await once(server, 'close'); await chain; await db.close(); files.clear(); caps.clear();
  }
});
