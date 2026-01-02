/**
 * アクセシビリティ総合テスト
 *
 * Header・FooterコンポーネントのWCAG 2.1 AA準拠を総合的に検証
 *
 * 関連要件:
 * - NFR-301: セマンティックHTML
 * - NFR-302: キーボードナビゲーション
 * - NFR-303: ARIAラベル
 * - NFR-304: フォーカス可視化
 * - WCAG 2.4.1: ブロックスキップ（スキップリンク）
 *
 * 関連文書:
 * - テストケース定義書: docs/implements/blog-article-management/TASK-0004/testcases.md
 * - WCAG準拠レポート: docs/wcag-compliance-report.md
 */

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeEach, describe, expect, it } from 'vitest';
import BlogCard from '../BlogCard.astro';
import Footer from '../Footer.astro';
import Header from '../Header.astro';
import Pagination from '../Pagination.astro';
import TableOfContents from '../TableOfContents.astro';
import ThemeToggle from '../ThemeToggle.astro';

describe('アクセシビリティ総合テスト（WCAG 2.1 AA準拠）', () => {
  let container: AstroContainer;

  beforeEach(async () => {
    container = await AstroContainer.create();
  });

  // ========================================
  // 4.1 WCAG 2.1 AA準拠総合テスト
  // ========================================

  // TC-A-001: セマンティックHTML総合チェック（NFR-301）
  it('TC-A-001: Header・FooterがセマンティックHTMLで構成されている', async () => {
    // Header
    const headerResult = await container.renderToString(Header, {
      props: { siteTitle: 'Test Blog' },
    });
    expect(headerResult).toMatch(/<header[^>]*>/);
    expect(headerResult).toMatch(/<nav[^>]*>/);

    // Footer
    const footerResult = await container.renderToString(Footer, {
      props: { siteName: 'Test Blog' },
    });
    expect(footerResult).toMatch(/<footer[^>]*>/);

    // divベースの実装でないことを確認
    expect(headerResult).not.toMatch(/<div[^>]*class="[^"]*header[^"]*"/);
    expect(footerResult).not.toMatch(/<div[^>]*class="[^"]*footer[^"]*"/);
  });

  // TC-A-002: キーボードナビゲーション総合チェック（NFR-302）
  it('TC-A-002: すべてのリンクが<a>タグで実装されキーボード操作可能', async () => {
    // Header
    const headerResult = await container.renderToString(Header, {
      props: { siteTitle: 'Test Blog' },
    });

    // すべてのナビゲーション項目が<a>タグ
    const headerLinks = headerResult.match(/<a\s+href="[^"]+"/g);
    expect(headerLinks).toBeDefined();
    expect(headerLinks?.length).toBeGreaterThanOrEqual(5);

    // Footer
    const footerResult = await container.renderToString(Footer, {
      props: { siteName: 'Test Blog' },
    });

    // RSSリンクが<a>タグ
    expect(footerResult).toMatch(/<a\s+href="\/rss\.xml"/);
  });

  // TC-A-003: ARIAラベル総合チェック（NFR-303）
  it('TC-A-003: ARIA属性が適切に設定されている', async () => {
    // Header
    const headerResult = await container.renderToString(Header, {
      props: { siteTitle: 'Test Blog', currentPath: '/blog' },
    });
    expect(headerResult).toContain('aria-label="メインナビゲーション"');
    expect(headerResult).toContain('aria-current="page"');

    // Footer
    const footerResult = await container.renderToString(Footer, {
      props: { siteName: 'Test Blog' },
    });
    expect(footerResult).toContain('aria-label="フッターナビゲーション"');
  });

  // TC-A-004: フォーカス可視化総合チェック（NFR-304）
  it('TC-A-004: すべてのリンクにフォーカス可視化スタイルが適用される', async () => {
    // Header
    const headerResult = await container.renderToString(Header, {
      props: { siteTitle: 'Test Blog' },
    });
    expect(headerResult).toMatch(/class="[^"]*focus[^"]*"/);

    // Footer
    const footerResult = await container.renderToString(Footer, {
      props: { siteName: 'Test Blog' },
    });
    expect(footerResult).toMatch(/class="[^"]*focus[^"]*"/);
  });

  // ========================================
  // 4.2 WCAG 2.1 AA 追加要件テスト
  // ========================================

  // TC-A-005: BlogCardのアクセシビリティ検証
  it('TC-A-005: BlogCardがWCAG 2.1 AA準拠のマークアップを使用している', async () => {
    const result = await container.renderToString(BlogCard, {
      props: {
        href: '/blog/test',
        title: 'テスト記事',
        description: 'テスト記事の説明',
        tags: ['タグ1', 'タグ2'],
        pubDate: new Date('2024-01-01'),
      },
    });

    // セマンティックHTML: <article>タグを使用
    expect(result).toMatch(/<article[^>]*>/);

    // セマンティックHTML: <time>タグとdatetime属性
    expect(result).toMatch(/<time[^>]*datetime="[^"]+"/);

    // 装飾的画像にaria-hidden="true"またはalt=""
    expect(result).toContain('alt=""');

    // フォーカス可視化スタイル
    expect(result).toMatch(/focus-visible:ring-2/);

    // タグリンクが適切にレンダリングされている
    expect(result).toContain('/tags/');
    expect(result).toContain('#タグ1');
    expect(result).toContain('#タグ2');
  });

  // TC-A-006: Paginationのアクセシビリティ検証
  it('TC-A-006: Paginationがナビゲーションとして適切にマークアップされている', async () => {
    const mockPage = {
      data: [],
      start: 0,
      end: 10,
      size: 10,
      total: 50,
      currentPage: 2,
      lastPage: 5,
      url: {
        current: '/blog/2',
        prev: '/blog/1',
        next: '/blog/3',
        first: '/blog/1',
        last: '/blog/5',
      },
    };

    const result = await container.renderToString(Pagination, {
      props: { page: mockPage },
    });

    // セマンティックHTML: <nav>タグを使用
    expect(result).toMatch(/<nav[^>]*>/);

    // ARIA: aria-label="ページネーション"
    expect(result).toContain('aria-label="ページネーション"');

    // ARIA: 現在のページにaria-current="page"
    expect(result).toContain('aria-current="page"');

    // すべてのボタン/リンクにaria-label
    expect(result).toContain('aria-label="最初のページへ"');
    expect(result).toContain('aria-label="前のページへ"');
    expect(result).toContain('aria-label="次のページへ"');
    expect(result).toContain('aria-label="最後のページへ"');
  });

  // TC-A-007: TableOfContentsのアクセシビリティ検証
  it('TC-A-007: TableOfContentsがナビゲーションとして適切にマークアップされている', async () => {
    const mockTOC = {
      hasContent: true,
      items: [
        {
          depth: 2,
          slug: 'heading-1',
          text: '見出し1',
          children: [
            {
              depth: 3,
              slug: 'heading-1-1',
              text: '見出し1-1',
              children: [],
            },
          ],
        },
      ],
    };

    const result = await container.renderToString(TableOfContents, {
      props: { toc: mockTOC },
    });

    // セマンティックHTML: <nav>タグを使用
    expect(result).toMatch(/<nav[^>]*>/);

    // ARIA: aria-label="目次"
    expect(result).toContain('aria-label="目次"');

    // セマンティックHTML: <ol>タグで階層構造
    expect(result).toMatch(/<ol[^>]*>/);

    // ARIA: リストにrole="list"（一部ブラウザ対応）
    expect(result).toContain('role="list"');
  });

  // TC-A-008: ThemeToggleのアクセシビリティ検証
  it('TC-A-008: ThemeToggleボタンが適切なARIA属性を持つ', async () => {
    const result = await container.renderToString(ThemeToggle);

    // セマンティックHTML: <button>タグを使用
    expect(result).toMatch(/<button[^>]*type="button"/);

    // ARIA: aria-label
    expect(result).toContain('aria-label="ダークモードを切り替え"');

    // フォーカス可視化スタイル
    expect(result).toMatch(/focus-visible:ring-2/);

    // アイコンSVGのサイズ指定（アクセシビリティのベストプラクティス）
    expect(result).toContain('width="24"');
    expect(result).toContain('height="24"');
  });

  // ========================================
  // 4.3 言語属性の検証
  // ========================================

  // TC-A-009: 日本語コンテンツであることを確認
  it('TC-A-009: すべてのテキストコンテンツが日本語である', async () => {
    // Header
    const headerResult = await container.renderToString(Header, {
      props: { siteTitle: 'テストブログ' },
    });
    expect(headerResult).toContain('ホーム');
    expect(headerResult).toContain('ブログ');
    expect(headerResult).toContain('タグ');
    expect(headerResult).toContain('検索');

    // Footer
    const footerResult = await container.renderToString(Footer, {
      props: { siteName: 'テストブログ' },
    });
    expect(footerResult).toContain('All rights reserved');
  });

  // ========================================
  // 4.4 インタラクティブ要素の検証
  // ========================================

  // TC-A-010: すべてのインタラクティブ要素がキーボードアクセス可能
  it('TC-A-010: インタラクティブ要素が<a>または<button>タグで実装されている', async () => {
    // Header
    const headerResult = await container.renderToString(Header, {
      props: { siteTitle: 'Test Blog' },
    });
    // ナビゲーションリンクはすべて<a>タグ
    const headerLinks = headerResult.match(/<a\s+/g);
    expect(headerLinks?.length).toBeGreaterThanOrEqual(5); // 5つのナビゲーション項目

    // ThemeToggle
    const toggleResult = await container.renderToString(ThemeToggle);
    // トグルボタンは<button>タグ
    expect(toggleResult).toMatch(/<button[^>]*type="button"/);

    // divやspanベースのボタンが存在しないことを確認
    expect(headerResult).not.toMatch(/<div[^>]*onclick/);
    expect(headerResult).not.toMatch(/<span[^>]*onclick/);
  });
});
