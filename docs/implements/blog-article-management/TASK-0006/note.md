# TASK-0006: 日付フォーマットユーティリティの実装 - タスクノート

**作成日**: 2026-01-01
**タスクタイプ**: TDD
**見積もり工数**: 4時間
**優先度**: P0 (最優先)

---

## 概要

TASK-0006「日付フォーマットユーティリティの実装」の開発に必要なコンテキスト情報を整理したタスクノートです。

**タスク概要**:
- `formatDate()` 関数の実装（日本語ロケールでの日付フォーマット）
- `formatRelativeDate()` 関数の実装（相対日付表示: 今日、1日前など）
- `src/utils/date.ts` にユーティリティを配置
- 単体テストの実装（TDD Red-Green-Refactor）

**関連要件**: REQ-001 (公開日・更新日表示)
**依存タスク**: TASK-0002（ディレクトリ構造とプロジェクト初期化）- 完了済み

---

## 1. 技術スタック

### フレームワーク・ライブラリ

| 技術 | バージョン | 用途 | 備考 |
|------|-----------|------|------|
| **Astro** | 5.1.3 | UIフレームワーク | Content Collections APIと連携 |
| **TypeScript** | 5.7+ | 型安全な開発 | strict mode有効 |
| **Vitest** | 2.1.8 | テストフレームワーク | 単体テスト実行 |
| **happy-dom** | 20.0.11 | テストランタイム | DOM環境シミュレーション |

### アーキテクチャパターン

**Islands Architecture + Static Site Generation (SSG)**
- ビルド時に全ページを静的HTML生成
- 日付フォーマットはサーバーサイド（ビルド時）で処理
- ユーティリティ関数は純粋関数として実装（副作用なし）

### 日付処理方針

**Intl.DateTimeFormat使用**:
- ネイティブAPIで軽量
- 日本語ロケール（`ja-JP`）対応
- ポリフィル不要（モダンブラウザ対応）

**参照元**: `docs/tech-stack.md`, `docs/design/frontend-test-infra/test-patterns.md`

---

## 2. 開発ルール

### コーディング規約

#### TypeScript

- **strict mode必須**: `tsconfig.json`で`"strict": true`設定済み
- **型推論の活用**: 可能な限り明示的な型定義より型推論を使用
- **パスエイリアス**: `@utils/date` で参照可能

#### Biome（リント・フォーマット）

```json
{
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "always",
      "trailingCommas": "all"
    }
  }
}
```

**実行コマンド**:
- `pnpm lint`: リント・フォーマット実行
- `pnpm check`: TypeScript型チェック

### Git規約

**コミットメッセージ**: Conventional Commits準拠
```
feat: 日付フォーマットユーティリティを実装
test: formatDate()のテストケースを追加
fix: 無効な日付のエラーハンドリングを修正
```

**ブランチ命名**:
- `feat/機能名`: 機能追加
- `fix/修正内容`: バグ修正

### テスト要件

#### 単体テスト (Vitest)

**必須テストケース**（test-patterns.mdより）:

1. `formatDate()`:
   - 正常系: 日本語ロケールで正しくフォーマットされる
   - 異常系: 無効な日付でエラーをスローする
   - 境界値: 年末・年始、閏年

2. `formatRelativeDate()`:
   - 正常系: 「今日」を返す
   - 正常系: 「1日前」を返す
   - 正常系: 複数日前の表示
   - 境界値: 日付境界（23:59 → 0:00）

**テストファイル配置**:
```
src/
└── utils/
    ├── date.ts           # 実装ファイル
    └── date.test.ts      # テストファイル（同ディレクトリに配置）
```

**テスト実行コマンド**:
- `pnpm test`: テスト実行
- `pnpm test:watch`: ウォッチモードでテスト実行

**参照元**: `docs/design/frontend-test-infra/test-patterns.md`, `docs/implements/blog-article-management/TASK-0004/note.md`

---

## 3. 関連実装

### テストパターン（設計文書より）

**場所**: `docs/design/frontend-test-infra/test-patterns.md`

