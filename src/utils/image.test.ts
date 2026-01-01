/**
 * 画像最適化ユーティリティのテスト
 *
 * TASK-0022: 画像最適化
 */

import { describe, expect, it } from 'vitest';
import {
  IMAGE_SIZES,
  RESPONSIVE_WIDTHS,
  buildR2Url,
  calculateAspectRatio,
  calculateHeightFromWidth,
  calculateWidthFromHeight,
  generateBlurDataUrl,
  generatePlaceholderUrl,
  getFileExtension,
  getImageMimeType,
  getOptimizationParams,
  isR2Url,
  isSupportedImageFormat,
} from './image';

describe('画像最適化ユーティリティ', () => {
  describe('IMAGE_SIZES', () => {
    it('すべてのプリセットサイズが定義されている', () => {
      expect(IMAGE_SIZES.thumbnail).toEqual({
        width: 150,
        height: 150,
        label: 'サムネイル',
      });
      expect(IMAGE_SIZES.small).toEqual({ width: 320, height: 240, label: '小' });
      expect(IMAGE_SIZES.medium).toEqual({ width: 640, height: 480, label: '中' });
      expect(IMAGE_SIZES.large).toEqual({ width: 1024, height: 768, label: '大' });
      expect(IMAGE_SIZES.hero).toEqual({
        width: 1920,
        height: 1080,
        label: 'ヒーロー',
      });
      expect(IMAGE_SIZES.ogImage).toEqual({
        width: 1200,
        height: 630,
        label: 'OGP画像',
      });
      expect(IMAGE_SIZES.coverImage).toEqual({
        width: 1200,
        height: 630,
        label: 'カバー画像',
      });
    });
  });

  describe('RESPONSIVE_WIDTHS', () => {
    it('レスポンシブ幅の配列が正しく定義されている', () => {
      expect(RESPONSIVE_WIDTHS).toEqual([320, 640, 768, 1024, 1280, 1536, 1920]);
    });
  });

  describe('getImageMimeType', () => {
    it('WebPのMIMEタイプを返す', () => {
      expect(getImageMimeType('webp')).toBe('image/webp');
    });

    it('AVIFのMIMEタイプを返す', () => {
      expect(getImageMimeType('avif')).toBe('image/avif');
    });

    it('PNGのMIMEタイプを返す', () => {
      expect(getImageMimeType('png')).toBe('image/png');
    });

    it('JPEGのMIMEタイプを返す', () => {
      expect(getImageMimeType('jpeg')).toBe('image/jpeg');
      expect(getImageMimeType('jpg')).toBe('image/jpeg');
    });

    it('GIFのMIMEタイプを返す', () => {
      expect(getImageMimeType('gif')).toBe('image/gif');
    });
  });

  describe('getFileExtension', () => {
    it('ファイル名から拡張子を抽出する', () => {
      expect(getFileExtension('image.png')).toBe('png');
      expect(getFileExtension('photo.JPEG')).toBe('jpeg');
      expect(getFileExtension('file.name.webp')).toBe('webp');
    });

    it('拡張子がない場合はnullを返す', () => {
      expect(getFileExtension('noextension')).toBeNull();
      expect(getFileExtension('')).toBeNull();
    });

    it('URLのパスからも拡張子を抽出できる', () => {
      expect(getFileExtension('https://example.com/path/to/image.avif')).toBe('avif');
    });
  });

  describe('isSupportedImageFormat', () => {
    it('サポートされている形式を正しく判定する', () => {
      expect(isSupportedImageFormat('image.webp')).toBe(true);
      expect(isSupportedImageFormat('image.avif')).toBe(true);
      expect(isSupportedImageFormat('image.png')).toBe(true);
      expect(isSupportedImageFormat('image.jpeg')).toBe(true);
      expect(isSupportedImageFormat('image.jpg')).toBe(true);
      expect(isSupportedImageFormat('image.gif')).toBe(true);
      expect(isSupportedImageFormat('image.svg')).toBe(true);
    });

    it('サポートされていない形式を正しく判定する', () => {
      expect(isSupportedImageFormat('image.bmp')).toBe(false);
      expect(isSupportedImageFormat('image.tiff')).toBe(false);
      expect(isSupportedImageFormat('document.pdf')).toBe(false);
      expect(isSupportedImageFormat('noextension')).toBe(false);
    });
  });

  describe('buildR2Url', () => {
    const config = {
      baseUrl: 'https://pub-example.r2.dev',
      bucketName: 'images',
    };

    it('基本的なR2 URLを生成する', () => {
      const url = buildR2Url(config, 'path/to/image.jpg');
      expect(url).toBe('https://pub-example.r2.dev/path/to/image.jpg');
    });

    it('先頭のスラッシュを正規化する', () => {
      const url = buildR2Url(config, '/path/to/image.jpg');
      expect(url).toBe('https://pub-example.r2.dev/path/to/image.jpg');
    });

    it('オプションパラメータを含むURLを生成する', () => {
      const url = buildR2Url(config, 'image.jpg', {
        width: 800,
        format: 'webp',
        quality: 80,
      });
      expect(url).toContain('/cdn-cgi/image/');
      expect(url).toContain('w=800');
      expect(url).toContain('f=webp');
      expect(url).toContain('q=80');
    });
  });

  describe('calculateAspectRatio', () => {
    it('アスペクト比を正しく計算する', () => {
      expect(calculateAspectRatio(1920, 1080)).toBeCloseTo(16 / 9);
      expect(calculateAspectRatio(1200, 630)).toBeCloseTo(1.9047619);
      expect(calculateAspectRatio(100, 100)).toBe(1);
    });

    it('高さが0の場合は0を返す', () => {
      expect(calculateAspectRatio(1920, 0)).toBe(0);
    });
  });

  describe('calculateHeightFromWidth', () => {
    it('幅からアスペクト比に基づいて高さを計算する', () => {
      const aspectRatio = 16 / 9;
      expect(calculateHeightFromWidth(1920, aspectRatio)).toBe(1080);
      expect(calculateHeightFromWidth(1280, aspectRatio)).toBe(720);
    });

    it('アスペクト比が0の場合は0を返す', () => {
      expect(calculateHeightFromWidth(1920, 0)).toBe(0);
    });
  });

  describe('calculateWidthFromHeight', () => {
    it('高さからアスペクト比に基づいて幅を計算する', () => {
      const aspectRatio = 16 / 9;
      expect(calculateWidthFromHeight(1080, aspectRatio)).toBe(1920);
      expect(calculateWidthFromHeight(720, aspectRatio)).toBe(1280);
    });
  });

  describe('generatePlaceholderUrl', () => {
    it('デフォルトのプレースホルダーURLを生成する', () => {
      const url = generatePlaceholderUrl(800, 600);
      expect(url).toBe('https://placehold.co/800x600/e2e8f0/64748b?text=800x600');
    });

    it('カスタムオプションでプレースホルダーURLを生成する', () => {
      const url = generatePlaceholderUrl(800, 600, {
        backgroundColor: 'ff0000',
        textColor: 'ffffff',
        text: 'Custom',
      });
      expect(url).toBe('https://placehold.co/800x600/ff0000/ffffff?text=Custom');
    });
  });

  describe('generateBlurDataUrl', () => {
    it('SVGベースのデータURLを生成する', () => {
      const dataUrl = generateBlurDataUrl();
      expect(dataUrl).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    it('カスタムカラーでデータURLを生成する', () => {
      const dataUrl = generateBlurDataUrl('000000');
      expect(dataUrl).toMatch(/^data:image\/svg\+xml;base64,/);
    });
  });

  describe('isR2Url', () => {
    it('R2 URLを正しく判定する', () => {
      expect(isR2Url('https://pub-xxx.r2.cloudflarestorage.com/image.jpg')).toBe(true);
      expect(isR2Url('https://pub-example.r2.dev/image.jpg')).toBe(true);
    });

    it('非R2 URLを正しく判定する', () => {
      expect(isR2Url('https://example.com/image.jpg')).toBe(false);
      expect(isR2Url('https://s3.amazonaws.com/image.jpg')).toBe(false);
    });
  });

  describe('getOptimizationParams', () => {
    it('すべてのパラメータを文字列として返す', () => {
      const params = getOptimizationParams({
        width: 800,
        height: 600,
        format: 'webp',
        quality: 80,
      });

      expect(params).toEqual({
        width: '800',
        height: '600',
        format: 'webp',
        quality: '80',
      });
    });

    it('未指定のパラメータは含まない', () => {
      const params = getOptimizationParams({
        width: 800,
      });

      expect(params).toEqual({ width: '800' });
      expect(params.height).toBeUndefined();
      expect(params.format).toBeUndefined();
      expect(params.quality).toBeUndefined();
    });

    it('空のオプションでは空オブジェクトを返す', () => {
      const params = getOptimizationParams({});
      expect(params).toEqual({});
    });
  });
});
