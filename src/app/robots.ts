import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/crm', '/paiement-service', '/completer-dossier'] }, sitemap: 'https://talentiques.com/sitemap.xml' };
}
