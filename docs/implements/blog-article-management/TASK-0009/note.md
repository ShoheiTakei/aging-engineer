# TASK-0009: 関連記事アルゴリズムの実装 ノート

**タスクID**: TASK-0009
**実装日**: 2026-01-01
**ステータス**: 完了

## 実装概要

### 目的

ブログ記事詳細ページに表示する関連記事を抽出するためのアルゴリズムを実装。
タグベースの類似度計算により、現在の記事と関連性の高い記事を特定する。

### 実装ファイル

| ファイル | 説明 |
|---------|------|
| `src/utils/relatedArticles.ts` | 関連記事アルゴリズム本体 |
| `src/utils/relatedArticles.test.ts` | テストスイート（14テスト） |

## アルゴリズム詳細

### 処理フロー

```
入力: currentPost, allPosts, options
    ↓
1. maxItemsが0以下 → 空配列を返す
    ↓
2. currentPostにタグがない → 空配列を返す
    ↓
3. 各記事について:
   - 現在の記事を除外
   - 下書き記事を除外（includeDrafts=false時）
   - 共通タグを計算
   - 共通タグがあればエントリに追加
    ↓
4. スコア（共通タグ数）降順でソート
   - 同点は公開日降順
    ↓
5. 最大件数で切り取り
    ↓
出力: RelatedPostEntry[]
```

### 計算量

- **時間計算量**: O(n * m)
  - n: 全記事数
  - m: 最大タグ数
- **空間計算量**: O(n)
  - 関連記事エントリの配列

## TDD実装記録

### Red Phase

- 14件のテストケースを作成
- 全テストが「Not implemented」で失敗することを確認

### Green Phase

- `getRelatedPosts`関数を実装
- 全14テストがパス

### Refactor Phase

- リンター適用（trailing comma修正）
- TypeScript型エラー修正（ヘルパー関数の型を改善）
- 全テストが引き続きパス

## テスト結果

```
 ✓ src/utils/relatedArticles.test.ts (14 tests) 5ms

正常系テストケース:
  ✓ TC-RA-001: 共通タグを持つ記事を関連記事として抽出する
  ✓ TC-RA-002: 共通タグ数の多い順にソートされる
  ✓ TC-RA-003: 現在の記事を除外する
  ✓ TC-RA-004: 下書き記事を除外する
  ✓ TC-RA-005: 最大件数を制限する（デフォルト5件）
  ✓ TC-RA-006: 同点の場合は公開日が新しい順

境界値テストケース:
  ✓ TC-RA-101: タグなし記事では空配列を返す
  ✓ TC-RA-102: 共通タグを持つ記事がない場合は空配列
  ✓ TC-RA-103: 記事が1件のみの場合は空配列
  ✓ TC-RA-104: maxItems=0の場合は空配列
  ✓ TC-RA-105: maxItemsでカスタム件数を指定

異常系テストケース:
  ✓ TC-RA-201: allPostsが空配列の場合は空配列を返す
  ✓ TC-RA-202: maxItemsが負数の場合は空配列を返す
  ✓ TC-RA-203: 共通タグ情報を正しく返す
```

## 使用例

```typescript
import { getRelatedPosts } from '@/utils/relatedArticles';

// 基本的な使用
const related = getRelatedPosts(currentPost, allPosts);

// カスタムオプション
const related = getRelatedPosts(currentPost, allPosts, {
  maxItems: 3,          // 最大3件
  includeDrafts: true,  // 下書きも含める
});

// 結果の利用
related.forEach(({ post, score, commonTags }) => {
  console.log(`${post.data.title}: スコア=${score}, 共通タグ=${commonTags.join(', ')}`);
});
```

## 関連文書

- [要件定義書](related-articles-requirements.md)
- [テストケース定義書](related-articles-testcases.md)
- [REQ-701: 関連記事表示要件](../../../spec/blog-article-management/requirements.md)

## 次のステップ

このユーティリティは以下のタスクで使用される予定:

- **TASK-0016**: 関連記事表示コンポーネントの実装
  - `RelatedArticles.astro`コンポーネントでこのユーティリティを利用
