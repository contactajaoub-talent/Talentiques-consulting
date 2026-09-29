import 'server-only';
import type { AcquisitionState, Prospect } from './types';
import { mapCampaign, mapProspect, mapTemplate, normalizeEmail, normalizeLinkedIn, normalizePhone, type DbRow } from './mappers';
import type { DuplicateMatch } from './dedupe';
import { selectAllRows, selectRows } from './repository';

function inFilter(ids: string[]) {
  return `in.(${ids.join(',')})`;
}

async function hydrateProspects(prospectRows: DbRow[]): Promise<Prospect[]> {
  if (!prospectRows.length) return [];

  const prospectIds = prospectRows.map((row) => String(row.id));
  const prospectFilter = inFilter(prospectIds);
  const companyIds = [...new Set(prospectRows.map((row) => row.company_id).filter(Boolean).map(String))];

  const [companies, contacts, activities, tasks, campaignLinks, prospectTags] = await Promise.all([
    companyIds.length ? selectAllRows('companies', { id: inFilter(companyIds) }) : Promise.resolve([]),
    selectAllRows('contact_methods', { prospect_id: prospectFilter }),
    selectAllRows('activities', { prospect_id: prospectFilter, order: 'occurred_at.desc' }),
    selectAllRows('tasks', { prospect_id: prospectFilter, order: 'due_at.asc' }),
    selectAllRows('campaign_prospects', { prospect_id: prospectFilter }),
    selectAllRows('prospect_tags', { prospect_id: prospectFilter }),
  ]);

  const tagIds = [...new Set(prospectTags.map((row) => row.tag_id).filter(Boolean).map(String))];
  const tags = tagIds.length ? await selectAllRows('tags', { id: inFilter(tagIds) }) : [];
  const companyMap = new Map(companies.map((row) => [String(row.id), row]));
  const tagMap = new Map(tags.map((row) => [String(row.id), String(row.name)]));
  const tagged = prospectTags.map((link) => ({ ...link, name: tagMap.get(String(link.tag_id)) ?? '' }));
  const context = { companies: companyMap, contacts, activities, tasks, tags: tagged, campaignLinks };

  return prospectRows.map((row) => mapProspect(row, context));
}

export async function getAcquisitionState(): Promise<AcquisitionState> {
  const [prospectRows, companies, contacts, activities, tasks, campaigns, campaignLinks, templates, tags, prospectTags, orders] = await Promise.all([
    selectAllRows('prospects', { archived_at: 'is.null', order: 'updated_at.desc' }),
    selectAllRows('companies'),
    selectAllRows('contact_methods'),
    selectAllRows('activities', { order: 'occurred_at.desc' }),
    selectAllRows('tasks', { order: 'due_at.asc' }),
    selectAllRows('campaigns', { order: 'created_at.desc' }),
    selectAllRows('campaign_prospects'),
    selectAllRows('message_templates', { order: 'updated_at.desc' }),
    selectAllRows('tags'),
    selectAllRows('prospect_tags'),
    selectAllRows('orders', { status: 'eq.paid' }),
  ]);

  const companyMap = new Map(companies.map((row) => [String(row.id), row]));
  const tagMap = new Map(tags.map((row) => [String(row.id), String(row.name)]));
  const tagged = prospectTags.map((link) => ({ ...link, name: tagMap.get(String(link.tag_id)) ?? '' }));
  const context = { companies: companyMap, contacts, activities, tasks, tags: tagged, campaignLinks };
  const prospects = prospectRows.map((row) => mapProspect(row, context));
  const campaignName = new Map(campaigns.map((row) => [String(row.id), String(row.name ?? row.market)]));
  const campaignRevenue = new Map<string, number>();

  for (const order of orders) {
    const link = campaignLinks.find((item) => item.prospect_id === order.prospect_id && item.status !== 'removed');
    if (link) campaignRevenue.set(String(link.campaign_id), (campaignRevenue.get(String(link.campaign_id)) ?? 0) + Number(order.amount ?? 0));
  }

  return {
    prospects,
    campaigns: campaigns.map((row) => mapCampaign(row, campaignRevenue.get(String(row.id)) ?? 0)),
    templates: templates.map((row) => mapTemplate(row, campaignName.get(String(row.campaign_id)) ?? 'Toutes')),
  };
}

export async function getProspectsByIds(ids: string[]): Promise<Prospect[]> {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return [];
  const rows = await selectAllRows('prospects', { id: inFilter(uniqueIds), archived_at: 'is.null' });
  return hydrateProspects(rows);
}

export async function getProspectById(id: string): Promise<Prospect | null> {
  return (await getProspectsByIds([id]))[0] ?? null;
}

export async function findDuplicates(
  input: { linkedinUrl?: string; email?: string; phone?: string },
  excludeProspectId?: string
): Promise<DuplicateMatch[]> {
  const matches = new Map<string, Set<'linkedin' | 'email' | 'phone'>>();
  const add = (prospectId: unknown, field: 'linkedin' | 'email' | 'phone') => {
    const id = String(prospectId ?? '');
    if (!id || id === excludeProspectId) return;
    const fields = matches.get(id) ?? new Set<'linkedin' | 'email' | 'phone'>();
    fields.add(field);
    matches.set(id, fields);
  };

  const linkedin = input.linkedinUrl ? normalizeLinkedIn(input.linkedinUrl) : '';
  const email = input.email ? normalizeEmail(input.email) : '';
  const phone = input.phone ? normalizePhone(input.phone) : '';

  if (linkedin) {
    const stored = `https://www.${linkedin}`;
    const rows = await selectRows('prospects', { linkedin_url: `eq.${stored}`, archived_at: 'is.null', select: 'id' });
    rows.forEach((row) => add(row.id, 'linkedin'));
  }

  if (email) {
    const rows = await selectRows('contact_methods', { type: 'eq.email', normalized_value: `eq.${email}`, select: 'prospect_id' });
    rows.forEach((row) => add(row.prospect_id, 'email'));
  }

  if (phone) {
    const rows = await selectRows('contact_methods', { type: 'in.(phone,whatsapp)', normalized_value: `eq.${phone}`, select: 'prospect_id' });
    rows.forEach((row) => add(row.prospect_id, 'phone'));
  }

  const prospects = await getProspectsByIds([...matches.keys()]);
  return prospects.map((prospect) => ({
    prospect,
    fields: [...(matches.get(prospect.id) ?? [])],
  }));
}

export async function getDueToday() {
  return selectRows('actions_due_today', { order: 'priority.desc,due_at.asc', limit: '200' });
}

export function asRow(value: unknown): DbRow { return value && typeof value === 'object' ? value as DbRow : {}; }
