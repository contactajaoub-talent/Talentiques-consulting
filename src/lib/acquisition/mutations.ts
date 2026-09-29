import 'server-only';
import type { Activity, AutomationSettings, Campaign, MarketRecord, MessageTemplate, Prospect } from './types';
import { actionToDb, activityTypeToDb, normalizeEmail, normalizeLinkedIn, normalizePhone, relationToDb, statusToDb, taskToDb, verificationToDb } from './mappers';
import { deleteRows, insertRows, selectAllRows, selectRows, updateRows, type JsonRow } from './repository';
import { findDuplicates, getProspectById } from './queries';
import { automationKey, planNextAction, recommendOffer, suggestedScore, validCurrency, validMarketId, type AcquisitionEvent } from './automation-engine';

function prospectPayload(prospect: Prospect): JsonRow {
  return { first_name: prospect.firstName.trim(), last_name: prospect.lastName.trim(), country: prospect.country || null, city: prospect.city || null, language: prospect.language, job_title: prospect.jobTitle || null, linkedin_url: prospect.linkedinUrl ? `https://www.${normalizeLinkedIn(prospect.linkedinUrl)}` : null, linkedin_relation: relationToDb[prospect.linkedinRelation], source_label: prospect.source || 'Saisie manuelle', verification_status: verificationToDb[prospect.verificationStatus], score: prospect.score, suggested_score: suggestedScore(prospect), segment: prospect.segment || null, market_id: prospect.marketId, market: prospect.market, active_search: prospect.activeSearch, potential_product: prospect.potentialProduct || null, recommended_offer_id: prospect.recommendedOfferId || null, recommendation_reason: prospect.recommendationReason || null, recommendation_confidence: prospect.recommendationConfidence ?? null, profile_type: prospect.profileType || null, years_experience: prospect.yearsExperience ?? null, current_situation: prospect.currentSituation || null, career_goal: prospect.careerGoal || null, opportunity_type: prospect.opportunityType || null, main_need: prospect.mainNeed || null, budget_range: prospect.budgetRange || null, priority: prospect.priority ?? 2, do_not_contact: prospect.doNotContact ?? false, status: statusToDb[prospect.status], last_action_label: prospect.lastAction || null, last_action_at: prospect.lastAction ? new Date().toISOString() : null, next_action_label: prospect.nextAction || null, next_action_at: prospect.nextActionAt || null, next_action_type: actionToDb[prospect.nextActionType], task_status: taskToDb[prospect.taskStatus], owner_email: prospect.owner || null, notes: prospect.notes || null };
}

async function requireMarket(marketId: unknown) {
  if (!validMarketId(marketId)) throw new Error('Un marché Supabase valide est requis.');
  const market = (await selectRows('markets', { id: `eq.${marketId}`, active: 'eq.true', limit: '1' }))[0];
  if (!market) throw new Error('Le marché sélectionné est introuvable ou inactif.');
  return market;
}

async function automationSettings(): Promise<AutomationSettings> {
  const row = (await selectRows('acquisition_settings', { id: 'eq.default', limit: '1' }))[0];
  return { timezone: String(row?.timezone ?? 'Africa/Casablanca'), followupAfterContactDays: Number(row?.followup_after_contact_days ?? 3), followupAfterOfferDays: Number(row?.followup_after_offer_days ?? 3), automationEnabled: row?.automation_enabled !== false, defaultOwner: String(row?.default_owner ?? '') };
}

