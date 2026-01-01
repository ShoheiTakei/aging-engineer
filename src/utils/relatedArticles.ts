/**
 * 関連記事アルゴリズム ユーティリティ
 *
 * 関連要件:
 * - REQ-701: 記事詳細ページに関連記事リストを表示
 *   - タグが一致する記事を優先表示
 *   - 最大5件まで表示
 *   - 現在の記事を除外
 *
 * 関連文書:
 * - テストケース定義書: docs/implements/blog-article-management/TASK-0009/related-articles-testcases.md
 * - 要件定義書: docs/implements/blog-article-management/TASK-0009/related-articles-requirements.md
 */

// ========================================
// 定数定義
// ========================================

/**
 * デフォルトの最大表示件数
 * 🔵 信頼性: REQ-701より
 */
const DEFAULT_MAX_ITEMS = 5;

// ========================================
// 型定義
// ========================================

/**
 * ブログ記事のフロントマターデータ
 * 🔵 信頼性: Content Collections schemaより
 */
export type BlogFrontmatter = {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  coverImage?: string;
  tags: string[];
  draft: boolean;
};

/**
 * ブログ記事エントリ（Content Collections型）
 * 🔵 信頼性: Astro Content Collections APIより
 */
export type BlogPost = {
  id: string;
  slug: string;
  body: string;
  collection: 'blog';
  data: BlogFrontmatter;
};

/**
 * 関連記事スコア付きエントリ
 * 🔵 信頼性: REQ-701より
 */
export type RelatedPostEntry = {
  post: BlogPost;
  score: number;
  commonTags: string[];
};

/**
 * getRelatedPostsのオプション
 * 🔵 信頼性: REQ-701より
 */
export type GetRelatedPostsOptions = {
  maxItems?: number;
  includeDrafts?: boolean;
};

// ========================================
// ヘルパー関数
// ========================================

/**
 * 2つのタグ配列の共通タグを取得する
 *
 * @param tags1 - タグ配列1
 * @param tags2 - タグ配列2
 * @returns 共通タグの配列
 */
function getCommonTags(tags1: string[], tags2: string[]): string[] {
  const tagSet = new Set(tags1);
  return tags2.filter((tag) => tagSet.has(tag));
}

// ========================================
// 公開関数
// ========================================

/**
 * 関連記事を取得する
 *
 * アルゴリズム:
 * 1. 現在の記事を除外
 * 2. 下書き記事を除外（includeDrafts=falseの場合）
 * 3. 各記事との共通タグ数を計算
 * 4. 共通タグ数が0の記事を除外
 * 5. 共通タグ数（降順）でソート
 * 6. 同点の場合は公開日（降順）でソート
 * 7. 最大件数で切り取り
 *
 * @param currentPost - 現在表示中の記事
 * @param allPosts - 全記事のリスト
 * @param options - オプション
 * @returns 関連記事のリスト（スコア順）
 *
 * @example
 * const related = getRelatedPosts(currentPost, allPosts, { maxItems: 3 });
 *
 * @関連要件 REQ-701
 */
export function getRelatedPosts(
  currentPost: BlogPost,
  allPosts: BlogPost[],
  options?: GetRelatedPostsOptions,
): RelatedPostEntry[] {
  // 【オプションのデフォルト値設定】
  const maxItems = options?.maxItems ?? DEFAULT_MAX_ITEMS;
  const includeDrafts = options?.includeDrafts ?? false;

  // 【早期リターン: maxItemsが0以下の場合】
  if (maxItems <= 0) {
    return [];
  }

  // 【早期リターン: 現在の記事にタグがない場合】
  const currentTags = currentPost.data.tags;
  if (currentTags.length === 0) {
    return [];
  }

  // 【記事のフィルタリングとスコア計算】
  const relatedEntries: RelatedPostEntry[] = [];

  for (const post of allPosts) {
    // 現在の記事を除外
    if (post.slug === currentPost.slug) {
      continue;
    }

    // 下書き記事を除外（includeDrafts=falseの場合）
    if (!includeDrafts && post.data.draft) {
      continue;
    }

    // 共通タグを計算
    const commonTags = getCommonTags(currentTags, post.data.tags);

    // 共通タグがない場合はスキップ
    if (commonTags.length === 0) {
      continue;
    }

    // スコア付きエントリを追加
    relatedEntries.push({
      post,
      score: commonTags.length,
      commonTags,
    });
  }

  // 【ソート: スコア降順、同点は公開日降順】
  relatedEntries.sort((a, b) => {
    // スコアで降順ソート
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // 同点の場合は公開日で降順ソート
    return b.post.data.pubDate.getTime() - a.post.data.pubDate.getTime();
  });

  // 【最大件数で切り取り】
  return relatedEntries.slice(0, maxItems);
}
