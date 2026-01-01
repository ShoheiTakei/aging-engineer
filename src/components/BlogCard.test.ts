/**
 * BlogCard.astro - テストスイート
 *
 * 関連要件:
 * - TASK-0013: ブログカードコンポーネントの実装
 * - NFR-301: セマンティックHTML（<article>, <time>）
 * - NFR-302: キーボードナビゲーション対応
 * - NFR-303: ARIAラベル設定
 * - NFR-304: フォーカス可視化・代替テキスト
 * - NFR-202: 画像のレスポンシブ対応
 */

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeEach, describe, expect, it } from 'vitest';
import BlogCard from './BlogCard.astro';

describe('BlogCard.astro', () => {
  let container: AstroContainer;

  beforeEach(async () => {
    container = await AstroContainer.create();
  });

  // ========================================
  // 2.1 正常系テストケース
  // ========================================

  describe('正常系テストケース', () => {
    // TC-BC-001: 基本レンダリングテスト
    it('TC-BC-001: ブログカードコンポーネントが正しくレンダリングされる', async () => {
      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: 'テスト記事タイトル',
          description: 'テスト記事の説明文です',
        },
      });

      expect(result).toContain('<article');
      expect(result).toContain('</article>');
      expect(result).toContain('テスト記事タイトル');
      expect(result).toContain('テスト記事の説明文です');
    });

    // TC-BC-002: カバー画像表示テスト
    it('TC-BC-002: カバー画像が正しく表示される', async () => {
      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: 'テスト記事',
          description: '説明文',
          coverImage: 'https://example.com/image.jpg',
        },
      });

      expect(result).toContain('<img');
      expect(result).toContain('src="https://example.com/image.jpg"');
      expect(result).toContain('loading="lazy"');
    });

    // TC-BC-003: デフォルトカバー画像テスト
    it('TC-BC-003: カバー画像未指定時はデフォルト画像が使用される', async () => {
      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: 'テスト記事',
          description: '説明文',
        },
      });

      expect(result).toContain('src="https://placehold.co/1200x630"');
    });

    // TC-BC-004: タグ表示テスト
    it('TC-BC-004: タグが正しく表示される', async () => {
      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: 'テスト記事',
          description: '説明文',
          tags: ['JavaScript', 'TypeScript', 'Astro'],
        },
      });

      expect(result).toContain('#JavaScript');
      expect(result).toContain('#TypeScript');
      expect(result).toContain('#Astro');
      expect(result).toContain('href="/tags/JavaScript"');
      expect(result).toContain('href="/tags/TypeScript"');
      expect(result).toContain('href="/tags/Astro"');
    });

    // TC-BC-005: タグ未指定時の表示テスト
    it('TC-BC-005: タグ未指定時はタグセクションが表示されない', async () => {
      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: 'テスト記事',
          description: '説明文',
          tags: [],
        },
      });

      // タグリンクが存在しないことを確認
      expect(result).not.toContain('href="/tags/');
    });

    // TC-BC-006: 公開日表示テスト
    it('TC-BC-006: 公開日が正しく表示される', async () => {
      const pubDate = new Date('2024-01-15');
      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: 'テスト記事',
          description: '説明文',
          pubDate,
        },
      });

      expect(result).toContain('<time');
      expect(result).toContain('datetime="2024-01-15');
      // formatDateによる日本語フォーマット
      expect(result).toContain('2024年1月15日');
    });

    // TC-BC-007: 公開日未指定時の表示テスト
    it('TC-BC-007: 公開日未指定時は日付セクションが表示されない', async () => {
      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: 'テスト記事',
          description: '説明文',
        },
      });

      expect(result).not.toContain('<time');
    });

    // TC-BC-008: リンク先テスト
    it('TC-BC-008: 記事へのリンクが正しく設定される', async () => {
      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/my-awesome-post',
          title: 'テスト記事',
          description: '説明文',
        },
      });

      expect(result).toContain('href="/blog/my-awesome-post"');
    });
  });

  // ========================================
  // 2.2 異常系・境界値テストケース
  // ========================================

  describe('異常系・境界値テストケース', () => {
    // TC-BC-101: 長いタイトルの切り詰め
    it('TC-BC-101: 長いタイトルは適切にスタイリングされる', async () => {
      const longTitle =
        'これは非常に長い記事タイトルでカード内では2行で切り詰められるべきテキストです'.repeat(3);

      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: longTitle,
          description: '説明文',
        },
      });

      // line-clampクラスが適用されることを確認
      expect(result).toMatch(/class="[^"]*line-clamp-2/);
      expect(result).toContain(longTitle);
    });

    // TC-BC-102: 長い説明文の切り詰め
    it('TC-BC-102: 長い説明文は適切にスタイリングされる', async () => {
      const longDescription =
        'これは非常に長い記事の説明文で、カード内では3行で切り詰められるべきテキストです。'.repeat(
          5,
        );

      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: 'テスト記事',
          description: longDescription,
        },
      });

      // line-clampクラスが適用されることを確認
      expect(result).toMatch(/class="[^"]*line-clamp-3/);
      expect(result).toContain(longDescription);
    });

    // TC-BC-103: XSS攻撃対策（HTMLエスケープ）
    it('TC-BC-103: タイトルに含まれるHTMLタグがエスケープされる', async () => {
      const maliciousTitle = '<script>alert("XSS")</script>記事タイトル';

      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: maliciousTitle,
          description: '説明文',
        },
      });

      // <script>タグがエスケープされることを確認
      expect(result).not.toContain('<script>alert("XSS")</script>');
      expect(result).toContain('&lt;script&gt;');
    });

    // TC-BC-104: XSS攻撃対策（説明文）
    it('TC-BC-104: 説明文に含まれるHTMLタグがエスケープされる', async () => {
      const maliciousDescription = '<img src=x onerror="alert(1)">悪意のある説明';

      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: 'テスト記事',
          description: maliciousDescription,
        },
      });

      // imgタグがエスケープされることを確認
      expect(result).not.toContain('<img src=x onerror="alert(1)">');
    });

    // TC-BC-105: 多数のタグ
    it('TC-BC-105: 多数のタグが正しく表示される', async () => {
      const manyTags = Array.from({ length: 10 }, (_, i) => `Tag${i + 1}`);

      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: 'テスト記事',
          description: '説明文',
          tags: manyTags,
        },
      });

      // すべてのタグが表示されることを確認
      for (const tag of manyTags) {
        expect(result).toContain(`#${tag}`);
      }
    });

    // TC-BC-106: 特殊文字を含むタグ
    it('TC-BC-106: 特殊文字を含むタグが正しくエスケープされる', async () => {
      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: 'テスト記事',
          description: '説明文',
          tags: ['C++', 'C#', 'F#'],
        },
      });

      expect(result).toContain('#C++');
      expect(result).toContain('#C#');
      expect(result).toContain('#F#');
    });
  });

  // ========================================
  // 2.3 アクセシビリティテストケース
  // ========================================

  describe('アクセシビリティテストケース', () => {
    // TC-BC-201: セマンティックHTML使用（NFR-301）
    it('TC-BC-201: セマンティックHTML（<article>, <time>）が使用されている', async () => {
      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: 'テスト記事',
          description: '説明文',
          pubDate: new Date('2024-01-15'),
        },
      });

      // <article>タグが使用されている
      expect(result).toMatch(/<article[^>]*>/);
      expect(result).toContain('</article>');

      // <time>タグとdatetime属性が使用されている
      expect(result).toMatch(/<time[^>]*datetime="[^"]*"[^>]*>/);
    });

    // TC-BC-202: 見出し構造テスト
    it('TC-BC-202: タイトルが見出しタグ（h3）で実装されている', async () => {
      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: 'テスト記事',
          description: '説明文',
        },
      });

      expect(result).toMatch(/<h3[^>]*>/);
      expect(result).toContain('</h3>');
    });

    // TC-BC-203: フォーカス可視化スタイル（NFR-304）
    it('TC-BC-203: リンクにフォーカス可視化スタイルが適用される', async () => {
      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: 'テスト記事',
          description: '説明文',
          tags: ['JavaScript'],
        },
      });

      // フォーカススタイルクラスが含まれている
      expect(result).toMatch(/class="[^"]*focus-visible[^"]*"/);
    });

    // TC-BC-204: 画像遅延読み込み
    it('TC-BC-204: カバー画像にloading="lazy"が設定されている', async () => {
      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: 'テスト記事',
          description: '説明文',
        },
      });

      expect(result).toContain('loading="lazy"');
      expect(result).toContain('decoding="async"');
    });

    // TC-BC-205: 画像代替テキスト
    it('TC-BC-205: カバー画像に空のalt属性が設定されている（装飾的画像）', async () => {
      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: 'テスト記事',
          description: '説明文',
        },
      });

      // 装飾的画像なのでalt=""が設定される
      expect(result).toContain('alt=""');
    });

    // TC-BC-206: 重複フォーカス防止
    it('TC-BC-206: カバー画像リンクがtabindex="-1"で重複フォーカスを防止', async () => {
      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: 'テスト記事',
          description: '説明文',
        },
      });

      // カバー画像のリンクにtabindex="-1"が設定されている
      expect(result).toContain('tabindex="-1"');
      expect(result).toContain('aria-hidden="true"');
    });
  });

  // ========================================
  // 2.4 スタイリングテストケース
  // ========================================

  describe('スタイリングテストケース', () => {
    // TC-BC-301: カードスタイルクラス
    it('TC-BC-301: cardクラスが適用されている', async () => {
      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: 'テスト記事',
          description: '説明文',
        },
      });

      expect(result).toMatch(/class="[^"]*card[^"]*"/);
    });

    // TC-BC-302: ダークモード対応スタイル
    it('TC-BC-302: ダークモード用スタイルクラスが適用されている', async () => {
      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: 'テスト記事',
          description: '説明文',
        },
      });

      // dark:プレフィックスクラスが含まれている
      expect(result).toMatch(/class="[^"]*dark:[^"]*"/);
    });

    // TC-BC-303: ホバーエフェクト
    it('TC-BC-303: 画像にホバーエフェクトが設定されている', async () => {
      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: 'テスト記事',
          description: '説明文',
        },
      });

      // ホバー時のスケールエフェクトが含まれている
      expect(result).toMatch(/class="[^"]*group-hover:scale/);
    });

    // TC-BC-304: アスペクト比維持
    it('TC-BC-304: カバー画像にアスペクト比クラスが適用されている', async () => {
      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: 'テスト記事',
          description: '説明文',
        },
      });

      expect(result).toMatch(/class="[^"]*aspect-video[^"]*"/);
    });

    // TC-BC-305: タグのスタイリング
    it('TC-BC-305: タグにバッジスタイルが適用されている', async () => {
      const result = await container.renderToString(BlogCard, {
        props: {
          href: '/blog/test-post',
          title: 'テスト記事',
          description: '説明文',
          tags: ['JavaScript'],
        },
      });

      // タグに背景色とパディングが適用されている
      expect(result).toMatch(/class="[^"]*px-2[^"]*py-1[^"]*"/);
      expect(result).toMatch(/class="[^"]*rounded[^"]*"/);
    });
  });
});
