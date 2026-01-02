/**
 * ビルド出力サイズ検証テスト
 *
 * TASK-0025: パフォーマンス最適化
 * - ビルド出力ファイルサイズが適切な範囲内であることを確認
 * - 肥大化を防ぐための閾値チェック
 */

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * ディレクトリ内のファイル総サイズを計算（再帰的）
 */
function getDirectorySize(dirPath: string): number {
  if (!fs.existsSync(dirPath)) {
    return 0;
  }

  let totalSize = 0;
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      totalSize += getDirectorySize(itemPath);
    } else {
      totalSize += stats.size;
    }
  }

  return totalSize;
}

/**
 * バイトを人間が読みやすい形式に変換
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

describe('ビルド出力サイズ検証', () => {
  const distPath = path.join(process.cwd(), 'dist');

  it('distディレクトリが存在すること', () => {
    expect(fs.existsSync(distPath)).toBe(true);
  });

  it('総ビルドサイズが5MB未満であること', () => {
    const totalSize = getDirectorySize(distPath);
    const maxSize = 5 * 1024 * 1024; // 5MB

    console.log(`総ビルドサイズ: ${formatBytes(totalSize)}`);
    expect(totalSize).toBeLessThan(maxSize);
  });

  it('JavaScriptファイルの総サイズが500KB未満であること', () => {
    const jsDir = path.join(distPath, '_astro');
    if (!fs.existsSync(jsDir)) {
      // JavaScriptファイルがない場合はスキップ（SSGのみの場合）
      return;
    }

    const jsFiles = fs
      .readdirSync(jsDir)
      .filter((file) => file.endsWith('.js'));

    let totalJsSize = 0;
    for (const file of jsFiles) {
      const filePath = path.join(jsDir, file);
      const stats = fs.statSync(filePath);
      totalJsSize += stats.size;
    }

    const maxJsSize = 500 * 1024; // 500KB
    console.log(`JavaScriptファイル総サイズ: ${formatBytes(totalJsSize)}`);
    expect(totalJsSize).toBeLessThan(maxJsSize);
  });

  it('個別のJavaScriptファイルが100KB未満であること', () => {
    const jsDir = path.join(distPath, '_astro');
    if (!fs.existsSync(jsDir)) {
      return;
    }

    const jsFiles = fs
      .readdirSync(jsDir)
      .filter((file) => file.endsWith('.js'));

    const maxFileSize = 100 * 1024; // 100KB

    for (const file of jsFiles) {
      const filePath = path.join(jsDir, file);
      const stats = fs.statSync(filePath);

      console.log(`${file}: ${formatBytes(stats.size)}`);
      expect(stats.size).toBeLessThan(maxFileSize);
    }
  });

  it('HTMLファイルが存在し、適切なサイズであること', () => {
    const indexPath = path.join(distPath, 'index.html');
    expect(fs.existsSync(indexPath)).toBe(true);

    const stats = fs.statSync(indexPath);
    const maxHtmlSize = 50 * 1024; // 50KB

    console.log(`index.html: ${formatBytes(stats.size)}`);
    expect(stats.size).toBeLessThan(maxHtmlSize);
  });
});

describe('アセット最適化の確認', () => {
  const distPath = path.join(process.cwd(), 'dist');

  it('gzip圧縮を想定したJavaScriptサイズが妥当であること', () => {
    const jsDir = path.join(distPath, '_astro');
    if (!fs.existsSync(jsDir)) {
      return;
    }

    const jsFiles = fs
      .readdirSync(jsDir)
      .filter((file) => file.endsWith('.js'));

    // gzip圧縮率は通常3:1〜4:1程度を想定
    // 100KBのファイルは圧縮後25KB〜33KB程度になることを期待
    for (const file of jsFiles) {
      const filePath = path.join(jsDir, file);
      const stats = fs.statSync(filePath);

      // 未圧縮で100KB未満であれば、圧縮後は十分小さくなる
      expect(stats.size).toBeLessThan(100 * 1024);
    }
  });

  it('CSSファイルが最適化されていること', () => {
    const cssDir = path.join(distPath, '_astro');
    if (!fs.existsSync(cssDir)) {
      return;
    }

    const cssFiles = fs
      .readdirSync(cssDir)
      .filter((file) => file.endsWith('.css'));

    const maxCssFileSize = 50 * 1024; // 50KB

    for (const file of cssFiles) {
      const filePath = path.join(cssDir, file);
      const stats = fs.statSync(filePath);

      console.log(`${file}: ${formatBytes(stats.size)}`);
      expect(stats.size).toBeLessThan(maxCssFileSize);
    }
  });
});
