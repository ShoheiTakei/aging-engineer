# 関連記事アルゴリズム 要件定義書

**タスクID**: TASK-0009
**作成日**: 2026-01-01
**タイプ**: TDD
**工数見積もり**: 8時間
**優先度**: P1

## 1. 概要

ブログ記事詳細ページに表示する関連記事を抽出するためのアルゴリズムを実装する。
タグベースの類似度計算により、現在の記事と関連性の高い記事を特定し、ランキング付けして返す。

## 2. 関連要件

- **REQ-701**: 記事詳細ページに関連記事リストを表示しなければならない
  - タグが一致する記事を優先表示
  - 最大5件まで表示
  - 現在の記事を除外

## 3. 機能要件

### 3.1 入力

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| currentPost | BlogPost | Yes | 現在表示中の記事 |
| allPosts | BlogPost[] | Yes | 全記事のリスト |
| maxItems | number | No | 最大表示件数（デフォルト: 5） |

### 3.2 出力

| フィールド | 型 | 説明 |
|-----------|-----|------|
| post | BlogPost | 関連記事 |
| score | number | 類似度スコア（共通タグ数） |
| commonTags | string[] | 共通タグのリスト |

### 3.3 アルゴリズム仕様

1. **現在の記事を除外**: 全記事リストから現在表示中の記事を除外
2. **下書き記事を除外**: `draft: true` の記事を除外（本番環境のみ）
3. **共通タグ数を計算**: 各記事と現在の記事の共通タグ数をカウント
4. **スコア順にソート**: 共通タグ数（降順）でソート
5. **同点の場合**: 公開日が新しい順でソート
6. **最大件数で切り取り**: 上位N件を返す（デフォルト5件）

### 3.4 類似度計算式

```
類似度スコア = 現在の記事のタグ ∩ 対象記事のタグ の要素数
```

## 4. エッジケース

### 4.1 正常系境界値

| ケース | 入力 | 期待される出力 |
|--------|------|----------------|
| タグなし記事 | currentPost.tags = [] | 空配列を返す |
| 関連記事なし | 共通タグを持つ記事がない | 空配列を返す |
| 記事が1件のみ | allPosts.length === 1 | 空配列を返す |
| maxItems=0 | maxItems = 0 | 空配列を返す |

### 4.2 異常系

| ケース | 入力 | 期待される出力 |
|--------|------|----------------|
| allPostsが空 | allPosts = [] | 空配列を返す |
| maxItemsが負数 | maxItems = -1 | 空配列を返す |

## 5. パフォーマンス要件

- **計算量**: O(n * m) （n: 全記事数、m: 最大タグ数）
- **目標**: 1000記事でも100ms以内で完了

## 6. 型定義

```typescript
type RelatedPostEntry = {
  post: BlogPost;
  score: number;
  commonTags: string[];
};

type GetRelatedPostsOptions = {
  maxItems?: number;
  includeDrafts?: boolean;
};
```

## 7. 実装場所

- **ファイル**: `src/utils/relatedArticles.ts`
- **テスト**: `src/utils/relatedArticles.test.ts`

## 8. 信頼性レベル

- 🔵 **青信号**: REQ-701、architecture.mdから確実に導出
- 🟡 **黄信号**: 同点ソートのロジック、パフォーマンス要件

## 9. 関連文書

- [要件定義書](../../../spec/blog-article-management/requirements.md)
- [アーキテクチャ設計](../../../design/blog-article-management/architecture.md)
- [型定義](../../../design/blog-article-management/interfaces.ts)
