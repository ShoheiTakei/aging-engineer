/**
 * 検索ページのクライアントサイドロジック
 *
 * 実装方針:
 * - ビルド時に生成された検索インデックス（/search-index.json）を使用
 * - デバウンス処理で入力中の過剰な検索を防止
 * - URLのクエリパラメータと連携してブックマーク可能に
 *
 * 関連要件:
 * - REQ-401: 記事検索機能（タイトル・本文から全文検索、部分一致）
 * - REQ-402: 検索結果を関連度順に表示
 * - NFR-001: Lighthouse 90+点維持（外部ライブラリ不使用）
 */

import {
  type MatchInfo,
  type SearchIndexItem,
  type SearchResult,
  findMatches,
} from '../utils/search';

// ========================================
// 型定義
// ========================================

/**
 * 検索ページに必要なDOM要素
 */
interface SearchPageElements {
  searchInput: HTMLInputElement;
  initialMessage: HTMLElement;
  loadingMessage: HTMLElement;
  noResultsMessage: HTMLElement;
  resultsList: HTMLElement;
  resultsCount: HTMLElement;
}

// ========================================
// 定数
// ========================================

/** スコアリングの重み付け */
const SCORE_WEIGHTS = {
  title: 10,
  tags: 8,
  description: 5,
  body: 1,
} as const;

/** デバウンス待機時間（ミリ秒） */
const DEBOUNCE_WAIT = 300;

// ========================================
// モジュールスコープ変数
// ========================================

/** 検索インデックスのキャッシュ */
let searchIndexCache: SearchIndexItem[] | null = null;

// ========================================
// DOM操作
// ========================================

/**
 * 検索ページに必要なDOM要素を取得・検証する
 *
 * @returns 検証済みのDOM要素
 * @throws DOM要素が見つからない場合
 */
function getElements(): SearchPageElements {
  const searchInputEl = document.getElementById('search-input');
  const initialMessageEl = document.getElementById('initial-message');
  const loadingMessageEl = document.getElementById('loading-message');
  const noResultsMessageEl = document.getElementById('no-results-message');
  const resultsListEl = document.getElementById('results-list');
  const resultsCountEl = document.getElementById('results-count');

  if (
    !searchInputEl ||
    !initialMessageEl ||
    !loadingMessageEl ||
    !noResultsMessageEl ||
    !resultsListEl ||
    !resultsCountEl
  ) {
    throw new Error('検索ページの初期化に失敗しました：必要なDOM要素が見つかりません');
  }

  return {
    searchInput: searchInputEl as HTMLInputElement,
    initialMessage: initialMessageEl,
    loadingMessage: loadingMessageEl,
    noResultsMessage: noResultsMessageEl,
    resultsList: resultsListEl,
    resultsCount: resultsCountEl,
  };
}

// ========================================
// データ取得
// ========================================

/**
 * 検索インデックスを読み込む（キャッシュ付き）
 *
 * @returns 検索インデックス
 * @throws 読み込みに失敗した場合
 */
async function loadSearchIndex(): Promise<SearchIndexItem[]> {
  if (searchIndexCache) {
    return searchIndexCache;
  }

  const response = await fetch('/search-index.json');
  if (!response.ok) {
    throw new Error(`検索インデックスの読み込みに失敗しました: HTTP ${response.status}`);
  }

  const data: unknown = await response.json();
  searchIndexCache = data as SearchIndexItem[];
  return searchIndexCache;
}

// ========================================
// 検索ロジック
// ========================================

/**
 * 検索インデックスからクエリに一致する記事を検索する
 *
 * @param index - 検索インデックス
 * @param query - 検索クエリ
 * @returns 関連度順にソートされた検索結果
 */
function searchArticles(index: SearchIndexItem[], query: string): SearchResult[] {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return [];
  }

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

    if (matches.length > 0) {
      results.push({ item, score, matches });
    }
  }

  // スコアの降順でソート
  results.sort((a, b) => b.score - a.score);

  return results;
}

// ========================================
// 表示ユーティリティ
// ========================================

/**
 * テキストをHTMLエスケープする
 *
 * @param text - エスケープ対象のテキスト
 * @returns エスケープ済みテキスト
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * マッチ箇所をハイライト表示する
 *
 * @param text - 対象テキスト
 * @param indices - マッチ位置の配列
 * @returns ハイライト済みHTML文字列
 */
function highlightText(text: string, indices: [number, number][]): string {
  if (indices.length === 0) {
    return escapeHtml(text);
  }

  // インデックスを開始位置でソート
  const sortedIndices = [...indices].sort((a, b) => a[0] - b[0]);

  let result = '';
  let lastIndex = 0;

  for (const [start, end] of sortedIndices) {
    // マッチ前のテキスト
    result += escapeHtml(text.slice(lastIndex, start));
    // マッチしたテキスト（ハイライト）
    result += `<mark class="bg-yellow-200 dark:bg-yellow-700 text-gray-900 dark:text-gray-100 px-0.5 rounded">${escapeHtml(text.slice(start, end))}</mark>`;
    lastIndex = end;
  }

  // 残りのテキスト
  result += escapeHtml(text.slice(lastIndex));

  return result;
}

