import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/metadata';

/** Section 11. The styleguide is development-only and 404s in production anyway. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/styleguide'] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
