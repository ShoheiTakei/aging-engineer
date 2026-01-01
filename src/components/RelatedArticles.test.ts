/**
 * RelatedArticles.astro - テストスイート
 *
 * 関連要件:
 * - REQ-701: 記事詳細ページに関連記事リストを表示
 *   - タグが一致する記事を優先表示
 *   - 最大3件まで表示（コンポーネントレベル）
 *   - 現在の記事を除外
 *
 * 関連文書:
 * - 関連記事ユーティリティ: src/utils/relatedArticles.ts
 * - テストパターン: docs/design/frontend-test-infra/test-patterns.md
 */

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeEach, describe, expect, it } from 'vitest';
import type { BlogPost, RelatedPostEntry } from '../utils/relatedArticles';
import RelatedArticles from './RelatedArticles.astro';

// ========================================
// テストヘルパー関数
// ========================================

/**
 * テスト用のBlogPostを生成するヘルパー関数
 */
function createMockPost(params: {
  id: string;
  title?: string;
  description?: string;
  tags?: string[];
  pubDate?: Date;
}): BlogPost {
  return {
    id: params.id,
    body: 'Test body content',
    collection: 'blog',
    data: {
      title: params.title ?? `Test Post: ${params.id}`,
      description: params.description ?? 'Test description',
      pubDate: params.pubDate ?? new Date('2025-01-15'),
      updatedDate: new Date('2025-01-15'),
      coverImage: 'https://placehold.co/1200x630',
      tags: params.tags ?? [],
      draft: false,
    },
  } as BlogPost;
}

/**
 * テスト用のRelatedPostEntryを生成するヘルパー関数
 */
function createMockRelatedEntry(params: {
  id: string;
  title?: string;
  description?: string;
  tags?: string[];
  score?: number;
  commonTags?: string[];
}): RelatedPostEntry {
  return {
    post: createMockPost({
      id: params.id,
      title: params.title,
      description: params.description,
      tags: params.tags,
    }),
    score: params.score ?? 1,
    commonTags: params.commonTags ?? [],
  };
}

