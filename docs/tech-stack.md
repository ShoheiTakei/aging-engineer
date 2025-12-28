# プロジェクト技術スタック定義

## 🔧 生成情報
- **生成日**: 2025-12-28
- **生成ツール**: tsumiki:init-tech-stack
- **プロジェクトタイプ**: Webアプリケーション（ブログ）
- **チーム規模**: 個人開発
- **開発期間**: プロトタイプ/MVP（1-2ヶ月）

## 🎯 プロジェクト要件サマリー
- **プロジェクト概要**: Astro.jsを使用した静的ブログサイト
- **コンテンツ管理**: マークダウンファイル + Git（Content Collections API）
- **画像管理**: Cloudflare R2（Gitリポジトリの容量節約）
- **デプロイフロー**: マークダウンをpushして自動ビルド・デプロイ
- **パフォーマンス**: 軽負荷（同時利用者数10人以下、レスポンス3秒以内）
- **セキュリティ**: 基本レベル（一般的なWebセキュリティ対策）
- **既存システム連携**: 新規構築

## 🚀 フロントエンド・SSG
- **フレームワーク**: Astro 5.1+
- **言語**: TypeScript 5.7+
- **スタイリング**: Tailwind CSS 4.0+
- **ビルドツール**: Vite 6（Astro内蔵）
- **アーキテクチャ**: Islands Architecture（必要に応じてReact/Vue等を部分的に利用可能）

### 選択理由
- Astro.jsは静的サイト生成に最適化され、ブログに最適
- マークダウンファイルのネイティブサポート（Content Collections API）
- ビルド時に完全な静的HTMLを生成し、超高速
- SEO最適化が容易で、Lighthouse 90+点を狙いやすい
- TypeScriptで型安全な開発が可能

## 🎨 デザインシステム
- **デフォルトテーマ**: ダークモード
- **テーマ切り替え**: トグルボタンでライト/ダーク切り替え可能
- **実装方法**: Tailwind CSS `dark:` クラス + localStorage永続化
- **カラーパレット**: ダークモード優先で設計
- **アイコン**: Lucide Icons または Heroicons推奨

### ダークモード実装方針
- **デフォルト**: `dark` クラスを `<html>` タグに適用
- **切り替え**: JavaScriptでテーマトグル機能を実装
- **永続化**: `localStorage` にユーザー設定を保存
- **初期読み込み**: フラッシュ防止のため、`<head>` 内でインラインスクリプト実行
- **Tailwind設定**: `darkMode: 'class'` を使用

### 選択理由
- Tailwind CSSのダークモードは設定が簡単で保守性が高い
- `class` ベースの切り替えはユーザー設定を尊重可能
- localStorageで設定を永続化し、再訪時も設定を維持
- Astroのコンポーネントベースアーキテクチャと相性が良い

## 📚 コンポーネント管理（Storybook）
- **ツール**: Storybook 8+
- **用途**: コンポーネントの独立開発・ドキュメント化・ビジュアルテスト
- **統合方法**: `@storybook/experimental-addon-test` でVitestと統合
- **対応フレームワーク**: Astro (.astro), React/Vue（必要に応じて）

### Storybook統合方針
- **コンポーネント開発**: Storybookで独立した環境でコンポーネントを開発
- **ビジュアル確認**: 各コンポーネントの状態（ライト/ダークモード、各props）を確認
- **ドキュメント**: コンポーネントのprops、使用例、アクセシビリティ情報を自動生成
- **テスト統合**: Storybook Test addon でVitestを実行し、ストーリーをテストとして活用
- **アクセシビリティ**: `@storybook/addon-a11y` でWCAG準拠を確認

### Storybookで管理するコンポーネント例
- **Header.astro**: サイトヘッダー、ナビゲーション
- **Footer.astro**: サイトフッター
- **BlogCard.astro**: ブログカードコンポーネント
- **ThemeToggle.astro**: ダークモード切り替えボタン
- **Button.astro**: 汎用ボタンコンポーネント
- **MarkdownContent.astro**: Markdownコンテンツ表示コンポーネント

### 選択理由
- コンポーネントを独立した環境で開発・テスト可能
- デザインシステムのドキュメントとして機能
- ダークモード等の複数状態を一覧で確認可能
- Astro公式でStorybookサポートが進行中（実験的機能として利用可能）
- チーム開発への拡張性（将来的に複数人開発になった場合）

