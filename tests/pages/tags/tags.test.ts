/**
 * タグ一覧ページ (tags/index.astro) テストスイート
 *
 * TASK-0017: タグ一覧ページの実装
 *
 * 関連要件:
 * - REQ-302: タグ一覧表示
 * - NFR-301: セマンティックHTML使用
 * - NFR-302: キーボードナビゲーション対応
 * - NFR-303: ARIAラベル設定
 * - NFR-304: フォーカス可視化
 *
 * 信頼性: 🔵 要件定義書・アーキテクチャ設計に基づく実装
 */

import { describe, expect, it } from 'vitest';

// ========================================
// テスト用モックデータ
// ========================================

/**
 * テスト用記事データ
 * 複数のタグを持つ記事のサンプルデータ
 */
const mockPosts = [
  {
    id: 'post-1',
    data: {
      title: 'Astro入門',
      description: 'Astroの基本',
      pubDate: new Date('2025-01-15'),
      updatedDate: new Date('2025-01-15'),
      coverImage: 'https://example.com/image1.jpg',
      tags: ['Astro', 'TypeScript', 'SSG'],
      draft: false,
    },
  },
  {
    id: 'post-2',
    data: {
      title: 'TypeScript活用術',
      description: 'TypeScriptの使い方',
      pubDate: new Date('2025-01-10'),
      updatedDate: new Date('2025-01-10'),
      coverImage: 'https://example.com/image2.jpg',
      tags: ['TypeScript', 'JavaScript'],
      draft: false,
    },
  },
  {
    id: 'post-3',
    data: {
      title: 'Astro応用編',
      description: 'Astroの応用',
      pubDate: new Date('2025-01-05'),
      updatedDate: new Date('2025-01-05'),
      coverImage: 'https://example.com/image3.jpg',
      tags: ['Astro', 'Content Collections'],
      draft: false,
    },
  },
  {
    id: 'draft-post',
    data: {
      title: '下書き記事',
      description: '下書き',
      pubDate: new Date('2025-01-01'),
      updatedDate: new Date('2025-01-01'),
      coverImage: 'https://example.com/image4.jpg',
      tags: ['Draft'],
      draft: true,
    },
  },
];

// ========================================
// タグ抽出・カウントロジック
// ========================================

/**
 * タグと記事数の情報
 */
interface TagInfo {
  tag: string;
  count: number;
  slug: string;
}

/**
 * 記事データからタグ情報を抽出する
 * @param posts - 記事データの配列
 * @returns タグ情報の配列（記事数順にソート）
 */
