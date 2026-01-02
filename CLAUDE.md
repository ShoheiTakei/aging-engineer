# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Language Preference

**常に日本語で回答してください。** All responses should be in Japanese.

## 現在の状況

### プロジェクト初期化完了

- **フレームワーク**: Astro 5.1.3 + Tailwind CSS 4.0
- **言語**: TypeScript（strict mode）
- **コード品質**: Biome（リント・フォーマット）
- **レンダリング**: SSG（Static Site Generation）モード

### デプロイ環境

- **ホスティング**: Cloudflare Pages
- **CDN**: Cloudflare CDN（標準装備）
- **画像ストレージ**: Cloudflare R2（予定）

### デプロイフロー

1. GitHubにプッシュ
2. Cloudflare Pagesが自動ビルド
3. 全世界のCDNに配信

詳細は[README.md](README.md)を参照してください。

## ビルド・開発コマンド

| コマンド | 説明 |
|---------|------|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | 本番ビルド |
| `pnpm preview` | ビルドしたサイトをプレビュー |
| `pnpm check` | TypeScript型チェック |
| `pnpm lint` | リント・フォーマット実行 |

## プロジェクト構造

```text
src/
├── pages/          # ルーティング（Astro Pages）
├── styles/         # グローバルスタイル（Tailwind CSS 4）
└── env.d.ts        # TypeScript型定義
```

## 開発規約

- **コミットメッセージ**: Conventional Commits準拠
- **ブランチ命名**: `feat/機能名`, `fix/修正内容`
- **PRフロー**: 各ステップごとにPRを作成
- **コードレビュー**: CodeRabbit自動レビュー

### 画像の扱い

- **画像コンポーネント**: すべての画像は `astro:assets` の `Image` コンポーネントを使用すること
- **最適化**: WebP/AVIF変換、レスポンシブ画像（srcset）の自動生成
- **配置場所**:
  - ローカル画像: `src/assets/` に配置
  - 静的画像: `public/assets/` に配置（最適化不要な場合のみ）
- **必須属性**: `alt`, `width`, `height` を必ず指定してCLS対策
