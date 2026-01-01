/**
 * search.astro - テストスイート
 *
 * TASK-0019: 検索ページの実装
 *
 * 関連要件:
 * - REQ-401: 記事検索機能（タイトル・本文から全文検索、部分一致）
 * - REQ-402: 検索結果を関連度順に表示
 * - NFR-301: セマンティックHTML使用
 * - NFR-302: キーボードナビゲーション対応
 * - NFR-303: ARIAラベル適切な設定
 *
 * 関連文書:
 * - アーキテクチャ設計: docs/design/blog-article-management/architecture.md
 * - データフロー: docs/design/blog-article-management/dataflow.md
 */

import { describe, expect, it } from 'vitest';
import { type SearchIndexItem, generateSearchIndex, searchArticles } from '../../src/utils/search';

// ========================================
// 検索ページの仕様確認テスト
// ========================================

describe('検索ページ (search.astro)', () => {
  // ========================================
  // 正常系テストケース
  // ========================================

  describe('正常系テストケース', () => {
    // TC-SP-001: 検索ページが存在する 🔵
    it('TC-SP-001: 検索ページのファイルが存在する', async () => {
      // 【テスト目的】: 検索ページファイルが正しい場所に存在することを確認
      // 🔵 信頼性: アーキテクチャ設計書より

      const fs = await import('node:fs');
      const path = await import('node:path');

      const searchPagePath = path.resolve('src/pages/search.astro');
      const exists = fs.existsSync(searchPagePath);

      expect(exists).toBe(true);
    });

    // TC-SP-002: 検索ユーティリティ関数が存在する 🔵
    it('TC-SP-002: searchArticles関数が利用可能', () => {
      // 【テスト目的】: 検索ユーティリティが正しくエクスポートされていることを確認
      // 🔵 信頼性: TASK-0010で実装済み

      expect(typeof searchArticles).toBe('function');
    });

    // TC-SP-003: generateSearchIndex関数が存在する 🔵
    it('TC-SP-003: generateSearchIndex関数が利用可能', () => {
      // 【テスト目的】: 検索インデックス生成関数が正しくエクスポートされていることを確認
      // 🔵 信頼性: TASK-0010で実装済み

      expect(typeof generateSearchIndex).toBe('function');
    });
  });

  // ========================================
  // 検索インデックス生成テストケース
  // ========================================

  describe('検索インデックス生成', () => {
    // TC-SP-004: 検索インデックスJSONファイルが生成される 🔵
    it('TC-SP-004: ビルド時に検索インデックスJSONが生成可能', () => {
      // 【テスト目的】: 検索インデックス生成ユーティリティを使用して
      // ブログ記事からJSONインデックスが生成できることを確認
      // 🔵 信頼性: REQ-401、dataflow.mdより

      // テスト用の記事データ
      const mockPosts = [
        {
          slug: 'test-post-1',
          data: {
            title: 'テスト記事1',
            description: 'テスト説明1',
            pubDate: new Date('2025-01-01'),
            tags: ['Astro', 'TypeScript'],
            draft: false,
          },
          body: 'テスト本文1の内容です。',
        },
        {
          slug: 'test-post-2',
          data: {
            title: 'テスト記事2',
            description: 'テスト説明2',
            pubDate: new Date('2025-01-02'),
            tags: ['React', 'JavaScript'],
            draft: false,
          },
          body: 'テスト本文2の内容です。',
        },
      ];

      const index = generateSearchIndex(mockPosts);

      // インデックスが正しく生成されることを確認
      expect(index).toHaveLength(2);
      expect(index[0].slug).toBe('test-post-1');
      expect(index[0].title).toBe('テスト記事1');
      expect(index[1].slug).toBe('test-post-2');
    });
  });

  // ========================================
  // 検索機能テストケース
  // ========================================

  describe('検索機能', () => {
    // TC-SP-005: クエリに一致する記事を検索できる 🔵
    it('TC-SP-005: タイトルに一致するクエリで記事を検索できる', () => {
      // 【テスト目的】: 検索クエリに一致する記事が正しく返されることを確認
      // 🔵 信頼性: REQ-401より

      const testIndex: SearchIndexItem[] = [
        {
          slug: 'astro-intro',
          title: 'Astro入門',
          description: 'Astroの基本を学ぶ',
          body: 'Astroは高速な静的サイトジェネレーターです。',
          tags: ['Astro', 'TypeScript'],
          pubDate: '2025-01-15T00:00:00.000Z',
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

      const results = searchArticles(testIndex, 'Astro');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.slug).toBe('astro-intro');
    });

    // TC-SP-006: 検索結果が関連度順にソートされる 🔵
    it('TC-SP-006: 検索結果が関連度順にソートされる', () => {
      // 【テスト目的】: 検索結果が関連度（スコア）順にソートされることを確認
      // 🔵 信頼性: REQ-402より

      const testIndex: SearchIndexItem[] = [
        {
          slug: 'typescript-basics',
          title: 'TypeScript入門',
          description: 'TypeScriptの基礎を解説',
          body: 'TypeScriptは型安全なJavaScriptのスーパーセットです。TypeScriptを使うと安全にコードを書けます。',
          tags: ['TypeScript', 'JavaScript'],
          pubDate: '2025-01-10T00:00:00.000Z',
        },
        {
          slug: 'astro-intro',
          title: 'Astro入門',
          description: 'Astroの基本を学ぶ',
          body: 'Astroは高速な静的サイトジェネレーターです。TypeScriptをサポートしています。',
          tags: ['Astro', 'TypeScript'],
          pubDate: '2025-01-15T00:00:00.000Z',
        },
      ];

      const results = searchArticles(testIndex, 'TypeScript');

      // 複数のマッチがある記事がより高いスコアを持つ
      expect(results.length).toBe(2);
      expect(results[0].score).toBeGreaterThanOrEqual(results[1].score);
    });

    // TC-SP-007: マッチ箇所情報が返される 🔵
    it('TC-SP-007: マッチ箇所情報が返される（ハイライト表示用）', () => {
      // 【テスト目的】: ハイライト表示用のマッチ箇所情報が返されることを確認
      // 🔵 信頼性: REQ-401「検索結果をハイライト表示」

      const testIndex: SearchIndexItem[] = [
        {
          slug: 'astro-intro',
          title: 'Astro入門',
          description: 'Astroの基本を学ぶガイド',
          body: 'Astroは高速な静的サイトジェネレーターです。',
          tags: ['Astro', 'TypeScript'],
          pubDate: '2025-01-15T00:00:00.000Z',
        },
      ];

      const results = searchArticles(testIndex, 'Astro');

      expect(results[0].matches).toBeDefined();
      expect(results[0].matches.length).toBeGreaterThan(0);

      // マッチ情報にフィールド名とインデックスが含まれる
      const match = results[0].matches[0];
      expect(match.field).toBeDefined();
      expect(match.indices).toBeDefined();
    });

    // TC-SP-008: 空のクエリで空配列を返す 🔵
    it('TC-SP-008: 空のクエリで空配列を返す', () => {
      // 【テスト目的】: 空のクエリに対して空配列が返されることを確認
      // 🔵 信頼性: EDGE-101エッジケース対応

      const testIndex: SearchIndexItem[] = [
        {
          slug: 'astro-intro',
          title: 'Astro入門',
          description: 'Astroの基本を学ぶ',
          body: 'Astroは高速な静的サイトジェネレーターです。',
          tags: ['Astro', 'TypeScript'],
          pubDate: '2025-01-15T00:00:00.000Z',
        },
      ];

      const results = searchArticles(testIndex, '');

      expect(results).toEqual([]);
    });

    // TC-SP-009: マッチしないクエリで空配列を返す 🔵
    it('TC-SP-009: マッチしないクエリで空配列を返す', () => {
      // 【テスト目的】: マッチしないクエリに対して空配列が返されることを確認
      // 🔵 信頼性: EDGE-101エッジケース対応

      const testIndex: SearchIndexItem[] = [
        {
          slug: 'astro-intro',
          title: 'Astro入門',
          description: 'Astroの基本を学ぶ',
          body: 'Astroは高速な静的サイトジェネレーターです。',
          tags: ['Astro', 'TypeScript'],
          pubDate: '2025-01-15T00:00:00.000Z',
        },
      ];

      const results = searchArticles(testIndex, 'zzzzz存在しない単語');

      expect(results).toEqual([]);
    });
  });

  // ========================================
  // ハイライト表示ヘルパー関数テスト
  // ========================================

  describe('ハイライト表示', () => {
    // TC-SP-010: テキストのハイライト表示が可能 🔵
    it('TC-SP-010: マッチ箇所をハイライト用にマークできる', () => {
      // 【テスト目的】: マッチ箇所情報を使ってテキストをハイライト表示できることを確認
      // 🔵 信頼性: REQ-401「検索結果をハイライト表示」

      // ハイライト関数のテスト（クライアントサイドで使用）
      const highlightText = (
        text: string,
        indices: [number, number][],
      ): { text: string; highlighted: boolean }[] => {
        if (indices.length === 0) {
          return [{ text, highlighted: false }];
        }

        const result: { text: string; highlighted: boolean }[] = [];
        let lastIndex = 0;

        for (const [start, end] of indices) {
          if (start > lastIndex) {
            result.push({ text: text.slice(lastIndex, start), highlighted: false });
          }
          result.push({ text: text.slice(start, end), highlighted: true });
          lastIndex = end;
        }

        if (lastIndex < text.length) {
          result.push({ text: text.slice(lastIndex), highlighted: false });
        }

        return result;
      };

      const text = 'Astro入門ガイド';
      const indices: [number, number][] = [[0, 5]]; // "Astro"

      const result = highlightText(text, indices);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ text: 'Astro', highlighted: true });
      expect(result[1]).toEqual({ text: '入門ガイド', highlighted: false });
    });
  });
});
