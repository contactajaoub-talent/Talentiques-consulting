import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID,randomBytes} from 'node:crypto';
import {fixture,phoneMigration,priceMigration} from './monportfolio-fixture.mjs';
import {digest,validateLead} from '../src/lib/monportfolio/core.ts';
import {capability,dossierAnswers} from '../src/lib/monportfolio/dossier.ts';
import {fileMetadata,validateFile} from '../src/lib/crm/files.ts';
test('short dossier validation, bearer tokens, CV signatures and size',()=>{
 assert.deepEqual(dossierAnswers({objective:'employment',consent:true}),{objective:'employment',consent:true,other:'',projects:'',achievements:''});
 for(const b of [{},{consent:false,objective:'image'},{consent:true,objective:'other'},{consent:true,objective:'employment',projects:'x'.repeat(3001)}])assert.throws(()=>dossierAnswers(b));
 assert.throws(()=>capability(new Request('https://example.com/?token=MP-123')));
 const raw=randomBytes(32).toString('hex');assert.equal(capability(new Request('https://example.com/',{headers:{Authorization:'Bearer '+raw}})),digest(raw));
 const pdf=Buffer.from('%PDF-1.4\n/Type /Page\n'+ ' '.repeat(100)+'\n%%EOF\n');validateFile(pdf,fileMetadata('cv.pdf',pdf.length));
 for(const bytes of [Buffer.alloc(120),Buffer.from('%PDF-1.4\n/JavaScript /Type /Page\n'+' '.repeat(100)+'\n%%EOF')])assert.throws(()=>validateFile(bytes,fileMetadata('cv.pdf',bytes.length)));
 assert.throws(()=>fileMetadata('image.png',1000));assert.throws(()=>fileMetadata('cv.pdf',5242881));
});
test('Phase 4 real PostgreSQL: complete lifecycle, isolation, immutable receipt and retention',{timeout:60000},async t=>{
 const f=await fixture(),{db,q,as,rpc,action,users}=f;
 const data=validateLead({name:'Test Synthetic',country:'Maroc',payment:'PayPal',consent:true});
 const create=async(d=data,key=digest(randomUUID()))=>{await as('service');return rpc('monportfolio_create_lead',{p_key:key,p_payload_hash:digest(JSON.stringify(d)),p_nonce:f.nonce(),p_data:d});};
 try{
  const key=digest(randomUUID()),a=await create(data,key);assert.deepEqual(a,await create(data,key));
  const intl=await create({...data,country:'France',payment:'Carte bancaire',amount:1,currency:'USD'});
  await as();let row=(await q('select * from monportfolio_leads where id=$1',[intl.id]))[0];assert.equal(Number(row.amount),25);assert.equal(row.currency,'EUR');assert.equal(row.payment_status,'unconfirmed');assert.equal(row.phone,null);
  await t.test('RLS, table grants, no anonymous financial or token access',async()=>{
   await as();await db.exec("grant usage on schema storage to anon,authenticated;grant select,insert on storage.objects to anon,authenticated;create policy legacy_storage_public on storage.objects for all to anon,authenticated using(true) with check(true);insert into storage.objects(bucket_id,name) values('monportfolio-cvs','private.pdf'),('unrelated','public.pdf');");
   for(const role of ['anon','sales','production','inactive']){await as(role);await assert.rejects(q('select * from monportfolio_links'));await assert.rejects(q('select * from monportfolio_payments'));await assert.rejects(q('select * from monportfolio_dossiers'));await assert.rejects(action(a.id,'payment_confirm',{amount:100,currency:'MAD',method:'PayPal'}));}
   await as('anon');assert.equal((await q("select * from storage.objects where bucket_id='monportfolio-cvs'")).length,0);assert.equal((await q("select * from storage.objects where bucket_id='unrelated'")).length,1);await assert.rejects(q("insert into storage.objects(bucket_id,name) values('monportfolio-cvs','forged.pdf')"));
   await as('admin');await assert.rejects(q('select token_hash from monportfolio_links'));await assert.rejects(q('select idempotency_hash from monportfolio_leads'));await assert.rejects(q('select phone from monportfolio_leads'));
   await assert.rejects(action(a.id,'link_generated',{hash:digest('before payment')}));await assert.rejects(action(a.id,'production'));await assert.rejects(action(a.id,'complete'));
   await as('anon');await assert.rejects(rpc('monportfolio_access',{p_hash:digest('x')}));
  });
  await as('admin');await action(a.id,'assigned',{owner:users.sales});await action(a.id,'assigned',{owner:users.production,kind:'production'});
  await as('sales');assert.equal((await rpc('monportfolio_snapshot',{})).data.length,1);await assert.rejects(action(a.id,'payment_confirm',{amount:100,currency:'MAD',method:'PayPal'}));
  await as('admin');await action(a.id,'payment_pending');await action(a.id,'payment_confirm',{amount:25,currency:'EUR',method:'PayPal'});await action(a.id,'payment_confirm',{amount:25,currency:'EUR',method:'PayPal'});
  const raw=randomBytes(32).toString('hex'),hash=digest(raw);await action(a.id,'link_generated',{hash});await action(a.id,'form_sent');
  await t.test('Token expiry, revocation, regeneration and wrong client',async()=>{
   await as('service');assert.equal((await rpc('monportfolio_access',{p_hash:hash})).reference,a.reference);await assert.rejects(rpc('monportfolio_access',{p_hash:digest('other')}));
   await as();await q("update monportfolio_links set expires_at=now()-interval '1 second' where token_hash=$1",[hash]);
   await as('service');await assert.rejects(rpc('monportfolio_access',{p_hash:hash}));
   await as('admin');await action(a.id,'link_generated',{hash:digest('temporary')});await action(a.id,'link_revoked');
   await as('service');await assert.rejects(rpc('monportfolio_access',{p_hash:digest('temporary')}));
   await as('admin');await action(a.id,'link_generated',{hash:digest('current')});
  });
  const live=digest('current');await as('service');const upload=await rpc('monportfolio_prepare',{p_hash:live,p_key:randomUUID(),p_name:'cv.pdf',p_size:150,p_mime:'application/pdf',p_ext:'pdf'});
  await assert.rejects(rpc('monportfolio_upload',{p_hash:hash,p_upload:upload.id}));
  const args={p_hash:live,p_upload:upload.id,p_data:{objective:'employment',consent:true},p_cv_hash:digest('verified bytes')};
  const received=await rpc('monportfolio_submit',args);assert(received.submitted);assert.deepEqual(received,await rpc('monportfolio_submit',{...args,p_data:{objective:'image',consent:true}}));
  await t.test('No duplicate contact, one receipt and no overwrite on retry',async()=>{
   await as();assert.equal((await q('select count(*)::int n from monportfolio_leads'))[0].n,2);assert.equal((await q('select count(*)::int n from crm_contacts'))[0].n,0);assert.equal((await q("select count(*)::int n from monportfolio_events where action='received'"))[0].n,1);
   assert.equal((await q('select objective from monportfolio_dossiers where lead_id=$1',[a.id]))[0].objective,'employment');
   assert.equal((await q('select count(*)::int n from monportfolio_payments'))[0].n,1);
  });
  await t.test('Production projection excludes all financial fields; CV scoped to assignment',async()=>{
   await as('production');const view=await rpc('monportfolio_snapshot',{p_id:a.id});assert(!('amount'in view));assert(!('payment'in view));assert(!('utm'in view));assert(!('cv_path'in view.dossier));assert((await rpc('monportfolio_document',{p_id:a.id})).path);
   await assert.rejects(rpc('monportfolio_document',{p_id:intl.id}));await assert.rejects(action(a.id,'link_generated',{hash:digest('forged')}));await assert.rejects(action(a.id,'delivered',{url:'https://example.com'}));
   await as('other');assert.deepEqual((await rpc('monportfolio_snapshot',{})).data,[]);await assert.rejects(rpc('monportfolio_document',{p_id:a.id}));
   await as('inactive');assert.equal((await q('select id from monportfolio_leads')).length,0);
  });
  await as('production');await action(a.id,'needs_info');await action(a.id,'complete');let snap=await rpc('monportfolio_snapshot',{p_id:a.id});assert.equal(Date.parse(snap.dossier.due_at)-Date.parse(snap.dossier.complete_at),86400000);
  await action(a.id,'production');await as('admin');await assert.rejects(action(a.id,'delivered'));await action(a.id,'delivered',{url:'https://example.com/portfolio'});await action(a.id,'revision_requested');await assert.rejects(action(a.id,'revision_requested'));await action(a.id,'revision_done');await assert.rejects(action(a.id,'revision_requested'));await action(a.id,'finished');
  snap=await rpc('monportfolio_snapshot',{p_id:a.id});assert.equal(snap.dossier.revision_status,'done');assert(snap.dossier.closed_at);await assert.rejects(action(a.id,'production'));
  await t.test('Revoked on deletion; retention and orphan candidates',async()=>{
   await as('admin');const docs=await rpc('monportfolio_cleanup',{p_id:a.id});assert.equal(docs.length,1);await rpc('monportfolio_cleanup_done',{p_upload:upload.id});
   await as('service');await assert.rejects(rpc('monportfolio_access',{p_hash:live}));await as('admin');assert.equal(await rpc('monportfolio_document',{p_id:a.id}),null);
   const view=await rpc('monportfolio_snapshot',{p_id:a.id});assert.equal(view.dossier.projects,null);assert.equal(view.dossier.cv_name,null);
   await as();assert.equal((await q('select name from monportfolio_uploads where id=$1',[upload.id]))[0].name,'');
  });
 }finally{await db.close();}
});

