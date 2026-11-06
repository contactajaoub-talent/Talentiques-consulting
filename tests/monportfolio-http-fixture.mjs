import {createServer} from 'node:http';
import {spawn,execFile} from 'node:child_process';
import {once} from 'node:events';
import {randomBytes} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {fixture} from './monportfolio-fixture.mjs';
export async function httpFixture(){
 const f=await fixture(),service='isolated-service',objects=new Map(),signatures=new Map();let chain=Promise.resolve(),lost='';
 const backend=createServer((req,res)=>{chain=chain.then(async()=>{
  const send=(body,status=200,headers={})=>{res.writeHead(status,{'Content-Type':'application/json',...headers});res.end(JSON.stringify(body));};
  try{
   const u=new URL(req.url,'http://localhost');
   if(req.method==='OPTIONS'){res.writeHead(204,{'Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'PUT,GET,POST,OPTIONS','Access-Control-Allow-Headers':'content-type,x-upsert'});return res.end();}
   const parts=[];for await(const b of req)parts.push(b);const raw=Buffer.concat(parts);
   const token=req.headers.authorization?.replace('Bearer ','');const name=Object.keys(f.users).find(k=>k===token);
   if(u.pathname==='/auth/v1/user')return send(name?{id:f.users[name]}:{},name?200:401);
   if(u.pathname.startsWith('/storage/v1/')){
    const route=u.pathname.slice('/storage/v1/'.length);
    if(route.startsWith('object/upload/sign/')&&req.method==='PUT'){
     const path=route.slice('object/upload/sign/'.length),s=signatures.get(u.searchParams.get('token'));
     if(s!==path)return send({error:'Invalid token'},403);
     if(objects.has(path))return send({statusCode:'409'},409,{'Access-Control-Allow-Origin':'*'});
     objects.set(path,{bytes:raw,mime:req.headers['content-type']});return send({Key:path},200,{'Access-Control-Allow-Origin':'*'});
    }
    if(token!==service)return send({},403);
    if(route.startsWith('object/upload/sign/')&&req.method==='POST'){
     const path=route.slice('object/upload/sign/'.length),signed=randomBytes(16).toString('hex');signatures.set(signed,path);return send({url:'/object/upload/sign/'+path+'?token='+signed});
    }
    if(route.startsWith('object/authenticated/')){
     const o=objects.get(route.slice('object/authenticated/'.length));if(!o)return send({},404);res.writeHead(200,{'Content-Type':o.mime,'Content-Length':o.bytes.length});return res.end(o.bytes);
    }
    if(route.startsWith('object/sign/'))return send({signedURL:'/object/sign/'+route.slice('object/sign/'.length)+'?token=isolated-read'});
    if(req.method==='DELETE'){const body=JSON.parse(raw.toString());for(const p of body.prefixes)objects.delete(route.slice('object/'.length)+'/'+p);return send([]);}
    return send({},404);
   }
   await f.as(name|| (token===service?'service':'anon'));
   if(u.pathname.startsWith('/rest/v1/rpc/')){
    const fn=u.pathname.split('/').at(-1),result=await f.rpc(fn,JSON.parse(raw.toString()||'{}'));
    if(lost===fn){lost='';return send({message:'Synthetic lost response after commit'},503);}return send(result);
   }
   const table=u.pathname.split('/').at(-1);
   if(table==='crm_members')return send(await f.q('select user_id,name,role,active from crm_members where user_id=$1',[f.users[name]||null]));
   if(table==='crm_requests')return send([]);
   return send({},404);
  }catch(e){send({message:e.message?.startsWith('CRM:')?e.message:'Fixture refused'},403);}
 });});
 backend.listen(0,'127.0.0.1');await once(backend,'listening');
 const portProbe=createServer();portProbe.listen(0,'127.0.0.1');await once(portProbe,'listening');
 const appPort=portProbe.address().port;await new Promise(resolve=>portProbe.close(resolve));
 const app='http://127.0.0.1:'+appPort,backendURL=`http://127.0.0.1:${backend.address().port}`;
 const next=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--webpack','-p',String(appPort),'-H','127.0.0.1'],{env:{...process.env,NEXT_TELEMETRY_DISABLED:'1',CRM_TEST_NEXT_DIST:'.next/monportfolio-test-'+appPort,NEXT_FONT_GOOGLE_MOCKED_RESPONSES:fileURLToPath(new URL('./monportfolio-fonts.cjs',import.meta.url)),SUPABASE_URL:backendURL,SUPABASE_ANON_KEY:'isolated-anon',SUPABASE_SERVICE_ROLE_KEY:service,CRM_RATE_LIMIT_SECRET:'isolated-test-secret',NEXT_PUBLIC_APP_URL:app},stdio:['ignore','pipe','pipe'],windowsHide:true});
 let log='';next.stdout.on('data',b=>{log=(log+b).slice(-20000);});next.stderr.on('data',b=>{log=(log+b).slice(-20000);});
 try{let ready=false;for(let n=0;n<100;n++){try{const r=await fetch(app+'/api/monportfolio/lead',{method:'OPTIONS',headers:{Origin:'https://www.monportfolio.app'},signal:AbortSignal.timeout(1000)});if(r.status===204){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,400));}if(!ready)throw Error(log);}
 catch(e){if(process.platform==='win32')await new Promise(resolve=>execFile('taskkill',['/pid',String(next.pid),'/T','/F'],{windowsHide:true},()=>resolve()));else next.kill();backend.closeAllConnections();backend.close();await f.db.close();throw e;}
 return {...f,app,backendURL,objects,lose:fn=>{lost=fn;},logs:()=>log,close:async()=>{if(process.platform==='win32')await new Promise(resolve=>execFile('taskkill',['/pid',String(next.pid),'/T','/F'],{windowsHide:true},()=>resolve()));else next.kill();backend.closeAllConnections();await new Promise(resolve=>backend.close(resolve));await f.db.close();}};
}
