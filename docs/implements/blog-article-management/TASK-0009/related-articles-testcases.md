# 関連記事アルゴリズム テストケース定義書

**タスクID**: TASK-0009
**作成日**: 2026-01-01
**関連要件**: REQ-701

## 1. テストケース概要

| カテゴリ | テストケース数 | 説明 |
|---------|---------------|------|
| 正常系 | 6件 | 基本的な関連記事抽出 |
| 境界値 | 5件 | エッジケース |
| 異常系 | 3件 | エラーハンドリング |

## 2. 正常系テストケース

### TC-RA-001: 共通タグを持つ記事を関連記事として抽出する 🔵

**目的**: 共通タグを持つ記事が関連記事として抽出されることを確認

**入力**:
- currentPost: tags = ["TypeScript", "React"]
- allPosts:
  - post1: tags = ["TypeScript", "Node.js"]
  - post2: tags = ["React", "Next.js"]
  - post3: tags = ["Python"]

**期待される出力**:
- 関連記事: [post1, post2]（順不同、共通タグ数は同じ）
- post3は除外（共通タグなし）

### TC-RA-002: 共通タグ数の多い順にソートされる 🔵

**目的**: 共通タグ数が多い記事が上位に表示されることを確認

**入力**:
- currentPost: tags = ["TypeScript", "React", "Testing"]
- allPosts:
  - post1: tags = ["TypeScript"] （共通: 1）
  - post2: tags = ["TypeScript", "React"] （共通: 2）
  - post3: tags = ["TypeScript", "React", "Testing"] （共通: 3）

**期待される出力**:
- 関連記事: [post3, post2, post1]（スコア降順）
- スコア: [3, 2, 1]

### TC-RA-003: 現在の記事を除外する 🔵

**目的**: 現在表示中の記事が関連記事に含まれないことを確認

**入力**:
- currentPost: slug = "current-article", tags = ["TypeScript"]
- allPosts: currentPostを含む配列

**期待される出力**:
- currentPostが結果に含まれない

### TC-RA-004: 下書き記事を除外する 🔵

**目的**: draft: trueの記事が関連記事に含まれないことを確認

**入力**:
- currentPost: tags = ["TypeScript"]
- allPosts:
  - post1: tags = ["TypeScript"], draft = false
  - post2: tags = ["TypeScript"], draft = true

**期待される出力**:
- 関連記事: [post1]（post2は除外）

### TC-RA-005: 最大件数を制限する（デフォルト5件） 🔵

**目的**: デフォルトで最大5件まで関連記事を返すことを確認

**入力**:
- currentPost: tags = ["TypeScript"]
- allPosts: 10件の記事（すべて "TypeScript" タグを持つ）

**期待される出力**:
- 関連記事: 5件

### TC-RA-006: 同点の場合は公開日が新しい順 🟡

**目的**: 共通タグ数が同じ場合、公開日が新しい記事が上位に表示されることを確認

**入力**:
- currentPost: tags = ["TypeScript"]
- allPosts:
  - post1: tags = ["TypeScript"], pubDate = 2025-01-01
  - post2: tags = ["TypeScript"], pubDate = 2025-01-15
  - post3: tags = ["TypeScript"], pubDate = 2025-01-10

**期待される出力**:
- 関連記事: [post2, post3, post1]（公開日降順）

## 3. 境界値テストケース

### TC-RA-101: タグなし記事では空配列を返す 🔵

**目的**: 現在の記事にタグがない場合、空配列を返すことを確認

**入力**:
- currentPost: tags = []
- allPosts: 複数の記事

**期待される出力**:
- 関連記事: []

### TC-RA-102: 共通タグを持つ記事がない場合は空配列 🔵

**目的**: 共通タグを持つ記事がない場合、空配列を返すことを確認

**入力**:
- currentPost: tags = ["TypeScript"]
- allPosts: すべての記事が異なるタグを持つ

**期待される出力**:
- 関連記事: []

### TC-RA-103: 記事が1件のみの場合は空配列 🔵

**目的**: 全記事が1件（現在の記事のみ）の場合、空配列を返すことを確認

**入力**:
- currentPost: tags = ["TypeScript"]
- allPosts: [currentPost]

**期待される出力**:
- 関連記事: []

### TC-RA-104: maxItems=0の場合は空配列 🟡

**目的**: maxItems=0が指定された場合、空配列を返すことを確認

**入力**:
- currentPost: tags = ["TypeScript"]
- allPosts: 複数の記事
- maxItems: 0

**期待される出力**:
- 関連記事: []

### TC-RA-105: maxItemsでカスタム件数を指定 🔵

**目的**: maxItemsで指定した件数だけ関連記事を返すことを確認

**入力**:
- currentPost: tags = ["TypeScript"]
- allPosts: 10件の記事
- maxItems: 3

**期待される出力**:
- 関連記事: 3件

## 4. 異常系テストケース

### TC-RA-201: allPostsが空配列の場合は空配列を返す 🔵

**目的**: 全記事リストが空の場合、エラーなく空配列を返すことを確認

**入力**:
- currentPost: tags = ["TypeScript"]
- allPosts: []

**期待される出力**:
- 関連記事: []

### TC-RA-202: maxItemsが負数の場合は空配列を返す 🟡

**目的**: maxItemsが負数の場合、エラーなく空配列を返すことを確認

**入力**:
- currentPost: tags = ["TypeScript"]
- allPosts: 複数の記事
- maxItems: -1

**期待される出力**:
- 関連記事: []

### TC-RA-203: 共通タグ情報を正しく返す 🔵

**目的**: 各関連記事の共通タグ情報が正しく返されることを確認

**入力**:
- currentPost: tags = ["TypeScript", "React"]
- allPosts:
  - post1: tags = ["TypeScript", "Node.js"]

**期待される出力**:
- 関連記事: [{post: post1, score: 1, commonTags: ["TypeScript"]}]

## 5. テスト実装ファイル

- **ファイル**: `src/utils/relatedArticles.test.ts`

## 6. 信頼性レベルサマリー

- 🔵 青信号: 11件 (78.6%)
- 🟡 黄信号: 3件 (21.4%)

**品質評価**: 高品質
