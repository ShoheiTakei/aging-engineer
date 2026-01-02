/**
 * 検索インデックス生成ユーティリティ
 *
 * 関連要件:
 * - REQ-401: 記事検索機能（タイトル・本文から全文検索、部分一致）
 * - REQ-402: 検索結果を関連度順に表示
 * - NFR-001: Lighthouse 90+点維持（外部ライブラリ不使用）
 *
 * 関連文書:
 * - テストケース定義書: docs/implements/blog-article-management/TASK-0010/search-utils-testcases.md
 * - タスクノート: docs/implements/blog-article-management/TASK-0010/note.md
 * - データフロー: docs/design/blog-article-management/dataflow.md
 */

// ========================================
// 型定義
// ========================================

/**
 * 検索インデックスの1エントリ
 * @関連要件 REQ-401
 */
export interface SearchIndexItem {
  /** 記事のslug（一意識別子） */
  slug: string;
  /** 記事タイトル */
  title: string;
  /** 記事説明 */
  description: string;
  /** 本文（検索用に一部抜粋） */
  body: string;
  /** タグ配列 */
  tags: string[];
  /** 公開日（ISO 8601形式） */
  pubDate: string;
}

/**
 * マッチ箇所情報（ハイライト表示用）
 * @関連要件 REQ-401「検索結果をハイライト表示」
 */
export interface MatchInfo {
  /** マッチしたフィールド名 */
  field: 'title' | 'description' | 'body' | 'tags';
  /** マッチ位置の配列 [開始位置, 終了位置] */
  indices: [number, number][];
}

/**
 * 検索結果
 * @関連要件 REQ-402「関連度順に表示」
 */
export interface SearchResult {
  /** 検索にマッチしたアイテム */
  item: SearchIndexItem;
  /** 関連度スコア（高いほど関連度が高い） */
  score: number;
  /** マッチ箇所情報 */
  matches: MatchInfo[];
}

/**
 * ブログ記事の入力データ型
 */
interface BlogPostInput {
  slug: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    tags: string[];
  };
  body: string;
}

/**
 * generateSearchIndexのオプション
 */
interface GenerateSearchIndexOptions {
  /** 本文の最大文字数（デフォルト: 500） */
  bodyLength?: number;
}

// ========================================
// 定数定義
// ========================================

/** デフォルトの本文最大文字数 */
const DEFAULT_BODY_LENGTH = 500;

/** スコアリングの重み付け */
const SCORE_WEIGHTS = {
  title: 10, // タイトル一致は最も重要
  tags: 8, // タグ一致も重要
  description: 5, // 説明文一致
  body: 1, // 本文一致は低い重み
} as const;

// ========================================
// 公開関数
// ========================================

/**
 * ブログ記事から検索インデックスを生成する
 *
 * @param posts - ブログ記事の配列
 * @param options - オプション設定
 * @returns 検索インデックスの配列
 *
 * @example
 * const index = generateSearchIndex(posts, { bodyLength: 500 });
 *
 * @関連要件 REQ-401, REQ-402
 */
export function generateSearchIndex(
  posts: BlogPostInput[],
  options: GenerateSearchIndexOptions = {},
): SearchIndexItem[] {
  const { bodyLength = DEFAULT_BODY_LENGTH } = options;

  return posts.map((post) => ({
    slug: post.slug,
    title: post.data.title,
    description: post.data.description,
    body: truncateBody(post.body, bodyLength),
    tags: post.data.tags,
    pubDate: post.data.pubDate.toISOString(),
  }));
}

/**
 * 検索インデックスからクエリに一致する記事を検索する
 *
 * @param index - 検索インデックス
 * @param query - 検索クエリ
 * @returns 関連度順にソートされた検索結果
 *
 * @example
 * const results = searchArticles(index, 'Astro');
 *
 * @関連要件 REQ-401, REQ-402
 */
export function searchArticles(index: SearchIndexItem[], query: string): SearchResult[] {
  // 空のクエリやスペースのみの場合は空配列を返す
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

  // 空のインデックスの場合は空配列を返す
  if (index.length === 0) {
    return [];
  }

  // 検索クエリを小文字に変換（大文字小文字区別なし）
  const normalizedQuery = trimmedQuery.toLowerCase();

  const results: SearchResult[] = [];

  for (const item of index) {
    const matches: MatchInfo[] = [];
    let score = 0;

    // タイトルの検索
    const titleMatches = findMatches(item.title, normalizedQuery);
    if (titleMatches.length > 0) {
      score += SCORE_WEIGHTS.title * titleMatches.length;
      matches.push({ field: 'title', indices: titleMatches });
    }

    // タグの検索
    const tagMatches: [number, number][] = [];
    for (const tag of item.tags) {
      const tagMatch = findMatches(tag, normalizedQuery);
      if (tagMatch.length > 0) {
        tagMatches.push(...tagMatch);
        score += SCORE_WEIGHTS.tags;
      }
    }
    if (tagMatches.length > 0) {
      matches.push({ field: 'tags', indices: tagMatches });
    }

    // 説明の検索
    const descMatches = findMatches(item.description, normalizedQuery);
    if (descMatches.length > 0) {
      score += SCORE_WEIGHTS.description * descMatches.length;
      matches.push({ field: 'description', indices: descMatches });
    }

    // 本文の検索
    const bodyMatches = findMatches(item.body, normalizedQuery);
    if (bodyMatches.length > 0) {
      score += SCORE_WEIGHTS.body * bodyMatches.length;
      matches.push({ field: 'body', indices: bodyMatches });
    }

    // マッチがあれば結果に追加
    if (matches.length > 0) {
      results.push({ item, score, matches });
    }
  }

  // スコアの降順でソート
  results.sort((a, b) => b.score - a.score);

  return results;
}

// ========================================
// ヘルパー関数
// ========================================

/**
 * 本文を指定文字数で切り詰める
 *
 * @param body - 元の本文
 * @param maxLength - 最大文字数
 * @returns 切り詰められた本文
 */
function truncateBody(body: string, maxLength: number): string {
  if (body.length <= maxLength) {
    return body;
  }
  return body.slice(0, maxLength);
}

/**
 * テキスト内でクエリにマッチする位置を検索（重複なし）
 *
 * @param text - 検索対象テキスト
 * @param query - 検索クエリ（小文字化済みを想定）
 * @returns マッチ位置の配列 [開始位置, 終了位置][]
 *
 * @example
 * findMatches('hello world', 'o') // [[4, 5], [7, 8]]
 * findMatches('aaa', 'aa')        // [[0, 2]] ← 重複なし
 */
export function findMatches(text: string, query: string): [number, number][] {
  const normalizedText = text.toLowerCase();
  const matches: [number, number][] = [];
  let startIndex = 0;

  while (true) {
    const index = normalizedText.indexOf(query, startIndex);
    if (index === -1) {
      break;
    }
    matches.push([index, index + query.length]);
    startIndex = index + query.length; // 重複を防ぐためマッチ分だけ進める
  }

  return matches;
}
