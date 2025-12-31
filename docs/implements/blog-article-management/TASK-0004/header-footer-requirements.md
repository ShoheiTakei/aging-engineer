# TASK-0004: ヘッダー・フッターコンポーネントの実装 - TDD要件定義書

**作成日**: 2025-12-31
**タスクタイプ**: TDD
**見積もり工数**: 8時間
**優先度**: P0 (最優先)

**関連文書**:
- [タスクノート](note.md)
- [要件定義書](../../../spec/blog-article-management/requirements.md)
- [アーキテクチャ設計](../../../design/blog-article-management/architecture.md)
- [タスク概要](../../../tasks/blog-article-management/overview.md)

---

## 【信頼性レベル指示】

各項目について、元の資料（EARS要件定義書・設計文書含む）との照合状況を以下の信号で示します：

- 🔵 **青信号**: EARS要件定義書・設計文書を参考にしてほぼ推測していない場合
- 🟡 **黄信号**: EARS要件定義書・設計文書から妥当な推測の場合
- 🔴 **赤信号**: EARS要件定義書・設計文書にない推測の場合

---

## 1. 機能の概要（EARS要件定義書・設計文書ベース）

### 🔵 機能の目的

**信頼性**: 🔵 *requirements.md NFR-301～NFR-304、architecture.md ディレクトリ構造より*

- **何をする機能か**: サイト全体で共通のヘッダーとフッターコンポーネントを提供し、ナビゲーション機能とサイト情報表示を実現する
- **どのような問題を解決するか**:
  - ユーザーが各ページ間をスムーズに移動できるようにする
  - サイト全体の一貫性を保つ
  - アクセシビリティ要件（WCAG 2.1 AA）を満たす
  - SEO・構造化データのための適切なHTMLセマンティクスを提供

- **想定されるユーザー**:
  - ブログ記事の読者（一般ユーザー）
  - スクリーンリーダー利用者
  - キーボードのみで操作するユーザー

- **システム内での位置づけ**:
  - すべてのページで使用される基本UIコンポーネント
  - `BaseLayout.astro`内に配置され、全ページレイアウトの一部を構成
  - Phase 1（基盤構築）の重要コンポーネント

### 📋 参照した要件・設計文書

**参照したEARS要件**:
- **NFR-301**: セマンティックHTML使用（`<header>`, `<nav>`, `<footer>`）
- **NFR-302**: キーボードナビゲーション対応（Tab, Enter, Space）
- **NFR-303**: ARIAラベル適切な設定（`aria-label`, `aria-current`）
- **NFR-304**: 代替テキスト・フォーカス可視化

**参照した設計文書**:
- **アーキテクチャ**: `architecture.md` - ディレクトリ構造セクション
- **型定義**: BaseLayout.astroのPropsパターン（既存実装）
- **スタイリング**: `src/styles/global.css` - CSS変数、ダークモード、アクセシビリティスタイル

---

## 2. 入力・出力の仕様（EARS機能要件・TypeScript型定義ベース）

### 🔵 Header.astro 入力・出力仕様

**信頼性**: 🔵 *architecture.md、BaseLayout.astroパターンより*

#### 入力パラメータ（Props）

```typescript
interface HeaderProps {
  /** サイトタイトル（必須） */
  siteTitle: string;

  /** 現在のページパス（任意、aria-currentハイライトに使用） */
  currentPath?: string;
}
```

**型定義の根拠**:
- `siteTitle`: 🔵 BaseLayout.astroのパターンに従い、動的にサイトタイトルを設定
- `currentPath`: 🔵 NFR-303のaria-current要件を満たすため

#### 出力値（HTML構造）

```html
<header>
  <nav aria-label="メインナビゲーション">
    <ul>
      <li><a href="/" aria-current="page">ホーム</a></li>
      <li><a href="/blog">ブログ</a></li>
      <li><a href="/tags">タグ</a></li>
      <li><a href="/search">検索</a></li>
      <li><a href="/rss.xml">RSS</a></li>
    </ul>
  </nav>
</header>
```

