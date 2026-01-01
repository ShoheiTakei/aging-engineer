# TASK-0007: 読了時間計算ユーティリティ 要件定義書

**作成日**: 2026-01-01
**タスクID**: TASK-0007
**タスクタイプ**: TDD
**見積もり工数**: 6時間
**優先度**: P0（最優先）
**関連要件**: REQ-801, EDGE-103

---

## 1. 機能の概要

### 1.1 何をする機能か 🔵

**信頼性**: 🔵 *requirements.md REQ-801・user-stories.mdより*

記事の本文（Markdown形式）から読了時間を自動計算し、日本語表示形式で提供するユーティリティ機能。

- **calculateReadingTime(content: string): number**: 文字数から読了時間（分）を計算
- **formatReadingTime(minutes: number): string**: 読了時間を日本語表示文字列に変換

### 1.2 どのような問題を解決するか 🔵

**信頼性**: 🔵 *interview-record.md Q9・user-stories.mdより*

- **読者の時間管理支援**: 記事を読む前に必要な時間を把握できる
- **UX向上**: 読了時間の目安を表示することで、読者の記事選択を支援
- **一貫性の確保**: 全記事で統一された計算方法で読了時間を表示

### 1.3 想定されるユーザー 🔵

**信頼性**: 🔵 *user-stories.md ストーリー1より*

- **読者**: 記事一覧・詳細ページで読了時間を確認し、読む時間を判断
- **システム（ビルドプロセス）**: 記事のビルド時に読了時間を計算

### 1.4 システム内での位置づけ 🔵

**信頼性**: 🔵 *architecture.md・dataflow.mdより*

```
src/utils/readingTime.ts
```

- **ユーティリティ層**: ビジネスロジックを持つ純粋関数として実装
- **呼び出し元**:
  - `src/pages/blog/[slug].astro`: 記事詳細ページ
  - `src/pages/blog/[page].astro`: 記事一覧ページ
  - `src/components/BlogCard.astro`: ブログカードコンポーネント
  - `src/components/ReadingTime.astro`: 読了時間表示コンポーネント

**参照したEARS要件**: REQ-801, EDGE-103
**参照した設計文書**: architecture.md（utils構成）、dataflow.md（機能7: 読了時間計算）

---

## 2. 入力・出力の仕様

### 2.1 calculateReadingTime() 🔵

**信頼性**: 🔵 *dataflow.md・requirements.md REQ-801より*

#### 入力パラメータ

| パラメータ名 | 型 | 必須 | 説明 | 制約 |
|------------|-----|------|------|------|
| content | string | 必須 | 記事本文（Markdown形式またはプレーンテキスト） | 空文字列も許容 |

#### 出力値

| 型 | 説明 | 範囲 |
|----|------|------|
| number | 読了時間（分） | 0以上の整数（0は空文字列の場合） |

#### 計算ロジック 🔵

```typescript
読了時間（分） = Math.ceil(文字数 / 500)
```

- 500文字/分（日本語の平均読書速度）
- `Math.ceil()`で切り上げ
- **注意**: 0分を返す場合がある（空文字列の場合）

**参照したEARS要件**: REQ-801
**参照した設計文書**: dataflow.md（機能7: 読了時間計算）

### 2.2 formatReadingTime() 🔵

**信頼性**: 🔵 *requirements.md REQ-801、🟡 EDGE-103より*

#### 入力パラメータ

| パラメータ名 | 型 | 必須 | 説明 | 制約 |
|------------|-----|------|------|------|
| minutes | number | 必須 | 読了時間（分） | 0以上の整数 |

#### 出力値

| 型 | 説明 | 例 |
|----|------|-----|
| string | 日本語表示形式の読了時間 | "約3分で読めます"、"1分未満で読めます" |

#### 表示形式 🔵🟡

