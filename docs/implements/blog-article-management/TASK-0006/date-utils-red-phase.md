# TASK-0006: 日付フォーマットユーティリティ - Redフェーズ記録

**作成日**: 2026-01-01
**タスクID**: TASK-0006
**機能名**: 日付フォーマットユーティリティ
**フェーズ**: TDD Red（失敗テスト作成）

---

## 1. 作成したテストケース一覧

### formatDate() テストケース（9件）

| テストID | テスト名 | カテゴリ | 信頼性 |
|----------|---------|----------|--------|
| TC-D-001 | 日本語フォーマットで日付を表示する | 正常系 | 🔵 |
| TC-D-002 | 2桁月（12月）を正しく表示する | 正常系 | 🔵 |
| TC-D-003 | 日本語ロケールで月が正しく表記される | 正常系 | 🔵 |
| TC-D-101 | 無効な日付でエラーをスローする | 異常系 | 🔵 |
| TC-D-102 | NaN Dateでエラーをスローする | 異常系 | 🔵 |
| TC-D-201 | 年末（12月31日）を正しく表示する | 境界値 | 🔵 |
| TC-D-202 | 年始（1月1日）を正しく表示する | 境界値 | 🔵 |
| TC-D-203 | 閏年（2月29日）を正しく表示する | 境界値 | 🔵 |
| TC-D-204 | 月初（1日）を正しく表示する | 境界値 | 🔵 |

### getRelativeTime() テストケース（7件）

| テストID | テスト名 | カテゴリ | 信頼性 |
|----------|---------|----------|--------|
| TC-R-001 | 今日の日付で「今日」を返す | 正常系 | 🔵 |
| TC-R-002 | 1日前の日付で「1日前」を返す | 正常系 | 🔵 |
| TC-R-003 | N日前の日付で「N日前」を返す | 正常系 | 🔵 |
| TC-R-004 | 大きな日数差（30日前）を正しく表示する | 正常系 | 🟡 |
| TC-R-201 | 日付境界（23:59 → 0:00）で正しく計算する | 境界値 | 🔵 |
| TC-R-202 | 同日の異なる時刻で「今日」を返す | 境界値 | 🔵 |
| TC-R-203 | 年をまたぐ相対日付計算を正しく行う | 境界値 | 🟡 |

---

## 2. テストコード

**ファイルパス**: `src/utils/date.test.ts`

```typescript
/**
 * date.ts - テストスイート
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
 * - タスクノート: docs/implements/blog-article-management/TASK-0006/note.md
 * - テストパターン: docs/design/frontend-test-infra/test-patterns.md
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatDate, getRelativeTime } from './date';

describe('date utilities', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('formatDate', () => {
    describe('正常系テストケース', () => {
      it('TC-D-001: 日本語フォーマットで日付を表示する', () => {
        const date = new Date('2025-01-15T10:30:00Z');
        const result = formatDate(date);
        expect(result).toBe('2025年1月15日');
      });

      it('TC-D-002: 2桁月（12月）を正しく表示する', () => {
        const date = new Date('2025-12-25');
        const result = formatDate(date);
        expect(result).toBe('2025年12月25日');
      });

      it('TC-D-003: 日本語ロケールで月が正しく表記される', () => {
        const date = new Date('2025-06-01');
        const result = formatDate(date);
        expect(result).toBe('2025年6月1日');
      });
    });

    describe('異常系テストケース', () => {
      it('TC-D-101: 無効な日付でエラーをスローする', () => {
        const invalidDate = new Date('invalid');
        expect(() => formatDate(invalidDate)).toThrow('Invalid date');
      });

      it('TC-D-102: NaN Dateでエラーをスローする', () => {
        const nanDate = new Date(NaN);
        expect(() => formatDate(nanDate)).toThrow('Invalid date');
      });
    });

    describe('境界値テストケース', () => {
      it('TC-D-201: 年末（12月31日）を正しく表示する', () => {
        const date = new Date('2025-12-31');
        const result = formatDate(date);
        expect(result).toBe('2025年12月31日');
      });

      it('TC-D-202: 年始（1月1日）を正しく表示する', () => {
        const date = new Date('2026-01-01');
        const result = formatDate(date);
        expect(result).toBe('2026年1月1日');
      });

      it('TC-D-203: 閏年（2月29日）を正しく表示する', () => {
        const date = new Date('2024-02-29');
        const result = formatDate(date);
        expect(result).toBe('2024年2月29日');
      });

      it('TC-D-204: 月初（1日）を正しく表示する', () => {
        const date = new Date('2025-03-01');
        const result = formatDate(date);
        expect(result).toBe('2025年3月1日');
      });
    });
  });

  describe('getRelativeTime', () => {
    describe('正常系テストケース', () => {
      it('TC-R-001: 今日の日付で「今日」を返す', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'));
        const today = new Date('2025-01-15T09:00:00.000Z');
        const result = getRelativeTime(today);
        expect(result).toBe('今日');
        vi.useRealTimers();
      });

      it('TC-R-002: 1日前の日付で「1日前」を返す', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'));
        const yesterday = new Date('2025-01-14T12:00:00.000Z');
        const result = getRelativeTime(yesterday);
        expect(result).toBe('1日前');
        vi.useRealTimers();
      });

      it('TC-R-003: N日前の日付で「N日前」を返す', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'));
        const fiveDaysAgo = new Date('2025-01-10T12:00:00.000Z');
        const result = getRelativeTime(fiveDaysAgo);
        expect(result).toBe('5日前');
        vi.useRealTimers();
      });

      it('TC-R-004: 大きな日数差（30日前）を正しく表示する', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-31T12:00:00.000Z'));
        const thirtyDaysAgo = new Date('2025-01-01T12:00:00.000Z');
        const result = getRelativeTime(thirtyDaysAgo);
        expect(result).toBe('30日前');
        vi.useRealTimers();
      });
    });

    describe('境界値テストケース', () => {
      it('TC-R-201: 日付境界（23:59 → 0:00）で正しく計算する', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-15T00:00:01.000Z'));
        const yesterday = new Date('2025-01-14T23:59:59.000Z');
        const result = getRelativeTime(yesterday);
        expect(result).toBe('1日前');
        vi.useRealTimers();
      });

      it('TC-R-202: 同日の異なる時刻で「今日」を返す', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2025-01-15T12:00:00.000Z'));
        const sameDay = new Date('2025-01-15T00:00:00.000Z');
        const result = getRelativeTime(sameDay);
        expect(result).toBe('今日');
        vi.useRealTimers();
      });

      it('TC-R-203: 年をまたぐ相対日付計算を正しく行う', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-02T12:00:00.000Z'));
        const lastYear = new Date('2025-12-31T12:00:00.000Z');
        const result = getRelativeTime(lastYear);
        expect(result).toBe('2日前');
        vi.useRealTimers();
      });
    });
  });
});
```

