/**
 * 検索インデックスJSON生成エンドポイント
 *
 * ビルド時に全ブログ記事から検索インデックスを生成し、
 * /search-index.json として出力する
 *
 * 要件:
 * - REQ-401: 記事検索機能（タイトル・本文から全文検索、部分一致）
 * - NFR-001: Lighthouse 90+点維持（外部ライブラリ不使用）
 */

import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { generateSearchIndex } from '../utils/search';

export const GET: APIRoute = async () => {
  // 全ブログ記事を取得（下書きを除外）
  const allPosts = await getCollection('blog', ({ data }) => !data.draft);

  // 本文を取得
  const postsWithBody = allPosts.map((post) => {
    // Markdownの本文をプレーンテキストとして取得
    const body = post.body || '';

    return {
      slug: post.id,
      data: {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        tags: post.data.tags,
        draft: post.data.draft,
      },
      body,
    };
  });

  // 検索インデックスを生成
  const searchIndex = generateSearchIndex(postsWithBody, { bodyLength: 500 });

  return new Response(JSON.stringify(searchIndex), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      // キャッシュヘッダー: 静的サイトなのでビルド時のみ更新
      'Cache-Control': 'public, max-age=31536000',
    },
  });
};
