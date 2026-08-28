import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://example.com',
  output: 'server',
  adapter: vercel(),
  integrations: [mdx(), react(), sitemap()],
  image: {
    responsiveStyles: true,
  },
  vite: {
    server: {
      host: true,
    },
  },
});
