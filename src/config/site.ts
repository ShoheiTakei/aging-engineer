/**
 * サイト設定ファイル
 *
 * SEO・OGP・JSON-LD・RSSなどで使用するサイト情報を一元管理します。
 *
 * 要件:
 * - NFR-101: SEO最適化（メタタグ）
 * - NFR-102: OGPメタタグ設定
 * - NFR-103: サイトマップ生成
 * - NFR-104: 構造化データ（JSON-LD）
 * - REQ-401: RSS Feed生成機能
 *
 * 信頼性: 🔵 requirements.mdより
 */

export interface SiteConfig {
  /** サイト名 */
  name: string;
  /** サイトフルネーム（SEO用） */
  fullName: string;
  /** サイトのベースURL */
  url: string;
  /** サイトの説明 */
  description: string;
  /** サイトのフル説明（SEO用） */
  fullDescription: string;
  /** 著者情報 */
  author: {
    name: string;
    url?: string;
  };
  /** 言語 */
  language: string;
  /** RSS Feed設定 */
  rss: {
    title: string;
    description: string;
  };
  /** ソーシャルリンク */
  social?: {
    twitter?: string;
    github?: string;
  };
}

/**
 * サイト設定
 *
 * astro.config.mjsの`site`オプションと一致させてください。
 */
export const siteConfig: SiteConfig = {
  name: 'Aging Engineer',
  fullName: 'Aging Engineer',
  url: 'https://aging-engineer.com',
  description: '20代からのエンジニアリング。経験と知識を活かした技術情報を発信します。',
  fullDescription: 'Aging Engineer - エンジニアリングブログ',
  author: {
    name: 'Aging Engineer',
    url: 'https://aging-engineer.com',
  },
  language: 'ja',
  rss: {
    title: 'Aging Engineer',
    description: 'Aging Engineerの技術ブログ',
  },
  social: {
    github: 'https://github.com/aging-engineer',
  },
};

/**
 * デフォルトのOGP画像URL
 */
export const defaultOgImage = `${siteConfig.url}/og-default.png`;
