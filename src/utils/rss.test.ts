import { describe, expect, it } from 'vitest';
import {
  type BlogEntry,
  type RssItem,
  SITE_CONFIG,
  buildRssItem,
  filterPublishedPosts,
  sortPostsByDate,
} from './rss';

describe('RSS Feed生成ユーティリティ', () => {
  // テスト用のモックデータ
  const mockPosts: BlogEntry[] = [
    {
      id: 'first-post',
      data: {
        title: '最初の記事',
        description: 'これは最初の記事です',
        pubDate: new Date('2025-01-15'),
        updatedDate: new Date('2025-01-15'),
        coverImage: 'https://example.com/image1.webp',
        tags: ['TypeScript', 'Astro'],
        draft: false,
      },
    },
    {
      id: 'second-post',
      data: {
        title: '2番目の記事',
        description: 'これは2番目の記事です',
        pubDate: new Date('2025-01-20'),
        updatedDate: new Date('2025-01-20'),
        coverImage: 'https://example.com/image2.webp',
        tags: ['JavaScript'],
        draft: false,
      },
    },
    {
      id: 'draft-post',
      data: {
        title: '下書き記事',
        description: 'これは下書きの記事です',
        pubDate: new Date('2025-01-25'),
        updatedDate: new Date('2025-01-25'),
        coverImage: 'https://example.com/image3.webp',
        tags: ['Draft'],
        draft: true,
      },
    },
    {
      id: 'old-post',
      data: {
        title: '古い記事',
        description: 'これは古い記事です',
        pubDate: new Date('2024-12-01'),
        updatedDate: new Date('2024-12-01'),
        coverImage: 'https://example.com/image4.webp',
        tags: ['Old'],
        draft: false,
      },
    },
  ];

  describe('filterPublishedPosts', () => {
    it('下書き記事を除外すること', () => {
      const result = filterPublishedPosts(mockPosts);

      expect(result).toHaveLength(3);
      expect(result.some((post) => post.id === 'draft-post')).toBe(false);
    });

    it('公開記事のみを返すこと', () => {
      const result = filterPublishedPosts(mockPosts);

      for (const post of result) {
        expect(post.data.draft).toBe(false);
      }
    });

    it('空の配列を渡した場合は空の配列を返すこと', () => {
      const result = filterPublishedPosts([]);

      expect(result).toHaveLength(0);
    });

    it('全て下書きの場合は空の配列を返すこと', () => {
      const allDrafts: BlogEntry[] = [
        {
          id: 'draft-1',
          data: {
            title: 'Draft 1',
            description: 'Draft description',
            pubDate: new Date(),
            updatedDate: new Date(),
            coverImage: '',
            tags: [],
            draft: true,
          },
        },
      ];

      const result = filterPublishedPosts(allDrafts);

      expect(result).toHaveLength(0);
    });
  });

  describe('sortPostsByDate', () => {
    it('公開日の新しい順にソートすること', () => {
      const publishedPosts = filterPublishedPosts(mockPosts);
      const result = sortPostsByDate(publishedPosts);

      expect(result[0].id).toBe('second-post'); // 2025-01-20
      expect(result[1].id).toBe('first-post'); // 2025-01-15
      expect(result[2].id).toBe('old-post'); // 2024-12-01
    });

    it('空の配列を渡した場合は空の配列を返すこと', () => {
      const result = sortPostsByDate([]);

      expect(result).toHaveLength(0);
    });

    it('1件のみの場合はそのまま返すこと', () => {
      const singlePost = [mockPosts[0]];
      const result = sortPostsByDate(singlePost);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('first-post');
    });
  });

  describe('buildRssItem', () => {
    it('RSSアイテムを正しく構築すること', () => {
      const post = mockPosts[0];
      const result = buildRssItem(post);

      expect(result).toEqual({
        title: '最初の記事',
        description: 'これは最初の記事です',
        pubDate: new Date('2025-01-15'),
        link: '/blog/first-post/',
      } satisfies RssItem);
    });

    it('記事のリンクが正しい形式であること', () => {
      const post = mockPosts[1];
      const result = buildRssItem(post);

      expect(result.link).toBe('/blog/second-post/');
    });

    it('下書き記事でもRSSアイテムを構築できること（フィルタリングは別関数で行う）', () => {
      const draftPost = mockPosts[2];
      const result = buildRssItem(draftPost);

      expect(result.title).toBe('下書き記事');
      expect(result.link).toBe('/blog/draft-post/');
    });
  });

  describe('SITE_CONFIG', () => {
    it('サイト設定が正しく定義されていること', () => {
      expect(SITE_CONFIG).toHaveProperty('title');
      expect(SITE_CONFIG).toHaveProperty('description');
      expect(SITE_CONFIG).toHaveProperty('site');

      expect(typeof SITE_CONFIG.title).toBe('string');
      expect(typeof SITE_CONFIG.description).toBe('string');
      expect(typeof SITE_CONFIG.site).toBe('string');
    });

    it('サイトURLがhttpsで始まること', () => {
      expect(SITE_CONFIG.site).toMatch(/^https:\/\//);
    });
  });
});
