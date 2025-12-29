# Aging Engineer Blog

Astro 5 + Tailwind CSS 4 で構築された技術ブログ

## 開発環境セットアップ

### 必要な環境

- Node.js 20.x
- pnpm 9.x

### インストール

```bash
pnpm install
```

### 環境変数設定

```bash
cp .env.example .env
# .envファイルを編集してR2 URLを設定
```

### 開発サーバー起動

```bash
pnpm dev
```

開発サーバーは http://localhost:4321/ で起動します。

## Cloudflare Pagesデプロイ

### 初回セットアップ

#### 1. Cloudflare Pagesプロジェクト作成

- Cloudflare Dashboard → Pages → Create a project
- GitHubリポジトリを接続: `ShoheiTakei/aging-engineer`

#### 2. ビルド設定

- **Framework preset**: Astro
- **Build command**: `pnpm build`
- **Build output directory**: `dist`
- **Root directory**: `/` （ルート）
- **Node.js version**: `20`

#### 3. 環境変数設定

Cloudflare Pagesの設定画面で以下の環境変数を設定：

- **環境変数名**: `PUBLIC_R2_URL`
- **値**: Cloudflare R2バケットの公開URL
  ```
  https://pub-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.dev
  ```

### デプロイフロー

#### 自動デプロイ（推奨）

- `main`ブランチへのプッシュ → 本番環境に自動デプロイ
- Pull Request作成 → プレビュー環境に自動デプロイ

#### 手動デプロイ

```bash
# ローカルでビルドテスト
pnpm build

# ビルド成果物の確認
pnpm preview
```

### トラブルシューティング

#### ビルドエラー時

1. Node.jsバージョンを確認（20.x推奨）
2. `pnpm install`で依存関係を再インストール
3. ローカルで`pnpm build`が成功するか確認

#### 環境変数が反映されない

- Cloudflare Pages設定で環境変数が正しく設定されているか確認
- プレフィックス`PUBLIC_`が必須（Astroの仕様）

## 技術スタック

- **フレームワーク**: Astro 5.1+
- **スタイリング**: Tailwind CSS 4.0
- **言語**: TypeScript 5.7+ (strict mode)
- **リント/フォーマット**: Biome 1.9+
- **テスト**: Vitest 2.1+ / Playwright 1.49+
- **ホスティング**: Cloudflare Pages
- **画像ストレージ**: Cloudflare R2（予定）

## コマンド

| コマンド | 説明 |
|---------|------|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | 本番ビルド |
| `pnpm preview` | ビルドしたサイトをプレビュー |
| `pnpm check` | TypeScript型チェック |
| `pnpm lint` | リント・フォーマット実行 |
| `pnpm test` | 単体テスト実行 |
| `pnpm test:e2e` | E2Eテスト実行 |

## ライセンス

MIT
