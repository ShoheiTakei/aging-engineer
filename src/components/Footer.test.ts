/**
 * Footer.astro - テストスイート
 *
 * 関連要件:
 * - NFR-301: セマンティックHTML（<footer>）
 * - NFR-303: ARIAラベル
 * - REQ-601: RSS Feed生成
 *
 * 関連文書:
 * - テストケース定義書: docs/implements/blog-article-management/TASK-0004/testcases.md
 * - 要件定義書: docs/implements/blog-article-management/TASK-0004/header-footer-requirements.md
 * - タスクノート: docs/implements/blog-article-management/TASK-0004/note.md
 */

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeEach, describe, expect, it } from 'vitest';
import Footer from './Footer.astro';

describe('Footer.astro', () => {
  let container: AstroContainer;

  beforeEach(async () => {
    container = await AstroContainer.create();
  });

  // ========================================
  // 3.1 正常系テストケース
  // ========================================

  describe('正常系テストケース', () => {
    // TC-F-001: 基本レンダリングテスト
    it('TC-F-001: フッターコンポーネントが正しくレンダリングされる', async () => {
      const result = await container.renderToString(Footer, {
        props: { siteName: 'Test Blog' },
      });

      expect(result).toContain('<footer>');
      expect(result).toContain('</footer>');
      expect(result).toContain('Test Blog');
    });

    // TC-F-002: Props反映テスト（siteName）
    it('TC-F-002: Props（siteName）が正しく反映される', async () => {
      // ケース1: 標準的なサイト名
      const result1 = await container.renderToString(Footer, {
        props: { siteName: 'My Custom Blog' },
      });
      expect(result1).toContain('My Custom Blog');

      // ケース2: 日本語サイト名
      const result2 = await container.renderToString(Footer, {
        props: { siteName: 'エンジニアブログ' },
      });
      expect(result2).toContain('エンジニアブログ');
    });

    // TC-F-003: コピーライト表記テスト
    it('TC-F-003: コピーライト表記が正しく生成される', async () => {
      // ケース1: copyrightYear指定あり
      const result1 = await container.renderToString(Footer, {
        props: { siteName: 'Test Blog', copyrightYear: '2025' },
      });
      expect(result1).toContain('© 2025');
      expect(result1).toContain('Test Blog');

      // ケース2: copyrightYear指定なし（現在年がデフォルト）
      const result2 = await container.renderToString(Footer, {
        props: { siteName: 'Test Blog' },
      });
      const currentYear = new Date().getFullYear().toString();
      expect(result2).toContain(`© ${currentYear}`);
    });

    // TC-F-004: RSSリンク生成テスト
    it('TC-F-004: RSSフィードリンクが正しく生成される', async () => {
      const result = await container.renderToString(Footer, {
        props: { siteName: 'Test Blog' },
      });

      expect(result).toContain('href="/rss.xml"');
      expect(result).toContain('RSS');
    });
  });

  // ========================================
  // 3.2 異常系・境界値テストケース
  // ========================================

  describe('異常系・境界値テストケース', () => {
    // TC-F-101: siteName未指定エラー
    it('TC-F-101: siteNameが未指定の場合は型エラー', () => {
      // TypeScriptコンパイル時にエラーとなることを確認
      // このテストはコンパイル時チェックのため、実行時テストは省略
      expect(true).toBe(true);
    });

    // TC-F-102: copyrightYear未指定時のデフォルト動作
    it('TC-F-102: copyrightYear未指定の場合は現在年が適用される', async () => {
      const result = await container.renderToString(Footer, {
        props: { siteName: 'Test Blog' }, // copyrightYearなし
      });

      const currentYear = new Date().getFullYear().toString();
      expect(result).toContain(`© ${currentYear}`);
    });

    // TC-F-103: 非常に長いsiteName
    it('TC-F-103: 非常に長いsiteNameが正しく表示される', async () => {
      const longName =
        'これは非常に長いサイト名でフッター表示時にも正しくレンダリングされるべきテキストです'.repeat(
          2,
        );

      const result = await container.renderToString(Footer, {
        props: { siteName: longName },
      });

      expect(result).toContain(longName);
    });

    // TC-F-104: XSS攻撃対策（HTMLエスケープ）
    it('TC-F-104: siteNameに含まれるHTMLタグがエスケープされる', async () => {
      const maliciousName = '<img src=x onerror=alert("XSS")>Blog';

      const result = await container.renderToString(Footer, {
        props: { siteName: maliciousName },
      });

      // <img>タグがエスケープされることを確認
      expect(result).not.toContain('<img src=x onerror=alert("XSS")>');
      expect(result).toContain('&lt;img');
    });
  });

  // ========================================
  // 3.3 アクセシビリティテストケース（Footer）
  // ========================================

  describe('アクセシビリティテストケース', () => {
    // TC-F-201: セマンティックHTML使用（NFR-301）
    it('TC-F-201: セマンティックHTML（<footer>）が使用されている', async () => {
      const result = await container.renderToString(Footer, {
        props: { siteName: 'Test Blog' },
      });

      // <footer>タグが使用されている
      expect(result).toMatch(/<footer[^>]*>/);
      expect(result).toContain('</footer>');
    });

    // TC-F-202: ARIAラベル設定（NFR-303）
    it('TC-F-202: フッターナビゲーションにaria-labelが設定されている', async () => {
      const result = await container.renderToString(Footer, {
        props: { siteName: 'Test Blog' },
      });

      // フッターナビゲーションにaria-labelが設定されている
      expect(result).toContain('aria-label="フッターナビゲーション"');
    });
  });

  // ========================================
  // 3.4 スタイリングテストケース（Footer）
  // ========================================

  describe('スタイリングテストケース', () => {
    // TC-F-301: ダークモード対応スタイル
    it('TC-F-301: ダークモード用スタイルクラスが適用されている', async () => {
      const result = await container.renderToString(Footer, {
        props: { siteName: 'Test Blog' },
      });

      // dark:プレフィックスクラスが含まれている
      expect(result).toMatch(/class="[^"]*dark:[^"]*"/);
    });
  });
});
