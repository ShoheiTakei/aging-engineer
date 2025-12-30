import { defineCollection, z } from 'astro:content';

/**
 * ブログ記事コレクション定義
 * 🔵 信頼性: architecture.md・interfaces.tsより
 */
const blogCollection = defineCollection({
	type: 'content',
	schema: z.object({
		// REQ-001: 必須フィールド
		title: z.string().min(1, 'タイトルは必須です'),
		description: z.string().min(1, '説明は必須です'),
		pubDate: z.date(),

		// REQ-001: 任意フィールド
		updatedDate: z.date().optional(),
		coverImage: z.string().url().optional(),

		// REQ-301: タグ機能
		tags: z.array(z.string()).default([]),

		// REQ-501: 下書き機能
		draft: z.boolean().default(false),
	}),
});

export const collections = {
	blog: blogCollection,
};