async function runAutomation(prospectId: string, event: AcquisitionEvent, discriminator = '') {
  const key = automationKey(event, prospectId, discriminator);
  if ((await selectRows('automation_runs', { idempotency_key: `eq.${key}`, limit: '1' }))[0]) return;
  const settings = await automationSettings();
  const plan = planNextAction(event, settings);
  await insertRows('automation_runs', { event_type: event, prospect_id: prospectId, status: settings.automationEnabled ? 'running' : 'skipped', action: plan.reason, idempotency_key: key, metadata: { plan } });
  if (!settings.automationEnabled) return;
  if (plan.cancelOpenTasks) await updateRows('tasks', { prospect_id: `eq.${prospectId}`, status: 'in.(todo,in_progress)' }, { status: 'cancelled' });
  if (plan.task) {
    const duplicate = (await selectRows('tasks', { prospect_id: `eq.${prospectId}`, status: 'in.(todo,in_progress)', title: `eq.${plan.task.title}`, due_at: `eq.${plan.task.dueAt}`, limit: '1' }))[0];
    if (!duplicate) await insertRows('tasks', { prospect_id: prospectId, action_type: actionToDb[plan.task.actionType], title: plan.task.title, due_at: plan.task.dueAt, status: 'todo', owner_email: settings.defaultOwner || null });
  }
  const payload: JsonRow = { last_action_label: plan.reason, last_action_at: new Date().toISOString() };
  if (plan.status) payload.status = statusToDb[plan.status];
  if (plan.task) { payload.next_action_label = plan.task.title; payload.next_action_type = actionToDb[plan.task.actionType]; payload.next_action_at = plan.task.dueAt; payload.task_status = 'todo'; }
  else if (plan.cancelOpenTasks) { payload.next_action_label = null; payload.next_action_at = null; payload.task_status = 'cancelled'; }
  await updateRows('prospects', { id: `eq.${prospectId}` }, payload);
  if (['prospect.interested', 'offer.sent'].includes(event)) {
    const prospect = (await selectRows('prospects', { id: `eq.${prospectId}`, limit: '1' }))[0];
    if (prospect?.recommended_offer_id) {
      const existing = (await selectRows('opportunities', { prospect_id: `eq.${prospectId}`, catalog_item_id: `eq.${String(prospect.recommended_offer_id)}`, status: 'eq.open', limit: '1' }))[0];
      if (!existing) {
        const market = (await selectRows('markets', { id: `eq.${String(prospect.market_id)}`, limit: '1' }))[0];
        await insertRows('opportunities', { prospect_id: prospectId, catalog_item_id: prospect.recommended_offer_id, stage: event === 'offer.sent' ? 'offer_sent' : 'interested', currency: market?.default_currency === 'USD' ? 'USD' : 'EUR', status: 'open', recommendation_source: 'rules' });
      } else if (event === 'offer.sent') await updateRows('opportunities', { id: `eq.${String(existing.id)}` }, { stage: 'offer_sent' });
    }
  }
  if (event === 'prospect.won') await updateRows('opportunities', { prospect_id: `eq.${prospectId}`, status: 'eq.open' }, { status: 'won', stage: 'won', won_at: new Date().toISOString() });
  if (event === 'prospect.lost') await updateRows('opportunities', { prospect_id: `eq.${prospectId}`, status: 'eq.open' }, { status: 'lost', stage: 'lost', lost_at: new Date().toISOString() });
  await updateRows('automation_runs', { idempotency_key: `eq.${key}` }, { status: 'completed', completed_at: new Date().toISOString() });
}

const statusEvent: Partial<Record<Prospect['status'], AcquisitionEvent>> = { 'À contacter': 'prospect.qualified', 'Contacté': 'prospect.contacted', 'A répondu': 'prospect.replied', 'Intéressé': 'prospect.interested', 'Offre envoyée': 'offer.sent', Client: 'prospect.won', Perdu: 'prospect.lost' };

async function companyId(name: string) {
  if (!name.trim()) return null;
  const existing = await selectRows('companies', { name: `ilike.${name.trim()}`, limit: '1' });
  if (existing[0]) return String(existing[0].id);
  return String((await insertRows('companies', { name: name.trim() }))[0].id);
}

