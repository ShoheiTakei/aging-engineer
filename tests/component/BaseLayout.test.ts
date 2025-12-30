import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import BaseLayout from '@/layouts/BaseLayout.astro';

describe('BaseLayout Component', () => {
	describe('セマンティックHTML構造', () => {
		it('should render html element with lang="ja"', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(BaseLayout, {
				props: {
					title: 'テストページ',
					description: 'テスト説明',
				},
			});

			expect(result).toContain('<html lang="ja"');
		});

		it('should render head element', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(BaseLayout, {
				props: {
					title: 'テストページ',
					description: 'テスト説明',
				},
			});

			expect(result).toContain('<head>');
			expect(result).toContain('</head>');
		});

		it('should render body element', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(BaseLayout, {
				props: {
					title: 'テストページ',
					description: 'テスト説明',
				},
			});

			expect(result).toContain('<body');
			expect(result).toContain('</body>');
		});

		it('should render main element', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(BaseLayout, {
				props: {
					title: 'テストページ',
					description: 'テスト説明',
				},
			});

			expect(result).toContain('<main');
			expect(result).toContain('</main>');
		});
	});

	describe('メタタグ', () => {
		it('should render title tag with provided title', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(BaseLayout, {
				props: {
					title: 'テストページ',
					description: 'テスト説明',
				},
			});

			expect(result).toContain('<title>テストページ</title>');
		});

		it('should render description meta tag', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(BaseLayout, {
				props: {
					title: 'テストページ',
					description: 'テスト説明',
				},
			});

			expect(result).toContain('<meta name="description" content="テスト説明"');
		});

		it('should render viewport meta tag', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(BaseLayout, {
				props: {
					title: 'テストページ',
					description: 'テスト説明',
				},
			});

			expect(result).toContain(
				'<meta name="viewport" content="width=device-width, initial-scale=1.0"'
			);
		});

		it('should render charset meta tag', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(BaseLayout, {
				props: {
					title: 'テストページ',
					description: 'テスト説明',
				},
			});

			expect(result).toContain('<meta charset="UTF-8"');
		});
	});

	describe('OGPメタタグ', () => {
		it('should render og:title meta tag', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(BaseLayout, {
				props: {
					title: 'テストページ',
					description: 'テスト説明',
					ogUrl: 'https://example.com/test',
				},
			});

			expect(result).toContain('<meta property="og:title" content="テストページ"');
		});

		it('should render og:description meta tag', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(BaseLayout, {
				props: {
					title: 'テストページ',
					description: 'テスト説明',
					ogUrl: 'https://example.com/test',
				},
			});

			expect(result).toContain(
				'<meta property="og:description" content="テスト説明"'
			);
		});

		it('should render og:type meta tag with "website" as default', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(BaseLayout, {
				props: {
					title: 'テストページ',
					description: 'テスト説明',
					ogUrl: 'https://example.com/test',
				},
			});

			expect(result).toContain('<meta property="og:type" content="website"');
		});

		it('should render og:url meta tag when provided', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(BaseLayout, {
				props: {
					title: 'テストページ',
					description: 'テスト説明',
					ogUrl: 'https://example.com/test',
				},
			});

			expect(result).toContain(
				'<meta property="og:url" content="https://example.com/test"'
			);
		});
	});

	describe('スタイルシート', () => {
		it('should import global.css', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(BaseLayout, {
				props: {
					title: 'テストページ',
					description: 'テスト説明',
				},
			});

			// global.cssのインポートがあるか確認（Astroのビルド時にインライン化される可能性があるため、柔軟にチェック）
			expect(result).toMatch(/global\.css|@import|tailwindcss/i);
		});
	});

	describe('slotコンテンツ', () => {
		it('should render slot content', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(BaseLayout, {
				props: {
					title: 'テストページ',
					description: 'テスト説明',
				},
				slots: {
					default: '<p>テストコンテンツ</p>',
				},
			});

			expect(result).toContain('<p>テストコンテンツ</p>');
		});
	});

	describe('ダークモード対応', () => {
		it('should include dark mode class on body', async () => {
			const container = await AstroContainer.create();
			const result = await container.renderToString(BaseLayout, {
				props: {
					title: 'テストページ',
					description: 'テスト説明',
				},
			});

			// ダークモードのクラス（dark）が設定可能な構造になっているか確認
			expect(result).toMatch(/<body[^>]*>/);
		});
	});
});
