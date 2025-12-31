# TASK-0004: ヘッダー・フッターコンポーネントの実装 - タスクノート

**作成日**: 2025-12-31
**タスクタイプ**: TDD
**見積もり工数**: 8時間
**優先度**: P0 (最優先)

---

## 📚 概要

TASK-0004「ヘッダー・フッターコンポーネントの実装」の開発に必要なコンテキスト情報を整理したタスクノートです。

**タスク概要**:
- ヘッダーコンポーネント (`src/components/Header.astro`) の実装
- フッターコンポーネント (`src/components/Footer.astro`) の実装
- ナビゲーション機能の実装
- アクセシビリティ対応（WCAG 2.1 AA準拠）

**関連要件**: NFR-301～NFR-304 (アクセシビリティ)
**関連設計**: [architecture.md](../../../design/blog-article-management/architecture.md)

---

## 🛠️ 技術スタック

### フレームワーク・ライブラリ

| 技術 | バージョン | 用途 | 備考 |
|------|-----------|------|------|
| **Astro** | 5.1.3 | UIフレームワーク | Islands Architecture採用 |
| **TypeScript** | 5.7+ | 型安全な開発 | strict mode有効 |
| **Tailwind CSS** | 4.0+ | スタイリング | ダークモード対応、CSS変数活用 |
| **happy-dom** | 20.0.11 | テストランタイム | Astroコンポーネントテスト用 |
| **vitest** | 2.1.8 | テストフレームワーク | 単体テスト実行 |

### アーキテクチャパターン

**Islands Architecture + Static Site Generation (SSG)**
- ゼロJavaScriptデフォルト（最高のパフォーマンス）
- ビルド時に全ページを静的HTML生成
- SSRは使用しない（Cloudflare Pages無料枠最大活用）

### レンダリングモード

- **SSG (Static Site Generation)**: ビルド時に静的HTML生成
- **SSR禁止**: REQ-901により静的サイト生成のみサポート

---

## 📋 開発ルール

### コーディング規約

#### TypeScript

- **strict mode必須**: `tsconfig.json`で`"strict": true`を設定
- **型推論の活用**: 可能な限り明示的な型定義より型推論を使用
- **パスエイリアス**:
  ```typescript
  import { Component } from '@/components/Component.astro';
  import { Layout } from '@layouts/Layout.astro';
  import { util } from '@utils/util.ts';
  ```

#### Biome（リント・フォーマット）

**設定** (`biome.json`):
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
feat: ヘッダーコンポーネントを実装
test: ヘッダーのアクセシビリティテストを追加
fix: ナビゲーションのキーボード操作を修正
```

**ブランチ命名**:
- `feat/機能名`: 機能追加
- `fix/修正内容`: バグ修正

### テスト要件

#### 単体テスト (Vitest)

**必須テストケース**:
1. コンポーネントが正しくレンダリングされる
2. Props（タイトル、ナビゲーション項目）が正しく反映される
3. アクセシビリティ属性（ARIA、セマンティックHTML）が正しく設定される
4. ダークモードスタイルが正しく適用される

**テストファイル配置**:
```
src/
├── components/
│   ├── Header.astro
│   ├── Header.test.ts        # 単体テスト
│   ├── Footer.astro
│   └── Footer.test.ts        # 単体テスト
```

**テスト実行コマンド**:
- `pnpm test`: テスト実行
- `pnpm test:watch`: ウォッチモードでテスト実行

#### E2Eテスト (Playwright)

Phase 3 (TASK-0025) で実装予定

---

## 🎨 既存の実装パターン

### BaseLayout.astro（参考実装）

**場所**: `src/layouts/BaseLayout.astro`

**実装パターン**:
```astro
---
/**
 * BaseLayout - 基本レイアウトコンポーネント
 *
 * 全ページで使用する基本的なHTML構造を提供します。
 */

interface Props {
  /** ページタイトル（必須） */
  title: string;
  /** ページの説明（必須） */
  description: string;
  /** OGP用URL（任意） */
  ogUrl?: string;
  /** OGPタイプ（デフォルト: website） */
  ogType?: 'website' | 'article';
}

const { title, description, ogUrl, ogType = 'website' } = Astro.props;
---

