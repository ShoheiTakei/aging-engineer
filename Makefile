.PHONY: help dev build preview storybook build-storybook lint typecheck test test-watch test-e2e clean i

# デフォルトターゲット: ヘルプを表示
.DEFAULT_GOAL := help

help: ## ヘルプを表示
	@echo "利用可能なコマンド:"
	@echo ""
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36mmake %-20s\033[0m %s\n", $$1, $$2}'

dev: ## 開発サーバー起動
	pnpm dev

build: ## 本番ビルド
	pnpm build

preview: ## ビルドしたサイトをプレビュー
	pnpm preview

storybook: ## Storybook起動
	pnpm storybook

build-storybook: ## Storybook静的ビルド
	pnpm build-storybook

lint: ## リント・フォーマット実行
	pnpm biome check --write ./src

typecheck: ## TypeScript型チェック
	pnpm astro check

test: ## 単体テスト実行
	pnpm vitest run

test-watch: ## 単体テストウォッチモード
	pnpm vitest

test-e2e: ## E2Eテスト実行
	pnpm playwright test

clean: ## ビルド成果物とキャッシュをクリーン
	rm -rf dist .astro node_modules/.vite storybook-static

i: ## 依存関係インストール
	pnpm install
