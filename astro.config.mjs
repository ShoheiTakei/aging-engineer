import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://aging-engineer.com',

  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },

  // 画像最適化設定 (TASK-0022: 画像最適化)
  image: {
    // WebP/AVIF形式の自動変換を有効化
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        // 品質設定（最適なバランス）
        quality: 80,
        // AVIF形式の品質（より高圧縮向け）
        avifOptions: {
          quality: 75,
        },
        // WebP形式の品質
        webpOptions: {
          quality: 80,
        },
      },
    },
    // リモート画像の許可ドメイン（R2統合用）
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
});
