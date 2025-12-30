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

## Cloudflare Workersデプロイ

このプロジェクトは wrangler CLI を使用して Cloudflare Workers にデプロイします。
すべての設定は `wrangler.jsonc` で管理され、Infrastructure as Code を実現しています。

### 初回セットアップ

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

### デプロイコマンド

#### 本番環境へデプロイ
```bash
pnpm cf:deploy
```

#### 開発環境へデプロイ
```bash
pnpm cf:deploy:dev
```

#### ビルド確認（デプロイ前）
```bash
pnpm build
pnpm preview
```

### GitHub Actionsによる自動デプロイ

このプロジェクトはGitHub Actionsを使用して自動デプロイを行います。

#### 本番環境（Production）

**トリガー**: `main`ブランチへのpush

```yaml
# .github/workflows/deploy.yml
- mainブランチにマージされると自動的にデプロイ
- デプロイ先: aging-engineer (--env production)
```

**フロー**:
1. Pull Requestを作成
2. レビュー・承認
3. `main`ブランチへマージ
4. 自動的に本番環境へデプロイ

#### 開発環境（Develop）

**トリガー**: Pull Requestの作成・更新

```yaml
# .github/workflows/preview.yml
- PR作成・更新時に自動的にデプロイ
- デプロイ先: aging-engineer-dev (--env develop)
```

**フロー**:
1. Pull Requestを作成
2. 自動的に開発環境へデプロイ
3. PRコメントにデプロイ情報が表示される
4. 開発環境で動作確認

#### 必要なGitHub Secrets

以下のSecretsを設定する必要があります：

| Secret名 | 取得方法 |
|---------|---------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare Dashboard → My Profile → API Tokens → Create Token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Dashboard → Workers & Pages（サイドバー） |

**API Token の権限設定**:
- **権限**: Account → Workers Scripts → Edit
- **アカウント リソース**: 含む → すべてのアカウント

### 設定ファイル

#### wrangler.jsonc

プロジェクト設定は `wrangler.jsonc` で管理されています。

**環境設定**:
```jsonc
{
  "compatibility_date": "2024-12-29",
  "assets": { "directory": "./dist" },
  "env": {
    "production": {
      "name": "aging-engineer"  // 本番環境
    },
    "develop": {
      "name": "aging-engineer-dev"  // 開発環境
    }
  }
}
```

- **共通設定**: 互換性日付、静的アセットディレクトリ
- **環境ごとの設定**: Worker名を環境ごとに指定
- **デプロイ方法**: `--env production` または `--env develop` で環境を明示

Cloudflare Workers の新しい設定形式（JSON with Comments）を使用しています。

#### 環境変数（本番環境）
本番環境の環境変数は以下の方法で設定できます：

##### 方法1: wrangler.jsonc で管理（推奨 - Infrastructure as Code）
```jsonc
// wrangler.jsonc に追加
{
  "vars": {
    "PUBLIC_R2_URL": "https://pub-example.r2.dev"
  }
}
```

##### 方法2: Cloudflare Dashboard で設定
1. Cloudflare Dashboard → Workers & Pages → aging-engineer
2. Settings → Environment variables
3. `PUBLIC_R2_URL` を追加

**注意**:
- 平文で管理可能な値は wrangler.jsonc の `vars` ブロックで管理できます
- 機密情報は `npx wrangler secret put` コマンドまたは Cloudflare Dashboard で設定してください

### トラブルシューティング

**デプロイエラー時：**
1. `npx wrangler login` でログイン状態を確認
2. `pnpm build` がローカルで成功するか確認
3. wrangler.jsonc の設定を確認

**環境変数が反映されない：**
- Cloudflare Dashboard で環境変数が設定されているか確認
- プレフィックス `PUBLIC_` が必須（Astroの仕様）

## 技術スタック

- **フレームワーク**: Astro 5.1+
- **スタイリング**: Tailwind CSS 4.0
- **言語**: TypeScript 5.7+ (strict mode)
- **リント/フォーマット**: Biome 1.9+
- **テスト**: Vitest 2.1+ / Playwright 1.49+
- **ホスティング**: Cloudflare Workers
- **画像ストレージ**: Cloudflare R2（予定）

## コマンド

| コマンド | 説明 |
|---------|------|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | 本番ビルド |
| `pnpm preview` | ビルドしたサイトをプレビュー |
| `pnpm cf:deploy` | Cloudflare Workers にデプロイ（本番） |
| `pnpm cf:deploy:preview` | Cloudflare Workers にデプロイ（プレビュー） |
| `pnpm check` | TypeScript型チェック |
| `pnpm lint` | リント・フォーマット実行 |
| `pnpm test` | 単体テスト実行 |
| `pnpm test:e2e` | E2Eテスト実行 |

## ライセンス

MIT
