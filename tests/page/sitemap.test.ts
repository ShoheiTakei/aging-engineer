import { describe, expect, it } from 'vitest';

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

describe('Sitemap', () => {
  it('formats date', () => {
    expect(formatDate(new Date('2025-01-15T12:00:00Z'))).toBe('2025-01-15');
  });

  it('escapes XML', () => {
    expect(escapeXml('foo & bar')).toBe('foo &amp; bar');
  });
});
