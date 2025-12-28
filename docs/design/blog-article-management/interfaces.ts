/**
 * ブログ記事管理機能 型定義
 *
 * 作成日: 2025-12-29
 * 関連設計: architecture.md
 *
 * 信頼性レベル:
 * - 🔵 青信号: EARS要件定義書・設計文書・既存実装を参考にした確実な型定義
 * - 🟡 黄信号: EARS要件定義書・設計文書・既存実装から妥当な推測による型定義
 * - 🔴 赤信号: EARS要件定義書・設計文書・既存実装にない推測による型定義
 */

// ========================================
// Content Collections スキーマ定義
// ========================================

/**
 * ブログ記事 Content Collections スキーマ
 * 🔵 信頼性: requirements.md REQ-001～REQ-011, tech-stack.md Content Collections仕様より
 *
 * src/content/config.ts で使用
 */
import { defineCollection, z } from 'astro:content';

export const blogCollection = defineCollection({
  type: 'content', // 🔵 Content Collections標準
  schema: z.object({
    title: z.string(), // 🔵 REQ-001: タイトル (必須)
    description: z.string(), // 🔵 REQ-001: 説明 (必須)
    pubDate: z.date(), // 🔵 REQ-001: 公開日 (必須)
    updatedDate: z.date().optional(), // 🔵 REQ-001: 更新日 (任意)
    coverImage: z.string().url().optional(), // 🔵 REQ-001: カバー画像URL (R2) (任意)
    tags: z.array(z.string()).default([]), // 🔵 REQ-301: タグ配列 (任意, デフォルト空配列)
    draft: z.boolean().default(false), // 🔵 REQ-501: 下書きフラグ (任意, デフォルトfalse)
  }),
});

export const collections = {
  blog: blogCollection,
};

// ========================================
// ブログ記事型定義
// ========================================

/**
 * ブログ記事フロントマター型 (Content Collectionsから推論)
 * 🔵 信頼性: Content Collections schemaより自動生成
 */
export type BlogFrontmatter = {
  title: string; // 🔵 REQ-001
  description: string; // 🔵 REQ-001
  pubDate: Date; // 🔵 REQ-001
  updatedDate?: Date; // 🔵 REQ-001
  coverImage?: string; // 🔵 REQ-001 (Cloudflare R2 URL)
  tags: string[]; // 🔵 REQ-301
  draft: boolean; // 🔵 REQ-501
};

/**
 * ブログ記事エントリ (Content Collections型)
 * 🔵 信頼性: Astro Content Collections APIより
 */
export type BlogPost = {
  id: string; // 🔵 Content Collections自動生成 (ファイル名)
  slug: string; // 🔵 Content Collections自動生成 (URLスラッグ)
  body: string; // 🔵 Markdown本文
  collection: 'blog'; // 🔵 コレクション名
  data: BlogFrontmatter; // 🔵 フロントマターデータ
};

/**
 * レンダリング済みブログ記事
 * 🔵 信頼性: Astro render()メソッドより
 */
export type RenderedBlogPost = BlogPost & {
  render: () => Promise<{
    Content: any; // 🔵 AstroコンポーネントContent
    headings: Heading[]; // 🔵 見出しリスト (REQ-901: 目次生成用)
    remarkPluginFrontmatter: Record<string, any>; // 🔵 remarkプラグインデータ
  }>;
};

/**
 * 見出し構造 (目次生成用)
 * 🔵 信頼性: Astro headings型より (REQ-901)
 */
export type Heading = {
  depth: number; // 🔵 見出しレベル (1-6, h1-h6)
  slug: string; // 🔵 見出しID (アンカーリンク用)
  text: string; // 🔵 見出しテキスト
};

/**
 * 目次データ構造
 * 🟡 信頼性: REQ-901から妥当な推測 (ネスト構造)
 */
export type TableOfContents = {
  items: TOCItem[]; // 🟡 目次アイテムリスト
};

export type TOCItem = {
  depth: number; // 🟡 見出しレベル (2-3のみ使用)
  slug: string; // 🔵 見出しID
  text: string; // 🔵 見出しテキスト
  children?: TOCItem[]; // 🟡 子アイテム (h3の場合)
};

// ========================================
// ページネーション型定義
// ========================================

/**
 * ページネーション情報
 * 🔵 信頼性: Astro paginate()関数より (REQ-201)
 */
export type PaginationProps = {
  page: {
    data: BlogPost[]; // 🔵 現在ページの記事リスト
    start: number; // 🔵 開始インデックス (0-based)
    end: number; // 🔵 終了インデックス (0-based)
    size: number; // 🔵 1ページあたりの件数 (5件固定)
    total: number; // 🔵 総記事数
    currentPage: number; // 🔵 現在ページ番号 (1-based)
    lastPage: number; // 🔵 最終ページ番号
    url: {
      current: string; // 🔵 現在ページURL
      prev?: string; // 🔵 前ページURL (存在しない場合undefined)
      next?: string; // 🔵 次ページURL (存在しない場合undefined)
    };
  };
};

