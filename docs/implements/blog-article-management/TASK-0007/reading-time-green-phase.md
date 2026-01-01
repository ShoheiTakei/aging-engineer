# TASK-0007: 読了時間計算ユーティリティ Greenフェーズ記録

**作成日**: 2026-01-01
**タスクID**: TASK-0007
**機能名**: reading-time
**フェーズ**: Green（最小実装）

---

## 1. 実装概要

### 実装ファイル

- **パス**: `src/utils/readingTime.ts`
- **行数**: 約90行
- **関数数**: 2つ（`calculateReadingTime`, `formatReadingTime`）

### 実装方針

- **純粋関数として実装**: 副作用なし、同じ入力に対して同じ出力
- **ネイティブAPIのみ使用**: 外部ライブラリ不使用（NFR-001対応）
- **既存パターン踏襲**: `date.ts` の実装パターンを参考に
- **日本語コメント充実**: 要件トレーサビリティを確保

---

## 2. 実装コード

```typescript
/**
 * 読了時間計算ユーティリティ
 *
 * 【機能概要】: 記事本文から読了時間を計算し、日本語表示形式で提供する
 * 【設計方針】: 純粋関数として実装（副作用なし）、外部ライブラリ不使用
 * 【パフォーマンス】: ネイティブAPIのみ使用（NFR-001対応）
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
 */
const CHARS_PER_MINUTE = 500;

// ========================================
// 公開関数
// ========================================

/**
 * 【機能概要】: 記事の読了時間を計算する
 * 【計算方法】: 日本語500文字/分で計算
 * 【設計方針】: 純粋関数として実装（副作用なし）
 * 【パフォーマンス】: ネイティブAPIのみ使用（NFR-001対応）
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
 * 【設計方針】: 分数に応じて適切な文字列を生成
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
```

---

## 3. テスト実行結果

### 実行環境

- **テストフレームワーク**: Vitest 2.1.9
- **テスト環境**: Node.js（純粋なTypeScriptテスト）

### 実行結果

```
 RUN  v2.1.9 /Users/s.t/ghq/github.com/ShoheiTakei/aging-engineer

 ✓ src/utils/readingTime.test.ts (15 tests) 3ms

 Test Files  1 passed (1)
      Tests  15 passed (15)
   Start at  10:16:54
   Duration  412ms (transform 115ms, setup 0ms, collect 27ms, tests 3ms, environment 0ms, prepare 153ms)
```

### テストケース結果詳細

#### calculateReadingTime() - 9件すべて成功

| テストケースID | テスト名 | 結果 |
|--------------|---------|------|
| TC-RT-001 | 標準的な記事長（1500文字）で3分を返す | ✓ Pass |
| TC-RT-002 | 長い記事（5000文字）で10分を返す | ✓ Pass |
| TC-RT-003 | 端数がある記事（1600文字）で切り上げ4分を返す | ✓ Pass |
| TC-RT-101 | 空文字列で0分を返す | ✓ Pass |
| TC-RT-201 | 499文字（1分未満境界）で1分を返す | ✓ Pass |
| TC-RT-202 | 500文字（ちょうど1分）で1分を返す | ✓ Pass |
| TC-RT-203 | 501文字（1分超え境界）で2分を返す | ✓ Pass |
| TC-RT-204 | 1文字で1分を返す | ✓ Pass |
| TC-RT-205 | 200文字（1分未満）で1分を返す | ✓ Pass |

#### formatReadingTime() - 6件すべて成功

| テストケースID | テスト名 | 結果 |
|--------------|---------|------|
| TC-FRT-001 | 3分で「約3分で読めます」を返す | ✓ Pass |
| TC-FRT-002 | 1分で「約1分で読めます」を返す | ✓ Pass |
| TC-FRT-003 | 10分で「約10分で読めます」を返す | ✓ Pass |
| TC-FRT-201 | 0分で「1分未満で読めます」を返す | ✓ Pass |
| TC-FRT-202 | 負の値で「1分未満で読めます」を返す | ✓ Pass |
| TC-FRT-203 | 大きな値（100分）で正しくフォーマット | ✓ Pass |

---

## 4. 型チェック結果

```
Result (22 files):
- 0 errors
- 0 warnings
- 5 hints
```

**注意**: 5つのhintsは別ファイルの未使用変数に関するものであり、`readingTime.ts` とは無関係。

---

## 5. 品質判定

### 品質基準チェック

| 基準 | 状態 | 説明 |
|------|------|------|
| テスト結果 | ✅ 全15件成功 | Vitestによる実行で全て成功 |
| 実装品質 | ✅ シンプル | 純粋関数として実装、約90行 |
| リファクタ箇所 | ✅ 明確 | 現時点では必要なし |
| 機能的問題 | ✅ なし | 要件通りに動作 |
| コンパイルエラー | ✅ なし | 0 errors, 0 warnings |
| ファイルサイズ | ✅ 800行以下 | 約90行（十分余裕あり） |
| モック使用 | ✅ 適切 | 実装コードにモック・スタブなし |

### 品質評価

**評価: ✅ 高品質**

**評価理由**:
- 全15件のテストが成功
- シンプルで理解しやすい実装
- 要件定義書に準拠した実装
- 既存の `date.ts` パターンとの一貫性を確保
- 日本語コメントによる要件トレーサビリティ

---

## 6. 課題・改善点（Refactorフェーズで対応）

### 現在の実装で検討事項

1. **Markdown記法の扱い**
   - 現状: 記法込みで文字数カウント
   - 改善案: 必要に応じてMarkdown記法を除外してカウント

2. **絵文字・サロゲートペアの扱い**
   - 現状: `content.length` はUTF-16コード単位
   - 改善案: 必要に応じてコードポイント単位のカウントに変更

3. **定数の外部化**
   - 現状: `CHARS_PER_MINUTE` はモジュール内に定義
   - 改善案: 設定ファイルから読み込む形式に変更（多言語対応時）

### Refactorフェーズの推奨アクション

- 現在の実装は要件を満たしており、シンプルで理解しやすい
- 大きなリファクタリングは不要
- コードレビューでのフィードバックに応じて微調整

---

## 7. 環境に関する注意事項

### Vitestの問題

プロジェクトのデフォルト設定（`vitest.config.ts`）ではAstroプラグインのエラーが発生:

```
TypeError: Cannot read properties of undefined (reading 'name')
Plugin: astro:build
```

**対処方法**:
- 純粋なTypeScriptファイル（utilsなど）のテストは、Astroプラグインを使用しない簡易設定で実行可能
- Astroコンポーネントのテストには別途対応が必要

この問題はプロジェクト環境の問題であり、実装コード・テストコード自体の問題ではない。

---

## 8. 信頼性レベルサマリー

| レベル | 件数 | 割合 |
|--------|------|------|
| 🔵 青信号 | 11 | 73% |
| 🟡 黄信号 | 4 | 27% |
| 🔴 赤信号 | 0 | 0% |

---

## 9. 次のステップ

Greenフェーズが完了しました。

**次のお勧めステップ**: `/tsumiki:tdd-refactor blog-article-management TASK-0007` でRefactorフェーズ（品質改善）を開始します。

---

**最終更新日**: 2026-01-01
**作成者**: Claude Opus 4.5 (TDD開発エージェント)
