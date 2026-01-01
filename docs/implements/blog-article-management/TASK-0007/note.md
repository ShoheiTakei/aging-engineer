# TASK-0007: 読了時間計算ユーティリティの実装 - タスクノート

**作成日**: 2026-01-01
**タスクタイプ**: TDD
**見積もり工数**: 6時間
**優先度**: P0 (最優先)

---

## 概要

TASK-0007「読了時間計算ユーティリティの実装」の開発に必要なコンテキスト情報を整理したタスクノートです。

**タスク概要**:
- `calculateReadingTime()` 関数の実装（500文字/分）
- `src/utils/readingTime.ts` にユーティリティを配置
- 単体テストの実装（TDD Red-Green-Refactor）
- 記事一覧・詳細ページでの読了時間表示に使用

**関連要件**: REQ-801 (読了時間表示)
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
- 読了時間計算はサーバーサイド（ビルド時）で処理
- ユーティリティ関数は純粋関数として実装（副作用なし）

### 読了時間計算方針

**日本語基準の読了速度**:
- 500文字/分で計算（日本語の平均読書速度）
- 分単位で表示（例: "約3分で読めます"）
- 1分未満の場合は「1分未満」と表示

**参照元**: `docs/tech-stack.md`, `docs/spec/blog-article-management/requirements.md`

---

## 2. 開発ルール

### コーディング規約

#### TypeScript

- **strict mode必須**: `tsconfig.json`で`"strict": true`設定済み
- **型推論の活用**: 可能な限り明示的な型定義より型推論を使用
- **パスエイリアス**: `@utils/readingTime` で参照可能

#### パスエイリアス（tsconfig.json）

```json
{
  "paths": {
    "@/*": ["src/*"],
    "@components/*": ["src/components/*"],
    "@layouts/*": ["src/layouts/*"],
    "@utils/*": ["src/utils/*"]
  }
}
```

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
feat: 読了時間計算ユーティリティを実装
test: calculateReadingTime()のテストケースを追加
fix: 1分未満の記事のエラーハンドリングを修正
```

**ブランチ命名**:
- `feat/機能名`: 機能追加
- `fix/修正内容`: バグ修正

### テスト要件

#### 単体テスト (Vitest)

**必須テストケース**（test-patterns.md・acceptance-criteria.mdより）:

1. `calculateReadingTime()`:
   - 正常系: 標準的な長さの記事（1500文字 → 約3分）
   - 正常系: 非常に長い記事（5000文字 → 約10分）
   - 境界値: 1分未満の記事（200文字 → 1分未満）
   - 境界値: ちょうど500文字（1分）
   - 異常系: 空文字列の処理
   - 異常系: null/undefinedの処理（TypeScriptで型エラー）

**テストファイル配置**:
```
src/
└── utils/
    ├── readingTime.ts           # 実装ファイル
    └── readingTime.test.ts      # テストファイル（同ディレクトリに配置）
```

**テスト実行コマンド**:
- `pnpm test`: テスト実行
- `pnpm test:watch`: ウォッチモードでテスト実行

**参照元**: `docs/design/frontend-test-infra/test-patterns.md`, `vitest.config.ts`

---

## 3. 関連実装

### 既存のユーティリティパターン（date.ts）

**場所**: `src/utils/date.ts`

既存の日付ユーティリティから参考となるパターン:

```typescript
// ========================================
// 定数定義
// ========================================

/**
 * 【設定定数】: 日本語ロケール設定 🔵
 * 【用途】: Intl.DateTimeFormatで使用するロケール識別子
 * 【調整可能性】: 多言語対応時に設定オブジェクトへ移行可能
 */
const LOCALE_JA_JP = 'ja-JP';

// ========================================
// ヘルパー関数
// ========================================

/**
 * 【ヘルパー関数】: 日付の有効性チェック
 * 【再利用性】: 日付を扱う他の関数でも使用可能
 * 【単一責任】: Dateオブジェクトの有効性判定を担当
 * 🔵 信頼性レベル: 既存実装からの抽出
 */