async function insertActivity(prospectId: string, event: Omit<Activity, 'id' | 'occurredAt'>, metadata: JsonRow = {}) {
  await insertRows('activities', { prospect_id: prospectId, activity_type: activityTypeToDb[event.type], channel: event.type === 'linkedin' ? 'linkedin' : event.type === 'email' ? 'email' : 'internal', direction: event.type === 'reply' ? 'inbound' : event.type === 'note' || event.type === 'status' ? 'internal' : 'outbound', title: event.label, detail: event.detail || null, metadata, occurred_at: new Date().toISOString() });
}

async function syncContacts(prospectId: string, patch: Partial<Prospect>) {
  const existing = await selectRows('contact_methods', { prospect_id: `eq.${prospectId}` });
  const specs: Array<{ key: 'email' | 'phone' | 'whatsapp'; type: 'email' | 'phone' | 'whatsapp'; normalize: (value: string) => string }> = [
    { key: 'email', type: 'email', normalize: normalizeEmail },
    { key: 'phone', type: 'phone', normalize: normalizePhone },
    { key: 'whatsapp', type: 'whatsapp', normalize: normalizePhone },
  ];

  for (const spec of specs) {
    if (patch[spec.key] === undefined) continue;
    const value = String(patch[spec.key] ?? '').trim();
    const sameType = existing.filter((row) => row.type === spec.type);

    if (!value) {
      if (sameType.length) await deleteRows('contact_methods', { prospect_id: `eq.${prospectId}`, type: `eq.${spec.type}` });
      continue;
    }

    const payload: JsonRow = {
      value,
      normalized_value: spec.normalize(value),
      is_primary: true,
    };

    if (patch.verificationStatus !== undefined) payload.verification_status = verificationToDb[patch.verificationStatus];
    const source = patch.dataSource || patch.source;
    if (source) payload.source_label = source;

    if (sameType[0]) {
      await updateRows('contact_methods', { id: `eq.${String(sameType[0].id)}` }, payload);
    } else {
      await insertRows('contact_methods', { ...payload, prospect_id: prospectId, type: spec.type });
    }
  }
}

async function upsertTask(prospectId: string, prospect: Prospect) {
  const open = await selectRows('tasks', { prospect_id: `eq.${prospectId}`, status: 'in.(todo,in_progress)', order: 'due_at.asc', limit: '1' });
  if (!prospect.nextActionAt || ['Client', 'Perdu'].includes(prospect.status)) {
    if (open[0]) await updateRows('tasks', { id: `eq.${String(open[0].id)}` }, { status: 'cancelled' });
    return;
  }
  const payload = { action_type: actionToDb[prospect.nextActionType], title: prospect.nextAction, due_at: prospect.nextActionAt, status: taskToDb[prospect.taskStatus], owner_email: prospect.owner || null, notes: prospect.notes || null };
  if (open[0]) await updateRows('tasks', { id: `eq.${String(open[0].id)}` }, payload);
  else await insertRows('tasks', { ...payload, prospect_id: prospectId });
}

async function setCampaign(prospectId: string, campaignId: string) {
  await deleteRows('campaign_prospects', { prospect_id: `eq.${prospectId}` });
  if (campaignId) await insertRows('campaign_prospects', { prospect_id: prospectId, campaign_id: campaignId, status: 'active' });
}

async function replaceTags(prospectId: string, names: string[]) {
  await deleteRows('prospect_tags', { prospect_id: `eq.${prospectId}` });
  for (const rawName of [...new Set(names.map((name) => name.trim()).filter(Boolean))]) {
    const existing = await selectRows('tags', { name: `eq.${rawName}`, limit: '1' });
    const tagId = existing[0]?.id ?? (await insertRows('tags', { name: rawName }))[0].id;
    await insertRows('prospect_tags', { prospect_id: prospectId, tag_id: tagId });
  }
}

function keep(existing: string, incoming: string) {
  return existing.trim() ? existing : incoming;
}