/**
 * 日付をフォーマットする
 *
 * @param dateString - ISO 8601形式の日付文字列
 * @returns 日本語フォーマットの日付
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// ========================================
// UI状態管理
// ========================================

/**
 * 初期状態を表示する
 */
function showInitial(elements: SearchPageElements): void {
  elements.initialMessage.classList.remove('hidden');
  elements.loadingMessage.classList.add('hidden');
  elements.noResultsMessage.classList.add('hidden');
  elements.resultsList.classList.add('hidden');
  elements.resultsCount.classList.add('hidden');
}

/**
 * ローディング状態を表示する
 */
function showLoading(elements: SearchPageElements): void {
  elements.initialMessage.classList.add('hidden');
  elements.loadingMessage.classList.remove('hidden');
  elements.noResultsMessage.classList.add('hidden');
  elements.resultsList.classList.add('hidden');
  elements.resultsCount.classList.add('hidden');
}

/**
 * 検索結果を表示する
 */
function displayResults(results: SearchResult[], elements: SearchPageElements): void {
  // すべてのメッセージを非表示
  elements.initialMessage.classList.add('hidden');
  elements.loadingMessage.classList.add('hidden');
  elements.noResultsMessage.classList.add('hidden');
  elements.resultsList.classList.add('hidden');
  elements.resultsCount.classList.add('hidden');

  if (results.length === 0) {
    elements.noResultsMessage.classList.remove('hidden');
    return;
  }

  // 検索結果数を表示
  elements.resultsCount.textContent = `${results.length}件の記事が見つかりました`;
  elements.resultsCount.classList.remove('hidden');

  // 検索結果リストを構築
  elements.resultsList.innerHTML = results
    .map((result) => {
      const { item, matches } = result;

      // タイトルのハイライト
      const titleMatch = matches.find((m) => m.field === 'title');
      const highlightedTitle = titleMatch
        ? highlightText(item.title, titleMatch.indices)
        : escapeHtml(item.title);

      // 説明のハイライト
      const descMatch = matches.find((m) => m.field === 'description');
      const highlightedDesc = descMatch
        ? highlightText(item.description, descMatch.indices)
        : escapeHtml(item.description);

      // タグのHTML
      const tagsHtml =
        item.tags.length > 0
          ? `<div class="flex flex-wrap gap-2 mt-3">
            ${item.tags
              .map(
                (tag) =>
                  `<a href="/tags/${encodeURIComponent(tag)}" class="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300 no-underline">#${escapeHtml(tag)}</a>`,
              )
              .join('')}
          </div>`
          : '';

      return `
        <li>
          <article class="card p-6">
            <a href="/blog/${item.slug}" class="block group no-underline">
              <h2 class="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                ${highlightedTitle}
              </h2>
              <p class="text-gray-600 dark:text-gray-400 mb-2">
                ${highlightedDesc}
              </p>
              <time datetime="${item.pubDate}" class="text-sm text-gray-500 dark:text-gray-400">
                ${formatDate(item.pubDate)}
              </time>
            </a>
            ${tagsHtml}
          </article>
        </li>
      `;
    })
    .join('');

  elements.resultsList.classList.remove('hidden');
}

// ========================================
// デバウンス
// ========================================

/**
 * デバウンス関数を作成する
 *
 * @param func - デバウンス対象の関数
 * @param wait - 待機時間（ミリ秒）
 * @returns デバウンス済みの関数
 */
function debounce(func: (query: string) => Promise<void>, wait: number): (query: string) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (query: string) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(query), wait);
  };
}

// ========================================
// メイン処理
// ========================================

/**
 * 検索を実行してUIを更新する
 */
async function performSearch(query: string, elements: SearchPageElements): Promise<void> {
  const trimmedQuery = query.trim();

  // URLパラメータを更新
  const url = new URL(window.location.href);
  if (trimmedQuery) {
    url.searchParams.set('q', trimmedQuery);
  } else {
    url.searchParams.delete('q');
  }
  window.history.replaceState({}, '', url.toString());

  if (!trimmedQuery) {
    showInitial(elements);
    return;
  }

  showLoading(elements);

  try {
    const index = await loadSearchIndex();
    const results = searchArticles(index, trimmedQuery);
    displayResults(results, elements);
  } catch (error) {
    console.error('検索エラー:', error);
    elements.noResultsMessage.textContent =
      '検索中にエラーが発生しました。ページを再読み込みしてください。';
    elements.noResultsMessage.classList.remove('hidden');
    elements.loadingMessage.classList.add('hidden');
  }
}

/**
 * 検索ページを初期化する
 *
 * @example
 * // search.astro で呼び出し
 * import { initSearchPage } from '../scripts/search-client';
 * initSearchPage();
 */
export function initSearchPage(): void {
  const elements = getElements();

  // デバウンス付きの検索実行
  const debouncedSearch = debounce(
    (query: string) => performSearch(query, elements),
    DEBOUNCE_WAIT,
  );

  // 入力イベントのリスナー
  elements.searchInput.addEventListener('input', (e: Event) => {
    const target = e.target as HTMLInputElement;
    debouncedSearch(target.value);
  });

  // 初期ロード時にURLパラメータから検索クエリを取得
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get('q');
  if (initialQuery) {
    elements.searchInput.value = initialQuery;
    performSearch(initialQuery, elements);
  }
}
