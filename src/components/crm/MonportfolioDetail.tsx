"use client";
import { useState } from "react";
import type { Member } from "@/lib/crm/core";
import { MP_STATES, MP_OBJECTIVES, type MpDetail } from "@/lib/monportfolio/states";
import { useMember } from "./CrmShell";
const api='/api/crm/monportfolio';
const date=(s:string|null|undefined)=>s?new Date(s).toLocaleString('fr-FR'):'—';
export function MonportfolioDetail({detail:l,members,refresh,close}:{detail:MpDetail;members:Member[];refresh:()=>void;close:()=>void}) {
 const member=useMember(),admin=member.role==='admin',operational=admin||member.role==='production',d=l.dossier;
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState(''),[url,setUrl]=useState(''),[deletion,setDeletion]=useState(false);
 async function action(action:string,data:Record<string,unknown>={}){
  setBusy(true);setError('');setNotice('');
  try{const r=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:l.id,action,data})});const p=await r.json();if(!r.ok)throw Error(p.error);if(p.url)setUrl(p.url);if(['link_revoked','documents_deleted','cancelled'].includes(action))setUrl('');setNotice('Mise à jour enregistrée.');refresh();}
  catch(e){setError(e instanceof Error?e.message:'Action impossible.');}finally{setBusy(false);}
 }
 async function cv(){setError('');try{const r=await fetch(`${api}?document=${l.id}`);const p=await r.json();if(!r.ok)throw Error(p.error);const a=document.createElement('a');a.href=p.url;a.target='_blank';a.rel='noopener noreferrer';a.click();}catch(e){setError(e instanceof Error?e.message:'CV inaccessible.');}}
 async function copy(){
  try{await navigator.clipboard.writeText(`Bonjour ${l.name.split(' ')[0]},\n\nNous confirmons la réception de votre paiement pour la création de votre portfolio professionnel.\n\nPour préparer votre portfolio, merci de compléter ce court formulaire :\n\n${url}\n\nVous aurez simplement besoin de votre CV et de quelques indications sur ce que vous souhaitez mettre en avant.\n\nLes photos et autres visuels pourront être envoyés directement ici sur WhatsApp.\n\nMerci pour votre confiance.\n\nL'équipe MonPortfolio.`);setNotice('Message WhatsApp copié. Envoyez-le manuellement, puis marquez le formulaire envoyé.');}catch{setError('Copie indisponible. Sélectionnez et copiez le lien ci-dessous.');}
 }
 const terminal=['finished','cancelled'].includes(l.status);
 const staffName=(id:string|null)=>members.find(m=>m.user_id===id)?.name||(id===member.user_id?member.name:null);
 return <article className="crm-panel crm-mp-detail" aria-label={`Dossier ${l.reference}`}><div className="crm-panel-head"><h3>{l.reference} · {l.name}</h3><button onClick={close}>Fermer</button></div><div className="crm-panel-body">
  {error&&<p className="crm-error" role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  <fieldset disabled={busy} style={{border:0,padding:0,minWidth:0}}>
  <section><h4>A. Commande</h4><dl><dt>Référence / client / pays</dt><dd>{l.reference} · {l.name} · {l.country}</dd><dt>Demande</dt><dd>{date(l.created_at)} · {l.source}</dd><dt>Prestation / état</dt><dd>{l.service} · {MP_STATES[l.status]}</dd>
  {member.role!=='production'&&<><dt>Montant attendu / paiement déclaré</dt><dd>{l.amount} {l.currency} · {l.payment_method}</dd><dt>Paiement</dt><dd>{l.payment_status==='confirmed'?'Confirmé':'Non confirmé'}</dd>{l.payment&&<><dt>Paiement constaté</dt><dd>{l.payment.amount} {l.payment.currency} · {l.payment.method} · {date(l.payment.confirmed_at)} · {staffName(l.payment.confirmed_by)||l.payment.confirmed_by}</dd></>}</>}</dl>
  {admin&&!terminal&&l.payment_status!=='confirmed'&&<form onSubmit={e=>{e.preventDefault();const f=new FormData(e.currentTarget);void action('payment_confirm',{amount:Number(f.get('amount')),currency:f.get('currency'),method:f.get('method')});}} className="crm-form"><label>Montant réellement reçu<input name="amount" type="number" min="0.01" step="0.01" required defaultValue={l.amount}/></label><label>Devise reçue<select name="currency" defaultValue={l.currency}><option>MAD</option><option>EUR</option></select></label><label>Moyen de paiement constaté<select name="method" defaultValue={l.payment_method}>{['CIH Bank','Attijariwafa bank','Banque Populaire','PayPal','Cash Plus','Carte bancaire'].map(p=><option key={p}>{p}</option>)}</select></label><button>Confirmer le paiement</button></form>}
  {member.role!=='production'&&!terminal&&l.status==='new'&&<button onClick={()=>void action('payment_pending')}>Marquer le paiement en attente</button>}
  {admin&&!terminal&&<label>Responsable commercial<select aria-label={`Responsable de ${l.reference}`} value={l.owner_id||''} onChange={e=>void action('assigned',{owner:e.target.value||null})}><option value="">Non assigné</option>{members.filter(m=>m.role!=='production').map(m=><option key={m.user_id} value={m.user_id}>{m.name}</option>)}</select></label>}
  </section>
  {member.role!=='production'&&<section><h4>B. Formulaire après paiement</h4><dl><dt>Accès</dt><dd>{l.link?l.link.revoked_at?'Révoqué':terminal?'Clôturé':Date.parse(l.link.expires_at)<Date.now()?'Expiré':'Actif':'Non généré'}</dd><dt>Génération / expiration</dt><dd>{date(l.link?.created_at)} / {date(l.link?.expires_at)}</dd><dt>Réception / dossier</dt><dd>{date(d.received_at)} · {MP_STATES[l.status]}</dd></dl>
  {admin&&!terminal&&l.payment_status==='confirmed'&&['payment_confirmed','form_sent','received','needs_info'].includes(l.status)&&<><button onClick={()=>void action('link_generated')}>{l.link?'Régénérer un accès':'Générer le lien du dossier client'}</button>{l.link&&!l.link.revoked_at&&<button onClick={()=>void action('link_revoked')}>Révoquer le lien</button>}</>}
  {url&&<div><label>Lien personnel — copiez-le avant de fermer cette fiche<input readOnly value={url} onFocus={e=>e.target.select()}/></label><button onClick={()=>void copy()}>Copier le message WhatsApp</button></div>}
  {l.status==='payment_confirmed'&&l.link&&!l.link.revoked_at&&<button onClick={()=>void action('form_sent')}>Marquer le formulaire envoyé</button>}
  </section>}
  <section><h4>C. Informations client</h4><dl><dt>Objectif</dt><dd>{MP_OBJECTIVES[d.objective||'']||'—'} {d.objective_other}</dd><dt>Projets</dt><dd style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{d.projects||'Non précisés'}</dd><dt>Réalisations</dt><dd style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{d.achievements||'Non précisées'}</dd><dt>Autorisation de traitement</dt><dd>{date(d.consent_at)} · {d.consent_version||'—'}</dd><dt>CV</dt><dd>{d.cv_name||'Aucun CV disponible'}</dd></dl>{d.cv_name&&!d.deleted_at&&<button onClick={()=>void cv()}>Consulter le CV sécurisé (60 s)</button>}</section>
  <section><h4>D. Production</h4>{admin&&!terminal&&<label>Responsable de production<select value={d.production_owner_id||''} onChange={e=>void action('assigned',{owner:e.target.value||null,kind:'production'})}><option value="">Non assigné</option>{members.filter(m=>m.role!=='sales').map(m=><option key={m.user_id} value={m.user_id}>{m.name}</option>)}</select></label>}
  <dl><dt>Responsable</dt><dd>{staffName(d.production_owner_id)||(d.production_owner_id?'Assigné':'Non assigné')}</dd><dt>Dossier complet / lancement</dt><dd>{date(d.complete_at)} / {date(d.started_at)}</dd><dt>Échéance (24 h après validation du dossier complet et paiement)</dt><dd>{date(d.due_at)}</dd></dl>
  {['received','complete'].includes(l.status)&&<button onClick={()=>void action('needs_info')}>Demander des informations complémentaires</button>}
  {operational&&['received','needs_info'].includes(l.status)&&!d.deleted_at&&<button onClick={()=>void action('complete')}>Valider le dossier complet</button>}
  {operational&&l.status==='complete'&&<button onClick={()=>void action('production')}>Démarrer la production</button>}
  {operational&&!terminal&&<form onSubmit={e=>{e.preventDefault();void action('notes',{notes:new FormData(e.currentTarget).get('notes')});}}><label>Notes internes<textarea name="notes" maxLength={6000} defaultValue={d.notes} key={d.notes}/></label><button>Enregistrer les notes</button></form>}
  </section>
  <section><h4>E. Livraison</h4><dl><dt>Portfolio livré</dt><dd>{d.delivery_url?<a href={d.delivery_url} target="_blank" rel="noopener noreferrer">{d.delivery_url}</a>:'—'}</dd><dt>Livraison / clôture</dt><dd>{date(d.delivered_at)} / {date(d.closed_at)}</dd><dt>Modification incluse</dt><dd>{d.revision_status==='available'?'Disponible':d.revision_status==='requested'?'Demandée':'Effectuée'}</dd><dt>Demande / réalisation de la modification</dt><dd>{date(d.revision_requested_at)} / {date(d.revision_done_at)}</dd></dl>
  {admin&&l.status==='production'&&<form onSubmit={e=>{e.preventDefault();void action('delivered',{url:new FormData(e.currentTarget).get('url')});}}><label>URL du portfolio livré<input name="url" type="url" pattern="https://.*" required/></label><button>Marquer la version livrée</button></form>}
  {admin&&l.status==='delivered'&&<>{d.revision_status==='available'&&<button onClick={()=>void action('revision_requested')}>Enregistrer une demande de modification</button>}<button onClick={()=>void action('finished')}>Terminer la commande</button></>}
  {admin&&l.status==='revision_requested'&&<button onClick={()=>void action('revision_done')}>Marquer la modification effectuée</button>}
  {admin&&!terminal&&<button onClick={()=>void action('cancelled')}>Annuler la commande</button>}
  </section>
  <details><summary>Historique du dossier</summary><ol>{l.events.map((e,i)=><li key={i}>{date(e.created_at)} · {MP_STATES[e.action]||({payment_confirm:'Paiement confirmé',link_generated:'Lien généré',link_revoked:'Lien révoqué',assigned:'Assignation',revision_done:'Modification effectuée',created:'Création',notes:'Notes mises à jour',documents_deleted:'Documents supprimés'} as Record<string,string>)[e.action]||e.action}{e.actor_id?' · '+e.actor_id:''}</li>)}</ol></details>
  {admin&&<details><summary>Suppression des documents et réponses</summary><p>Révoque les accès et supprime le CV, les réponses et les notes. Le nettoyage quotidien couvre les anciens liens de téléversement arrivés à expiration.</p><label><input type="checkbox" checked={deletion} onChange={e=>setDeletion(e.target.checked)}/> J’ai vérifié la demande de suppression.</label><button disabled={!deletion} onClick={()=>void action('documents_deleted')}>Supprimer les documents et réponses</button></details>}
  </fieldset>
 </div></article>;
}
