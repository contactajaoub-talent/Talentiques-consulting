import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {randomUUID,randomBytes} from 'node:crypto';
export const phoneMigration='supabase/migrations/20261106182205_monportfolio_phone.sql';
export const priceMigration='supabase/migrations/20261109140809_monportfolio_eur_price.sql';
export async function fixture({withPhone=true,withPrice=withPhone}={}){
 if(!process.env.CRM_PGLITE_PATH)throw Error('CRM_PGLITE_PATH required: isolated database only');
 const root=process.env.CRM_PGLITE_PATH;
 const {PGlite}=await import(pathToFileURL(path.join(root,'dist/index.js')));
 const {pgcrypto}=await import(pathToFileURL(path.join(root,'dist/contrib/pgcrypto.js')));
 const db=new PGlite({extensions:{pgcrypto}}),q=async(s,p=[])=>(await db.query(s,p)).rows;
 await db.exec("create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth to anon,authenticated,service_role;create schema storage;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;");
 for(const f of ['supabase/service_orders.sql','supabase/migrations/202610280001_crm_v1.sql','supabase/migrations/202611010001_career_quote.sql','supabase/migrations/202611030001_monportfolio_leads.sql','supabase/migrations/202611050001_monportfolio_pipeline.sql',...(withPhone?[phoneMigration]:[]),...(withPrice?[priceMigration]:[])])await db.exec(await fs.readFile(f,'utf8'));
 const users={admin:randomUUID(),sales:randomUUID(),production:randomUUID(),other:randomUUID(),inactive:randomUUID()};
 for(const [name,id] of Object.entries(users)){
  await q('insert into auth.users values($1)',[id]);
  await q('insert into crm_members(user_id,name,role,active) values($1,$2,$3,$4)',[id,'Synthetic '+name,name==='other'?'production':name==='inactive'?'admin':name,name!=='inactive']);
 }
 const as=async(name)=>{await db.exec('reset role;reset request.jwt.claim.sub');if(users[name]){await q("select set_config('request.jwt.claim.sub',$1,false)",[users[name]]);await db.exec('set role authenticated');}else if(name)await db.exec('set role '+({'service':'service_role','anon':'anon'}[name]));};
 const rpc=async(fn,data={})=>{if(!/^(monportfolio_[a-z_]+|crm_rate_limit)$/.test(fn))throw Error('Function not permitted');const keys=Object.keys(data);if(!keys.every(k=>/^p_[a-z_]+$/.test(k)))throw Error('Parameter invalid');return (await q(`select ${fn}(${keys.map((k,i)=>`${k}=>$${i+1}`).join(',')}) result`,Object.values(data).map(v=>v&&typeof v==='object'?JSON.stringify(v):v)))[0].result;};
 const action=(id,name,data={})=>rpc('monportfolio_action',{p_id:id,p_action:name,p_data:data});
 return {db,q,users,as,rpc,action,nonce:()=>randomBytes(16).toString('hex')};
}
