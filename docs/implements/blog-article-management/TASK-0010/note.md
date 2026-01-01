# TASK-0010: 検索インデックス生成ユーティリティの実装 - タスクノート

**作成日**: 2026-01-01
**タスクタイプ**: TDD
**見積もり工数**: 5時間
**優先度**: P1 (高優先)

---

## 概要

TASK-0010「検索インデックス生成ユーティリティの実装」の開発に必要なコンテキスト情報を整理したタスクノートです。

**タスク概要**:
- `generateSearchIndex()` 関数の実装（記事データから検索インデックスJSONを生成）
- `searchArticles()` 関数の実装（クライアントサイド検索）
- `src/utils/search.ts` にユーティリティを配置
- 単体テストの実装（TDD Red-Green-Refactor）

**関連要件**: REQ-401, REQ-402 (検索機能)
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

#### Islands Architecture + Static Site Generation (SSG)

- ビルド時に検索インデックスJSONを生成
- クライアントサイドでJSONを読み込んで検索を実行
- 外部検索サービス不要で軽量

---

## 2. 要件定義（EARS記法）

### REQ-401: 検索機能

> システムは、記事検索機能を提供しなければならない
> - タイトルと本文から全文検索
> - 部分一致検索をサポート
> - 検索結果をハイライト表示

### REQ-402: 検索結果表示

> システムは、検索結果を関連度順に表示しなければならない

---

## 3. 関数仕様

### SearchIndexItem型

```typescript
/**
 * 検索インデックスの1エントリ
 */
export interface SearchIndexItem {
  slug: string;           // 記事のslug
  title: string;          // 記事タイトル
  description: string;    // 記事説明
  body: string;           // 本文（検索用に一部抜粋）
  tags: string[];         // タグ配列
  pubDate: string;        // 公開日（ISO 8601形式）
}
```

### generateSearchIndex()

**目的**: ブログ記事コレクションから検索インデックスJSONを生成

**シグネチャ**:
```typescript
/**
 * ブログ記事から検索インデックスを生成する
 *
 * @param posts - ブログ記事の配列
 * @param options - オプション設定
 * @returns 検索インデックスの配列
 *
 * @example
 * const index = generateSearchIndex(posts, { bodyLength: 500 });
 *
 * @関連要件 REQ-401, REQ-402
 */
export function generateSearchIndex(
  posts: BlogPost[],
  options?: { bodyLength?: number }
): SearchIndexItem[];
```

**実装方針**:
- 下書き記事は除外
- 本文は指定文字数（デフォルト500文字）まで抽出
- 公開日はISO 8601形式で出力

### searchArticles()

**目的**: 検索クエリに一致する記事を検索

**シグネチャ**:
```typescript
/**
 * 検索インデックスからクエリに一致する記事を検索する
 *
 * @param index - 検索インデックス
 * @param query - 検索クエリ
 * @returns 関連度順にソートされた検索結果
 *
 * @example
 * const results = searchArticles(index, 'Astro');
 *
 * @関連要件 REQ-401, REQ-402
 */
export function searchArticles(
  index: SearchIndexItem[],
  query: string
): SearchResult[];

export interface SearchResult {
  item: SearchIndexItem;
  score: number;           // 関連度スコア
  matches: MatchInfo[];    // マッチ箇所情報
}

export interface MatchInfo {
  field: 'title' | 'description' | 'body' | 'tags';
  indices: [number, number][]; // マッチ位置
}
```

**実装方針**:
- 部分一致検索（大文字小文字区別なし）
- タイトル > タグ > 説明 > 本文 の順で重み付け
- マッチ箇所情報を返す（ハイライト表示用）

---

## 4. テストケース

### generateSearchIndex() テストケース

| ID | カテゴリ | テストケース | 期待結果 |
|----|---------|------------|---------|
| TC-SI-001 | 正常系 | 1件の記事から検索インデックスを生成 | 正しいインデックスが生成される |
| TC-SI-002 | 正常系 | 複数記事から検索インデックスを生成 | すべての記事がインデックスに含まれる |
| TC-SI-003 | 正常系 | 本文が指定文字数で切り詰められる | bodyが500文字以内 |
| TC-SI-004 | 境界値 | 空の記事配列 | 空の配列を返す |
| TC-SI-005 | 境界値 | 本文が0文字の記事 | bodyは空文字列 |
| TC-SI-006 | 境界値 | タグなしの記事 | tagsは空配列 |

### searchArticles() テストケース

| ID | カテゴリ | テストケース | 期待結果 |
|----|---------|------------|---------|
| TC-SA-001 | 正常系 | タイトルに完全一致するクエリ | 該当記事が最上位に表示 |
| TC-SA-002 | 正常系 | タイトルに部分一致するクエリ | 該当記事が検索される |
| TC-SA-003 | 正常系 | 大文字小文字を区別しない検索 | 大文字小文字関係なく検索される |
| TC-SA-004 | 正常系 | タグに一致するクエリ | タグで検索される |
| TC-SA-005 | 正常系 | 本文に一致するクエリ | 本文内容で検索される |
| TC-SA-006 | 正常系 | 複数フィールドにマッチする場合 | スコアが高くなる |
| TC-SA-007 | 正常系 | 関連度順にソートされる | 関連度が高い順に並ぶ |
| TC-SA-008 | 境界値 | 空のクエリ | 空の結果を返す |
| TC-SA-009 | 境界値 | マッチしないクエリ | 空の結果を返す |
| TC-SA-010 | 境界値 | 空のインデックス | 空の結果を返す |

---

## 5. ディレクトリ構造

```text
src/
└── utils/
    ├── search.ts           # 検索ユーティリティ（実装）
    └── search.test.ts      # 検索ユーティリティ（テスト）
```

---

## 6. 実装チェックリスト

### src/utils/search.ts

- [ ] `SearchIndexItem` 型を定義
- [ ] `SearchResult` 型を定義
- [ ] `MatchInfo` 型を定義
- [ ] `generateSearchIndex()` 関数を実装
  - [ ] 記事データから検索インデックスを生成
  - [ ] 本文を指定文字数で切り詰め
  - [ ] JSDocコメントを記載
- [ ] `searchArticles()` 関数を実装
  - [ ] 部分一致検索
  - [ ] 大文字小文字区別なし
  - [ ] 関連度スコアリング
  - [ ] マッチ箇所情報の返却
  - [ ] JSDocコメントを記載

### src/utils/search.test.ts

- [ ] `generateSearchIndex()` テストケース
  - [ ] 正常系テスト
  - [ ] 境界値テスト
- [ ] `searchArticles()` テストケース
  - [ ] 正常系テスト
  - [ ] 境界値テスト

### 品質チェック

- [ ] `pnpm test` がすべて通る
- [ ] `pnpm check` が型エラーなく通る
- [ ] `pnpm lint` がエラーなく通る

---

## 7. 成功基準

### 機能要件

- [ ] `generateSearchIndex()` が正しく検索インデックスを生成する
- [ ] `searchArticles()` が部分一致検索を実行できる
- [ ] 検索結果が関連度順にソートされる
- [ ] マッチ箇所情報が返される

### 非機能要件

- [ ] TypeScript strict mode準拠
- [ ] Biome（リント・フォーマット）準拠
- [ ] 外部ライブラリ不使用（ネイティブAPI使用）
- [ ] 単体テストカバレッジ90%以上

---

**最終更新日**: 2026-01-01
**作成者**: Claude Opus 4.5
