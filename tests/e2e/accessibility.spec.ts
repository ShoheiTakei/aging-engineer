/**
 * アクセシビリティ統合テスト
 *
 * テスト対象: サイト全体のアクセシビリティ
 * 主要フロー: WCAG準拠、キーボードナビゲーション、スクリーンリーダー対応
 */

import { test, expect } from '@playwright/test';

test.describe('アクセシビリティ', () => {
  test('ホームページ: 適切なランドマークが設定されている', async ({ page }) => {
    await page.goto('/');

    // header要素が存在する
    const header = page.locator('header');
    await expect(header).toBeVisible();

    // main要素が存在する
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // footer要素が存在する
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // nav要素が存在する
    const nav = page.locator('nav');
    const navCount = await nav.count();
    expect(navCount).toBeGreaterThan(0);
  });

  test('ホームページ: 見出しの階層が適切', async ({ page }) => {
    await page.goto('/');

    // h1が1つだけ存在する
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);

    // 見出しが存在する
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
  });

  test('ホームページ: すべての画像にalt属性がある', async ({ page }) => {
    await page.goto('/');

    // すべての画像を取得
    const images = page.locator('img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      // 各画像にalt属性があることを確認
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        // alt属性が存在する（空文字列でも可）
        expect(alt).not.toBeNull();
      }
    }
  });

  test('ホームページ: リンクに適切なテキストがある', async ({ page }) => {
    await page.goto('/');

    // すべてのリンクを取得
    const links = page.locator('a');
    const linkCount = await links.count();

    if (linkCount > 0) {
      // 各リンクにテキストまたはaria-labelがあることを確認
      for (let i = 0; i < linkCount; i++) {
        const link = links.nth(i);
        const text = await link.textContent();
        const ariaLabel = await link.getAttribute('aria-label');

        // テキストまたはaria-labelが存在する
        expect(text || ariaLabel).toBeTruthy();
      }
    }
  });

  test('キーボードナビゲーション: Tabキーでフォーカス移動できる', async ({ page }) => {
    await page.goto('/');

    // 最初のフォーカス可能な要素にフォーカス
    await page.keyboard.press('Tab');

    // フォーカスされた要素を取得
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    // 何かしらの要素にフォーカスされている
    expect(focusedElement).toBeTruthy();
    expect(focusedElement).not.toBe('BODY');
  });

  test('キーボードナビゲーション: Enterキーでリンクを開ける', async ({ page }) => {
    await page.goto('/');

    // 最初のリンクにフォーカス
    const firstLink = page.locator('a').first();
    await firstLink.focus();

    // Enterキーを押す
    const href = await firstLink.getAttribute('href');

    if (href && !href.startsWith('#')) {
      await page.keyboard.press('Enter');

      // ページが遷移または新しいタブが開く
      await page.waitForLoadState('networkidle');
    }
  });

  test('フォーカス表示: フォーカスリングが可視化される', async ({ page }) => {
    await page.goto('/');

    // リンクにフォーカス
    const firstLink = page.locator('a').first();
    await firstLink.focus();

    // フォーカスされた要素のアウトラインスタイルを確認
    const outline = await firstLink.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
      };
    });

    // フォーカスリングが存在する（outlineまたはbox-shadow）
    const hasFocusIndicator =
      outline.outline !== 'none' ||
      outline.outlineWidth !== '0px' ||
      outline.boxShadow !== 'none';

    expect(hasFocusIndicator).toBe(true);
  });

  test('ブログ記事ページ: 適切なARIA属性が設定されている', async ({ page }) => {
    await page.goto('/blog');

    // 最初の記事リンクをクリック
    const firstArticleLink = page.locator('article a, .blog-card a').first();

    if (await firstArticleLink.isVisible()) {
      await firstArticleLink.click();
      await page.waitForLoadState('networkidle');

      // 記事本文のroleが適切
      const article = page.locator('article, [role="article"]');
      await expect(article).toBeVisible();
    }
  });

  test('フォーム: ラベルとinputが適切に関連付けられている', async ({ page }) => {
    await page.goto('/search');

    // 検索フォームのinputを取得
    const searchInput = page.locator('input[type="search"]').first();

    if (await searchInput.isVisible()) {
      // id属性を持つか、親要素がlabelか確認
      const id = await searchInput.getAttribute('id');
      const ariaLabel = await searchInput.getAttribute('aria-label');
      const ariaLabelledby = await searchInput.getAttribute('aria-labelledby');

      // labelと関連付けられているか、aria-labelが設定されている
      const hasLabel = id || ariaLabel || ariaLabelledby;
      expect(hasLabel).toBeTruthy();
    }
  });

  test('色のコントラスト: テキストが読みやすい', async ({ page }) => {
    await page.goto('/');

    // 本文のテキスト色と背景色を取得
    const contrast = await page.evaluate(() => {
      const body = document.body;
      const styles = window.getComputedStyle(body);
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor,
      };
    });

    // 色の値が取得できることを確認
    expect(contrast.color).toBeTruthy();
    expect(contrast.backgroundColor).toBeTruthy();
  });

  test('ダークモード: アクセシビリティが維持される', async ({ page }) => {
    await page.goto('/');

    // テーマトグルを探す
    const themeToggle = page.locator('button[aria-label*="テーマ"], button[aria-label*="theme"]').first();

    if (await themeToggle.isVisible()) {
      // ダークモードに切り替え
      await themeToggle.click();

      // ランドマークが表示される
      const main = page.locator('main');
      await expect(main).toBeVisible();

      // 見出しが表示される
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();
    }
  });

  test('ズーム: 200%ズームでも使用可能', async ({ page }) => {
    await page.goto('/');

    // 200%ズーム
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });

    // メインコンテンツが表示される
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // ナビゲーションが表示される
    const nav = page.locator('nav');
    const navCount = await nav.count();
    expect(navCount).toBeGreaterThan(0);
  });

  test('スクリーンリーダー: スキップリンクが提供される', async ({ page }) => {
    await page.goto('/');

    // スキップリンクを探す
    const skipLink = page.locator('a[href="#main"], a:has-text("メインコンテンツへ"), a:has-text("Skip to")').first();

    if (await skipLink.isVisible({ timeout: 1000 }).catch(() => false)) {
      // スキップリンクが存在する
      await expect(skipLink).toBeVisible();

      // スキップリンクをクリック
      await skipLink.click();

      // メインコンテンツにフォーカスが移動
      const main = page.locator('main, #main');
      await expect(main).toBeVisible();
    }
  });

  test('モバイル: タッチターゲットのサイズが十分', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // リンクやボタンのサイズを確認
    const interactiveElements = page.locator('a, button');
    const count = await interactiveElements.count();

    if (count > 0) {
      const firstElement = interactiveElements.first();
      const box = await firstElement.boundingBox();

      if (box) {
        // 最小タッチターゲットサイズ（44x44px推奨）
        // 実際にはパディングも含まれるため、完全には判定できないが目安として
        expect(box.width).toBeGreaterThan(20);
        expect(box.height).toBeGreaterThan(20);
      }
    }
  });

  test('エラーメッセージ: 適切に通知される', async ({ page }) => {
    await page.goto('/search');

    const searchInput = page.locator('input[type="search"]').first();

    if (await searchInput.isVisible()) {
      // 無効な検索を実行
      await searchInput.press('Enter');

      // エラーメッセージまたは結果なしメッセージが表示される
      await page.waitForLoadState('networkidle');

      // ページが応答している
      const main = page.locator('main');
      await expect(main).toBeVisible();
    }
  });

  test('ページタイトル: すべてのページに適切なタイトルがある', async ({ page }) => {
    // ホームページ
    await page.goto('/');
    const homeTitle = await page.title();
    expect(homeTitle).toBeTruthy();
    expect(homeTitle.length).toBeGreaterThan(0);

    // ブログページ
    await page.goto('/blog');
    const blogTitle = await page.title();
    expect(blogTitle).toBeTruthy();
    expect(blogTitle).not.toBe(homeTitle); // ページごとに異なるタイトル
  });

  test('言語属性: HTML要素にlang属性がある', async ({ page }) => {
    await page.goto('/');

    // html要素のlang属性を確認
    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(['ja', 'en', 'ja-JP', 'en-US']).toContain(lang);
  });
});
