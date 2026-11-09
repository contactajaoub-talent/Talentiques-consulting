import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {validateLead,PAYMENTS,challenge,verifyProof,digest,idempotency} from '../src/lib/monportfolio/core.ts';
const good={name:'Yassine El Idrissi',country:'Maroc',payment:'PayPal',consent:true,utm:{source:'test'}};
test('strict identity, country, payment, consent and UTM validation',()=>{
 for(const payment of PAYMENTS)assert.equal(validateLead({...good,country:payment==='Carte bancaire'?'France':'Maroc',payment}).payment,payment);
 assert.equal(validateLead({...good,payment:'Carte bancaire'}).payment,'Carte bancaire');
 assert.throws(()=>validateLead({...good,payment:'CIH Bank'}));
 for(const bad of [{name:''},{name:'12'},{name:'<script>'},{name:'A'.repeat(91)},{country:'Mars'},{country:''},{payment:'paid'},{consent:false},{consent:'true'},{utm:{source:'x'.repeat(151)}},{utm:[]},{website:'robot'}])assert.throws(()=>validateLead({...good,...bad}));
 for(const key of ['name','country','payment','consent']){const v={...good};delete v[key];assert.throws(()=>validateLead(v));}
 assert.equal(validateLead({...good,name:'  Élodie   Aït-Test  '}).name,'Élodie Aït-Test');
 assert(!('email' in validateLead(good)));
 assert(!('payment_status' in validateLead({...good,payment_status:'paid',amount:1})));
});
test('idempotency keys and signed proof reject forgery, expiry, incorrect client and invalid work',()=>{
 const secret='isolated-secret',client='client',now=Date.now();const token=challenge(secret,client,now);
 let work=0;while(!digest(token+':'+work).startsWith('000'))work++;
 assert.match(verifyProof(token,work,secret,client,now),/^[a-f0-9]{32}$/);
 for(const fn of [()=>verifyProof(token,work,secret,'other',now),()=>verifyProof(token,work,'forged',client,now),()=>verifyProof(token,work,secret,client,now+600001),()=>verifyProof(token,-1,secret,client,now),()=>verifyProof('bad',0,secret,client,now),()=>idempotency('bad')])assert.throws(fn);
 const key=randomUUID();assert.equal(idempotency(key),idempotency(key));assert.notEqual(idempotency(key),idempotency(randomUUID()));
});
