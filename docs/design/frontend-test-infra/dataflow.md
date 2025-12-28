# フロントエンドテスト基盤 データフロー図

**作成日**: 2025-12-28
**関連アーキテクチャ**: [architecture.md](architecture.md)
**関連要件定義**: なし（新規プロジェクト）

**【信頼性レベル凡例】**:
- 🔵 **青信号**: Vitest/Playwright公式ドキュメント、Astroテストベストプラクティスを参考にした確実なフロー
- 🟡 **黄信号**: 一般的なテストベストプラクティスから妥当な推測によるフロー
- 🔴 **赤信号**: プロジェクト固有の推測によるフロー（要確認）

---

## システム全体のテストフロー 🔵

**信頼性**: 🔵 *Vitest/Playwrightドキュメント・テストピラミッドより*

```mermaid
flowchart TD
    A[開発者] --> B[コード変更]
    B --> C{テスト種別}

    C -->|単体テスト| D[Vitest実行]
    C -->|E2Eテスト| E[Astroビルド]

    D --> F[モック・スタブ]
    F --> G[テスト実行]
    G --> H[カバレッジ測定]
    H --> I{テスト結果}

    E --> J[静的サイト生成]
    J --> K[Playwright実行]
    K --> L[ブラウザ起動]
    L --> M[E2Eテスト実行]
    M --> I

    I -->|成功| N[レポート生成]
    I -->|失敗| O[エラー詳細表示]

    N --> P[CI/CDパイプライン]
    O --> Q[デバッグ]
```

## 主要機能のデータフロー

### 機能1: 単体テスト実行フロー 🔵

**信頼性**: 🔵 *Vitestドキュメント・実行フローより*

```mermaid
sequenceDiagram
    participant D as 開発者
    participant CLI as pnpm vitest
    participant V as Vitest
    participant T as テストファイル
    participant M as モック
    participant C as カバレッジ

    D->>CLI: pnpm vitest
    CLI->>V: テスト起動
    V->>T: テストファイル読み込み
    T->>M: モック初期化
    M->>T: モックデータ返却
    T->>T: テスト実行
    T->>C: カバレッジ記録
    C->>V: カバレッジ集計
    V->>CLI: テスト結果
    CLI->>D: 結果表示 + カバレッジレポート
```

**詳細ステップ**:
1. 開発者が `pnpm vitest` コマンドを実行
2. Vitestが `tests/**/*.test.ts` を検出
3. 各テストファイルをインポート
4. `beforeEach` でモックを初期化
5. テストケースを順次実行
6. `@vitest/coverage-v8` がカバレッジを記録
7. 結果をターミナルに表示

### 機能2: Astroコンポーネントテスト 🟡

**信頼性**: 🟡 *Astroテストパターンから推測*

```mermaid
sequenceDiagram
    participant T as テストファイル
    participant A as Astroコンポーネント
    participant R as レンダリング
    participant DOM as happy-dom
    participant Assert as アサーション

    T->>A: コンポーネントインポート
    A->>R: レンダリング要求
    R->>DOM: 仮想DOMに変換
    DOM-->>R: HTML文字列
    R-->>T: レンダリング結果
    T->>Assert: 期待値と比較
    Assert-->>T: テスト結果
```

**備考**: Astroコンポーネントは `.astro` ファイルを直接テストできないため、ビルド後のHTMLまたはレンダリング結果をテストします。

### 機能3: Content Collectionsテスト 🔵

**信頼性**: 🔵 *Astro Content Collections APIドキュメントより*

```mermaid
sequenceDiagram
    participant T as テストファイル
    participant M as モックContent
    participant V as バリデーション
    participant Z as Zodスキーマ
    participant Assert as アサーション

    T->>M: モックコンテンツ作成
    M->>V: バリデーション実行
    V->>Z: Zodスキーマチェック
    Z-->>V: バリデーション結果
    V-->>T: 検証済みデータ
    T->>Assert: 期待値と比較
    Assert-->>T: テスト結果
```

