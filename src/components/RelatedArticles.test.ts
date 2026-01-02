/**
 * RelatedArticles.astro - テストスイート
 *
 * 関連要件:
 * - REQ-701: 記事詳細ページに関連記事リストを表示
 *   - タグが一致する記事を優先表示
 *   - 最大5件まで表示
 *   - 現在の記事を除外
 *
 * テスト方針:
 * - コンポーネントのHTML出力を検証
 * - アクセシビリティ属性の存在確認
 * - 境界値・異常系のテスト
 */

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it, beforeEach } from 'vitest';
import RelatedArticles from './RelatedArticles.astro';
import type { RelatedPostEntry } from '../utils/relatedArticles';
import type { CollectionEntry } from 'astro:content';

// ========================================
// テストヘルパー関数
// ========================================

/**
 * テスト用のBlogPostを生成するヘルパー関数
 */
type BlogPost = CollectionEntry<'blog'>;

function createMockPost(params: {
  id: string;
  title?: string;
  description?: string;
  pubDate?: Date;
  tags?: string[];
}): BlogPost {
  return {
    id: params.id,
    body: 'Test body content',
    collection: 'blog',
    data: {
      title: params.title ?? `Test Post: ${params.id}`,
      description: params.description ?? 'Test description',
      pubDate: params.pubDate ?? new Date('2025-01-15'),
      updatedDate: params.pubDate ?? new Date('2025-01-15'),
      coverImage: 'https://placehold.co/1200x630',
      tags: params.tags ?? [],
      draft: false,
    },
  } as BlogPost;
}

/**
 * テスト用のRelatedPostEntryを生成するヘルパー関数
 */
function createRelatedEntry(params: {
  id: string;
  title?: string;
  score?: number;
  commonTags?: string[];
  pubDate?: Date;
}): RelatedPostEntry {
  return {
    post: createMockPost({
      id: params.id,
      title: params.title,
      pubDate: params.pubDate,
      tags: params.commonTags ?? ['TypeScript'],
    }),
    score: params.score ?? 1,
    commonTags: params.commonTags ?? ['TypeScript'],
  };
}

