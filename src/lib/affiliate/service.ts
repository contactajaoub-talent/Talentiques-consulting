import {
  affiliateMarketFromPath,
  normalizeAffiliateCode,
} from './core.ts';

export type PublicAffiliate = {
  id: string;
  code: string;
  status: string;
};

export type AttributionInput = {
  ref: unknown;
  pathname: unknown;
  tracking?: unknown;
  anonymousSessionId: string;
};

type Dependencies = {
  findActiveAffiliateByCode: (code: string) => Promise<PublicAffiliate | null>;
  insertAffiliateClick: (payload: Record<string, unknown>) => Promise<{ id: string }>;
};

const TRACKING_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
  'gclid',
] as const;

function cleanTracking(value: unknown) {
  const clean: Record<string, string> = {};
  if (!value || typeof value !== 'object') return clean;
  const source = value as Record<string, unknown>;
  for (const key of TRACKING_KEYS) {
    const item = source[key];
    if (typeof item === 'string' && item.trim()) clean[key] = item.trim().slice(0, 500);
  }
  return clean;
}

export async function createAffiliateAttribution(
  input: AttributionInput,
  dependencies: Dependencies
) {
  const code = normalizeAffiliateCode(input.ref);
  const pathname = typeof input.pathname === 'string' ? input.pathname.slice(0, 1000) : '';
  const market = affiliateMarketFromPath(pathname);
  if (!code || !market) return null;

  const affiliate = await dependencies.findActiveAffiliateByCode(code);
  if (!affiliate || affiliate.status !== 'active') return null;

  const click = await dependencies.insertAffiliateClick({
    affiliate_id: affiliate.id,
    affiliate_code: affiliate.code,
    market,
    landing_path: pathname,
    anonymous_session_id: input.anonymousSessionId,
    ...cleanTracking(input.tracking),
  });

  return { code: affiliate.code, clickId: click.id };
}
