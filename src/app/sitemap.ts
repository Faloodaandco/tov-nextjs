import { MetadataRoute } from 'next';
import { getMenuItems } from '@/services/menuService';
import { slugify } from '@/utils/slugify';

const BASE_URL = 'https://tasteofvillagerestaurants.co.uk';
const TODAY = new Date().toISOString().split('T')[0];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  /* ── Core pages ── */
  entries.push(
    { url: `${BASE_URL}/`, lastModified: TODAY, changeFrequency: 'daily', priority: 1.0 },

    // Slough
    { url: `${BASE_URL}/slough`, lastModified: TODAY, changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/slough/menu`, lastModified: TODAY, changeFrequency: 'daily', priority: 0.9 },

    // Hayes
    { url: `${BASE_URL}/hayes`, lastModified: TODAY, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/hayes/menu`, lastModified: TODAY, changeFrequency: 'daily', priority: 0.9 },
  );

  /* ── Slough local SEO pages ── */
  const sloughSeoPages = [
    'slough-breakfast', 'slough-delivery', 'slough-halal-food',
    'slough-street-food', 'slough-desserts',
  ];
  sloughSeoPages.forEach((slug) => {
    entries.push({ url: `${BASE_URL}/${slug}`, lastModified: TODAY, changeFrequency: 'weekly', priority: 0.85 });
  });

  /* ── Berkshire regional pages ── */
  const regionalPages = [
    'burnham-takeaway', 'langley-sweets', 'windsor-desserts',
    'maidenhead-street-food', 'reading-desserts', 'high-wycombe-taste-of-village',
  ];
  regionalPages.forEach((slug) => {
    entries.push({ url: `${BASE_URL}/${slug}`, lastModified: TODAY, changeFrequency: 'weekly', priority: 0.75 });
  });

  /* ── Hayes local SEO pages ── */
  const hayesSeoPages = [
    'hayes-breakfast', 'hayes-delivery', 'hayes-halal-food',
    'uxbridge-taste-of-village',
  ];
  hayesSeoPages.forEach((slug) => {
    entries.push({ url: `${BASE_URL}/${slug}`, lastModified: TODAY, changeFrequency: 'weekly', priority: 0.8 });
  });

  /* ── Core service pages ── */
  entries.push(
    { url: `${BASE_URL}/book`, lastModified: TODAY, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/review`, lastModified: TODAY, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/rewards`, lastModified: TODAY, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/info`, lastModified: TODAY, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/franchise`, lastModified: TODAY, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/privacy`, lastModified: TODAY, changeFrequency: 'yearly', priority: 0.3 },
  );

  /* ── Individual dish pages (auto-generated from menu JSON) ── */
  (['hayes', 'slough'] as const).forEach((loc) => {
    const menu = getMenuItems(loc);
    menu.forEach((item) => {
      if (item.showOnWebsite !== false && !item.is86d) {
        entries.push({
          url: `${BASE_URL}/${loc}/menu/${slugify(item.name)}`,
          lastModified: TODAY,
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    });
  });

  return entries;
}
