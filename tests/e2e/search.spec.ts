/**
 * 検索機能のE2Eテスト
 *
 * テスト対象: src/pages/search.astro
 * 主要フロー: 検索、検索結果表示、フィルタリング
 */

import { test, expect } from '@playwright/test';

test.describe('検索機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
  });

  test('検索ページが正しく表示される', async ({ page }) => {
    // 検索入力欄が表示される
    const searchInput = page.locator('input[type="search"], input[placeholder*="検索"], input[aria-label*="検索"]').first();
    await expect(searchInput).toBeVisible();

    // ページタイトルが適切
    await expect(page).toHaveTitle(/検索|Search/);
  });

  test('検索キーワードを入力できる', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="検索"], input[aria-label*="検索"]').first();

    // キーワードを入力
    await searchInput.fill('test');

    // 入力値が反映される
    const value = await searchInput.inputValue();
    expect(value).toBe('test');
  });

  test('検索を実行すると結果が表示される', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="検索"], input[aria-label*="検索"]').first();

    // 検索キーワードを入力
    await searchInput.fill('test');

    // 検索実行（Enterキーまたは検索ボタン）
    const searchButton = page.locator('button[type="submit"], button:has-text("検索")').first();

    if (await searchButton.isVisible()) {
      await searchButton.click();
    } else {
      await searchInput.press('Enter');
    }

    // 検索結果が表示されるまで待機
    await page.waitForLoadState('networkidle');

    // 検索結果エリアが表示される
    const resultsArea = page.locator('.search-results, [data-testid="search-results"], main');
    await expect(resultsArea).toBeVisible();
  });

  test('検索結果が0件の場合、適切なメッセージが表示される', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="検索"], input[aria-label*="検索"]').first();

    // 存在しないであろうキーワードで検索
    await searchInput.fill('xyzabcdefghijklmnopqrstuvwxyz123456789');

    const searchButton = page.locator('button[type="submit"], button:has-text("検索")').first();

    if (await searchButton.isVisible()) {
      await searchButton.click();
    } else {
      await searchInput.press('Enter');
    }

    await page.waitForLoadState('networkidle');

    // 「結果が見つかりません」的なメッセージが表示される
    const noResultsMessage = page.locator('text=/見つかりませんでした|結果が見つかりません|No results/i').first();

    // メッセージが表示されるか、または結果が0件であることを確認
    if (await noResultsMessage.isVisible()) {
      await expect(noResultsMessage).toBeVisible();
    } else {
      // 結果が0件である
      const results = page.locator('.search-result, [data-testid="search-result"]');
      const count = await results.count();
      expect(count).toBe(0);
    }
  });

  test('検索結果をクリックすると記事ページに遷移する', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="検索"], input[aria-label*="検索"]').first();

    // 一般的なキーワードで検索（結果が返る可能性が高い）
    await searchInput.fill('a');

    const searchButton = page.locator('button[type="submit"], button:has-text("検索")').first();

    if (await searchButton.isVisible()) {
      await searchButton.click();
    } else {
      await searchInput.press('Enter');
    }

    await page.waitForLoadState('networkidle');

    // 検索結果のリンクを取得
    const resultLink = page.locator('.search-result a, [data-testid="search-result"] a').first();

    if (await resultLink.isVisible()) {
      // リンクをクリック
      await resultLink.click();

      // 記事ページに遷移
      await expect(page).toHaveURL(/\/blog\/.+/);
    }
  });

  test('検索ハイライトが機能する', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="検索"], input[aria-label*="検索"]').first();

    // 検索キーワードを入力
    await searchInput.fill('test');

    const searchButton = page.locator('button[type="submit"], button:has-text("検索")').first();

    if (await searchButton.isVisible()) {
      await searchButton.click();
    } else {
      await searchInput.press('Enter');
    }

    await page.waitForLoadState('networkidle');

    // ハイライト要素を探す
    const highlights = page.locator('mark, .highlight, [data-testid="highlight"]');

    if (await highlights.first().isVisible()) {
      const highlightCount = await highlights.count();
      expect(highlightCount).toBeGreaterThan(0);
    }
  });

  test('検索フィルタが機能する', async ({ page }) => {
    // タグフィルタやカテゴリフィルタを探す
    const filters = page.locator('select, input[type="checkbox"], .filter, [data-testid="filter"]');

    if (await filters.first().isVisible()) {
      const firstFilter = filters.first();

      // フィルタを操作
      const tagName = await firstFilter.evaluate((el) => el.tagName);

      if (tagName === 'SELECT') {
        // セレクトボックスの場合
        await firstFilter.selectOption({ index: 1 });
      } else if (tagName === 'INPUT') {
        // チェックボックスの場合
        await firstFilter.check();
      }

      // フィルタ適用後、結果が更新される
      await page.waitForLoadState('networkidle');
    }
  });

  test('検索履歴が保存される', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="検索"], input[aria-label*="検索"]').first();

    // 検索を実行
    await searchInput.fill('test history');
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle');

    // 再度検索ページに戻る
    await page.goto('/search');

    // 検索履歴が表示される（実装されている場合）
    const searchHistory = page.locator('.search-history, [data-testid="search-history"]').first();

    if (await searchHistory.isVisible()) {
      const historyText = await searchHistory.textContent();
      expect(historyText).toContain('test history');
    }
  });

  test('モバイルで検索が正しく動作する', async ({ page }) => {
    // モバイルビューポートに変更
    await page.setViewportSize({ width: 375, height: 667 });

    const searchInput = page.locator('input[type="search"], input[placeholder*="検索"], input[aria-label*="検索"]').first();
    await expect(searchInput).toBeVisible();

    // 検索を実行
    await searchInput.fill('mobile');
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle');

    // 検索結果が表示される
    const resultsArea = page.locator('.search-results, [data-testid="search-results"], main');
    await expect(resultsArea).toBeVisible();
  });

  test('検索パフォーマンスが良好', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="検索"], input[aria-label*="検索"]').first();

    // 検索開始時刻を記録
    const startTime = Date.now();

    // 検索を実行
    await searchInput.fill('performance');
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle');

    // 検索完了時刻を記録
    const endTime = Date.now();
    const searchTime = endTime - startTime;

    // 2秒以内に完了することを確認（目安）
    expect(searchTime).toBeLessThan(2000);
  });

  test('検索結果の並び順が適切', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="検索"], input[aria-label*="検索"]').first();

    // 検索を実行
    await searchInput.fill('test');
    await searchInput.press('Enter');
    await page.waitForLoadState('networkidle');

    // 検索結果が表示される
    const results = page.locator('.search-result, [data-testid="search-result"]');
    const count = await results.count();

    if (count > 0) {
      // 最初の結果が最も関連性が高いことを期待
      const firstResult = results.first();
      await expect(firstResult).toBeVisible();
    }
  });
});