## 📝 コンテンツ管理
- **形式**: マークダウン（`.md` ファイル）
- **管理方法**: Git（GitHub）でバージョン管理
- **API**: Astro Content Collections API（型安全なコンテンツ管理）
- **メタデータ**: frontmatter（YAML）で記事情報を定義
- **執筆エディタ**: Vim（推奨）
- **表示形式**: Markdownを自動的にHTMLプレビューとしてレンダリング

### ワークフロー
1. ローカルでVimを使用して記事を執筆（`src/content/blog/*.md`）
2. Gitにコミット・プッシュ
3. Cloudflare Pagesが自動ビルド・デプロイ
4. サイト閲覧時はMarkdownが美しいHTMLプレビューとして表示される

### 選択理由
- Gitベースで履歴管理が容易
- CMSの導入・運用コストが不要
- Content Collections APIで型安全にメタデータを管理
- Vimでの執筆により高速な記事作成が可能
- Astroが自動的にMarkdownをHTMLに変換し、スタイリングを適用
- マークダウンのシンタックスハイライト、コードブロック、画像埋め込みをそのままサポート

## 🖼️ 画像ストレージ
- **サービス**: Cloudflare R2
- **プロトコル**: S3互換API
- **公開方法**: R2 Public Bucket または Cloudflare Workers経由
- **統合方法**: Astroの `<Image>` コンポーネントでR2のURLを参照

### 選択理由
- 転送料金無料（egress無料）でコスト最適化
- S3互換APIで使いやすい
- Cloudflare CDNと統合可能で高速配信
- Gitリポジトリの容量を圧迫しない

## ☁️ インフラ・デプロイ
- **ホスティング**: Cloudflare Pages（推奨）
- **CDN**: Cloudflare CDN（Pages標準装備）
- **ビルドコマンド**: `pnpm build`
- **出力ディレクトリ**: `dist`
- **環境変数**: `PUBLIC_R2_URL`（R2のパブリックURL）

### デプロイフロー
1. GitHubにプッシュ
2. Cloudflare Pagesが自動でビルド開始
3. ビルド成功後、即座に全世界のCDNに配信

### 選択理由
- Gitリポジトリ連携で自動ビルド・デプロイ
- 無料枠が充実（無制限のリクエスト、500ビルド/月）
- R2と同じCloudflareエコシステムで統合が容易
- CDN込みで世界中で高速配信

### 代替案
- **Vercel**: Astro公式サポート、同様のGit連携デプロイ
- **Netlify**: Astro公式サポート、フォーム機能などが充実

## 🛠️ 開発環境
- **Node.jsバージョン**: Node.js 22 LTS
- **パッケージマネージャー**: pnpm 9+（高速・ディスク効率）
- **エディタ**: VSCode推奨（Astro公式拡張機能あり）

### 開発ツール
- **リンター・フォーマッター**: Biome 1.9+（最速、ESLint+Prettier代替）
- **コンポーネントカタログ**: Storybook 8+（コンポーネント開発・管理）
- **テストフレームワーク**: Vitest 2+（必要に応じて）
- **E2Eテスト**: Playwright 1.49+（必要に応じて）
- **型チェック**: TypeScript Compiler（tsc）

### CI/CD
- **コードレビュー**: CodeRabbit（GitHub統合）
- **CI/CD**: Cloudflare Pagesの自動ビルド機能
- **品質チェック**: Biome（リント・フォーマット）
- **テスト**: 必要に応じてGitHub Actionsでテスト自動化

## 🔒 セキュリティ
- **HTTPS**: 必須（Cloudflare Pages標準装備）
- **環境変数**: 機密情報の適切な管理（Cloudflare Pages環境変数機能）
- **依存関係**: 定期的な脆弱性チェック（`pnpm audit`）
- **CSP**: Content Security Policy設定（必要に応じて）
- **CORS**: 静的サイトのため基本的に不要

## 📊 品質基準
- **パフォーマンス**: Lighthouse 90+点
- **コード品質**: Biomeによる自動チェック
- **型安全性**: TypeScript strictモード有効
- **アクセシビリティ**: WCAG 2.1 AA準拠を目指す
- **SEO**: メタタグ、OGP、サイトマップ自動生成

## 📁 推奨ディレクトリ構造