test('Phone migration leaves previous orders intact and restricts phone to authorized detail views',{timeout:45000},async()=>{
 const f=await fixture({withPhone:false}),{db,q,as,rpc,action,users}=f;
 const legacy={name:'Prospect Historique',country:'France',payment:'PayPal',consent:true};
 const input=data=>({p_key:digest(randomUUID()),p_payload_hash:digest(JSON.stringify(data)),p_nonce:f.nonce(),p_data:data});
 const snapshot=id=>rpc('monportfolio_snapshot',{p_id:id});
 try{
  await as('service');
  const old=await rpc('monportfolio_create_lead',input(legacy));
  await as();
  const before=(await q('select to_jsonb(l) value from monportfolio_leads l where id=$1',[old.id]))[0].value;
  await db.exec(await readFile(phoneMigration,'utf8'));
  const after=(await q('select to_jsonb(l) value from monportfolio_leads l where id=$1',[old.id]))[0].value;
  assert.deepEqual(after,{...before,phone:null});
  await db.exec(await readFile(priceMigration,'utf8'));
  const afterPrice=(await q('select to_jsonb(l) value from monportfolio_leads l where id=$1',[old.id]))[0].value;
  assert.deepEqual(afterPrice,after);
  const phone='+33612345678',payload=input({...legacy,name:'Prospect Nouveau',phone});
  await as('service');
  await assert.rejects(rpc('monportfolio_create_phone_lead',input(legacy)));
  const result=await rpc('monportfolio_create_phone_lead',payload);
  assert.deepEqual(await rpc('monportfolio_create_phone_lead',{...payload,p_nonce:f.nonce()}),result);
  assert.equal(result.phoneSaved,true);assert.equal(result.amount,25);assert.equal(result.currency,'EUR');assert(!('phone'in result));
  await as('anon');await assert.rejects(rpc('monportfolio_create_phone_lead',payload));await assert.rejects(snapshot(result.id));
  await as('sales');await assert.rejects(snapshot(result.id));
  await as('admin');assert.equal((await snapshot(result.id)).phone,phone);assert.equal((await snapshot(old.id)).phone,null);
  assert((await rpc('monportfolio_snapshot')).data.every(item=>!('phone'in item)));
  await action(result.id,'assigned',{owner:users.sales});
  await action(result.id,'assigned',{owner:users.production,kind:'production'});
  await as('sales');assert.equal((await snapshot(result.id)).phone,phone);
  await as('production');assert(!('phone'in await snapshot(result.id)));
 }finally{await db.close();}
});
