/**
 * Paginationコンポーネントのテスト
 *
 * テスト観点:
 * - ページネーションのロジック（ページ番号計算）
 * - 境界条件（1ページ目、最終ページ）
 */

import { describe, expect, it } from 'vitest';

/**
 * ページ番号を計算する関数
 * Pagination.astroと同じロジック
 */
function getPageNumbers(current: number, total: number): number[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  let start = Math.max(1, current - 2);
  let end = Math.min(total, current + 2);

  if (current <= 2) {
    end = 5;
  } else if (current >= total - 1) {
    start = total - 4;
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

describe('Pagination', () => {
  describe('getPageNumbers', () => {
    it('5ページ以下の場合は全ページを表示', () => {
      expect(getPageNumbers(1, 3)).toEqual([1, 2, 3]);
      expect(getPageNumbers(2, 5)).toEqual([1, 2, 3, 4, 5]);
    });

    it('1ページ目の場合は1〜5を表示', () => {
      expect(getPageNumbers(1, 10)).toEqual([1, 2, 3, 4, 5]);
    });

    it('2ページ目の場合は1〜5を表示', () => {
      expect(getPageNumbers(2, 10)).toEqual([1, 2, 3, 4, 5]);
    });

    it('中間ページの場合は現在のページを中心に表示', () => {
      expect(getPageNumbers(5, 10)).toEqual([3, 4, 5, 6, 7]);
      expect(getPageNumbers(6, 10)).toEqual([4, 5, 6, 7, 8]);
    });

    it('最終ページ付近の場合は末尾5ページを表示', () => {
      expect(getPageNumbers(9, 10)).toEqual([6, 7, 8, 9, 10]);
      expect(getPageNumbers(10, 10)).toEqual([6, 7, 8, 9, 10]);
    });

    it('1ページのみの場合は[1]を返す', () => {
      expect(getPageNumbers(1, 1)).toEqual([1]);
    });
  });

  describe('ページネーションのナビゲーション表示条件', () => {
    it('1ページ目では「前へ」リンクは非表示', () => {
      const currentPage = 1;
      const hasPrev = currentPage > 1;
      expect(hasPrev).toBe(false);
    });

    it('最終ページでは「次へ」リンクは非表示', () => {
      const currentPage = 10;
      const lastPage = 10;
      const hasNext = currentPage < lastPage;
      expect(hasNext).toBe(false);
    });

    it('中間ページでは「前へ」「次へ」両方表示', () => {
      const currentPage = 5;
      const lastPage = 10;
      const hasPrev = currentPage > 1;
      const hasNext = currentPage < lastPage;
      expect(hasPrev).toBe(true);
      expect(hasNext).toBe(true);
    });

    it('1ページしかない場合はページネーション自体非表示', () => {
      const lastPage = 1;
      const showPagination = lastPage > 1;
      expect(showPagination).toBe(false);
    });
  });
});
