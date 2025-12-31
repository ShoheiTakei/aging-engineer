# TASK-0004: ヘッダー・フッターコンポーネントの実装 - テストケース定義書

**作成日**: 2025-12-31
**タスクタイプ**: TDD
**見積もり工数**: 8時間
**優先度**: P0 (最優先)

**関連文書**:
- [タスクノート](note.md)
- [要件定義書](header-footer-requirements.md)
- [アーキテクチャ設計](../../../design/blog-article-management/architecture.md)
- [EARS要件定義書](../../../spec/blog-article-management/requirements.md)

---

## 目次

1. [テスト戦略](#1-テスト戦略)
2. [Header.astro テストケース](#2-headerastro-テストケース)
3. [Footer.astro テストケース](#3-footerastro-テストケース)
4. [アクセシビリティテストケース](#4-アクセシビリティテストケース)
5. [パフォーマンステストケース](#5-パフォーマンステストケース)
6. [テストカバレッジ目標](#6-テストカバレッジ目標)

---

## 1. テスト戦略

### テストレベル

| テストレベル | ツール | カバー範囲 | 実施タイミング |
|-------------|--------|-----------|---------------|
| **単体テスト** | Vitest | コンポーネント個別機能 | TASK-0004（本タスク） |
| **統合テスト** | Vitest | BaseLayout + Header/Footer | TASK-0004（本タスク） |
| **E2Eテスト** | Playwright | ユーザー操作シナリオ | Phase 3（TASK-0025） |
| **アクセシビリティテスト** | Vitest + axe-core | WCAG 2.1 AA準拠確認 | TASK-0004（本タスク） |

### テストカバレッジ目標

- **全体カバレッジ**: 80%以上
- **Header.astro**: 85%以上
- **Footer.astro**: 85%以上
- **アクセシビリティテスト**: 100%（NFR-301～NFR-304すべて）

### テスト実行コマンド

```bash
# 全テスト実行
pnpm test

# ウォッチモード（開発中）
pnpm test:watch

# カバレッジ計測
pnpm test:coverage

# 型チェック
pnpm check

# リント・フォーマット
pnpm lint
```

---

## 2. Header.astro テストケース

### 2.1 正常系テストケース

#### TC-H-001: 基本レンダリングテスト

**テスト目的**: ヘッダーコンポーネントが正しくレンダリングされることを確認

**テストカテゴリ**: 正常系

**関連要件**: NFR-301（セマンティックHTML）

**テスト手順**:
```typescript
it('ヘッダーコンポーネントが正しくレンダリングされる', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Header, {
    props: { siteTitle: 'Test Blog' }
  });

  expect(result).toContain('<header>');
  expect(result).toContain('</header>');
  expect(result).toContain('<nav');
  expect(result).toContain('Test Blog');
});
```

**期待結果**:
- `<header>`タグが存在する
- `<nav>`タグが存在する
- `siteTitle`が正しく表示される

---

#### TC-H-002: Props反映テスト（siteTitle）

**テスト目的**: siteTitleプロパティが正しくレンダリングに反映されることを確認

**テストカテゴリ**: 正常系

**関連要件**: TypeScript strict mode、Props型定義

**テスト手順**:
```typescript
it('Props（siteTitle）が正しく反映される', async () => {
  const container = await AstroContainer.create();

  // ケース1: 標準的なタイトル
  const result1 = await container.renderToString(Header, {
    props: { siteTitle: 'My Custom Blog' }
  });
  expect(result1).toContain('My Custom Blog');

  // ケース2: 日本語タイトル
  const result2 = await container.renderToString(Header, {
    props: { siteTitle: 'エンジニアブログ' }
  });
  expect(result2).toContain('エンジニアブログ');
});
```

**期待結果**:
- 英語・日本語どちらも正しく表示される
- エスケープ処理が適切に動作する

---

#### TC-H-003: ナビゲーションリンク生成テスト

**テスト目的**: すべてのナビゲーションリンクが正しく生成されることを確認

**テストカテゴリ**: 正常系

**関連要件**: architecture.md（ナビゲーション要件）

**テスト手順**:
```typescript
it('ナビゲーションリンクが正しく生成される', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Header, {
    props: { siteTitle: 'Test Blog' }
  });

  // 必須ナビゲーション項目
  expect(result).toContain('href="/"');        // ホーム
  expect(result).toContain('href="/blog"');    // ブログ
  expect(result).toContain('href="/tags"');    // タグ
  expect(result).toContain('href="/search"');  // 検索
  expect(result).toContain('href="/rss.xml"'); // RSS

  // リンクテキスト
  expect(result).toContain('ホーム');
  expect(result).toContain('ブログ');
  expect(result).toContain('タグ');
  expect(result).toContain('検索');
  expect(result).toContain('RSS');
});
```

**期待結果**:
- 5つのナビゲーションリンク（ホーム、ブログ、タグ、検索、RSS）が生成される
- リンクテキストが正しく表示される

---

#### TC-H-004: currentPath反映テスト（アクティブ状態）

**テスト目的**: currentPathプロパティに基づいて現在のページがハイライトされることを確認

**テストカテゴリ**: 正常系

**関連要件**: NFR-303（ARIAラベル、aria-current）

**テスト手順**:
```typescript
it('現在のページがaria-currentでハイライトされる', async () => {
  const container = await AstroContainer.create();

  // ケース1: ホームページ
  const result1 = await container.renderToString(Header, {
    props: { siteTitle: 'Test Blog', currentPath: '/' }
  });
  expect(result1).toMatch(/href="\/"[^>]*aria-current="page"/);

  // ケース2: ブログページ
  const result2 = await container.renderToString(Header, {
    props: { siteTitle: 'Test Blog', currentPath: '/blog' }
  });
  expect(result2).toMatch(/href="\/blog"[^>]*aria-current="page"/);
});
```

**期待結果**:
- `currentPath`と一致するリンクに`aria-current="page"`が設定される
- 他のリンクには`aria-current`が設定されない

---

### 2.2 異常系・境界値テストケース

#### TC-H-101: siteTitle未指定エラー

**テスト目的**: siteTitleが未指定の場合にTypeScriptコンパイルエラーが発生することを確認

**テストカテゴリ**: 異常系

**関連要件**: TypeScript strict mode

**テスト手順**:
```typescript
it('siteTitleが未指定の場合は型エラー', () => {
  // TypeScriptコンパイル時にエラーとなることを確認
  // @ts-expect-error - siteTitle is required
  const result = Header({ props: {} });
});
```

**期待結果**:
- TypeScriptコンパイル時にエラーが発生する
- プロパティが必須であることが型定義で保証される

---

#### TC-H-102: currentPath未指定時のデフォルト動作

**テスト目的**: currentPathが未指定の場合にデフォルト値が適用されることを確認

**テストカテゴリ**: 境界値

**関連要件**: header-footer-requirements.md（EDGE-001）

**テスト手順**:
```typescript
it('currentPath未指定の場合はデフォルトで"/"が適用される', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Header, {
    props: { siteTitle: 'Test Blog' } // currentPathなし
  });

  // デフォルトでホーム（/）がアクティブになる
  expect(result).toMatch(/href="\/"[^>]*aria-current="page"/);
});
```

**期待結果**:
- `currentPath`が未指定の場合、デフォルトで`/`（ホーム）がアクティブになる

---

#### TC-H-103: 存在しないパスがcurrentPathに指定された場合

**テスト目的**: ナビゲーションメニューに存在しないパスが指定された場合の動作を確認

**テストカテゴリ**: 境界値

**関連要件**: header-footer-requirements.md（EDGE-002）

**テスト手順**:
```typescript
it('存在しないパスが指定された場合はどのリンクもアクティブにならない', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Header, {
    props: { siteTitle: 'Test Blog', currentPath: '/nonexistent' }
  });

  // aria-current="page"が含まれないことを確認
  expect(result).not.toContain('aria-current="page"');
});
```

**期待結果**:
- どのナビゲーションリンクもアクティブ状態にならない
- `aria-current="page"`が設定されない

---

#### TC-H-104: 非常に長いsiteTitle

**テスト目的**: siteTitleが非常に長い場合のレスポンシブ表示を確認

**テストカテゴリ**: 境界値

**関連要件**: header-footer-requirements.md（EDGE-103）

**テスト手順**:
```typescript
it('非常に長いsiteTitleは適切に省略される', async () => {
  const container = await AstroContainer.create();
  const longTitle = 'これは非常に長いサイトタイトルでモバイル表示時には省略されるべきテキストです'.repeat(3);

  const result = await container.renderToString(Header, {
    props: { siteTitle: longTitle }
  });

  // truncateまたはbreak-wordsクラスが適用されることを確認
  expect(result).toMatch(/class="[^"]*(?:truncate|break-words)/);
  expect(result).toContain(longTitle);
});
```

**期待結果**:
- 長いタイトルが正しくレンダリングされる
- `truncate`または`break-words`クラスが適用される

---

#### TC-H-105: XSS攻撃対策（HTMLエスケープ）

**テスト目的**: siteTitleに悪意のあるHTMLタグが含まれていてもエスケープされることを確認

**テストカテゴリ**: セキュリティ

**関連要件**: セキュリティ制約（XSS対策）

**テスト手順**:
```typescript
it('siteTitleに含まれるHTMLタグがエスケープされる', async () => {
  const container = await AstroContainer.create();
  const maliciousTitle = '<script>alert("XSS")</script>Blog';

  const result = await container.renderToString(Header, {
    props: { siteTitle: maliciousTitle }
  });

  // <script>タグがエスケープされることを確認
  expect(result).not.toContain('<script>alert("XSS")</script>');
  expect(result).toContain('&lt;script&gt;');
});
```

**期待結果**:
- Astroのデフォルトエスケープ処理により`<script>`タグが無害化される
- XSS攻撃が防止される

---

### 2.3 アクセシビリティテストケース（Header）

#### TC-H-201: セマンティックHTML使用（NFR-301）

**テスト目的**: セマンティックHTMLタグ（`<header>`, `<nav>`）が正しく使用されていることを確認

**テストカテゴリ**: アクセシビリティ（WCAG 2.1 AA）

**関連要件**: NFR-301（セマンティックHTML）

**テスト手順**:
```typescript
it('セマンティックHTML（<header>, <nav>）が使用されている', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Header, {
    props: { siteTitle: 'Test Blog' }
  });

  // <header>タグが使用されている
  expect(result).toMatch(/<header[^>]*>/);
  expect(result).toContain('</header>');

  // <nav>タグが使用されている
  expect(result).toMatch(/<nav[^>]*>/);
  expect(result).toContain('</nav>');

  // ナビゲーションがリストで構造化されている
  expect(result).toContain('<ul>');
  expect(result).toContain('<li>');
});
```

**期待結果**:
- `<header>`, `<nav>`, `<ul>`, `<li>`タグが使用されている
- `<div>`ベースのナビゲーションではない

---

#### TC-H-202: ARIAラベル設定（NFR-303）

**テスト目的**: ARIA属性（`aria-label`, `aria-current`）が適切に設定されていることを確認

**テストカテゴリ**: アクセシビリティ（WCAG 2.1 AA）

**関連要件**: NFR-303（ARIAラベル）

**テスト手順**:
```typescript
it('ARIAラベル（aria-label, aria-current）が正しく設定されている', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Header, {
    props: { siteTitle: 'Test Blog', currentPath: '/blog' }
  });

  // ナビゲーションにaria-labelが設定されている
  expect(result).toContain('aria-label="メインナビゲーション"');

  // 現在のページにaria-current="page"が設定されている
  expect(result).toMatch(/href="\/blog"[^>]*aria-current="page"/);
});
```

**期待結果**:
- `<nav>`に`aria-label="メインナビゲーション"`が設定される
- 現在のページリンクに`aria-current="page"`が設定される

---

#### TC-H-203: フォーカス可視化スタイル（NFR-304）

**テスト目的**: ナビゲーションリンクにフォーカス可視化スタイルが適用されることを確認

**テストカテゴリ**: アクセシビリティ（WCAG 2.1 AA）

**関連要件**: NFR-304（フォーカス可視化）

**テスト手順**:
```typescript
it('ナビゲーションリンクにフォーカス可視化スタイルが適用される', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Header, {
    props: { siteTitle: 'Test Blog' }
  });

  // フォーカススタイルクラスが含まれている
  expect(result).toMatch(/class="[^"]*focus[^"]*"/);
});
```

**期待結果**:
- リンクにフォーカススタイルクラス（`focus:outline-none`, `focus-visible:ring-2`等）が適用される

---

#### TC-H-204: キーボードナビゲーション対応（NFR-302）

**テスト目的**: すべてのナビゲーションリンクが`<a>`タグで実装されキーボード操作可能であることを確認

**テストカテゴリ**: アクセシビリティ（WCAG 2.1 AA）

**関連要件**: NFR-302（キーボードナビゲーション）

**テスト手順**:
```typescript
it('ナビゲーションリンクがすべて<a>タグで実装されている', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Header, {
    props: { siteTitle: 'Test Blog' }
  });

  // すべてのナビゲーション項目が<a>タグで実装されている
  const linkMatches = result.match(/<a\s+href="[^"]+"/g);
  expect(linkMatches).toBeDefined();
  expect(linkMatches!.length).toBeGreaterThanOrEqual(5); // 最低5つのリンク

  // ボタンではなくリンクが使用されている（<button>が含まれない）
  expect(result).not.toMatch(/<button[^>]*>ホーム<\/button>/);
});
```

**期待結果**:
- すべてのナビゲーション項目が`<a>`タグで実装される
- Tabキーで移動可能、Enterキーでアクティブ化可能

---

### 2.4 スタイリングテストケース（Header）

#### TC-H-301: ダークモード対応スタイル

**テスト目的**: ダークモード用のスタイルクラスが適用されていることを確認

**テストカテゴリ**: スタイリング

**関連要件**: note.md（ダークモード対応）

**テスト手順**:
```typescript
it('ダークモード用スタイルクラスが適用されている', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Header, {
    props: { siteTitle: 'Test Blog' }
  });

  // dark:プレフィックスクラスが含まれている
  expect(result).toMatch(/class="[^"]*dark:[^"]*"/);
});
```

**期待結果**:
- `dark:`プレフィックスを持つTailwindクラスが適用される

---

#### TC-H-302: レスポンシブデザインクラス

**テスト目的**: レスポンシブデザイン用のブレークポイントクラスが適用されていることを確認

**テストカテゴリ**: スタイリング

**関連要件**: note.md（レスポンシブデザイン）

**テスト手順**:
```typescript
it('レスポンシブデザインクラス（sm:, md:, lg:）が適用されている', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Header, {
    props: { siteTitle: 'Test Blog' }
  });

  // レスポンシブブレークポイントクラスが含まれている
  expect(result).toMatch(/class="[^"]*(?:sm:|md:|lg:)/);
});
```

**期待結果**:
- モバイル（`sm:`）、タブレット（`md:`）、デスクトップ（`lg:`）用クラスが適用される

---

## 3. Footer.astro テストケース

### 3.1 正常系テストケース

#### TC-F-001: 基本レンダリングテスト

**テスト目的**: フッターコンポーネントが正しくレンダリングされることを確認

**テストカテゴリ**: 正常系

**関連要件**: NFR-301（セマンティックHTML）

**テスト手順**:
```typescript
it('フッターコンポーネントが正しくレンダリングされる', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Footer, {
    props: { siteName: 'Test Blog' }
  });

  expect(result).toContain('<footer>');
  expect(result).toContain('</footer>');
  expect(result).toContain('Test Blog');
});
```

**期待結果**:
- `<footer>`タグが存在する
- `siteName`が正しく表示される

---

#### TC-F-002: Props反映テスト（siteName）

**テスト目的**: siteNameプロパティが正しくレンダリングに反映されることを確認

**テストカテゴリ**: 正常系

**関連要件**: TypeScript strict mode、Props型定義

**テスト手順**:
```typescript
it('Props（siteName）が正しく反映される', async () => {
  const container = await AstroContainer.create();

  // ケース1: 標準的なサイト名
  const result1 = await container.renderToString(Footer, {
    props: { siteName: 'My Custom Blog' }
  });
  expect(result1).toContain('My Custom Blog');

  // ケース2: 日本語サイト名
  const result2 = await container.renderToString(Footer, {
    props: { siteName: 'エンジニアブログ' }
  });
  expect(result2).toContain('エンジニアブログ');
});
```

**期待結果**:
- 英語・日本語どちらも正しく表示される
- エスケープ処理が適切に動作する

---

#### TC-F-003: コピーライト表記テスト

**テスト目的**: コピーライト表記が正しく生成されることを確認

**テストカテゴリ**: 正常系

**関連要件**: header-footer-requirements.md（Footer仕様）

**テスト手順**:
```typescript
it('コピーライト表記が正しく生成される', async () => {
  const container = await AstroContainer.create();

  // ケース1: copyrightYear指定あり
  const result1 = await container.renderToString(Footer, {
    props: { siteName: 'Test Blog', copyrightYear: '2025' }
  });
  expect(result1).toContain('© 2025');
  expect(result1).toContain('Test Blog');

  // ケース2: copyrightYear指定なし（現在年がデフォルト）
  const result2 = await container.renderToString(Footer, {
    props: { siteName: 'Test Blog' }
  });
  const currentYear = new Date().getFullYear().toString();
  expect(result2).toContain(`© ${currentYear}`);
});
```

**期待結果**:
- `copyrightYear`が指定された場合はその年が表示される
- 未指定の場合は現在年が表示される

---

#### TC-F-004: RSSリンク生成テスト

**テスト目的**: RSSフィードへのリンクが正しく生成されることを確認

**テストカテゴリ**: 正常系

**関連要件**: REQ-601（RSSフィード生成）

**テスト手順**:
```typescript
it('RSSフィードリンクが正しく生成される', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Footer, {
    props: { siteName: 'Test Blog' }
  });

  expect(result).toContain('href="/rss.xml"');
  expect(result).toContain('RSS');
});
```

**期待結果**:
- `/rss.xml`へのリンクが生成される
- リンクテキストに「RSS」が含まれる

---

### 3.2 異常系・境界値テストケース

#### TC-F-101: siteName未指定エラー

**テスト目的**: siteNameが未指定の場合にTypeScriptコンパイルエラーが発生することを確認

**テストカテゴリ**: 異常系

**関連要件**: TypeScript strict mode

**テスト手順**:
```typescript
it('siteNameが未指定の場合は型エラー', () => {
  // TypeScriptコンパイル時にエラーとなることを確認
  // @ts-expect-error - siteName is required
  const result = Footer({ props: {} });
});
```

**期待結果**:
- TypeScriptコンパイル時にエラーが発生する
- プロパティが必須であることが型定義で保証される

---

#### TC-F-102: copyrightYear未指定時のデフォルト動作

**テスト目的**: copyrightYearが未指定の場合に現在年がデフォルト値として適用されることを確認

**テストカテゴリ**: 境界値

**関連要件**: header-footer-requirements.md（Footer Props仕様）

**テスト手順**:
```typescript
it('copyrightYear未指定の場合は現在年が適用される', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Footer, {
    props: { siteName: 'Test Blog' } // copyrightYearなし
  });

  const currentYear = new Date().getFullYear().toString();
  expect(result).toContain(`© ${currentYear}`);
});
```

**期待結果**:
- `copyrightYear`が未指定の場合、現在年が自動的に表示される

---

#### TC-F-103: 非常に長いsiteName

**テスト目的**: siteNameが非常に長い場合の表示を確認

**テストカテゴリ**: 境界値

**関連要件**: header-footer-requirements.md（EDGE-103類似）

**テスト手順**:
```typescript
it('非常に長いsiteNameが正しく表示される', async () => {
  const container = await AstroContainer.create();
  const longName = 'これは非常に長いサイト名でフッター表示時にも正しくレンダリングされるべきテキストです'.repeat(2);

  const result = await container.renderToString(Footer, {
    props: { siteName: longName }
  });

  expect(result).toContain(longName);
});
```

**期待結果**:
- 長いサイト名が正しくレンダリングされる
- 必要に応じて折り返しまたは省略される

---

#### TC-F-104: XSS攻撃対策（HTMLエスケープ）

**テスト目的**: siteNameに悪意のあるHTMLタグが含まれていてもエスケープされることを確認

**テストカテゴリ**: セキュリティ

**関連要件**: セキュリティ制約（XSS対策）

**テスト手順**:
```typescript
it('siteNameに含まれるHTMLタグがエスケープされる', async () => {
  const container = await AstroContainer.create();
  const maliciousName = '<img src=x onerror=alert("XSS")>Blog';

  const result = await container.renderToString(Footer, {
    props: { siteName: maliciousName }
  });

  // <img>タグがエスケープされることを確認
  expect(result).not.toContain('<img src=x onerror=alert("XSS")>');
  expect(result).toContain('&lt;img');
});
```

**期待結果**:
- Astroのデフォルトエスケープ処理により悪意のあるタグが無害化される
- XSS攻撃が防止される

---

### 3.3 アクセシビリティテストケース（Footer）

#### TC-F-201: セマンティックHTML使用（NFR-301）

**テスト目的**: セマンティックHTMLタグ（`<footer>`）が正しく使用されていることを確認

**テストカテゴリ**: アクセシビリティ（WCAG 2.1 AA）

**関連要件**: NFR-301（セマンティックHTML）

**テスト手順**:
```typescript
it('セマンティックHTML（<footer>）が使用されている', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Footer, {
    props: { siteName: 'Test Blog' }
  });

  // <footer>タグが使用されている
  expect(result).toMatch(/<footer[^>]*>/);
  expect(result).toContain('</footer>');
});
```

**期待結果**:
- `<footer>`タグが使用されている
- `<div class="footer">`ではない

---

#### TC-F-202: ARIAラベル設定（NFR-303）

**テスト目的**: フッターナビゲーションにARIA属性が適切に設定されていることを確認

**テストカテゴリ**: アクセシビリティ（WCAG 2.1 AA）

**関連要件**: NFR-303（ARIAラベル）

**テスト手順**:
```typescript
it('フッターナビゲーションにaria-labelが設定されている', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Footer, {
    props: { siteName: 'Test Blog' }
  });

  // フッターナビゲーションにaria-labelが設定されている
  expect(result).toContain('aria-label="フッターナビゲーション"');
});
```

**期待結果**:
- フッター内の`<nav>`に`aria-label="フッターナビゲーション"`が設定される

---

### 3.4 スタイリングテストケース（Footer）

#### TC-F-301: ダークモード対応スタイル

**テスト目的**: ダークモード用のスタイルクラスが適用されていることを確認

**テストカテゴリ**: スタイリング

**関連要件**: note.md（ダークモード対応）

**テスト手順**:
```typescript
it('ダークモード用スタイルクラスが適用されている', async () => {
  const container = await AstroContainer.create();
  const result = await container.renderToString(Footer, {
    props: { siteName: 'Test Blog' }
  });

  // dark:プレフィックスクラスが含まれている
  expect(result).toMatch(/class="[^"]*dark:[^"]*"/);
});
```

**期待結果**:
- `dark:`プレフィックスを持つTailwindクラスが適用される

---

## 4. アクセシビリティテストケース

### 4.1 WCAG 2.1 AA準拠総合テスト

#### TC-A-001: セマンティックHTML総合チェック（NFR-301）

**テスト目的**: Header・FooterともにセマンティックHTMLが正しく使用されていることを総合的に確認

**テストカテゴリ**: アクセシビリティ（WCAG 2.1 AA）

**関連要件**: NFR-301

**テスト手順**:
```typescript
it('Header・FooterがセマンティックHTMLで構成されている', async () => {
  const container = await AstroContainer.create();

  // Header
  const headerResult = await container.renderToString(Header, {
    props: { siteTitle: 'Test Blog' }
  });
  expect(headerResult).toMatch(/<header[^>]*>/);
  expect(headerResult).toMatch(/<nav[^>]*>/);

  // Footer
  const footerResult = await container.renderToString(Footer, {
    props: { siteName: 'Test Blog' }
  });
  expect(footerResult).toMatch(/<footer[^>]*>/);

  // divベースの実装でないことを確認
  expect(headerResult).not.toMatch(/<div[^>]*class="[^"]*header[^"]*"/);
  expect(footerResult).not.toMatch(/<div[^>]*class="[^"]*footer[^"]*"/);
});
```

**期待結果**:
- すべてのコンポーネントがセマンティックHTMLで実装される
- `<div class="header">`, `<div class="footer">`のようなアンチパターンが存在しない

---

#### TC-A-002: キーボードナビゲーション総合チェック（NFR-302）

**テスト目的**: すべてのインタラクティブ要素がキーボード操作可能であることを確認

**テストカテゴリ**: アクセシビリティ（WCAG 2.1 AA）

**関連要件**: NFR-302

**テスト手順**:
```typescript
it('すべてのリンクが<a>タグで実装されキーボード操作可能', async () => {
  const container = await AstroContainer.create();

  // Header
  const headerResult = await container.renderToString(Header, {
    props: { siteTitle: 'Test Blog' }
  });

  // すべてのナビゲーション項目が<a>タグ
  const headerLinks = headerResult.match(/<a\s+href="[^"]+"/g);
  expect(headerLinks).toBeDefined();
  expect(headerLinks!.length).toBeGreaterThanOrEqual(5);

  // Footer
  const footerResult = await container.renderToString(Footer, {
    props: { siteName: 'Test Blog' }
  });

  // RSSリンクが<a>タグ
  expect(footerResult).toMatch(/<a\s+href="\/rss\.xml"/);
});
```

**期待結果**:
- すべてのリンクが`<a>`タグで実装される
- Tabキーで移動可能、Enterキーでアクティブ化可能

---

#### TC-A-003: ARIAラベル総合チェック（NFR-303）

**テスト目的**: ARIA属性が適切に設定されていることを総合的に確認

**テストカテゴリ**: アクセシビリティ（WCAG 2.1 AA）

**関連要件**: NFR-303

**テスト手順**:
```typescript
it('ARIA属性が適切に設定されている', async () => {
  const container = await AstroContainer.create();

  // Header
  const headerResult = await container.renderToString(Header, {
    props: { siteTitle: 'Test Blog', currentPath: '/blog' }
  });
  expect(headerResult).toContain('aria-label="メインナビゲーション"');
  expect(headerResult).toContain('aria-current="page"');

  // Footer
  const footerResult = await container.renderToString(Footer, {
    props: { siteName: 'Test Blog' }
  });
  expect(footerResult).toContain('aria-label="フッターナビゲーション"');
});
```

**期待結果**:
- すべての`<nav>`に適切な`aria-label`が設定される
- 現在のページに`aria-current="page"`が設定される

---

#### TC-A-004: フォーカス可視化総合チェック（NFR-304）

**テスト目的**: すべてのインタラクティブ要素にフォーカス可視化スタイルが適用されることを確認

**テストカテゴリ**: アクセシビリティ（WCAG 2.1 AA）

**関連要件**: NFR-304

**テスト手順**:
```typescript
it('すべてのリンクにフォーカス可視化スタイルが適用される', async () => {
  const container = await AstroContainer.create();

  // Header
  const headerResult = await container.renderToString(Header, {
    props: { siteTitle: 'Test Blog' }
  });
  expect(headerResult).toMatch(/class="[^"]*focus[^"]*"/);

  // Footer
  const footerResult = await container.renderToString(Footer, {
    props: { siteName: 'Test Blog' }
  });
  expect(footerResult).toMatch(/class="[^"]*focus[^"]*"/);
});
```

**期待結果**:
- すべてのリンクにフォーカススタイルクラスが適用される
- global.cssの`*:focus-visible`スタイルが有効

---

## 5. パフォーマンステストケース

### 5.1 ゼロJavaScript確認

#### TC-P-001: JavaScriptが含まれないことを確認

**テスト目的**: Header・Footerコンポーネントに不要なJavaScriptが含まれないことを確認

**テストカテゴリ**: パフォーマンス

**関連要件**: NFR-001、REQ-903（SSGのみ、ゼロJavaScriptデフォルト）

**テスト手順**:
```typescript
it('Header・Footerに<script>タグが含まれない', async () => {
  const container = await AstroContainer.create();

  // Header
  const headerResult = await container.renderToString(Header, {
    props: { siteTitle: 'Test Blog' }
  });
  expect(headerResult).not.toContain('<script>');
  expect(headerResult).not.toContain('<script ');

  // Footer
  const footerResult = await container.renderToString(Footer, {
    props: { siteName: 'Test Blog' }
  });
  expect(footerResult).not.toContain('<script>');
  expect(footerResult).not.toContain('<script ');
});
```

**期待結果**:
- Header・Footerともに`<script>`タグが含まれない
- 完全な静的HTMLとして生成される

---

### 5.2 HTML出力サイズ確認

#### TC-P-002: HTML出力サイズが妥当な範囲であることを確認

**テスト目的**: Header・FooterのHTML出力サイズが過大でないことを確認

**テストカテゴリ**: パフォーマンス

**関連要件**: NFR-001（Lighthouse 90+点）

**テスト手順**:
```typescript
it('Header・FooterのHTML出力サイズが妥当な範囲', async () => {
  const container = await AstroContainer.create();

  // Header
  const headerResult = await container.renderToString(Header, {
    props: { siteTitle: 'Test Blog' }
  });
  expect(headerResult.length).toBeLessThan(5000); // 5KB未満

  // Footer
  const footerResult = await container.renderToString(Footer, {
    props: { siteName: 'Test Blog' }
  });
  expect(footerResult.length).toBeLessThan(2000); // 2KB未満
});
```

**期待結果**:
- Headerの出力サイズが5KB未満
- Footerの出力サイズが2KB未満

---

## 6. テストカバレッジ目標

### 6.1 カバレッジ目標

| コンポーネント | ステートメントカバレッジ | ブランチカバレッジ | 関数カバレッジ |
|--------------|---------------------|------------------|---------------|
| **Header.astro** | 85%以上 | 80%以上 | 85%以上 |
| **Footer.astro** | 85%以上 | 80%以上 | 85%以上 |
| **全体** | 80%以上 | 75%以上 | 80%以上 |

### 6.2 カバレッジ計測コマンド

```bash
# カバレッジ計測
pnpm test:coverage

# カバレッジレポート確認
open coverage/index.html
```

### 6.3 品質基準

#### 必須チェック項目

- [ ] `pnpm test` がすべて通る
- [ ] `pnpm check` が型エラーなく通る
- [ ] `pnpm lint` がエラーなく通る
- [ ] テストカバレッジ80%以上
- [ ] すべてのアクセシビリティテスト（NFR-301～NFR-304）が通る

---

## テストケース統計

### テストケース総数

| カテゴリ | Header | Footer | 共通 | 合計 |
|---------|--------|--------|------|------|
| **正常系** | 4 | 4 | 0 | 8 |
| **異常系・境界値** | 5 | 4 | 0 | 9 |
| **アクセシビリティ** | 4 | 2 | 4 | 10 |
| **スタイリング** | 2 | 1 | 0 | 3 |
| **パフォーマンス** | 0 | 0 | 2 | 2 |
| **合計** | **15** | **11** | **6** | **32** |

### カバー範囲

#### 機能要件カバレッジ

- **REQ-601**: RSS Feed生成 ✅ TC-H-003, TC-F-004

#### 非機能要件カバレッジ

- **NFR-001**: Lighthouse 90+点 ✅ TC-P-001, TC-P-002
- **NFR-301**: セマンティックHTML ✅ TC-H-201, TC-F-201, TC-A-001
- **NFR-302**: キーボードナビゲーション ✅ TC-H-204, TC-A-002
- **NFR-303**: ARIAラベル ✅ TC-H-202, TC-F-202, TC-A-003
- **NFR-304**: フォーカス可視化 ✅ TC-H-203, TC-A-004

#### エッジケースカバレッジ

- **EDGE-001**: currentPath未指定 ✅ TC-H-102
- **EDGE-002**: 存在しないパス ✅ TC-H-103
- **EDGE-103**: 非常に長いテキスト ✅ TC-H-104, TC-F-103

---

## 実装順序（TDDサイクル）

### Phase 1: Red（テスト作成）

1. **Header正常系テスト作成** (TC-H-001～TC-H-004)
2. **Footer正常系テスト作成** (TC-F-001～TC-F-004)
3. **テスト実行→失敗確認**

### Phase 2: Green（最小実装）

4. **Header.astro最小実装** (正常系テストが通る最小限のコード)
5. **Footer.astro最小実装** (正常系テストが通る最小限のコード)
6. **テスト実行→成功確認**

### Phase 3: Refactor + Red（アクセシビリティテスト追加）

7. **アクセシビリティテスト追加** (TC-H-201～TC-H-204, TC-F-201～TC-F-202)
8. **テスト実行→失敗確認**

### Phase 4: Green（アクセシビリティ実装）

9. **ARIA属性・セマンティックHTML実装**
10. **テスト実行→成功確認**

### Phase 5: Refactor + Red（境界値・異常系テスト追加）

11. **境界値・異常系テスト追加** (TC-H-101～TC-H-105, TC-F-101～TC-F-104)
12. **テスト実行→失敗/成功確認**

### Phase 6: Green（エッジケース対応）

13. **デフォルト値・エラーハンドリング実装**
14. **テスト実行→成功確認**

### Phase 7: Final Refactor

15. **コードリファクタリング**（重複排除、可読性向上）
16. **全テスト実行→成功確認**
17. **カバレッジ確認→80%以上**

---

**最終更新日**: 2025-12-31
**作成者**: Claude Sonnet 4.5 (TDD開発エージェント)