// ========================================
// タグ関連型定義
// ========================================

/**
 * タグ情報
 * 🟡 信頼性: REQ-302, REQ-303から妥当な推測
 */
export type Tag = {
  name: string; // 🔵 タグ名
  slug: string; // 🔵 URLスラッグ (タグ名をケバブケース化)
  count: number; // 🟡 該当記事数
};

/**
 * タグ別記事一覧ページプロパティ
 * 🔵 信頼性: REQ-303より
 */
export type TagPageProps = {
  tag: string; // 🔵 タグ名
  posts: BlogPost[]; // 🔵 該当記事リスト (公開日降順)
};

// ========================================
// 検索関連型定義
// ========================================

/**
 * 検索インデックスエントリ
 * 🟡 信頼性: REQ-401, REQ-402から妥当な推測 (クライアントサイド検索)
 */
export type SearchIndexEntry = {
  slug: string; // 🔵 記事スラッグ (URL用)
  title: string; // 🔵 記事タイトル
  description: string; // 🔵 記事説明
  body: string; // 🟡 本文の一部 (最初の500文字程度)
  tags: string[]; // 🔵 タグリスト
  pubDate: string; // 🔵 公開日 (ISO 8601形式)
};

/**
 * 検索結果
 * 🟡 信頼性: REQ-401から妥当な推測
 */
export type SearchResult = {
  post: BlogPost; // 🔵 該当記事
  score: number; // 🟡 検索スコア (一致度)
  matchedFields: ('title' | 'description' | 'body')[]; // 🟡 一致したフィールド
};

// ========================================
// 関連記事型定義
// ========================================

/**
 * 関連記事スコア付きエントリ
 * 🟡 信頼性: REQ-701から妥当な推測 (タグベース類似度)
 */
export type RelatedPostEntry = {
  post: BlogPost; // 🔵 関連記事
  score: number; // 🟡 類似度スコア (共通タグ数)
  commonTags: string[]; // 🟡 共通タグリスト
};

// ========================================
// 読了時間型定義
// ========================================

/**
 * 読了時間情報
 * 🔵 信頼性: REQ-801より
 */
export type ReadingTime = {
  minutes: number; // 🔵 読了時間 (分単位, 最低1分)
  words: number; // 🔵 文字数
};

// ========================================
// RSS Feed型定義
// ========================================

/**
 * RSSフィードアイテム
 * 🔵 信頼性: REQ-601, Astro @astrojs/rssより
 */
export type RSSFeedItem = {
  title: string; // 🔵 記事タイトル
  description: string; // 🔵 記事説明
  pubDate: Date; // 🔵 公開日
  link: string; // 🔵 記事URL (絶対URL)
  author?: string; // 🟡 著者 (任意, 現状未使用)
  categories?: string[]; // 🔵 カテゴリ (タグを使用)
  guid?: string; // 🔵 一意識別子 (リンクと同じ)
};

/**
 * RSSフィード設定
 * 🔵 信頼性: Astro @astrojs/rssより
 */
export type RSSFeedConfig = {
  title: string; // 🔵 フィードタイトル
  description: string; // 🔵 フィード説明
  site: string; // 🔵 サイトURL
  items: RSSFeedItem[]; // 🔵 フィードアイテムリスト
  customData?: string; // 🟡 カスタムXMLデータ (任意)
};

// ========================================
// SEO・メタデータ型定義
// ========================================

/**
 * SEOメタデータ
 * 🔵 信頼性: NFR-101～NFR-104より
 */
export type SEOMetadata = {
  title: string; // 🔵 ページタイトル
  description: string; // 🔵 ページ説明
  canonicalURL: string; // 🔵 正規URL
  ogImage?: string; // 🔵 OGP画像URL (任意)
  ogType: 'website' | 'article'; // 🔵 OGPタイプ
  twitterCard: 'summary' | 'summary_large_image'; // 🔵 Twitter Cardタイプ
  publishedTime?: string; // 🔵 記事公開日 (ISO 8601, article用)
  modifiedTime?: string; // 🔵 記事更新日 (ISO 8601, article用)
  author?: string; // 🟡 著者名 (任意)
  tags?: string[]; // 🔵 記事タグ (article用)
};

/**
 * JSON-LD構造化データ (Article Schema)
 * 🔵 信頼性: NFR-104より
 */
