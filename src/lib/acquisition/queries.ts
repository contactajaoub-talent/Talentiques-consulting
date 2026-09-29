import 'server-only';
import type { AcquisitionState, Prospect } from './types';
import { mapCampaign, mapProspect, mapTemplate, type DbRow } from './mappers';
import { detectDuplicates, type DuplicateMatch } from './dedupe';
import { selectRows } from './repository';

export async function getAcquisitionState(): Promise<AcquisitionState> {
  const [prospectRows, companies, contacts, activities, tasks, campaigns, campaignLinks, templates, tags, prospectTags, orders] = await Promise.all([
    selectRows('prospects', { archived_at: 'is.null', order: 'updated_at.desc', limit: '500' }),
    selectRows('companies', { limit: '500' }),
    selectRows('contact_methods', { limit: '2000' }),
    selectRows('activities', { order: 'occurred_at.desc', limit: '5000' }),
    selectRows('tasks', { order: 'due_at.asc', limit: '2000' }),
    selectRows('campaigns', { order: 'created_at.desc', limit: '100' }),
    selectRows('campaign_prospects', { limit: '5000' }),
    selectRows('message_templates', { order: 'updated_at.desc', limit: '500' }),
    selectRows('tags', { limit: '500' }),
    selectRows('prospect_tags', { limit: '5000' }),
    selectRows('orders', { status: 'eq.paid', limit: '2000' }),
  ]);
  const companyMap = new Map(companies.map((row) => [String(row.id), row]));
  const tagMap = new Map(tags.map((row) => [String(row.id), String(row.name)]));
  const tagged = prospectTags.map((link) => ({ ...link, name: tagMap.get(String(link.tag_id)) ?? '' }));
  const context = { companies: companyMap, contacts, activities, tasks, tags: tagged, campaignLinks };
  const prospects = prospectRows.map((row) => mapProspect(row, context));
  const campaignName = new Map(campaigns.map((row) => [String(row.id), String(row.market ?? row.name)]));
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

export async function findDuplicates(input: { linkedinUrl?: string; email?: string; phone?: string }): Promise<DuplicateMatch[]> {
  const state = await getAcquisitionState();
  return detectDuplicates(state.prospects, input);
}

export async function getDueToday() {
  return selectRows('actions_due_today', { order: 'priority.desc,due_at.asc', limit: '200' });
}

export async function rawProspectsForExport() {
  return getAcquisitionState().then((state) => state.prospects);
}

export function asRow(value: unknown): DbRow { return value && typeof value === 'object' ? value as DbRow : {}; }