function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

// ========================================
// 公開関数
// ========================================

/**
 * 【機能概要】: 日付を日本語フォーマット（年月日）で表示する
 * 【設計方針】: ネイティブAPIで軽量、外部ライブラリ不使用（NFR-001対応）
 * 【テスト対応】: TC-D-001〜TC-D-204（正常系・異常系・境界値）
 * 🔵 信頼性レベル: test-patterns.mdのサンプル実装に基づく
 */
export function formatDate(date: Date): string {
  // 【入力値検証】: 無効な日付を検出してエラーをスロー 🔵
  if (!isValidDate(date)) {
    throw new Error('Invalid date');
  }
  // ... 実装
}
```

**適用すべきパターン**:
- 定数の抽出によるDRY原則
- ヘルパー関数の分離による可読性向上
- JSDocコメントの充実
- 要件トレーサビリティコメントの記載
- 信頼性レベル（🔵/🟡/🔴）の明示

**参照元**: `src/utils/date.ts`

### データフロー設計書の読了時間計算例

**場所**: `docs/design/blog-article-management/dataflow.md`

```typescript
// src/utils/readingTime.ts
export function calculateReadingTime(content: string): number {
  const charsPerMinute = 500; // 日本語: 500文字/分
  const charCount = content.length;
  const minutes = Math.ceil(charCount / charsPerMinute);
  return Math.max(1, minutes); // 最低1分
}
```

**参照元**: `docs/design/blog-article-management/dataflow.md`

### アーキテクチャ設計書

**場所**: `docs/design/blog-article-management/architecture.md`

**utilsディレクトリ構造**:
```
src/
└── utils/
    ├── r2.ts              # R2 URL生成ヘルパー
    ├── date.ts            # 日付フォーマット ← TASK-0006で実装済み
    ├── readingTime.ts     # 読了時間計算 ← TASK-0007で実装
    ├── toc.ts             # 目次生成 (REQ-901)
    ├── relatedArticles.ts # 関連記事検索 (REQ-701)
    └── search.ts          # 検索機能 (REQ-401, REQ-402)
```

**読了時間の実装方針**:
- **計算方法**: 文字数 ÷ 500文字/分
- **実装**: `src/utils/readingTime.ts`
- **表示**: 記事ヘッダー部分

**参照元**: `docs/design/blog-article-management/architecture.md`

---

## 4. 設計文書

### 関数仕様

#### calculateReadingTime()

**目的**: 記事本文から読了時間（分）を計算

**シグネチャ**:
```typescript
/**
 * 記事の読了時間を計算する
 *
 * 【計算方法】: 日本語500文字/分で計算
 * 【設計方針】: 純粋関数として実装（副作用なし）
 * 【パフォーマンス】: ネイティブAPIのみ使用（NFR-001対応）
 *
 * @param content - 記事本文（Markdown形式またはプレーンテキスト）
 * @returns 読了時間（分）
 *
 * @example
 * calculateReadingTime('これは1500文字の記事です...') // => 3
 *
 * @関連要件 REQ-801, EDGE-103
 */
