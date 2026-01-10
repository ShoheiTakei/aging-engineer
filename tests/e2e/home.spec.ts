/**
 * ホームページのE2Eテスト
 *
 * テスト対象: src/pages/index.astro
 * 主要フロー: ホームページアクセス、記事一覧表示、ナビゲーション
 */

import { test, expect } from '@playwright/test';

test.describe('ホームページ', () => {
  test.beforeEach(async ({ page }) => {
    // すべてのテスト前にホームページに移動
    await page.goto('/');
  });

  test('ホームページが正しく表示される', async ({ page }) => {
    // タイトルの確認
    await expect(page).toHaveTitle(/Aging Engineer/);

    // ヘッダーの確認
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // フッターの確認
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
  });

  test('ヘッダーナビゲーションが正しく機能する', async ({ page }) => {
    // ブログリンクをクリック
    const blogLink = page.locator('a[href*="/blog"]').first();
    await blogLink.click();

    // ブログページに遷移したことを確認
    await expect(page).toHaveURL(/\/blog/);
  });

  test('テーマ切り替えが動作する', async ({ page }) => {
    // テーマトグルボタンを探す
    const themeToggle = page.locator('button[aria-label*="テーマ"], button[aria-label*="theme"]').first();

    // ボタンが存在する場合のみテスト
    if (await themeToggle.isVisible()) {
      // 初期状態のdata-theme属性を取得
      const initialTheme = await page.locator('html').getAttribute('data-theme');

      // テーマトグルボタンをクリック
      await themeToggle.click();

      // テーマが変更されたことを確認
      const newTheme = await page.locator('html').getAttribute('data-theme');
      expect(newTheme).not.toBe(initialTheme);

      // もう一度クリックして元に戻る
      await themeToggle.click();
      const finalTheme = await page.locator('html').getAttribute('data-theme');
      expect(finalTheme).toBe(initialTheme);
    }
  });

  test('記事カードが表示される', async ({ page }) => {
    // 記事カードが少なくとも1つ表示されることを確認
    const blogCards = page.locator('article, .blog-card, [data-testid="blog-card"]');
    const count = await blogCards.count();

    // 記事が1つ以上存在することを確認
    expect(count).toBeGreaterThan(0);
  });

  test('記事カードをクリックすると記事詳細ページに遷移する', async ({ page }) => {
    // 最初の記事カードのリンクを見つける
    const firstArticleLink = page.locator('article a, .blog-card a, [data-testid="blog-card"] a').first();

    // リンクが存在する場合のみテスト
    if (await firstArticleLink.isVisible()) {
      // リンクをクリック
      await firstArticleLink.click();

      // 記事詳細ページに遷移したことを確認
      await expect(page).toHaveURL(/\/blog\//);

      // 記事タイトルが表示されることを確認
      const articleTitle = page.locator('h1');
      await expect(articleTitle).toBeVisible();
    }
  });

  test('ページのアクセシビリティ基準を満たす', async ({ page }) => {
    // メインコンテンツのランドマークが存在する
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // 見出しが階層的に配置されている（h1が存在する）
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    expect(h1Count).toBeGreaterThan(0);
  });

  test('レスポンシブデザインが機能する', async ({ page }) => {
    // モバイルビューポートに変更
    await page.setViewportSize({ width: 375, height: 667 });

    // ページが正しく表示される
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // タブレットビューポートに変更
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(header).toBeVisible();

    // デスクトップビューポートに変更
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(header).toBeVisible();
  });

  test('フッターに必要な情報が表示される', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // フッターのテキストコンテンツを確認
    const footerText = await footer.textContent();
    expect(footerText).toBeTruthy();
  });
});