describe('RelatedArticles component', () => {
  let container: AstroContainer;

  beforeEach(async () => {
    container = await AstroContainer.create();
  });

  // ========================================
  // 正常系テストケース
  // ========================================

  describe('正常系テストケース', () => {
    // TC-RAC-001: 関連記事リストを正しく表示する
    it('TC-RAC-001: 関連記事リストを正しく表示する', async () => {
      const relatedPosts: RelatedPostEntry[] = [
        createRelatedEntry({ id: 'post-1', title: '関連記事1', score: 2, commonTags: ['TypeScript', 'React'] }),
        createRelatedEntry({ id: 'post-2', title: '関連記事2', score: 1, commonTags: ['TypeScript'] }),
      ];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      // 関連記事セクションが表示される
      expect(result).toContain('関連記事');
      // 各記事タイトルが表示される
      expect(result).toContain('関連記事1');
      expect(result).toContain('関連記事2');
    });

    // TC-RAC-002: 記事へのリンクが正しく生成される
    it('TC-RAC-002: 記事へのリンクが正しく生成される', async () => {
      const relatedPosts: RelatedPostEntry[] = [
        createRelatedEntry({ id: 'test-post-slug', title: 'テスト記事' }),
      ];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      // 記事へのリンクが正しいパスで生成される
      expect(result).toContain('href="/blog/test-post-slug"');
    });

    // TC-RAC-003: 共通タグ情報を表示する
    it('TC-RAC-003: 共通タグ情報を表示する', async () => {
      const relatedPosts: RelatedPostEntry[] = [
        createRelatedEntry({ id: 'post-1', commonTags: ['TypeScript', 'React'] }),
      ];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      // 共通タグが表示される
      expect(result).toContain('TypeScript');
      expect(result).toContain('React');
    });

    // TC-RAC-004: 公開日が表示される
    it('TC-RAC-004: 公開日が表示される', async () => {
      const relatedPosts: RelatedPostEntry[] = [
        createRelatedEntry({ id: 'post-1', pubDate: new Date('2025-01-15') }),
      ];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      // 公開日が表示される（日本語フォーマット）
      expect(result).toContain('2025');
    });
  });

  // ========================================
  // 境界値テストケース
  // ========================================

  describe('境界値テストケース', () => {
    // TC-RAC-101: 関連記事が0件の場合はセクション非表示
    it('TC-RAC-101: 関連記事が0件の場合はセクション非表示', async () => {
      const relatedPosts: RelatedPostEntry[] = [];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      // セクションが表示されない
      expect(result).not.toContain('関連記事');
      expect(result).not.toContain('<section');
    });

    // TC-RAC-102: 関連記事が1件の場合も正常表示
    it('TC-RAC-102: 関連記事が1件の場合も正常表示', async () => {
      const relatedPosts: RelatedPostEntry[] = [
        createRelatedEntry({ id: 'post-1', title: '唯一の関連記事' }),
      ];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      expect(result).toContain('関連記事');
      expect(result).toContain('唯一の関連記事');
    });

    // TC-RAC-103: 関連記事が5件の場合も正常表示
    it('TC-RAC-103: 関連記事が5件の場合も正常表示', async () => {
      const relatedPosts: RelatedPostEntry[] = Array.from({ length: 5 }, (_, i) =>
        createRelatedEntry({ id: `post-${i + 1}`, title: `関連記事${i + 1}` })
      );

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      // すべての記事が表示される
      for (let i = 1; i <= 5; i++) {
        expect(result).toContain(`関連記事${i}`);
      }
    });
  });

  // ========================================
  // アクセシビリティテストケース
  // ========================================

  describe('アクセシビリティテストケース', () => {
    // TC-RAC-201: セマンティックHTML（section, h2）使用
    it('TC-RAC-201: セマンティックHTML（section, h2）使用', async () => {
      const relatedPosts: RelatedPostEntry[] = [
        createRelatedEntry({ id: 'post-1' }),
      ];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      // セマンティックHTML要素が使用される
      expect(result).toContain('<section');
      expect(result).toContain('<h2');
    });

    // TC-RAC-202: aria-labelledby属性が設定される
    it('TC-RAC-202: aria-labelledby属性が設定される', async () => {
      const relatedPosts: RelatedPostEntry[] = [
        createRelatedEntry({ id: 'post-1' }),
      ];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      // aria-labelledby属性が設定される
      expect(result).toContain('aria-labelledby');
    });

    // TC-RAC-203: リスト構造（ul, li）が使用される
    it('TC-RAC-203: リスト構造（ul, li）が使用される', async () => {
      const relatedPosts: RelatedPostEntry[] = [
        createRelatedEntry({ id: 'post-1' }),
        createRelatedEntry({ id: 'post-2' }),
      ];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      // リスト構造が使用される
      expect(result).toContain('<ul');
      expect(result).toContain('<li');
    });

    // TC-RAC-204: フォーカス可視化スタイルが設定される
    it('TC-RAC-204: フォーカス可視化スタイルが設定される', async () => {
      const relatedPosts: RelatedPostEntry[] = [
        createRelatedEntry({ id: 'post-1' }),
      ];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      // フォーカス可視化のTailwindクラスが使用される
      expect(result).toContain('focus-visible:ring');
    });
  });

  // ========================================
  // スタイリングテストケース
  // ========================================

  describe('スタイリングテストケース', () => {
    // TC-RAC-301: ダークモード対応スタイルが設定される
    it('TC-RAC-301: ダークモード対応スタイルが設定される', async () => {
      const relatedPosts: RelatedPostEntry[] = [
        createRelatedEntry({ id: 'post-1' }),
      ];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      // ダークモード対応のTailwindクラスが使用される
      expect(result).toContain('dark:');
    });

    // TC-RAC-302: レスポンシブデザインが適用される
    it('TC-RAC-302: レスポンシブデザインが適用される', async () => {
      const relatedPosts: RelatedPostEntry[] = [
        createRelatedEntry({ id: 'post-1' }),
      ];

      const result = await container.renderToString(RelatedArticles, {
        props: { relatedPosts },
      });

      // グリッドレイアウトのレスポンシブクラスが使用される
      expect(result).toMatch(/grid|flex/);
    });
  });
});
