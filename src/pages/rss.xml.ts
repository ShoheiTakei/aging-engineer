/**
 * RSS Feed エンドポイント
 *
 * ブログ記事のRSSフィードを生成します。
 *
 * 要件:
 * - REQ-401: RSS Feed生成機能
 * - 公開済み記事のみを含む（draft: false）
 * - 日付順（新しい順）でソート
 *
 * 信頼性: 🔵 @astrojs/rss公式パッケージを使用
 */

import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  // 公開済みブログ記事を取得
  const blogPosts = await getCollection('blog', ({ data }) => !data.draft);

  // 日付順（新しい順）でソート
  const sortedPosts = blogPosts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    // フィードのメタ情報
    title: 'aging-engineer',
    description: 'エイジングエンジニアの技術ブログ',
    site: context.site?.toString() ?? 'https://aging-engineer.pages.dev',

    // 記事アイテム
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
      // カテゴリ（タグ）
      categories: post.data.tags,
    })),

    // カスタムXMLオプション
    customData: '<language>ja</language>',
  });
}
