// Isolated browser exercise. All production hostnames are intercepted; no actual WhatsApp/Meta requests.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {crc32} from 'node:zlib';
import {httpFixture} from './monportfolio-http-fixture.mjs';
const origin='https://www.monportfolio.app',api='https://www.talentiques.com/api/monportfolio/';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml'};
function docx(){
 const content={
  '[Content_Types].xml':'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
  '_rels/.rels':'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
  'word/document.xml':'<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>CV synthétique</w:t></w:r></w:p></w:body></w:document>'
 };
 const local=[],central=[];let offset=0,size=0;
 for(const [key,value] of Object.entries(content)){
  const n=Buffer.from(key),b=Buffer.from(value),crc=crc32(b),l=Buffer.alloc(30),c=Buffer.alloc(46);
  l.writeUInt32LE(0x04034b50);l.writeUInt16LE(20,4);l.writeUInt32LE(crc,14);l.writeUInt32LE(b.length,18);l.writeUInt32LE(b.length,22);l.writeUInt16LE(n.length,26);
  c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt32LE(crc,16);c.writeUInt32LE(b.length,20);c.writeUInt32LE(b.length,24);c.writeUInt16LE(n.length,28);c.writeUInt32LE(offset,42);
  local.push(l,n,b);central.push(c,n);offset+=l.length+n.length+b.length;size+=c.length+n.length;
 }
 const e=Buffer.alloc(22);e.writeUInt32LE(0x06054b50);e.writeUInt16LE(3,8);e.writeUInt16LE(3,10);e.writeUInt32LE(size,12);e.writeUInt32LE(offset,16);return Buffer.concat([...local,...central,e]);
}
test('Browser: existing landing and Pixel, save before WhatsApp and recovery, CRM, short dossier at five widths',{timeout:240000},async t=>{
 const {chromium}=await import(pathToFileURL(path.join(process.env.CRM_PLAYWRIGHT_PATH,'index.mjs')));
 const f=await httpFixture();let browser;
 const root=path.resolve(process.env.MONPORTFOLIO_ROOT||'../monportfolio-app'),output=process.env.MP_SCREENSHOT_DIR;
 try{
  browser=await chromium.launch({executablePath:process.env.CRM_CHROME_PATH,headless:true});
  const ctx=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});await ctx.addCookies([{name:'tq_crm_access',value:'admin',url:f.app}]);
  ctx.setDefaultTimeout(20000);ctx.setDefaultNavigationTimeout(45000);
  const {headers:[dossier]}=JSON.parse(await fs.readFile(path.join(root,'vercel.json'),'utf8'));
  const security=Object.fromEntries(dossier.headers.map(({key,value})=>[key,value]));
  const storageOrigin=security['Content-Security-Policy'].match(/https:\/\/[a-z0-9]+\.supabase\.co/)[0];
  const wa=[],errors=[];let leadPosts=0,meta=0;
  await ctx.route('**/*',async r=>{
   const u=new URL(r.request().url());
   if(u.origin===origin){let file=path.resolve(root,'.'+decodeURIComponent(u.pathname));if(u.pathname.endsWith('/'))file=path.join(file,'index.html');if(!file.startsWith(root+path.sep))return r.abort();try{const body=await fs.readFile(file);return r.fulfill({body,contentType:mime[path.extname(file)]||'application/octet-stream',headers:u.pathname.startsWith('/dossier/')?security:{}});}catch{return r.fulfill({status:404,body:''});}}
   if(u.href.startsWith(api)||u.href.startsWith(api.replace("www.",""))){if(r.request().method()==='POST'&&u.pathname.endsWith('/lead'))leadPosts++;const response=await r.fetch({url:f.app+u.pathname+u.search});if(u.pathname.endsWith('/dossier')&&r.request().method()==='POST'&&response.ok()){const json=await response.json();if(json.uploadUrl)json.uploadUrl=json.uploadUrl.replace(f.backendURL,storageOrigin);return r.fulfill({response,json});}return r.fulfill({response});}
   if(u.origin===storageOrigin){const response=await r.fetch({url:f.backendURL+u.pathname+u.search});return r.fulfill({response});}
   if(u.origin===f.app||u.origin===f.backendURL)return r.continue();
   if(u.hostname==='wa.me'){wa.push(u.searchParams.get('text'));return r.fulfill({body:'WhatsApp fixture'});}
   if(u.hostname==='connect.facebook.net'){meta++;return r.fulfill({contentType:'text/javascript',body:'/* Meta fixture; queue stays observable. */'});}
   return r.fulfill({body:''});
  });
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  const events=()=>page.evaluate(()=>window.fbq?.queue?.filter(e=>['track','trackSingle'].includes(e[0])).map(e=>Array.from(e))||[]);
  await t.test('Landing: consent and actual country/payment choices; lost response then one CRM order',async()=>{
   await page.goto(origin+'/');await page.getByRole('button',{name:'Tout refuser',exact:true}).click();assert.deepEqual(await events(),[]);assert.equal(meta,0);
   const button=page.locator('#leadForm button[type=submit]');await button.click();assert.equal(leadPosts,0);
   await page.getByRole('button',{name:'Confidentialité',exact:true}).click();await page.getByRole('switch',{name:/Marketing/}).check();await page.getByRole('button',{name:'Enregistrer mes choix'}).click();
   assert((await events()).some(e=>e.includes('PageView')));
   await page.locator('#fullname').fill('Camille Synthétique');await page.locator('#country').selectOption('France');
   assert.equal(await page.locator('input[name=payment]:enabled').count(),2);await page.locator('input[value="Carte bancaire"]').check();await page.locator('#consent').check();
   await page.locator('#phone').fill('06 12 34 56 78');
   f.lose('monportfolio_create_phone_lead');await button.dblclick();await page.getByText(/n’a pas pu être confirmé/).waitFor();assert.equal(leadPosts,1);
   assert.equal(wa.length,0);assert.equal(await page.locator('#phone').inputValue(),'06 12 34 56 78');
   assert(!(await events()).some(e=>e.includes('Lead')));
   await f.as();const retained=await f.q('select reference,phone,status from monportfolio_leads');
   assert.equal(retained.length,1);assert.equal(retained[0].phone,'+33612345678');assert.equal(retained[0].status,'new');
   await Promise.all([page.waitForURL('https://wa.me/**'),button.click()]);assert.equal(leadPosts,2);
   assert(wa[0].includes('25 €')&&wa[0].includes('Carte bancaire')&&wa[0].includes(retained[0].reference));
   assert(!wa[0].includes(retained[0].phone));
   await page.goto(origin+'/');await page.getByText(/Dernière demande enregistrée : MP-/).waitFor();assert.equal(leadPosts,2);
  });
  const crm=await ctx.newPage();crm.on('pageerror',e=>errors.push(e.message));let link,reference;
  await t.test('CRM: one order, manual payment, link and assignment',async()=>{
   const headers={Cookie:'tq_crm_access=admin'};
   const warm=await fetch(f.app+'/api/crm/monportfolio',{headers});assert.equal(warm.status,200);
   let screen=await fetch(f.app+'/crm/requests',{headers});await screen.text();
   if(!screen.ok){screen=await fetch(f.app+'/crm/requests',{headers});await screen.text();}
   assert.equal(screen.status,200);
   await crm.goto(f.app+'/crm/requests');const mp=crm.getByRole('region',{name:'Demandes MonPortfolio'});await mp.getByText('Camille Synthétique',{exact:true}).waitFor();
   const ref=mp.getByRole('button',{name:/^MP-[A-F0-9]+$/});assert.equal(await ref.count(),1);reference=await ref.textContent();await ref.click();
   const detail=mp.getByRole('article',{name:`Dossier ${reference}`});
   await detail.getByText('+33612345678',{exact:true}).waitFor();
   assert.equal(await detail.getByRole('link',{name:'Contacter sur WhatsApp'}).getAttribute('href'),'https://wa.me/33612345678');
   await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:f.app});
   await detail.getByRole('button',{name:'Copier le numéro'}).click();
   await detail.getByText('Numéro copié.',{exact:true}).waitFor();
   assert.equal(await crm.evaluate(()=>navigator.clipboard.readText()),'+33612345678');
   await detail.getByRole('button',{name:'Confirmer le paiement',exact:true}).click();
   await detail.getByRole('button',{name:'Générer le lien du dossier client'}).click();link=await detail.getByLabel(/Lien personnel —/).inputValue();assert.match(link,/\?token=[a-f0-9]{64}$/);
   await detail.getByRole('button',{name:'Marquer le formulaire envoyé'}).click();await detail.getByText('Formulaire envoyé',{exact:false}).first().waitFor();
   await detail.getByLabel('Responsable de production').selectOption(f.users.production);
  });
  await t.test('Dossier: all widths, private upload replacement, lost response, retry and receipt',async()=>{
   assert(link);const before=meta;await page.goto(link);await page.locator('#dossierForm').waitFor({state:'visible'});assert.equal(new URL(page.url()).search,'');assert.equal(meta,before);assert.equal(await page.locator('input[type=file]').count(),1);assert.equal(await page.locator('input[type=file][multiple]').count(),0);
   assert.equal(await page.locator('meta[name=robots]').getAttribute('content'),'noindex,nofollow,noarchive');
   for(const width of [320,375,430,768,1440]){await page.setViewportSize({width,height:1000});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}`);assert.equal(await page.locator('#objective').evaluate(e=>getComputedStyle(e).fontSize),'16px');if(output&&[375,1440].includes(width))await page.screenshot({path:path.join(output,`dossier-${width}.png`),fullPage:true});}
   const field=page.locator('#cv');await field.setInputFiles({name:'image.png',mimeType:'image/png',buffer:Buffer.alloc(150)});await page.getByText('Sélectionnez un CV PDF ou DOCX de 5 Mo maximum.').waitFor();
   const prefix='%PDF-1.4\n/Type /Page\n',suffix='\n%%EOF\n',pdf=Buffer.from(prefix+' '.repeat(5242880-prefix.length-suffix.length)+suffix);
   await field.setInputFiles({name:'CV initial.pdf',mimeType:'application/pdf',buffer:pdf});await page.waitForFunction(()=>!document.getElementById('cv').disabled);assert.match(await page.locator('#cvStatus').textContent(),/CV initial.pdf — téléversé/);
   await field.setInputFiles({name:'CV de test.docx',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',buffer:docx()});await page.getByText(/CV de test.docx — téléversé/).waitFor();
   await page.locator('#objective').selectOption('other');assert(await page.locator('#other').isVisible());await page.locator('#other').fill('Objectif synthétique');await page.locator('#projects').fill('Projet à conserver après une erreur');await page.locator('#consent').check();
   f.lose('monportfolio_submit');await page.getByRole('button',{name:'Envoyer mon dossier'}).click();await page.locator('#formError').filter({hasText:'indisponible'}).waitFor();assert.equal(await page.locator('#projects').inputValue(),'Projet à conserver après une erreur');assert(!await page.locator('#success').isVisible());
   await page.getByRole('button',{name:'Envoyer mon dossier'}).click();await page.getByText('Votre dossier a bien été reçu !',{exact:true}).waitFor();
   const followup=new URL(await page.locator('#followup').getAttribute('href')).searchParams.get('text');assert(followup.includes(reference));assert(!followup.includes('Camille')&&!followup.includes('Projet'));
   await page.reload();await page.getByText('Votre dossier a bien été reçu !',{exact:true}).waitFor();assert.equal(meta,before);
  });
  await t.test('CRM receipt, complete dossier, 24 h, delivery and one modification',async()=>{
   await crm.reload();const mp=crm.getByRole('region',{name:'Demandes MonPortfolio'});await mp.getByRole('button',{name:reference}).click();const detail=mp.getByRole('article',{name:`Dossier ${reference}`});
   await detail.getByText('CV de test.docx',{exact:true}).waitFor();await detail.getByRole('button',{name:'Valider le dossier complet'}).click();await detail.getByRole('button',{name:'Démarrer la production'}).click();
   await detail.getByLabel('URL du portfolio livré').fill('https://example.test/portfolio');await detail.getByRole('button',{name:'Marquer la version livrée'}).click();await detail.getByRole('button',{name:'Enregistrer une demande de modification'}).click();await detail.getByRole('button',{name:'Marquer la modification effectuée'}).click();await detail.getByText('Effectuée',{exact:true}).waitFor();assert.equal(await detail.getByRole('button',{name:'Enregistrer une demande de modification'}).count(),0);
   await detail.getByRole('button',{name:'Terminer la commande'}).click();await detail.getByText(/Portfolio digital · Terminé/).waitFor();
   await detail.getByText('Clôturé',{exact:true}).waitFor();
   await mp.getByRole('table').waitFor();
   if(output){await crm.evaluate(()=>window.scrollTo(0,0));await crm.screenshot({path:path.join(output,'crm-phase4.png'),fullPage:true});}
  });
  assert.deepEqual(errors,[]);
 }finally{if(browser)await browser.close();await f.close();}
});
