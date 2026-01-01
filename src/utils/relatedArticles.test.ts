/**
 * relatedArticles.ts - テストスイート
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
 * - テストパターン: docs/design/frontend-test-infra/test-patterns.md
 */

import { describe, expect, it } from 'vitest';
import { getRelatedPosts } from './relatedArticles';
import type { BlogPost } from './relatedArticles';

// ========================================
// テストヘルパー関数
// ========================================

/**
 * ブログ記事のフロントマターデータ型（テスト用）
 * BlogPost['data']から導出
 */
type BlogFrontmatter = BlogPost['data'];

/**
 * テスト用のBlogPostを生成するヘルパー関数
 * 必須フィールドのみを指定し、残りはデフォルト値を使用
 *
 * @note Astro v5ではCollectionEntryは`slug`ではなく`id`を使用
 */
function createMockPost(params: {
  id: string;
  data?: Partial<BlogFrontmatter>;
  body?: string;
}): BlogPost {
  return {
    id: params.id,
    body: params.body ?? 'Test body content',
    collection: 'blog',
    data: {
      title: params.data?.title ?? `Test Post: ${params.id}`,
      description: params.data?.description ?? 'Test description',
      pubDate: params.data?.pubDate ?? new Date('2025-01-15'),
      updatedDate: params.data?.updatedDate ?? new Date('2025-01-15'),
      coverImage: params.data?.coverImage ?? 'https://placehold.co/1200x630',
      tags: params.data?.tags ?? [],
      draft: params.data?.draft ?? false,
    },
  } as BlogPost;
}

