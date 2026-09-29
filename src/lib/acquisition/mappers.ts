import type { Activity, Campaign, MessageTemplate, Prospect, ProspectStatus } from './types';

export type DbRow = Record<string, unknown>;

const statusFromDb: Record<string, ProspectStatus> = { new: 'Nouveau', to_qualify: 'À qualifier', to_contact: 'À contacter', contacted: 'Contacté', replied: 'A répondu', interested: 'Intéressé', offer_sent: 'Offre envoyée', follow_up: 'Relance', client: 'Client', lost: 'Perdu' };
export const statusToDb: Record<ProspectStatus, string> = Object.fromEntries(Object.entries(statusFromDb).map(([key, value]) => [value, key])) as Record<ProspectStatus, string>;
const actionFromDb: Record<string, Prospect['nextActionType']> = { linkedin: 'Message LinkedIn', email: 'Email', whatsapp: 'WhatsApp', call: 'Appel', follow_up: 'Relance', qualification: 'Qualification', offer: 'Offre', other: 'Qualification' };
export const actionToDb = Object.fromEntries(Object.entries(actionFromDb).map(([key, value]) => [value, key])) as Record<Prospect['nextActionType'], string>;
const taskFromDb: Record<string, Prospect['taskStatus']> = { todo: 'À faire', in_progress: 'En cours', done: 'Terminée', cancelled: 'Annulée' };
export const taskToDb = Object.fromEntries(Object.entries(taskFromDb).map(([key, value]) => [value, key])) as Record<Prospect['taskStatus'], string>;
const relationFromDb: Record<string, Prospect['linkedinRelation']> = { '1st': '1er niveau', '2nd': '2e niveau', '3rd': '3e niveau', out_of_network: 'Hors réseau' };
export const relationToDb = Object.fromEntries(Object.entries(relationFromDb).map(([key, value]) => [value, key])) as Record<Prospect['linkedinRelation'], string>;
const verificationFromDb: Record<string, Prospect['verificationStatus']> = { verified: 'Vérifié', to_verify: 'À vérifier', unverified: 'Non vérifié', invalid: 'Non vérifié' };
export const verificationToDb = Object.fromEntries(Object.entries(verificationFromDb).map(([key, value]) => [value, key])) as Record<Prospect['verificationStatus'], string>;

const activityTypeFromDb: Record<string, Activity['type']> = { created: 'created', linkedin_message: 'linkedin', email: 'email', whatsapp: 'follow_up', call: 'follow_up', reply: 'reply', status_change: 'status', offer_sent: 'offer', follow_up: 'follow_up', sale: 'sale', note: 'note', task: 'follow_up' };
export const activityTypeToDb: Record<Activity['type'], string> = { created: 'created', linkedin: 'linkedin_message', email: 'email', reply: 'reply', status: 'status_change', offer: 'offer_sent', follow_up: 'follow_up', sale: 'sale', note: 'note' };

export function mapActivity(row: DbRow): Activity {
  return { id: String(row.id), type: activityTypeFromDb[String(row.activity_type)] ?? 'note', label: String(row.title ?? 'Activité'), detail: typeof row.detail === 'string' ? row.detail : undefined, occurredAt: String(row.occurred_at ?? row.created_at) };
}

export function mapProspect(row: DbRow, context: { companies: Map<string, DbRow>; contacts: DbRow[]; activities: DbRow[]; tasks: DbRow[]; tags: DbRow[]; campaignLinks: DbRow[] }): Prospect {
  const contacts = context.contacts.filter((item) => item.prospect_id === row.id);
  const getContact = (type: string) => String(contacts.find((item) => item.type === type)?.value ?? '');
  const task = context.tasks.filter((item) => item.prospect_id === row.id && ['todo', 'in_progress'].includes(String(item.status))).sort((a, b) => String(a.due_at).localeCompare(String(b.due_at)))[0];
  const company = context.companies.get(String(row.company_id));
  const campaign = context.campaignLinks.find((item) => item.prospect_id === row.id && item.status !== 'removed');
  return {
    id: String(row.id), firstName: String(row.first_name), lastName: String(row.last_name), country: String(row.country ?? ''), city: String(row.city ?? ''), language: row.language === 'EN' ? 'EN' : 'FR', jobTitle: String(row.job_title ?? ''), company: String(company?.name ?? ''), linkedinUrl: String(row.linkedin_url ?? getContact('linkedin')), email: getContact('email'), phone: getContact('phone'), whatsapp: getContact('whatsapp'), verificationStatus: verificationFromDb[String(row.verification_status)] ?? 'Non vérifié', dataSource: String(row.source_label ?? 'Saisie manuelle'), source: String(row.source_label ?? 'Manuel'), linkedinRelation: relationFromDb[String(row.linkedin_relation)] ?? 'Hors réseau', score: Number(row.score ?? 0), segment: String(row.segment ?? ''), market: String(row.market ?? 'Canada FR') as Prospect['market'], activeSearch: Boolean(row.active_search), potentialProduct: String(row.potential_product ?? ''), tags: context.tags.filter((item) => item.prospect_id === row.id).map((item) => String(item.name)), status: statusFromDb[String(row.status)] ?? 'Nouveau', lastAction: String(row.last_action_label ?? ''), nextAction: String(task?.title ?? row.next_action_label ?? ''), nextActionAt: String(task?.due_at ?? row.next_action_at ?? ''), nextActionType: actionFromDb[String(task?.action_type ?? row.next_action_type)] ?? 'Qualification', taskStatus: taskFromDb[String(task?.status ?? row.task_status)] ?? 'À faire', nextTaskId: task ? String(task.id) : undefined, owner: String(row.owner_email ?? ''), notes: String(row.notes ?? ''), campaignId: String(campaign?.campaign_id ?? ''), createdAt: String(row.created_at), updatedAt: String(row.updated_at), activities: context.activities.filter((item) => item.prospect_id === row.id).map(mapActivity),
  };
}

export function mapCampaign(row: DbRow, revenue = 0): Campaign {
  return { id: String(row.id), name: String(row.market ?? row.name) as Campaign['name'], status: row.status === 'active' ? 'Active' : row.status === 'paused' ? 'En pause' : 'Terminée', product: String(row.product ?? ''), revenue, currency: ['CAD', 'CHF'].includes(String(row.currency)) ? String(row.currency) as 'CAD' | 'CHF' : 'EUR' };
}

export function mapTemplate(row: DbRow, campaignName = 'Toutes'): MessageTemplate {
  return { id: String(row.id), name: String(row.name), channel: row.channel === 'email' ? 'Email' : row.channel === 'whatsapp' ? 'WhatsApp' : 'LinkedIn', language: row.language === 'EN' ? 'EN' : 'FR', product: String(row.product ?? ''), stage: String(row.stage ?? ''), campaign: campaignName as MessageTemplate['campaign'], body: String(row.body ?? ''), updatedAt: String(row.updated_at), active: row.is_active !== false };
}

export function normalizeLinkedIn(value: string) { return value.trim().toLowerCase().replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''); }
export function normalizeEmail(value: string) { return value.trim().toLowerCase(); }
export function normalizePhone(value: string) { return value.replace(/[^\d+]/g, '').replace(/^00/, '+'); }
