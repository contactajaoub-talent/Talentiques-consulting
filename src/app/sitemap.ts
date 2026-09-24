import type { MetadataRoute } from 'next';
import { SITE_URL, languageRoutes } from '@/lib/i18n';

export default function sitemap(): MetadataRoute.Sitemap {
  return languageRoutes
    .filter(([fr]) => fr !== '/outils/checkout' && fr !== '/outils/acces')
    .flatMap(([fr, en]) => [fr, en].map(path => ({
      url: SITE_URL + path,
      changeFrequency: 'monthly' as const,
      priority: path === '/' || path === '/en' ? 1 : path.includes('/tools') || path.includes('/outils') ? 0.9 : 0.6,
      alternates: { languages: { fr: SITE_URL + fr, en: SITE_URL + en, 'x-default': SITE_URL + fr } },
    })));
}
