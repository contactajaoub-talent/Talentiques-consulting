"use client";
import { useEffect, useState } from "react";
import type { Member } from "@/lib/crm/core";
import { MP_STATES, type MpLead, type MpDetail } from "@/lib/monportfolio/states";
import { useMember } from "./CrmShell";
import { MonportfolioDetail } from "./MonportfolioDetail";
const api='/api/crm/monportfolio';
export function MonportfolioRequests() {
 const member=useMember();
 const [data,setData]=useState<MpLead[]>([]),[members,setMembers]=useState<Member[]>([]),[detail,setDetail]=useState<MpDetail|null>(null);
 const [page,setPage]=useState(0),[search,setSearch]=useState(''),[status,setStatus]=useState(''),[version,setVersion]=useState(0),[selected,setSelected]=useState('');
 const [error,setError]=useState(''),[loading,setLoading]=useState(true),[opening,setOpening]=useState(false);
 useEffect(()=>{
  const controller=new AbortController();
  const timer=setTimeout(async()=>{setLoading(true);setError('');try{
   const r=await fetch(`${api}?page=${page}&search=${encodeURIComponent(search)}&status=${status}`,{signal:controller.signal});const p=await r.json();if(!r.ok)throw Error(p.error);setData(p.data);setMembers(p.members);
  }catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Demandes indisponibles.');}finally{if(!controller.signal.aborted)setLoading(false);}},200);
  return()=>{clearTimeout(timer);controller.abort();};
 },[page,search,status,version]);
 useEffect(()=>{
  if(!selected)return;
  const controller=new AbortController();
  async function load(){setOpening(true);try{const r=await fetch(`${api}?id=${selected}`,{signal:controller.signal});const p=await r.json();if(!r.ok)throw Error(p.error);setDetail(p);}catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Dossier indisponible.');}finally{if(!controller.signal.aborted)setOpening(false);}}
  void load();return()=>controller.abort();
 },[selected,version]);
 async function cleanup(){setError('');try{const r=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'cleanup'})});const p=await r.json();if(!r.ok)throw Error(p.error);setVersion(v=>v+1);}catch(e){setError(e instanceof Error?e.message:'Nettoyage impossible.');}}
 return <section className="crm-panel crm-mp" aria-label="Demandes MonPortfolio">
  <div className="crm-panel-head"><h2>MonPortfolio — Portfolios digitaux</h2><button onClick={()=>setVersion(v=>v+1)} disabled={loading}>Actualiser</button></div>
  <div className="crm-panel-body"><div className="crm-toolbar">
   <input aria-label="Rechercher une demande MonPortfolio" placeholder="Nom ou référence…" value={search} onChange={e=>{setSearch(e.target.value);setPage(0);}}/>
   <select aria-label="Statut MonPortfolio" value={status} onChange={e=>{setStatus(e.target.value);setPage(0);}}><option value="">Tous les statuts</option>{Object.entries(MP_STATES).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select>
  </div>
  {error&&<p className="crm-error" role="alert">{error}</p>}
  {loading?<p role="status">Chargement des demandes MonPortfolio…</p>:<div style={{overflowX:'auto'}}><table className="crm-table"><thead><tr><th>Référence</th><th>Client</th><th>Pays</th>{member.role!=='production'&&<><th>Tarif</th><th>Paiement</th></>}<th>Dossier</th><th>Responsable</th><th>Date</th></tr></thead><tbody>
   {data.slice(0,25).map(l=><tr key={l.id}><td><button aria-expanded={selected===l.id} onClick={()=>{if(selected!==l.id){setDetail(null);setSelected(l.id);}}}>{l.reference}</button></td><td>{l.name}</td><td>{l.country}</td>{member.role!=='production'&&<><td>{l.amount} {l.currency}</td><td>{l.payment_status==='confirmed'?'Confirmé':'Non confirmé'}</td></>}<td>{MP_STATES[l.status]}</td><td>{members.find(m=>m.user_id===(l.production_owner_id||l.owner_id))?.name||(l.production_owner_id||l.owner_id?'Assigné':'Non assigné')}</td><td>{new Date(l.created_at).toLocaleDateString('fr-FR')}</td></tr>)}
  </tbody></table>{!data.length&&<p>Aucune demande accessible.</p>}</div>}
  <div className="crm-pagination"><button disabled={page===0||loading} onClick={()=>setPage(p=>p-1)}>Précédent</button><span>Page {page+1}</span><button disabled={data.length<=25||loading} onClick={()=>setPage(p=>p+1)}>Suivant</button></div>
  {opening&&<p role="status">Ouverture du dossier…</p>}
  {detail&&<MonportfolioDetail key={detail.id} detail={detail} members={members} refresh={()=>setVersion(v=>v+1)} close={()=>{setSelected('');setDetail(null);}}/>}
  {member.role==='admin'&&<><MonportfolioManual refresh={()=>setVersion(v=>v+1)}/><details><summary>Conservation des CV</summary><p>Nettoyage des fichiers abandonnés après 2 h et des documents 90 jours après clôture. À exécuter chaque jour. Les demandes de suppression sont traitées depuis la fiche client.</p><button onClick={()=>void cleanup()}>Exécuter le nettoyage des documents</button></details></>}
 </div></section>;
}
function MonportfolioManual({refresh}:{refresh:()=>void}){
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();const form=e.currentTarget,data=new FormData(form);setBusy(true);setError('');try{const r=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'manual_create',key:data.get('key'),name:data.get('name'),country:data.get('country'),payment:data.get('payment'),consent:true})});const p=await r.json();if(!r.ok)throw Error(p.error);form.reset();refresh();setError('Demande enregistrée : '+p.reference);}catch(e){setError(e instanceof Error?e.message:'Saisie impossible.');}finally{setBusy(false);}}
 return <details><summary>Saisir une demande reçue sur WhatsApp</summary><p>Utilisez le code de reprise transmis par le client pour éviter un doublon après une réponse réseau perdue.</p><form onSubmit={e=>void submit(e)} className="crm-form"><label>Code de reprise (UUID)<input name="key" required pattern="[a-fA-F0-9-]{36}"/></label><label>Nom<input name="name" required minLength={3} maxLength={90}/></label><label>Pays<select name="country">{['Maroc','France','Belgique','Suisse','Canada','Tunisie','Autre'].map(c=><option key={c}>{c}</option>)}</select></label><label>Paiement déclaré<select name="payment">{['PayPal','Carte bancaire'].map(p=><option key={p}>{p}</option>)}</select></label><label><input type="checkbox" required/> Le client a autorisé le traitement de sa demande.</label><button disabled={busy}>Enregistrer la demande</button><p role="status">{error}</p></form></details>;
}
