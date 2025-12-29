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

開発サーバーは <http://localhost:4321/> で起動します。

## Cloudflare Pagesデプロイ

このプロジェクトは wrangler CLI を使用して Cloudflare Pages にデプロイします。
すべての設定は `wrangler.toml` と `.github/workflows/deploy.yml` で管理され、Infrastructure as Code を実現しています。

### 自動デプロイ（CI/CD）

main ブランチへのプッシュ時に、GitHub Actions が自動的にビルドとデプロイを実行します。

**必要な GitHub Secrets:**
- `CLOUDFLARE_API_TOKEN`: Cloudflare API トークン
- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare アカウント ID

#### GitHub Secrets の設定方法

1. Cloudflare Dashboard → My Profile → API Tokens
2. "Create Token" → "Edit Cloudflare Workers" テンプレートを使用
3. Account Resources: 対象アカウントを選択
4. Zone Resources: All zones
5. トークンを生成してコピー

6. GitHub リポジトリ → Settings → Secrets and variables → Actions
7. "New repository secret" をクリック
8. `CLOUDFLARE_API_TOKEN` と `CLOUDFLARE_ACCOUNT_ID` を追加

### 初回セットアップ（ローカル開発用）

#### 1. Cloudflare アカウントでログイン
```bash
npx wrangler login
```

#### 2. 環境変数設定
ローカル開発用の環境変数を設定：
```bash
cp .env.example .env
# .envファイルを編集してR2 URLを設定
```

### 手動デプロイ（オプション）

通常は main ブランチへのマージで自動デプロイされますが、手動でデプロイすることも可能です。

#### 本番環境へデプロイ
```bash
pnpm cf:deploy
```

#### プレビュー環境へデプロイ
```bash
pnpm cf:deploy:preview
```

#### ビルド確認（デプロイ前）
```bash
pnpm build
pnpm preview
```

### 設定ファイル

#### wrangler.toml
プロジェクト設定は `wrangler.toml` で管理されています。
- プロジェクト名
- ビルド出力ディレクトリ
- 環境別設定

デプロイ設定を変更する場合は、このファイルを編集してください。

#### 環境変数（本番環境）
本番環境の環境変数は以下の方法で設定できます：

**方法1: wrangler.toml で管理（推奨 - Infrastructure as Code）**
```toml
# wrangler.toml に追加
[vars]
PUBLIC_R2_URL = "https://pub-example.r2.dev"
```

**方法2: Cloudflare Dashboard で設定**
1. Cloudflare Dashboard → Workers & Pages → aging-engineer
2. Settings → Environment variables
3. `PUBLIC_R2_URL` を追加

**注意**:
- 平文で管理可能な値は wrangler.toml の `[vars]` ブロックで管理できます
- 機密情報は `wrangler pages secret put` コマンドまたは Cloudflare Dashboard で設定してください

### トラブルシューティング

**デプロイエラー時：**
1. `npx wrangler login` でログイン状態を確認
2. `pnpm build` がローカルで成功するか確認
3. wrangler.toml の設定を確認

**環境変数が反映されない：**
- Cloudflare Dashboard で環境変数が設定されているか確認
- プレフィックス `PUBLIC_` が必須（Astroの仕様）

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
| `pnpm cf:deploy` | Cloudflare Pages にデプロイ（本番） |
| `pnpm cf:deploy:preview` | Cloudflare Pages にデプロイ（プレビュー） |
| `pnpm check` | TypeScript型チェック |
| `pnpm lint` | リント・フォーマット実行 |
| `pnpm test` | 単体テスト実行 |
| `pnpm test:e2e` | E2Eテスト実行 |

## ライセンス

MIT
