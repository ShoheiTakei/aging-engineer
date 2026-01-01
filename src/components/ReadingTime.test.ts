/**
 * ReadingTime.astro - テストスイート
 */

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeEach, describe, expect, it } from 'vitest';
import ReadingTime from './ReadingTime.astro';

describe('ReadingTime.astro', () => {
  let container: AstroContainer;

  beforeEach(async () => {
    container = await AstroContainer.create();
  });

  describe('正常系テストケース', () => {
    it('TC-RT-C-001: 読了時間コンポーネントが正しくレンダリングされる', async () => {
      const result = await container.renderToString(ReadingTime, {
        props: { minutes: 5 },
      });
      expect(result).toContain('約5分で読めます');
    });

    it('TC-RT-C-002: 様々な分数で正しく表示される', async () => {
      const result1 = await container.renderToString(ReadingTime, {
        props: { minutes: 1 },
      });
      expect(result1).toContain('約1分で読めます');

      const result10 = await container.renderToString(ReadingTime, {
        props: { minutes: 10 },
      });
      expect(result10).toContain('約10分で読めます');

      const result30 = await container.renderToString(ReadingTime, {
        props: { minutes: 30 },
      });
      expect(result30).toContain('約30分で読めます');
    });

    it('TC-RT-C-003: 0分の場合は「1分未満で読めます」と表示される', async () => {
      const result = await container.renderToString(ReadingTime, {
        props: { minutes: 0 },
      });
      expect(result).toContain('1分未満で読めます');
    });
  });

  describe('アクセシビリティテストケース', () => {
    it('TC-RT-C-101: time要素またはspan要素でラップされている', async () => {
      const result = await container.renderToString(ReadingTime, {
        props: { minutes: 5 },
      });
      expect(result).toMatch(/<(time|span)[^>]*>/);
    });

    it('TC-RT-C-102: スクリーンリーダー用のアクセシブルな情報が含まれる', async () => {
      const result = await container.renderToString(ReadingTime, {
        props: { minutes: 5 },
      });
      expect(result).toMatch(/読了時間|読めます/);
    });
  });

  describe('スタイリングテストケース', () => {
    it('TC-RT-C-201: スタイリングクラスが適用されている', async () => {
      const result = await container.renderToString(ReadingTime, {
        props: { minutes: 5 },
      });
      expect(result).toMatch(/class="[^"]+"/);
    });

    it('TC-RT-C-202: ダークモード用スタイルが適用されている', async () => {
      const result = await container.renderToString(ReadingTime, {
        props: { minutes: 5 },
      });
      expect(result).toMatch(/dark:/);
    });

    it('TC-RT-C-203: 時計アイコンが表示されている', async () => {
      const result = await container.renderToString(ReadingTime, {
        props: { minutes: 5 },
      });
      expect(result).toMatch(/<svg|clock|時計/i);
    });
  });
});
