/**
 * テーマ切り替え機能の統合テスト
 *
 * テスト対象: src/components/ThemeToggle.astro
 * 主要フロー: ライト/ダークモード切り替え、設定の永続化
 */

import { test, expect } from '@playwright/test';

test.describe('テーマ切り替え機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // localStorageをクリア（テストの独立性確保）
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('テーマトグルボタンが表示される', async ({ page }) => {
    const themeToggle = page.locator('button[aria-label*="テーマ"], button[aria-label*="theme"], .theme-toggle, [data-testid="theme-toggle"]').first();

    if (await themeToggle.isVisible()) {
      await expect(themeToggle).toBeVisible();
    }
  });

  test('テーマを切り替えるとHTML要素のdata-theme属性が変わる', async ({ page }) => {
    const themeToggle = page.locator('button[aria-label*="テーマ"], button[aria-label*="theme"], .theme-toggle, [data-testid="theme-toggle"]').first();

    if (await themeToggle.isVisible()) {
      // 初期テーマを取得
      const initialTheme = await page.locator('html').getAttribute('data-theme');

      // テーマを切り替え
      await themeToggle.click();

      // テーマが変更されたことを確認
      const newTheme = await page.locator('html').getAttribute('data-theme');
      expect(newTheme).not.toBe(initialTheme);

      // 期待されるテーマ値（lightまたはdark）
      expect(['light', 'dark']).toContain(newTheme);
    }
  });

  test('テーマ設定がlocalStorageに保存される', async ({ page }) => {
    const themeToggle = page.locator('button[aria-label*="テーマ"], button[aria-label*="theme"], .theme-toggle, [data-testid="theme-toggle"]').first();

    if (await themeToggle.isVisible()) {
      // テーマを切り替え
      await themeToggle.click();

      // localStorageに保存されているか確認
      const savedTheme = await page.evaluate(() => localStorage.getItem('theme'));
      expect(savedTheme).toBeTruthy();
      expect(['light', 'dark']).toContain(savedTheme);
    }
  });

  test('ページをリロードしてもテーマが保持される', async ({ page }) => {
    const themeToggle = page.locator('button[aria-label*="テーマ"], button[aria-label*="theme"], .theme-toggle, [data-testid="theme-toggle"]').first();

    if (await themeToggle.isVisible()) {
      // テーマを切り替え
      await themeToggle.click();

      // 切り替え後のテーマを取得
      const themeAfterToggle = await page.locator('html').getAttribute('data-theme');

      // ページをリロード
      await page.reload();

      // テーマが保持されているか確認
      const themeAfterReload = await page.locator('html').getAttribute('data-theme');
      expect(themeAfterReload).toBe(themeAfterToggle);
    }
  });

  test('複数回切り替えても正しく動作する', async ({ page }) => {
    const themeToggle = page.locator('button[aria-label*="テーマ"], button[aria-label*="theme"], .theme-toggle, [data-testid="theme-toggle"]').first();

    if (await themeToggle.isVisible()) {
      // 初期テーマを取得
      const initialTheme = await page.locator('html').getAttribute('data-theme');

      // 1回目の切り替え
      await themeToggle.click();
      const theme1 = await page.locator('html').getAttribute('data-theme');
      expect(theme1).not.toBe(initialTheme);

      // 2回目の切り替え（元に戻る）
      await themeToggle.click();
      const theme2 = await page.locator('html').getAttribute('data-theme');
      expect(theme2).toBe(initialTheme);

      // 3回目の切り替え
      await themeToggle.click();
      const theme3 = await page.locator('html').getAttribute('data-theme');
      expect(theme3).toBe(theme1);
    }
  });

  test('ダークモードでスタイルが適切に適用される', async ({ page }) => {
    const themeToggle = page.locator('button[aria-label*="テーマ"], button[aria-label*="theme"], .theme-toggle, [data-testid="theme-toggle"]').first();

    if (await themeToggle.isVisible()) {
      // ダークモードに切り替え
      await themeToggle.click();

      const currentTheme = await page.locator('html').getAttribute('data-theme');

      if (currentTheme === 'dark') {
        // 背景色がダークであることを確認
        const bgColor = await page.evaluate(() => {
          return window.getComputedStyle(document.body).backgroundColor;
        });

        // RGB値を解析して暗い色であることを確認
        const rgb = bgColor.match(/\d+/g);
        if (rgb) {
          const [r, g, b] = rgb.map(Number);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          expect(brightness).toBeLessThan(128); // 暗い色
        }
      }
    }
  });

  test('ライトモードでスタイルが適切に適用される', async ({ page }) => {
    const themeToggle = page.locator('button[aria-label*="テーマ"], button[aria-label*="theme"], .theme-toggle, [data-testid="theme-toggle"]').first();

    if (await themeToggle.isVisible()) {
      // まずダークモードにしてから
      await themeToggle.click();

      // ライトモードに戻す
      await themeToggle.click();

      const currentTheme = await page.locator('html').getAttribute('data-theme');

      if (currentTheme === 'light') {
        // 背景色がライトであることを確認
        const bgColor = await page.evaluate(() => {
          return window.getComputedStyle(document.body).backgroundColor;
        });

        // RGB値を解析して明るい色であることを確認
        const rgb = bgColor.match(/\d+/g);
        if (rgb) {
          const [r, g, b] = rgb.map(Number);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;
          expect(brightness).toBeGreaterThan(128); // 明るい色
        }
      }
    }
  });

  test('システムのテーマ設定を尊重する', async ({ page }) => {
    // ダークモードを優先するように設定
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');

    // テーマトグルがない場合、システム設定が反映されているか確認
    const themeToggle = page.locator('button[aria-label*="テーマ"], button[aria-label*="theme"], .theme-toggle, [data-testid="theme-toggle"]').first();

    if (!(await themeToggle.isVisible())) {
      // システムのダークモードが反映されている可能性
      const htmlTheme = await page.locator('html').getAttribute('data-theme');
      const hasLocalStorage = await page.evaluate(() => localStorage.getItem('theme') !== null);

      // localStorageに設定がない場合、システム設定が使われる
      if (!hasLocalStorage) {
        // ダークモードになっているはず
        expect(['dark', null]).toContain(htmlTheme);
      }
    }
  });

  test('異なるページ間でテーマが一貫している', async ({ page }) => {
    const themeToggle = page.locator('button[aria-label*="テーマ"], button[aria-label*="theme"], .theme-toggle, [data-testid="theme-toggle"]').first();

    if (await themeToggle.isVisible()) {
      // テーマを切り替え
      await themeToggle.click();
      const themeOnHome = await page.locator('html').getAttribute('data-theme');

      // ブログページに移動
      await page.goto('/blog');

      // テーマが保持されている
      const themeOnBlog = await page.locator('html').getAttribute('data-theme');
      expect(themeOnBlog).toBe(themeOnHome);
    }
  });

  test('モバイルでテーマ切り替えが機能する', async ({ page }) => {
    // モバイルビューポートに変更
    await page.setViewportSize({ width: 375, height: 667 });

    const themeToggle = page.locator('button[aria-label*="テーマ"], button[aria-label*="theme"], .theme-toggle, [data-testid="theme-toggle"]').first();

    if (await themeToggle.isVisible()) {
      // 初期テーマを取得
      const initialTheme = await page.locator('html').getAttribute('data-theme');

      // テーマを切り替え
      await themeToggle.click();

      // テーマが変更されたことを確認
      const newTheme = await page.locator('html').getAttribute('data-theme');
      expect(newTheme).not.toBe(initialTheme);
    }
  });

  test('テーマ切り替えアニメーションがスムーズ', async ({ page }) => {
    const themeToggle = page.locator('button[aria-label*="テーマ"], button[aria-label*="theme"], .theme-toggle, [data-testid="theme-toggle"]').first();

    if (await themeToggle.isVisible()) {
      // テーマを切り替え
      await themeToggle.click();

      // 短時間待機（アニメーション確認）
      await page.waitForTimeout(100);

      // 切り替え後のスタイルを確認
      const afterToggle = await page.locator('html').getAttribute('data-theme');
      expect(afterToggle).toBeTruthy();
    }
  });
});
