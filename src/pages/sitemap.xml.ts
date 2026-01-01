import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function generateSitemapXml(urls: SitemapUrl[]): string {
  const urlEntries = urls
    .map((url) => {
      let entry = `  <url>\n    <loc>${escapeXml(url.loc)}</loc>`;
      if (url.lastmod) entry += `\n    <lastmod>${url.lastmod}</lastmod>`;
      if (url.changefreq) entry += `\n    <changefreq>${url.changefreq}</changefreq>`;
      if (url.priority !== undefined) entry += `\n    <priority>${url.priority.toFixed(1)}</priority>`;
      entry += '\n  </url>';
      return entry;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site?.toString().replace(/\/$/, '') || 'https://aging-engineer.pages.dev';

  const staticPages: SitemapUrl[] = [
    { loc: siteUrl, lastmod: formatDate(new Date()), changefreq: 'daily', priority: 1.0 },
    { loc: `${siteUrl}/tags`, lastmod: formatDate(new Date()), changefreq: 'weekly', priority: 0.7 },
    { loc: `${siteUrl}/search`, lastmod: formatDate(new Date()), changefreq: 'monthly', priority: 0.5 },
  ];

  const blogPosts = await getCollection('blog', ({ data }) => !data.draft);

  const blogUrls: SitemapUrl[] = blogPosts.map((post) => ({
    loc: `${siteUrl}/blog/${post.id}`,
    lastmod: formatDate(post.data.updatedDate || post.data.pubDate),
    changefreq: 'monthly' as const,
    priority: 0.8,
  }));

  const allTags = [...new Set(blogPosts.flatMap((post) => post.data.tags))];
  const tagUrls: SitemapUrl[] = allTags.map((tag) => ({
    loc: `${siteUrl}/tags/${encodeURIComponent(tag)}`,
    lastmod: formatDate(new Date()),
    changefreq: 'weekly' as const,
    priority: 0.6,
  }));

  const allUrls = [...staticPages, ...blogUrls, ...tagUrls];
  const sitemap = generateSitemapXml(allUrls);

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