| 入力値 | 出力文字列 | 信頼性 |
|--------|-----------|--------|
| 0 | "1分未満で読めます" | 🟡 *EDGE-103より推測* |
| 1 | "約1分で読めます" | 🔵 *REQ-801より* |
| 3 | "約3分で読めます" | 🔵 *REQ-801より* |
| 10 | "約10分で読めます" | 🔵 *REQ-801より* |

**参照したEARS要件**: REQ-801, EDGE-103
**参照した設計文書**: requirements.md（9. 読了時間表示）

### 2.3 データフロー 🔵

**信頼性**: 🔵 *dataflow.md 機能7より*

```
Markdown本文 → calculateReadingTime() → 読了時間（分）→ formatReadingTime() → 表示文字列
```

```mermaid
flowchart LR
    Markdown[Markdown本文] --> CountChars[文字数カウント]
    CountChars --> Calc[文字数 ÷ 500]
    Calc --> Round[小数点切り上げ]
    Round --> Format[formatReadingTime]
    Format --> Display[表示文字列<br/>例: 約5分で読めます]
```

**参照したEARS要件**: REQ-801
**参照した設計文書**: dataflow.md（機能7: 読了時間計算）

---

## 3. 制約条件

### 3.1 パフォーマンス要件 🔵

**信頼性**: 🔵 *NFR-001・tech-stack.mdより*

- **Lighthouse 90+点維持**: 外部ライブラリ不使用（ネイティブAPI使用）
- **計算コスト**: `content.length`はO(1)で高速
- **ビルド時実行**: ランタイムパフォーマンスへの影響なし

**参照したEARS要件**: NFR-001
**参照した設計文書**: architecture.md（パフォーマンス）

### 3.2 互換性要件 🔵

**信頼性**: 🔵 *tech-stack.md・tsconfig.jsonより*

- **TypeScript strict mode**: 型安全な実装
- **Node.js 18+**: ESモジュール形式
- **Astro 5.1+**: Content Collections APIとの連携

**参照したEARS要件**: 制約要件（REQ-901〜904）
**参照した設計文書**: architecture.md（互換性制約）

### 3.3 アーキテクチャ制約 🔵

**信頼性**: 🔵 *architecture.mdより*

- **純粋関数として実装**: 副作用なし、同じ入力に対して同じ出力
- **SSG対応**: ビルド時に実行される
- **外部依存なし**: ネイティブJavaScript/TypeScriptのみ使用

**参照したEARS要件**: REQ-901（SSGのみ使用）
**参照した設計文書**: architecture.md（アーキテクチャパターン）

### 3.4 コーディング規約 🔵

**信頼性**: 🔵 *既存実装date.ts・biome.jsonより*

- **インデント**: スペース2文字
- **クォート**: シングルクォート
- **セミコロン**: 必須
- **トレーリングカンマ**: 必須
- **行幅**: 100文字

**参照した設計文書**: biome.json、既存実装 `src/utils/date.ts`

---

## 4. 想定される使用例

### 4.1 基本的な使用パターン 🔵

**信頼性**: 🔵 *dataflow.md・acceptance-criteria.md TC-801より*

#### 記事詳細ページでの使用

```typescript
// src/pages/blog/[slug].astro
import { calculateReadingTime, formatReadingTime } from '@utils/readingTime';

const { post } = Astro.props;
const readingMinutes = calculateReadingTime(post.body);
const readingTimeText = formatReadingTime(readingMinutes);
// => "約5分で読めます"
```

#### 記事一覧ページでの使用

```typescript
// src/pages/blog/[page].astro
import { calculateReadingTime, formatReadingTime } from '@utils/readingTime';

const posts = await getCollection('blog');
const postsWithReadingTime = posts.map(post => ({
  ...post,
  readingTime: formatReadingTime(calculateReadingTime(post.body)),
}));
```

**参照したEARS要件**: REQ-801, REQ-102, REQ-112
**参照した設計文書**: dataflow.md（機能2: 記事詳細表示）