describe('relatedArticles utilities', () => {
  // ========================================
  // getRelatedPosts() テストケース
  // ========================================

  describe('getRelatedPosts', () => {
    // ========================================
    // 正常系テストケース
    // ========================================

    describe('正常系テストケース', () => {
      // TC-RA-001: 共通タグを持つ記事を関連記事として抽出する 🔵
      it('TC-RA-001: 共通タグを持つ記事を関連記事として抽出する', () => {
        // 【テスト目的】: 共通タグを持つ記事が関連記事として抽出されることを確認
        // 【テスト内容】: 複数のタグを持つ記事を渡し、共通タグのある記事のみが返されるか検証
        // 【期待される動作】: 共通タグを持つ記事のみを抽出し、共通タグがない記事は除外
        // 🔵 信頼性: REQ-701より

        // 【テストデータ準備】: 現在の記事と全記事リスト
        const currentPost = createMockPost({
          id: 'current-post',
          data: { tags: ['TypeScript', 'React'] },
        });

        const allPosts: BlogPost[] = [
          currentPost,
          createMockPost({
            id: 'post-1',
            data: { tags: ['TypeScript', 'Node.js'] },
          }),
          createMockPost({
            id: 'post-2',
            data: { tags: ['React', 'Next.js'] },
          }),
          createMockPost({
            id: 'post-3',
            data: { tags: ['Python'] },
          }),
        ];

        // 【実際の処理実行】: getRelatedPosts関数を呼び出し
        const result = getRelatedPosts(currentPost, allPosts);

        // 【結果検証】: 共通タグを持つ記事のみが返されることを確認
        // 🔵 信頼性: REQ-701より
        expect(result).toHaveLength(2);
        const slugs = result.map((r) => r.post.id);
        expect(slugs).toContain('post-1');
        expect(slugs).toContain('post-2');
        expect(slugs).not.toContain('post-3');
      });

      // TC-RA-002: 共通タグ数の多い順にソートされる 🔵
      it('TC-RA-002: 共通タグ数の多い順にソートされる', () => {
        // 【テスト目的】: 共通タグ数が多い記事が上位に表示されることを確認
        // 【テスト内容】: 異なる数の共通タグを持つ記事を渡し、スコア降順でソートされるか検証
        // 【期待される動作】: 共通タグ数が多い順にソート
        // 🔵 信頼性: REQ-701より

        // 【テストデータ準備】: 現在の記事と全記事リスト
        const currentPost = createMockPost({
          id: 'current-post',
          data: { tags: ['TypeScript', 'React', 'Testing'] },
        });

        const allPosts: BlogPost[] = [
          currentPost,
          createMockPost({
            id: 'post-1',
            data: { tags: ['TypeScript'] }, // 共通: 1
          }),
          createMockPost({
            id: 'post-2',
            data: { tags: ['TypeScript', 'React'] }, // 共通: 2
          }),
          createMockPost({
            id: 'post-3',
            data: { tags: ['TypeScript', 'React', 'Testing'] }, // 共通: 3
          }),
        ];

        // 【実際の処理実行】: getRelatedPosts関数を呼び出し
        const result = getRelatedPosts(currentPost, allPosts);

        // 【結果検証】: スコア降順でソートされることを確認
        // 🔵 信頼性: REQ-701より
        expect(result).toHaveLength(3);
        expect(result[0].post.id).toBe('post-3');
        expect(result[0].score).toBe(3);
        expect(result[1].post.id).toBe('post-2');
        expect(result[1].score).toBe(2);
        expect(result[2].post.id).toBe('post-1');
        expect(result[2].score).toBe(1);
      });

      // TC-RA-003: 現在の記事を除外する 🔵
      it('TC-RA-003: 現在の記事を除外する', () => {
        // 【テスト目的】: 現在表示中の記事が関連記事に含まれないことを確認
        // 【テスト内容】: 全記事リストに現在の記事を含め、結果から除外されるか検証
        // 【期待される動作】: 現在の記事は関連記事から除外
        // 🔵 信頼性: REQ-701より

        // 【テストデータ準備】: 現在の記事と全記事リスト
        const currentPost = createMockPost({
          id: 'current-post',
          data: { tags: ['TypeScript'] },
        });

        const allPosts: BlogPost[] = [
          currentPost,
          createMockPost({
            id: 'post-1',
            data: { tags: ['TypeScript'] },
          }),
        ];

        // 【実際の処理実行】: getRelatedPosts関数を呼び出し
        const result = getRelatedPosts(currentPost, allPosts);

        // 【結果検証】: 現在の記事が含まれないことを確認
        // 🔵 信頼性: REQ-701より
        expect(result).toHaveLength(1);
        expect(result[0].post.id).toBe('post-1');
        expect(result.find((r) => r.post.id === 'current-post')).toBeUndefined();
      });

      // TC-RA-004: 下書き記事を除外する 🔵
      it('TC-RA-004: 下書き記事を除外する', () => {
        // 【テスト目的】: draft: trueの記事が関連記事に含まれないことを確認
        // 【テスト内容】: 下書き記事を含む全記事リストを渡し、下書きが除外されるか検証
        // 【期待される動作】: draft: trueの記事は関連記事から除外
        // 🔵 信頼性: REQ-701、REQ-501より

        // 【テストデータ準備】: 現在の記事と全記事リスト
        const currentPost = createMockPost({
          id: 'current-post',
          data: { tags: ['TypeScript'] },
        });

        const allPosts: BlogPost[] = [
          currentPost,
          createMockPost({
            id: 'post-1',
            data: { tags: ['TypeScript'], draft: false },
          }),
          createMockPost({
            id: 'post-2',
            data: { tags: ['TypeScript'], draft: true },
          }),
        ];

        // 【実際の処理実行】: getRelatedPosts関数を呼び出し
        const result = getRelatedPosts(currentPost, allPosts);

        // 【結果検証】: 下書き記事が含まれないことを確認
        // 🔵 信頼性: REQ-701より
        expect(result).toHaveLength(1);
        expect(result[0].post.id).toBe('post-1');
        expect(result.find((r) => r.post.id === 'post-2')).toBeUndefined();
      });

      // TC-RA-005: 最大件数を制限する（デフォルト5件） 🔵
      it('TC-RA-005: 最大件数を制限する（デフォルト5件）', () => {
        // 【テスト目的】: デフォルトで最大5件まで関連記事を返すことを確認
        // 【テスト内容】: 10件の関連記事を持つデータを渡し、5件のみ返されるか検証
        // 【期待される動作】: デフォルトで最大5件を返す
        // 🔵 信頼性: REQ-701より

        // 【テストデータ準備】: 現在の記事と10件の関連記事
        const currentPost = createMockPost({
          id: 'current-post',
          data: { tags: ['TypeScript'] },
        });

        const allPosts: BlogPost[] = [
          currentPost,
          ...Array.from({ length: 10 }, (_, i) =>
            createMockPost({
              id: `post-${i + 1}`,
              data: { tags: ['TypeScript'] },
            }),
          ),
        ];

        // 【実際の処理実行】: getRelatedPosts関数を呼び出し
        const result = getRelatedPosts(currentPost, allPosts);

        // 【結果検証】: 最大5件が返されることを確認
        // 🔵 信頼性: REQ-701より
        expect(result).toHaveLength(5);
      });

      // TC-RA-006: 同点の場合は公開日が新しい順 🟡
      it('TC-RA-006: 同点の場合は公開日が新しい順', () => {
        // 【テスト目的】: 共通タグ数が同じ場合、公開日が新しい記事が上位に表示されることを確認
        // 【テスト内容】: 同じ共通タグ数で異なる公開日を持つ記事を渡し、公開日降順でソートされるか検証
        // 【期待される動作】: 同点の場合は公開日降順でソート
        // 🟡 信頼性: 要件定義書から妥当な推測

        // 【テストデータ準備】: 現在の記事と全記事リスト
        const currentPost = createMockPost({
          id: 'current-post',
          data: { tags: ['TypeScript'] },
        });

        const allPosts: BlogPost[] = [
          currentPost,
          createMockPost({
            id: 'post-1',
            data: { tags: ['TypeScript'], pubDate: new Date('2025-01-01') },
          }),
          createMockPost({
            id: 'post-2',
            data: { tags: ['TypeScript'], pubDate: new Date('2025-01-15') },
          }),
          createMockPost({
            id: 'post-3',
            data: { tags: ['TypeScript'], pubDate: new Date('2025-01-10') },
          }),
        ];

        // 【実際の処理実行】: getRelatedPosts関数を呼び出し
        const result = getRelatedPosts(currentPost, allPosts);

        // 【結果検証】: 公開日降順でソートされることを確認
        // 🟡 信頼性: 要件定義書より推測
        expect(result).toHaveLength(3);
        expect(result[0].post.id).toBe('post-2'); // 2025-01-15
        expect(result[1].post.id).toBe('post-3'); // 2025-01-10
        expect(result[2].post.id).toBe('post-1'); // 2025-01-01
      });
    });

    // ========================================
    // 境界値テストケース
    // ========================================

    describe('境界値テストケース', () => {
      // TC-RA-101: タグなし記事では空配列を返す 🔵
      it('TC-RA-101: タグなし記事では空配列を返す', () => {
        // 【テスト目的】: 現在の記事にタグがない場合、空配列を返すことを確認
        // 【テスト内容】: タグなしの記事を渡し、空配列が返されるか検証
        // 【期待される動作】: 共通タグを計算できないため空配列を返す
        // 🔵 信頼性: 要件定義書より

        // 【テストデータ準備】: タグなしの現在の記事
        const currentPost = createMockPost({
          id: 'current-post',
          data: { tags: [] },
        });

        const allPosts: BlogPost[] = [
          currentPost,
          createMockPost({
            id: 'post-1',
            data: { tags: ['TypeScript'] },
          }),
        ];

        // 【実際の処理実行】: getRelatedPosts関数を呼び出し
        const result = getRelatedPosts(currentPost, allPosts);

        // 【結果検証】: 空配列が返されることを確認
        // 🔵 信頼性: 要件定義書より
        expect(result).toEqual([]);
      });

      // TC-RA-102: 共通タグを持つ記事がない場合は空配列 🔵
      it('TC-RA-102: 共通タグを持つ記事がない場合は空配列', () => {
        // 【テスト目的】: 共通タグを持つ記事がない場合、空配列を返すことを確認
        // 【テスト内容】: 全く異なるタグを持つ記事を渡し、空配列が返されるか検証
        // 【期待される動作】: 共通タグがないため空配列を返す
        // 🔵 信頼性: 要件定義書より

        // 【テストデータ準備】: 現在の記事と全記事リスト
        const currentPost = createMockPost({
          id: 'current-post',
          data: { tags: ['TypeScript'] },
        });

        const allPosts: BlogPost[] = [
          currentPost,
          createMockPost({
            id: 'post-1',
            data: { tags: ['Python'] },
          }),
          createMockPost({
            id: 'post-2',
            data: { tags: ['Go'] },
          }),
        ];

        // 【実際の処理実行】: getRelatedPosts関数を呼び出し
        const result = getRelatedPosts(currentPost, allPosts);

        // 【結果検証】: 空配列が返されることを確認
        // 🔵 信頼性: 要件定義書より
        expect(result).toEqual([]);
      });

      // TC-RA-103: 記事が1件のみの場合は空配列 🔵
      it('TC-RA-103: 記事が1件のみの場合は空配列', () => {
        // 【テスト目的】: 全記事が1件（現在の記事のみ）の場合、空配列を返すことを確認
        // 【テスト内容】: 現在の記事のみを渡し、空配列が返されるか検証
        // 【期待される動作】: 関連記事がないため空配列を返す
        // 🔵 信頼性: 要件定義書より

        // 【テストデータ準備】: 現在の記事のみ
        const currentPost = createMockPost({
          id: 'current-post',
          data: { tags: ['TypeScript'] },
        });

        const allPosts: BlogPost[] = [currentPost];

        // 【実際の処理実行】: getRelatedPosts関数を呼び出し
        const result = getRelatedPosts(currentPost, allPosts);

        // 【結果検証】: 空配列が返されることを確認
        // 🔵 信頼性: 要件定義書より
        expect(result).toEqual([]);
      });

      // TC-RA-104: maxItems=0の場合は空配列 🟡
      it('TC-RA-104: maxItems=0の場合は空配列', () => {
        // 【テスト目的】: maxItems=0が指定された場合、空配列を返すことを確認
        // 【テスト内容】: maxItems=0を渡し、空配列が返されるか検証
        // 【期待される動作】: 0件を要求されたため空配列を返す
        // 🟡 信頼性: 要件定義書から妥当な推測

        // 【テストデータ準備】: 現在の記事と全記事リスト
        const currentPost = createMockPost({
          id: 'current-post',
          data: { tags: ['TypeScript'] },
        });

        const allPosts: BlogPost[] = [
          currentPost,
          createMockPost({
            id: 'post-1',
            data: { tags: ['TypeScript'] },
          }),
        ];

        // 【実際の処理実行】: getRelatedPosts関数を呼び出し
        const result = getRelatedPosts(currentPost, allPosts, { maxItems: 0 });

        // 【結果検証】: 空配列が返されることを確認
        // 🟡 信頼性: 要件定義書より推測
        expect(result).toEqual([]);
      });

      // TC-RA-105: maxItemsでカスタム件数を指定 🔵
      it('TC-RA-105: maxItemsでカスタム件数を指定', () => {
        // 【テスト目的】: maxItemsで指定した件数だけ関連記事を返すことを確認
        // 【テスト内容】: maxItems=3を渡し、3件のみ返されるか検証
        // 【期待される動作】: 指定した件数を返す
        // 🔵 信頼性: REQ-701より

        // 【テストデータ準備】: 現在の記事と10件の関連記事
        const currentPost = createMockPost({
          id: 'current-post',
          data: { tags: ['TypeScript'] },
        });

        const allPosts: BlogPost[] = [
          currentPost,
          ...Array.from({ length: 10 }, (_, i) =>
            createMockPost({
              id: `post-${i + 1}`,
              data: { tags: ['TypeScript'] },
            }),
          ),
        ];

        // 【実際の処理実行】: getRelatedPosts関数を呼び出し
        const result = getRelatedPosts(currentPost, allPosts, { maxItems: 3 });

        // 【結果検証】: 3件が返されることを確認
        // 🔵 信頼性: REQ-701より
        expect(result).toHaveLength(3);
      });
    });

    // ========================================
    // 異常系テストケース
    // ========================================

    describe('異常系テストケース', () => {
      // TC-RA-201: allPostsが空配列の場合は空配列を返す 🔵
      it('TC-RA-201: allPostsが空配列の場合は空配列を返す', () => {
        // 【テスト目的】: 全記事リストが空の場合、エラーなく空配列を返すことを確認
        // 【テスト内容】: 空の全記事リストを渡し、空配列が返されるか検証
        // 【期待される動作】: エラーなく空配列を返す
        // 🔵 信頼性: 要件定義書より

        // 【テストデータ準備】: 現在の記事と空の全記事リスト
        const currentPost = createMockPost({
          id: 'current-post',
          data: { tags: ['TypeScript'] },
        });

        const allPosts: BlogPost[] = [];

        // 【実際の処理実行】: getRelatedPosts関数を呼び出し
        const result = getRelatedPosts(currentPost, allPosts);

        // 【結果検証】: 空配列が返されることを確認
        // 🔵 信頼性: 要件定義書より
        expect(result).toEqual([]);
      });

      // TC-RA-202: maxItemsが負数の場合は空配列を返す 🟡
      it('TC-RA-202: maxItemsが負数の場合は空配列を返す', () => {
        // 【テスト目的】: maxItemsが負数の場合、エラーなく空配列を返すことを確認
        // 【テスト内容】: maxItems=-1を渡し、空配列が返されるか検証
        // 【期待される動作】: エラーなく空配列を返す
        // 🟡 信頼性: 要件定義書から妥当な推測

        // 【テストデータ準備】: 現在の記事と全記事リスト
        const currentPost = createMockPost({
          id: 'current-post',
          data: { tags: ['TypeScript'] },
        });

        const allPosts: BlogPost[] = [
          currentPost,
          createMockPost({
            id: 'post-1',
            data: { tags: ['TypeScript'] },
          }),
        ];

        // 【実際の処理実行】: getRelatedPosts関数を呼び出し
        const result = getRelatedPosts(currentPost, allPosts, { maxItems: -1 });

        // 【結果検証】: 空配列が返されることを確認
        // 🟡 信頼性: 要件定義書より推測
        expect(result).toEqual([]);
      });

      // TC-RA-203: 共通タグ情報を正しく返す 🔵
      it('TC-RA-203: 共通タグ情報を正しく返す', () => {
        // 【テスト目的】: 各関連記事の共通タグ情報が正しく返されることを確認
        // 【テスト内容】: 共通タグを持つ記事を渡し、commonTagsが正しく設定されるか検証
        // 【期待される動作】: commonTagsに共通タグのリストが設定される
        // 🔵 信頼性: 要件定義書より

        // 【テストデータ準備】: 現在の記事と全記事リスト
        const currentPost = createMockPost({
          id: 'current-post',
          data: { tags: ['TypeScript', 'React'] },
        });

        const allPosts: BlogPost[] = [
          currentPost,
          createMockPost({
            id: 'post-1',
            data: { tags: ['TypeScript', 'Node.js'] },
          }),
        ];

        // 【実際の処理実行】: getRelatedPosts関数を呼び出し
        const result = getRelatedPosts(currentPost, allPosts);

        // 【結果検証】: 共通タグ情報が正しく返されることを確認
        // 🔵 信頼性: 要件定義書より
        expect(result).toHaveLength(1);
        expect(result[0].post.id).toBe('post-1');
        expect(result[0].score).toBe(1);
        expect(result[0].commonTags).toEqual(['TypeScript']);
      });
    });
  });
});
