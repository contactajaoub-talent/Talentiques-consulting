import type { Metadata } from 'next';
import type { StoreMarket, StoreProductId } from './store/catalog';
export const SITE_URL = 'https://www.talentiques.com';
export const languageRoutes = [
  ['/', '/en'], ['/outils', '/en/tools'],
  ['/outils/opportunity-tracker', '/en/tools/opportunity-tracker'],
  ['/outils/cv-ats', '/en/tools/ats-resume'], ['/outils/bundle', '/en/tools/bundle'],
  ['/outils/checkout', '/en/tools/checkout'], ['/outils/acces', '/en/tools/access'],
  ['/ressources', '/en/resources'], ['/accompagnement', '/en/coaching'],
  ['/blog', '/en/blog'], ['/cv-diagnosis', '/en/resume-review'],
  ['/careers', '/en/careers'], ['/conditions-generales', '/en/terms'],
  ['/careers/commerciale-prospection-closing', '/en/careers/client-acquisition'],
  ['/politique-de-confidentialite', '/en/privacy'], ['/mentions-legales', '/en/legal'],
] as const;
export function equivalentPath(path: string, market: StoreMarket) {
  const pair = languageRoutes.find((routes) => routes.some((route) => route === path));
  return pair?.[market === 'fr' ? 0 : 1] ?? (market === 'fr' ? '/' : '/en');
}
export function storePath(market: StoreMarket, product?: StoreProductId) {
  const root = market === 'fr' ? '/outils' : '/en/tools';
  if (!product) return root;
  return `${root}/${product === 'tracker' ? 'opportunity-tracker' : product === 'ats' ? (market === 'fr' ? 'cv-ats' : 'ats-resume') : 'bundle'}`;
}
export function localizedMetadata(path: string, title: string, description: string): Metadata {
  const en = path === '/en' || path.startsWith('/en/');
  return { title: { absolute: title.includes('TalentiQues') ? title : `${title} | TalentiQues` }, description, alternates: { canonical: SITE_URL + path, languages: {
    fr: SITE_URL + equivalentPath(path, 'fr'), en: SITE_URL + equivalentPath(path, 'en'),
    'x-default': SITE_URL + equivalentPath(path, 'fr'),
  } }, openGraph: { title, description, url: SITE_URL + path, type: 'website', siteName: 'TalentiQues', locale: en ? 'en_US' : 'fr_FR', alternateLocale: en ? 'fr_FR' : 'en_US' } };
}
