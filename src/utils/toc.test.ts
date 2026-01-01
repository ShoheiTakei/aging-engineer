/**
 * toc.ts - テストスイート
 *
 * 関連要件:
 * - REQ-901: 記事の見出し（h2, h3）から目次を自動生成
 * - REQ-112: 記事詳細ページで目次を表示
 * - EDGE-104: 見出しが存在しない記事は、目次を表示しないようにする
 *
 * 関連文書:
 * - テストケース定義書: docs/implements/blog-article-management/TASK-0008/toc-utils-testcases.md
 * - 要件定義書: docs/implements/blog-article-management/TASK-0008/toc-utils-requirements.md
 * - データフロー: docs/design/blog-article-management/dataflow.md
 * - テストパターン: docs/design/frontend-test-infra/test-patterns.md
 */

import { describe, expect, it } from 'vitest';
import type { MarkdownHeading } from './toc';
import { generateTOC } from './toc';

describe('toc utilities', () => {
  // ========================================
  // generateTOC() テストケース
  // ========================================

  describe('generateTOC', () => {
    // ========================================
    // 正常系テストケース
    // ========================================

    describe('正常系テストケース', () => {
      // TC-TOC-001: 標準的なh2/h3構造の変換 🔵
      it('TC-TOC-001: 標準的なh2/h3構造を階層化された目次に変換する', () => {
        // 【テスト目的】: 標準的なMarkdown記事の見出し構造が正しく目次に変換されることを確認
        // 【テスト内容】: h2, h3混在の配列を渡し、階層化されたTOC構造が返されるか検証
        // 【期待される動作】: h3はその直前のh2の子として格納される
        // 🔵 信頼性: dataflow.mdの目次生成フローより

        // 【テストデータ準備】: 標準的なh2/h3構造
        const headings: MarkdownHeading[] = [
          { depth: 2, slug: 'section-1', text: 'セクション1' },
          { depth: 3, slug: 'subsection-1-1', text: 'サブセクション1.1' },
          { depth: 3, slug: 'subsection-1-2', text: 'サブセクション1.2' },
          { depth: 2, slug: 'section-2', text: 'セクション2' },
        ];

        // 【実際の処理実行】: generateTOC関数を呼び出し
        const result = generateTOC(headings);

        // 【結果検証】: 階層化されたTOC構造が返されることを確認
        expect(result.hasContent).toBe(true);
        expect(result.items).toHaveLength(2);

        // セクション1の検証
        expect(result.items[0].depth).toBe(2);
        expect(result.items[0].slug).toBe('section-1');
        expect(result.items[0].text).toBe('セクション1');
        expect(result.items[0].children).toHaveLength(2);
        expect(result.items[0].children[0].text).toBe('サブセクション1.1');
        expect(result.items[0].children[1].text).toBe('サブセクション1.2');

        // セクション2の検証
        expect(result.items[1].depth).toBe(2);
        expect(result.items[1].slug).toBe('section-2');
        expect(result.items[1].text).toBe('セクション2');
        expect(result.items[1].children).toHaveLength(0);
      });

      // TC-TOC-002: h2のみの記事 🔵
      it('TC-TOC-002: h2のみの記事でフラットな目次を生成する', () => {
        // 【テスト目的】: h3がない記事でも正しく目次が生成されることを確認
        // 【テスト内容】: h2のみの配列を渡し、フラットなTOC構造が返されるか検証
        // 🔵 信頼性: 要件定義書より

        // 【テストデータ準備】: h2のみの構造
        const headings: MarkdownHeading[] = [
          { depth: 2, slug: 'intro', text: 'はじめに' },
          { depth: 2, slug: 'main', text: '本文' },
          { depth: 2, slug: 'conclusion', text: 'まとめ' },
        ];

        // 【実際の処理実行】: generateTOC関数を呼び出し
        const result = generateTOC(headings);

        // 【結果検証】: フラットなTOC構造が返されることを確認
        expect(result.hasContent).toBe(true);
        expect(result.items).toHaveLength(3);
        expect(result.items[0].text).toBe('はじめに');
        expect(result.items[0].children).toHaveLength(0);
        expect(result.items[1].text).toBe('本文');
        expect(result.items[2].text).toBe('まとめ');
      });

      // TC-TOC-003: 複数のh3が連続する場合 🔵
      it('TC-TOC-003: 複数のh3が連続する場合、全て親h2の子になる', () => {
        // 【テスト目的】: 複数のh3が連続する場合の処理を確認
        // 【テスト内容】: h2, h3, h3, h2の配列を渡し、h3が正しく親h2に紐づくか検証
        // 🔵 信頼性: dataflow.mdより

        // 【テストデータ準備】: 複数h3が連続する構造
        const headings: MarkdownHeading[] = [
          { depth: 2, slug: 'parent', text: '親セクション' },
          { depth: 3, slug: 'child-1', text: '子1' },
          { depth: 3, slug: 'child-2', text: '子2' },
          { depth: 3, slug: 'child-3', text: '子3' },
          { depth: 2, slug: 'next', text: '次のセクション' },
        ];

        // 【実際の処理実行】: generateTOC関数を呼び出し
        const result = generateTOC(headings);

        // 【結果検証】: h3が正しく親h2の子になることを確認
        expect(result.items).toHaveLength(2);
        expect(result.items[0].children).toHaveLength(3);
        expect(result.items[0].children[0].text).toBe('子1');
        expect(result.items[0].children[1].text).toBe('子2');
        expect(result.items[0].children[2].text).toBe('子3');
      });

      // TC-TOC-004: 日本語テキストの見出し 🔵
      it('TC-TOC-004: 日本語テキストがそのまま保持される', () => {
        // 【テスト目的】: 日本語テキストが正しく保持されることを確認
        // 【テスト内容】: 日本語テキスト含む見出しを渡し、テキストがそのまま出力されるか検証
        // 🔵 信頼性: 要件定義書より

        // 【テストデータ準備】: 日本語テキスト含む見出し
        const headings: MarkdownHeading[] = [
          { depth: 2, slug: 'intro', text: 'はじめに〜導入編〜' },
          { depth: 3, slug: 'detail', text: '詳細：実装方法について' },
        ];

        // 【実際の処理実行】: generateTOC関数を呼び出し
        const result = generateTOC(headings);

        // 【結果検証】: 日本語テキストがそのまま保持されることを確認
        expect(result.items[0].text).toBe('はじめに〜導入編〜');
        expect(result.items[0].children[0].text).toBe('詳細：実装方法について');
      });

      // TC-TOC-005: slugの保持確認 🔵
      it('TC-TOC-005: slugがそのまま出力される', () => {
        // 【テスト目的】: slugが正しく保持されることを確認
        // 【テスト内容】: 様々なslug値を渡し、そのまま出力されるか検証
        // 🔵 信頼性: dataflow.mdより

        // 【テストデータ準備】: 様々なslug値
        const headings: MarkdownHeading[] = [
          { depth: 2, slug: 'my-custom-slug', text: 'セクション' },
          { depth: 3, slug: 'sub-section-123', text: 'サブセクション' },
        ];

        // 【実際の処理実行】: generateTOC関数を呼び出し
        const result = generateTOC(headings);

        // 【結果検証】: slugがそのまま保持されることを確認
        expect(result.items[0].slug).toBe('my-custom-slug');
        expect(result.items[0].children[0].slug).toBe('sub-section-123');
      });
    });

    // ========================================
    // 異常系テストケース
    // ========================================

    describe('異常系テストケース', () => {
      // TC-TOC-101: 空の配列 🔵
      it('TC-TOC-101: 空の配列でhasContentがfalseになる', () => {
        // 【テスト目的】: 見出しがない記事でhasContentがfalseになることを確認
        // 【テスト内容】: 空配列を渡し、hasContent: falseが返されるか検証
        // 【期待される動作】: EDGE-104対応
        // 🔵 信頼性: EDGE-104より

        // 【テストデータ準備】: 空配列
        const headings: MarkdownHeading[] = [];

        // 【実際の処理実行】: generateTOC関数を呼び出し
        const result = generateTOC(headings);

        // 【結果検証】: hasContentがfalseになることを確認
        expect(result.hasContent).toBe(false);
        expect(result.items).toHaveLength(0);
      });

      // TC-TOC-102: h1のみの配列 🟡
      it('TC-TOC-102: h1のみの配列でhasContentがfalseになる', () => {
        // 【テスト目的】: h1のみの記事（h2/h3なし）でhasContentがfalseになることを確認
        // 【テスト内容】: depth: 1のみの配列を渡し、hasContent: falseが返されるか検証
        // 🟡 信頼性: 要件定義書から妥当な推測

        // 【テストデータ準備】: h1のみの配列
        const headings: MarkdownHeading[] = [{ depth: 1, slug: 'title', text: 'タイトル' }];

        // 【実際の処理実行】: generateTOC関数を呼び出し
        const result = generateTOC(headings);

        // 【結果検証】: hasContentがfalseになることを確認
        expect(result.hasContent).toBe(false);
        expect(result.items).toHaveLength(0);
      });

      // TC-TOC-103: h4-h6のみの配列 🟡
      it('TC-TOC-103: h4-h6のみの配列でhasContentがfalseになる', () => {
        // 【テスト目的】: h4-h6のみの記事でhasContentがfalseになることを確認
        // 【テスト内容】: depth: 4-6のみの配列を渡し、hasContent: falseが返されるか検証
        // 🟡 信頼性: 要件定義書から妥当な推測

        // 【テストデータ準備】: h4-h6のみの配列
        const headings: MarkdownHeading[] = [
          { depth: 4, slug: 'h4', text: 'H4見出し' },
          { depth: 5, slug: 'h5', text: 'H5見出し' },
          { depth: 6, slug: 'h6', text: 'H6見出し' },
        ];

        // 【実際の処理実行】: generateTOC関数を呼び出し
        const result = generateTOC(headings);

        // 【結果検証】: hasContentがfalseになることを確認
        expect(result.hasContent).toBe(false);
        expect(result.items).toHaveLength(0);
      });
    });

    // ========================================
    // 境界値テストケース
    // ========================================

    describe('境界値テストケース', () => {
      // TC-TOC-201: h3のみの記事 🔵
      it('TC-TOC-201: h3のみの記事でh3がトップレベルになる', () => {
        // 【テスト目的】: h2がなくh3のみの記事でh3がトップレベルになることを確認
        // 【テスト内容】: h3のみの配列を渡し、h3がトップレベルとして出力されるか検証
        // 🔵 信頼性: dataflow.mdより

        // 【テストデータ準備】: h3のみの配列
        const headings: MarkdownHeading[] = [
          { depth: 3, slug: 'sub-1', text: 'サブ項目1' },
          { depth: 3, slug: 'sub-2', text: 'サブ項目2' },
        ];

        // 【実際の処理実行】: generateTOC関数を呼び出し
        const result = generateTOC(headings);

        // 【結果検証】: h3がトップレベルになることを確認
        expect(result.hasContent).toBe(true);
        expect(result.items).toHaveLength(2);
        expect(result.items[0].depth).toBe(3);
        expect(result.items[0].text).toBe('サブ項目1');
        expect(result.items[1].text).toBe('サブ項目2');
      });

      // TC-TOC-202: h2が1つのみ 🔵
      it('TC-TOC-202: h2が1つのみでも目次を生成する', () => {
        // 【テスト目的】: h2が1つのみでも正しく目次が生成されることを確認
        // 【テスト内容】: h2が1つのみの配列を渡し、1項目のTOCが返されるか検証
        // 🔵 信頼性: 要件定義書より

        // 【テストデータ準備】: h2が1つのみ
        const headings: MarkdownHeading[] = [{ depth: 2, slug: 'single', text: '単一セクション' }];

        // 【実際の処理実行】: generateTOC関数を呼び出し
        const result = generateTOC(headings);

        // 【結果検証】: 1項目のTOCが返されることを確認
        expect(result.hasContent).toBe(true);
        expect(result.items).toHaveLength(1);
        expect(result.items[0].text).toBe('単一セクション');
      });

      // TC-TOC-203: 親なしh3から始まる 🔵
      it('TC-TOC-203: h3から始まりその後h2が来る場合を正しく処理する', () => {
        // 【テスト目的】: h3から始まりその後h2が来る場合の処理を確認
        // 【テスト内容】: h3, h2, h3の配列を渡し、正しい階層構造になるか検証
        // 🔵 信頼性: dataflow.mdより

        // 【テストデータ準備】: h3から始まる構造
        const headings: MarkdownHeading[] = [
          { depth: 3, slug: 'orphan', text: '孤立したh3' },
          { depth: 2, slug: 'section', text: 'セクション' },
          { depth: 3, slug: 'child', text: '子h3' },
        ];

        // 【実際の処理実行】: generateTOC関数を呼び出し
        const result = generateTOC(headings);

        // 【結果検証】: 正しい階層構造になることを確認
        expect(result.hasContent).toBe(true);
        expect(result.items).toHaveLength(2);

        // 孤立したh3はトップレベル
        expect(result.items[0].depth).toBe(3);
        expect(result.items[0].text).toBe('孤立したh3');
        expect(result.items[0].children).toHaveLength(0);

        // セクションとその子h3
        expect(result.items[1].depth).toBe(2);
        expect(result.items[1].text).toBe('セクション');
        expect(result.items[1].children).toHaveLength(1);
        expect(result.items[1].children[0].text).toBe('子h3');
      });

      // TC-TOC-204: 大量の見出し 🟡
      it('TC-TOC-204: 大量の見出し（100個）を正しく処理する', () => {
        // 【テスト目的】: 大量の見出しがあっても正しく処理されることを確認
        // 【テスト内容】: 100個の見出しを渡し、全て正しく処理されるか検証
        // 🟡 信頼性: パフォーマンス要件より

        // 【テストデータ準備】: 100個の見出し
        const headings: MarkdownHeading[] = [];
        for (let i = 0; i < 50; i++) {
          headings.push({ depth: 2, slug: `h2-${i}`, text: `H2 Section ${i}` });
          headings.push({ depth: 3, slug: `h3-${i}`, text: `H3 Sub ${i}` });
        }

        // 【実際の処理実行】: generateTOC関数を呼び出し
        const result = generateTOC(headings);

        // 【結果検証】: 全て正しく処理されることを確認
        expect(result.hasContent).toBe(true);
        expect(result.items).toHaveLength(50);

        // 各h2に1つのh3子要素があることを確認
        for (const item of result.items) {
          expect(item.children).toHaveLength(1);
        }
      });
    });
  });
});
