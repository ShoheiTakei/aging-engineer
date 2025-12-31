# TASK-0005: ダークモード切り替え機能の実装 - タスクノート

**作成日**: 2025-12-31
**タスクタイプ**: TDD
**見積もり工数**: 6時間
**優先度**: P1

---

## 概要

TASK-0005「ダークモード切り替え機能の実装」の開発に必要なコンテキスト情報を整理したタスクノートです。

**タスク概要**:
- ThemeToggleコンポーネント (`src/components/ThemeToggle.astro`) の実装
- localStorage連携によるユーザー設定の永続化
- システム設定（`prefers-color-scheme`）との連携
- BaseLayout.astroへのテーマ初期化スクリプト追加

**関連要件**: tech-stack.md（ダークモードデフォルト）
**依存タスク**: TASK-0004（ヘッダー・フッターコンポーネント）- 完了済み

---

## 1. 技術スタック

### フレームワーク・ライブラリ

| 技術 | バージョン | 用途 | 備考 |
|------|-----------|------|------|
| **Astro** | 5.1.3 | UIフレームワーク | Islands Architecture採用 |
| **TypeScript** | 5.7+ | 型安全な開発 | strict mode有効 |
| **Tailwind CSS** | 4.0+ | スタイリング | `darkMode: 'class'`設定 |
| **happy-dom** | 20.0.11 | テストランタイム | Astroコンポーネントテスト用 |
| **vitest** | 2.1.8 | テストフレームワーク | 単体テスト実行 |

### アーキテクチャパターン

**Islands Architecture + Static Site Generation (SSG)**
- ゼロJavaScriptデフォルト（最高のパフォーマンス）
- **例外**: ThemeToggleはクライアントサイドJavaScript必須（インタラクション）
- ビルド時に全ページを静的HTML生成
- テーマ切り替えは`<script>`タグでクライアントサイド実装

### ダークモード実装方式

**tech-stack.mdより**:
- **デフォルトテーマ**: ダークモード
- **切り替え方式**: `<html>`タグの`dark`クラスをトグル
- **永続化**: `localStorage`にユーザー設定を保存
- **初期読み込み**: フラッシュ防止のため`<head>`内でインラインスクリプト実行
- **Tailwind設定**: `darkMode: 'class'`を使用

**参照元**: `docs/tech-stack.md`

---

## 2. 開発ルール

### コーディング規約

#### TypeScript

- **strict mode必須**: `tsconfig.json`で`"strict": true`設定済み
- **型推論の活用**: 可能な限り明示的な型定義より型推論を使用
- **パスエイリアス**: `@/components`, `@layouts`, `@utils` 使用可能

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
feat: ThemeToggleコンポーネントを実装
test: ダークモード切り替えのテストを追加
fix: テーマ初期化のフラッシュ問題を修正
```

**ブランチ命名**:
- `feat/機能名`: 機能追加
- `fix/修正内容`: バグ修正

### テスト要件

#### 単体テスト (Vitest)

**必須テストケース**:
1. コンポーネントが正しくレンダリングされる
2. トグルボタンにARIAラベルが設定されている
3. ダークモード用アイコン・ライトモード用アイコンが切り替わる
4. localStorageへの設定保存が正しく動作する
5. システム設定（`prefers-color-scheme`）を尊重する

**テストファイル配置**:
```
src/
├── components/
│   ├── ThemeToggle.astro
│   └── ThemeToggle.test.ts    # 単体テスト
├── layouts/
│   ├── BaseLayout.astro
│   └── BaseLayout.test.ts     # 既存テスト
```

**テスト実行コマンド**:
- `pnpm test`: テスト実行
- `pnpm test:watch`: ウォッチモードでテスト実行

**参照元**: `docs/implements/blog-article-management/TASK-0004/note.md`

---

## 3. 関連実装

### BaseLayout.astro（統合先）

**場所**: `src/layouts/BaseLayout.astro`

**現状の実装**:
```astro
---
interface Props {
  title: string;
  description: string;
  ogUrl?: string;
  ogType?: 'website' | 'article';
}

