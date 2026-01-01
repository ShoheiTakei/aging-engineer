/**
 * readingTime.ts - テストスイート
 *
 * 関連要件:
 * - REQ-801: 記事の読了時間を自動計算して表示（500文字/分）
 * - EDGE-103: 読了時間が1分未満の記事は「1分未満」と表示
 *
 * 関連文書:
 * - テストケース定義書: docs/implements/blog-article-management/TASK-0007/reading-time-testcases.md
 * - 要件定義書: docs/implements/blog-article-management/TASK-0007/reading-time-requirements.md
 * - タスクノート: docs/implements/blog-article-management/TASK-0007/note.md
 * - テストパターン: docs/design/frontend-test-infra/test-patterns.md
 */

import { describe, expect, it } from 'vitest';
import { CHARS_PER_MINUTE, calculateReadingTime, formatReadingTime } from './readingTime';

// ========================================
// テストヘルパー関数・定数
// ========================================

/**
 * 【テスト用定数】: 標準的なテストで使用する文字数 🔵
 * 【用途】: CHARS_PER_MINUTEを基準にした計算で使用
 * 【可読性向上】: マジックナンバーを減らし意図を明確化
 */
const TEST_CHARS = {
  /** 1分未満の境界値（499文字 = 1分未満の最大） */
  UNDER_ONE_MIN: CHARS_PER_MINUTE - 1,
  /** ちょうど1分（500文字） */
  EXACTLY_ONE_MIN: CHARS_PER_MINUTE,
  /** 1分超えの境界値（501文字 = 2分に切り上げ） */
  OVER_ONE_MIN: CHARS_PER_MINUTE + 1,
  /** 標準的な記事（1500文字 = 3分） */
  STANDARD_ARTICLE: CHARS_PER_MINUTE * 3,
  /** 長い記事（5000文字 = 10分） */
  LONG_ARTICLE: CHARS_PER_MINUTE * 10,
  /** 端数がある記事（1600文字 = 3.2分 -> 4分に切り上げ） */
  WITH_REMAINDER: 1600,
} as const;

/**
 * 【ヘルパー関数】: 指定文字数のテスト用文字列を生成
 * 【再利用性】: 複数のテストケースで文字列生成に使用
 * 【単一責任】: テストデータ生成を担当
 * 🔵 信頼性レベル: note.mdのテストデータ準備例より
 *
 * @param length - 生成する文字数
 * @returns 指定文字数の日本語文字列
 */
function generateText(length: number): string {
  const char = 'あ';
  return char.repeat(length);
}

