/**
 * テーマ統合テスト
 *
 * localStorageとシステム設定（matchMedia）の統合テスト
 *
 * 関連要件:
 * - REQ-DM-003: テーマ状態の保持（localStorage）
 * - REQ-DM-004: システム設定との連携（matchMedia）
 * - REQ-DM-002: 手動テーマ切り替え
 *
 * 関連文書:
 * - テストケース定義書: docs/implements/blog-article-management/TASK-0005/darkmode-toggle-testcases.md
 * - 要件定義書: docs/implements/blog-article-management/TASK-0005/darkmode-toggle-requirements.md
 */

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// ThemeToggle コンポーネントはまだ未実装（Red フェーズ）
import ThemeToggle from '../ThemeToggle.astro';

// localStorageのモック
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// matchMediaのモック
const createMatchMediaMock = (matches: boolean) => {
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

describe('テーマ統合テスト（localStorage、システム設定）', () => {
  let container: AstroContainer;

  beforeEach(async () => {
    // 【テスト前準備】: 各テスト実行前にAstroContainerを初期化
    // 【環境初期化】: モックをリセットしてクリーンな状態にする
    container = await AstroContainer.create();

    // localStorageモックをグローバルに設定
    vi.stubGlobal('localStorage', mockLocalStorage);
    mockLocalStorage.clear();
  });

  afterEach(() => {
    // 【テスト後処理】: モックをリセット
    // 【状態復元】: 次のテストに影響しないようにする
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  // ========================================
  // 1. localStorage連携テスト
  // ========================================

  describe('localStorage連携テスト', () => {
    // TC-INT-001: localStorageにテーマキーが保存される
    it('TC-INT-001: テーマ変更時にlocalStorageに値が保存される', async () => {
      // 【テスト目的】: テーマ切り替え時にlocalStorageに値が保存されることを確認
      // 【テスト内容】: スクリプト内でlocalStorage.setItemが呼ばれることを検証
      // 【期待される動作】: 'theme'キーで値が保存される
      // 🔵 信頼性レベル: ユーザー提供のテストケース定義に基づく

      const result = await container.renderToString(ThemeToggle, {
        props: {},
      });

      // 【結果検証】: localStorageへの保存コードの存在
      // 【期待値確認】: setItem呼び出しが含まれること
      expect(result).toMatch(/localStorage\s*\.\s*setItem/); // 【確認内容】: setItem呼び出し 🔵
    });

    // TC-INT-002: localStorageから初期テーマを読み込む
    it('TC-INT-002: ページ読み込み時にlocalStorageからテーマを復元する', async () => {
      // 【テスト目的】: 初期化時にlocalStorageから保存済みテーマを読み込むことを確認
      // 【テスト内容】: スクリプト内でlocalStorage.getItemが呼ばれることを検証
      // 【期待される動作】: 'theme'キーの値を読み込んで適用する
      // 🔵 信頼性レベル: ユーザー提供のテストケース定義に基づく

      const result = await container.renderToString(ThemeToggle, {
        props: {},
      });

      // 【結果検証】: localStorageからの読み込みコードの存在
      // 【期待値確認】: getItem呼び出しが含まれること
      expect(result).toMatch(/localStorage\s*\.\s*getItem/); // 【確認内容】: getItem呼び出し 🔵
    });

    // TC-INT-003: テーマキー名が'theme'である
    it('TC-INT-003: localStorageのキー名が適切に設定されている', async () => {
      // 【テスト目的】: localStorageのキー名が一貫して使用されていることを確認
      // 【テスト内容】: 'theme'キーがスクリプト内で使用されていることを検証
      // 【期待される動作】: 'theme'または適切なキー名が使用される
      // 🔵 信頼性レベル: ユーザー提供のテストケース定義に基づく

      const result = await container.renderToString(ThemeToggle, {
        props: {},
      });

      // 【結果検証】: キー名の確認
      // 【期待値確認】: 'theme'キーが使用されていること
      expect(result).toMatch(/['"]theme['"]/); // 【確認内容】: themeキー 🔵
    });
  });

  // ========================================
  // 2. システム設定連携テスト
  // ========================================

  describe('システム設定連携テスト', () => {
    // TC-INT-101: システムのダークモード設定を検出する
    it('TC-INT-101: prefers-color-schemeでシステム設定を検出する', async () => {
      // 【テスト目的】: OSのカラースキーム設定を検出するコードがあることを確認
      // 【テスト内容】: prefers-color-schemeメディアクエリの使用を検証
      // 【期待される動作】: matchMediaでシステム設定を検出する
      // 🔵 信頼性レベル: ユーザー提供のテストケース定義に基づく

      const result = await container.renderToString(ThemeToggle, {
        props: {},
      });

      // 【結果検証】: システム設定検出コードの存在
      // 【期待値確認】: prefers-color-schemeが使用されていること
      expect(result).toContain('prefers-color-scheme'); // 【確認内容】: カラースキーム検出 🔵
    });

    // TC-INT-102: darkスキームの検出
    it('TC-INT-102: ダークモード設定（prefers-color-scheme: dark）を検出できる', async () => {
      // 【テスト目的】: ダークモード設定を具体的に検出できることを確認
      // 【テスト内容】: 'dark'スキームの検出コードを検証
      // 【期待される動作】: prefers-color-scheme: darkを検出する
      // 🔵 信頼性レベル: ユーザー提供のテストケース定義に基づく

      const result = await container.renderToString(ThemeToggle, {
        props: {},
      });

      // 【結果検証】: ダークモード検出コードの存在
      // 【期待値確認】: 'dark'が検出対象に含まれること
      expect(result).toMatch(/prefers-color-scheme:\s*dark/); // 【確認内容】: dark検出 🔵
    });

    // TC-INT-103: システム設定変更のリスナー
    it('TC-INT-103: システム設定変更を監視するリスナーが設定されている', async () => {
      // 【テスト目的】: OSの設定変更をリアルタイムで検出できることを確認
      // 【テスト内容】: addEventListenerまたはaddListenerの設定を検証
      // 【期待される動作】: changeイベントリスナーが設定される
      // 🔵 信頼性レベル: ユーザー提供のテストケース定義に基づく

      const result = await container.renderToString(ThemeToggle, {
        props: {},
      });

      // 【結果検証】: 変更リスナーの設定
      // 【期待値確認】: addEventListener('change')またはaddListenerが含まれること
      expect(result).toMatch(/(?:addEventListener\s*\(\s*['"]change['"]|addListener|onchange)/); // 【確認内容】: 変更リスナー 🔵
    });
  });

  // ========================================
  // 3. 優先順位テスト
  // ========================================

  describe('テーマ優先順位テスト', () => {
    // TC-INT-201: localStorageがシステム設定より優先される
    it('TC-INT-201: localStorage設定がシステム設定より優先される', async () => {
      // 【テスト目的】: ユーザーの明示的な選択（localStorage）がシステム設定より優先されることを確認
      // 【テスト内容】: localStorage確認がmatchMedia確認より先に行われることを検証
      // 【期待される動作】: localStorageに値がある場合はシステム設定を無視する
      // 🔵 信頼性レベル: ユーザー提供のテストケース定義に基づく

      const result = await container.renderToString(ThemeToggle, {
        props: {},
      });

      // 【結果検証】: 優先順位ロジックの存在
      // 【期待値確認】: localStorageチェックが含まれること
      // getItemの結果を使用する条件分岐があること
      expect(result).toMatch(
        /localStorage\s*\.\s*getItem.*\|\|.*matchMedia|if\s*\([^)]*localStorage/,
      ); // 【確認内容】: 優先順位ロジック 🔵
    });

    // TC-INT-202: localStorage未設定時はシステム設定を使用
    it('TC-INT-202: localStorage未設定時にシステム設定にフォールバックする', async () => {
      // 【テスト目的】: localStorageに値がない場合にシステム設定が使用されることを確認
      // 【テスト内容】: フォールバックロジックの存在を検証
      // 【期待される動作】: localStorageがnullの場合matchMediaを使用する
      // 🔵 信頼性レベル: ユーザー提供のテストケース定義に基づく

      const result = await container.renderToString(ThemeToggle, {
        props: {},
      });

      // 【結果検証】: フォールバックロジックの存在
      // 【期待値確認】: matchMediaがフォールバックとして使用されること
      expect(result).toContain('matchMedia'); // 【確認内容】: matchMedia使用 🔵
    });
  });

  // ========================================
  // 4. HTMLクラス操作テスト
  // ========================================

  describe('HTMLクラス操作テスト', () => {
    // TC-INT-301: html要素にdarkクラスを追加できる
    it('TC-INT-301: ダークモード時にhtml要素にdarkクラスを追加する', async () => {
      // 【テスト目的】: ダークモード時に<html>要素にdarkクラスが追加されることを確認
      // 【テスト内容】: classList.add('dark')の呼び出しを検証
      // 【期待される動作】: document.documentElement.classList.add('dark')が実行される
      // 🔵 信頼性レベル: ユーザー提供のテストケース定義に基づく

      const result = await container.renderToString(ThemeToggle, {
        props: {},
      });

      // 【結果検証】: darkクラス追加コードの存在
      // 【期待値確認】: classList.add('dark')が含まれること
      expect(result).toMatch(/classList\s*\.\s*add\s*\(\s*['"]dark['"]\s*\)/); // 【確認内容】: darkクラス追加 🔵
    });

    // TC-INT-302: html要素からdarkクラスを削除できる
    it('TC-INT-302: ライトモード時にhtml要素からdarkクラスを削除する', async () => {
      // 【テスト目的】: ライトモード時に<html>要素からdarkクラスが削除されることを確認
      // 【テスト内容】: classList.remove('dark')の呼び出しを検証
      // 【期待される動作】: document.documentElement.classList.remove('dark')が実行される
      // 🔵 信頼性レベル: ユーザー提供のテストケース定義に基づく

      const result = await container.renderToString(ThemeToggle, {
        props: {},
      });

      // 【結果検証】: darkクラス削除コードの存在
      // 【期待値確認】: classList.remove('dark')が含まれること
      expect(result).toMatch(/classList\s*\.\s*remove\s*\(\s*['"]dark['"]\s*\)/); // 【確認内容】: darkクラス削除 🔵
    });

    // TC-INT-303: documentElementへのアクセス
    it('TC-INT-303: document.documentElementにアクセスしている', async () => {
      // 【テスト目的】: <html>要素への正しいアクセス方法が使用されていることを確認
      // 【テスト内容】: documentElementへのアクセスを検証
      // 【期待される動作】: document.documentElementが使用される
      // 🔵 信頼性レベル: ユーザー提供のテストケース定義に基づく

      const result = await container.renderToString(ThemeToggle, {
        props: {},
      });

      // 【結果検証】: documentElementアクセスの存在
      // 【期待値確認】: documentElementが使用されていること
      expect(result).toContain('documentElement'); // 【確認内容】: documentElement使用 🔵
    });
  });
});