```
./ (プロジェクトルート)
├── src/
│   ├── content/
│   │   ├── blog/              # ブログ記事（マークダウン）
│   │   │   ├── first-post.md
│   │   │   ├── second-post.md
│   │   │   └── ...
│   │   └── config.ts          # Content Collections設定
│   ├── components/            # Astroコンポーネント
│   │   ├── Header.astro
│   │   ├── Header.stories.ts  # Storybookストーリー
│   │   ├── Footer.astro
│   │   ├── Footer.stories.ts
│   │   ├── BlogCard.astro
│   │   ├── BlogCard.stories.ts
│   │   ├── Navigation.astro
│   │   ├── ThemeToggle.astro  # ダークモード切り替えボタン
│   │   └── ThemeToggle.stories.ts
│   ├── layouts/               # レイアウトコンポーネント
│   │   ├── BaseLayout.astro
│   │   └── BlogPostLayout.astro
│   ├── pages/                 # ページ（ファイルベースルーティング）
│   │   ├── index.astro        # トップページ
│   │   ├── blog/
│   │   │   ├── index.astro    # ブログ一覧
│   │   │   └── [slug].astro   # 個別記事ページ
│   │   ├── about.astro        # Aboutページ
│   │   └── rss.xml.ts         # RSS Feed（オプション）
│   ├── styles/                # グローバルスタイル
│   │   └── global.css
│   └── utils/                 # ユーティリティ関数
│       ├── r2.ts              # R2画像URL生成ヘルパー
│       └── date.ts            # 日付フォーマット等
├── public/                     # 静的ファイル（favicon、robots.txt等）
│   ├── favicon.svg
│   └── robots.txt
├── docs/                       # ドキュメント
│   └── tech-stack.md          # このファイル
├── .storybook/                 # Storybook設定
│   ├── main.ts                 # Storybook設定ファイル
│   └── preview.ts              # プレビュー設定
├── astro.config.mjs            # Astro設定
├── tailwind.config.mjs         # Tailwind CSS設定
├── tsconfig.json               # TypeScript設定
├── biome.json                  # Biome設定
├── package.json
├── pnpm-lock.yaml
├── .gitignore
├── .env.example                # 環境変数テンプレート
├── CLAUDE.md                   # Claude Code向け指示
└── README.md

```

**重要**: `./` はカレントディレクトリ（プロジェクトルート）を指します。

## 🚀 セットアップ手順

### 1. プロジェクト初期化
```bash
# Astroプロジェクト作成
pnpm create astro@latest

# 選択肢:
# - Template: Blog (or Empty)
# - Install dependencies: Yes
# - TypeScript: Yes, strict
# - Git: Yes
```

### 2. Tailwind CSS統合
```bash
pnpm astro add tailwind
```

`tailwind.config.mjs` を編集してダークモードを有効化:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class', // クラスベースのダークモード
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 3. ダークモード実装
テーマトグル機能を実装:

```typescript
// src/components/ThemeToggle.astro
---
// テーマ切り替えコンポーネント
---

<button id="theme-toggle" class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
  <svg class="w-6 h-6 hidden dark:block" fill="currentColor" viewBox="0 0 20 20">
    <!-- 月アイコン（ダークモード時） -->
    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
  </svg>
  <svg class="w-6 h-6 block dark:hidden" fill="currentColor" viewBox="0 0 20 20">
    <!-- 太陽アイコン（ライトモード時） -->
    <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
  </svg>
</button>

<script>
  const themeToggle = document.getElementById('theme-toggle');
  const html = document.documentElement;

  // テーマ切り替え
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

ベースレイアウトに初期化スクリプトを追加:
```astro
<!-- src/layouts/BaseLayout.astro -->
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>

  <!-- テーマ初期化（フラッシュ防止） -->
  <script is:inline>
    // デフォルトはダークモード
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  </script>
</head>
<body class="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  <slot />
</body>
</html>
```

### 4. Storybook導入
```bash
# Storybookインストール
npx storybook@latest init --type web_components

# Astro統合用のアドオン
pnpm add -D @storybook/web-components @storybook/addon-essentials
pnpm add -D @storybook/addon-a11y @storybook/experimental-addon-test

# Vite統合
pnpm add -D @storybook/builder-vite
```

`.storybook/main.ts` を設定:
```typescript
import type { StorybookConfig } from '@storybook/web-components-vite';

