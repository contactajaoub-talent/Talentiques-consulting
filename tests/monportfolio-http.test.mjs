// Real Next routes and real PostgreSQL; Supabase transport/Storage emulated in isolation.
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {httpFixture} from './monportfolio-http-fixture.mjs';
import {digest} from '../src/lib/monportfolio/core.ts';
const origin='https://www.monportfolio.app';
test('Phase 4 HTTP: order → payment → bearer → private CV → durable receipt, RLS and CORS',{timeout:180000},async()=>{
 const f=await httpFixture(),{app}=f;let ip=1;
 const publicHeaders=(token)=>({Origin:origin,'Content-Type':'application/json','x-real-ip':`198.51.100.${ip}`,...(token?{Authorization:'Bearer '+token}:{})});
 const lead=app+'/api/monportfolio/lead',dossier=app+'/api/monportfolio/dossier',crm=app+'/api/crm/monportfolio';
 const post=async(url,body,headers)=>fetch(url,{method:'POST',headers,body:JSON.stringify(body)});
 const staff=(role='admin')=>({Origin:app,Cookie:'tq_crm_access='+role,'Content-Type':'application/json'});
 const cmd=(id,action,data={},role='admin')=>post(crm,{id,action,data},staff(role));
 const solve=async()=>{const r=await fetch(lead,{headers:publicHeaders()});assert.equal(r.status,200);const {challenge}=await r.json();let proof=0;while(!digest(`${challenge}:${proof}`).startsWith('000'))proof++;return {challenge,proof};};
 try{
  for(const url of [lead,dossier]){assert.equal((await fetch(url,{method:'OPTIONS',headers:{Origin:origin}})).status,204);assert.equal((await fetch(url,{headers:{Origin:'https://evil.example'}})).status,403);assert.equal((await fetch(url)).status,403);}
  assert.equal((await fetch(crm)).status,401);
  const payload={name:'Synthetic HTTP',country:'France',phone:'0033 6 12 34 56 78',payment:'Carte bancaire',consent:true,key:randomUUID(),...await solve()};
  assert.equal((await post(lead,{...payload,phone:undefined},publicHeaders())).status,400);
  assert.equal((await post(lead,{...payload,phone:'+3300'},publicHeaders())).status,400);
  const [r1,r2]=await Promise.all([post(lead,payload,publicHeaders()),post(lead,payload,publicHeaders())]);assert.equal(r1.status,200);assert.equal(r2.status,200);const order=await r1.json();assert.deepEqual(await r2.json(),order);assert.equal(order.phoneSaved,true);assert(!('phone' in order));
  assert.deepEqual(await (await post(lead,{...payload,phone:'+33612345678',...await solve()},publicHeaders())).json(),order);
  const savedBeforeWhatsApp=await (await fetch(crm+'?id='+order.id,{headers:staff()})).json();
  assert.equal(savedBeforeWhatsApp.phone,'+33612345678');
  assert.equal(savedBeforeWhatsApp.status,'new');
  const list=await (await fetch(crm,{headers:staff()})).json();assert.equal(list.data.length,1);assert(!("phone" in list.data[0]));assert.equal(Number(list.data[0].amount),10);assert.equal(list.data[0].currency,'EUR');assert.equal(list.data[0].payment_status,'unconfirmed');
  assert.equal((await cmd(order.id,'link_generated')).status,403);
  assert.equal((await cmd(order.id,'payment_confirm',{amount:10,currency:'EUR',method:'Carte bancaire'},'sales')).status,403);
  assert.equal((await cmd(order.id,'payment_confirm',{amount:10,currency:'EUR',method:'Carte bancaire'})).status,200);
  const r=await cmd(order.id,'link_generated');assert.equal(r.status,200);const url=(await r.json()).url,token=new URL(url).searchParams.get('token');assert.match(token,/^[a-f0-9]{64}$/);
  let a=await fetch(dossier,{headers:publicHeaders(token)});assert.equal(a.status,200);assert.deepEqual(await a.json(),{reference:order.reference,submitted:false});
  assert.equal((await fetch(dossier,{headers:publicHeaders('b'.repeat(64))})).status,403);
  const start='%PDF-1.4\n/Type /Page\n',end='\n%%EOF\n';
  const pdf=Buffer.from(start+' '.repeat(5242880-start.length-end.length)+end);
  const prepare=async(name='cv.pdf',size=pdf.length,mime='application/pdf')=>post(dossier,{action:'prepare',name,size,mime,key:randomUUID()},publicHeaders(token));
  assert.equal((await prepare('cv.png')).status,400);assert.equal((await prepare('cv.pdf',5242881)).status,400);
  let p=await prepare();assert.equal(p.status,200);const upload=await p.json();assert.equal((await fetch(upload.uploadUrl,{method:'PUT',headers:{'Content-Type':upload.mime},body:pdf})).status,200);
  const submission={action:'submit',uploadId:upload.uploadId,objective:'employment',projects:'',achievements:'',consent:true};
  assert.equal((await post(dossier,{...submission,objective:''},publicHeaders(token))).status,400);
  f.lose('monportfolio_submit');assert.equal((await post(dossier,submission,publicHeaders(token))).status,409);
  const retry=await post(dossier,submission,publicHeaders(token));assert.equal(retry.status,200);assert.deepEqual(await retry.json(),{reference:order.reference,submitted:true});
  assert.equal((await (await fetch(dossier,{headers:publicHeaders(token)})).json()).submitted,true);
  let detail=await (await fetch(crm+'?id='+order.id,{headers:staff()})).json();assert.equal(detail.status,'received');assert.equal(detail.dossier.cv_name,'cv.pdf');assert.equal(detail.events.filter(e=>e.action==='received').length,1);
  assert.equal((await fetch(crm+'?document='+order.id,{headers:staff('production')})).status,403);
  assert.equal((await cmd(order.id,'assigned',{owner:f.users.production,kind:'production'})).status,200);
  const doc=await fetch(crm+'?document='+order.id,{headers:staff('production')});assert.equal(doc.status,200);const download=new URL((await doc.json()).url);assert(download.searchParams.has('token'));assert.equal(download.searchParams.get('download'),'CV.pdf');
  detail=await (await fetch(crm+'?id='+order.id,{headers:staff('production')})).json();assert(!('amount'in detail));assert(!('phone'in detail));
  assert.equal((await cmd(order.id,'complete',{},'production')).status,200);assert.equal((await cmd(order.id,'production',{},'production')).status,200);
  assert.equal((await cmd(order.id,'delivered',{url:'https://example.com/portfolio'})).status,200);assert.equal((await cmd(order.id,'revision_requested')).status,200);assert.equal((await cmd(order.id,'revision_done')).status,200);assert.equal((await cmd(order.id,'revision_requested')).status,403);assert.equal((await cmd(order.id,'finished')).status,200);
  assert.equal((await cmd(order.id,'documents_deleted')).status,200);assert.equal(f.objects.size,0);
  assert.equal((await fetch(dossier,{headers:publicHeaders(token)})).status,403);
  // New order / invalid file signature never receives a receipt.
  ip++;const second=await (await post(lead,{...payload,key:randomUUID(),...await solve()},publicHeaders())).json();await cmd(second.id,'payment_confirm',{amount:10,currency:'EUR',method:'PayPal'});const t=new URL((await (await cmd(second.id,'link_generated')).json()).url).searchParams.get('token');
  const bad=await (await post(dossier,{action:'prepare',name:'cv.pdf',size:120,mime:'application/pdf',key:randomUUID()},publicHeaders(t))).json();await fetch(bad.uploadUrl,{method:'PUT',headers:{'Content-Type':'application/pdf'},body:Buffer.alloc(120)});
  assert.equal((await post(dossier,{...submission,uploadId:bad.uploadId},publicHeaders(t))).status,400);assert.equal((await (await fetch(dossier,{headers:publicHeaders(t)})).json()).submitted,false);
  ip=222;for(let n=0;n<12;n++)assert.equal((await post(lead,{},publicHeaders())).status,400);assert.equal((await post(lead,{},publicHeaders())).status,429);
 }finally{await f.close();}
});
