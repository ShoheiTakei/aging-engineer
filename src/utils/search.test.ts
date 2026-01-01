/**
 * search.ts - テストスイート
 *
 * 関連要件:
 * - REQ-401: 記事検索機能（タイトル・本文から全文検索、部分一致）
 * - REQ-402: 検索結果を関連度順に表示
 * - NFR-001: Lighthouse 90+点維持（外部ライブラリ不使用）
 *
 * 関連文書:
 * - テストケース定義書: docs/implements/blog-article-management/TASK-0010/search-utils-testcases.md
 * - タスクノート: docs/implements/blog-article-management/TASK-0010/note.md
 */

import { describe, expect, it } from 'vitest';
import {
  type MatchInfo,
  type SearchIndexItem,
  type SearchResult,
  generateSearchIndex,
  searchArticles,
} from './search';

// ========================================
// テスト用モックデータ
// ========================================

/**
 * テスト用のブログ記事データ
 */
interface MockBlogPost {
  slug: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    tags: string[];
    draft: boolean;
  };
  body: string;
}

const createMockPost = (overrides: Partial<MockBlogPost> = {}): MockBlogPost => ({
  slug: 'test-post',
  data: {
    title: 'テスト記事',
    description: 'テスト用の説明文です',
    pubDate: new Date('2025-01-15'),
    tags: ['テスト', 'サンプル'],
    draft: false,
  },
  body: 'これはテスト用の本文です。Astroについて解説しています。',
  ...overrides,
});

