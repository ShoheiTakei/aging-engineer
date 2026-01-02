/**
 * 画像最適化ユーティリティ
 *
 * Cloudflare R2との統合とWebP/AVIF変換のサポート。
 *
 * 要件:
 * - TASK-0022: 画像最適化（Astro Image, R2統合）
 *
 * 信頼性: 🔵 tech-stack.md・TASK-0022より
 */

/** 画像フォーマットの型定義 */
export type ImageFormat = 'webp' | 'avif' | 'png' | 'jpeg' | 'jpg' | 'gif';

/** 画像サイズプリセット */
export interface ImageSizePreset {
  width: number;
  height: number;
  label: string;
}

/** R2画像URL設定 */
export interface R2ImageConfig {
  /** R2バケットのベースURL */
  baseUrl: string;
  /** アカウントID（任意） */
  accountId?: string;
  /** バケット名 */
  bucketName: string;
}

/** 一般的な画像サイズプリセット */
export const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150, label: 'サムネイル' },
  small: { width: 320, height: 240, label: '小' },
  medium: { width: 640, height: 480, label: '中' },
  large: { width: 1024, height: 768, label: '大' },
  hero: { width: 1920, height: 1080, label: 'ヒーロー' },
  ogImage: { width: 1200, height: 630, label: 'OGP画像' },
  coverImage: { width: 1200, height: 630, label: 'カバー画像' },
} as const satisfies Record<string, ImageSizePreset>;

/** レスポンシブ画像のブレークポイント */
export const RESPONSIVE_WIDTHS = [320, 640, 768, 1024, 1280, 1536, 1920] as const;

/**
 * 画像フォーマットのMIMEタイプを取得
 */
export function getImageMimeType(format: ImageFormat): string {
  const mimeTypes: Record<ImageFormat, string> = {
    webp: 'image/webp',
    avif: 'image/avif',
    png: 'image/png',
    jpeg: 'image/jpeg',
    jpg: 'image/jpeg',
    gif: 'image/gif',
  };
  return mimeTypes[format];
}

/**
 * ファイル名から拡張子を抽出
 */
export function getFileExtension(filename: string): string | null {
  const match = filename.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1].toLowerCase() : null;
}

/**
 * 画像URLがサポートされているフォーマットかどうかを確認
 */
export function isSupportedImageFormat(url: string): boolean {
  const ext = getFileExtension(url);
  if (!ext) return false;
  return ['webp', 'avif', 'png', 'jpeg', 'jpg', 'gif', 'svg'].includes(ext);
}

/**
 * R2ストレージのURLを生成
 */
export function buildR2Url(
  config: R2ImageConfig,
  path: string,
  options?: {
    format?: ImageFormat;
    width?: number;
    height?: number;
    quality?: number;
  },
): string {
  // パスの正規化（先頭のスラッシュを除去）
  const normalizedPath = path.replace(/^\/+/, '');

  // 基本URLの構築
  let url = `${config.baseUrl.replace(/\/+$/, '')}/${normalizedPath}`;

  // Cloudflare Image Resizingのパラメータを追加（R2 + Cloudflareを使用する場合）
  if (options) {
    const params: string[] = [];

    if (options.width) params.push(`w=${options.width}`);
    if (options.height) params.push(`h=${options.height}`);
    if (options.format) params.push(`f=${options.format}`);
    if (options.quality) params.push(`q=${options.quality}`);

    if (params.length > 0) {
      // Cloudflare Image Resizing形式
      // 例: /cdn-cgi/image/width=800,format=webp/path/to/image.jpg
      const imageParams = params.join(',');
      url = `${config.baseUrl.replace(/\/+$/, '')}/cdn-cgi/image/${imageParams}/${normalizedPath}`;
    }
  }

  return url;
}

/**
 * レスポンシブ画像用のsrcset文字列を生成
 */
export function generateSrcset(
  baseSrc: string,
  widths: readonly number[] = RESPONSIVE_WIDTHS,
  format?: ImageFormat,
): string {
  return widths
    .map((width) => {
      // 画像URLにサイズパラメータを追加
      const url = new URL(baseSrc, 'https://example.com');
      url.searchParams.set('w', width.toString());
      if (format) {
        url.searchParams.set('f', format);
      }
      return `${url.pathname}${url.search} ${width}w`;
    })
    .join(', ');
}

/**
 * アスペクト比を計算
 */
export function calculateAspectRatio(width: number, height: number): number {
  if (height === 0) return 0;
  return width / height;
}

/**
 * 指定されたアスペクト比に基づいて高さを計算
 */
export function calculateHeightFromWidth(width: number, aspectRatio: number): number {
  if (aspectRatio === 0) return 0;
  return Math.round(width / aspectRatio);
}

/**
 * 指定されたアスペクト比に基づいて幅を計算
 */
export function calculateWidthFromHeight(height: number, aspectRatio: number): number {
  return Math.round(height * aspectRatio);
}

/**
 * プレースホルダー画像URLを生成
 */
export function generatePlaceholderUrl(
  width: number,
  height: number,
  options?: {
    backgroundColor?: string;
    textColor?: string;
    text?: string;
  },
): string {
  const bg = options?.backgroundColor ?? 'e2e8f0';
  const fg = options?.textColor ?? '64748b';
  const text = options?.text ?? `${width}x${height}`;

  return `https://placehold.co/${width}x${height}/${bg}/${fg}?text=${encodeURIComponent(text)}`;
}

/**
 * 画像の遅延読み込み用のぼかしプレースホルダーを生成
 * 注: 実際の実装ではbase64エンコードされた小さな画像を使用
 */
export function generateBlurDataUrl(color = 'e2e8f0'): string {
  // シンプルな1x1ピクセルのSVGベースのプレースホルダー
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1" fill="#${color}"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * 環境変数からR2設定を取得
 */
export function getR2ConfigFromEnv(): R2ImageConfig | null {
  const baseUrl = import.meta.env.R2_BASE_URL;
  const bucketName = import.meta.env.R2_BUCKET_NAME;

  if (!baseUrl || !bucketName) {
    return null;
  }

  return {
    baseUrl,
    bucketName,
    accountId: import.meta.env.R2_ACCOUNT_ID,
  };
}

/**
 * 画像URLがR2かどうかを判定
 */
export function isR2Url(url: string): boolean {
  return url.includes('.r2.cloudflarestorage.com') || url.includes('r2.dev');
}

/**
 * 画像の最適化パラメータを取得
 */
export function getOptimizationParams(options: {
  width?: number;
  height?: number;
  format?: ImageFormat;
  quality?: number;
}): Record<string, string> {
  const params: Record<string, string> = {};

  if (options.width) params.width = options.width.toString();
  if (options.height) params.height = options.height.toString();
  if (options.format) params.format = options.format;
  if (options.quality) params.quality = options.quality.toString();

  return params;
}