const { title, description, ogUrl, ogType = 'website' } = Astro.props;
---

<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <!-- OGPメタタグ省略 -->
  </head>
  <body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
    <main class="min-h-screen">
      <slot />
    </main>
  </body>
</html>
```

**必要な変更**:
1. `<head>`内にテーマ初期化インラインスクリプトを追加
2. ThemeToggleコンポーネントをHeader内に配置（Header.astroの変更が必要）

**参照元**: `src/layouts/BaseLayout.astro`

### Header.astro（ThemeToggle統合先）

**場所**: `src/components/Header.astro`

ThemeToggleコンポーネントをヘッダーのナビゲーション内に配置する必要があります。

**必要な変更**:
- `<ThemeToggle />`コンポーネントをインポートして配置
- レイアウト調整（フレックスボックスでスペース確保）

**参照元**: `src/components/Header.astro`

### グローバルスタイル（CSS変数定義済み）

**場所**: `src/styles/global.css`

**ダークモード関連のCSS変数**:
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
    /* ダークモードカラー (tech-stack.md: ダークモードデフォルト) */
    --color-primary: 96 165 250; /* blue-400 */
    --color-secondary: 156 163 175; /* gray-400 */
    --color-background: 17 24 39; /* gray-900 */
    --color-text: 243 244 246; /* gray-100 */
  }
}
```

**参照元**: `src/styles/global.css`

### 既存テストパターン（参考実装）

**場所**: `src/components/Header.test.ts`

**テスト構成**:
```typescript
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeEach, describe, expect, it } from 'vitest';
import Header from './Header.astro';

describe('Header.astro', () => {
  let container: AstroContainer;

  beforeEach(async () => {
    container = await AstroContainer.create();
  });

  describe('正常系テストケース', () => {
    // テストケース...
  });

  describe('異常系・境界値テストケース', () => {
    // テストケース...
  });

  describe('アクセシビリティテストケース', () => {
    // テストケース...
  });

  describe('スタイリングテストケース', () => {
    // テストケース...
  });
});
```

**参照元**: `src/components/Header.test.ts`

---

## 4. 設計文書

### ThemeToggle.astro 設計仕様

**tech-stack.mdに基づく実装方針**:

```astro
---
/**
 * ThemeToggle - ダークモード切り替えボタン
 *
 * 機能:
 * - ダーク/ライトモードの切り替え
 * - localStorageへの設定永続化
 * - システム設定（prefers-color-scheme）の尊重
 *
 * 関連要件:
 * - tech-stack.md: ダークモードデフォルト
 * - NFR-302: キーボードナビゲーション対応
 * - NFR-303: ARIAラベル設定
 * - NFR-304: フォーカス可視化
 */
---

<button
  id="theme-toggle"
  type="button"
  aria-label="テーマを切り替える"
  class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
>
  <!-- 太陽アイコン（ライトモード時に表示、ダークモードへ切り替え） -->
  <svg class="w-6 h-6 hidden dark:block" fill="currentColor" viewBox="0 0 20 20">
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
  </svg>
  <!-- 月アイコン（ダークモード時に表示、ライトモードへ切り替え） -->
  <svg class="w-6 h-6 block dark:hidden" fill="currentColor" viewBox="0 0 20 20">
    <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
  </svg>
</button>

<script>
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  themeToggle?.addEventListener('click', () => {
    const isDark = html.classList.contains('dark');
    if (isDark) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  });
</script>
```

### テーマ初期化スクリプト（BaseLayoutに追加）

**フラッシュ防止のためのインラインスクリプト**:

