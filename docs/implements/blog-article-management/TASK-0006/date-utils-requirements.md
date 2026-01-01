# TASK-0006: 日付フォーマットユーティリティ - TDD要件定義書

**作成日**: 2026-01-01
**タスクID**: TASK-0006
**機能名**: 日付フォーマットユーティリティの実装
**関連要件**: REQ-001, REQ-102, REQ-112
**出力先**: `src/utils/date.ts`

---

## 1. 機能の概要

### 1.1 何をする機能か 🔵

**信頼性**: 🔵 *test-patterns.md・requirements.mdより*

日付データを表示用にフォーマットするユーティリティ関数群を提供します。

- **`formatDate(date: Date): string`**: Dateオブジェクトを日本語フォーマット（例: "2025年1月15日"）の文字列に変換
- **`getRelativeTime(date: Date): string`**: 現在日時からの相対日付表示（例: "今日"、"1日前"、"5日前"）を返す

### 1.2 どのような問題を解決するか 🔵

**信頼性**: 🔵 *requirements.md REQ-001, REQ-102, REQ-112より*

- **REQ-001**: frontmatterの `pubDate`（公開日時）と `updatedDate`（更新日時）を人間が読みやすい形式で表示
- **REQ-102**: 記事一覧ページで公開日を表示
- **REQ-112**: 記事詳細ページで公開日・更新日を表示

Content CollectionsのスキーマではDateオブジェクトとして格納されているため、表示用に適切なフォーマット変換が必要です。

### 1.3 想定されるユーザー 🔵

**信頼性**: 🔵 *user-stories.mdより*

- **直接ユーザー**: 開発者（Astroコンポーネント内で使用）
- **間接ユーザー**: ブログ読者（フォーマット済みの日付を閲覧）

### 1.4 システム内での位置づけ 🔵

**信頼性**: 🔵 *architecture.mdより*

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

純粋関数として実装され、副作用なし。他のユーティリティ関数やAstroコンポーネントから呼び出される。

### 1.5 参照したEARS要件・設計文書

- **参照したEARS要件**: REQ-001, REQ-102, REQ-112
- **参照した設計文書**:
  - `docs/design/blog-article-management/architecture.md` (ディレクトリ構造)
  - `docs/design/frontend-test-infra/test-patterns.md` (サンプル実装・テストパターン)

---

## 2. 入力・出力の仕様

### 2.1 formatDate() 関数 🔵

**信頼性**: 🔵 *test-patterns.mdのサンプル実装より*

#### 入力パラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `date` | `Date` | 必須 | フォーマット対象のDateオブジェクト |

**入力制約**:
- 有効なDateオブジェクトであること
- `isNaN(date.getTime())` が `false` であること

#### 出力値

| 型 | 形式 | 例 |
|-----|------|-----|
| `string` | `{年}年{月}月{日}日` | `"2025年1月15日"` |

**出力形式**:
- 日本語ロケール（`ja-JP`）
- 年: 4桁数字 + "年"
- 月: 漢字表記（例: "1月"、"12月"）
- 日: 数字 + "日"

#### 入出力の関係性

```typescript
// 正常系
formatDate(new Date('2025-01-15T10:30:00Z')) // => '2025年1月15日'
formatDate(new Date('2025-12-31'))           // => '2025年12月31日'

// 異常系
formatDate(new Date('invalid'))              // => Error: Invalid date
```

### 2.2 getRelativeTime() 関数 🔵

**信頼性**: 🔵 *test-patterns.mdのサンプル実装より*

#### 入力パラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| `date` | `Date` | 必須 | 比較対象のDateオブジェクト |

**入力制約**:
- 有効なDateオブジェクトであること

#### 出力値

| 型 | 形式 | 例 |
|-----|------|-----|
| `string` | 相対日付表現 | `"今日"`, `"1日前"`, `"5日前"` |

**出力パターン**:
| 条件 | 出力 |
|------|------|
| 当日 | `"今日"` |
| 1日前 | `"1日前"` |
| N日前（N >= 2） | `"{N}日前"` |

#### 入出力の関係性