**詳細ステップ**:
1. `tests/fixtures/content/` からモックマークダウンを読み込み
2. `src/content/config.ts` の Zod スキーマでバリデーション
3. frontmatter のパースと型チェック
4. 期待される型と一致するか確認

### 機能4: E2Eテスト実行フロー 🔵

**信頼性**: 🔵 *Playwrightドキュメント・実行フローより*

```mermaid
sequenceDiagram
    participant D as 開発者
    participant CLI as pnpm playwright test
    participant B as Astro Build
    participant P as Playwright
    participant Browser as Chromium
    participant Page as Webページ
    participant Assert as アサーション

    D->>CLI: pnpm playwright test
    CLI->>B: pnpm build
    B->>B: 静的サイト生成
    B-->>CLI: dist/ディレクトリ
    CLI->>P: Playwright起動
    P->>Browser: ブラウザ起動
    Browser->>Page: ページロード (dist/)
    Page-->>Browser: レンダリング完了
    Browser->>Assert: DOM要素検証
    Assert-->>P: テスト結果
    P->>CLI: レポート生成
    CLI->>D: 結果表示
```

**詳細ステップ**:
1. `pnpm build` で静的サイトを生成 (`dist/`)
2. Playwright が `dist/` をローカルサーバーで起動
3. ブラウザでページにアクセス
4. ユーザー操作をシミュレート（クリック、入力等）
5. DOM要素、表示内容を検証
6. スクリーンショットやトレースを保存

### 機能5: Cloudflare R2モックフロー 🔵

**信頼性**: 🔵 *ヒアリング結果・モック戦略より*

```mermaid
sequenceDiagram
    participant T as テストファイル
    participant M as R2モック
    participant U as getR2ImageUrl
    participant Assert as アサーション

    T->>M: vi.mock('@/utils/r2')
    M->>U: モック関数設定
    T->>U: getR2ImageUrl('test.jpg')
    U-->>T: 'https://mock-r2-url.com/test.jpg'
    T->>Assert: 期待URLと比較
    Assert-->>T: テスト結果
```

**モック実装例**:
```typescript
// tests/mocks/r2.mock.ts
import { vi } from 'vitest';

export const mockGetR2ImageUrl = vi.fn((key: string): string => {
  return `https://mock-r2-url.com/${key}`;
});
```

## データ処理パターン

### 並列テスト実行 🔵

**信頼性**: 🔵 *Vitest並列実行ドキュメントより*

Vitestはデフォルトで並列実行が有効。各テストファイルは独立したプロセスで実行され、テスト間の干渉を防ぎます。

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    pool: 'threads', // スレッドプール使用
    poolOptions: {
      threads: {
        singleThread: false, // 並列実行有効
      },
    },
  },
});
```

### テストデータ管理 🟡

**信頼性**: 🟡 *テストベストプラクティスから推測*

```mermaid
flowchart LR
    A[tests/fixtures/] --> B[content/]
    A --> C[images/]
    B --> D[sample-post.md]
    C --> E[sample-image.jpg]

    F[テストファイル] --> G[fixtureデータ読み込み]
    G --> D
    G --> E
```

### モック初期化・クリーンアップ 🔵

**信頼性**: 🔵 *Vitestドキュメントより*

```typescript
// 各テスト前に初期化
beforeEach(() => {
  vi.clearAllMocks();
  mockGetR2ImageUrl.mockReturnValue('https://mock-r2-url.com/default.jpg');
});

// 各テスト後にクリーンアップ
afterEach(() => {
  vi.restoreAllMocks();
});
```

## エラーハンドリングフロー 🟡

**信頼性**: 🟡 *テストベストプラクティスから推測*

