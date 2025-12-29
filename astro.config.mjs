import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com', // TODO: 本番サイトURLに変更
  integrations: [
    tailwind({
      applyBaseStyles: false, // global.cssで管理
    }),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