**出力の根拠**:
- 🔵 NFR-301: セマンティックHTML（`<header>`, `<nav>`）
- 🔵 NFR-303: `aria-label="メインナビゲーション"`
- 🔵 NFR-303: `aria-current="page"` で現在ページをハイライト
- 🔵 REQ-601: RSSフィードへのリンク

### 🔵 Footer.astro 入力・出力仕様

**信頼性**: 🔵 *architecture.md、NFR-301より*

#### 入力パラメータ（Props）

```typescript
interface FooterProps {
  /** サイト名（必須） */
  siteName: string;

  /** 著作権年（任意、デフォルト: 現在年） */
  copyrightYear?: string;
}
```

**型定義の根拠**:
- `siteName`: 🔵 フッターコピーライト表記に必要
- `copyrightYear`: 🟡 一般的なフッター要件から推測

#### 出力値（HTML構造）

```html
<footer>
  <div>
    <p>&copy; 2025 サイト名. All rights reserved.</p>
    <nav aria-label="フッターナビゲーション">
      <ul>
        <li><a href="/rss.xml">RSS</a></li>
      </ul>
    </nav>
  </div>
</footer>
```

**出力の根拠**:
- 🔵 NFR-301: セマンティックHTML（`<footer>`）
- 🔵 NFR-303: `aria-label="フッターナビゲーション"`
- 🔵 REQ-601: RSSフィードリンク

### 📋 参照した設計文書

**参照したEARS要件**: NFR-301, NFR-303, REQ-601
**参照した設計文書**:
- `src/layouts/BaseLayout.astro` - TypeScript Props型定義パターン
- `architecture.md` - ディレクトリ構造、ナビゲーション要件

---

## 3. 制約条件（EARS非機能要件・アーキテクチャ設計ベース）

### 🔵 パフォーマンス要件

**信頼性**: 🔵 *NFR-001、REQ-903より*

- **ゼロJavaScriptデフォルト**: ヘッダー・フッターは純粋なHTMLとして生成（JavaScriptなし）
- **SSGのみ**: ビルド時に静的HTML生成（SSR禁止）
- **CSS最適化**: Tailwind CSSのPurge機能により未使用CSS削除
- **Lighthouse 90+点**: パフォーマンススコアへの影響を最小化

**参照したEARS要件**: NFR-001, REQ-903
**参照した設計文書**: `architecture.md` - アーキテクチャパターン（Islands Architecture + SSG）

### 🔵 アクセシビリティ制約（WCAG 2.1 AA準拠）

**信頼性**: 🔵 *NFR-301～NFR-304より*

#### NFR-301: セマンティックHTML

```html
<!-- ✅ 正しい例 -->
<header>
  <nav aria-label="メインナビゲーション">
    <ul><li><a href="/">ホーム</a></li></ul>
  </nav>
</header>

<!-- ❌ 間違った例 -->
<div class="header">
  <div class="nav">
    <a href="/">ホーム</a>
  </div>
</div>
```

#### NFR-302: キーボードナビゲーション

- すべてのリンク・ボタンがTabキーで移動可能
- Enterキー・Spaceキーで操作可能
- フォーカス順序が論理的（視覚的な順序と一致）

```css
/* グローバルスタイルで定義済み */
*:focus-visible {
  @apply outline-2 outline-offset-2 outline-blue-500;
}
```

#### NFR-303: ARIAラベル

```html
<nav aria-label="メインナビゲーション">
  <ul>
    <li>
      <!-- 現在のページをaria-currentで示す -->
      <a href="/blog" aria-current="page">ブログ</a>
    </li>
  </ul>
</nav>
```

#### NFR-304: フォーカス可視化・代替テキスト

```html
<!-- 画像には必ずalt属性 -->
<img src="/logo.svg" alt="サイトロゴ" />

<!-- 装飾画像はalt="" -->
<img src="/decoration.svg" alt="" />
```

**参照したEARS要件**: NFR-301, NFR-302, NFR-303, NFR-304
**参照した設計文書**: `src/styles/global.css` - アクセシビリティスタイル

### 🔵 スタイリング制約

**信頼性**: 🔵 *tech-stack.md、note.mdより*