<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- SEOメタタグ (NFR-101) -->
    <title>{title}</title>
    <meta name="description" content={description} />

    <!-- OGPメタタグ (NFR-102) -->
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content={ogType} />
    {ogUrl && <meta property="og:url" content={ogUrl} />}

    <!-- グローバルスタイル -->
    <link rel="stylesheet" href="/src/styles/global.css" />
  </head>
  <body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <!-- メインコンテンツ (NFR-301: セマンティックHTML) -->
    <main class="min-h-screen">
      <slot />
    </main>
  </body>
</html>
```

**学ぶべきポイント**:
1. **TypeScript型定義**: `interface Props`で型安全なPropsを定義
2. **JSDocコメント**: コンポーネントの目的と要件を明記
3. **デフォルト値**: `ogType = 'website'`のようにデフォルト値を設定
4. **セマンティックHTML**: `<main>`タグを適切に使用
5. **Tailwindクラス**: `bg-white dark:bg-gray-900`でダークモード対応
6. **要件トレーサビリティ**: コメントで関連要件（NFR-101, NFR-102等）を明記

### グローバルスタイル（参考実装）

**場所**: `src/styles/global.css`

**CSS変数定義**:
```css
@layer base {
  :root {
    /* ライトモードカラー */
    --color-primary: 59 130 246; /* blue-500 */
    --color-secondary: 107 114 128; /* gray-500 */
    --color-background: 255 255 255; /* white */
    --color-text: 17 24 39; /* gray-900 */
  }

  .dark {
    /* ダークモードカラー */
    --color-primary: 96 165 250; /* blue-400 */
    --color-secondary: 156 163 175; /* gray-400 */
    --color-background: 17 24 39; /* gray-900 */
    --color-text: 243 244 246; /* gray-100 */
  }

  /* NFR-304: フォーカス可視化 (WCAG 2.1 AA) */
  *:focus-visible {
    @apply outline-2 outline-offset-2 outline-blue-500;
  }
}
```

**カスタムコンポーネントスタイル**:
```css
@layer components {
  /* ボタンスタイル */
  .btn {
    @apply px-4 py-2 rounded-lg font-medium;
    @apply transition-colors duration-200;
    @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2;
  }

  .btn-primary {
    @apply bg-blue-600 text-white hover:bg-blue-700;
    @apply dark:bg-blue-500 dark:hover:bg-blue-600;
  }

  /* カードスタイル */
  .card {
    @apply bg-white dark:bg-gray-800;
    @apply border border-gray-200 dark:border-gray-700;
    @apply rounded-lg shadow-sm;
    @apply transition-shadow duration-200;
    @apply hover:shadow-md;
  }
}
```

---

## 📐 設計文書

### ディレクトリ構造

**アーキテクチャ設計書より** (`docs/design/blog-article-management/architecture.md`):

```
src/
├── components/
│   ├── Header.astro             # ヘッダーコンポーネント ← TASK-0004で実装
│   ├── Footer.astro             # フッターコンポーネント ← TASK-0004で実装
│   ├── BlogCard.astro           # 記事カードコンポーネント (REQ-101)
│   ├── Pagination.astro         # ページネーション (REQ-201)
│   ├── TagList.astro            # タグ一覧 (REQ-302)
│   ├── SearchBox.astro          # 検索ボックス (REQ-401)
│   ├── RelatedArticles.astro    # 関連記事 (REQ-701)
│   ├── TableOfContents.astro    # 目次 (REQ-901)
│   └── ReadingTime.astro        # 読了時間 (REQ-801)
├── layouts/
│   ├── BaseLayout.astro         # 基本レイアウト
│   └── BlogPostLayout.astro     # 記事詳細レイアウト
```

### コンポーネント仕様

#### Header.astro 仕様

**要件**:
- **NFR-301**: セマンティックHTML使用 (`<header>`, `<nav>`)
- **NFR-302**: キーボードナビゲーション対応（Tab, Enter, Space）
- **NFR-303**: ARIAラベル適切な設定 (`aria-label`, `aria-current`)
- **NFR-304**: 代替テキスト・フォーカス可視化

**必須要素**:
1. サイトロゴ/タイトル
2. ナビゲーションメニュー（ホーム、ブログ、タグ、検索、RSS）
3. ダークモード切り替えボタン（TASK-0005で実装予定）
4. レスポンシブメニュー（モバイル対応）

#### Footer.astro 仕様

**要件**:
- **NFR-301**: セマンティックHTML使用 (`<footer>`)
- **NFR-303**: ARIAラベル適切な設定

**必須要素**:
1. コピーライト表記
2. SNSリンク（任意）
3. サイトマップリンク（任意）
4. RSSフィードリンク

---

## ⚠️ 注意事項

### 技術的制約

#### パフォーマンス制約

- **REQ-903**: SSGのみ使用（SSR禁止）
- **NFR-001**: Lighthouse 90+点維持
  - Performance: 90+
  - Accessibility: 90+
  - Best Practices: 90+
  - SEO: 90+

#### セキュリティ制約

- **XSS対策**: Astroのデフォルトエスケープ処理を活用
- **HTTPS**: Cloudflare Pagesによる自動HTTPS化
- 静的サイトのためバックエンド脆弱性なし

#### 互換性制約

- **モダンブラウザのみサポート** (ES2022+)
- **Node.js 18+必須**
- **Astro 5.1+, TypeScript 5.7+, Tailwind CSS 4.0+**

### アクセシビリティ要件（WCAG 2.1 AA準拠）

#### NFR-301: セマンティックHTML

**必須事項**:
```html
<!-- ✅ 正しい例 -->
<header>
  <nav aria-label="メインナビゲーション">
    <ul>
      <li><a href="/">ホーム</a></li>
      <li><a href="/blog">ブログ</a></li>
    </ul>
  </nav>
