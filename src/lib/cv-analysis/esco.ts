export type EscoContext = {
  used: boolean;
  occupation: string | null;
  skills: string[];
};

const ESCO_API = 'https://ec.europa.eu/esco/api';
const ESCO_VERSION = '1.2.1';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { expires: number; value: EscoContext }>();

type FetchLike = typeof fetch;

export async function fetchEscoContext(
  targetRole: string,
  language: 'fr' | 'en',
  fetchImpl: FetchLike = fetch,
): Promise<EscoContext> {
  const role = targetRole.trim().slice(0, 160);
  if (!role) return emptyEsco();

  const key = `${language}:${role.toLocaleLowerCase(language)}`;
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.value;

  try {
    const searchUrl = new URL(`${ESCO_API}/search`);
    searchUrl.searchParams.set('text', role);
    searchUrl.searchParams.set('language', language);
    searchUrl.searchParams.set('type', 'occupation');
    searchUrl.searchParams.set('limit', '1');
    searchUrl.searchParams.set('full', 'true');
    searchUrl.searchParams.set('selectedVersion', ESCO_VERSION);

    const search = await timedJson(searchUrl, fetchImpl);
    const result = firstEmbedded(search);
    if (!result) return emptyEsco();

    const uri = stringValue(result.uri);
    let occupation = result;
    if (uri) {
      const occupationUrl = new URL(`${ESCO_API}/resource/occupation`);
      occupationUrl.searchParams.set('uri', uri);
      occupationUrl.searchParams.set('language', language);
      occupationUrl.searchParams.set('selectedVersion', ESCO_VERSION);
      occupation = await timedJson(occupationUrl, fetchImpl);
    }

    const value: EscoContext = {
      used: true,
      occupation: preferredLabel(occupation, language) || preferredLabel(result, language) || role,
      skills: relatedSkillLabels(occupation).slice(0, 20),
    };

    cache.set(key, { expires: Date.now() + CACHE_TTL_MS, value });
    if (cache.size > 100) cache.delete(cache.keys().next().value ?? key);
    return value;
  } catch {
    return emptyEsco();
  }
}

async function timedJson(url: URL, fetchImpl: FetchLike) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);
  try {
    const response = await fetchImpl(url, {
      headers: { Accept: 'application/json', 'Accept-Language': url.searchParams.get('language') || 'fr' },
      signal: controller.signal,
      cache: 'force-cache',
      next: { revalidate: 86400 },
    });
    if (!response.ok) throw new Error('ESCO unavailable');
    return await response.json() as Record<string, unknown>;
  } finally {
    clearTimeout(timeout);
  }
}

function firstEmbedded(value: Record<string, unknown>) {
  const embedded = recordValue(value._embedded);
  const results = embedded && Array.isArray(embedded.results) ? embedded.results : [];
  return recordValue(results[0]);
}

function relatedSkillLabels(value: Record<string, unknown>) {
  const links = recordValue(value._links);
  if (!links) return [];
  const relations = ['hasEssentialSkill', 'hasOptionalSkill'];
  const labels: string[] = [];
  for (const relation of relations) {
    const entries = Array.isArray(links[relation]) ? links[relation] : [];
    for (const entry of entries) {
      const item = recordValue(entry);
      const label = item && (stringValue(item.title) || stringValue(item.label));
      if (label && !labels.includes(label)) labels.push(label);
    }
  }
  return labels;
}

function preferredLabel(value: Record<string, unknown>, language: string) {
  const label = value.preferredLabel;
  if (typeof label === 'string') return label;
  const labels = recordValue(label);
  return labels ? stringValue(labels[language]) || stringValue(Object.values(labels)[0]) : '';
}

function recordValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function emptyEsco(): EscoContext {
  return { used: false, occupation: null, skills: [] };
}
