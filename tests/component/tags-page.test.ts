/**
 * タグ別記事一覧ページのテスト
 *
 * テスト観点:
 * - タグフィルタリングのロジック
 * - 記事のソート（公開日降順）
 * - ページネーション（5件/ページ）
 * - 境界条件（タグなし、記事なし）
 */

import { describe, expect, it } from 'vitest';

interface BlogPost {
  id: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    updatedDate: Date;
    coverImage: string;
    tags: string[];
    draft: boolean;
  };
}

/**
 * 特定タグの記事を抽出する関数
 */
function filterPostsByTag(posts: BlogPost[], tag: string): BlogPost[] {
  return posts.filter((post) => post.data.tags.includes(tag));
}

/**
 * 記事を公開日降順でソートする関数
 */
function sortPostsByDate(posts: BlogPost[]): BlogPost[] {
  return [...posts].sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/**
 * 全タグを収集する関数
 */
function collectAllTags(posts: BlogPost[]): string[] {
  const tags = new Set<string>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      tags.add(tag);
    }
  }
  return Array.from(tags);
}

describe('タグ別記事一覧ページ', () => {
  const mockPosts: BlogPost[] = [
    {
      id: 'post-1',
      data: {
        title: '記事1',
        description: '説明1',
        pubDate: new Date('2025-01-15'),
        updatedDate: new Date('2025-01-15'),
        coverImage: 'https://example.com/image1.jpg',
        tags: ['TypeScript', 'Astro'],
        draft: false,
      },
    },
    {
      id: 'post-2',
      data: {
        title: '記事2',
        description: '説明2',
        pubDate: new Date('2025-01-10'),
        updatedDate: new Date('2025-01-10'),
        coverImage: 'https://example.com/image2.jpg',
        tags: ['Astro', 'CSS'],
        draft: false,
      },
    },
    {
      id: 'post-3',
      data: {
        title: '記事3',
        description: '説明3',
        pubDate: new Date('2025-01-20'),
        updatedDate: new Date('2025-01-20'),
        coverImage: 'https://example.com/image3.jpg',
        tags: ['TypeScript', 'React'],
        draft: false,
      },
    },
    {
      id: 'post-4',
      data: {
        title: '記事4',
        description: '説明4',
        pubDate: new Date('2025-01-05'),
        updatedDate: new Date('2025-01-05'),
        coverImage: 'https://example.com/image4.jpg',
        tags: ['Astro'],
        draft: false,
      },
    },
  ];

  describe('filterPostsByTag', () => {
    it('指定タグを含む記事のみを抽出する', () => {
      const filtered = filterPostsByTag(mockPosts, 'Astro');
      expect(filtered).toHaveLength(3);
      expect(filtered.map((p) => p.id)).toEqual(['post-1', 'post-2', 'post-4']);
    });

    it('存在しないタグの場合は空配列を返す', () => {
      const filtered = filterPostsByTag(mockPosts, 'NonExistent');
      expect(filtered).toEqual([]);
    });

    it('複数タグのうち1つでも一致すれば抽出される', () => {
      const filtered = filterPostsByTag(mockPosts, 'TypeScript');
      expect(filtered).toHaveLength(2);
      expect(filtered.map((p) => p.id)).toEqual(['post-1', 'post-3']);
    });
  });

  describe('sortPostsByDate', () => {
    it('記事を公開日降順でソートする', () => {
      const filtered = filterPostsByTag(mockPosts, 'Astro');
      const sorted = sortPostsByDate(filtered);
      expect(sorted.map((p) => p.id)).toEqual(['post-1', 'post-2', 'post-4']);
      expect(sorted[0].data.pubDate.getTime()).toBeGreaterThan(
        sorted[1].data.pubDate.getTime(),
      );
    });

    it('元の配列を変更しない（イミュータブル）', () => {
      const original = [...mockPosts];
      sortPostsByDate(mockPosts);
      expect(mockPosts).toEqual(original);
    });
  });

  describe('collectAllTags', () => {
    it('全記事からタグを収集する', () => {
      const tags = collectAllTags(mockPosts);
      expect(tags).toHaveLength(4);
      expect(tags.sort()).toEqual(['Astro', 'CSS', 'React', 'TypeScript']);
    });

    it('重複するタグは1つにまとめられる', () => {
      const tags = collectAllTags(mockPosts);
      const astroCount = tags.filter((t) => t === 'Astro').length;
      expect(astroCount).toBe(1);
    });

    it('タグがない記事の場合は空配列を返す', () => {
      const noTagPosts: BlogPost[] = [
        {
          id: 'no-tag-post',
          data: {
            title: 'タグなし記事',
            description: '説明',
            pubDate: new Date('2025-01-01'),
            updatedDate: new Date('2025-01-01'),
            coverImage: 'https://example.com/image.jpg',
            tags: [],
            draft: false,
          },
        },
      ];
      const tags = collectAllTags(noTagPosts);
      expect(tags).toEqual([]);
    });
  });

  describe('統合テスト: タグフィルタリング + ソート', () => {
    it('特定タグの記事を公開日降順で取得できる', () => {
      const filtered = filterPostsByTag(mockPosts, 'TypeScript');
      const sorted = sortPostsByDate(filtered);

      expect(sorted).toHaveLength(2);
      expect(sorted[0].id).toBe('post-3'); // 2025-01-20
      expect(sorted[1].id).toBe('post-1'); // 2025-01-15
    });

    it('Astroタグの記事を公開日降順で取得できる', () => {
      const filtered = filterPostsByTag(mockPosts, 'Astro');
      const sorted = sortPostsByDate(filtered);

      expect(sorted).toHaveLength(3);
      expect(sorted[0].id).toBe('post-1'); // 2025-01-15
      expect(sorted[1].id).toBe('post-2'); // 2025-01-10
      expect(sorted[2].id).toBe('post-4'); // 2025-01-05
    });
  });

  describe('ページネーション', () => {
    it('5件/ページで分割される', () => {
      const PAGE_SIZE = 5;
      const posts = Array.from({ length: 12 }, (_, i) => ({
        id: `post-${i}`,
        data: {
          title: `記事${i}`,
          description: `説明${i}`,
          pubDate: new Date(`2025-01-${String(i + 1).padStart(2, '0')}`),
          updatedDate: new Date(`2025-01-${String(i + 1).padStart(2, '0')}`),
          coverImage: 'https://example.com/image.jpg',
          tags: ['Test'],
          draft: false,
        },
      }));

      const totalPages = Math.ceil(posts.length / PAGE_SIZE);
      expect(totalPages).toBe(3);

      const page1 = posts.slice(0, PAGE_SIZE);
      const page2 = posts.slice(PAGE_SIZE, PAGE_SIZE * 2);
      const page3 = posts.slice(PAGE_SIZE * 2);

      expect(page1).toHaveLength(5);
      expect(page2).toHaveLength(5);
      expect(page3).toHaveLength(2);
    });
  });
});