const config: StorybookConfig = {
  stories: ['../src/components/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/experimental-addon-test',
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  core: {
    builder: '@storybook/builder-vite',
  },
};

export default config;
```

`.storybook/preview.ts` でダークモード対応:
```typescript
import type { Preview } from '@storybook/web-components';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#111827' },
        { name: 'light', value: '#ffffff' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
```

コンポーネントのストーリー例:
```typescript
// src/components/ThemeToggle.stories.ts
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Components/ThemeToggle',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <button id="theme-toggle" class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700">
      <svg class="w-6 h-6 hidden dark:block" fill="currentColor" viewBox="0 0 20 20">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
      </svg>
      <svg class="w-6 h-6 block dark:hidden" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
      </svg>
    </button>
  `,
};

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
  },
  render: Default.render,
};

export const LightMode: Story = {
  parameters: {
    backgrounds: { default: 'light' },
  },
  render: Default.render,
};
```

### 5. Biome導入
```bash
pnpm add -D @biomejs/biome
pnpm biome init
```

`biome.json` を編集:
```json
{
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

### 4. Content Collections設定
```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    coverImage: z.string().optional(), // R2のURL
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = { blog };
```

### 5. Cloudflare R2統合
```typescript
// src/utils/r2.ts
export function getR2ImageUrl(key: string): string {
  const R2_PUBLIC_URL = import.meta.env.PUBLIC_R2_URL;
  if (!R2_PUBLIC_URL) {
    throw new Error('PUBLIC_R2_URL environment variable is not set');
  }
  return `${R2_PUBLIC_URL}/${key}`;
}
```

マークダウンでの使用例:
```markdown
---
title: "サンプル記事"
description: "これはサンプルです"
pubDate: 2025-12-28
coverImage: "my-image.jpg"
---

本文...

![画像の説明](https://your-r2-public-url.com/my-image.jpg)
```

### 6. 環境変数設定
```bash
# .env.example
PUBLIC_R2_URL=https://your-r2-public-url.com
```

```bash
# .env（ローカル開発用、.gitignoreに追加）
PUBLIC_R2_URL=https://your-r2-public-url.com
```

Cloudflare Pagesの環境変数設定:
- Dashboard > Pages > プロジェクト > Settings > Environment variables
- `PUBLIC_R2_URL` を追加

### 7. Cloudflare Pagesデプロイ
1. GitHubリポジトリをCloudflare Pagesに接続
2. ビルド設定:
   - **Framework preset**: Astro
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist`
   - **Environment variables**: `PUBLIC_R2_URL=https://your-r2-public-url.com`

## 📝 主要コマンド

```bash
# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# ビルドしたサイトをローカルプレビュー
pnpm preview

# Storybook起動
pnpm storybook

# Storybookビルド（静的ファイル生成）
pnpm build-storybook

# リント・フォーマット
pnpm biome check --write ./src

# 型チェック
pnpm astro check
```

## 🔄 記事投稿フロー

1. **記事作成**: `src/content/blog/new-post.md` を作成
2. **frontmatter記述**:
   ```markdown
   ---
   title: "記事タイトル"
   description: "記事の説明"
   pubDate: 2025-12-28
   coverImage: "cover.jpg"  # R2にアップロード済みの画像
   tags: ["tag1", "tag2"]
   ---
   ```
3. **本文執筆**: マークダウンで記事を執筆
4. **画像アップロード**: 必要な画像をCloudflare R2にアップロード
5. **コミット・プッシュ**: GitHubにプッシュ
6. **自動デプロイ**: Cloudflare Pagesが自動ビルド・公開

## 📚 参考リンク

- [Astro公式ドキュメント](https://docs.astro.build/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Cloudflare Pages](https://pages.cloudflare.com/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Storybook](https://storybook.js.org/)
- [Storybook Addon A11y](https://storybook.js.org/addons/@storybook/addon-a11y)
- [Biome](https://biomejs.dev/)

## 🔄 更新履歴
- 2025-12-28: 初回生成（tsumiki:init-tech-stackにより自動生成）
- 2025-12-28: デザインシステム追加（ダークモードデフォルト、テーマトグル機能）
- 2025-12-28: コンテンツ管理にVim推奨とMarkdownプレビュー表示を明記
- 2025-12-28: Storybook 8+追加（コンポーネントカタログ、ビジュアルテスト、ドキュメント化）