```astro
<head>
  <!-- 既存のメタタグ -->

  <!-- テーマ初期化（フラッシュ防止） -->
  <script is:inline>
    (function() {
      // localStorageから保存されたテーマを取得
      const savedTheme = localStorage.getItem('theme');

      if (savedTheme) {
        // 保存されたテーマがあれば適用
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      } else {
        // 保存されたテーマがなければデフォルトでダークモード
        // tech-stack.md: ダークモードがデフォルト
        document.documentElement.classList.add('dark');
      }
    })();
  </script>
</head>
```

**注意**: `is:inline`ディレクティブを使用してAstroのビルド時最適化をバイパスし、HTMLに直接インライン化

**参照元**: `docs/tech-stack.md`

---

## 5. 注意事項

### 技術的制約

#### フラッシュ防止（FOUC）

- テーマ初期化スクリプトは`<head>`内で`is:inline`として実行
- DOMContentLoaded前にテーマを適用
- localStorageアクセスは同期的に行う

#### Tailwind CSS 4.0 ダークモード設定

Tailwind CSS 4.0では設定方法が変更されています:

```javascript
// tailwind.config.mjs（必要な場合）
export default {
  darkMode: 'class', // classベースのダークモード
  // ...
}
```

**注意**: Tailwind CSS 4.0ではconfigファイルなしでもデフォルトで`darkMode: 'media'`が使用されます。`class`ベースに変更する場合は設定が必要です。

#### JavaScriptが無効な環境

- デフォルトでダークモードを適用（`<html class="dark">`をサーバーサイドで設定）
- JavaScriptが無効でもダークモードで表示される
- 切り替え機能は利用不可だが、表示は正常

### アクセシビリティ要件（WCAG 2.1 AA準拠）

#### NFR-302: キーボードナビゲーション

```html
<!-- ボタンはデフォルトでフォーカス可能 -->
<button id="theme-toggle" type="button">
  <!-- Tabキーでフォーカス、Enter/Spaceで操作 -->
</button>
```

#### NFR-303: ARIAラベル

```html
<button aria-label="テーマを切り替える">
  <!-- アイコンのみのボタンにはaria-labelが必須 -->
</button>
```

#### NFR-304: フォーカス可視化

```html
<button class="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
  <!-- キーボードフォーカス時に視覚的なフィードバック -->
</button>
```

### パフォーマンス要件

#### NFR-001: Lighthouse 90+点

- ThemeToggleのJavaScriptは最小限に保つ
- インラインスクリプトで外部ファイル読み込みを回避
- 切り替えロジックは軽量に実装

### テスト時の注意点

#### localStorageのモック

テスト環境でlocalStorageをモックする必要があります:

