/**
 * RSS Feed生成ユーティリティ
 * REQ-601: RSS Feed生成
 *
 * @module utils/rss
 */

/**
 * ブログ記事のフロントマターデータ
 */
export interface BlogPostData {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate: Date;
  coverImage: string;
  tags: string[];
  draft: boolean;
}

/**
 * ブログ記事エントリ
 * Content Collectionsの記事エントリ型と互換性を持つ
 */
export interface BlogEntry {
  id: string;
  data: BlogPostData;
}

/**
 * RSSアイテムの型定義
 */
export interface RssItem {
  title: string;
  description: string;
  pubDate: Date;
  link: string;
}

/**
 * サイト設定
 * RSS Feedおよびサイト全体で使用する設定
 */
export const SITE_CONFIG = {
  title: 'エイジングエンジニア',
  description:
    '経験豊富なエンジニアによる技術ブログ。TypeScript、Astro、フロントエンド開発についての記事を掲載しています。',
  site: 'https://aging-engineer.pages.dev',
} as const;

/**
 * 下書き記事を除外し、公開記事のみをフィルタリングする
 *
 * @param posts - ブログ記事の配列
 * @returns 下書きを除外した公開記事の配列
 *
 * @example
 * ```ts
 * const allPosts = await getCollection('blog');
 * const publishedPosts = filterPublishedPosts(allPosts);
 * ```
 */
export function filterPublishedPosts(posts: BlogEntry[]): BlogEntry[] {
  return posts.filter((post) => !post.data.draft);
}

/**
 * 記事を公開日の新しい順にソートする
 *
 * @param posts - ブログ記事の配列
 * @returns 公開日降順でソートされた記事の配列
 *
 * @example
 * ```ts
 * const sortedPosts = sortPostsByDate(publishedPosts);
 * ```
 */
export function sortPostsByDate(posts: BlogEntry[]): BlogEntry[] {
  return [...posts].sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/**
 * ブログ記事からRSSアイテムを構築する
 *
 * @param post - ブログ記事エントリ
 * @returns RSSフィードで使用するアイテムオブジェクト
 *
 * @example
 * ```ts
 * const rssItem = buildRssItem(post);
 * // { title: '記事タイトル', description: '...', pubDate: Date, link: '/blog/slug/' }
 * ```
 */
export function buildRssItem(post: BlogEntry): RssItem {
  return {
    title: post.data.title,
    description: post.data.description,
    pubDate: post.data.pubDate,
    link: `/blog/${post.id}/`,
  };
}