```typescript
// 現在日時が2025-01-15 12:00:00の場合
getRelativeTime(new Date('2025-01-15'))      // => '今日'
getRelativeTime(new Date('2025-01-14'))      // => '1日前'
getRelativeTime(new Date('2025-01-10'))      // => '5日前'
```

### 2.3 データフロー 🔵

**信頼性**: 🔵 *dataflow.md・test-patterns.mdより*

```
[Content Collections]
       ↓
   pubDate: Date
   updatedDate: Date
       ↓
[formatDate() / getRelativeTime()]
       ↓
[Astroコンポーネント]
   - BlogCard.astro (記事一覧)
   - BlogPostLayout.astro (記事詳細)
       ↓
[HTML出力]
   - "2025年1月15日"
   - "今日"
```

### 2.4 参照したEARS要件・設計文書

- **参照したEARS要件**: REQ-001, REQ-102, REQ-112
- **参照した設計文書**:
  - `docs/design/frontend-test-infra/test-patterns.md` (サンプル実装)
  - `docs/design/blog-article-management/dataflow.md` (データフロー)
  - `src/content.config.ts` (Content Collectionsスキーマ)

---

## 3. 制約条件

### 3.1 パフォーマンス要件 🔵

**信頼性**: 🔵 *NFR-001、note.mdより*

- **Lighthouse 90+点維持**: ネイティブAPI（`Intl.DateTimeFormat`）を使用し、外部ライブラリ不使用
- **ビルド時実行**: SSGモードのため、ランタイムパフォーマンスへの影響なし
- **純粋関数**: 副作用なし、キャッシュ可能

### 3.2 互換性要件 🔵

**信頼性**: 🔵 *tech-stack.md・architecture.mdより*

- **TypeScript strict mode準拠**: `tsconfig.json`で`"strict": true`設定済み
- **Biome準拠**: リント・フォーマット規約に従う
- **Node.js 18+**: `Intl.DateTimeFormat`完全サポート
- **モダンブラウザ**: ES2020+対応（ポリフィル不要）

### 3.3 アーキテクチャ制約 🔵

**信頼性**: 🔵 *architecture.md・note.mdより*

- **静的サイト生成（SSG）のみ**: REQ-901に基づき、SSRは使用しない
- **Islands Architecture**: ビルド時に全ページを静的HTML生成
- **ゼロJavaScriptデフォルト**: クライアントサイドでの実行なし（ビルド時処理）

### 3.4 技術的制約 🟡

**信頼性**: 🟡 *note.mdのタイムゾーン処理から推測*

#### タイムゾーン処理

- Astro SSGはビルド時（サーバー環境）で実行
- クライアント環境とタイムゾーンが異なる可能性
- **対策**: `Intl.DateTimeFormat`にタイムゾーン（`Asia/Tokyo`）を明示的に指定

```typescript
// タイムゾーンを考慮した実装
new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Tokyo', // 明示的にJSTを指定
}).format(date);
```

#### 無効な日付の処理

- `new Date('invalid')` → エラーをスロー
- `new Date(NaN)` → エラーをスロー
- `null`, `undefined` → TypeScriptで型エラー

### 3.5 参照したEARS要件・設計文書

- **参照したEARS要件**: NFR-001, REQ-901
- **参照した設計文書**:
  - `docs/design/blog-article-management/architecture.md` (アーキテクチャ制約)
  - `docs/implements/blog-article-management/TASK-0006/note.md` (技術的制約)

---

## 4. 想定される使用例

### 4.1 基本的な使用パターン 🔵

**信頼性**: 🔵 *test-patterns.md・requirements.mdより*

#### 記事一覧ページでの使用

```astro
---
// src/pages/blog/index.astro
import { getCollection } from 'astro:content';
import { formatDate } from '@/utils/date';

const posts = await getCollection('blog');
---

{posts.map(post => (
  <article>
    <h2>{post.data.title}</h2>
    <time datetime={post.data.pubDate.toISOString()}>
      {formatDate(post.data.pubDate)}
    </time>
  </article>
))}
```

#### 記事詳細ページでの使用

