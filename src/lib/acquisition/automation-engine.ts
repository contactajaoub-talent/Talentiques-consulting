import type { AutomationSettings, CatalogItem, Prospect, ProspectStatus } from './types';

export type AcquisitionEvent = 'prospect.created'|'prospect.qualified'|'prospect.contacted'|'prospect.replied'|'prospect.interested'|'offer.sent'|'task.completed'|'prospect.won'|'prospect.lost'|'prospect.archived';
export type AutomationPlan = { status?: ProspectStatus; cancelOpenTasks?: boolean; task?: { title: string; actionType: Prospect['nextActionType']; dueAt: string }; reason: string };

export function addBusinessDays(from: Date, days: number) { const date = new Date(from); let remaining = days; while (remaining > 0) { date.setDate(date.getDate() + 1); if (![0, 6].includes(date.getDay())) remaining -= 1; } return date; }

export function planNextAction(event: AcquisitionEvent, settings: AutomationSettings, now = new Date()): AutomationPlan {
  if (event === 'prospect.created') return { status: 'Nouveau', task: { title: 'Qualifier le prospect', actionType: 'Qualification', dueAt: now.toISOString() }, reason: 'Nouveau prospect à qualifier.' };
  if (event === 'prospect.qualified') return { status: 'À contacter', task: { title: 'Préparer le premier contact', actionType: 'Message LinkedIn', dueAt: now.toISOString() }, reason: 'Prospect qualifié.' };
  if (event === 'prospect.contacted') return { status: 'Contacté', cancelOpenTasks: true, task: { title: 'Relancer après le premier contact', actionType: 'Relance', dueAt: addBusinessDays(now, settings.followupAfterContactDays).toISOString() }, reason: 'Relance automatique après contact.' };
  if (event === 'prospect.replied') return { status: 'A répondu', cancelOpenTasks: true, task: { title: 'Traiter la réponse', actionType: 'Relance', dueAt: now.toISOString() }, reason: 'Réponse reçue à traiter immédiatement.' };
  if (event === 'prospect.interested') return { status: 'Intéressé', cancelOpenTasks: true, task: { title: 'Préparer la prochaine action commerciale', actionType: 'Offre', dueAt: now.toISOString() }, reason: 'Intérêt confirmé.' };
  if (event === 'offer.sent') return { status: 'Offre envoyée', cancelOpenTasks: true, task: { title: 'Relancer après l’offre', actionType: 'Relance', dueAt: addBusinessDays(now, settings.followupAfterOfferDays).toISOString() }, reason: 'Suivi commercial après offre.' };
  if (event === 'prospect.won') return { status: 'Client', cancelOpenTasks: true, reason: 'Opportunité gagnée.' };
  if (event === 'prospect.lost') return { status: 'Perdu', cancelOpenTasks: true, reason: 'Prospect perdu.' };
  if (event === 'prospect.archived') return { cancelOpenTasks: true, reason: 'Prospect archivé.' };
  return { reason: 'Aucune nouvelle action automatique.' };
}

export function automationKey(event: AcquisitionEvent, prospectId: string, discriminator = '') { return `${event}:${prospectId}:${discriminator || 'default'}`; }

export function recommendOffer(prospect: Pick<Prospect,'profileType'|'yearsExperience'|'currentSituation'|'mainNeed'|'opportunityType'|'activeSearch'>, catalog: CatalogItem[]) {
  const text = `${prospect.profileType ?? ''} ${prospect.currentSituation ?? ''} ${prospect.mainNeed ?? ''} ${prospect.opportunityType ?? ''}`.toLowerCase();
  const slug = text.includes('altern') ? 'kit-alternance-90-jours' : text.includes('student') || text.includes('étudiant') || text.includes('job seeker') || text.includes('demandeur') ? 'pack-etudiant-demandeur-emploi' : (prospect.yearsExperience ?? 0) >= 3 ? 'valorisation-professionnelle-complete' : text.includes('tracking') || text.includes('organisation') ? 'opportunity-management-system' : text.includes('cv') && text.includes('linkedin') ? 'career-branding-toolkit' : 'career-search-360';
  const offer = catalog.find((item) => item.slug === slug && item.active);
  return offer ? { offerId: offer.id, reason: `Règle déterministe : ${slug}.`, confidence: slug === 'career-search-360' ? 0.65 : 0.9 } : null;
}

export function suggestedScore(prospect: Pick<Prospect,'firstName'|'lastName'|'email'|'phone'|'linkedinUrl'|'verificationStatus'|'activeSearch'|'status'>) {
  let score = prospect.firstName && prospect.lastName ? 15 : 0; if (prospect.email) score += 15; if (prospect.phone) score += 10; if (prospect.linkedinUrl) score += 15; if (prospect.verificationStatus === 'Vérifié') score += 10; if (prospect.activeSearch) score += 10;
  score += ({ 'A répondu': 10, 'Intéressé': 20, 'Offre envoyée': 20, 'Client': 25 } as Partial<Record<ProspectStatus,number>>)[prospect.status] ?? 0;
  return Math.min(100, score);
}

export function prospectingPriority(prospect: Prospect, now = new Date()) {
  const due = prospect.nextActionAt ? new Date(prospect.nextActionAt).getTime() : Number.POSITIVE_INFINITY; const todayEnd = new Date(now); todayEnd.setHours(23,59,59,999);
  const tier = prospect.status === 'A répondu' ? 1 : due < now.getTime() ? 2 : due <= todayEnd.getTime() ? 3 : prospect.score >= 80 ? 4 : ['À contacter','Contacté'].includes(prospect.status) ? 5 : ['Nouveau','À qualifier'].includes(prospect.status) ? 6 : 7;
  return { tier, due, score: prospect.score, updated: new Date(prospect.updatedAt).getTime() };
}

export function sortProspectingQueue(prospects: Prospect[], now = new Date()) { return prospects.filter((item) => !item.doNotContact && !['Client','Perdu'].includes(item.status)).sort((a,b) => { const x=prospectingPriority(a,now), y=prospectingPriority(b,now); return x.tier-y.tier || x.due-y.due || y.score-x.score || x.updated-y.updated; }); }

export function validCurrency(value: unknown): value is 'EUR'|'USD' { return value === 'EUR' || value === 'USD'; }
export function validMarketId(value: unknown) { return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(value) && value.toLowerCase() !== 'null'; }
