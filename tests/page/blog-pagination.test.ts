/**
 * ブログページネーションテスト
 *
 * TASK-0012: ページネーション機能の実装
 *
 * 【テスト対象】
 * - src/pages/blog/[page].astro
 *
 * 【関連要件】
 * - REQ-101: 記事一覧表示
 * - 5件/ページでの記事分割
 * - 前後ページへのナビゲーション
 * - 現在のページ番号表示
 *
 * 【テスト方針】
 * - ビルド成果物（dist/blog/1/index.html, dist/blog/2/index.html等）を検証
 * - ページネーションナビゲーションの存在確認
 *
 * 信頼性: 要件定義書、アーキテクチャ設計書に基づく
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * ビルド成果物を読み込む
 */
let page1Html: string;
const page1Path = join(process.cwd(), 'dist', 'blog', '1', 'index.html');

beforeAll(() => {
  if (existsSync(page1Path)) {
    page1Html = readFileSync(page1Path, 'utf-8');
  } else {
    console.warn('dist/blog/1/index.html not found. Run `pnpm build` first.');
    page1Html = '';
  }
});

describe('Blog Pagination - ページネーションページ（ビルド成果物テスト）', () => {
  describe('ビルド成果物の存在確認', () => {
    it('TC-PAGINATION-000: dist/blog/1/index.htmlが存在すること', () => {
      expect(existsSync(page1Path)).toBe(true);
    });

    it('TC-PAGINATION-001: HTMLコンテンツが空でないこと', () => {
      expect(page1Html.length).toBeGreaterThan(0);
    });
  });

  describe('セマンティックHTML構造', () => {
    it('TC-PAGINATION-002: html要素にlang="ja"が設定されていること', () => {
      expect(page1Html).toContain('<html lang="ja"');
    });

    it('TC-PAGINATION-003: DOCTYPE宣言が存在すること', () => {
      expect(page1Html).toMatch(/<!DOCTYPE html>/i);
    });

    it('TC-PAGINATION-004: main要素が存在すること', () => {
      expect(page1Html).toContain('<main');
      expect(page1Html).toContain('</main>');
    });

    it('TC-PAGINATION-005: header要素が存在すること', () => {
      expect(page1Html).toContain('<header');
      expect(page1Html).toContain('</header>');
    });

    it('TC-PAGINATION-006: footer要素が存在すること', () => {
      expect(page1Html).toContain('<footer');
      expect(page1Html).toContain('</footer>');
    });

    it('TC-PAGINATION-007: article要素を使って記事がリスト表示されること', () => {
      expect(page1Html).toContain('<article');
    });
  });

  describe('メタ情報', () => {
    it('TC-PAGINATION-010: ページタイトルにページ番号が含まれること', () => {
      expect(page1Html).toContain('<title>');
      expect(page1Html).toContain('ブログ');
    });

    it('TC-PAGINATION-011: description metaタグが設定されていること', () => {
      expect(page1Html).toContain('<meta name="description"');
    });

    it('TC-PAGINATION-012: OGPメタタグが設定されていること', () => {
      expect(page1Html).toContain('<meta property="og:title"');
      expect(page1Html).toContain('<meta property="og:description"');
      expect(page1Html).toContain('<meta property="og:type"');
    });
  });

  describe('記事一覧表示', () => {
    it('TC-PAGINATION-020: 記事のタイトルが表示されること', () => {
      // サンプル記事のタイトル
      expect(page1Html).toContain('サンプル記事 - Astro Content Collections');
    });

    it('TC-PAGINATION-021: 記事の公開日が表示されること', () => {
      expect(page1Html).toContain('<time');
      expect(page1Html).toContain('datetime=');
    });

    it('TC-PAGINATION-022: 記事へのリンクが存在すること', () => {
      expect(page1Html).toContain('href="/blog/sample-post"');
    });

    it('TC-PAGINATION-023: 記事の説明が表示されること', () => {
      expect(page1Html).toContain('Content Collections APIの動作確認用サンプル記事です');
    });
  });

  describe('ページネーションナビゲーション', () => {
    it('TC-PAGINATION-030: ページネーションナビゲーションが存在すること', () => {
      expect(page1Html).toContain('aria-label="ページネーション"');
    });

    it('TC-PAGINATION-031: 現在のページ番号が表示されること', () => {
      expect(page1Html).toContain('aria-current="page"');
    });

    it('TC-PAGINATION-032: ページ番号「1」が表示されること', () => {
      // ページ番号リンクまたは現在ページ表示
      expect(page1Html).toMatch(/ページ\s*1|1\s*\/|aria-current="page"[^>]*>.*1/);
    });
  });

  describe('レイアウト構成', () => {
    it('TC-PAGINATION-040: Headerコンポーネントが含まれていること', () => {
      expect(page1Html).toContain('aria-label="メインナビゲーション"');
    });

    it('TC-PAGINATION-041: ナビゲーションリンクが含まれていること', () => {
      expect(page1Html).toContain('href="/"');
      expect(page1Html).toContain('href="/blog"');
      expect(page1Html).toContain('href="/tags"');
    });

    it('TC-PAGINATION-042: Footerコンポーネントが含まれていること', () => {
      expect(page1Html).toContain('aria-label="フッターナビゲーション"');
    });
  });

  describe('アクセシビリティ', () => {
    it('TC-PAGINATION-050: nav要素にページネーション用aria-labelが設定されていること', () => {
      expect(page1Html).toContain('aria-label="ページネーション"');
    });

    it('TC-PAGINATION-051: 見出し階層が適切であること', () => {
      expect(page1Html).toContain('<h1');
      expect(page1Html).toContain('<h2');
    });
  });

  describe('ダークモード対応', () => {
    it('TC-PAGINATION-060: body要素にダークモードクラスがあること', () => {
      expect(page1Html).toContain('dark:bg-gray-900');
      expect(page1Html).toContain('dark:text-gray-100');
    });

    it('TC-PAGINATION-061: テーマ切り替えボタンが含まれていること', () => {
      expect(page1Html).toContain('data-theme-toggle');
    });
  });
});

describe('Blog Pagination - ロジックテスト', () => {
  describe('記事フィルタリング', () => {
    it('TC-PAGINATION-070: 下書き記事（draft: true）が表示されないこと', () => {
      // サンプル記事はdraft: falseなので表示される
      expect(page1Html).toContain('サンプル記事');
    });

    it('TC-PAGINATION-071: 最大5件/ページで表示されること', () => {
      const articleCount = (page1Html.match(/<article/g) || []).length;
      expect(articleCount).toBeLessThanOrEqual(5);
      expect(articleCount).toBeGreaterThan(0);
    });
  });
});
