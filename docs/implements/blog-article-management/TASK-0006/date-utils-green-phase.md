# TASK-0006: 日付フォーマットユーティリティ - Greenフェーズ記録

**作成日**: 2026-01-01
**タスクID**: TASK-0006
**機能名**: 日付フォーマットユーティリティ
**フェーズ**: TDD Green（最小実装）

---

## 1. 実装概要

### 実装日時

2026-01-01

### 実装方針

- テストを通す最小限の実装を行う
- ネイティブAPIのみ使用（外部ライブラリ不使用）
- Asia/Tokyoタイムゾーンを明示的に指定
- 日本語コメントを適切に記載

### 対応したテストケース

**formatDate() テストケース（9件）: 全成功**
- TC-D-001: 日本語フォーマットで日付を表示する
- TC-D-002: 2桁月（12月）を正しく表示する
- TC-D-003: 日本語ロケールで月が正しく表記される
- TC-D-101: 無効な日付でエラーをスローする
- TC-D-102: NaN Dateでエラーをスローする
- TC-D-201: 年末（12月31日）を正しく表示する
- TC-D-202: 年始（1月1日）を正しく表示する
- TC-D-203: 閏年（2月29日）を正しく表示する
- TC-D-204: 月初（1日）を正しく表示する

**getRelativeTime() テストケース（7件）: 全成功**
- TC-R-001: 今日の日付で「今日」を返す
- TC-R-002: 1日前の日付で「1日前」を返す
- TC-R-003: N日前の日付で「N日前」を返す
- TC-R-004: 大きな日数差（30日前）を正しく表示する
- TC-R-201: 日付境界（23:59 → 0:00）で正しく計算する
- TC-R-202: 同日の異なる時刻で「今日」を返す
- TC-R-203: 年をまたぐ相対日付計算を正しく行う

---

## 2. 実装コード

**ファイルパス**: `src/utils/date.ts`

```typescript
/**
 * 日付フォーマットユーティリティ
 *
 * 関連要件:
 * - REQ-001: frontmatterでpubDate, updatedDateを管理
 * - REQ-102: 記事一覧で公開日を表示
 * - REQ-112: 記事詳細で公開日・更新日を表示
 *
 * TDD Greenフェーズ: テストを通す最小限の実装
 */

/**
 * 【機能概要】: 日付を日本語フォーマット（年月日）で表示する
 * 【実装方針】: Intl.DateTimeFormat APIを使用してネイティブに日本語フォーマット
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
  // 【エラー処理】: isNaN(date.getTime())でInvalid Dateを検出
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }

  // 【日本語フォーマット処理】: Intl.DateTimeFormatを使用 🔵
  // 【処理方針】: ネイティブAPIで軽量、外部ライブラリ不使用（NFR-001対応）
  // 【タイムゾーン】: Asia/Tokyoを明示的に指定（ビルド環境差異対策）
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Tokyo',
  }).format(date);
}

/**
 * 【機能概要】: 日付を相対表示形式で返す
 * 【実装方針】: 現在日時との日数差分を計算して相対表示
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

  // 【日数差分計算】: 日単位での差分を計算 🔵
  // 【処理方針】: 時刻を無視して日付のみで比較（要件定義書セクション4.2より）
  // 【タイムゾーン考慮】: Asia/Tokyoでの日付境界で計算 🟡
  const nowInTokyo = new Date(
    now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }),
  );
  const dateInTokyo = new Date(
    date.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }),
  );

  // 【日付のみ比較】: 時刻をリセットして日付単位で比較 🔵
  const nowDateOnly = new Date(
    nowInTokyo.getFullYear(),
    nowInTokyo.getMonth(),
    nowInTokyo.getDate(),
  );
  const targetDateOnly = new Date(
    dateInTokyo.getFullYear(),
    dateInTokyo.getMonth(),
    dateInTokyo.getDate(),
  );

  // 【日数差分算出】: ミリ秒差分を日数に変換 🔵
  const diffInMs = nowDateOnly.getTime() - targetDateOnly.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  // 【相対表示生成】: 日数差分に応じた文字列を返す 🔵
  // 【0日差】: 「今日」を返す
  if (diffInDays === 0) {
    return '今日';
  }

  // 【1日差】: 「1日前」を返す
  if (diffInDays === 1) {
    return '1日前';
  }

  // 【N日差】: 「N日前」を返す
  return `${diffInDays}日前`;
}
```

---

## 3. テスト実行結果

```
 RUN  v2.1.9 /Users/s.t/ghq/github.com/ShoheiTakei/aging-engineer

 ✓ src/utils/date.test.ts (16 tests) 18ms

 Test Files  1 passed (1)
      Tests  16 passed (16)
   Start at  09:31:15
   Duration  453ms
```

**結果**: 全16件のテストが成功

---

## 4. テストコードの修正

### TC-R-201: タイムゾーン考慮の修正

Greenフェーズ中にTC-R-201（日付境界での計算テスト）が失敗しました。

**原因**: テストデータがUTC基準で設定されていたが、実装はAsia/Tokyoで日付を計算するため、日付境界がずれていた。

**修正内容**: テストデータをJST（Asia/Tokyo）基準に修正

```typescript
// 修正前: UTC基準
vi.setSystemTime(new Date('2025-01-15T00:00:01.000Z')); // UTC 0:00:01
const yesterday = new Date('2025-01-14T23:59:59.000Z');

// 修正後: JST基準
vi.setSystemTime(new Date('2025-01-14T15:00:01.000Z')); // JST 0:00:01
const yesterday = new Date('2025-01-14T14:59:59.000Z'); // JST 23:59:59
```

**判断理由**: 実装は仕様通り（Asia/Tokyoで日付計算）であるため、テストケースを実装に合わせて修正した。

---

## 5. 課題・改善点（Refactorフェーズで対応）

### 5.1 パフォーマンス改善

- `getRelativeTime()`内での`toLocaleString()`呼び出しは毎回実行される
- キャッシュ可能な部分を抽出することでパフォーマンス向上が可能

### 5.2 コード整理

- `getRelativeTime()`のタイムゾーン変換ロジックを別関数に抽出可能
- 共通のタイムゾーン変換ヘルパーとして再利用可能に

### 5.3 エラーハンドリング強化

- `getRelativeTime()`にも無効な日付チェックを追加することを検討
- 将来日付の処理（「明日」「N日後」など）の追加も検討

---

## 6. 品質判定結果

### 品質評価: ✅ 高品質

| 基準 | 状態 | 詳細 |
|------|------|------|
| テスト結果 | ✅ | 16/16 成功（100%） |
| 実装品質 | ✅ | シンプルかつ動作する |
| リファクタ箇所 | ✅ | 明確に特定可能（上記参照） |
| 機能的問題 | ✅ | なし |
| コンパイルエラー | ✅ | なし |
| ファイルサイズ | ✅ | 103行（800行以下） |
| モック使用 | ✅ | 実装コードにモック・スタブなし |

---

## 7. 信頼性レベルサマリー

| レベル | 件数 | 割合 | 説明 |
|--------|------|------|------|
| 🔵 青信号 | 14 | 87.5% | test-patterns.md・要件定義書から確実に導出 |
| 🟡 黄信号 | 2 | 12.5% | 要件定義書から妥当な推測（タイムゾーン処理） |
| 🔴 赤信号 | 0 | 0% | 推測なし |

---

**最終更新日**: 2026-01-01
**作成者**: Claude Opus 4.5 (TDD開発エージェント)
