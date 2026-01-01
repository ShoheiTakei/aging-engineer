/**
 * 読了時間計算ユーティリティ
 *
 * 【機能概要】: 記事本文から読了時間を計算し、日本語表示形式で提供する
 * 【設計方針】: 純粋関数として実装（副作用なし）、外部ライブラリ不使用
 * 【パフォーマンス】: ネイティブAPIのみ使用（NFR-001対応）
 * 【改善内容】: TDD Refactorフェーズで品質確認・コメント改善を実施
 * - 定数CHARS_PER_MINUTEのエクスポートによるテスト再利用性向上
 * - date.tsパターンとの一貫性確保
 * - セキュリティ・パフォーマンスレビュー実施済み
 *
 * 関連要件:
 * - REQ-801: 記事の読了時間を自動計算して表示（500文字/分）
 * - EDGE-103: 読了時間が1分未満の記事は「1分未満」と表示
 *
 * 関連文書:
 * - 要件定義書: docs/implements/blog-article-management/TASK-0007/reading-time-requirements.md
 * - テストケース定義書: docs/implements/blog-article-management/TASK-0007/reading-time-testcases.md
 * - タスクノート: docs/implements/blog-article-management/TASK-0007/note.md
 */

// ========================================
// 定数定義
// ========================================

/**
 * 【設定定数】: 1分あたりの読了文字数 🔵
 * 【用途】: 読了時間計算の基準値
 * 【根拠】: 日本語の平均読書速度（requirements.md REQ-801）
 * 【調整可能性】: 将来的に設定オブジェクトへ移行可能
 * 【エクスポート理由】: 外部からの参照・テストでの再利用を可能にする
 */
export const CHARS_PER_MINUTE = 500;

// ========================================
// 公開関数
// ========================================

/**
 * 【機能概要】: 記事の読了時間を計算する
 * 【改善内容】: 空文字列の早期リターンによる可読性向上
 * 【計算方法】: 日本語500文字/分で計算
 * 【設計方針】: 純粋関数として実装（副作用なし）
 * 【パフォーマンス】: content.lengthはO(1)、ネイティブAPIのみ使用（NFR-001対応）
 * 【保守性】: 定数CHARS_PER_MINUTEの外部化により調整容易性を確保
 * 【テスト対応】: TC-RT-001〜TC-RT-205（正常系・異常系・境界値）
 * 🔵 信頼性レベル: dataflow.md・requirements.md REQ-801に基づく
 *
 * @param content - 記事本文（Markdown形式またはプレーンテキスト）
 * @returns 読了時間（分）、0以上の整数
 *
 * @example
 * calculateReadingTime('これは1500文字の記事です...') // => 3
 * calculateReadingTime('') // => 0
 *
 * @関連要件 REQ-801
 */
export function calculateReadingTime(content: string): number {
  // 【文字数カウント】: content.lengthでUTF-16コード単位のカウント 🔵
  // 【処理方針】: 日本語文字は1文字=1カウント（正しい動作）
  const charCount = content.length;

  // 【空文字列対応】: 空文字列の場合は0を返す 🔵
  // 【根拠】: note.mdセクション5.1「空文字列・短い記事の処理」
  if (charCount === 0) {
    return 0;
  }

  // 【読了時間計算】: 文字数を読了速度で割り、切り上げ 🔵
  // 【計算式】: Math.ceil(文字数 / 500)
  // 【根拠】: requirements.md REQ-801
  const minutes = Math.ceil(charCount / CHARS_PER_MINUTE);

  return minutes;
}

/**
 * 【機能概要】: 読了時間を日本語表示形式で返す
 * 【改善内容】: 防御的プログラミングによる負の値への対応
 * 【設計方針】: 分数に応じて適切な文字列を生成
 * 【パフォーマンス】: テンプレートリテラルによる効率的な文字列生成
 * 【保守性】: 表示フォーマットの変更が容易な構造
 * 【テスト対応】: TC-FRT-001〜TC-FRT-203（正常系・境界値）
 * 🔵🟡 信頼性レベル: requirements.md REQ-801、EDGE-103に基づく
 *
 * @param minutes - 読了時間（分）
 * @returns 日本語フォーマットの読了時間文字列
 *
 * @example
 * formatReadingTime(3) // => '約3分で読めます'
 * formatReadingTime(0) // => '1分未満で読めます'
 *
 * @関連要件 REQ-801, EDGE-103
 */
export function formatReadingTime(minutes: number): string {
  // 【1分未満判定】: 0以下の場合は特殊表示 🟡
  // 【根拠】: EDGE-103より推測
  // 【防御的プログラミング】: 負の値も「1分未満」として処理
  if (minutes <= 0) {
    return '1分未満で読めます';
  }

  // 【通常表示】: 「約N分で読めます」形式 🔵
  // 【根拠】: requirements.md REQ-801
  return `約${minutes}分で読めます`;
}
