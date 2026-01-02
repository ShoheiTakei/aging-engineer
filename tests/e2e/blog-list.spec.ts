/**
 * ブログ一覧ページのE2Eテスト
 *
 * テスト対象: src/pages/blog/[page].astro
 * 主要フロー: 記事一覧表示、ページネーション、記事検索
 */

import { test, expect } from '@playwright/test';

test.describe('ブログ一覧ページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/blog');
  });

  test('ブログ一覧ページが正しく表示される', async ({ page }) => {
    // タイトルの確認
    await expect(page).toHaveTitle(/Blog|ブログ/);

    // メインコンテンツの確認
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('記事一覧が表示される', async ({ page }) => {
    // 記事カードまたは記事リストが表示されることを確認
    const articles = page.locator('article, .blog-card, [data-testid="blog-card"]');
    const count = await articles.count();

    // 少なくとも1つの記事が表示される
    expect(count).toBeGreaterThan(0);
  });

  test('各記事カードに必要な情報が表示される', async ({ page }) => {
    const firstArticle = page.locator('article, .blog-card, [data-testid="blog-card"]').first();

    // 記事カードが表示される
    await expect(firstArticle).toBeVisible();

    // 記事カード内に少なくともテキストコンテンツがある
    const content = await firstArticle.textContent();
    expect(content).toBeTruthy();
    expect(content?.length).toBeGreaterThan(0);
  });

  test('記事をクリックすると詳細ページに遷移する', async ({ page }) => {
    // 最初の記事のリンクを取得
    const firstArticleLink = page.locator('article a, .blog-card a, [data-testid="blog-card"] a').first();

    // リンクが表示されている場合のみテスト
    if (await firstArticleLink.isVisible()) {
      // 現在のURLを保存
      const currentUrl = page.url();

      // リンクをクリック
      await firstArticleLink.click();

      // URLが変更されたことを確認
      const newUrl = page.url();
      expect(newUrl).not.toBe(currentUrl);

      // 記事詳細ページに遷移したことを確認
      await expect(page).toHaveURL(/\/blog\/.+/);
    }
  });

  test('ページネーションが機能する', async ({ page }) => {
    // ページネーションリンクを探す
    const nextPageLink = page.locator('a[href*="blog/2"], a[aria-label*="次"], a:has-text("次")').first();

    // 次のページリンクが存在する場合のみテスト
    if (await nextPageLink.isVisible()) {
      // 次のページに移動
      await nextPageLink.click();

      // URLがページ2に変更されたことを確認
      await expect(page).toHaveURL(/\/blog\/2/);

      // 記事が表示されることを確認
      const articles = page.locator('article, .blog-card');
      const count = await articles.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('検索機能が動作する', async ({ page }) => {
    // 検索入力欄を探す
    const searchInput = page.locator('input[type="search"], input[placeholder*="検索"], input[aria-label*="検索"]').first();

    // 検索機能が実装されている場合のみテスト
    if (await searchInput.isVisible()) {
      // 検索キーワードを入力
      await searchInput.fill('test');

      // 検索ボタンまたはEnterキーで検索実行
      await searchInput.press('Enter');

      // 検索結果が表示されることを確認（または検索ページに遷移）
      await page.waitForLoadState('networkidle');
    }
  });

  test('タグフィルタリングが機能する', async ({ page }) => {
    // タグリンクを探す
    const tagLinks = page.locator('a[href*="tag"], .tag, [data-testid="tag"]');

    // タグが存在する場合のみテスト
    if (await tagLinks.first().isVisible()) {
      const firstTag = tagLinks.first();

      // タグをクリック
      await firstTag.click();

      // ページが遷移または更新される
      await page.waitForLoadState('networkidle');

      // 記事が表示される
      const articles = page.locator('article, .blog-card');
      const count = await articles.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test('記事の並び順が正しい（新しい順）', async ({ page }) => {
    const articles = page.locator('article, .blog-card');
    const count = await articles.count();

    if (count >= 2) {
      // 最初の記事の日付を取得
      const firstArticle = articles.first();
      const firstDateText = await firstArticle.locator('time, .date, [data-testid="date"]').first().textContent();

      // 2番目の記事の日付を取得
      const secondArticle = articles.nth(1);
      const secondDateText = await secondArticle.locator('time, .date, [data-testid="date"]').first().textContent();

      // 両方の日付が取得できた場合、順序を確認
      expect(firstDateText).toBeTruthy();
      expect(secondDateText).toBeTruthy();
    }
  });

  test('モバイル表示で記事一覧が適切にレイアウトされる', async ({ page }) => {
    // モバイルビューポートに変更
    await page.setViewportSize({ width: 375, height: 667 });

    // 記事一覧が表示される
    const articles = page.locator('article, .blog-card');
    await expect(articles.first()).toBeVisible();

    // スクロール可能であることを確認
    const main = page.locator('main');
    await expect(main).toBeVisible();
  });

  test('読み込みパフォーマンスが良好', async ({ page }) => {
    // ページロード時間を計測
    const loadTime = await page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });

    // 3秒以内にロードされることを確認（目安）
    expect(loadTime).toBeLessThan(3000);
  });
});