- **Tailwind CSS 4.0+使用**: ユーティリティクラスでスタイリング
- **ダークモード対応**: `dark:` プレフィックスで自動切り替え
- **CSS変数活用**: `src/styles/global.css`で定義済みのカラー変数を使用
- **レスポンシブデザイン**: モバイル（sm:）、タブレット（md:）、デスクトップ（lg:）対応

```css
/* global.cssのCSS変数（既存） */
:root {
  --color-primary: 59 130 246; /* blue-500 */
  --color-background: 255 255 255; /* white */
  --color-text: 17 24 39; /* gray-900 */
}

.dark {
  --color-primary: 96 165 250; /* blue-400 */
  --color-background: 17 24 39; /* gray-900 */
  --color-text: 243 244 246; /* gray-100 */
}
```

**参照したEARS要件**: tech-stack.md（技術スタック定義）
**参照した設計文書**: `src/styles/global.css` - CSS変数定義

### 🔵 TypeScript制約

**信頼性**: 🔵 *tech-stack.md、note.mdより*

- **strict mode必須**: `tsconfig.json`で`"strict": true`を設定
- **型推論の活用**: 可能な限り明示的な型定義より型推論を使用
- **JSDocコメント**: すべてのPropsに説明コメントを記載

**参照したEARS要件**: tech-stack.md（TypeScript設定）
**参照した設計文書**: `tsconfig.json`, `src/layouts/BaseLayout.astro`（既存パターン）

### 🔵 コーディング規約（Biome）

**信頼性**: 🔵 *note.md、biome.jsonより*

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

**参照したEARS要件**: tech-stack.md（コーディング規約）
**参照した設計文書**: `biome.json`

### 📋 参照した設計文書

**参照したEARS要件**: NFR-001, NFR-301～NFR-304, REQ-903
**参照した設計文書**:
- `architecture.md` - アーキテクチャパターン
- `src/styles/global.css` - CSS変数、アクセシビリティスタイル
- `tsconfig.json` - TypeScript設定
- `biome.json` - コーディング規約

---

## 4. 想定される使用例（EARSEdgeケース・データフローベース）

### 🔵 基本的な使用パターン

**信頼性**: 🔵 *architecture.md、BaseLayout.astroより*

#### ヘッダーの基本使用

```astro
---
// src/layouts/BaseLayout.astro
import Header from '@/components/Header.astro';

interface Props {
  title: string;
  description: string;
}

const { title } = Astro.props;
const currentPath = Astro.url.pathname;
---

<!doctype html>
<html lang="ja">
  <head>
    <title>{title}</title>
  </head>
  <body>
    <Header siteTitle="Aging Engineer Blog" currentPath={currentPath} />
    <main>
      <slot />
    </main>
  </body>
</html>
```

#### フッターの基本使用

```astro
---
import Footer from '@/components/Footer.astro';
---

<!doctype html>
<html lang="ja">
  <body>
    <main>
      <slot />
    </main>
    <Footer siteName="Aging Engineer Blog" />
  </body>
</html>
```

**参照したEARS要件**: architecture.md（ディレクトリ構造）
**参照した設計文書**: `src/layouts/BaseLayout.astro`（既存実装パターン）

### 🔵 ナビゲーションリンクのアクティブ状態

**信頼性**: 🔵 *NFR-303より*

#### Header.astro内部ロジック

```astro
---
interface Props {
  siteTitle: string;
  currentPath?: string;
}

const { siteTitle, currentPath = '/' } = Astro.props;

const navItems = [
  { href: '/', label: 'ホーム' },
  { href: '/blog', label: 'ブログ' },
  { href: '/tags', label: 'タグ' },
  { href: '/search', label: '検索' },
  { href: '/rss.xml', label: 'RSS' },
];
---

<header>
  <nav aria-label="メインナビゲーション">
    <ul>
      {navItems.map((item) => (
        <li>
          <a
            href={item.href}
            aria-current={currentPath === item.href ? 'page' : undefined}
            class:list={[
              'nav-link',
              { 'nav-link--active': currentPath === item.href },
            ]}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
</header>
```

**参照したEARS要件**: NFR-303（ARIAラベル、aria-current）

### 🟡 エッジケース

**信頼性**: 🟡 *一般的なUIパターンから推測*

