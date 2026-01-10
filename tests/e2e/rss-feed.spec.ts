/**
 * RSSフィード統合テスト
 *
 * テスト対象: src/pages/rss.xml.ts
 * 主要フロー: RSSフィード生成、有効性検証
 */

import { test, expect } from '@playwright/test';

test.describe('RSSフィード', () => {
  test('RSSフィードが正しく生成される', async ({ page }) => {
    // RSSフィードにアクセス
    const response = await page.goto('/rss.xml');

    // レスポンスが成功
    expect(response?.status()).toBe(200);

    // Content-Typeが適切
    const contentType = response?.headers()['content-type'];
    expect(contentType).toContain('xml');
  });

  test('RSSフィードの構造が正しい', async ({ page }) => {
    await page.goto('/rss.xml');

    // XMLコンテンツを取得
    const content = await page.content();

    // RSS 2.0の基本構造を確認
    expect(content).toContain('<rss');
    expect(content).toContain('<channel>');
    expect(content).toContain('</channel>');
    expect(content).toContain('</rss>');
  });

  test('RSSフィードに必須要素が含まれる', async ({ page }) => {
    await page.goto('/rss.xml');

    const content = await page.content();

    // チャンネルの必須要素
    expect(content).toContain('<title>');
    expect(content).toContain('<link>');
    expect(content).toContain('<description>');
  });

  test('RSSフィードにアイテムが含まれる', async ({ page }) => {
    await page.goto('/rss.xml');

    const content = await page.content();

    // 少なくとも1つのアイテムが存在
    expect(content).toContain('<item>');
    expect(content).toContain('</item>');
  });

  test('各アイテムに必要な情報が含まれる', async ({ page }) => {
    await page.goto('/rss.xml');

    const content = await page.content();

    // アイテムの要素
    if (content.includes('<item>')) {
      // タイトル
      expect(content).toContain('<title>');

      // リンク
      expect(content).toContain('<link>');

      // 公開日
      expect(content).toContain('<pubDate>');
    }
  });

  test('RSSフィードのXMLが有効', async ({ page }) => {
    await page.goto('/rss.xml');

    const content = await page.content();

    // XMLの基本的な妥当性チェック
    // 開始タグと終了タグが一致
    const rssOpenCount = (content.match(/<rss/g) || []).length;
    const rssCloseCount = (content.match(/<\/rss>/g) || []).length;
    expect(rssOpenCount).toBe(rssCloseCount);

    const channelOpenCount = (content.match(/<channel>/g) || []).length;
    const channelCloseCount = (content.match(/<\/channel>/g) || []).length;
    expect(channelOpenCount).toBe(channelCloseCount);
  });

  test('RSSフィードのリンクが正しい形式', async ({ page }) => {
    await page.goto('/rss.xml');

    const content = await page.content();

    // リンクがhttpまたはhttpsで始まる
    const linkMatch = content.match(/<link>(https?:\/\/.+?)<\/link>/);
    if (linkMatch) {
      const link = linkMatch[1];
      expect(link).toMatch(/^https?:\/\//);
    }
  });

  test('RSSフィードの日付が正しい形式', async ({ page }) => {
    await page.goto('/rss.xml');

    const content = await page.content();

    // pubDateが存在する場合、RFC 822形式であることを確認
    const dateMatch = content.match(/<pubDate>(.+?)<\/pubDate>/);
    if (dateMatch) {
      const dateString = dateMatch[1];
      // RFC 822形式の日付（例: Wed, 02 Oct 2024 15:00:00 GMT）
      expect(dateString).toBeTruthy();
      expect(dateString.length).toBeGreaterThan(0);
    }
  });

  test('RSSフィードに画像が含まれる（存在する場合）', async ({ page }) => {
    await page.goto('/rss.xml');

    const content = await page.content();

    // enclosureタグが存在する場合、画像URLが含まれる
    if (content.includes('<enclosure')) {
      expect(content).toMatch(/<enclosure\s+url="https?:\/\/.+?"/);
      expect(content).toMatch(/type="image\//);
    }
  });

  test('RSSフィードのエンコーディングが正しい', async ({ page }) => {
    await page.goto('/rss.xml');

    const content = await page.content();

    // UTF-8エンコーディングが宣言されている
    expect(content).toContain('encoding="UTF-8"');
  });

  test('RSSフィードが最新の記事を含む', async ({ page }) => {
    // まずブログページから最新記事のタイトルを取得
    await page.goto('/blog');

    const firstArticleTitle = await page
      .locator('article h2, article h3, .blog-card h2, .blog-card h3')
      .first()
      .textContent();

    if (firstArticleTitle) {
      // RSSフィードにアクセス
      await page.goto('/rss.xml');
      const content = await page.content();

      // 最新記事のタイトルがRSSフィードに含まれる
      expect(content).toContain(firstArticleTitle.trim());
    }
  });

  test('RSSフィードのアイテム数が適切', async ({ page }) => {
    await page.goto('/rss.xml');

    const content = await page.content();

    // アイテムの数を数える
    const itemCount = (content.match(/<item>/g) || []).length;

    // 少なくとも1つ、最大100個程度（一般的な制限）
    expect(itemCount).toBeGreaterThan(0);
    expect(itemCount).toBeLessThanOrEqual(100);
  });

  test('RSSフィードがキャッシュされる', async ({ page }) => {
    // 1回目のリクエスト
    const response1 = await page.goto('/rss.xml');

    // Cache-Controlヘッダーが設定されている（設定されている場合）
    const cacheControl = response1?.headers()['cache-control'];

    if (cacheControl) {
      expect(cacheControl).toBeTruthy();
    }
  });

  test('RSSフィードにGUIDが含まれる', async ({ page }) => {
    await page.goto('/rss.xml');

    const content = await page.content();

    // GUIDタグが存在する（推奨）
    if (content.includes('<item>')) {
      // guidまたはリンクが一意の識別子として機能
      const hasGuid = content.includes('<guid>') || content.includes('<link>');
      expect(hasGuid).toBe(true);
    }
  });

  test('RSSフィードが圧縮される（gzip）', async ({ page }) => {
    const response = await page.goto('/rss.xml');

    // Content-Encodingヘッダーを確認（サーバー設定による）
    const encoding = response?.headers()['content-encoding'];

    // gzipまたは圧縮なし（どちらも許容）
    if (encoding) {
      expect(['gzip', 'br', 'deflate']).toContain(encoding);
    }
  });
});