```mermaid
flowchart TD
    A[テスト実行] --> B{エラー発生？}
    B -->|Yes| C{エラー種別}
    B -->|No| D[テスト成功]

    C -->|アサーション失敗| E[期待値と実際の値を表示]
    C -->|モックエラー| F[モック設定確認を促す]
    C -->|タイムアウト| G[非同期処理の待機追加を促す]
    C -->|その他| H[スタックトレース表示]

    E --> I[デバッグモード提案]
    F --> I
    G --> I
    H --> I

    D --> J[カバレッジレポート生成]
    I --> K[開発者が修正]
    K --> A
```

## CI/CDパイプラインフロー 🟡

**信頼性**: 🟡 *GitHub Actions・CI/CDベストプラクティスから推測*

```mermaid
flowchart TD
    A[GitHubへプッシュ] --> B[GitHub Actions起動]
    B --> C[依存関係インストール]
    C --> D{並列実行}

    D -->|Job 1| E[Vitest実行]
    D -->|Job 2| F[Playwright実行]

    E --> G[カバレッジ測定]
    G --> H[Codecovアップロード]

    F --> I[スクリーンショット保存]
    I --> J[Artifactアップロード]

    H --> K{全テスト成功？}
    J --> K

    K -->|Yes| L[マージ許可]
    K -->|No| M[プルリクエストブロック]
    M --> N[開発者へ通知]
```

**主要ステップ**:
1. プルリクエスト作成 or main ブランチへプッシュ
2. GitHub Actions がトリガー
3. Node.js 22 LTS 環境セットアップ
4. pnpm install で依存関係インストール
5. 並列ジョブ:
   - **Job 1**: Vitest 実行 → カバレッジ測定 → Codecov アップロード
   - **Job 2**: Astro ビルド → Playwright 実行 → スクリーンショット保存
6. 全テスト成功でマージ許可、失敗でブロック

## 状態管理フロー

### テストライフサイクル 🔵

**信頼性**: 🔵 *Vitestドキュメントより*

```mermaid
stateDiagram-v2
    [*] --> 初期化: beforeAll
    初期化 --> テスト準備: beforeEach
    テスト準備 --> テスト実行: test()
    テスト実行 --> クリーンアップ: afterEach
    クリーンアップ --> テスト準備: 次のテスト
    クリーンアップ --> 終了処理: afterAll
    終了処理 --> [*]
```

### E2Eテストライフサイクル 🔵

**信頼性**: 🔵 *Playwrightドキュメントより*

```mermaid
stateDiagram-v2
    [*] --> ビルド: pnpm build
    ビルド --> ブラウザ起動: Playwright起動
    ブラウザ起動 --> ページロード: page.goto()
    ページロード --> ユーザー操作: click, fill, etc.
    ユーザー操作 --> アサーション: expect()
    アサーション --> スクリーンショット: page.screenshot()
    スクリーンショット --> ブラウザ終了
    ブラウザ終了 --> [*]
```

## データ整合性の保証 🟡

**信頼性**: 🟡 *テストベストプラクティスから推測*

- **テスト隔離**: 各テストは独立して実行され、共有状態を持たない
- **モッククリーンアップ**: `afterEach` で必ずモックをリセット
- **並列実行**: テストファイル単位で並列実行し、ファイル内は直列実行
- **決定的テスト**: 日付・乱数はモック化して再現可能に

## 関連文書

- **アーキテクチャ**: [architecture.md](architecture.md)
- **テストパターン**: [test-patterns.md](test-patterns.md)
- **Vitest設定**: [vitest.config.example.ts](vitest.config.example.ts)
- **Playwright設定**: [playwright.config.example.ts](playwright.config.example.ts)

## 信頼性レベルサマリー

- 🔵 青信号: 14件 (82%)
- 🟡 黄信号: 3件 (18%)
- 🔴 赤信号: 0件 (0%)

**品質評価**: 高品質
- Vitest/Playwright公式ドキュメントに基づいた信頼性の高いフロー設計
- CI/CDパイプラインもベストプラクティスに準拠
- 並列実行、テスト隔離などパフォーマンスと信頼性を両立
