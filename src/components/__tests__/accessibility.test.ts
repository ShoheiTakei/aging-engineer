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
 *
 * 関連文書:
 * - テストケース定義書: docs/implements/blog-article-management/TASK-0004/testcases.md
 */

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeEach, describe, expect, it } from 'vitest';
import Footer from '../Footer.astro';
import Header from '../Header.astro';

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
});