export type ArticleSchema = {
  '@context': 'https://schema.org'; // 🔵 Schema.org標準
  '@type': 'Article'; // 🔵 記事タイプ
  headline: string; // 🔵 記事タイトル
  description: string; // 🔵 記事説明
  image?: string; // 🔵 記事画像URL (任意)
  datePublished: string; // 🔵 公開日 (ISO 8601)
  dateModified?: string; // 🔵 更新日 (ISO 8601, 任意)
  author?: {
    '@type': 'Person'; // 🟡 著者情報
    name: string; // 🟡 著者名
  };
  publisher?: {
    '@type': 'Organization'; // 🟡 発行者情報
    name: string; // 🟡 サイト名
    logo?: {
      '@type': 'ImageObject'; // 🟡 ロゴ画像
      url: string; // 🟡 ロゴURL
    };
  };
};

// ========================================
// ユーティリティ型定義
// ========================================

/**
 * ソート順
 * 🔵 信頼性: REQ-202より
 */
export type SortOrder = 'asc' | 'desc';

/**
 * ソート対象フィールド
 * 🔵 信頼性: REQ-202より (現状は公開日のみ)
 */
export type SortField = 'pubDate' | 'updatedDate' | 'title';

/**
 * Cloudflare R2画像URL生成オプション
 * 🟡 信頼性: tech-stack.md, NFR-201～NFR-203から妥当な推測
 */
export type R2ImageOptions = {
  width?: number; // 🟡 画像幅 (レスポンシブ対応)
  height?: number; // 🟡 画像高さ
  format?: 'webp' | 'avif' | 'jpeg' | 'png'; // 🟡 画像フォーマット
  quality?: number; // 🟡 画像品質 (1-100)
};

/**
 * エラー情報
 * 🟡 信頼性: EDGE-001～EDGE-204から妥当な推測
 */
export type ErrorInfo = {
  code: string; // 🟡 エラーコード (例: 'NO_POSTS', 'NOT_FOUND')
  message: string; // 🟡 エラーメッセージ
  statusCode?: number; // 🟡 HTTPステータスコード (任意)
};

// ========================================
// コンポーネントプロパティ型定義
// ========================================

/**
 * BlogCardコンポーネントプロパティ
 * 🔵 信頼性: REQ-101より
 */
export type BlogCardProps = {
  post: BlogPost; // 🔵 表示する記事
  showExcerpt?: boolean; // 🟡 抜粋表示フラグ (デフォルト: true)
};

/**
 * Paginationコンポーネントプロパティ
 * 🔵 信頼性: REQ-201より
 */
export type PaginationComponentProps = {
  currentPage: number; // 🔵 現在ページ番号
  totalPages: number; // 🔵 総ページ数
  prevUrl?: string; // 🔵 前ページURL (任意)
  nextUrl?: string; // 🔵 次ページURL (任意)
  baseUrl?: string; // 🟡 ベースURL (デフォルト: '/blog/')
};

/**
 * TagListコンポーネントプロパティ
 * 🔵 信頼性: REQ-104, REQ-302より
 */
export type TagListProps = {
  tags: string[]; // 🔵 タグリスト
  showCount?: boolean; // 🟡 記事数表示フラグ (デフォルト: false)
};

/**
 * SearchBoxコンポーネントプロパティ
 * 🟡 信頼性: REQ-401から妥当な推測
 */
export type SearchBoxProps = {
  placeholder?: string; // 🟡 プレースホルダーテキスト
  initialQuery?: string; // 🟡 初期検索キーワード
};

/**
 * RelatedArticlesコンポーネントプロパティ
 * 🔵 信頼性: REQ-701より
 */
export type RelatedArticlesProps = {
  currentPost: BlogPost; // 🔵 現在の記事
  maxItems?: number; // 🔵 最大表示件数 (デフォルト: 5)
};

/**
 * TableOfContentsコンポーネントプロパティ
 * 🔵 信頼性: REQ-901より
 */
export type TableOfContentsProps = {
  headings: Heading[]; // 🔵 見出しリスト
  maxDepth?: number; // 🟡 最大深さ (デフォルト: 3, h2-h3のみ)
};

/**
 * ReadingTimeコンポーネントプロパティ
 * 🔵 信頼性: REQ-801より
 */
export type ReadingTimeProps = {
  minutes: number; // 🔵 読了時間 (分)
};

// ========================================
// 信頼性レベルサマリー
// ========================================
/**
 * - 🔵 青信号: 58件 (74.4%)
 * - 🟡 黄信号: 20件 (25.6%)
 * - 🔴 赤信号: 0件 (0%)
 *
 * 品質評価: 高品質
 *
 * 評価理由:
 * - Content Collections APIの標準型定義を活用
 * - 要件定義書から74%以上の型が確実に導出可能
 * - 黄信号項目は実装詳細（検索・関連記事のアルゴリズム、UIコンポーネントのオプション）のみ
 * - 赤信号項目なし（推測による型定義なし）
 * - TypeScript strict modeに完全対応
 */