function mergeProspects(existing: Prospect, incoming: Prospect): Prospect {
  const verificationRank = { 'Non vérifié': 0, 'À vérifier': 1, 'Vérifié': 2 } as const;
  const incomingVerification = verificationRank[incoming.verificationStatus] > verificationRank[existing.verificationStatus]
    ? incoming.verificationStatus
    : existing.verificationStatus;

  const notes = [existing.notes.trim(), incoming.notes.trim()].filter(Boolean);
  const mergedNotes = [...new Set(notes)].join('\n\n');

  return {
    ...existing,
    firstName: keep(existing.firstName, incoming.firstName),
    lastName: keep(existing.lastName, incoming.lastName),
    country: keep(existing.country, incoming.country),
    city: keep(existing.city, incoming.city),
    jobTitle: keep(existing.jobTitle, incoming.jobTitle),
    company: keep(existing.company, incoming.company),
    linkedinUrl: keep(existing.linkedinUrl, incoming.linkedinUrl),
    email: keep(existing.email, incoming.email),
    phone: keep(existing.phone, incoming.phone),
    whatsapp: keep(existing.whatsapp, incoming.whatsapp),
    dataSource: keep(existing.dataSource, incoming.dataSource),
    source: keep(existing.source, incoming.source),
    segment: keep(existing.segment, incoming.segment),
    potentialProduct: keep(existing.potentialProduct, incoming.potentialProduct),
    lastAction: keep(existing.lastAction, incoming.lastAction),
    nextAction: keep(existing.nextAction, incoming.nextAction),
    nextActionAt: keep(existing.nextActionAt, incoming.nextActionAt),
    owner: keep(existing.owner, incoming.owner),
    campaignId: keep(existing.campaignId, incoming.campaignId),
    tags: [...new Set([...existing.tags, ...incoming.tags])],
    score: Math.max(existing.score, incoming.score),
    activeSearch: existing.activeSearch || incoming.activeSearch,
    verificationStatus: incomingVerification,
    notes: mergedNotes,
    updatedAt: new Date().toISOString(),
  };
}

export async function createProspect(prospect: Prospect, options: { force?: boolean; mergeId?: string } = {}) {
  const market = await requireMarket(prospect.marketId);
  prospect = { ...prospect, market: String(market.name) };
  const catalog = await selectAllRows('catalog_items', { active: 'eq.true' });
  const recommendation = recommendOffer(prospect, catalog.map((row) => ({ id: String(row.id), name: String(row.name), slug: String(row.slug), category: String(row.category), offerType: String(row.offer_type) as 'service'|'digital_product'|'bundle'|'system', audience: String(row.audience ?? ''), description: String(row.description ?? ''), priceEur: row.price_eur == null ? null : Number(row.price_eur), priceUsd: row.price_usd == null ? null : Number(row.price_usd), active: row.active !== false, salesEnabled: row.sales_enabled === true, tags: Array.isArray(row.tags) ? row.tags.map(String) : [] })));
  if (recommendation && !prospect.recommendedOfferId) prospect = { ...prospect, recommendedOfferId: recommendation.offerId, recommendationReason: recommendation.reason, recommendationConfidence: recommendation.confidence };
  const duplicates = await findDuplicates(prospect);
  if (duplicates.length && !options.force && !options.mergeId) return { duplicate: duplicates };

  if (options.mergeId) {
    const existing = await getProspectById(options.mergeId);
    if (!existing) throw new Error('Prospect à fusionner introuvable.');
    const merged = mergeProspects(existing, prospect);
    await updateProspect(options.mergeId, merged, { type: 'note', label: 'Doublon fusionné', detail: `Données fusionnées depuis ${prospect.firstName} ${prospect.lastName}.` }, { skipDuplicateCheck: true });
    return { id: options.mergeId, merged: true };
  }

  const company = await companyId(prospect.company);
  const rows = await insertRows('prospects', { ...prospectPayload(prospect), company_id: company });
  const id = String(rows[0].id);
  await Promise.all([
    syncContacts(id, prospect),
    replaceTags(id, prospect.tags),
    setCampaign(id, prospect.campaignId),
    insertActivity(id, { type: 'created', label: 'Prospect créé', detail: 'Ajouté dans Acquisition OS.' }),
  ]);
  await runAutomation(id, 'prospect.created', 'creation');
  return { id };
}