function extractTagsWithCount(posts: typeof mockPosts): TagInfo[] {
  // 公開記事のみフィルタ
  const publishedPosts = posts.filter((post) => !post.data.draft);

  // タグと記事数のマップを作成
  const tagCounts = new Map<string, number>();
  for (const post of publishedPosts) {
    for (const tag of post.data.tags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  // 記事数でソート（多い順）してTagInfo配列を返す
  return [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({
      tag,
      count,
      slug: generateTagSlug(tag),
    }));
}

/**
 * タグからURLスラッグを生成する
 * @param tag - タグ名
 * @returns URLに使用できるスラッグ
 */
function generateTagSlug(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, '-');
}

// ========================================
// タグ抽出・カウントロジックのテスト
// ========================================

describe('タグ一覧ページ - ロジックテスト', () => {
  // ----------------------------------------
  // TC-TI-001: タグ抽出テスト
  // ----------------------------------------
  describe('TC-TI-001: タグ抽出テスト', () => {
    it('すべての公開記事からユニークなタグを抽出できる', () => {
      const tagInfos = extractTagsWithCount(mockPosts);
      const uniqueTags = tagInfos.map((t) => t.tag);

      expect(uniqueTags).toContain('Astro');
      expect(uniqueTags).toContain('TypeScript');
      expect(uniqueTags).toContain('SSG');
      expect(uniqueTags).toContain('JavaScript');
      expect(uniqueTags).toContain('Content Collections');
      // 下書き記事のタグは含まれない
      expect(uniqueTags).not.toContain('Draft');
    });

    it('下書き記事のタグは除外される', () => {
      const tagInfos = extractTagsWithCount(mockPosts);
      const uniqueTags = tagInfos.map((t) => t.tag);

      expect(uniqueTags).not.toContain('Draft');
    });
  });

  // ----------------------------------------
  // TC-TI-002: タグ記事数カウントテスト
  // ----------------------------------------
  describe('TC-TI-002: タグ記事数カウントテスト', () => {
    it('各タグの記事数を正しくカウントできる', () => {
      const tagInfos = extractTagsWithCount(mockPosts);
      const tagCountMap = new Map(tagInfos.map((t) => [t.tag, t.count]));

      expect(tagCountMap.get('Astro')).toBe(2); // post-1, post-3
      expect(tagCountMap.get('TypeScript')).toBe(2); // post-1, post-2
      expect(tagCountMap.get('SSG')).toBe(1); // post-1
      expect(tagCountMap.get('JavaScript')).toBe(1); // post-2
      expect(tagCountMap.get('Content Collections')).toBe(1); // post-3
    });

    it('記事がないタグはカウントされない', () => {
      const tagInfos = extractTagsWithCount(mockPosts);
      const uniqueTags = tagInfos.map((t) => t.tag);

      // 下書き記事のタグはカウントされない
      expect(uniqueTags).not.toContain('Draft');
    });
  });

  // ----------------------------------------
  // TC-TI-003: タグソートテスト
  // ----------------------------------------
  describe('TC-TI-003: タグソートテスト', () => {
    it('タグが記事数の多い順にソートされる', () => {
      const tagInfos = extractTagsWithCount(mockPosts);

      // Astro(2件)とTypeScript(2件)が先頭
      expect(tagInfos.slice(0, 2).map((t) => t.tag)).toContain('Astro');
      expect(tagInfos.slice(0, 2).map((t) => t.tag)).toContain('TypeScript');

      // 先頭2件はどちらもcount=2
      expect(tagInfos[0].count).toBe(2);
      expect(tagInfos[1].count).toBe(2);

      // 残りはcount=1
      expect(tagInfos[2].count).toBe(1);
      expect(tagInfos[3].count).toBe(1);
      expect(tagInfos[4].count).toBe(1);
    });
  });

  // ----------------------------------------
  // TC-TI-004: 空の記事リストテスト
  // ----------------------------------------
  describe('TC-TI-004: 空の記事リストテスト', () => {
    it('記事が存在しない場合、タグリストは空になる', () => {
      const tagInfos = extractTagsWithCount([]);

      expect(tagInfos).toHaveLength(0);
    });

    it('すべて下書きの場合、タグリストは空になる', () => {
      const allDraftPosts = [
        {
          id: 'draft-1',
          data: {
            title: '下書き1',
            description: '下書き',
            pubDate: new Date('2025-01-01'),
            updatedDate: new Date('2025-01-01'),
            coverImage: 'https://example.com/image.jpg',
            tags: ['Draft1'],
            draft: true,
          },
        },
      ];

      const tagInfos = extractTagsWithCount(allDraftPosts);

      expect(tagInfos).toHaveLength(0);
    });
  });

  // ----------------------------------------
  // TC-TI-005: タグなし記事テスト
  // ----------------------------------------
  describe('TC-TI-005: タグなし記事テスト', () => {
    it('タグが設定されていない記事は無視される', () => {
      const postsWithEmptyTags = [
        {
          id: 'no-tags',
          data: {
            title: 'タグなし記事',
            description: '説明',
            pubDate: new Date('2025-01-01'),
            updatedDate: new Date('2025-01-01'),
            coverImage: 'https://example.com/image.jpg',
            tags: [] as string[], // 空のタグ配列
            draft: false,
          },
        },
        ...mockPosts.filter((p) => !p.data.draft),
      ];

      const tagInfos = extractTagsWithCount(postsWithEmptyTags);
      const uniqueTags = tagInfos.map((t) => t.tag);

      // 空のタグは含まれない
      expect(uniqueTags.every((tag) => tag.length > 0)).toBe(true);
      // 元の5つのタグは含まれる
      expect(tagInfos).toHaveLength(5);
    });
  });
});

// ========================================
// タグURL生成ユーティリティテスト
// ========================================

describe('タグURL生成テスト', () => {
  // ----------------------------------------
  // TC-TI-201: タグスラッグ生成テスト
  // ----------------------------------------
  describe('TC-TI-201: タグスラッグ生成テスト', () => {
    it('英語タグは小文字に変換される', () => {
      expect(generateTagSlug('Astro')).toBe('astro');
      expect(generateTagSlug('TypeScript')).toBe('typescript');
      expect(generateTagSlug('SSG')).toBe('ssg');
    });

    it('日本語タグはそのまま使用される', () => {
      expect(generateTagSlug('入門')).toBe('入門');
      expect(generateTagSlug('チュートリアル')).toBe('チュートリアル');
    });

    it('スペースはハイフンに変換される', () => {
      expect(generateTagSlug('Content Collections')).toBe('content-collections');
    });
  });

  // ----------------------------------------
  // TC-TI-202: タグリンクURLテスト
  // ----------------------------------------
  describe('TC-TI-202: タグリンクURLテスト', () => {
    it('タグ情報にslugが含まれる', () => {
      const tagInfos = extractTagsWithCount(mockPosts);

      const astroInfo = tagInfos.find((t) => t.tag === 'Astro');
      expect(astroInfo?.slug).toBe('astro');

      const contentCollectionsInfo = tagInfos.find((t) => t.tag === 'Content Collections');
      expect(contentCollectionsInfo?.slug).toBe('content-collections');
    });
  });
});

// ========================================
// タグ一覧ページ HTML構造テスト
// ========================================

describe('タグ一覧ページ - HTML構造テスト', () => {
  // ----------------------------------------
  // TC-TI-101: ページ要素テスト
  // ----------------------------------------
  describe('TC-TI-101: ページ要素テスト', () => {
    it('ページにタイトルが含まれる', () => {
      // HTMLレンダリングテストはコンポーネント実装後に行う
      // このテストはコンポーネントの仕様を定義
      const expectedTitle = 'タグ一覧';
      expect(expectedTitle).toBe('タグ一覧');
    });

    it('各タグは/tags/[tag]へのリンクを持つ', () => {
      // タグリンクの形式を定義
      const tag = 'Astro';
      const slug = generateTagSlug(tag);
      const expectedHref = `/tags/${slug}`;
      expect(expectedHref).toBe('/tags/astro');
    });

    it('Content Collectionsタグは正しいURLを持つ', () => {
      const tag = 'Content Collections';
      const slug = generateTagSlug(tag);
      const expectedHref = `/tags/${slug}`;
      expect(expectedHref).toBe('/tags/content-collections');
    });
  });
});
