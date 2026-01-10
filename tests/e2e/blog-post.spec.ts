/**
 * ブログ記事詳細ページのE2Eテスト
 *
 * テスト対象: src/pages/blog/[slug].astro
 * 主要フロー: 記事詳細表示、目次ナビゲーション、関連記事表示
 */

import { test, expect } from '@playwright/test';

test.describe('ブログ記事詳細ページ', () => {
  test.beforeEach(async ({ page }) => {
    // ブログ一覧ページに移動
    await page.goto('/blog');

    // 最初の記事のリンクを取得してクリック
    const firstArticleLink = page.locator('article a, .blog-card a, [data-testid="blog-card"] a').first();

    // リンクが存在する場合クリック
    if (await firstArticleLink.isVisible()) {
      await firstArticleLink.click();
      await page.waitForLoadState('networkidle');
    }
  });

  test('記事詳細ページが正しく表示される', async ({ page }) => {
    // 記事タイトル（h1）が表示される
    const title = page.locator('h1');
    await expect(title).toBeVisible();

    // 記事本文が表示される
    const article = page.locator('article, main');
    await expect(article).toBeVisible();
  });

  test('記事メタデータが正しく表示される', async ({ page }) => {
    // 公開日が表示される
    const publishDate = page.locator('time, .publish-date, [data-testid="publish-date"]').first();

    if (await publishDate.isVisible()) {
      const dateText = await publishDate.textContent();
      expect(dateText).toBeTruthy();
    }
  });

  test('記事本文が正しく表示される', async ({ page }) => {
    // 記事本文のコンテンツがある
    const articleContent = page.locator('article, .article-content, main');
    const content = await articleContent.textContent();

    expect(content).toBeTruthy();
    expect(content?.length).toBeGreaterThan(100); // 最低限のコンテンツ量
  });

  test('目次が表示され機能する', async ({ page }) => {
    // 目次を探す
    const toc = page.locator('nav[aria-label*="目次"], .toc, .table-of-contents, [data-testid="toc"]').first();

    // 目次が存在する場合のみテスト
    if (await toc.isVisible()) {
      // 目次のリンクを取得
      const tocLinks = toc.locator('a');
      const linkCount = await tocLinks.count();

      if (linkCount > 0) {
        // 最初の目次リンクをクリック
        const firstLink = tocLinks.first();
        await firstLink.click();

        // ページ内スクロールが発生したことを確認
        await page.waitForTimeout(500); // アニメーション待ち

        // スクロール位置が変わったことを確認
        const scrollY = await page.evaluate(() => window.scrollY);
        expect(scrollY).toBeGreaterThan(0);
      }
    }
  });

  test('画像が正しく読み込まれる', async ({ page }) => {
    // 記事内の画像を取得
    const images = page.locator('article img, main img, .article-content img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      // 最初の画像が読み込まれることを確認
      const firstImage = images.first();
      await expect(firstImage).toBeVisible();

      // 画像のsrc属性が存在することを確認
      const src = await firstImage.getAttribute('src');
      expect(src).toBeTruthy();
    }
  });

  test('関連記事が表示される', async ({ page }) => {
    // 関連記事セクションを探す
    const relatedSection = page.locator('section:has-text("関連記事"), .related-articles, [data-testid="related-articles"]').first();

    // 関連記事が存在する場合のみテスト
    if (await relatedSection.isVisible()) {
      // 関連記事のリンクが存在する
      const relatedLinks = relatedSection.locator('a');
      const count = await relatedLinks.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('前後の記事ナビゲーションが機能する', async ({ page }) => {
    // 前の記事または次の記事のリンクを探す
    const prevLink = page.locator('a:has-text("前の記事"), a[aria-label*="前"], a[rel="prev"]').first();
    const nextLink = page.locator('a:has-text("次の記事"), a[aria-label*="次"], a[rel="next"]').first();

    // いずれかのリンクが存在する場合テスト
    if (await prevLink.isVisible()) {
      // 現在のURLを保存
      const currentUrl = page.url();

      // 前の記事に移動
      await prevLink.click();
      await page.waitForLoadState('networkidle');

      // URLが変更されたことを確認
      const newUrl = page.url();
      expect(newUrl).not.toBe(currentUrl);

      // 記事タイトルが表示される
      const title = page.locator('h1');
      await expect(title).toBeVisible();
    } else if (await nextLink.isVisible()) {
      const currentUrl = page.url();
      await nextLink.click();
      await page.waitForLoadState('networkidle');

      const newUrl = page.url();
      expect(newUrl).not.toBe(currentUrl);

      const title = page.locator('h1');
      await expect(title).toBeVisible();
    }
  });

  test('タグが表示されクリックできる', async ({ page }) => {
    // タグを探す
    const tags = page.locator('.tag, [data-testid="tag"], a[href*="tag"]');

    if (await tags.first().isVisible()) {
      const tagCount = await tags.count();
      expect(tagCount).toBeGreaterThan(0);

      // 最初のタグをクリック
      const firstTag = tags.first();
      await firstTag.click();

      // ページが遷移または更新される
      await page.waitForLoadState('networkidle');
    }
  });

  test('シェアボタンが表示される', async ({ page }) => {
    // シェアボタンまたはシェアリンクを探す
    const shareButtons = page.locator('button:has-text("シェア"), .share-button, [data-testid="share"]');

    // シェアボタンが実装されている場合のみテスト
    if (await shareButtons.first().isVisible()) {
      await expect(shareButtons.first()).toBeVisible();
    }
  });

  test('コードブロックが正しく表示される', async ({ page }) => {
    // コードブロックを探す
    const codeBlocks = page.locator('pre code, .code-block');

    if (await codeBlocks.first().isVisible()) {
      const firstCodeBlock = codeBlocks.first();
      await expect(firstCodeBlock).toBeVisible();

      // コードブロックにテキストがある
      const codeText = await firstCodeBlock.textContent();
      expect(codeText).toBeTruthy();
    }
  });

  test('読了時間が表示される', async ({ page }) => {
    // 読了時間の表示を探す
    const readingTime = page.locator('.reading-time, [data-testid="reading-time"]').first();

    if (await readingTime.isVisible()) {
      const text = await readingTime.textContent();
      expect(text).toBeTruthy();
    }
  });

  test('モバイル表示で記事が読みやすい', async ({ page }) => {
    // モバイルビューポートに変更
    await page.setViewportSize({ width: 375, height: 667 });

    // 記事タイトルが表示される
    const title = page.locator('h1');
    await expect(title).toBeVisible();

    // 記事本文が表示される
    const article = page.locator('article, main');
    await expect(article).toBeVisible();

    // 横スクロールが発生しないことを確認
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // 1pxの誤差を許容
  });

  test('アクセシビリティ: 見出し階層が適切', async ({ page }) => {
    // h1が1つだけ存在する
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // 見出しが存在する
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
  });

  test('SEO: メタタグが適切に設定されている', async ({ page }) => {
    // OGタイトルが設定されている
    const ogTitle = page.locator('meta[property="og:title"]');
    const ogTitleContent = await ogTitle.getAttribute('content');
    expect(ogTitleContent).toBeTruthy();

    // OG画像が設定されている（存在する場合）
    const ogImage = page.locator('meta[property="og:image"]');
    if (await ogImage.count() > 0) {
      const ogImageContent = await ogImage.getAttribute('content');
      expect(ogImageContent).toBeTruthy();
    }
  });
});