describe('search utilities', () => {
  // ========================================
  // generateSearchIndex() テストケース
  // ========================================

  describe('generateSearchIndex', () => {
    // ========================================
    // 正常系テストケース
    // ========================================

    describe('正常系テストケース', () => {
      // TC-SI-001: 1件の記事から検索インデックスを生成 🔵
      it('TC-SI-001: 1件の記事から検索インデックスを生成する', () => {
        // 【テスト目的】: 1件の記事から正しい検索インデックスが生成されることを確認
        // 【テスト内容】: 単一の記事データを渡し、正しいインデックスが返されるか検証
        // 🔵 信頼性: 要件定義書REQ-401より

        // 【テストデータ準備】: 1件のブログ記事
        const posts: MockBlogPost[] = [
          {
            slug: 'first-post',
            data: {
              title: 'Astro入門',
              description: 'Astroの基本を学ぶ',
              pubDate: new Date('2025-01-15'),
              tags: ['Astro', 'TypeScript'],
              draft: false,
            },
            body: '# はじめに\nAstroは高速な静的サイトジェネレーターです。',
          },
        ];

        // 【実際の処理実行】: generateSearchIndex関数を呼び出し
        const result = generateSearchIndex(posts);

        // 【結果検証】: 正しいインデックスが生成されることを確認
        expect(result).toHaveLength(1);
        expect(result[0].slug).toBe('first-post');
        expect(result[0].title).toBe('Astro入門');
        expect(result[0].description).toBe('Astroの基本を学ぶ');
        expect(result[0].tags).toEqual(['Astro', 'TypeScript']);
        expect(result[0].body).toBe('# はじめに\nAstroは高速な静的サイトジェネレーターです。');
        expect(result[0].pubDate).toBe('2025-01-15T00:00:00.000Z');
      });

      // TC-SI-002: 複数記事から検索インデックスを生成 🔵
      it('TC-SI-002: 複数記事から検索インデックスを生成する', () => {
        // 【テスト目的】: 複数の記事から正しい検索インデックスが生成されることを確認
        // 【テスト内容】: 3件の記事データを渡し、すべてがインデックスに含まれるか検証
        // 🔵 信頼性: 要件定義書REQ-401より

        // 【テストデータ準備】: 3件のブログ記事
        const posts: MockBlogPost[] = [
          createMockPost({ slug: 'post-1', data: { ...createMockPost().data, title: '記事1' } }),
          createMockPost({ slug: 'post-2', data: { ...createMockPost().data, title: '記事2' } }),
          createMockPost({ slug: 'post-3', data: { ...createMockPost().data, title: '記事3' } }),
        ];

        // 【実際の処理実行】: generateSearchIndex関数を呼び出し
        const result = generateSearchIndex(posts);

        // 【結果検証】: すべての記事がインデックスに含まれることを確認
        expect(result).toHaveLength(3);
        expect(result.map((item) => item.slug)).toEqual(['post-1', 'post-2', 'post-3']);
      });

      // TC-SI-003: 本文が指定文字数で切り詰められる 🔵
      it('TC-SI-003: 本文が指定文字数で切り詰められる', () => {
        // 【テスト目的】: 長い本文が指定文字数で切り詰められることを確認
        // 【テスト内容】: 1000文字の本文を持つ記事に対して500文字制限を適用
        // 🔵 信頼性: dataflow.mdの検索インデックス仕様より

        // 【テストデータ準備】: 長い本文を持つ記事
        const longBody = 'あ'.repeat(1000);
        const posts: MockBlogPost[] = [createMockPost({ body: longBody })];

        // 【実際の処理実行】: generateSearchIndex関数を呼び出し（500文字制限）
        const result = generateSearchIndex(posts, { bodyLength: 500 });

        // 【結果検証】: 本文が500文字に切り詰められることを確認
        expect(result[0].body.length).toBe(500);
      });
    });

    // ========================================
    // 境界値テストケース
    // ========================================

    describe('境界値テストケース', () => {
      // TC-SI-004: 空の記事配列 🔵
      it('TC-SI-004: 空の記事配列で空配列を返す', () => {
        // 【テスト目的】: 空の記事配列に対して空配列が返されることを確認
        // 🔵 信頼性: 一般的なエッジケース処理

        const posts: MockBlogPost[] = [];
        const result = generateSearchIndex(posts);

        expect(result).toEqual([]);
      });

      // TC-SI-005: 本文が0文字の記事 🔵
      it('TC-SI-005: 本文が0文字の記事で空文字列を返す', () => {
        // 【テスト目的】: 本文が空の記事で空文字列が返されることを確認
        // 🔵 信頼性: 一般的なエッジケース処理

        const posts: MockBlogPost[] = [createMockPost({ body: '' })];
        const result = generateSearchIndex(posts);

        expect(result[0].body).toBe('');
      });

      // TC-SI-006: タグなしの記事 🔵
      it('TC-SI-006: タグなしの記事で空配列を返す', () => {
        // 【テスト目的】: タグがない記事で空配列が返されることを確認
        // 🔵 信頼性: Content Collectionsスキーマの仕様

        const posts: MockBlogPost[] = [
          createMockPost({ data: { ...createMockPost().data, tags: [] } }),
        ];
        const result = generateSearchIndex(posts);

        expect(result[0].tags).toEqual([]);
      });

      // TC-SI-007: 本文がbodyLengthより短い場合 🔵
      it('TC-SI-007: 本文がbodyLengthより短い場合は元のまま', () => {
        // 【テスト目的】: 本文が制限値より短い場合、切り詰めが発生しないことを確認
        // 🔵 信頼性: 一般的なエッジケース処理

        const shortBody = 'あ'.repeat(100);
        const posts: MockBlogPost[] = [createMockPost({ body: shortBody })];
        const result = generateSearchIndex(posts, { bodyLength: 500 });

        expect(result[0].body.length).toBe(100);
      });
    });
  });

  // ========================================
  // searchArticles() テストケース
  // ========================================

  describe('searchArticles', () => {
    // テスト用の検索インデックス
    const createTestIndex = (): SearchIndexItem[] => [
      {
        slug: 'astro-intro',
        title: 'Astro入門',
        description: 'Astroの基本を学ぶガイド',
        body: 'Astroは高速な静的サイトジェネレーターです。TypeScriptをサポートしています。',
        tags: ['Astro', 'TypeScript'],
        pubDate: '2025-01-15T00:00:00.000Z',
      },
      {
        slug: 'typescript-basics',
        title: 'TypeScript入門',
        description: 'TypeScriptの基礎を解説',
        body: 'TypeScriptは型安全なJavaScriptのスーパーセットです。',
        tags: ['TypeScript', 'JavaScript'],
        pubDate: '2025-01-10T00:00:00.000Z',
      },
      {
        slug: 'react-tutorial',
        title: 'React チュートリアル',
        description: 'Reactを使ったWeb開発入門',
        body: 'ReactはUIを構築するためのJavaScriptライブラリです。',
        tags: ['React', 'JavaScript'],
        pubDate: '2025-01-05T00:00:00.000Z',
      },
    ];

    // ========================================
    // 正常系テストケース
    // ========================================

    describe('正常系テストケース', () => {
      // TC-SA-001: タイトルに完全一致するクエリ 🔵
      it('TC-SA-001: タイトルに完全一致するクエリで検索できる', () => {
        // 【テスト目的】: タイトルに完全一致するクエリで記事が検索されることを確認
        // 🔵 信頼性: 要件定義書REQ-401より

        const index = createTestIndex();
        const result = searchArticles(index, 'Astro入門');

        expect(result.length).toBeGreaterThan(0);
        expect(result[0].item.slug).toBe('astro-intro');
      });

      // TC-SA-002: タイトルに部分一致するクエリ 🔵
      it('TC-SA-002: タイトルに部分一致するクエリで検索できる', () => {
        // 【テスト目的】: 部分一致検索が動作することを確認
        // 🔵 信頼性: 要件定義書REQ-401「部分一致検索をサポート」

        const index = createTestIndex();
        const result = searchArticles(index, 'Astro');

        expect(result.length).toBeGreaterThan(0);
        expect(result[0].item.slug).toBe('astro-intro');
      });

      // TC-SA-003: 大文字小文字を区別しない検索 🔵
      it('TC-SA-003: 大文字小文字を区別しない検索ができる', () => {
        // 【テスト目的】: 大文字小文字を区別しない検索が動作することを確認
        // 🔵 信頼性: 一般的な検索機能の仕様

        const index = createTestIndex();
        const result = searchArticles(index, 'astro');

        expect(result.length).toBeGreaterThan(0);
        expect(result[0].item.slug).toBe('astro-intro');
      });

      // TC-SA-004: タグに一致するクエリ 🔵
      it('TC-SA-004: タグに一致するクエリで検索できる', () => {
        // 【テスト目的】: タグでの検索が動作することを確認
        // 🔵 信頼性: 要件定義書REQ-401

        const index = createTestIndex();
        const result = searchArticles(index, 'JavaScript');

        // JavaScriptタグを持つ記事が検索される
        expect(result.length).toBe(2);
        const slugs = result.map((r) => r.item.slug);
        expect(slugs).toContain('typescript-basics');
        expect(slugs).toContain('react-tutorial');
      });

      // TC-SA-005: 本文に一致するクエリ 🔵
      it('TC-SA-005: 本文に一致するクエリで検索できる', () => {
        // 【テスト目的】: 本文での検索が動作することを確認
        // 🔵 信頼性: 要件定義書REQ-401「タイトルと本文から全文検索」

        const index = createTestIndex();
        const result = searchArticles(index, 'サイトジェネレーター');

        expect(result.length).toBeGreaterThan(0);
        expect(result[0].item.slug).toBe('astro-intro');
      });

      // TC-SA-006: 複数フィールドにマッチする場合 🔵
      it('TC-SA-006: 複数フィールドにマッチする場合スコアが高くなる', () => {
        // 【テスト目的】: 複数フィールドにマッチする記事のスコアが高いことを確認
        // 🔵 信頼性: 要件定義書REQ-402「関連度順に表示」

        const index = createTestIndex();
        // 'TypeScript'はタイトル・タグ・本文のすべてに含まれる記事がある
        const result = searchArticles(index, 'TypeScript');

        expect(result.length).toBeGreaterThan(0);
        // typescript-basicsはタイトルにもタグにも本文にもTypeScriptを含む
        expect(result[0].item.slug).toBe('typescript-basics');
      });

      // TC-SA-007: 関連度順にソートされる 🔵
      it('TC-SA-007: 関連度順にソートされる', () => {
        // 【テスト目的】: 検索結果が関連度順にソートされることを確認
        // 🔵 信頼性: 要件定義書REQ-402

        const index = createTestIndex();
        const result = searchArticles(index, '入門');

        expect(result.length).toBeGreaterThan(0);
        // スコアが降順であることを確認
        for (let i = 1; i < result.length; i++) {
          expect(result[i - 1].score).toBeGreaterThanOrEqual(result[i].score);
        }
      });

      // TC-SA-008: マッチ箇所情報が返される 🔵
      it('TC-SA-008: マッチ箇所情報が返される', () => {
        // 【テスト目的】: マッチ箇所情報が正しく返されることを確認
        // 🔵 信頼性: 要件定義書REQ-401「検索結果をハイライト表示」

        const index = createTestIndex();
        const result = searchArticles(index, 'Astro');

        expect(result.length).toBeGreaterThan(0);
        expect(result[0].matches).toBeDefined();
        expect(result[0].matches.length).toBeGreaterThan(0);

        // マッチ情報の構造を確認
        const match = result[0].matches[0];
        expect(match.field).toBeDefined();
        expect(match.indices).toBeDefined();
        expect(match.indices.length).toBeGreaterThan(0);
      });
    });

    // ========================================
    // 境界値テストケース
    // ========================================

    describe('境界値テストケース', () => {
      // TC-SA-009: 空のクエリ 🔵
      it('TC-SA-009: 空のクエリで空配列を返す', () => {
        // 【テスト目的】: 空のクエリに対して空配列が返されることを確認
        // 🔵 信頼性: 一般的なエッジケース処理

        const index = createTestIndex();
        const result = searchArticles(index, '');

        expect(result).toEqual([]);
      });

      // TC-SA-010: マッチしないクエリ 🔵
      it('TC-SA-010: マッチしないクエリで空配列を返す', () => {
        // 【テスト目的】: マッチしないクエリに対して空配列が返されることを確認
        // 🔵 信頼性: 一般的なエッジケース処理

        const index = createTestIndex();
        const result = searchArticles(index, 'zzzzzzz存在しない単語');

        expect(result).toEqual([]);
      });

      // TC-SA-011: 空のインデックス 🔵
      it('TC-SA-011: 空のインデックスで空配列を返す', () => {
        // 【テスト目的】: 空のインデックスに対して空配列が返されることを確認
        // 🔵 信頼性: 一般的なエッジケース処理

        const index: SearchIndexItem[] = [];
        const result = searchArticles(index, 'Astro');

        expect(result).toEqual([]);
      });

      // TC-SA-012: スペースのみのクエリ 🔵
      it('TC-SA-012: スペースのみのクエリで空配列を返す', () => {
        // 【テスト目的】: スペースのみのクエリに対して空配列が返されることを確認
        // 🔵 信頼性: 一般的なエッジケース処理

        const index = createTestIndex();
        const result = searchArticles(index, '   ');

        expect(result).toEqual([]);
      });

      // TC-SA-013: 日本語クエリ 🔵
      it('TC-SA-013: 日本語クエリで検索できる', () => {
        // 【テスト目的】: 日本語クエリで検索が動作することを確認
        // 🔵 信頼性: 日本語ブログサイトの要件

        const index = createTestIndex();
        const result = searchArticles(index, '入門');

        expect(result.length).toBeGreaterThan(0);
      });
    });
  });
});