```typescript
// vitest.setup.ts または各テストファイル内
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

#### prefers-color-schemeのモック

```typescript
// システム設定のモック
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation((query) => ({
    matches: query === '(prefers-color-scheme: dark)',
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
  })),
});
```

**参照元**: `src/components/Header.test.ts`, `docs/implements/blog-article-management/TASK-0004/note.md`

---

## 6. 関連ファイル

### 既存実装ファイル

| ファイルパス | 説明 | 参考ポイント |
|------------|------|------------|
| `src/layouts/BaseLayout.astro` | 基本レイアウト | テーマ初期化スクリプト追加先 |
| `src/components/Header.astro` | ヘッダーコンポーネント | ThemeToggle配置先 |
| `src/components/Footer.astro` | フッターコンポーネント | ダークモードスタイル参考 |
| `src/styles/global.css` | グローバルスタイル | CSS変数、ダークモードスタイル |
| `src/components/Header.test.ts` | Headerテスト | テストパターン参考 |
| `src/components/Footer.test.ts` | Footerテスト | テストパターン参考 |

### 設計文書

| ファイルパス | 説明 |
|------------|------|
| `docs/tech-stack.md` | 技術スタック（ダークモード実装方針） |
| `docs/implements/blog-article-management/TASK-0004/note.md` | TASK-0004タスクノート |

### 設定ファイル

| ファイルパス | 説明 |
|------------|------|
| `package.json` | 依存関係・スクリプト定義 |
| `tsconfig.json` | TypeScript設定 |
| `biome.json` | Biome（リント・フォーマット）設定 |
| `astro.config.mjs` | Astro設定 |

---

## 7. 依存関係

### 前提タスク

- **TASK-0001**: Content Collections設定とスキーマ定義 - 完了
- **TASK-0002**: ディレクトリ構造とプロジェクト初期化 - 完了
- **TASK-0003**: 基本レイアウトの実装（BaseLayout.astro）- 完了
- **TASK-0004**: ヘッダー・フッターコンポーネントの実装 - 完了

### 後続タスク

- **TASK-0011**: 記事一覧ページ（トップページ）の実装
- **TASK-0014**: 記事詳細ページの実装
- その他のページ実装タスク（すべてでダークモードが適用される）

---

## 8. 実装チェックリスト

### ThemeToggle.astro

- [ ] TypeScript型定義（Props不要の場合はスキップ）
- [ ] ボタン要素の実装
- [ ] aria-label設定（「テーマを切り替える」）
- [ ] ダークモード用アイコン（月アイコン）
- [ ] ライトモード用アイコン（太陽アイコン）
- [ ] `dark:`クラスによるアイコン切り替え
- [ ] フォーカス可視化スタイル適用
- [ ] ホバースタイル適用
- [ ] クリックイベントハンドラー実装
- [ ] localStorage連携（読み取り・書き込み）

### BaseLayout.astro 変更

- [ ] テーマ初期化インラインスクリプト追加
- [ ] `is:inline`ディレクティブ使用
- [ ] デフォルトダークモード設定
- [ ] localStorage確認ロジック

### Header.astro 変更

- [ ] ThemeToggleコンポーネントのインポート
- [ ] 適切な位置への配置
- [ ] レイアウト調整

### テスト

- [ ] ThemeToggle: コンポーネントレンダリングテスト
- [ ] ThemeToggle: ボタン要素の存在確認
- [ ] ThemeToggle: aria-label設定確認
- [ ] ThemeToggle: アイコン切り替えクラス確認
- [ ] ThemeToggle: フォーカススタイル確認
- [ ] BaseLayout: テーマ初期化スクリプト存在確認
- [ ] `pnpm test` がすべて通る
- [ ] `pnpm check` が型エラーなく通る
- [ ] `pnpm lint` がエラーなく通る

---

## 9. 成功基準

### 機能要件

- [ ] ThemeToggleコンポーネントが実装されている
- [ ] クリックでダーク/ライトモードが切り替わる
- [ ] 設定がlocalStorageに保存される
- [ ] ページリロード後も設定が維持される
- [ ] デフォルトでダークモードが適用される
- [ ] テーマ切り替え時にフラッシュが発生しない

### 非機能要件

- [ ] WCAG 2.1 AA準拠（キーボードナビゲーション、ARIA、フォーカス可視化）
- [ ] Lighthouse 90+点維持
- [ ] TypeScript strict mode準拠
- [ ] Biome（リント・フォーマット）準拠

### 品質基準

- [ ] `pnpm astro check` がエラーなく通る
- [ ] `pnpm test` がエラーなく通る
- [ ] `pnpm lint` がエラーなく通る
- [ ] コードに適切なコメント・JSDocが記載されている
- [ ] 要件トレーサビリティ（関連要件がコメントに記載されている）

---

## 10. 信頼性レベルサマリー

このタスクノートの信頼性レベル分布:

- 🔵 **青信号**: 90% (tech-stack.md・設計文書から確実に導出)
- 🟡 **黄信号**: 10% (実装詳細の妥当な推測)
- 🔴 **赤信号**: 0%

**品質評価**: 高品質 - tech-stack.mdに詳細な実装方針が記載されており、大部分の仕様が確定

---

**最終更新日**: 2025-12-31
**作成者**: Claude Opus 4.5 (TDD開発エージェント)