export function calculateReadingTime(content: string): number;
```

**実装方針**:
- 文字数をカウント（`content.length`）
- 500文字/分で割る
- `Math.ceil()`で切り上げ
- 最低1分を保証（`Math.max(1, minutes)`）
- 1分未満の場合の特殊表示は呼び出し側で対応

#### formatReadingTime()

**目的**: 読了時間を日本語表示用文字列に変換

**シグネチャ**:
```typescript
/**
 * 読了時間を日本語表示形式で返す
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
export function formatReadingTime(minutes: number): string;
```

### 要件定義（EARS記法）

**REQ-801より**:
> システムは、記事の読了時間を自動計算して表示しなければならない 🔵
> - 日本語: 500文字/分で計算
> - 分単位で表示（例: "約3分で読めます"）

**EDGE-103より**:
> 読了時間が1分未満の記事は、「1分未満」と表示しなければならない 🟡

**参照元**: `docs/spec/blog-article-management/requirements.md`

### 受け入れ基準（acceptance-criteria.md）

**REQ-801テストケース**:

#### 正常系

- **TC-801-01**: 標準的な長さの記事（1500文字） 🔵
  - **入力**: 1500文字の記事
  - **期待結果**: "約3分で読めます"と表示

#### 境界値

- **TC-801-B01**: 1分未満の記事（200文字） 🟡
  - **入力**: 200文字の記事
  - **期待結果**: "1分未満で読めます"と表示

- **TC-801-B02**: 非常に長い記事（5000文字） 🔵
  - **入力**: 5000文字の記事
  - **期待結果**: "約10分で読めます"と表示

**参照元**: `docs/spec/blog-article-management/acceptance-criteria.md`

---

## 5. 注意事項

### 技術的制約

#### 文字数カウント方式

- `content.length`はUTF-16コード単位でカウント
- 日本語文字は1文字=1カウント（正しい動作）
- 絵文字など一部のUnicode文字は2カウントになる可能性
- **対策**: 現段階では`content.length`で十分（絵文字使用頻度は低い）

```typescript
// 文字数カウントの注意点
'あいうえお'.length // => 5（正しい）
'😀'.length // => 2（サロゲートペア）

// 厳密なカウントが必要な場合（将来拡張）
[...'😀'].length // => 1（スプレッド演算子でコードポイント単位）
```

#### Markdown記法の扱い

- 本文には見出し記号（`#`）、リンク記法（`[text](url)`）等が含まれる
- 現段階では記法込みでカウント（十分な精度）
- **将来拡張**: Markdown記法を除外したプレーンテキストでカウント

```typescript
// 現在のアプローチ（シンプル）
calculateReadingTime(content) // Markdown記法込みでカウント

// 将来の拡張案（必要に応じて）
function stripMarkdown(content: string): string {
  return content
    .replace(/#+\s/g, '') // 見出し記号
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // リンク
    .replace(/[*_`~]/g, ''); // 装飾記号
}
```

#### 空文字列・短い記事の処理

```typescript
// 空文字列の場合
calculateReadingTime('') // => 0分 or 最低1分を返すか検討

// 推奨: 最低1分を返す（ユーザー体験の観点から）
const minutes = Math.ceil(charCount / charsPerMinute);
return Math.max(1, minutes); // 最低1分を保証
```

### パフォーマンス要件

#### NFR-001: Lighthouse 90+点

- `content.length`はO(1)で高速
- 外部ライブラリ不使用
- ビルド時に実行されるため、ランタイムパフォーマンスへの影響なし

### テスト時の注意点

#### テストデータの準備

```typescript
// テスト用の文字列生成ヘルパー
function generateText(length: number): string {
  const char = 'あ';
  return char.repeat(length);
}

// テストケースでの使用
it('1500文字で約3分', () => {
  const content = generateText(1500);
  expect(calculateReadingTime(content)).toBe(3);
});
```

#### 境界値テスト

```typescript
describe('境界値テスト', () => {
  it('499文字は1分', () => {
    expect(calculateReadingTime(generateText(499))).toBe(1);
  });

  it('500文字は1分', () => {
    expect(calculateReadingTime(generateText(500))).toBe(1);
  });

  it('501文字は2分', () => {
    expect(calculateReadingTime(generateText(501))).toBe(2);
  });
});
```

**参照元**: `docs/design/frontend-test-infra/test-patterns.md`

---

## 6. 関連ファイル

### 既存実装ファイル

| ファイルパス | 説明 | 参考ポイント |
|------------|------|------------|
| `src/utils/date.ts` | 日付フォーマットユーティリティ | 実装パターン、コメント形式 |
| `src/utils/date.test.ts` | 日付ユーティリティテスト | テストパターン、describe構造 |
| `src/content.config.ts` | Content Collectionsスキーマ | 記事本文の取得方法 |

### 設計文書

| ファイルパス | 説明 |
|------------|------|
| `docs/tech-stack.md` | 技術スタック定義 |
| `docs/design/blog-article-management/architecture.md` | アーキテクチャ設計 |
| `docs/design/blog-article-management/dataflow.md` | データフロー設計 |
| `docs/design/frontend-test-infra/test-patterns.md` | テストパターン |
| `docs/spec/blog-article-management/requirements.md` | 要件定義書 |
| `docs/spec/blog-article-management/acceptance-criteria.md` | 受け入れ基準 |

### 設定ファイル

| ファイルパス | 説明 |
|------------|------|
| `package.json` | 依存関係・スクリプト定義 |
| `tsconfig.json` | TypeScript設定（strict mode、パスエイリアス） |
| `biome.json` | Biome（リント・フォーマット）設定 |
| `vitest.config.ts` | Vitest設定（テスト環境、カバレッジ） |

---

## 7. 依存関係

### 前提タスク

- **TASK-0001**: Content Collections設定とスキーマ定義 - 完了
- **TASK-0002**: ディレクトリ構造とプロジェクト初期化 - 完了
- **TASK-0006**: 日付フォーマットユーティリティの実装 - 完了（参考実装）

### 後続タスク

- **TASK-0014**: 記事詳細ページの実装
  - 読了時間表示に`calculateReadingTime()`を使用
- **TASK-0015**: 読了時間・目次表示コンポーネントの実装
  - ReadingTimeコンポーネントで`formatReadingTime()`を使用
- **TASK-0011**: 記事一覧ページ（トップページ）の実装
  - ブログカードで読了時間を表示

---

## 8. 実装チェックリスト

### src/utils/readingTime.ts

- [ ] `calculateReadingTime()` 関数を実装
  - [ ] 文字数から読了時間を計算（500文字/分）
  - [ ] `Math.ceil()`で切り上げ
  - [ ] 最低1分を保証
  - [ ] JSDocコメントを記載
  - [ ] 要件トレーサビリティコメントを記載
  - [ ] 定数の抽出（CHARS_PER_MINUTE）
- [ ] `formatReadingTime()` 関数を実装
  - [ ] 分数から日本語表示文字列を生成
  - [ ] 1分未満の場合の特殊表示対応
  - [ ] JSDocコメントを記載

### src/utils/readingTime.test.ts

- [ ] `calculateReadingTime()` テストケース
  - [ ] 正常系: 標準的な記事長（1500文字 → 3分）
  - [ ] 正常系: 長い記事（5000文字 → 10分）
  - [ ] 境界値: 499文字 → 1分
  - [ ] 境界値: 500文字 → 1分
  - [ ] 境界値: 501文字 → 2分
  - [ ] 異常系: 空文字列 → 最低1分または0分
- [ ] `formatReadingTime()` テストケース
  - [ ] 正常系: 3分 → "約3分で読めます"
  - [ ] 境界値: 0分 → "1分未満で読めます"
  - [ ] 正常系: 10分 → "約10分で読めます"

### 品質チェック

- [ ] `pnpm test` がすべて通る
- [ ] `pnpm check` が型エラーなく通る
- [ ] `pnpm lint` がエラーなく通る

---

## 9. 成功基準

### 機能要件

- [ ] `calculateReadingTime()`が正しく読了時間（分）を返す
- [ ] `formatReadingTime()`が正しく日本語表示文字列を返す
- [ ] 1分未満の記事で「1分未満で読めます」と表示できる

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

- 🔵 **青信号**: 90% (requirements.md・architecture.md・acceptance-criteria.mdから確実に導出)
- 🟡 **黄信号**: 10% (Markdown記法の扱い、絵文字カウントなど)
- 🔴 **赤信号**: 0%

**品質評価**: 高品質 - 要件定義書とアーキテクチャ設計書に仕様が明記されており、大部分の仕様が確定

---

**最終更新日**: 2026-01-01
**作成者**: Claude Opus 4.5 (TDD開発エージェント)