```astro
---
// src/layouts/BlogPostLayout.astro
import { formatDate, getRelativeTime } from '@/utils/date';

const { post } = Astro.props;
---

<article>
  <h1>{post.data.title}</h1>
  <div class="metadata">
    <span>公開日: {formatDate(post.data.pubDate)}</span>
    {post.data.updatedDate && (
      <span>更新日: {formatDate(post.data.updatedDate)}</span>
    )}
    <span>({getRelativeTime(post.data.pubDate)})</span>
  </div>
</article>
```

### 4.2 エッジケース 🔵

**信頼性**: 🔵 *test-patterns.md・note.mdより*

#### 無効な日付

```typescript
// テストケース: 無効な日付でエラーをスロー
describe('formatDate', () => {
  it('should handle invalid date', () => {
    expect(() => formatDate(new Date('invalid'))).toThrow('Invalid date');
  });
});
```

#### 境界値: 年末・年始

```typescript
// テストケース: 年末・年始の境界値
describe('formatDate boundary cases', () => {
  it('should format year-end date correctly', () => {
    expect(formatDate(new Date('2025-12-31'))).toBe('2025年12月31日');
  });

  it('should format new year date correctly', () => {
    expect(formatDate(new Date('2026-01-01'))).toBe('2026年1月1日');
  });
});
```

#### 日付境界（相対日付）

```typescript
// テストケース: 日付境界での相対日付計算
describe('getRelativeTime boundary cases', () => {
  // 日付境界（23:59 → 0:00）での動作
  it('should calculate day difference correctly at midnight', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-15T00:00:01.000Z')); // 深夜0時

    const yesterday = new Date('2025-01-14T23:59:59.000Z');
    expect(getRelativeTime(yesterday)).toBe('1日前');

    vi.useRealTimers();
  });
});
```

### 4.3 エラーケース 🔵

**信頼性**: 🔵 *note.mdより*

| ケース | 入力 | 期待される動作 |
|--------|------|--------------|
| Invalid Date文字列 | `new Date('invalid')` | `Error: Invalid date`をスロー |
| NaN Date | `new Date(NaN)` | `Error: Invalid date`をスロー |

### 4.4 参照したEARS要件・設計文書

- **参照したEARS要件**: REQ-102, REQ-112
- **参照した設計文書**:
  - `docs/design/frontend-test-infra/test-patterns.md` (テストパターン)
  - `docs/implements/blog-article-management/TASK-0006/note.md` (エッジケース)

---

## 5. EARS要件・設計文書との対応関係

### 5.1 参照したユーザストーリー

- ブログ読者として記事の公開日・更新日を確認したい

### 5.2 参照した機能要件

| 要件ID | 要件内容 | 対応 |
|--------|---------|------|
| REQ-001 | frontmatterで`pubDate`、`updatedDate`を管理 | `formatDate()`で表示用に変換 |
| REQ-102 | 記事一覧で公開日を表示 | `formatDate()`で日本語フォーマット |
| REQ-112 | 記事詳細で公開日・更新日を表示 | `formatDate()`で日本語フォーマット |

### 5.3 参照した非機能要件

| 要件ID | 要件内容 | 対応 |
|--------|---------|------|
| NFR-001 | Lighthouse 90+点維持 | ネイティブAPI使用、外部ライブラリ不使用 |

### 5.4 参照したEdgeケース

該当なし（日付フォーマット固有のEdgeケースはEARS要件に未定義）

### 5.5 参照した受け入れ基準

- 日付が日本語フォーマットで正しく表示されること
- 無効な日付入力時に適切なエラーがスローされること

### 5.6 参照した設計文書

| 文書 | 該当セクション |
|------|--------------|
| `docs/design/blog-article-management/architecture.md` | ディレクトリ構造、utilsディレクトリ |
| `docs/design/blog-article-management/dataflow.md` | 日付フォーマットの使用場面 |
| `docs/design/frontend-test-infra/test-patterns.md` | 日付フォーマット関数のテスト例、サンプル実装 |
| `src/content.config.ts` | Content Collectionsスキーマ（pubDate, updatedDate） |

---

## 6. 受け入れ基準

