# TASK-0007: 読了時間計算ユーティリティ Redフェーズ記録

**作成日**: 2026-01-01
**タスクID**: TASK-0007
**機能名**: reading-time
**フェーズ**: Red（失敗するテスト作成）

---

## 1. 作成したテストケース一覧

### calculateReadingTime() テストケース（9件）

| テストケースID | テスト名 | カテゴリ | 信頼性 |
|--------------|---------|---------|--------|
| TC-RT-001 | 標準的な記事長（1500文字）で3分を返す | 正常系 | 🔵 |
| TC-RT-002 | 長い記事（5000文字）で10分を返す | 正常系 | 🔵 |
| TC-RT-003 | 端数がある記事（1600文字）で切り上げ4分を返す | 正常系 | 🔵 |
| TC-RT-101 | 空文字列で0分を返す | 異常系 | 🔵 |
| TC-RT-201 | 499文字（1分未満境界）で1分を返す | 境界値 | 🔵 |
| TC-RT-202 | 500文字（ちょうど1分）で1分を返す | 境界値 | 🔵 |
| TC-RT-203 | 501文字（1分超え境界）で2分を返す | 境界値 | 🔵 |
| TC-RT-204 | 1文字で1分を返す | 境界値 | 🟡 |
| TC-RT-205 | 200文字（1分未満）で1分を返す | 境界値 | 🔵 |

### formatReadingTime() テストケース（6件）

| テストケースID | テスト名 | カテゴリ | 信頼性 |
|--------------|---------|---------|--------|
| TC-FRT-001 | 3分で「約3分で読めます」を返す | 正常系 | 🔵 |
| TC-FRT-002 | 1分で「約1分で読めます」を返す | 正常系 | 🔵 |
| TC-FRT-003 | 10分で「約10分で読めます」を返す | 正常系 | 🔵 |
| TC-FRT-201 | 0分で「1分未満で読めます」を返す | 境界値 | 🟡 |
| TC-FRT-202 | 負の値で「1分未満で読めます」を返す | 境界値 | 🟡 |
| TC-FRT-203 | 大きな値（100分）で正しくフォーマット | 境界値 | 🟡 |

---

## 2. テストコード

### テストファイル: `src/utils/readingTime.test.ts`

```typescript
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
import { calculateReadingTime, formatReadingTime } from './readingTime';

// ========================================
// テストヘルパー関数
// ========================================

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
    describe('正常系テストケース', () => {
      it('TC-RT-001: 標準的な記事長（1500文字）で3分を返す', () => {
        const content = generateText(1500);
        const result = calculateReadingTime(content);
        expect(result).toBe(3);
      });

      it('TC-RT-002: 長い記事（5000文字）で10分を返す', () => {
        const content = generateText(5000);
        const result = calculateReadingTime(content);
        expect(result).toBe(10);
      });

      it('TC-RT-003: 端数がある記事（1600文字）で切り上げ4分を返す', () => {
        const content = generateText(1600);
        const result = calculateReadingTime(content);
        expect(result).toBe(4);
      });
    });

    describe('異常系テストケース', () => {
      it('TC-RT-101: 空文字列で0分を返す', () => {
        const content = '';
        const result = calculateReadingTime(content);
        expect(result).toBe(0);
      });
    });

    describe('境界値テストケース', () => {
      it('TC-RT-201: 499文字（1分未満境界）で1分を返す', () => {
        const content = generateText(499);
        const result = calculateReadingTime(content);
        expect(result).toBe(1);
      });

      it('TC-RT-202: 500文字（ちょうど1分）で1分を返す', () => {
        const content = generateText(500);
        const result = calculateReadingTime(content);
        expect(result).toBe(1);
      });

      it('TC-RT-203: 501文字（1分超え境界）で2分を返す', () => {
        const content = generateText(501);
        const result = calculateReadingTime(content);
        expect(result).toBe(2);
      });

      it('TC-RT-204: 1文字で1分を返す', () => {
        const content = generateText(1);
        const result = calculateReadingTime(content);
        expect(result).toBe(1);
      });

      it('TC-RT-205: 200文字（1分未満）で1分を返す', () => {
        const content = generateText(200);
        const result = calculateReadingTime(content);
        expect(result).toBe(1);
      });
    });
  });

  // ========================================
  // formatReadingTime() テストケース
  // ========================================

  describe('formatReadingTime', () => {
    describe('正常系テストケース', () => {
      it('TC-FRT-001: 3分で「約3分で読めます」を返す', () => {
        const minutes = 3;
        const result = formatReadingTime(minutes);
        expect(result).toBe('約3分で読めます');
      });

      it('TC-FRT-002: 1分で「約1分で読めます」を返す', () => {
        const minutes = 1;
        const result = formatReadingTime(minutes);
        expect(result).toBe('約1分で読めます');
      });

      it('TC-FRT-003: 10分で「約10分で読めます」を返す', () => {
        const minutes = 10;
        const result = formatReadingTime(minutes);
        expect(result).toBe('約10分で読めます');
      });
    });

    describe('境界値テストケース', () => {
      it('TC-FRT-201: 0分で「1分未満で読めます」を返す', () => {
        const minutes = 0;
        const result = formatReadingTime(minutes);
        expect(result).toBe('1分未満で読めます');
      });

      it('TC-FRT-202: 負の値で「1分未満で読めます」を返す', () => {
        const minutes = -1;
        const result = formatReadingTime(minutes);
        expect(result).toBe('1分未満で読めます');
      });

      it('TC-FRT-203: 大きな値（100分）で正しくフォーマット', () => {
        const minutes = 100;
        const result = formatReadingTime(minutes);
        expect(result).toBe('約100分で読めます');
      });
    });
  });
});
```