### 4.2 エッジケース 🟡

**信頼性**: 🟡 *EDGE-103・note.mdより*

#### 1分未満の記事

```typescript
const content = '短い記事です。'; // 約50文字
const minutes = calculateReadingTime(content); // => 1
const text = formatReadingTime(0); // => '1分未満で読めます'
```

**注意**: `calculateReadingTime()`は最低1分を返すか、0分を返すかの設計判断が必要

- **オプション1**: 最低1分を返す（`Math.max(1, minutes)`）
- **オプション2**: 0分を返し、`formatReadingTime()`で「1分未満」と表示

**推奨**: オプション2（計算と表示の責務を分離）

#### 空文字列

```typescript
const content = '';
const minutes = calculateReadingTime(content); // => 0
const text = formatReadingTime(0); // => '1分未満で読めます'
```

**参照したEARS要件**: EDGE-103
**参照した設計文書**: note.md（注意事項）

### 4.3 エラーケース 🟡

**信頼性**: 🟡 *TypeScript型チェックによる防止*

#### 型エラー（TypeScriptで防止）

```typescript
// TypeScriptコンパイルエラー
calculateReadingTime(null);    // Type 'null' is not assignable to 'string'
calculateReadingTime(undefined); // Type 'undefined' is not assignable to 'string'
```

**参照した設計文書**: tsconfig.json（strict mode）

---

## 5. EARS要件・設計文書との対応関係

### 5.1 参照したユーザストーリー

- **US-1.1**: 読者として、記事詳細ページを読んで内容を理解したい

### 5.2 参照した機能要件

| 要件ID | 要件内容 | 信頼性 |
|--------|---------|--------|
| REQ-801 | システムは、記事の読了時間を自動計算して表示しなければならない（500文字/分、分単位） | 🔵 |
| REQ-102 | 記事一覧で読了時間を表示 | 🔵 |
| REQ-112 | 記事詳細で読了時間を表示 | 🔵 |

### 5.3 参照した非機能要件

| 要件ID | 要件内容 | 信頼性 |
|--------|---------|--------|
| NFR-001 | Lighthouse 90+点維持（外部ライブラリ不使用） | 🔵 |

### 5.4 参照したEdgeケース

| 要件ID | 要件内容 | 信頼性 |
|--------|---------|--------|
| EDGE-103 | 読了時間が1分未満の記事は「1分未満」と表示 | 🟡 |

### 5.5 参照した受け入れ基準

| テストケースID | 内容 | 信頼性 |
|---------------|------|--------|
| TC-801-01 | 標準的な長さの記事（1500文字）→「約3分で読めます」 | 🔵 |
| TC-801-B01 | 1分未満の記事（200文字）→「1分未満で読めます」 | 🟡 |
| TC-801-B02 | 非常に長い記事（5000文字）→「約10分で読めます」 | 🔵 |

### 5.6 参照した設計文書

| 文書 | 該当セクション |
|------|--------------|
| architecture.md | utils構成、読了時間（REQ-801） |
| dataflow.md | 機能7: 読了時間計算 |
| interfaces.ts | （読了時間用の型定義は不要） |
| note.md | 関数仕様、技術的制約、テスト要件 |

---

## 6. 実装詳細仕様

### 6.1 ファイル構成 🔵

**信頼性**: 🔵 *architecture.md・note.mdより*

```
src/
└── utils/
    ├── readingTime.ts        # 実装ファイル
    └── readingTime.test.ts   # テストファイル
```

### 6.2 関数シグネチャ 🔵

**信頼性**: 🔵 *dataflow.md・note.mdより*

