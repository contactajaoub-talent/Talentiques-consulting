import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import {pathToFileURL} from 'node:url';import {randomUUID,randomBytes} from 'node:crypto';
import {digest,validateLead} from '../src/lib/monportfolio/core.ts';
test('MonPortfolio additive migration, persistence, idempotency and RLS on isolated PostgreSQL',{skip:!process.env.CRM_PGLITE_PATH,timeout:60000},async()=>{
 const root=process.env.CRM_PGLITE_PATH;const {PGlite}=await import(pathToFileURL(path.join(root,'dist/index.js')));const {pgcrypto}=await import(pathToFileURL(path.join(root,'dist/contrib/pgcrypto.js')));const db=new PGlite({extensions:{pgcrypto}});
 const q=async(s,p=[])=>(await db.query(s,p)).rows;const reset=()=>db.exec('reset role;reset request.jwt.claim.sub;');
 try{
 await db.exec("create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated,service_role;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;");
 for(const file of ['supabase/service_orders.sql','supabase/migrations/202610280001_crm_v1.sql','supabase/migrations/202611030001_monportfolio_leads.sql'])await db.exec(await fs.readFile(file,'utf8'));
 const admin=randomUUID(),sales=randomUUID(),other=randomUUID(),inactive=randomUUID();for(const [id,role] of [[admin,'admin'],[sales,'sales'],[other,'production'],[inactive,'admin']]){await q('insert into auth.users values($1)',[id]);await q('insert into crm_members(user_id,name,role,active) values($1,$2,$3,$4)',[id,'Synthetic',role,id!==inactive]);}
 const as=async(id)=>{await reset();await q("select set_config('request.jwt.claim.sub',$1,false)",[id]);await db.exec('set role authenticated');};
 const data=validateLead({name:'Test Person',country:'Maroc',payment:'PayPal',consent:true,utm:{campaign:'isolated'}}),key=digest(randomUUID()),hash=digest(JSON.stringify(data)),nonce=randomBytes(16).toString('hex');
 const create=async(k=key,h=hash,n=nonce,d=data)=>(await q('select monportfolio_create_lead($1,$2,$3,$4::jsonb) result',[k,h,n,JSON.stringify(d)]))[0].result;
 await db.exec('set role service_role');const a=await create();const retry=await create();assert.deepEqual(a,retry);assert.match(a.reference,/^MP-[A-F0-9]{32}$/);
 await assert.rejects(create(key,digest('changed')));await assert.rejects(create(digest(randomUUID()),hash,nonce));
 const second=await create(digest(randomUUID()),hash,randomBytes(16).toString('hex'));assert.notEqual(a.reference,second.reference);
 await reset();let saved=(await q('select * from monportfolio_leads where id=$1',[a.id]))[0];assert.equal(saved.name,data.name);assert.equal(saved.country,'Maroc');assert.equal(saved.source,'monportfolio.app');assert.equal(Number(saved.amount),100);assert.equal(saved.currency,'MAD');assert.equal(saved.payment_status,'unconfirmed');assert.equal(saved.status,'new');assert.equal(saved.consent,true);assert.deepEqual(saved.utm,data.utm);assert.equal((await q('select count(*)::int n from monportfolio_events where lead_id=$1',[a.id]))[0].n,1);
 await db.exec('set role anon');await assert.rejects(q('select id,name from monportfolio_leads'));await assert.rejects(create());
 await as(other);assert.equal((await q('select id,name from monportfolio_leads')).length,0);await assert.rejects(create());await assert.rejects(q('update monportfolio_leads set payment_status=\'paid\''));
 await as(admin);assert.equal((await q('select id,name from monportfolio_leads')).length,2);await assert.rejects(q('select idempotency_hash from monportfolio_leads'));await assert.rejects(q('select monportfolio_assign($1,$2)',[a.id,other]));await q('select monportfolio_assign($1,$2)',[a.id,sales]);
 await as(sales);assert.deepEqual((await q('select id from monportfolio_leads')).map(r=>r.id),[a.id]);assert.equal((await q('select * from monportfolio_events')).length,2);await assert.rejects(q('select monportfolio_assign($1,$2)',[a.id,other]));
 await as(inactive);assert.equal((await q('select id from monportfolio_leads')).length,0);await assert.rejects(q('select monportfolio_assign($1,$2)',[a.id,other]));
 await reset();assert.equal((await q('select count(*)::int n from crm_requests'))[0].n,0);assert.equal((await q('select count(*)::int n from crm_contacts'))[0].n,0);
 }finally{await db.close();}
});
