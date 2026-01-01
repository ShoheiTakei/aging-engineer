/**
 * [slug].astro - テストスイート
 *
 * 関連要件:
 * - REQ-102: 記事詳細表示
 * - REQ-001: frontmatterでpubDate, updatedDateを管理
 * - REQ-801: 読了時間を自動計算して表示
 * - REQ-901: 記事の見出し（h2, h3）から目次を自動生成
 * - REQ-111: Shikiシンタックスハイライト対応
 *
 * 関連文書:
 * - タスク定義: docs/tasks/blog-article-management/overview.md TASK-0014
 * - アーキテクチャ: docs/design/blog-article-management/architecture.md
 * - テストパターン: docs/design/frontend-test-infra/test-patterns.md
 *
 * 注意: Astro動的ルートページのテストは、ヘルパー関数のユニットテストとして実装
 */

import { describe, expect, it } from 'vitest';
import { formatDate } from '../../src/utils/date';
import { calculateReadingTime, formatReadingTime } from '../../src/utils/readingTime';
import { type MarkdownHeading, generateTOC } from '../../src/utils/toc';

describe('[slug].astro - 記事詳細ページ', () => {
  // ========================================
  // 統合テスト用ヘルパー関数
  // ========================================

  /**
   * 【ヘルパー関数】: 記事詳細ページで使用するデータを準備する
   * 【用途】: テスト用にfrontmatterと本文からページデータを生成
   */
  interface ArticleData {
    slug: string;
    title: string;
    description: string;
    pubDate: Date;
    updatedDate?: Date;
    tags: string[];
    content: string;
    headings: MarkdownHeading[];
  }

  function prepareArticlePageData(article: ArticleData) {
    const readingTime = calculateReadingTime(article.content);
    const toc = generateTOC(article.headings);
    const formattedPubDate = formatDate(article.pubDate);
    const formattedUpdatedDate = article.updatedDate ? formatDate(article.updatedDate) : null;
    const formattedReadingTime = formatReadingTime(readingTime);

    return {
      ...article,
      readingTime,
      toc,
      formattedPubDate,
      formattedUpdatedDate,
      formattedReadingTime,
    };
  }

  // ========================================
  // 正常系テストケース
  // ========================================

  describe('正常系テストケース', () => {
    // TC-SLUG-001: 標準的な記事の詳細表示 🔵
    it('TC-SLUG-001: 標準的な記事のデータを正しく準備できる', () => {
      // 【テスト目的】: 標準的な記事のfrontmatterと本文が正しく処理されることを確認
      // 【テスト内容】: 全フィールドを持つ記事データを渡し、各種ユーティリティが正しく動作するか検証
      // 🔵 信頼性: REQ-102より

      // 【テストデータ準備】: 標準的な記事データ
      const article: ArticleData = {
        slug: 'test-article',
        title: 'テスト記事',
        description: 'これはテスト用の記事です',
        pubDate: new Date('2025-01-15'),
        updatedDate: new Date('2025-01-20'),
        tags: ['TypeScript', 'Astro'],
        content: 'これはテスト記事の本文です。'.repeat(100), // 約1800文字
        headings: [
          { depth: 2, slug: 'section-1', text: 'セクション1' },
          { depth: 3, slug: 'subsection-1', text: 'サブセクション1' },
          { depth: 2, slug: 'section-2', text: 'セクション2' },
        ],
      };

      // 【実際の処理実行】: prepareArticlePageData関数を呼び出し
      const result = prepareArticlePageData(article);

      // 【結果検証】: 各フィールドが正しく処理されていることを確認
      expect(result.slug).toBe('test-article');
      expect(result.title).toBe('テスト記事');
      expect(result.description).toBe('これはテスト用の記事です');
      expect(result.tags).toEqual(['TypeScript', 'Astro']);
      expect(result.formattedPubDate).toBe('2025年1月15日');
      expect(result.formattedUpdatedDate).toBe('2025年1月20日');
      expect(result.readingTime).toBeGreaterThan(0);
      expect(result.formattedReadingTime).toMatch(/約\d+分で読めます/);
      expect(result.toc.hasContent).toBe(true);
      expect(result.toc.items).toHaveLength(2);
    });

    // TC-SLUG-002: 更新日がない記事 🔵
    it('TC-SLUG-002: 更新日がない記事でformattedUpdatedDateがnullになる', () => {
      // 【テスト目的】: updatedDateが未設定の記事が正しく処理されることを確認
      // 【テスト内容】: updatedDateなしの記事データを渡し、formattedUpdatedDateがnullになるか検証
      // 🔵 信頼性: REQ-001より

      // 【テストデータ準備】: 更新日なしの記事データ
      const article: ArticleData = {
        slug: 'no-update-article',
        title: '更新日なし記事',
        description: '更新日のないテスト記事です',
        pubDate: new Date('2025-01-15'),
        tags: ['Test'],
        content: 'テスト本文',
        headings: [],
      };

      // 【実際の処理実行】: prepareArticlePageData関数を呼び出し
      const result = prepareArticlePageData(article);

      // 【結果検証】: formattedUpdatedDateがnullになることを確認
      expect(result.formattedUpdatedDate).toBeNull();
      expect(result.formattedPubDate).toBe('2025年1月15日');
    });

    // TC-SLUG-003: タグがない記事 🔵
    it('TC-SLUG-003: タグがない記事でtagsが空配列になる', () => {
      // 【テスト目的】: タグなしの記事が正しく処理されることを確認
      // 【テスト内容】: tags空配列の記事データを渡し、正しく処理されるか検証
      // 🔵 信頼性: 要件定義書より

      // 【テストデータ準備】: タグなしの記事データ
      const article: ArticleData = {
        slug: 'no-tags-article',
        title: 'タグなし記事',
        description: 'タグのないテスト記事です',
        pubDate: new Date('2025-01-15'),
        tags: [],
        content: 'テスト本文',
        headings: [{ depth: 2, slug: 'intro', text: 'はじめに' }],
      };

      // 【実際の処理実行】: prepareArticlePageData関数を呼び出し
      const result = prepareArticlePageData(article);

      // 【結果検証】: tagsが空配列になることを確認
      expect(result.tags).toEqual([]);
      expect(result.tags).toHaveLength(0);
    });

    // TC-SLUG-004: 見出しがない記事で目次が生成されない 🔵
    it('TC-SLUG-004: 見出しがない記事でtoc.hasContentがfalseになる', () => {
      // 【テスト目的】: 見出しなしの記事で目次が生成されないことを確認
      // 【テスト内容】: headings空配列の記事データを渡し、hasContentがfalseになるか検証
      // 🔵 信頼性: EDGE-104より

      // 【テストデータ準備】: 見出しなしの記事データ
      const article: ArticleData = {
        slug: 'no-headings-article',
        title: '見出しなし記事',
        description: '見出しのないテスト記事です',
        pubDate: new Date('2025-01-15'),
        tags: ['Test'],
        content: 'シンプルな本文のみ',
        headings: [],
      };

      // 【実際の処理実行】: prepareArticlePageData関数を呼び出し
      const result = prepareArticlePageData(article);

      // 【結果検証】: hasContentがfalseになることを確認
      expect(result.toc.hasContent).toBe(false);
      expect(result.toc.items).toHaveLength(0);
    });

    // TC-SLUG-005: 短い記事で「1分未満」表示 🔵
    it('TC-SLUG-005: 短い記事で「1分未満で読めます」と表示される', () => {
      // 【テスト目的】: 短い記事で読了時間が「1分未満」と表示されることを確認
      // 【テスト内容】: 500文字未満の記事を渡し、読了時間表示が「1分未満で読めます」になるか検証
      // 🔵 信頼性: EDGE-103より

      // 【テストデータ準備】: 非常に短い記事データ（空文字列）
      const article: ArticleData = {
        slug: 'short-article',
        title: '短い記事',
        description: '非常に短いテスト記事です',
        pubDate: new Date('2025-01-15'),
        tags: [],
        content: '', // 空文字列
        headings: [],
      };

      // 【実際の処理実行】: prepareArticlePageData関数を呼び出し
      const result = prepareArticlePageData(article);

      // 【結果検証】: 読了時間が「1分未満で読めます」になることを確認
      expect(result.readingTime).toBe(0);
      expect(result.formattedReadingTime).toBe('1分未満で読めます');
    });
  });

  // ========================================
  // タグ表示テストケース
  // ========================================

  describe('タグ表示テストケース', () => {
    // TC-SLUG-101: 複数タグの表示 🔵
    it('TC-SLUG-101: 複数タグが正しく保持される', () => {
      // 【テスト目的】: 複数タグが正しく表示されることを確認
      // 【テスト内容】: 複数タグを持つ記事を渡し、全タグが保持されるか検証
      // 🔵 信頼性: REQ-301より

      // 【テストデータ準備】: 複数タグを持つ記事データ
      const article: ArticleData = {
        slug: 'multi-tags-article',
        title: '複数タグ記事',
        description: '複数のタグを持つテスト記事です',
        pubDate: new Date('2025-01-15'),
        tags: ['TypeScript', 'Astro', 'React', 'Tailwind'],
        content: 'テスト本文',
        headings: [],
      };

      // 【実際の処理実行】: prepareArticlePageData関数を呼び出し
      const result = prepareArticlePageData(article);

      // 【結果検証】: 全タグが保持されていることを確認
      expect(result.tags).toHaveLength(4);
      expect(result.tags).toContain('TypeScript');
      expect(result.tags).toContain('Astro');
      expect(result.tags).toContain('React');
      expect(result.tags).toContain('Tailwind');
    });

    // TC-SLUG-102: 日本語タグの表示 🔵
    it('TC-SLUG-102: 日本語タグが正しく保持される', () => {
      // 【テスト目的】: 日本語タグが正しく表示されることを確認
      // 【テスト内容】: 日本語タグを持つ記事を渡し、タグが正しく保持されるか検証
      // 🔵 信頼性: 要件定義書より

      // 【テストデータ準備】: 日本語タグを持つ記事データ
      const article: ArticleData = {
        slug: 'japanese-tags-article',
        title: '日本語タグ記事',
        description: '日本語タグを持つテスト記事です',
        pubDate: new Date('2025-01-15'),
        tags: ['プログラミング', '技術記事', 'チュートリアル'],
        content: 'テスト本文',
        headings: [],
      };

      // 【実際の処理実行】: prepareArticlePageData関数を呼び出し
      const result = prepareArticlePageData(article);

      // 【結果検証】: 日本語タグが正しく保持されていることを確認
      expect(result.tags).toContain('プログラミング');
      expect(result.tags).toContain('技術記事');
      expect(result.tags).toContain('チュートリアル');
    });
  });

  // ========================================
  // 目次生成テストケース
  // ========================================

  describe('目次生成テストケース', () => {
    // TC-SLUG-201: 複雑な見出し構造の目次生成 🔵
    it('TC-SLUG-201: 複雑な見出し構造から正しい目次が生成される', () => {
      // 【テスト目的】: 複雑な見出し構造が正しく目次に変換されることを確認
      // 【テスト内容】: 多階層の見出しを持つ記事を渡し、階層構造が正しく生成されるか検証
      // 🔵 信頼性: REQ-901より

      // 【テストデータ準備】: 複雑な見出し構造を持つ記事データ
      const article: ArticleData = {
        slug: 'complex-headings-article',
        title: '複雑な見出し記事',
        description: '複雑な見出し構造を持つテスト記事です',
        pubDate: new Date('2025-01-15'),
        tags: [],
        content: 'テスト本文',
        headings: [
          { depth: 2, slug: 'intro', text: 'はじめに' },
          { depth: 3, slug: 'background', text: '背景' },
          { depth: 3, slug: 'purpose', text: '目的' },
          { depth: 2, slug: 'main', text: '本編' },
          { depth: 3, slug: 'step-1', text: 'ステップ1' },
          { depth: 3, slug: 'step-2', text: 'ステップ2' },
          { depth: 3, slug: 'step-3', text: 'ステップ3' },
          { depth: 2, slug: 'conclusion', text: 'まとめ' },
        ],
      };

      // 【実際の処理実行】: prepareArticlePageData関数を呼び出し
      const result = prepareArticlePageData(article);

      // 【結果検証】: 階層構造が正しく生成されていることを確認
      expect(result.toc.hasContent).toBe(true);
      expect(result.toc.items).toHaveLength(3);

      // はじめに（2つの子要素）
      expect(result.toc.items[0].text).toBe('はじめに');
      expect(result.toc.items[0].children).toHaveLength(2);

      // 本編（3つの子要素）
      expect(result.toc.items[1].text).toBe('本編');
      expect(result.toc.items[1].children).toHaveLength(3);

      // まとめ（子要素なし）
      expect(result.toc.items[2].text).toBe('まとめ');
      expect(result.toc.items[2].children).toHaveLength(0);
    });
  });

  // ========================================
  // 読了時間計算テストケース
  // ========================================

  describe('読了時間計算テストケース', () => {
    // TC-SLUG-301: 長い記事の読了時間 🔵
    it('TC-SLUG-301: 長い記事の読了時間が正しく計算される', () => {
      // 【テスト目的】: 長い記事の読了時間が正しく計算されることを確認
      // 【テスト内容】: 5000文字の記事を渡し、読了時間が10分と計算されるか検証
      // 🔵 信頼性: REQ-801より（500文字/分）

      // 【テストデータ準備】: 5000文字の記事データ
      const article: ArticleData = {
        slug: 'long-article',
        title: '長い記事',
        description: '長いテスト記事です',
        pubDate: new Date('2025-01-15'),
        tags: [],
        content: 'あ'.repeat(5000), // 5000文字
        headings: [],
      };

      // 【実際の処理実行】: prepareArticlePageData関数を呼び出し
      const result = prepareArticlePageData(article);

      // 【結果検証】: 読了時間が正しく計算されていることを確認
      expect(result.readingTime).toBe(10); // 5000 / 500 = 10分
      expect(result.formattedReadingTime).toBe('約10分で読めます');
    });

    // TC-SLUG-302: 端数の読了時間（切り上げ） 🔵
    it('TC-SLUG-302: 端数がある場合は切り上げになる', () => {
      // 【テスト目的】: 端数がある場合に読了時間が切り上げされることを確認
      // 【テスト内容】: 501文字の記事を渡し、読了時間が2分になるか検証
      // 🔵 信頼性: REQ-801より

      // 【テストデータ準備】: 501文字の記事データ
      const article: ArticleData = {
        slug: 'fraction-article',
        title: '端数記事',
        description: '端数が出るテスト記事です',
        pubDate: new Date('2025-01-15'),
        tags: [],
        content: 'あ'.repeat(501), // 501文字 → 2分
        headings: [],
      };

      // 【実際の処理実行】: prepareArticlePageData関数を呼び出し
      const result = prepareArticlePageData(article);

      // 【結果検証】: 読了時間が切り上げされていることを確認
      expect(result.readingTime).toBe(2); // ceil(501 / 500) = 2分
      expect(result.formattedReadingTime).toBe('約2分で読めます');
    });
  });

  // ========================================
  // 日付表示テストケース
  // ========================================

  describe('日付表示テストケース', () => {
    // TC-SLUG-401: 日付フォーマットの確認 🔵
    it('TC-SLUG-401: 日付が日本語形式でフォーマットされる', () => {
      // 【テスト目的】: 日付が「YYYY年M月D日」形式でフォーマットされることを確認
      // 【テスト内容】: 様々な日付を渡し、正しくフォーマットされるか検証
      // 🔵 信頼性: REQ-001より

      // 【テストデータ準備】: 様々な日付を持つ記事データ
      const article: ArticleData = {
        slug: 'date-format-article',
        title: '日付フォーマット記事',
        description: '日付フォーマットテスト記事です',
        pubDate: new Date('2025-12-31'),
        updatedDate: new Date('2026-01-01'),
        tags: [],
        content: 'テスト本文',
        headings: [],
      };

      // 【実際の処理実行】: prepareArticlePageData関数を呼び出し
      const result = prepareArticlePageData(article);

      // 【結果検証】: 日本語形式でフォーマットされていることを確認
      expect(result.formattedPubDate).toBe('2025年12月31日');
      expect(result.formattedUpdatedDate).toBe('2026年1月1日');
    });
  });
});
