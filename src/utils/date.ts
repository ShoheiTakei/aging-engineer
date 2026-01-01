/**
 * 日付フォーマットユーティリティ
 *
 * 【改善内容】: TDD Refactorフェーズで品質向上を実施
 * - 定数の抽出によるDRY原則適用
 * - DateTimeFormatインスタンスのキャッシュ化によるパフォーマンス向上
 * - ヘルパー関数の抽出による可読性向上
 * - コメントの改善
 *
 * 関連要件:
 * - REQ-001: frontmatterでpubDate, updatedDateを管理
 * - REQ-102: 記事一覧で公開日を表示
 * - REQ-112: 記事詳細で公開日・更新日を表示
 * - NFR-001: Lighthouse 90+点維持（外部ライブラリ不使用）
 *
 * 関連文書:
 * - テストケース定義書: docs/implements/blog-article-management/TASK-0006/date-utils-testcases.md
 * - 要件定義書: docs/implements/blog-article-management/TASK-0006/date-utils-requirements.md
 */

// ========================================
// 定数定義
// ========================================

/**
 * 【設定定数】: 日本語ロケール設定 🔵
 * 【用途】: Intl.DateTimeFormatで使用するロケール識別子
 * 【調整可能性】: 多言語対応時に設定オブジェクトへ移行可能
 */
const LOCALE_JA_JP = 'ja-JP';

/**
 * 【設定定数】: タイムゾーン設定 🔵
 * 【用途】: 日付計算とフォーマットで使用するタイムゾーン
 * 【調整可能性】: 環境変数から読み込む拡張が可能
 */
const TIMEZONE_TOKYO = 'Asia/Tokyo';

/**
 * 【設定定数】: 1日のミリ秒数 🔵
 * 【用途】: 日数差分計算で使用
 * 【計算式】: 1000ms * 60秒 * 60分 * 24時間
 */
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

// ========================================
// キャッシュされたDateTimeFormatインスタンス
// ========================================

/**
 * 【パフォーマンス最適化】: DateTimeFormatインスタンスのキャッシュ 🔵
 * 【改善効果】: 毎回のインスタンス生成コストを削減
 * 【設計方針】: モジュールレベルで1回だけ生成し再利用
 */
const dateFormatter = new Intl.DateTimeFormat(LOCALE_JA_JP, {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: TIMEZONE_TOKYO,
});

// ========================================
// ヘルパー関数
// ========================================

/**
 * 【ヘルパー関数】: 日付のタイムゾーン変換と時刻リセット
 * 【再利用性】: 日付比較が必要な他の関数でも使用可能
 * 【単一責任】: タイムゾーンを考慮した日付のみの抽出を担当
 * 🔵 信頼性レベル: 既存実装からの抽出
 *
 * @param date - 変換対象のDateオブジェクト
 * @returns Asia/Tokyoタイムゾーンで時刻をリセットしたDateオブジェクト
 */
function toTokyoDateOnly(date: Date): Date {
  // 【タイムゾーン変換】: Asia/Tokyoでの日付を取得 🔵
  // 【処理方針】: toLocaleStringで変換後、新しいDateオブジェクトを生成
  const dateInTokyo = new Date(date.toLocaleString('en-US', { timeZone: TIMEZONE_TOKYO }));

  // 【時刻リセット】: 日付のみを保持（時・分・秒を0に） 🔵
  // 【目的】: 日単位での比較を可能にする
  return new Date(dateInTokyo.getFullYear(), dateInTokyo.getMonth(), dateInTokyo.getDate());
}

/**
 * 【ヘルパー関数】: 日付の有効性チェック
 * 【再利用性】: 日付を扱う他の関数でも使用可能
 * 【単一責任】: Dateオブジェクトの有効性判定を担当
 * 🔵 信頼性レベル: 既存実装からの抽出
 *
 * @param date - チェック対象のDateオブジェクト
 * @returns 有効な日付の場合true
 */
function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

// ========================================
// 公開関数
// ========================================

/**
 * 【機能概要】: 日付を日本語フォーマット（年月日）で表示する
 * 【改善内容】: キャッシュされたDateTimeFormatインスタンスを使用しパフォーマンス向上
 * 【設計方針】: ネイティブAPIで軽量、外部ライブラリ不使用（NFR-001対応）
 * 【パフォーマンス】: DateTimeFormatのキャッシュにより繰り返し呼び出し時のオーバーヘッド削減
 * 【保守性】: 定数とヘルパー関数の分離により変更容易性を確保
 * 【テスト対応】: TC-D-001〜TC-D-204（正常系・異常系・境界値）
 * 🔵 信頼性レベル: test-patterns.mdのサンプル実装に基づく
 *
 * @param date - フォーマット対象のDateオブジェクト
 * @returns 日本語フォーマットの日付文字列（例: "2025年1月15日"）
 * @throws {Error} 無効な日付が渡された場合
 *
 * @example
 * formatDate(new Date('2025-01-15')) // => '2025年1月15日'
 *
 * @関連要件 REQ-001, REQ-102, REQ-112
 */
export function formatDate(date: Date): string {
  // 【入力値検証】: 無効な日付を検出してエラーをスロー 🔵
  // 【セキュリティ】: 不正入力に対する防御的プログラミング
  if (!isValidDate(date)) {
    throw new Error('Invalid date');
  }

  // 【日本語フォーマット処理】: キャッシュされたフォーマッタを使用 🔵
  // 【パフォーマンス】: インスタンス生成コストを回避
  return dateFormatter.format(date);
}

/**
 * 【機能概要】: 日付を相対表示形式で返す
 * 【改善内容】: ヘルパー関数の抽出により可読性・保守性を向上
 * 【設計方針】: 日数差分を計算して人間が読みやすい相対表示を生成
 * 【パフォーマンス】: 定数の事前計算により演算コストを削減
 * 【保守性】: タイムゾーン変換ロジックをヘルパー関数に分離
 * 【テスト対応】: TC-R-001〜TC-R-203（正常系・境界値）
 * 🔵 信頼性レベル: test-patterns.mdのサンプル実装に基づく
 *
 * @param date - 比較対象のDateオブジェクト
 * @returns 相対日付文字列（例: "今日", "1日前", "5日前"）
 *
 * @example
 * getRelativeTime(new Date()) // => '今日'
 *
 * @関連要件 REQ-001
 */
export function getRelativeTime(date: Date): string {
  // 【現在日時取得】: 比較基準となる現在日時を取得 🔵
  const now = new Date();

  // 【日付のみ抽出】: ヘルパー関数を使用してタイムゾーン変換と時刻リセット 🔵
  // 【可読性向上】: 複雑なロジックをヘルパー関数に委譲
  const nowDateOnly = toTokyoDateOnly(now);
  const targetDateOnly = toTokyoDateOnly(date);

  // 【日数差分算出】: ミリ秒差分を日数に変換 🔵
  // 【改善】: 定数MILLISECONDS_PER_DAYを使用し可読性向上
  const diffInMs = nowDateOnly.getTime() - targetDateOnly.getTime();
  const diffInDays = Math.floor(diffInMs / MILLISECONDS_PER_DAY);

  // 【相対表示生成】: 日数差分に応じた文字列を返す 🔵
  if (diffInDays === 0) {
    return '今日';
  }

  // 【N日差】: 「N日前」を返す（1日前も含む統一的な表現）
  return `${diffInDays}日前`;
}