export async function updateProspect(
  id: string,
  patch: Partial<Prospect>,
  event?: Omit<Activity, 'id' | 'occurredAt'>,
  options: { skipDuplicateCheck?: boolean } = {}
) {
  const needsIdentityCheck = patch.linkedinUrl !== undefined || patch.email !== undefined || patch.phone !== undefined;
  const needsCurrent = needsIdentityCheck || patch.email !== undefined || patch.phone !== undefined || patch.whatsapp !== undefined || patch.nextActionAt !== undefined || patch.nextAction !== undefined || patch.nextActionType !== undefined || patch.taskStatus !== undefined || patch.status !== undefined;
  const current = needsCurrent ? await getProspectById(id) : null;

  if (needsIdentityCheck && !options.skipDuplicateCheck && current) {
    const duplicates = await findDuplicates({
      linkedinUrl: patch.linkedinUrl ?? current.linkedinUrl,
      email: patch.email ?? current.email,
      phone: patch.phone ?? current.phone,
    }, id);

    if (duplicates.length) {
      const match = duplicates[0];
      throw new Error(`Doublon détecté avec ${match.prospect.firstName} ${match.prospect.lastName} (${match.fields.join(', ')}).`);
    }
  }

  const payload: JsonRow = {};
  if (patch.marketId !== undefined) {
    const market = await requireMarket(patch.marketId);
    payload.market_id = patch.marketId;
    payload.market = String(market.name);
  }
  const mapping: Array<[keyof Prospect, string, (value: never) => unknown]> = [
    ['firstName', 'first_name', String], ['lastName', 'last_name', String], ['country', 'country', String], ['city', 'city', String], ['language', 'language', String], ['jobTitle', 'job_title', String], ['linkedinUrl', 'linkedin_url', (v) => v ? `https://www.${normalizeLinkedIn(String(v))}` : null], ['linkedinRelation', 'linkedin_relation', (v) => relationToDb[v]], ['verificationStatus', 'verification_status', (v) => verificationToDb[v]], ['source', 'source_label', String], ['score', 'score', Number], ['segment', 'segment', String], ['activeSearch', 'active_search', Boolean], ['potentialProduct', 'potential_product', String], ['recommendedOfferId', 'recommended_offer_id', (v) => v || null], ['recommendationReason', 'recommendation_reason', String], ['recommendationConfidence', 'recommendation_confidence', Number], ['profileType', 'profile_type', String], ['yearsExperience', 'years_experience', Number], ['currentSituation', 'current_situation', String], ['careerGoal', 'career_goal', String], ['opportunityType', 'opportunity_type', String], ['mainNeed', 'main_need', String], ['budgetRange', 'budget_range', String], ['priority', 'priority', Number], ['doNotContact', 'do_not_contact', Boolean], ['status', 'status', (v) => statusToDb[v]], ['lastAction', 'last_action_label', String], ['nextAction', 'next_action_label', String], ['nextActionAt', 'next_action_at', (v) => v || null], ['nextActionType', 'next_action_type', (v) => actionToDb[v]], ['taskStatus', 'task_status', (v) => taskToDb[v]], ['owner', 'owner_email', String], ['notes', 'notes', String],
  ];

  for (const [key, column, transform] of mapping) {
    if (patch[key] !== undefined) payload[column] = transform(patch[key] as never);
  }

  if (patch.lastAction !== undefined) payload.last_action_at = patch.lastAction ? new Date().toISOString() : null;
  if (patch.company !== undefined) payload.company_id = await companyId(patch.company);
  if (Object.keys(payload).length) await updateRows('prospects', { id: `eq.${id}`, archived_at: 'is.null' }, payload);

  if (patch.email !== undefined || patch.phone !== undefined || patch.whatsapp !== undefined) {
    await syncContacts(id, patch);
  }

  if (patch.campaignId !== undefined) await setCampaign(id, patch.campaignId);
  if (patch.tags !== undefined) await replaceTags(id, patch.tags);

  if (patch.nextActionAt !== undefined || patch.nextAction !== undefined || patch.nextActionType !== undefined || patch.taskStatus !== undefined || patch.status !== undefined) {
    const prospect = current ? { ...current, ...patch } : await getProspectById(id);
    if (prospect) await upsertTask(id, prospect);
  }

  if (event) await insertActivity(id, event, { patch: Object.keys(patch) });
  const automationEvent = patch.status ? statusEvent[patch.status] : undefined;
  if (automationEvent) await runAutomation(id, automationEvent, `${patch.status}:${new Date().toISOString().slice(0, 16)}`);
  return { id };
}