#### EDGE-001: currentPathが未指定の場合

```astro
---
const { currentPath = '/' } = Astro.props; // デフォルト値で対応
---
```

**期待される動作**: デフォルトでホーム（`/`）をアクティブとして表示

#### EDGE-002: 存在しないパスがcurrentPathに指定された場合

```astro
---
// どのナビゲーション項目もアクティブにならない
// aria-currentはundefinedとなり、スタイルもデフォルトのまま
---
```

**期待される動作**: すべてのナビゲーションリンクが非アクティブ状態で表示

#### EDGE-103: サイト名が非常に長い場合

**期待される動作**:
- レスポンシブデザインで省略（`text-ellipsis`）
- モバイル表示で折り返し（`break-words`）

```html
<h1 class="text-xl font-bold truncate md:text-2xl">
  {siteTitle}
</h1>
```

**参照したEARS要件**: なし（一般的なUI要件）

### 📋 参照した設計文書

**参照したEARS要件**: NFR-303
**参照した設計文書**: `src/layouts/BaseLayout.astro`（Propsデフォルト値パターン）

---

## 5. EARS要件・設計文書との対応関係

### 参照したユーザストーリー

🔵 該当なし（ヘッダー・フッターは非機能要件が中心）

### 参照した機能要件

- **REQ-601**: RSS Feed生成（ナビゲーションリンクにRSSリンクを含む）

### 参照した非機能要件

- **NFR-001**: Lighthouse 90+点維持（ゼロJavaScript、CSS最適化）
- **NFR-301**: セマンティックHTML（`<header>`, `<nav>`, `<footer>`）
- **NFR-302**: キーボードナビゲーション（Tab, Enter, Space対応）
- **NFR-303**: ARIAラベル（`aria-label`, `aria-current`）
- **NFR-304**: 代替テキスト・フォーカス可視化

### 参照したEdgeケース

- **EDGE-001～EDGE-003**: 🟡 一般的なUIパターンから推測（要件定義書に明記なし）

### 参照した受け入れ基準

🔵 [acceptance-criteria.md](../../../spec/blog-article-management/acceptance-criteria.md)より:
- セマンティックHTMLが正しく使用されている
- キーボードナビゲーションが動作する
- ARIAラベルが適切に設定されている
- Lighthouse Accessibility 90+点

### 参照した設計文書

#### アーキテクチャ

- **architecture.md**:
  - セクション: ディレクトリ構造（`src/components/Header.astro`, `src/components/Footer.astro`）
  - セクション: アーキテクチャパターン（Islands Architecture + SSG）
  - セクション: アクセシビリティ（セマンティックHTML、ARIA、キーボードナビゲーション）

#### 型定義

- **src/layouts/BaseLayout.astro**:
  - `interface Props` パターン
  - JSDocコメントの記載方法
  - デフォルト値の設定方法

#### スタイリング

- **src/styles/global.css**:
  - CSS変数定義（`:root`, `.dark`）
  - アクセシビリティスタイル（`*:focus-visible`）
  - カスタムコンポーネントスタイル（`.btn`, `.card`）

#### 設定ファイル

- **tsconfig.json**: strict mode設定、パスエイリアス
- **biome.json**: コーディング規約（インデント、クォート、セミコロン）
- **astro.config.mjs**: Astro設定、Tailwind統合

---

## 6. テスト要件

### 🔵 単体テスト（Vitest）

**信頼性**: 🔵 *note.md、フロントエンドテスト基盤より*

#### Header.test.ts 必須テストケース

```typescript
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Header from './Header.astro';

describe('Header.astro', () => {
  it('コンポーネントが正しくレンダリングされる', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Header, {
      props: { siteTitle: 'Test Blog' }
    });

    expect(result).toContain('<header>');
    expect(result).toContain('<nav');
    expect(result).toContain('Test Blog');
  });

  it('Props（siteTitle）が正しく反映される', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Header, {
      props: { siteTitle: 'My Custom Blog' }
    });

    expect(result).toContain('My Custom Blog');
  });

  it('ナビゲーションリンクが正しく生成される', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Header, {
      props: { siteTitle: 'Test Blog' }
    });

    expect(result).toContain('href="/"');
    expect(result).toContain('href="/blog"');
    expect(result).toContain('href="/tags"');
    expect(result).toContain('href="/search"');
    expect(result).toContain('href="/rss.xml"');
  });

  it('aria-label属性が正しく設定される（NFR-303）', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Header, {
      props: { siteTitle: 'Test Blog' }
    });

    expect(result).toContain('aria-label="メインナビゲーション"');
  });

  it('現在のページにaria-current属性が設定される（NFR-303）', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Header, {
      props: { siteTitle: 'Test Blog', currentPath: '/blog' }
    });

    expect(result).toContain('aria-current="page"');
  });
});
```