### 6.1 機能要件

| # | 基準 | 信頼性 |
|---|------|--------|
| AC-001 | `formatDate(new Date('2025-01-15'))`が`"2025年1月15日"`を返すこと | 🔵 |
| AC-002 | `formatDate(new Date('invalid'))`が`Error: Invalid date`をスローすること | 🔵 |
| AC-003 | `getRelativeTime(today)`が`"今日"`を返すこと | 🔵 |
| AC-004 | `getRelativeTime(yesterday)`が`"1日前"`を返すこと | 🔵 |
| AC-005 | `getRelativeTime(5日前)`が`"5日前"`を返すこと | 🔵 |

### 6.2 非機能要件

| # | 基準 | 信頼性 |
|---|------|--------|
| AC-101 | 外部ライブラリ（date-fns, dayjs等）を使用しないこと | 🔵 |
| AC-102 | `Intl.DateTimeFormat`を使用していること | 🔵 |
| AC-103 | TypeScript strict mode準拠（型エラーなし）| 🔵 |
| AC-104 | Biome（リント・フォーマット）準拠 | 🔵 |

### 6.3 テスト要件

| # | 基準 | 信頼性 |
|---|------|--------|
| AC-201 | 単体テストカバレッジ90%以上 | 🔵 |
| AC-202 | `pnpm test`が全テスト成功 | 🔵 |
| AC-203 | `pnpm check`が型エラーなし | 🔵 |
| AC-204 | `pnpm lint`がエラーなし | 🔵 |

---

## 7. 実装チェックリスト

### 7.1 src/utils/date.ts

- [ ] `formatDate()` 関数を実装
  - [ ] `Intl.DateTimeFormat`を使用
  - [ ] `ja-JP`ロケール設定
  - [ ] `timeZone: 'Asia/Tokyo'`を明示的に指定
  - [ ] 無効な日付でエラーをスロー
  - [ ] JSDocコメントを記載
  - [ ] 要件トレーサビリティコメントを記載（REQ-001, REQ-102, REQ-112）

- [ ] `getRelativeTime()` 関数を実装
  - [ ] 「今日」「1日前」「N日前」の表示
  - [ ] 日単位での差分計算（時刻は無視）
  - [ ] JSDocコメントを記載
  - [ ] 要件トレーサビリティコメントを記載（REQ-001）

### 7.2 src/utils/date.test.ts

- [ ] `formatDate()` テストケース
  - [ ] 正常系: 日本語フォーマット確認
  - [ ] 異常系: 無効な日付でエラー
  - [ ] 境界値: 年末・年始
  - [ ] 境界値: 閏年（2月29日）

- [ ] `getRelativeTime()` テストケース
  - [ ] 正常系: 「今日」を返す
  - [ ] 正常系: 「1日前」を返す
  - [ ] 正常系: 「N日前」を返す
  - [ ] 時刻モックの設定（`vi.useFakeTimers()`）
  - [ ] 境界値: 日付境界での計算

### 7.3 品質チェック

- [ ] `pnpm test` がすべて通る
- [ ] `pnpm check` が型エラーなく通る
- [ ] `pnpm lint` がエラーなく通る

---

## 8. 信頼性レベルサマリー

| レベル | 件数 | 割合 | 説明 |
|--------|------|------|------|
| 🔵 青信号 | 45 | 94% | EARS要件定義書・設計文書から確実に導出 |
| 🟡 黄信号 | 3 | 6% | EARS要件定義書・設計文書から妥当な推測 |
| 🔴 赤信号 | 0 | 0% | EARS要件定義書・設計文書にない推測 |

**品質評価**: ✅ 高品質

**評価理由**:
- test-patterns.mdにサンプル実装とテストケースが詳細に記載されており、仕様が明確
- 大部分の要件がEARS要件定義書・設計文書から確実に導出可能
- 黄信号項目はタイムゾーン処理の詳細のみで、実装への影響は軽微
- 赤信号項目なし（推測による仕様定義なし）

---

**最終更新日**: 2026-01-01
**作成者**: Claude Opus 4.5 (TDD開発エージェント)
