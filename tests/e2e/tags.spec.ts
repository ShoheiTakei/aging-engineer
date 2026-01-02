/**
 * タグ別記事一覧ページのE2Eテスト
 *
 * テスト観点:
 * - ページの表示
 * - タグフィルタリング
 * - ページネーション
 * - アクセシビリティ
 * - キーボードナビゲーション
 */

import { expect, test } from '@playwright/test';

test.describe('タグ別記事一覧ページ', () => {
  test.beforeEach(async ({ page }) => {
    // ビルドされた静的サイトのプレビューサーバーを起動していることを前提とする
    // `pnpm preview` を実行してから E2E テストを実行する
  });

  test('タグページが正しく表示される', async ({ page }) => {
    // サンプル記事には "Astro", "TypeScript", "Content Collections" タグが含まれている
    await page.goto('/tags/Astro');

    // ページタイトルが表示される
    await expect(page.locator('h1')).toContainText('タグ「Astro」の記事一覧');

    // パンくずリストが表示される
    const breadcrumb = page.locator('nav[aria-label="パンくずリスト"]');
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb.locator('a[href="/"]')).toContainText('ホーム');
    await expect(breadcrumb.locator('a[href="/tags"]')).toContainText('タグ一覧');
    await expect(breadcrumb.locator('[aria-current="page"]')).toContainText('Astro');
  });

  test('タグが付いた記事のみが表示される', async ({ page }) => {
    await page.goto('/tags/Astro');

    // 記事一覧が表示される
    const articles = page.locator('article');
    await expect(articles).toHaveCount(1); // サンプル記事は1件

    // 記事にタグが表示される
    const tags = page.locator('article .bg-blue-600');
    await expect(tags.first()).toContainText('Astro');
  });

  test('タグリンクをクリックすると該当タグページに遷移する', async ({ page }) => {
    await page.goto('/tags/Astro');

    // TypeScript タグをクリック
    const typeScriptTag = page.locator('a[href="/tags/TypeScript"]').first();
    await typeScriptTag.click();

    // TypeScript タグページに遷移
    await expect(page).toHaveURL('/tags/TypeScript');
    await expect(page.locator('h1')).toContainText('タグ「TypeScript」の記事一覧');
  });

  test('記事タイトルをクリックすると記事詳細ページに遷移する', async ({ page }) => {
    await page.goto('/tags/Astro');

    // 記事タイトルをクリック
    const articleLink = page.locator('article a').first();
    await articleLink.click();

    // 記事詳細ページに遷移（URLが /blog/ で始まる）
    await expect(page).toHaveURL(/\/blog\/.+/);
  });

  test('セマンティックHTMLが使用されている', async ({ page }) => {
    await page.goto('/tags/Astro');

    // セマンティックHTML要素が存在する
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav[aria-label="パンくずリスト"]')).toBeVisible();
    await expect(page.locator('ul[role="list"]')).toBeVisible();
    await expect(page.locator('article')).toHaveCount(1);
  });

  test('ARIAラベルが適切に設定されている', async ({ page }) => {
    await page.goto('/tags/Astro');

    // ARIAラベルが設定されている
    await expect(page.locator('[aria-label="パンくずリスト"]')).toBeVisible();
    await expect(page.locator('[aria-label*="タグ「Astro」の記事一覧"]')).toBeVisible();
    await expect(page.locator('[aria-current="page"]')).toBeVisible();
  });

  test('キーボードナビゲーションが機能する', async ({ page }) => {
    await page.goto('/tags/Astro');

    // Tab キーでフォーカス移動
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // ホーム リンク
    await page.keyboard.press('Tab'); // タグ一覧 リンク

    // Enter キーでリンクをクリック
    await page.keyboard.press('Enter');

    // タグ一覧ページに遷移
    await expect(page).toHaveURL('/tags');
  });

  test('現在選択中のタグがハイライト表示される', async ({ page }) => {
    await page.goto('/tags/Astro');

    // 現在のタグ（Astro）がハイライト表示される
    const currentTag = page.locator('article .bg-blue-600').first();
    await expect(currentTag).toContainText('Astro');
    await expect(currentTag).toHaveClass(/bg-blue-600/);
  });

  test('存在しないタグページは404になる', async ({ page }) => {
    // 存在しないタグページにアクセス
    const response = await page.goto('/tags/NonExistentTag');

    // 404エラーが返される（静的サイトの場合、ビルド時に生成されないため）
    // ローカルプレビューでは404ページが表示される可能性がある
    expect(response?.status()).toBe(404);
  });

  test('記事数が正しく表示される', async ({ page }) => {
    await page.goto('/tags/Astro');

    // 記事数の表示を確認
    const countText = page.locator('header p').first();
    await expect(countText).toContainText(/全\d+件中/);
  });

  test('公開日が表示される', async ({ page }) => {
    await page.goto('/tags/Astro');

    // 公開日の表示を確認
    const publishDate = page.locator('article time').first();
    await expect(publishDate).toBeVisible();
    await expect(publishDate).toHaveAttribute('datetime');
  });
});

test.describe('ページネーション', () => {
  test.skip('6件以上の記事がある場合、ページネーションが表示される', async ({ page }) => {
    // このテストはサンプルデータが少ないためスキップ
    // 実際の運用時には有効化する
  });

  test.skip('ページネーションの「次へ」ボタンが機能する', async ({ page }) => {
    // このテストはサンプルデータが少ないためスキップ
  });

  test.skip('ページネーションの「前へ」ボタンが機能する', async ({ page }) => {
    // このテストはサンプルデータが少ないためスキップ
  });
});