describe('RelatedArticles.astro', () => {
  let container: AstroContainer;

  beforeEach(async () => {
    container = await AstroContainer.create();
  });

  // ========================================
  // 正常系テストケース
  // ========================================

  describe('正常系テストケース', () => {
    // TC-RA-C-001: 基本レンダリングテスト
    it('TC-RA-C-001: 関連記事コンポーネントが正しくレンダリングされる', async () => {
      const relatedPosts: RelatedPostEntry[] = [
        createMockRelatedEntry({
          id: 'post-1',
          title: '関連記事1',
          tags: ['TypeScript'],
          commonTags: ['TypeScript'],
        }),
      ];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      // セクションがレンダリングされる
      expect(result).toContain('<section');
      expect(result).toContain('関連記事');
    });

    // TC-RA-C-002: 最大3件の関連記事を表示
    it('TC-RA-C-002: 最大3件の関連記事を表示する', async () => {
      const relatedPosts: RelatedPostEntry[] = [
        createMockRelatedEntry({ id: 'post-1', title: '記事1' }),
        createMockRelatedEntry({ id: 'post-2', title: '記事2' }),
        createMockRelatedEntry({ id: 'post-3', title: '記事3' }),
      ];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      expect(result).toContain('記事1');
      expect(result).toContain('記事2');
      expect(result).toContain('記事3');
    });

    // TC-RA-C-003: カード形式で表示される
    it('TC-RA-C-003: 関連記事がカード形式で表示される', async () => {
      const relatedPosts: RelatedPostEntry[] = [
        createMockRelatedEntry({
          id: 'post-1',
          title: '関連記事タイトル',
          description: '関連記事の説明文',
        }),
      ];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      // カードスタイルクラスが適用されている
      expect(result).toMatch(/class="[^"]*(?:rounded|border|shadow|bg-)/);
      // タイトルと説明が表示される
      expect(result).toContain('関連記事タイトル');
    });

    // TC-RA-C-004: 記事へのリンクが正しく設定される
    it('TC-RA-C-004: 各関連記事に正しいリンクが設定される', async () => {
      const relatedPosts: RelatedPostEntry[] = [
        createMockRelatedEntry({ id: 'sample-post', title: 'サンプル記事' }),
      ];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      // 記事へのリンクが含まれる
      expect(result).toContain('href="/blog/sample-post"');
    });

    // TC-RA-C-005: 共通タグが表示される
    it('TC-RA-C-005: 共通タグが表示される', async () => {
      const relatedPosts: RelatedPostEntry[] = [
        createMockRelatedEntry({
          id: 'post-1',
          title: '関連記事',
          commonTags: ['TypeScript', 'React'],
        }),
      ];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      // 共通タグが表示される
      expect(result).toContain('TypeScript');
      expect(result).toContain('React');
    });
  });

  // ========================================
  // 境界値テストケース
  // ========================================

  describe('境界値テストケース', () => {
    // TC-RA-C-101: 関連記事が0件の場合
    it('TC-RA-C-101: 関連記事が0件の場合はセクションを表示しない', async () => {
      const relatedPosts: RelatedPostEntry[] = [];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      // セクションが表示されない（空または非表示）
      expect(result).not.toContain('関連記事');
    });

    // TC-RA-C-102: 関連記事が1件のみの場合
    it('TC-RA-C-102: 関連記事が1件のみの場合も正しく表示される', async () => {
      const relatedPosts: RelatedPostEntry[] = [
        createMockRelatedEntry({ id: 'post-1', title: '唯一の関連記事' }),
      ];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      expect(result).toContain('関連記事');
      expect(result).toContain('唯一の関連記事');
    });
  });

  // ========================================
  // アクセシビリティテストケース
  // ========================================

  describe('アクセシビリティテストケース', () => {
    // TC-RA-C-201: セマンティックHTML使用
    it('TC-RA-C-201: セマンティックHTML（section, article）が使用されている', async () => {
      const relatedPosts: RelatedPostEntry[] = [
        createMockRelatedEntry({ id: 'post-1', title: '関連記事' }),
      ];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      // <section>タグが使用されている
      expect(result).toMatch(/<section[^>]*>/);
      // 見出しが存在する
      expect(result).toMatch(/<h[2-3][^>]*>/);
    });

    // TC-RA-C-202: リンクにアクセシブルな名前がある
    it('TC-RA-C-202: リンクにアクセシブルな名前（タイトル）がある', async () => {
      const relatedPosts: RelatedPostEntry[] = [
        createMockRelatedEntry({ id: 'post-1', title: '関連記事のタイトル' }),
      ];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      // リンク内にタイトルテキストがある
      expect(result).toMatch(/<a[^>]*>.*関連記事のタイトル.*<\/a>/s);
    });
  });

  // ========================================
  // スタイリングテストケース
  // ========================================

  describe('スタイリングテストケース', () => {
    // TC-RA-C-301: ダークモード対応スタイル
    it('TC-RA-C-301: ダークモード用スタイルクラスが適用されている', async () => {
      const relatedPosts: RelatedPostEntry[] = [
        createMockRelatedEntry({ id: 'post-1', title: '関連記事' }),
      ];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      // dark:プレフィックスクラスが含まれている
      expect(result).toMatch(/class="[^"]*dark:[^"]*"/);
    });

    // TC-RA-C-302: グリッドレイアウトでカードが配置される
    it('TC-RA-C-302: グリッドレイアウトでカードが配置される', async () => {
      const relatedPosts: RelatedPostEntry[] = [
        createMockRelatedEntry({ id: 'post-1', title: '記事1' }),
        createMockRelatedEntry({ id: 'post-2', title: '記事2' }),
        createMockRelatedEntry({ id: 'post-3', title: '記事3' }),
      ];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      // グリッドクラスが適用されている
      expect(result).toMatch(/class="[^"]*grid[^"]*"/);
    });
  });
});
