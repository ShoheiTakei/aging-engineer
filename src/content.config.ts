import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * ブログ記事コレクション定義
 * 🔵 信頼性: architecture.md・interfaces.tsより
 * Astro v5 Content Layer API対応
 */
const blogCollection = defineCollection({
	loader: glob({
		base: './src/content/blog',
		pattern: '**/[^_]*.{md,mdx}',
	}),
	schema: z
		.object({
			// REQ-001: 必須フィールド
			title: z.string().min(1, 'タイトルは必須です'),
			description: z.string().min(1, '説明は必須です'),
			pubDate: z.date(),

			// REQ-001: 任意フィールド（optional → デフォルト値へ移行）
			updatedDate: z.date().optional(), // transform で pubDate をデフォルトに
			coverImage: z
				.string()
				.url()
				.default('https://placehold.co/1200x630'), // プレースホルダー画像

			// REQ-301: タグ機能
			tags: z.array(z.string()).default([]),

			// REQ-501: 下書き機能
			draft: z.boolean().default(false),
		})
		.transform((data) => ({
			...data,
			// updatedDate が未指定の場合は pubDate をデフォルトに
			updatedDate: data.updatedDate ?? data.pubDate,
		})),
});

export const collections = {
	blog: blogCollection,
};