---

## 3. 期待される失敗メッセージ

テスト実行結果:

```
Test Files  1 failed (1)
    Tests  16 failed (16)
```

### 失敗パターン

| テストカテゴリ | 失敗理由 | エラーメッセージ |
|--------------|----------|-----------------|
| 正常系（formatDate） | 未実装 | `Error: Not implemented` |
| 正常系（getRelativeTime） | 未実装 | `Error: Not implemented` |
| 異常系（formatDate） | エラーメッセージ不一致 | `expected [Function] to throw error including 'Invalid date' but got 'Not implemented'` |
| 境界値（両関数） | 未実装 | `Error: Not implemented` |

---

## 4. Greenフェーズで実装すべき内容

### formatDate() 関数

1. **日付の有効性チェック**
   - `isNaN(date.getTime())` で無効な日付を検出
   - 無効な場合は `Error: Invalid date` をスロー

2. **日本語フォーマット処理**
   - `Intl.DateTimeFormat('ja-JP')` を使用
   - オプション: `{ year: 'numeric', month: 'long', day: 'numeric' }`
   - タイムゾーン: `Asia/Tokyo` を明示的に指定

3. **実装例**
   ```typescript
   export function formatDate(date: Date): string {
     if (isNaN(date.getTime())) {
       throw new Error('Invalid date');
     }
     return new Intl.DateTimeFormat('ja-JP', {
       year: 'numeric',
       month: 'long',
       day: 'numeric',
       timeZone: 'Asia/Tokyo',
     }).format(date);
   }
   ```

### getRelativeTime() 関数

1. **日付差分の計算**
   - 現在日時との差分をミリ秒で計算
   - 日単位に変換（時刻は無視、日付のみで判定）

2. **相対表示の生成**
   - 0日差: `"今日"`
   - 1日差: `"1日前"`
   - N日差: `"${N}日前"`

3. **実装例**
   ```typescript
   export function getRelativeTime(date: Date): string {
     const now = new Date();
     const diffInDays = Math.floor(
       (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
     );

     if (diffInDays === 0) return '今日';
     if (diffInDays === 1) return '1日前';
     return `${diffInDays}日前`;
   }
   ```

---

## 5. 信頼性レベルサマリー

| レベル | 件数 | 割合 | 説明 |
|--------|------|------|------|
| 🔵 青信号 | 14 | 87.5% | test-patterns.md・要件定義書から確実に導出 |
| 🟡 黄信号 | 2 | 12.5% | 要件定義書から妥当な推測 |
| 🔴 赤信号 | 0 | 0% | 推測なし |

---

## 6. 品質判定結果

### 品質評価: ✅ 高品質

| 基準 | 状態 | 詳細 |
|------|------|------|
| テスト実行 | ✅ | 16件すべて実行可能、失敗を確認済み |
| 期待値定義 | ✅ | 各テストケースの期待値が明確 |
| アサーション | ✅ | 適切なアサーション使用（toBe, toThrow） |
| 実装方針 | ✅ | Greenフェーズで実装すべき内容が明確 |
| 信頼性レベル | ✅ | 🔵（青信号）が87.5%で多数 |

---

**最終更新日**: 2026-01-01
**作成者**: Claude Opus 4.5 (TDD開発エージェント)