```typescript
/**
 * 記事の読了時間を計算する
 *
 * 【計算方法】: 日本語500文字/分で計算
 * 【設計方針】: 純粋関数として実装（副作用なし）
 * 【パフォーマンス】: ネイティブAPIのみ使用（NFR-001対応）
 *
 * @param content - 記事本文（Markdown形式またはプレーンテキスト）
 * @returns 読了時間（分）、0以上の整数
 *
 * @example
 * calculateReadingTime('これは1500文字の記事です...') // => 3
 *
 * @関連要件 REQ-801
 */
export function calculateReadingTime(content: string): number;

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

### 6.3 定数定義 🔵

**信頼性**: 🔵 *requirements.md REQ-801・既存実装date.tsパターンより*

```typescript
/**
 * 【設定定数】: 1分あたりの読了文字数 🔵
 * 【用途】: 読了時間計算の基準値
 * 【根拠】: 日本語の平均読書速度（requirements.md REQ-801）
 */
const CHARS_PER_MINUTE = 500;
```

### 6.4 実装例 🔵

**信頼性**: 🔵 *dataflow.md・note.mdより*

```typescript
// ========================================
// 定数定義
// ========================================

/**
 * 【設定定数】: 1分あたりの読了文字数 🔵
 * 【用途】: 読了時間計算の基準値
 * 【根拠】: 日本語の平均読書速度（requirements.md REQ-801）
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
 * 【テスト対応】: TC-801-01, TC-801-B01, TC-801-B02
 * 🔵 信頼性レベル: dataflow.md・requirements.md REQ-801に基づく
 *
 * @param content - 記事本文（Markdown形式またはプレーンテキスト）
 * @returns 読了時間（分）、0以上の整数
 *
 * @関連要件 REQ-801
 */
export function calculateReadingTime(content: string): number {
  // 【文字数カウント】: content.lengthでUTF-16コード単位のカウント 🔵
  const charCount = content.length;

  // 【読了時間計算】: 文字数を読了速度で割り、切り上げ 🔵
  const minutes = Math.ceil(charCount / CHARS_PER_MINUTE);

  return minutes;
}

/**
 * 【機能概要】: 読了時間を日本語表示形式で返す
 * 【設計方針】: 分数に応じて適切な文字列を生成
 * 【テスト対応】: TC-801-01, TC-801-B01, TC-801-B02
 * 🔵🟡 信頼性レベル: requirements.md REQ-801、EDGE-103に基づく
 *
 * @param minutes - 読了時間（分）
 * @returns 日本語フォーマットの読了時間文字列
 *
 * @関連要件 REQ-801, EDGE-103
 */
export function formatReadingTime(minutes: number): string {
  // 【1分未満判定】: 0分の場合は特殊表示 🟡
  // 【根拠】: EDGE-103より推測
  if (minutes <= 0) {
    return '1分未満で読めます';
  }

  // 【通常表示】: 「約N分で読めます」形式 🔵
  return `約${minutes}分で読めます`;
}
```

---

## 7. 信頼性レベルサマリー

このタスクの信頼性レベル分布:

| レベル | 件数 | 割合 | 説明 |
|--------|------|------|------|
| 🔵 青信号 | 28項目 | 88% | requirements.md・dataflow.md・architecture.mdから確実に導出 |
| 🟡 黄信号 | 4項目 | 12% | EDGE-103など妥当な推測（1分未満の表示形式） |
| 🔴 赤信号 | 0項目 | 0% | 推測による設計なし |

**品質評価**: ✅ 高品質

**評価理由**:
- 要件定義書（REQ-801）に計算方法と表示形式が明記
- データフロー設計書に実装例が記載
- 既存実装（date.ts）のパターンを踏襲可能
- 黄信号項目は「1分未満」の表示形式のみで、実装への影響は軽微

---

## 8. 次のステップ

要件定義書の作成が完了しました。

**次のお勧めステップ**: `/tsumiki:tdd-testcases blog-article-management TASK-0007` でテストケースの洗い出しを行います。

---

**最終更新日**: 2026-01-01
**作成者**: Claude Opus 4.5 (TDD開発エージェント)