export async function archiveProspect(id: string) { await updateRows('prospects', { id: `eq.${id}` }, { archived_at: new Date().toISOString() }); await runAutomation(id, 'prospect.archived', 'archive'); }
export async function completeTask(id: string) { const task = (await selectRows('tasks', { id: `eq.${id}`, limit: '1' }))[0]; await updateRows('tasks', { id: `eq.${id}` }, { status: 'done', completed_at: new Date().toISOString() }); if (task?.prospect_id) { await insertActivity(String(task.prospect_id), { type: 'follow_up', label: 'Tâche terminée', detail: String(task.title ?? '') }); await runAutomation(String(task.prospect_id), 'task.completed', id); } }

export async function saveCampaign(campaign: Campaign) {
  if (!campaign.name.trim()) throw new Error('Le nom de la campagne est requis.');
  const market = await requireMarket(campaign.marketId);
  if (!validCurrency(campaign.currency)) throw new Error('La devise Acquisition doit être EUR ou USD.');
  if (campaign.catalogItemId && !(await selectRows('catalog_items', { id: `eq.${campaign.catalogItemId}`, active: 'eq.true', limit: '1' }))[0]) throw new Error('L’offre sélectionnée est introuvable ou inactive.');
  const payload = { name: campaign.name.trim(), market_id: campaign.marketId, market: String(market.name), language: campaign.language, catalog_item_id: campaign.catalogItemId || null, product: campaign.product || null, audience: campaign.audience || null, status: campaign.status === 'Active' ? 'active' : campaign.status === 'En pause' ? 'paused' : 'completed', currency: campaign.currency, starts_at: campaign.startsAt || null, ends_at: campaign.endsAt || null, target_count: campaign.targetCount ?? null, revenue_target: campaign.revenueTarget ?? null };
  if (campaign.id.startsWith('new-')) return insertRows('campaigns', payload);
  return updateRows('campaigns', { id: `eq.${campaign.id}` }, payload);
}

export async function saveMarket(market: MarketRecord) {
  if (!market.name.trim() || !market.country.trim() || !market.countryCode.trim()) throw new Error('Nom, pays et code pays sont requis.');
  if (!validCurrency(market.defaultCurrency)) throw new Error('La devise par défaut doit être EUR ou USD.');
  const payload = { name: market.name.trim(), country: market.country.trim(), country_code: market.countryCode.trim().toUpperCase(), region: market.region || null, language: market.language, default_currency: market.defaultCurrency, timezone: market.timezone || 'UTC', active: market.active, notes: market.notes || null };
  if (market.id.startsWith('new-')) return insertRows('markets', payload);
  if (!validMarketId(market.id)) throw new Error('Identifiant de marché invalide.');
  return updateRows('markets', { id: `eq.${market.id}` }, payload);
}

