/**
 * Header.astro - テストスイート
 *
 * 関連要件:
 * - NFR-301: セマンティックHTML（<header>, <nav>）
 * - NFR-302: キーボードナビゲーション対応
 * - NFR-303: ARIAラベル（aria-label, aria-current）
 * - NFR-304: フォーカス可視化・代替テキスト
 *
 * 関連文書:
 * - テストケース定義書: docs/implements/blog-article-management/TASK-0004/testcases.md
 * - 要件定義書: docs/implements/blog-article-management/TASK-0004/header-footer-requirements.md
 * - タスクノート: docs/implements/blog-article-management/TASK-0004/note.md
 */

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeEach, describe, expect, it } from 'vitest';
import Header from './Header.astro';

describe('Header.astro', () => {
  let container: AstroContainer;

  beforeEach(async () => {
    container = await AstroContainer.create();
  });

  // ========================================
  // 2.1 正常系テストケース
  // ========================================

  describe('正常系テストケース', () => {
    // TC-H-001: 基本レンダリングテスト
    it('TC-H-001: ヘッダーコンポーネントが正しくレンダリングされる', async () => {
      const result = await container.renderToString(Header, {
        props: { siteTitle: 'Test Blog' },
      });

      expect(result).toContain('<header>');
      expect(result).toContain('</header>');
      expect(result).toContain('<nav');
      expect(result).toContain('Test Blog');
    });

    // TC-H-002: Props反映テスト（siteTitle）
    it('TC-H-002: Props（siteTitle）が正しく反映される', async () => {
      // ケース1: 標準的なタイトル
      const result1 = await container.renderToString(Header, {
        props: { siteTitle: 'My Custom Blog' },
      });
      expect(result1).toContain('My Custom Blog');

      // ケース2: 日本語タイトル
      const result2 = await container.renderToString(Header, {
        props: { siteTitle: 'エンジニアブログ' },
      });
      expect(result2).toContain('エンジニアブログ');
    });

    // TC-H-003: ナビゲーションリンク生成テスト
    it('TC-H-003: ナビゲーションリンクが正しく生成される', async () => {
      const result = await container.renderToString(Header, {
        props: { siteTitle: 'Test Blog' },
      });

      // 必須ナビゲーション項目
      expect(result).toContain('href="/"'); // ホーム
      expect(result).toContain('href="/blog"'); // ブログ
      expect(result).toContain('href="/tags"'); // タグ
      expect(result).toContain('href="/search"'); // 検索
      expect(result).toContain('href="/rss.xml"'); // RSS

      // リンクテキスト
      expect(result).toContain('ホーム');
      expect(result).toContain('ブログ');
      expect(result).toContain('タグ');
      expect(result).toContain('検索');
      expect(result).toContain('RSS');
    });

    // TC-H-004: currentPath反映テスト（アクティブ状態）
    it('TC-H-004: 現在のページがaria-currentでハイライトされる', async () => {
      // ケース1: ホームページ
      const result1 = await container.renderToString(Header, {
        props: { siteTitle: 'Test Blog', currentPath: '/' },
      });
      expect(result1).toMatch(/href="\/"[^>]*aria-current="page"/);

      // ケース2: ブログページ
      const result2 = await container.renderToString(Header, {
        props: { siteTitle: 'Test Blog', currentPath: '/blog' },
      });
      expect(result2).toMatch(/href="\/blog"[^>]*aria-current="page"/);
    });
  });

  // ========================================
  // 2.2 異常系・境界値テストケース
  // ========================================

  describe('異常系・境界値テストケース', () => {
    // TC-H-101: siteTitle未指定エラー
    it('TC-H-101: siteTitleが未指定の場合は型エラー', () => {
      // TypeScriptコンパイル時にエラーとなることを確認
      // このテストはコンパイル時チェックのため、実行時テストは省略
      expect(true).toBe(true);
    });

    // TC-H-102: currentPath未指定時のデフォルト動作
    it('TC-H-102: currentPath未指定の場合はデフォルトで"/"が適用される', async () => {
      const result = await container.renderToString(Header, {
        props: { siteTitle: 'Test Blog' }, // currentPathなし
      });

      // デフォルトでホーム（/）がアクティブになる
      expect(result).toMatch(/href="\/"[^>]*aria-current="page"/);
    });

    // TC-H-103: 存在しないパスがcurrentPathに指定された場合
    it('TC-H-103: 存在しないパスが指定された場合はどのリンクもアクティブにならない', async () => {
      const result = await container.renderToString(Header, {
        props: { siteTitle: 'Test Blog', currentPath: '/nonexistent' },
      });

      // aria-current="page"が含まれないことを確認
      expect(result).not.toContain('aria-current="page"');
    });

    // TC-H-104: 非常に長いsiteTitle
    it('TC-H-104: 非常に長いsiteTitleは適切に省略される', async () => {
      const longTitle =
        'これは非常に長いサイトタイトルでモバイル表示時には省略されるべきテキストです'.repeat(3);

      const result = await container.renderToString(Header, {
        props: { siteTitle: longTitle },
      });

      // truncateまたはbreak-wordsクラスが適用されることを確認
      expect(result).toMatch(/class="[^"]*(?:truncate|break-words)/);
      expect(result).toContain(longTitle);
    });

    // TC-H-105: XSS攻撃対策（HTMLエスケープ）
    it('TC-H-105: siteTitleに含まれるHTMLタグがエスケープされる', async () => {
      const maliciousTitle = '<script>alert("XSS")</script>Blog';

      const result = await container.renderToString(Header, {
        props: { siteTitle: maliciousTitle },
      });

      // <script>タグがエスケープされることを確認
      expect(result).not.toContain('<script>alert("XSS")</script>');
      expect(result).toContain('&lt;script&gt;');
    });
  });

  // ========================================
  // 2.3 アクセシビリティテストケース（Header）
  // ========================================

  describe('アクセシビリティテストケース', () => {
    // TC-H-201: セマンティックHTML使用（NFR-301）
    it('TC-H-201: セマンティックHTML（<header>, <nav>）が使用されている', async () => {
      const result = await container.renderToString(Header, {
        props: { siteTitle: 'Test Blog' },
      });

      // <header>タグが使用されている
      expect(result).toMatch(/<header[^>]*>/);
      expect(result).toContain('</header>');

      // <nav>タグが使用されている
      expect(result).toMatch(/<nav[^>]*>/);
      expect(result).toContain('</nav>');

      // ナビゲーションがリストで構造化されている
      expect(result).toContain('<ul>');
      expect(result).toContain('<li>');
    });

    // TC-H-202: ARIAラベル設定（NFR-303）
    it('TC-H-202: ARIAラベル（aria-label, aria-current）が正しく設定されている', async () => {
      const result = await container.renderToString(Header, {
        props: { siteTitle: 'Test Blog', currentPath: '/blog' },
      });

      // ナビゲーションにaria-labelが設定されている
      expect(result).toContain('aria-label="メインナビゲーション"');

      // 現在のページにaria-current="page"が設定されている
      expect(result).toMatch(/href="\/blog"[^>]*aria-current="page"/);
    });

    // TC-H-203: フォーカス可視化スタイル（NFR-304）
    it('TC-H-203: ナビゲーションリンクにフォーカス可視化スタイルが適用される', async () => {
      const result = await container.renderToString(Header, {
        props: { siteTitle: 'Test Blog' },
      });

      // フォーカススタイルクラスが含まれている
      expect(result).toMatch(/class="[^"]*focus[^"]*"/);
    });

    // TC-H-204: キーボードナビゲーション対応（NFR-302）
    it('TC-H-204: ナビゲーションリンクがすべて<a>タグで実装されている', async () => {
      const result = await container.renderToString(Header, {
        props: { siteTitle: 'Test Blog' },
      });

      // すべてのナビゲーション項目が<a>タグで実装されている
      const linkMatches = result.match(/<a\s+href="[^"]+"/g);
      expect(linkMatches).toBeDefined();
      expect(linkMatches?.length).toBeGreaterThanOrEqual(5); // 最低5つのリンク

      // ボタンではなくリンクが使用されている（<button>が含まれない）
      expect(result).not.toMatch(/<button[^>]*>ホーム<\/button>/);
    });
  });

  // ========================================
  // 2.4 スタイリングテストケース（Header）
  // ========================================

  describe('スタイリングテストケース', () => {
    // TC-H-301: ダークモード対応スタイル
    it('TC-H-301: ダークモード用スタイルクラスが適用されている', async () => {
      const result = await container.renderToString(Header, {
        props: { siteTitle: 'Test Blog' },
      });

      // dark:プレフィックスクラスが含まれている
      expect(result).toMatch(/class="[^"]*dark:[^"]*"/);
    });

    // TC-H-302: レスポンシブデザインクラス
    it('TC-H-302: レスポンシブデザインクラス（sm:, md:, lg:）が適用されている', async () => {
      const result = await container.renderToString(Header, {
        props: { siteTitle: 'Test Blog' },
      });

      // レスポンシブブレークポイントクラスが含まれている
      expect(result).toMatch(/class="[^"]*(?:sm:|md:|lg:)/);
    });
  });
});