</header>

<footer>
  <p>&copy; 2025 Your Name</p>
</footer>

<!-- ❌ 間違った例 -->
<div class="header">
  <div class="nav">
    <a href="/">ホーム</a>
    <a href="/blog">ブログ</a>
  </div>
</div>
```

#### NFR-302: キーボードナビゲーション

**必須事項**:
- すべてのリンク・ボタンがTabキーで移動可能
- Enterキー・Spaceキーで操作可能
- フォーカス順序が論理的（視覚的な順序と一致）

**実装例**:
```astro
<nav>
  <ul>
    <li>
      <a
        href="/"
        class="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        ホーム
      </a>
    </li>
  </ul>
</nav>
```

#### NFR-303: ARIAラベル

**必須事項**:
```html
<!-- ナビゲーションにaria-label -->
<nav aria-label="メインナビゲーション">
  <ul>
    <li>
      <!-- 現在のページをaria-currentで示す -->
      <a href="/blog" aria-current="page">ブログ</a>
    </li>
  </ul>
</nav>

<!-- ボタンにaria-label -->
<button aria-label="ダークモードに切り替え">
  🌙
</button>
```

#### NFR-304: フォーカス可視化・代替テキスト

**必須事項**:
```css
/* グローバルスタイルで定義済み */
*:focus-visible {
  @apply outline-2 outline-offset-2 outline-blue-500;
}
```

```html
<!-- 画像には必ずalt属性 -->
<img src="/logo.svg" alt="サイトロゴ" />

