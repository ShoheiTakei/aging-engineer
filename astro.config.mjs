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
    build: {
      // CSS最小化設定 (TASK-0025: パフォーマンス最適化)
      cssMinify: 'lightningcss',
      // JS最小化設定
      minify: 'esbuild',
      // ソースマップを無効化（本番ビルド）
      sourcemap: false,
      // チャンクサイズ警告の閾値を500kBに設定
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          // 最適なチャンク分割戦略
          manualChunks: (id) => {
            // node_modulesを別チャンクに分離
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
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
