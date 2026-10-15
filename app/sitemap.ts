import type { MetadataRoute } from 'next';
import { projects } from '@/content/projects';
import { routing } from '@/i18n/routing';
import { localisedPath, SITE_URL } from '@/lib/metadata';

/**
 * Every page in every locale, with hreflang alternates on each entry so a
 * crawler can see the four versions are the same page. Section 11.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['', 'security', ...projects.map((project) => `projects/${project.slug}`)];

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}${localisedPath(locale, path)}`,
      lastModified: new Date(),
      changeFrequency: path === '' ? ('weekly' as const) : ('monthly' as const),
      priority: path === '' ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((other) => [other, `${SITE_URL}${localisedPath(other, path)}`]),
        ),
      },
    })),
  );
}