**日付フォーマット関数のテスト例**:
```typescript
import { describe, it, expect } from 'vitest';
import { formatDate, getRelativeTime } from '@/utils/date';

describe('formatDate', () => {
  it('should format date in Japanese locale', () => {
    const date = new Date('2025-01-15T10:30:00Z');
    expect(formatDate(date)).toBe('2025年1月15日');
  });

  it('should handle invalid date', () => {
    expect(() => formatDate(new Date('invalid'))).toThrow();
  });
});

describe('getRelativeTime', () => {
  it('should return "今日" for today', () => {
    const today = new Date();
    expect(getRelativeTime(today)).toBe('今日');
  });

  it('should return "1日前" for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(getRelativeTime(yesterday)).toBe('1日前');
  });
});
```

**対応する実装例**:
```typescript
// src/utils/date.ts
export function formatDate(date: Date): string {
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return '今日';
  if (diffInDays === 1) return '1日前';
  return `${diffInDays}日前`;
}
```

**参照元**: `docs/design/frontend-test-infra/test-patterns.md`

### Content Collectionsスキーマ（日付フィールド定義）

**場所**: `src/content.config.ts`

```typescript
const blogCollection = defineCollection({
  schema: z.object({
    // REQ-001: 必須フィールド
    pubDate: z.date(),

    // REQ-001: 任意フィールド
    updatedDate: z.date().optional(),
  }).transform((data) => ({
    ...data,
    // updatedDate が未指定の場合は pubDate をデフォルトに
    updatedDate: data.updatedDate ?? data.pubDate,
  })),
});
```

**注意点**:
- `pubDate`, `updatedDate` はZodで`z.date()`として定義
- Content Collections APIから取得時には`Date`オブジェクト
- ユーティリティ関数は`Date`オブジェクトを引数に取る

**参照元**: `src/content.config.ts`

### アーキテクチャ設計書

**場所**: `docs/design/blog-article-management/architecture.md`

**utilsディレクトリ構造**:
```
src/
└── utils/
    ├── r2.ts              # R2 URL生成ヘルパー
    ├── date.ts            # 日付フォーマット ← TASK-0006で実装
    ├── readingTime.ts     # 読了時間計算 (REQ-801)
    ├── toc.ts             # 目次生成 (REQ-901)
    ├── relatedArticles.ts # 関連記事検索 (REQ-701)
    └── search.ts          # 検索機能 (REQ-401, REQ-402)
```

**参照元**: `docs/design/blog-article-management/architecture.md`

### データフロー（日付表示）

**場所**: `docs/design/blog-article-management/dataflow.md`

**読了時間計算ロジック例**:
```typescript
// src/utils/readingTime.ts
export function calculateReadingTime(content: string): number {
  const charsPerMinute = 500; // 日本語: 500文字/分
  const charCount = content.length;
  const minutes = Math.ceil(charCount / charsPerMinute);
  return Math.max(1, minutes); // 最低1分
}
```

**日付フォーマットの使用場面**:
1. 記事一覧ページ: 公開日表示 (REQ-102)
2. 記事詳細ページ: 公開日・更新日表示 (REQ-112)
3. RSS Feed: pubDate要素 (REQ-601)
4. JSON-LD: datePublished, dateModified (NFR-104)

**参照元**: `docs/design/blog-article-management/dataflow.md`

---

## 4. 設計文書

### 関数仕様

#### formatDate()

**目的**: Dateオブジェクトを日本語形式の文字列に変換

**シグネチャ**:
```typescript
/**
 * 日付を日本語フォーマット（年月日）で表示する
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
export function formatDate(date: Date): string;
```

**実装方針**:
- `Intl.DateTimeFormat`を使用（軽量・ネイティブAPI）
- `ja-JP`ロケールで日本語表示
- 無効な日付は`Error`をスロー

#### formatRelativeDate() / getRelativeTime()

**目的**: 相対的な日付表示（今日、1日前など）

