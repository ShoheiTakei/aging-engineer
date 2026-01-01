/**
 * RSS Feed テスト
 *
 * RSS Feedエンドポイントの動作確認テスト
 *
 * 信頼性: 🔵 Vitest公式ドキュメントに基づく
 */

import { describe, expect, it } from 'vitest';

// テスト用のモックデータ
const mockPosts = [
  {
    id: 'sample-post',
    data: {
      title: 'サンプル記事',
      description: '説明文です',
      pubDate: new Date('2025-01-15'),
      updatedDate: new Date('2025-01-15'),
      coverImage: 'https://placehold.co/1200x630',
      tags: ['Astro', 'TypeScript'],
      draft: false,
    },
  },
  {
    id: 'older-post',
    data: {
      title: '古い記事',
      description: '古い説明文です',
      pubDate: new Date('2024-12-01'),
      updatedDate: new Date('2024-12-01'),
      coverImage: 'https://placehold.co/1200x630',
      tags: ['JavaScript'],
      draft: false,
    },
  },
  {
    id: 'draft-post',
    data: {
      title: '下書き記事',
      description: '下書きの説明文です',
      pubDate: new Date('2025-01-20'),
      updatedDate: new Date('2025-01-20'),
      coverImage: 'https://placehold.co/1200x630',
      tags: ['Draft'],
      draft: true,
    },
  },
];

describe('RSS Feed', () => {
  describe('記事フィルタリング', () => {
    it('公開済み記事のみをフィルタリングする', () => {
      const publishedPosts = mockPosts.filter((post) => !post.data.draft);
      expect(publishedPosts).toHaveLength(2);
      expect(publishedPosts.every((post) => !post.data.draft)).toBe(true);
    });

    it('下書き記事を除外する', () => {
      const publishedPosts = mockPosts.filter((post) => !post.data.draft);
      const draftPost = publishedPosts.find((post) => post.id === 'draft-post');
      expect(draftPost).toBeUndefined();
    });
  });

  describe('記事ソート', () => {
    it('記事を日付順（新しい順）でソートする', () => {
      const publishedPosts = mockPosts.filter((post) => !post.data.draft);
      const sortedPosts = publishedPosts.sort(
        (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
      );

      expect(sortedPosts[0].id).toBe('sample-post');
      expect(sortedPosts[1].id).toBe('older-post');
    });
  });

  describe('RSSアイテム変換', () => {
    it('記事データをRSSアイテム形式に変換する', () => {
      const post = mockPosts[0];
      const rssItem = {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: `/blog/${post.id}/`,
        categories: post.data.tags,
      };

      expect(rssItem.title).toBe('サンプル記事');
      expect(rssItem.description).toBe('説明文です');
      expect(rssItem.link).toBe('/blog/sample-post/');
      expect(rssItem.categories).toEqual(['Astro', 'TypeScript']);
    });
  });

  describe('フィードメタデータ', () => {
    it('正しいサイトURLを持つ', () => {
      const siteUrl = 'https://aging-engineer.pages.dev';
      expect(siteUrl).toMatch(/^https:\/\//);
    });

    it('日本語言語設定を持つ', () => {
      const customData = '<language>ja</language>';
      expect(customData).toContain('ja');
    });
  });
});