<!-- 装飾画像はalt="" -->
<img src="/decoration.svg" alt="" />
```

### パフォーマンス要件

#### NFR-001: Lighthouse 90+点

**最適化戦略**:
1. **ゼロJavaScriptデフォルト**: Islands Architectureを活用
2. **CSS最適化**: Tailwind CSSのPurgeで未使用CSS削除
3. **画像最適化**: 次のタスク（TASK-0022）で対応
4. **レスポンスタイム**: 静的HTML配信により100ms以下を目標

### SEO要件

#### NFR-101～NFR-104: メタタグ・OGP・構造化データ

BaseLayout.astroで実装済み（ヘッダー・フッターは直接関与しない）

---

## 📚 関連ファイル

### 既存実装ファイル

| ファイルパス | 説明 | 参考ポイント |
|------------|------|------------|
| `src/layouts/BaseLayout.astro` | 基本レイアウト | TypeScript型定義、セマンティックHTML、Tailwindクラス |
| `src/styles/global.css` | グローバルスタイル | CSS変数、ダークモード、アクセシビリティスタイル |
| `tsconfig.json` | TypeScript設定 | strict mode、パスエイリアス |
| `biome.json` | Biome設定 | コーディング規約 |
| `astro.config.mjs` | Astro設定 | Tailwind統合、Markdown設定 |

### 設計文書

| ファイルパス | 説明 |
|------------|------|
| `docs/design/blog-article-management/architecture.md` | アーキテクチャ設計 |
| `docs/spec/blog-article-management/requirements.md` | 要件定義書（EARS記法） |
| `docs/tasks/blog-article-management/overview.md` | タスク概要・依存関係 |

### 設定ファイル

| ファイルパス | 説明 |
|------------|------|
| `package.json` | 依存関係・スクリプト定義 |
| `tsconfig.json` | TypeScript設定 |
| `biome.json` | Biome（リント・フォーマット）設定 |
| `astro.config.mjs` | Astro設定 |
| `tailwind.config.mjs` | Tailwind CSS設定（存在する場合） |

---

## 🔗 依存関係

### 前提タスク

- **TASK-0001**: Content Collections設定とスキーマ定義 ✅ 完了
- **TASK-0002**: ディレクトリ構造とプロジェクト初期化 ✅ 完了
- **TASK-0003**: 基本レイアウトの実装（BaseLayout.astro） - 実装中/完了

### 後続タスク

- **TASK-0005**: ダークモード切り替え機能の実装（ThemeToggleコンポーネント）
- **TASK-0011**: 記事一覧ページ（トップページ）の実装
- **TASK-0014**: 記事詳細ページの実装

---

## 📝 実装チェックリスト

### Header.astro

- [ ] TypeScript型定義（`interface Props`）を実装
- [ ] セマンティックHTML（`<header>`, `<nav>`）を使用
- [ ] ナビゲーションメニュー実装（ホーム、ブログ、タグ、検索、RSS）
- [ ] ARIAラベル設定（`aria-label`, `aria-current`）
- [ ] キーボードナビゲーション対応（Tab, Enter, Space）
- [ ] フォーカス可視化スタイル適用
- [ ] ダークモード対応スタイル（Tailwind `dark:`）
- [ ] レスポンシブデザイン（モバイルメニュー）
- [ ] 単体テスト実装（Header.test.ts）

### Footer.astro

- [ ] TypeScript型定義（`interface Props`）を実装
- [ ] セマンティックHTML（`<footer>`）を使用
- [ ] コピーライト表記実装
- [ ] RSSフィードリンク実装
- [ ] ARIAラベル設定
- [ ] ダークモード対応スタイル
- [ ] 単体テスト実装（Footer.test.ts）

### テスト

- [ ] Header: コンポーネントレンダリングテスト
- [ ] Header: Props反映テスト
- [ ] Header: アクセシビリティ属性テスト
- [ ] Header: ダークモードスタイルテスト
- [ ] Footer: コンポーネントレンダリングテスト
- [ ] Footer: Props反映テスト
- [ ] Footer: アクセシビリティ属性テスト
- [ ] `pnpm test` がすべて通る
- [ ] `pnpm check` が型エラーなく通る
- [ ] `pnpm lint` がエラーなく通る

---

## 🎯 成功基準

### 機能要件

- [x] ヘッダーコンポーネントが実装されている
- [x] フッターコンポーネントが実装されている
- [x] ナビゲーションメニューが正しく動作する
- [x] レスポンシブデザインが実装されている

### 非機能要件

- [x] WCAG 2.1 AA準拠（セマンティックHTML、ARIA、キーボードナビゲーション）
- [x] ダークモード対応
- [x] TypeScript strict mode準拠
- [x] Biome（リント・フォーマット）準拠
- [x] 単体テストカバレッジ80%以上

### 品質基準

- [x] `pnpm astro check` がエラーなく通る
- [x] `pnpm test` がエラーなく通る
- [x] `pnpm lint` がエラーなく通る
- [x] コードに適切なコメント・JSDocが記載されている
- [x] 要件トレーサビリティ（関連要件がコメントに記載されている）

---

## 📊 信頼性レベルサマリー

このタスクノートの信頼性レベル分布:

- 🔵 **青信号**: 95% (設計文書・要件定義書から確実に導出)
- 🟡 **黄信号**: 5% (妥当な推測)
- 🔴 **赤信号**: 0%

**品質評価**: 高品質 - 設計文書と要件定義書から大部分の仕様が確定

---

**最終更新日**: 2025-12-31
**作成者**: Claude Sonnet 4.5 (TDD開発エージェント)
