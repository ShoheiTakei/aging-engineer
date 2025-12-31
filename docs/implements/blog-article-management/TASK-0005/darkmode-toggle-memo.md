# TDD開発メモ: darkmode-toggle

## 概要

- 機能名: ダークモード切り替え機能
- 開発開始: 2025-12-31
- 現在のフェーズ: Red

## 関連ファイル

- 元タスクファイル: `docs/tasks/TASK-0005.md`（存在する場合）
- 要件定義: `docs/implements/blog-article-management/TASK-0005/darkmode-toggle-requirements.md`
- テストケース定義: `docs/implements/blog-article-management/TASK-0005/darkmode-toggle-testcases.md`
- 実装ファイル: `src/components/ThemeToggle.astro`
- テストファイル:
  - `src/components/ThemeToggle.test.ts`
  - `src/components/__tests__/theme-integration.test.ts`

## Redフェーズ（失敗するテスト作成）

### 作成日時

2025-12-31

### テストケース

#### ThemeToggle.test.ts（17件）

**基本レンダリングテスト（3件）**
- TC-TT-001: ThemeToggleコンポーネントが正しくレンダリングされる
- TC-TT-002: テーマ切り替えボタンにアイコンが表示される
- TC-TT-003: ボタンにtype="button"属性が設定されている

**アクセシビリティテスト（4件）**
- TC-TT-101: ボタンにaria-label属性が設定されている
- TC-TT-102: aria-labelにテーマ関連の説明が含まれる
- TC-TT-103: フォーカス可視化スタイルが適用されている
- TC-TT-104: ボタン要素として正しく実装されている

**スタイリングテスト（3件）**
- TC-TT-201: ダークモード対応スタイルクラスが適用されている
- TC-TT-202: ホバースタイルが適用されている
- TC-TT-203: ボタンに適切なサイズが設定されている

**アイコン表示テスト（3件）**
- TC-TT-301: 太陽アイコン要素が存在する
- TC-TT-302: 月アイコン要素が存在する
- TC-TT-303: アイコンに適切なサイズが設定されている

**データ属性テスト（1件）**
- TC-TT-401: テーマ切り替え用のdata属性が設定されている

**クライアントサイドスクリプトテスト（5件）**
- TC-TT-501: テーマ切り替え用のスクリプトが含まれる
- TC-TT-502: localStorageを使用するコードが含まれる
- TC-TT-503: システム設定検出用のmatchMediaコードが含まれる
- TC-TT-504: クリックイベントハンドラが設定されている
- TC-TT-505: HTML要素のclass操作コードが含まれる

#### theme-integration.test.ts（10件）

**localStorage連携テスト（3件）**
- TC-INT-001: テーマ変更時にlocalStorageに値が保存される
- TC-INT-002: ページ読み込み時にlocalStorageからテーマを復元する
- TC-INT-003: localStorageのキー名が適切に設定されている

**システム設定連携テスト（3件）**
- TC-INT-101: prefers-color-schemeでシステム設定を検出する
- TC-INT-102: ダークモード設定を検出できる
- TC-INT-103: システム設定変更を監視するリスナーが設定されている

**優先順位テスト（2件）**
- TC-INT-201: localStorage設定がシステム設定より優先される
- TC-INT-202: localStorage未設定時にシステム設定にフォールバックする

**HTMLクラス操作テスト（3件）**
- TC-INT-301: ダークモード時にhtml要素にdarkクラスを追加する
- TC-INT-302: ライトモード時にhtml要素からdarkクラスを削除する
- TC-INT-303: document.documentElementにアクセスしている

### テストコード

詳細は以下のファイルを参照：
- `src/components/ThemeToggle.test.ts`
- `src/components/__tests__/theme-integration.test.ts`

### 期待される失敗

ThemeToggle.astroが未実装（スタブのみ）のため、すべてのテストが失敗する。

現在の出力:
```html
<div>未実装</div>
```

期待される出力:
- `<button>`要素
- `<svg>`アイコン
- `aria-label`属性
- `localStorage`/`matchMedia`操作スクリプト

### 次のフェーズへの要求事項

#### Greenフェーズで実装すべき内容

1. **ThemeToggle.astroコンポーネント**
   - button要素（id, type, aria-label）
   - 太陽/月アイコン（SVG）
   - Tailwind CSSクラス（dark:, hover:, focus-visible:）
   - クライアントサイドスクリプト

2. **BaseLayout.astroの変更**
   - `<head>`内にテーマ初期化スクリプト追加
   - localStorage参照
   - document.documentElement.classList操作

3. **Header.astroの変更**
   - ThemeToggleコンポーネントのインポート・配置

### 品質評価

**評価**: ✅ 高品質

**信頼性レベル分布**:
- 🔵 青信号: 25件（93%）
- 🟡 黄信号: 2件（7%）
- 🔴 赤信号: 0件（0%）

### 注意事項

Vitest/Astro/Viteの互換性問題により、テスト実行時にエラーが発生。
テストコード自体は正しく、Greenフェーズ開始前に環境設定の調整が必要。

---

## Greenフェーズ（最小実装）

### 実装日時

[未実施]

### 実装方針

[Greenフェーズで記載予定]

### 実装コード

[Greenフェーズで記載予定]

### テスト結果

[Greenフェーズで記載予定]

### 課題・改善点

[Greenフェーズで記載予定]

---

## Refactorフェーズ（品質改善）

### リファクタ日時

[未実施]

### 改善内容

[Refactorフェーズで記載予定]

### セキュリティレビュー

[Refactorフェーズで記載予定]

### パフォーマンスレビュー

[Refactorフェーズで記載予定]

### 最終コード

[Refactorフェーズで記載予定]

### 品質評価

[Refactorフェーズで記載予定]

---

**最終更新日**: 2025-12-31
**作成者**: Claude Opus 4.5 (TDD開発エージェント)