describe('readingTime utilities', () => {
  // ========================================
  // calculateReadingTime() テストケース
  // ========================================

  describe('calculateReadingTime', () => {
    // ========================================
    // 正常系テストケース
    // ========================================

    describe('正常系テストケース', () => {
      // TC-RT-001: 標準的な記事長（1500文字）で約3分を返す 🔵
      it('TC-RT-001: 標準的な記事長（1500文字）で3分を返す', () => {
        // 【テスト目的】: calculateReadingTime()が標準的な記事長で正しく計算することを確認
        // 【テスト内容】: 1500文字の文字列を渡し、3分が返されるか検証
        // 【期待される動作】: 1500 / 500 = 3（ちょうど割り切れる）
        // 🔵 信頼性: requirements.md REQ-801・acceptance-criteria.md TC-801-01より

        // 【テストデータ準備】: TEST_CHARS.STANDARD_ARTICLE（1500文字）の日本語文字列を生成
        // 【前提条件確認】: 文字列長が1500であること
        const content = generateText(TEST_CHARS.STANDARD_ARTICLE);

        // 【実際の処理実行】: calculateReadingTime関数を呼び出し
        // 【処理内容】: 文字数から読了時間（分）を計算
        const result = calculateReadingTime(content);

        // 【結果検証】: 3分が返されることを確認
        // 【期待値確認】: TEST_CHARS.STANDARD_ARTICLE / CHARS_PER_MINUTE = 3
        // 【品質保証】: 基本的な読了時間計算が正しく動作すること
        expect(result).toBe(3); // 【確認内容】: 1500文字で3分 🔵
      });

      // TC-RT-002: 長い記事（5000文字）で約10分を返す 🔵
      it('TC-RT-002: 長い記事（5000文字）で10分を返す', () => {
        // 【テスト目的】: 長い記事でも正しく読了時間が計算されることを確認
        // 【テスト内容】: 5000文字の文字列を渡し、10分が返されるか検証
        // 【期待される動作】: 5000 / 500 = 10（ちょうど割り切れる）
        // 🔵 信頼性: acceptance-criteria.md TC-801-B02より

        // 【テストデータ準備】: TEST_CHARS.LONG_ARTICLE（5000文字）の日本語文字列を生成
        const content = generateText(TEST_CHARS.LONG_ARTICLE);

        // 【実際の処理実行】: calculateReadingTime関数を呼び出し
        const result = calculateReadingTime(content);

        // 【結果検証】: 10分が返されることを確認
        // 【期待値確認】: TEST_CHARS.LONG_ARTICLE / CHARS_PER_MINUTE = 10
        expect(result).toBe(10); // 【確認内容】: 5000文字で10分 🔵
      });

      // TC-RT-003: 端数がある記事（1600文字）で切り上げ4分を返す 🔵
      it('TC-RT-003: 端数がある記事（1600文字）で切り上げ4分を返す', () => {
        // 【テスト目的】: 端数が出る文字数でMath.ceilによる切り上げが正しく機能することを確認
        // 【テスト内容】: 1600文字の文字列を渡し、4分が返されるか検証
        // 【期待される動作】: 1600 / 500 = 3.2 -> Math.ceil(3.2) = 4
        // 🔵 信頼性: requirements.md REQ-801・note.mdの計算ロジックより

        // 【テストデータ準備】: TEST_CHARS.WITH_REMAINDER（1600文字）の日本語文字列を生成
        const content = generateText(TEST_CHARS.WITH_REMAINDER);

        // 【実際の処理実行】: calculateReadingTime関数を呼び出し
        const result = calculateReadingTime(content);

        // 【結果検証】: 4分が返されることを確認
        // 【期待値確認】: Math.ceil(TEST_CHARS.WITH_REMAINDER / CHARS_PER_MINUTE) = 4
        expect(result).toBe(4); // 【確認内容】: 切り上げで4分 🔵
      });
    });

    // ========================================
    // 異常系テストケース
    // ========================================

    describe('異常系テストケース', () => {
      // TC-RT-101: 空文字列で0分を返す 🔵
      it('TC-RT-101: 空文字列で0分を返す', () => {
        // 【テスト目的】: 空の本文を渡した場合、エラーにならず0分が返されることを確認
        // 【テスト内容】: 空文字列を渡し、0分が返されるか検証
        // 【期待される動作】: Math.ceil(0 / 500) = 0
        // 🔵 信頼性: note.mdセクション5.1「空文字列・短い記事の処理」より

        // 【テストデータ準備】: 空文字列
        // 【実際の発生シナリオ】: ドラフト記事、メタデータのみの記事
        const content = '';

        // 【実際の処理実行】: calculateReadingTime関数を呼び出し
        const result = calculateReadingTime(content);

        // 【結果検証】: 0分が返されることを確認
        // 【品質保証】: エッジケースでの堅牢性確保
        expect(result).toBe(0); // 【確認内容】: 空文字列で0分 🔵
      });
    });

    // ========================================
    // 境界値テストケース
    // ========================================

    describe('境界値テストケース', () => {
      // TC-RT-201: 499文字（1分未満境界）で1分を返す 🔵
      it('TC-RT-201: 499文字（1分未満境界）で1分を返す', () => {
        // 【テスト目的】: 500文字未満の最大値で切り上げにより1分が返されることを確認
        // 【テスト内容】: 499文字の文字列を渡し、1分が返されるか検証
        // 【期待される動作】: Math.ceil(499 / 500) = Math.ceil(0.998) = 1
        // 🔵 信頼性: note.mdセクション2.1「境界値テスト」より

        // 【テストデータ準備】: TEST_CHARS.UNDER_ONE_MIN（499文字）の日本語文字列を生成
        // 【境界値選択の根拠】: CHARS_PER_MINUTE - 1 = 499（500未満の最大整数）
        const content = generateText(TEST_CHARS.UNDER_ONE_MIN);

        // 【実際の処理実行】: calculateReadingTime関数を呼び出し
        const result = calculateReadingTime(content);

        // 【結果検証】: 1分が返されることを確認
        // 【境界での正確性】: 1分未満でも切り上げで1分
        expect(result).toBe(1); // 【確認内容】: 499文字で切り上げ1分 🔵
      });

      // TC-RT-202: 500文字（ちょうど1分）で1分を返す 🔵
      it('TC-RT-202: 500文字（ちょうど1分）で1分を返す', () => {
        // 【テスト目的】: 読了速度の基準値と同じ文字数で正確に1分が返されることを確認
        // 【テスト内容】: 500文字の文字列を渡し、1分が返されるか検証
        // 【期待される動作】: 500 / 500 = 1（ちょうど割り切れる）
        // 🔵 信頼性: note.mdセクション2.1「境界値テスト」より

        // 【テストデータ準備】: TEST_CHARS.EXACTLY_ONE_MIN（500文字）の日本語文字列を生成
        // 【境界値選択の根拠】: CHARS_PER_MINUTE定数と同値
        const content = generateText(TEST_CHARS.EXACTLY_ONE_MIN);

        // 【実際の処理実行】: calculateReadingTime関数を呼び出し
        const result = calculateReadingTime(content);

        // 【結果検証】: 1分が返されることを確認
        // 【境界での正確性】: 定数値でちょうど1分
        expect(result).toBe(1); // 【確認内容】: 500文字でちょうど1分 🔵
      });

      // TC-RT-203: 501文字（1分超え境界）で2分を返す 🔵
      it('TC-RT-203: 501文字（1分超え境界）で2分を返す', () => {
        // 【テスト目的】: 500文字を1文字でも超えた場合、切り上げで2分になることを確認
        // 【テスト内容】: 501文字の文字列を渡し、2分が返されるか検証
        // 【期待される動作】: Math.ceil(501 / 500) = Math.ceil(1.002) = 2
        // 🔵 信頼性: note.mdセクション2.1「境界値テスト」より

        // 【テストデータ準備】: TEST_CHARS.OVER_ONE_MIN（501文字）の日本語文字列を生成
        // 【境界値選択の根拠】: CHARS_PER_MINUTE + 1 = 501（500超過の最小整数）
        const content = generateText(TEST_CHARS.OVER_ONE_MIN);

        // 【実際の処理実行】: calculateReadingTime関数を呼び出し
        const result = calculateReadingTime(content);

        // 【結果検証】: 2分が返されることを確認
        // 【境界での正確性】: 1文字でも超えれば次の分数に切り上げ
        expect(result).toBe(2); // 【確認内容】: 501文字で切り上げ2分 🔵
      });

      // TC-RT-204: 1文字で1分を返す 🟡
      it('TC-RT-204: 1文字で1分を返す', () => {
        // 【テスト目的】: 最小の有効な入力値でも正しく計算されることを確認
        // 【テスト内容】: 1文字の文字列を渡し、1分が返されるか検証
        // 【期待される動作】: Math.ceil(1 / 500) = Math.ceil(0.002) = 1
        // 🟡 信頼性: note.mdからの妥当な推測

        // 【テストデータ準備】: 1文字の日本語文字列を生成
        // 【境界値選択の根拠】: 空でない最小の文字列
        const content = generateText(1);

        // 【実際の処理実行】: calculateReadingTime関数を呼び出し
        const result = calculateReadingTime(content);

        // 【結果検証】: 1分が返されることを確認
        // 【境界での正確性】: 最小入力でも動作
        expect(result).toBe(1); // 【確認内容】: 1文字で切り上げ1分 🟡
      });

      // TC-RT-205: 200文字（1分未満）で1分を返す 🔵
      it('TC-RT-205: 200文字（1分未満）で1分を返す', () => {
        // 【テスト目的】: 受け入れ基準で定義された「1分未満」の代表値で正しく計算されることを確認
        // 【テスト内容】: 200文字の文字列を渡し、1分が返されるか検証
        // 【期待される動作】: Math.ceil(200 / 500) = Math.ceil(0.4) = 1
        // 🔵 信頼性: acceptance-criteria.md TC-801-B01より

        // 【テストデータ準備】: 200文字の日本語文字列を生成
        // 【実際の使用場面】: 短いお知らせ記事、概要
        const content = generateText(200);

        // 【実際の処理実行】: calculateReadingTime関数を呼び出し
        const result = calculateReadingTime(content);

        // 【結果検証】: 1分が返されることを確認
        // 【品質保証】: 仕様書通りの動作保証
        expect(result).toBe(1); // 【確認内容】: 200文字で切り上げ1分 🔵
      });
    });
  });

  // ========================================
  // formatReadingTime() テストケース
  // ========================================

  describe('formatReadingTime', () => {
    // ========================================
    // 正常系テストケース
    // ========================================

    describe('正常系テストケース', () => {
      // TC-FRT-001: 3分で「約3分で読めます」を返す 🔵
      it('TC-FRT-001: 3分で「約3分で読めます」を返す', () => {
        // 【テスト目的】: 通常の読了時間（分）を日本語表示形式に変換できることを確認
        // 【テスト内容】: 3分を渡し、「約3分で読めます」が返されるか検証
        // 【期待される動作】: テンプレート文字列で「約N分で読めます」を生成
        // 🔵 信頼性: requirements.md REQ-801・acceptance-criteria.md TC-801-01より

        // 【テストデータ準備】: 3分（標準的な読了時間）
        const minutes = 3;

        // 【実際の処理実行】: formatReadingTime関数を呼び出し
        const result = formatReadingTime(minutes);

        // 【結果検証】: 「約3分で読めます」が返されることを確認
        // 【期待値確認】: requirements.md REQ-801の表示形式に準拠
        expect(result).toBe('約3分で読めます'); // 【確認内容】: 3分の日本語表示 🔵
      });

      // TC-FRT-002: 1分で「約1分で読めます」を返す 🔵
      it('TC-FRT-002: 1分で「約1分で読めます」を返す', () => {
        // 【テスト目的】: 最小の通常値（1分）でも正しくフォーマットされることを確認
        // 【テスト内容】: 1分を渡し、「約1分で読めます」が返されるか検証
        // 【期待される動作】: 1分でも「約N分」形式で表示
        // 🔵 信頼性: requirements.md REQ-801より

        // 【テストデータ準備】: 1分（短い記事の読了時間）
        const minutes = 1;

        // 【実際の処理実行】: formatReadingTime関数を呼び出し
        const result = formatReadingTime(minutes);

        // 【結果検証】: 「約1分で読めます」が返されることを確認
        expect(result).toBe('約1分で読めます'); // 【確認内容】: 1分の日本語表示 🔵
      });

      // TC-FRT-003: 10分で「約10分で読めます」を返す 🔵
      it('TC-FRT-003: 10分で「約10分で読めます」を返す', () => {
        // 【テスト目的】: 2桁の分数でも正しくフォーマットされることを確認
        // 【テスト内容】: 10分を渡し、「約10分で読めます」が返されるか検証
        // 【期待される動作】: 2桁の分数も正しく表示
        // 🔵 信頼性: requirements.md REQ-801・acceptance-criteria.md TC-801-B02より

        // 【テストデータ準備】: 10分（長い記事の読了時間）
        const minutes = 10;

        // 【実際の処理実行】: formatReadingTime関数を呼び出し
        const result = formatReadingTime(minutes);

        // 【結果検証】: 「約10分で読めます」が返されることを確認
        expect(result).toBe('約10分で読めます'); // 【確認内容】: 10分の日本語表示 🔵
      });
    });

    // ========================================
    // 境界値テストケース
    // ========================================

    describe('境界値テストケース', () => {
      // TC-FRT-201: 0分で「1分未満で読めます」を返す 🟡
      it('TC-FRT-201: 0分で「1分未満で読めます」を返す', () => {
        // 【テスト目的】: 読了時間が0の場合、「1分未満」として表示されることを確認
        // 【テスト内容】: 0分を渡し、「1分未満で読めます」が返されるか検証
        // 【期待される動作】: 0分は特殊ケースとして処理
        // 🟡 信頼性: EDGE-103より（表示形式は推測）

        // 【テストデータ準備】: 0分（空文字列または極めて短い記事）
        const minutes = 0;

        // 【実際の処理実行】: formatReadingTime関数を呼び出し
        const result = formatReadingTime(minutes);

        // 【結果検証】: 「1分未満で読めます」が返されることを確認
        // 【確認内容】: 「約0分」ではなく「1分未満」と表示されること
        expect(result).toBe('1分未満で読めます'); // 【確認内容】: 0分は「1分未満」表示 🟡
      });

      // TC-FRT-202: 負の値で「1分未満で読めます」を返す 🟡
      it('TC-FRT-202: 負の値で「1分未満で読めます」を返す', () => {
        // 【テスト目的】: 不正な入力値（負数）でも安全に処理されることを確認
        // 【テスト内容】: -1分を渡し、「1分未満で読めます」が返されるか検証
        // 【期待される動作】: 負の値は0以下として「1分未満」扱い
        // 🟡 信頼性: note.mdからの妥当な推測（防御的プログラミング）

        // 【テストデータ準備】: -1分（不正なデータ）
        // 【実際の発生シナリオ】: プログラムエラー、不正なデータ
        const minutes = -1;

        // 【実際の処理実行】: formatReadingTime関数を呼び出し
        const result = formatReadingTime(minutes);

        // 【結果検証】: 「1分未満で読めます」が返されることを確認
        // 【品質保証】: 予期しない入力に対する安定動作
        expect(result).toBe('1分未満で読めます'); // 【確認内容】: 負の値も「1分未満」表示 🟡
      });

      // TC-FRT-203: 大きな値（100分）で正しくフォーマット 🟡
      it('TC-FRT-203: 大きな値（100分）で正しくフォーマット', () => {
        // 【テスト目的】: 非常に長い記事の読了時間でも正しくフォーマットされることを確認
        // 【テスト内容】: 100分を渡し、「約100分で読めます」が返されるか検証
        // 【期待される動作】: 3桁の数値も正しく表示
        // 🟡 信頼性: note.mdからの妥当な推測

        // 【テストデータ準備】: 100分（50,000文字相当の極端に長い記事）
        const minutes = 100;

        // 【実際の処理実行】: formatReadingTime関数を呼び出し
        const result = formatReadingTime(minutes);

        // 【結果検証】: 「約100分で読めます」が返されることを確認
        // 【境界での正確性】: 数値の大きさに関わらず一貫した形式
        expect(result).toBe('約100分で読めます'); // 【確認内容】: 100分の日本語表示 🟡
      });
    });
  });
});