**シグネチャ**:
```typescript
/**
 * 日付を相対表示形式で返す
 *
 * @param date - 比較対象のDateオブジェクト
 * @returns 相対日付文字列（例: "今日", "1日前", "5日前"）
 *
 * @example
 * getRelativeTime(new Date()) // => '今日'
 *
 * @関連要件 REQ-001
 */
export function getRelativeTime(date: Date): string;
```

**実装方針**:
- 現在日時との差分を計算
- 日単位で表示（「今日」「1日前」「N日前」）
- 将来日付の場合の処理も考慮

### 要件定義（EARS記法）

**REQ-001より**:
> システムは、frontmatterで以下のメタデータを管理しなければならない
> - `pubDate`: 公開日時（必須、日付）
> - `updatedDate`: 更新日時（任意、日付）

**REQ-102より**:
> システムは、記事一覧で以下の情報を表示しなければならない
> - 公開日

**REQ-112より**:
> システムは、記事詳細ページで以下の情報を表示しなければならない
> - 公開日・更新日

**参照元**: `docs/spec/blog-article-management/requirements.md`

---

## 5. 注意事項

### 技術的制約

#### タイムゾーン処理

- Astro SSGはビルド時（サーバー環境）で実行
- クライアント環境とタイムゾーンが異なる可能性
- **対策**: UTC基準で処理し、表示時にJST（日本時間）へ変換
- Content CollectionsのDateはUTCとして扱う

```typescript
// タイムゾーンを考慮した実装例
export function formatDate(date: Date): string {
  // Intl.DateTimeFormatはデフォルトでローカルタイムゾーンを使用
  // 明示的にタイムゾーンを指定することも可能
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Tokyo', // 明示的にJSTを指定
  }).format(date);
}
```

#### 無効な日付の処理

```typescript
// 無効な日付チェック
if (isNaN(date.getTime())) {
  throw new Error('Invalid date');
}
```

**無効な日付パターン**:
- `new Date('invalid')` → `Invalid Date`
- `new Date(NaN)` → `Invalid Date`
- `null`, `undefined` → TypeScriptで型エラー

#### 日付境界の考慮

相対日付計算での注意点:
- 「今日」の判定は日単位（時刻は無視）
- タイムゾーンによる日付境界のずれ
- 閏年・月末処理

```typescript
// 日単位での差分計算
function getDayDiff(date: Date): number {
  const now = new Date();
  // 時刻を0:00にリセットして比較
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
}
```

### パフォーマンス要件

#### NFR-001: Lighthouse 90+点

- `Intl.DateTimeFormat`はネイティブAPIで高速
- 外部ライブラリ（date-fns, dayjs等）は使用しない
- ビルド時に実行されるため、ランタイムパフォーマンスへの影響なし

### テスト時の注意点

#### 現在日時のモック

相対日付テストでは現在日時をモックする必要あり:

```typescript
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('getRelativeTime', () => {
  beforeEach(() => {
    // 2025-01-15 12:00:00 JSTに固定
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T03:00:00.000Z')); // UTC
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return "今日" for today', () => {
    const today = new Date('2025-01-15T00:00:00.000Z');
    expect(getRelativeTime(today)).toBe('今日');
  });

  it('should return "1日前" for yesterday', () => {
    const yesterday = new Date('2025-01-14T00:00:00.000Z');
    expect(getRelativeTime(yesterday)).toBe('1日前');
  });
});
```

#### ロケール設定

テスト環境でのロケール設定確認:

```typescript
// vitest.setup.ts で設定可能
// または各テストで明示的に確認
```

**参照元**: `docs/design/frontend-test-infra/test-patterns.md`, `src/components/Header.test.ts`

---

## 6. 関連ファイル

### 既存実装ファイル

| ファイルパス | 説明 | 参考ポイント |
|------------|------|------------|
| `src/content.config.ts` | Content Collectionsスキーマ | 日付フィールド定義（`pubDate`, `updatedDate`） |
| `src/layouts/BaseLayout.astro` | 基本レイアウト | TypeScript型定義パターン |
| `src/components/Header.test.ts` | Headerテスト | Vitestテストパターン |
| `src/components/Footer.test.ts` | Footerテスト | Vitestテストパターン |

### 設計文書

