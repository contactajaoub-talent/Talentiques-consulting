import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/i18n';

export default function robots(): MetadataRoute.Robots {
  // Private pages also emit noindex; keep them crawlable so that directive is seen.
  return { rules: { userAgent: '*', allow: '/', disallow: ['/api/'] }, sitemap: `${SITE_URL}/sitemap.xml` };
}