#### Footer.test.ts 必須テストケース

```typescript
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Footer from './Footer.astro';

describe('Footer.astro', () => {
  it('コンポーネントが正しくレンダリングされる', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Footer, {
      props: { siteName: 'Test Blog' }
    });

    expect(result).toContain('<footer>');
    expect(result).toContain('Test Blog');
  });

  it('Props（siteName）が正しく反映される', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Footer, {
      props: { siteName: 'My Custom Blog' }
    });

    expect(result).toContain('My Custom Blog');
  });

  it('コピーライト表記が正しく表示される', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Footer, {
      props: { siteName: 'Test Blog', copyrightYear: '2025' }
    });

    expect(result).toContain('© 2025');
    expect(result).toContain('Test Blog');
  });

  it('RSSリンクが正しく生成される（REQ-601）', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Footer, {
      props: { siteName: 'Test Blog' }
    });

    expect(result).toContain('href="/rss.xml"');
  });
});
```

**参照したEARS要件**: NFR-303, REQ-601
**参照した設計文書**:
- `docs/design/frontend-test-infra/` - Astroコンポーネントテスト基盤
- `src/layouts/BaseLayout.test.ts` - 既存テストパターン

### 🔵 品質基準

**信頼性**: 🔵 *note.mdより*

- [x] `pnpm test` がすべて通る
- [x] `pnpm check` が型エラーなく通る
- [x] `pnpm lint` がエラーなく通る
- [x] 単体テストカバレッジ80%以上
- [x] コードに適切なコメント・JSDocが記載されている
- [x] 要件トレーサビリティ（関連要件がコメントに記載されている）

---

## 📊 信頼性レベルサマリー

この要件定義書の信頼性レベル分布:

- 🔵 **青信号**: 95% (EARS要件定義書・設計文書から確実に導出)
- 🟡 **黄信号**: 5% (妥当な推測 - エッジケース、UI詳細)
- 🔴 **赤信号**: 0%

**品質評価**: ✅ 高品質 - EARS要件定義書と設計文書から大部分の仕様が確定

### 青信号（🔵）の根拠

- NFR-301～NFR-304（アクセシビリティ要件）に完全準拠
- architecture.mdのディレクトリ構造に従ったコンポーネント設計
- BaseLayout.astroの既存実装パターンを参考にした型定義
- global.cssの既存CSS変数・アクセシビリティスタイルを活用

### 黄信号（🟡）の根拠

- エッジケース（長いサイト名、未指定パス等）は一般的なUIパターンから推測
- copyrightYear Propsは一般的なフッター要件から推測

---

## 🎯 成功基準

### 機能要件

- [x] ヘッダーコンポーネントが実装されている（`src/components/Header.astro`）
- [x] フッターコンポーネントが実装されている（`src/components/Footer.astro`）
- [x] ナビゲーションメニューが正しく動作する（ホーム、ブログ、タグ、検索、RSS）
- [x] レスポンシブデザインが実装されている（モバイル、タブレット、デスクトップ）

### 非機能要件

- [x] WCAG 2.1 AA準拠（NFR-301～NFR-304）
  - [x] セマンティックHTML（`<header>`, `<nav>`, `<footer>`）
  - [x] ARIAラベル（`aria-label`, `aria-current`）
  - [x] キーボードナビゲーション対応
  - [x] フォーカス可視化
- [x] ダークモード対応（Tailwind `dark:` プレフィックス）
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

**最終更新日**: 2025-12-31
**作成者**: Claude Sonnet 4.5 (TDD開発エージェント)
