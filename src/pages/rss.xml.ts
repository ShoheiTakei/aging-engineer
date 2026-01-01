/**
 * RSS Feed エンドポイント
 * REQ-601: RSS Feed生成
 *
 * @astrojs/rssパッケージを使用してRSS 2.0フィードを生成
 * /rss.xml でアクセス可能
 *
 * @module pages/rss.xml
 */

import { getCollection } from 'astro:content';
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE_CONFIG, buildRssItem, filterPublishedPosts, sortPostsByDate } from '../utils/rss';

/**
 * RSS Feedを生成するAPIハンドラ
 *
 * @param context - Astro APIコンテキスト
 * @returns RSS XMLレスポンス
 */
export async function GET(context: APIContext) {
  // Content Collectionsからブログ記事を取得
  const allPosts = await getCollection('blog');

  // 下書きを除外し、公開日でソート
  const publishedPosts = filterPublishedPosts(allPosts);
  const sortedPosts = sortPostsByDate(publishedPosts);

  // RSS Feedを生成
  return rss({
    // RSS 2.0の必須フィールド
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    site: context.site ?? SITE_CONFIG.site,

    // 各記事をRSSアイテムに変換
    items: sortedPosts.map(buildRssItem),

    // カスタムXML要素（言語設定）
    customData: '<language>ja</language>',

    // スタイルシート（オプション、ブラウザでの表示を改善）
    stylesheet: '/rss/styles.xsl',
  });
}
