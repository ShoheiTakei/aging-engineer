# TASK-0008: 目次生成ユーティリティの実装 - 実装ノート

**作成日**: 2026-01-01
**タスクID**: TASK-0008
**ステータス**: 完了

## 概要

記事の見出し（h2, h3）から目次を自動生成する`generateTOC`ユーティリティ関数をTDD方式で実装しました。

## 実装内容

### 作成ファイル

| ファイル | 説明 |
|---------|------|
| `src/utils/toc.ts` | 目次生成ユーティリティ本体 |
| `src/utils/toc.test.ts` | テストスイート（12テストケース） |
| `docs/implements/blog-article-management/TASK-0008/toc-utils-requirements.md` | 要件定義書 |
| `docs/implements/blog-article-management/TASK-0008/toc-utils-testcases.md` | テストケース定義書 |

### 実装した機能

1. **h2/h3抽出**: headings配列からh2, h3のみを抽出
2. **階層構造生成**: h2をトップレベル、h3を子項目として階層化
3. **アンカーリンク生成**: slug値をそのまま使用してアンカーリンクを提供
4. **空目次判定**: 見出しが存在しない場合を判定可能（EDGE-104対応）

### 型定義

```typescript
interface MarkdownHeading {
  depth: number;  // 見出しレベル (1-6)
  slug: string;   // アンカーID
  text: string;   // 見出しテキスト
}

interface TOCItem {
  depth: number;     // 見出しレベル (2 or 3)
  slug: string;      // アンカーリンク用ID
  text: string;      // 見出しテキスト
  children: TOCItem[]; // 子項目
}

interface TOCResult {
  items: TOCItem[];    // トップレベルの目次項目
  hasContent: boolean; // 目次があるか
}
```

## テスト結果

```
 ✓ src/utils/toc.test.ts (12 tests) 6ms
   ✓ TC-TOC-001: 標準的なh2/h3構造を階層化された目次に変換する
   ✓ TC-TOC-002: h2のみの記事でフラットな目次を生成する
   ✓ TC-TOC-003: 複数のh3が連続する場合、全て親h2の子になる
   ✓ TC-TOC-004: 日本語テキストがそのまま保持される
   ✓ TC-TOC-005: slugがそのまま出力される
   ✓ TC-TOC-101: 空の配列でhasContentがfalseになる
   ✓ TC-TOC-102: h1のみの配列でhasContentがfalseになる
   ✓ TC-TOC-103: h4-h6のみの配列でhasContentがfalseになる
   ✓ TC-TOC-201: h3のみの記事でh3がトップレベルになる
   ✓ TC-TOC-202: h2が1つのみでも目次を生成する
   ✓ TC-TOC-203: h3から始まりその後h2が来る場合を正しく処理する
   ✓ TC-TOC-204: 大量の見出し（100個）を正しく処理する

 Test Files  1 passed (1)
      Tests  12 passed (12)
```

## 使用例

```typescript
// Astroコンポーネントでの使用例
const { Content, headings } = await post.render();
const toc = generateTOC(headings);

if (toc.hasContent) {
  // TableOfContentsコンポーネントに渡す
  <TableOfContents items={toc.items} />
}
```

## 設計上の決定事項

1. **h2/h3のみ対象**: h1はタイトル、h4-h6は詳細すぎるため目次対象外
2. **親なしh3の扱い**: h2がなくh3から始まる場合はトップレベルとして扱う
3. **外部ライブラリ不使用**: Lighthouse 90+維持のためネイティブAPIのみ使用
4. **O(n)時間計算量**: 見出し数に比例した処理時間を保証

## 次のステップ

TASK-0014（記事詳細ページの実装）でこのユーティリティを使用して目次コンポーネントを実装予定。

## 関連文書

- [要件定義書](./toc-utils-requirements.md)
- [テストケース定義書](./toc-utils-testcases.md)
- [アーキテクチャ設計](../../../design/blog-article-management/architecture.md)
- [データフロー](../../../design/blog-article-management/dataflow.md)
