import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export const prerender = true;

const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (character) => ({
  '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
})[character] ?? character);

export const GET: APIRoute = async ({ site }) => {
  const base = site ?? new URL('https://example.com');
  const entries = (await getCollection('writing', ({ data }) => !data.draft && data.status === 'published'))
    .sort((a, b) => b.data.year - a.data.year || a.data.order - b.data.order);
  const items = entries.map((entry) => `
    <item>
      <title>${escapeXml(entry.data.title)}</title>
      <link>${new URL(`/writing/${entry.data.slug}`, base).href}</link>
      <guid>${new URL(`/writing/${entry.data.slug}`, base).href}</guid>
      <description>${escapeXml(entry.data.summary)}</description>
    </item>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0"><channel>
    <title>aadrika's archive</title>
    <link>${base.href}</link>
    <description>Writing and field notes from Aadrika Maurya.</description>${items}
  </channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