| ファイルパス | 説明 |
|------------|------|
| `docs/tech-stack.md` | 技術スタック定義 |
| `docs/design/blog-article-management/architecture.md` | アーキテクチャ設計 |
| `docs/design/blog-article-management/dataflow.md` | データフロー設計 |
| `docs/design/frontend-test-infra/test-patterns.md` | テストパターン（日付フォーマット例含む） |
| `docs/spec/blog-article-management/requirements.md` | 要件定義書 |

### 設定ファイル

| ファイルパス | 説明 |
|------------|------|
| `package.json` | 依存関係・スクリプト定義 |
| `tsconfig.json` | TypeScript設定（strict mode） |
| `biome.json` | Biome（リント・フォーマット）設定 |
| `vitest.config.ts` | Vitest設定（存在する場合） |

---

## 7. 依存関係

### 前提タスク

- **TASK-0001**: Content Collections設定とスキーマ定義 - ✅ 完了
- **TASK-0002**: ディレクトリ構造とプロジェクト初期化 - ✅ 完了

### 後続タスク

- **TASK-0011**: 記事一覧ページ（トップページ）の実装
  - 公開日表示に`formatDate()`を使用
- **TASK-0014**: 記事詳細ページの実装
  - 公開日・更新日表示に`formatDate()`を使用
- **TASK-0020**: RSS Feed生成の実装
  - pubDate要素に日付フォーマットを使用

---

## 8. 実装チェックリスト

### src/utils/date.ts

- [ ] `formatDate()` 関数を実装
  - [ ] `Intl.DateTimeFormat`を使用
  - [ ] `ja-JP`ロケール設定
  - [ ] 無効な日付でエラーをスロー
  - [ ] JSDocコメントを記載
  - [ ] 要件トレーサビリティコメントを記載
- [ ] `getRelativeTime()` / `formatRelativeDate()` 関数を実装
  - [ ] 「今日」「1日前」「N日前」の表示
  - [ ] 日単位での差分計算
  - [ ] JSDocコメントを記載

### src/utils/date.test.ts

- [ ] `formatDate()` テストケース
  - [ ] 正常系: 日本語フォーマット確認
  - [ ] 異常系: 無効な日付でエラー
  - [ ] 境界値: 年末・年始、閏年
- [ ] `getRelativeTime()` テストケース
  - [ ] 正常系: 「今日」を返す
  - [ ] 正常系: 「1日前」を返す
  - [ ] 正常系: 「N日前」を返す
  - [ ] 時刻モックの設定

### 品質チェック

- [ ] `pnpm test` がすべて通る
- [ ] `pnpm check` が型エラーなく通る
- [ ] `pnpm lint` がエラーなく通る

---

## 9. 成功基準

### 機能要件

- [ ] `formatDate()`が正しく日本語フォーマットで日付を返す
- [ ] `getRelativeTime()`が正しく相対日付を返す
- [ ] 無効な日付で適切なエラーがスローされる

### 非機能要件

- [ ] TypeScript strict mode準拠
- [ ] Biome（リント・フォーマット）準拠
- [ ] 外部ライブラリ不使用（ネイティブAPI使用）
- [ ] 単体テストカバレッジ90%以上

### 品質基準

- [ ] `pnpm astro check` がエラーなく通る
- [ ] `pnpm test` がエラーなく通る
- [ ] `pnpm lint` がエラーなく通る
- [ ] コードに適切なJSDocコメントが記載されている
- [ ] 要件トレーサビリティ（関連要件がコメントに記載されている）

---

## 10. 信頼性レベルサマリー

このタスクノートの信頼性レベル分布:

- 🔵 **青信号**: 95% (test-patterns.md・設計文書から確実に導出)
- 🟡 **黄信号**: 5% (タイムゾーン処理の詳細など)
- 🔴 **赤信号**: 0%

**品質評価**: 高品質 - test-patterns.mdにサンプル実装とテストケースが記載されており、大部分の仕様が確定

---

**最終更新日**: 2026-01-01
**作成者**: Claude Opus 4.5 (TDD開発エージェント)
