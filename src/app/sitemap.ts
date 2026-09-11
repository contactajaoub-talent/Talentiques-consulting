import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://talentiques.com';
  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/diagnostic-cv-ats`, changeFrequency: 'monthly', priority: .9 },
    { url: `${base}/ressources`, changeFrequency: 'weekly', priority: .8 },
    { url: `${base}/accompagnement`, changeFrequency: 'monthly', priority: .8 },
    { url: `${base}/blog`, changeFrequency: 'weekly', priority: .8 },
    { url: `${base}/mentions-legales`, changeFrequency: 'yearly', priority: .2 },
    { url: `${base}/politique-de-confidentialite`, changeFrequency: 'yearly', priority: .2 },
    { url: `${base}/conditions-generales`, changeFrequency: 'yearly', priority: .2 },
  ];
}