---

## 3. 期待される失敗内容

### 現在のエラー

```
src/utils/readingTime.test.ts:16:57 - error ts(2307): Cannot find module './readingTime' or its corresponding type declarations.
```

### 失敗の理由

- **実装ファイルが存在しない**: `src/utils/readingTime.ts` がまだ作成されていない
- **関数が未定義**: `calculateReadingTime()` と `formatReadingTime()` がエクスポートされていない

### テスト実行時の期待される失敗

Vitestが正常に動作する場合、以下のような失敗メッセージが表示される予定です:

```
FAIL  src/utils/readingTime.test.ts
  ✕ TC-RT-001: 標準的な記事長（1500文字）で3分を返す
    Error: calculateReadingTime is not a function
  ✕ TC-FRT-001: 3分で「約3分で読めます」を返す
    Error: formatReadingTime is not a function
  ...（全15件のテストが失敗）
```

---

## 4. Greenフェーズで実装すべき内容

### 実装ファイル: `src/utils/readingTime.ts`

以下の関数を実装する必要があります:

#### 1. calculateReadingTime()

```typescript
/**
 * 記事の読了時間を計算する
 *
 * @param content - 記事本文（Markdown形式またはプレーンテキスト）
 * @returns 読了時間（分）、0以上の整数
 */
export function calculateReadingTime(content: string): number {
  // 計算ロジック:
  // 1. 文字数をカウント（content.length）
  // 2. 500文字/分で割る
  // 3. Math.ceil()で切り上げ
  // 4. 空文字列の場合は0を返す
}
```

#### 2. formatReadingTime()

```typescript
/**
 * 読了時間を日本語表示形式で返す
 *
 * @param minutes - 読了時間（分）
 * @returns 日本語フォーマットの読了時間文字列
 */
export function formatReadingTime(minutes: number): string {
  // フォーマットロジック:
  // 1. 0以下の場合は「1分未満で読めます」を返す
  // 2. 1以上の場合は「約N分で読めます」を返す
}
```

### 実装のポイント

1. **定数の抽出**: `CHARS_PER_MINUTE = 500` を定数として定義
2. **純粋関数**: 副作用なし、同じ入力に対して同じ出力
3. **型安全**: TypeScript strict mode準拠
4. **コメント**: JSDocコメントと要件トレーサビリティを記載

---

## 5. 信頼性レベルサマリー

| レベル | 件数 | 割合 |
|--------|------|------|
| 🔵 青信号 | 11 | 73% |
| 🟡 黄信号 | 4 | 27% |
| 🔴 赤信号 | 0 | 0% |

**品質評価**: ✅ 高品質

---

## 6. 環境の問題について

**注意**: 現在、Vitestの実行時にAstroプラグインのエラーが発生しています:

```
TypeError: Cannot read properties of undefined (reading 'name')
Plugin: astro:build
```

これはプロジェクト環境の問題であり、テストコード自体の問題ではありません。TypeScript型チェック（`pnpm check`）では正しくモジュール未発見エラーが検出されており、テストコードの構文は正しいことが確認されています。

Vitestの問題は別途調査・修正が必要です。

---

**最終更新日**: 2026-01-01
**作成者**: Claude Opus 4.5 (TDD開発エージェント)
