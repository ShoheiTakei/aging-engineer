/**
 * パフォーマンステスト
 *
 * Header・FooterコンポーネントのパフォーマンスとSSG出力を検証
 *
 * 関連要件:
 * - NFR-001: Lighthouse 90+点
 * - REQ-903: SSGのみ使用（ゼロJavaScriptデフォルト）
 *
 * 関連文書:
 * - テストケース定義書: docs/implements/blog-article-management/TASK-0004/testcases.md
 */

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeEach, describe, expect, it } from 'vitest';
import Footer from '../Footer.astro';
import Header from '../Header.astro';

describe('パフォーマンステスト', () => {
  let container: AstroContainer;

  beforeEach(async () => {
    container = await AstroContainer.create();
  });

  // ========================================
  // 5.1 ゼロJavaScript確認
  // ========================================

  // TC-P-001: JavaScriptが含まれないことを確認
  it('TC-P-001: Header・Footerに<script>タグが含まれない', async () => {
    // Header
    const headerResult = await container.renderToString(Header, {
      props: { siteTitle: 'Test Blog' },
    });
    expect(headerResult).not.toContain('<script>');
    expect(headerResult).not.toContain('<script ');

    // Footer
    const footerResult = await container.renderToString(Footer, {
      props: { siteName: 'Test Blog' },
    });
    expect(footerResult).not.toContain('<script>');
    expect(footerResult).not.toContain('<script ');
  });

  // ========================================
  // 5.2 HTML出力サイズ確認
  // ========================================

  // TC-P-002: HTML出力サイズが妥当な範囲であることを確認
  it('TC-P-002: Header・FooterのHTML出力サイズが妥当な範囲', async () => {
    // Header
    const headerResult = await container.renderToString(Header, {
      props: { siteTitle: 'Test Blog' },
    });
    expect(headerResult.length).toBeLessThan(5000); // 5KB未満

    // Footer
    const footerResult = await container.renderToString(Footer, {
      props: { siteName: 'Test Blog' },
    });
    expect(footerResult.length).toBeLessThan(2000); // 2KB未満
  });
});