export async function saveSettings(settings: AutomationSettings) {
  if (!settings.timezone.trim()) throw new Error('Le fuseau horaire est requis.');
  if (![settings.followupAfterContactDays, settings.followupAfterOfferDays].every((value) => Number.isInteger(value) && value >= 1 && value <= 30)) throw new Error('Les délais de relance doivent être compris entre 1 et 30 jours.');
  return updateRows('acquisition_settings', { id: 'eq.default' }, { timezone: settings.timezone, followup_after_contact_days: settings.followupAfterContactDays, followup_after_offer_days: settings.followupAfterOfferDays, automation_enabled: settings.automationEnabled, default_owner: settings.defaultOwner });
}

export async function saveMessageTemplate(template: MessageTemplate) {
  const channels = { LinkedIn: 'linkedin', Email: 'email', WhatsApp: 'whatsapp' } as const;
  const campaign = template.campaign === 'Toutes' ? null : (await selectRows('campaigns', { name: `eq.${template.campaign}`, limit: '1' }))[0];
  const payload = { name: template.name, channel: channels[template.channel], language: template.language, product: template.product || null, stage: template.stage, campaign_id: campaign?.id ?? null, body: template.body, is_active: template.active !== false };
  if (template.id.startsWith('new-')) return insertRows('message_templates', payload);
  return updateRows('message_templates', { id: `eq.${template.id}` }, payload);
}
export async function deleteMessageTemplate(id: string) { await deleteRows('message_templates', { id: `eq.${id}` }); }

export type CsvProspectInput = Partial<Record<'first_name'|'last_name'|'linkedin_url'|'email'|'phone'|'country'|'city'|'language'|'job_title'|'company'|'source'|'campaign', string>>;
export async function importProspects(rows: CsvProspectInput[], forceDuplicates = false) {
  const report = { imported: 0, duplicates: 0, skipped: 0, errors: [] as Array<{ row: number; message: string }> };
  const [campaigns, markets] = await Promise.all([selectAllRows('campaigns'), selectAllRows('markets', { active: 'eq.true' })]);
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    if (!row.first_name?.trim() || !row.last_name?.trim()) { report.skipped += 1; report.errors.push({ row: index + 2, message: 'Prénom et nom requis' }); continue; }
    const campaign = campaigns.find((item) => String(item.name).toLowerCase() === row.campaign?.trim().toLowerCase());
    const market = markets.find((item) => item.id === campaign?.market_id);
    if (!market) { report.skipped += 1; report.errors.push({ row: index + 2, message: 'Campagne avec marché valide requise' }); continue; }
    const now = new Date().toISOString();
    const prospect: Prospect = { id: crypto.randomUUID(), firstName: row.first_name.trim(), lastName: row.last_name.trim(), linkedinUrl: row.linkedin_url ?? '', email: row.email ?? '', phone: row.phone ?? '', whatsapp: '', country: row.country ?? '', city: row.city ?? '', language: row.language?.toUpperCase() === 'EN' ? 'EN' : 'FR', jobTitle: row.job_title ?? '', company: row.company ?? '', source: row.source ?? 'Import CSV', dataSource: 'Import CSV', verificationStatus: 'À vérifier', linkedinRelation: 'Hors réseau', score: 50, segment: 'À qualifier', marketId: String(market.id), market: String(market.name), activeSearch: false, potentialProduct: String(campaign?.product ?? 'À définir'), tags: [], status: 'Nouveau', lastAction: 'Import CSV', nextAction: 'Qualifier le prospect', nextActionAt: now, nextActionType: 'Qualification', taskStatus: 'À faire', owner: '', notes: '', campaignId: String(campaign?.id ?? ''), createdAt: now, updatedAt: now, activities: [] };
    try {
      const result = await createProspect(prospect, { force: forceDuplicates });
      if ('duplicate' in result) report.duplicates += 1;
      else report.imported += 1;
    } catch (error) {
      report.errors.push({ row: index + 2, message: error instanceof Error ? error.message : 'Erreur inconnue' });
    }
  }
  return report;
}
