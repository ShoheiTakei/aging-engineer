# フロントエンドテスト基盤 テストパターン集

**作成日**: 2025-12-28
**関連アーキテクチャ**: [architecture.md](architecture.md)

このドキュメントでは、Astro.jsブログプロジェクトで実際に書くテストの具体例を示します。

---

## 1. TypeScriptユーティリティ関数のテスト

### 1.1 日付フォーマット関数 🔵

**ファイル**: `tests/unit/utils/date.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { formatDate, getRelativeTime } from '@/utils/date';

describe('formatDate', () => {
  it('should format date in Japanese locale', () => {
    const date = new Date('2025-01-15T10:30:00Z');
    expect(formatDate(date)).toBe('2025年1月15日');
  });

  it('should handle invalid date', () => {
    expect(() => formatDate(new Date('invalid'))).toThrow();
  });
});

describe('getRelativeTime', () => {
  it('should return "今日" for today', () => {
    const today = new Date();
    expect(getRelativeTime(today)).toBe('今日');
  });

  it('should return "1日前" for yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(getRelativeTime(yesterday)).toBe('1日前');
  });
});
```

**対応する実装例**:
```typescript
// src/utils/date.ts
export function formatDate(date: Date): string {
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date');
  }
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return '今日';
  if (diffInDays === 1) return '1日前';
  return `${diffInDays}日前`;
}
```

### 1.2 Cloudflare R2画像URL生成 🔵

**ファイル**: `tests/unit/utils/r2.test.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getR2ImageUrl } from '@/utils/r2';

// 環境変数モック
const mockEnv = {
  PUBLIC_R2_URL: 'https://test-r2-url.com',
};

describe('getR2ImageUrl', () => {
  beforeEach(() => {
    vi.stubEnv('PUBLIC_R2_URL', mockEnv.PUBLIC_R2_URL);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should generate correct R2 URL', () => {
    const url = getR2ImageUrl('test-image.jpg');
    expect(url).toBe('https://test-r2-url.com/test-image.jpg');
  });

  it('should handle nested paths', () => {
    const url = getR2ImageUrl('blog/2025/test-image.jpg');
    expect(url).toBe('https://test-r2-url.com/blog/2025/test-image.jpg');
  });

  it('should throw error if PUBLIC_R2_URL is not set', () => {
    vi.stubEnv('PUBLIC_R2_URL', undefined);
    expect(() => getR2ImageUrl('test.jpg')).toThrow(
      'PUBLIC_R2_URL environment variable is not set'
    );
  });
});
```

**対応する実装例**:
```typescript
// src/utils/r2.ts
export function getR2ImageUrl(key: string): string {
  const R2_PUBLIC_URL = import.meta.env.PUBLIC_R2_URL;
  if (!R2_PUBLIC_URL) {
    throw new Error('PUBLIC_R2_URL environment variable is not set');
  }
  return `${R2_PUBLIC_URL}/${key}`;
}
```

---

## 2. Content Collectionsのテスト

### 2.1 ブログ記事スキーマのバリデーション 🔵

**ファイル**: `tests/unit/content/blog-schema.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { z } from 'astro:content';

// src/content/config.ts から blogCollection のスキーマをインポート
import { blogSchema } from '@/content/config';

describe('Blog Schema Validation', () => {
  it('should validate correct blog post data', () => {
    const validData = {
      title: 'Test Post',
      description: 'Test Description',
      pubDate: new Date('2025-01-01'),
      coverImage: 'test-image.jpg',
      tags: ['test', 'vitest'],
    };

    const result = blogSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject missing required fields', () => {
    const invalidData = {
      title: 'Test Post',
      // description missing
    };

    const result = blogSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('description');
    }
  });

  it('should accept optional fields as undefined', () => {
    const validData = {
      title: 'Test Post',
      description: 'Test Description',
      pubDate: new Date('2025-01-01'),
      // coverImage and tags are optional
    };

    const result = blogSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should coerce pubDate string to Date', () => {
    const dataWithStringDate = {
      title: 'Test Post',
      description: 'Test Description',
      pubDate: '2025-01-01',
    };

    const result = blogSchema.safeParse(dataWithStringDate);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pubDate).toBeInstanceOf(Date);
    }
  });
});
```

### 2.2 Content Collectionsのモックテスト 🟡

**ファイル**: `tests/unit/content/get-posts.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import type { CollectionEntry } from 'astro:content';

// モックデータ
const mockBlogPosts: CollectionEntry<'blog'>[] = [
  {
    id: 'post-1.md',
    slug: 'post-1',
    body: 'Post 1 content',
    collection: 'blog',
    data: {
      title: 'Post 1',
      description: 'Description 1',
      pubDate: new Date('2025-01-15'),
      tags: ['tag1'],
    },
  },
  {
    id: 'post-2.md',
    slug: 'post-2',
    body: 'Post 2 content',
    collection: 'blog',
    data: {
      title: 'Post 2',
      description: 'Description 2',
      pubDate: new Date('2025-01-10'),
      tags: ['tag2'],
    },
  },
];

// getCollection のモック
vi.mock('astro:content', () => ({
  getCollection: vi.fn(async () => mockBlogPosts),
}));

describe('getSortedPosts', () => {
  it('should return posts sorted by pubDate descending', async () => {
    const { getSortedPosts } = await import('@/utils/content');
    const posts = await getSortedPosts();

    expect(posts).toHaveLength(2);
    expect(posts[0].data.title).toBe('Post 1'); // 2025-01-15 (newer)
    expect(posts[1].data.title).toBe('Post 2'); // 2025-01-10 (older)
  });
});
```

---

## 3. Astroコンポーネントのテスト

### 3.1 Headerコンポーネント 🟡

**ファイル**: `tests/component/Header.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Header from '@/components/Header.astro';

describe('Header Component', () => {
  it('should render site title', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Header);

    expect(result).toContain('Aging Engineer Blog');
  });

  it('should include navigation links', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(Header);

    expect(result).toContain('href="/"');
    expect(result).toContain('href="/blog"');
    expect(result).toContain('href="/about"');
  });
});
```

**注**: Astroコンポーネントのテストは experimental API を使用します。将来的に変更される可能性があります。

### 3.2 BlogCardコンポーネント 🟡

**ファイル**: `tests/component/BlogCard.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import BlogCard from '@/components/BlogCard.astro';

describe('BlogCard Component', () => {
  const mockPost = {
    slug: 'test-post',
    data: {
      title: 'Test Post',
      description: 'Test Description',
      pubDate: new Date('2025-01-01'),
      coverImage: 'test-image.jpg',
    },
  };

  it('should render post title and description', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(BlogCard, {
      props: { post: mockPost },
    });

    expect(result).toContain('Test Post');
    expect(result).toContain('Test Description');
  });

  it('should render cover image if provided', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(BlogCard, {
      props: { post: mockPost },
    });

    expect(result).toContain('test-image.jpg');
  });

  it('should render link to post', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(BlogCard, {
      props: { post: mockPost },
    });

    expect(result).toContain('href="/blog/test-post"');
  });
});
```

### 3.3 ThemeToggleコンポーネント（ダークモード切り替え） 🔵

**ファイル**: `tests/component/ThemeToggle.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import ThemeToggle from '@/components/ThemeToggle.astro';

describe('ThemeToggle Component', () => {
  it('should render theme toggle button', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ThemeToggle);

    expect(result).toContain('id="theme-toggle"');
    expect(result).toContain('button');
  });

  it('should include sun and moon icons', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ThemeToggle);

    // SVGアイコンが含まれているか確認
    expect(result).toContain('<svg');
    expect(result).toContain('dark:block'); // 月アイコン（ダークモード時）
    expect(result).toContain('dark:hidden'); // 太陽アイコン（ライトモード時）
  });

  it('should have accessible button attributes', async () => {
    const container = await AstroContainer.create();
    const result = await container.renderToString(ThemeToggle);

    // アクセシビリティ確認（推奨）
    expect(result).toMatch(/aria-label|title/); // スクリーンリーダー対応
  });
});
```

**E2Eテストでのテーマ切り替え動作確認**:

```typescript
// tests/e2e/theme-toggle.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Theme Toggle', () => {
  test('should toggle between dark and light mode', async ({ page }) => {
    await page.goto('/');

    // デフォルトはダークモード
    const html = page.locator('html');
    await expect(html).toHaveClass(/dark/);

    // テーマ切り替えボタンをクリック
    await page.click('#theme-toggle');

    // ライトモードに切り替わったことを確認
    await expect(html).not.toHaveClass(/dark/);

    // localStorageに保存されているか確認
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('light');

    // もう一度クリックしてダークモードに戻す
    await page.click('#theme-toggle');
    await expect(html).toHaveClass(/dark/);

    const themeDark = await page.evaluate(() => localStorage.getItem('theme'));
    expect(themeDark).toBe('dark');
  });

  test('should persist theme preference on page reload', async ({ page }) => {
    await page.goto('/');

    // ライトモードに切り替え
    await page.click('#theme-toggle');
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    // ページリロード
    await page.reload();

    // ライトモードが維持されているか確認
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('should not flash during initial load', async ({ page }) => {
    // localStorageにダークモードを設定
    await page.addInitScript(() => {
      localStorage.setItem('theme', 'dark');
    });

    await page.goto('/');

    // ページ読み込み直後からダークモードが適用されているか確認
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
});
```

**注意点**:
- テーマ切り替えのインタラクション（JavaScriptの動作）はE2Eテストで確認
- コンポーネントのレンダリングのみ単体テストで確認
- localStorageの動作はブラウザ環境が必要なためE2Eテストで実施

---

## 4. E2Eテスト（Playwright）

### 4.1 トップページ 🔵

**ファイル**: `tests/e2e/home.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display site title', async ({ page }) => {
    await page.goto('/');

    const title = await page.textContent('h1');
    expect(title).toContain('Aging Engineer');
  });

  test('should have navigation links', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('nav a[href="/"]')).toBeVisible();
    await expect(page.locator('nav a[href="/blog"]')).toBeVisible();
    await expect(page.locator('nav a[href="/about"]')).toBeVisible();
  });

  test('should navigate to blog page', async ({ page }) => {
    await page.goto('/');
    await page.click('a[href="/blog"]');

    await expect(page).toHaveURL('/blog');
  });
});
```

### 4.2 ブログ一覧ページ 🔵

**ファイル**: `tests/e2e/blog-list.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Blog List Page', () => {
  test('should display blog posts', async ({ page }) => {
    await page.goto('/blog');

    const blogCards = await page.locator('[data-testid="blog-card"]').count();
    expect(blogCards).toBeGreaterThan(0);
  });

  test('should click on blog card and navigate to post', async ({ page }) => {
    await page.goto('/blog');

    const firstPost = page.locator('[data-testid="blog-card"]').first();
    const postTitle = await firstPost.locator('h2').textContent();

    await firstPost.click();

    // 記事詳細ページに遷移
    await expect(page.locator('h1')).toHaveText(postTitle || '');
  });

  test('should display cover images', async ({ page }) => {
    await page.goto('/blog');

    const firstImage = page.locator('[data-testid="blog-card"] img').first();
    await expect(firstImage).toBeVisible();

    // R2のURLが含まれているか確認
    const src = await firstImage.getAttribute('src');
    expect(src).toMatch(/https:\/\/.+\/.+\.(jpg|png|webp)/);
  });
});
```

### 4.3 ブログ記事詳細ページ 🔵

**ファイル**: `tests/e2e/blog-post.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Blog Post Page', () => {
  test('should render markdown content', async ({ page }) => {
    await page.goto('/blog/test-post');

    // 見出しが存在するか
    await expect(page.locator('h1')).toBeVisible();

    // 本文が存在するか
    const content = await page.locator('article').textContent();
    expect(content).toBeTruthy();
  });

  test('should display metadata', async ({ page }) => {
    await page.goto('/blog/test-post');

    // 公開日が表示されているか
    await expect(page.locator('[data-testid="pub-date"]')).toBeVisible();

    // タグが表示されているか（タグがある場合）
    const tags = await page.locator('[data-testid="tag"]').count();
    expect(tags).toBeGreaterThanOrEqual(0);
  });

  test('should load images from R2', async ({ page }) => {
    await page.goto('/blog/test-post');

    const images = page.locator('article img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      const firstImage = images.first();
      const src = await firstImage.getAttribute('src');
      // R2のURLパターンを確認
      expect(src).toMatch(/https:\/\/.+/);
    }
  });
});
```

### 4.4 レスポンシブデザインテスト 🟡

**ファイル**: `tests/e2e/responsive.spec.ts`

```typescript
import { test, expect, devices } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('should display mobile menu on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');

    // モバイルメニューボタンが表示されているか
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    await expect(menuButton).toBeVisible();
  });

  test('should display desktop navigation on large screens', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await page.goto('/');

    // デスクトップナビゲーションが表示されているか
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();

    // モバイルメニューボタンが非表示か
    const menuButton = page.locator('[data-testid="mobile-menu-button"]');
    await expect(menuButton).not.toBeVisible();
  });
});
```

---

## 5. 統合テスト例

### 5.1 ブログ記事の全体フロー 🟡

**ファイル**: `tests/integration/blog-flow.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { getCollection } from 'astro:content';
import { getSortedPosts } from '@/utils/content';
import { formatDate } from '@/utils/date';
import { getR2ImageUrl } from '@/utils/r2';

// モック設定
vi.mock('astro:content');
vi.stubEnv('PUBLIC_R2_URL', 'https://test-r2-url.com');

describe('Blog Post Integration', () => {
  it('should get, sort, and format blog posts', async () => {
    const mockPosts = [
      {
        id: 'post-1.md',
        slug: 'post-1',
        body: '',
        collection: 'blog',
        data: {
          title: 'Post 1',
          description: 'Desc 1',
          pubDate: new Date('2025-01-15'),
          coverImage: 'cover-1.jpg',
        },
      },
    ];

    vi.mocked(getCollection).mockResolvedValue(mockPosts as any);

    const posts = await getSortedPosts();
    expect(posts).toHaveLength(1);

    const post = posts[0];
    expect(post.data.title).toBe('Post 1');

    // 日付フォーマット
    const formattedDate = formatDate(post.data.pubDate);
    expect(formattedDate).toBe('2025年1月15日');

    // R2 URL生成
    const imageUrl = getR2ImageUrl(post.data.coverImage!);
    expect(imageUrl).toBe('https://test-r2-url.com/cover-1.jpg');
  });
});
```

---

## 6. テストデータ管理

### 6.1 Fixtureマークダウン

**ファイル**: `tests/fixtures/content/sample-post.md`

```markdown
---
title: "サンプル記事"
description: "テスト用のサンプル記事です"
pubDate: 2025-01-01
coverImage: "sample-cover.jpg"
tags: ["test", "sample"]
---

# サンプル記事

これはテスト用のサンプル記事です。

## 見出し2

本文のサンプルテキストです。

![サンプル画像](sample-image.jpg)
```

### 6.2 モックデータファクトリー 🟡

**ファイル**: `tests/mocks/factories.ts`

```typescript
import type { CollectionEntry } from 'astro:content';

export function createMockBlogPost(
  overrides?: Partial<CollectionEntry<'blog'>['data']>
): CollectionEntry<'blog'> {
  return {
    id: 'mock-post.md',
    slug: 'mock-post',
    body: 'Mock content',
    collection: 'blog',
    data: {
      title: 'Mock Post',
      description: 'Mock Description',
      pubDate: new Date('2025-01-01'),
      coverImage: 'mock-image.jpg',
      tags: ['mock'],
      ...overrides,
    },
  };
}
```

---

## 7. Storybookストーリー（コンポーネントカタログ）

### 7.1 ThemeToggleコンポーネントのストーリー 🔵

**ファイル**: `src/components/ThemeToggle.stories.ts`

```typescript
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Components/ThemeToggle',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'ダークモードとライトモードを切り替えるトグルボタンコンポーネント',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <button
      id="theme-toggle"
      class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
      aria-label="テーマを切り替え"
    >
      <svg class="w-6 h-6 hidden dark:block" fill="currentColor" viewBox="0 0 20 20">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
      </svg>
      <svg class="w-6 h-6 block dark:hidden" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
      </svg>
    </button>
  `,
};

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'ダークモード時の表示（月アイコンが表示される）',
      },
    },
  },
  render: Default.render,
};

export const LightMode: Story = {
  parameters: {
    backgrounds: { default: 'light' },
    docs: {
      description: {
        story: 'ライトモード時の表示（太陽アイコンが表示される）',
      },
    },
  },
  render: Default.render,
};
```

### 7.2 BlogCardコンポーネントのストーリー 🟡

**ファイル**: `src/components/BlogCard.stories.ts`

```typescript
import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

const meta: Meta = {
  title: 'Components/BlogCard',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'ブログ記事のカードコンポーネント（タイトル、説明、日付、カバー画像を表示）',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <article class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src="https://placehold.co/600x400/1e293b/64748b?text=Cover+Image"
        alt="記事のカバー画像"
        class="w-full h-48 object-cover"
      />
      <div class="p-6">
        <h2 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          サンプル記事タイトル
        </h2>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          これはサンプル記事の説明文です。記事の内容を簡潔に説明します。
        </p>
        <div class="flex items-center justify-between">
          <time class="text-sm text-gray-500 dark:text-gray-400">
            2025年12月28日
          </time>
          <a
            href="/blog/sample-post"
            class="text-blue-600 dark:text-blue-400 hover:underline"
          >
            続きを読む →
          </a>
        </div>
      </div>
    </article>
  `,
};

export const WithoutImage: Story = {
  parameters: {
    docs: {
      description: {
        story: 'カバー画像なしのバリエーション',
      },
    },
  },
  render: () => html`
    <article class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div class="p-6">
        <h2 class="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          画像なし記事タイトル
        </h2>
        <p class="text-gray-600 dark:text-gray-300 mb-4">
          カバー画像がない記事の表示例です。
        </p>
        <div class="flex items-center justify-between">
          <time class="text-sm text-gray-500 dark:text-gray-400">
            2025年12月28日
          </time>
          <a
            href="/blog/sample-post"
            class="text-blue-600 dark:text-blue-400 hover:underline"
          >
            続きを読む →
          </a>
        </div>
      </div>
    </article>
  `,
};

export const DarkMode: Story = {
  parameters: {
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        story: 'ダークモード時の表示',
      },
    },
  },
  render: Default.render,
};
```

### 7.3 アクセシビリティテスト 🔵

Storybookの `@storybook/addon-a11y` アドオンを使用して、各ストーリーで自動的にアクセシビリティテストを実行します。

**`.storybook/preview.ts` で有効化**:

```typescript
import type { Preview } from '@storybook/web-components';

const preview: Preview = {
  parameters: {
    a11y: {
      // アクセシビリティテストの設定
      config: {
        rules: [
          {
            // WCAG 2.1 AA準拠のルールを適用
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
};

export default preview;
```

**自動テスト項目**:
- カラーコントラスト比（WCAG AA: 4.5:1以上）
- ARIA属性の正しい使用
- フォーカス可能な要素のラベル
- 見出しの階層構造
- alt属性の存在

---

## 8. Lighthouseテスト（パフォーマンス・品質監視）

### 8.1 Lighthouse CI設定 🔵

**ファイル**: `lighthouserc.json`

```json
{
  "ci": {
    "collect": {
      "startServerCommand": "pnpm preview",
      "startServerReadyPattern": "Local:",
      "url": [
        "http://localhost:4321/",
        "http://localhost:4321/blog",
        "http://localhost:4321/about"
      ],
      "numberOfRuns": 3
    },
    "assert": {
      "preset": "lighthouse:recommended",
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}],
        "cumulative-layout-shift": ["warn", {"maxNumericValue": 0.1}],
        "first-contentful-paint": ["warn", {"maxNumericValue": 2000}],
        "largest-contentful-paint": ["warn", {"maxNumericValue": 2500}],
        "total-blocking-time": ["warn", {"maxNumericValue": 300}]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

### 7.2 ローカルでのLighthouse実行 🔵

```bash
# Lighthouse CIインストール
pnpm add -D @lhci/cli

# ビルド & プレビューサーバー起動 & Lighthouse実行
pnpm build
pnpm lhci autorun
```

### 7.3 Lighthouseスコア監視スクリプト 🟡

**ファイル**: `scripts/lighthouse-check.sh`

```bash
#!/bin/bash

# Lighthouseスコアチェックスクリプト

echo "🚀 Starting Lighthouse CI..."

# ビルド
pnpm build

# Lighthouse実行
pnpm lhci autorun --config=lighthouserc.json

# 結果の確認
if [ $? -eq 0 ]; then
  echo "✅ All Lighthouse checks passed!"
  exit 0
else
  echo "❌ Lighthouse checks failed. Please check the report."
  exit 1
fi
```

### 7.4 GitHub ActionsでのLighthouse統合 🔵

**ファイル**: `.github/workflows/lighthouse.yml`

```yaml
name: Lighthouse CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build

      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            http://localhost:4321
            http://localhost:4321/blog
            http://localhost:4321/about
          uploadArtifacts: true
          temporaryPublicStorage: true
          runs: 3
          configPath: './lighthouserc.json'

      - name: Comment PR with Lighthouse scores
        uses: foo-software/lighthouse-check-action@master
        with:
          urls: 'http://localhost:4321'
          prCommentEnabled: true
          githubAccessToken: ${{ secrets.GITHUB_TOKEN }}
```

### 7.5 Lighthouseレポートの読み方 🔵

Lighthouseは以下の4カテゴリでスコアを測定します：

#### Performance（パフォーマンス）- 目標: 90+点
- **First Contentful Paint (FCP)**: 最初のコンテンツ表示まで < 2.0秒
- **Largest Contentful Paint (LCP)**: 最大コンテンツ表示まで < 2.5秒
- **Total Blocking Time (TBT)**: メインスレッドブロック時間 < 300ms
- **Cumulative Layout Shift (CLS)**: レイアウトシフト < 0.1
- **Speed Index**: 視覚的な読み込み速度 < 4.0秒

#### Accessibility（アクセシビリティ）- 目標: 90+点
- **ARIA属性の適切な使用**
- **画像のalt属性**
- **フォーム要素のラベル**
- **カラーコントラスト比**

#### Best Practices（ベストプラクティス）- 目標: 90+点
- **HTTPS使用**
- **コンソールエラーなし**
- **画像の適切なアスペクト比**
- **セキュリティヘッダー**

#### SEO - 目標: 90+点
- **メタタグの設定**
- **robots.txt**
- **構造化データ**
- **モバイルフレンドリー**

---

## 8. まとめ：書く想定のテスト一覧

### 単体テスト（Vitest）
1. **ユーティリティ関数** (`tests/unit/utils/`)
   - ✅ 日付フォーマット: `date.test.ts`
   - ✅ R2 URL生成: `r2.test.ts`
   - その他のヘルパー関数

2. **Content Collections** (`tests/unit/content/`)
   - ✅ Zodスキーマバリデーション: `blog-schema.test.ts`
   - ✅ コンテンツ取得・ソート: `get-posts.test.ts`

3. **コンポーネント** (`tests/component/`)
   - ✅ Header: `Header.test.ts`
   - ✅ Footer: `Footer.test.ts`
   - ✅ BlogCard: `BlogCard.test.ts`
   - ✅ ThemeToggle: `ThemeToggle.test.ts`
   - ✅ Navigation: `Navigation.test.ts`

### Storybookストーリー（コンポーネントカタログ）
1. **コンポーネントストーリー** (`src/components/*.stories.ts`)
   - ✅ ThemeToggle: `ThemeToggle.stories.ts`（ダーク/ライトモード切り替え）
   - ✅ BlogCard: `BlogCard.stories.ts`（カバー画像あり/なし、ダークモード）
   - ✅ Header: `Header.stories.ts`（ナビゲーション状態）
   - ✅ Footer: `Footer.stories.ts`
   - ✅ アクセシビリティテスト（`@storybook/addon-a11y`）

### E2Eテスト（Playwright）
1. **ページテスト** (`tests/e2e/`)
   - ✅ トップページ: `home.spec.ts`
   - ✅ ブログ一覧: `blog-list.spec.ts`
   - ✅ ブログ記事詳細: `blog-post.spec.ts`
   - ✅ Aboutページ: `about.spec.ts`

2. **ユーザーフロー** (`tests/e2e/`)
   - ✅ ナビゲーション: `navigation.spec.ts`
   - ✅ テーマ切り替え: `theme-toggle.spec.ts`（ダーク/ライトモード、localStorage永続化）
   - ✅ レスポンシブ: `responsive.spec.ts`
   - ✅ 画像読み込み: `images.spec.ts`

### 統合テスト（Vitest）
1. **エンドツーエンドフロー** (`tests/integration/`)
   - ✅ ブログ記事全体フロー: `blog-flow.test.ts`

### Lighthouseテスト（パフォーマンス・品質監視）
1. **設定ファイル** (プロジェクトルート)
   - ✅ Lighthouse CI設定: `lighthouserc.json`
   - ✅ スコア監視スクリプト: `scripts/lighthouse-check.sh`

2. **GitHub Actions** (`.github/workflows/`)
   - ✅ Lighthouseワークフロー: `lighthouse.yml`
   - プルリクエスト時の自動実行
   - スコアレポートのコメント投稿

3. **測定対象ページ**
   - ✅ トップページ: `/`
   - ✅ ブログ一覧: `/blog`
   - ✅ Aboutページ: `/about`
   - 必要に応じて他のページも追加

### カバレッジ目標
- **全体**: 80%以上
- **ユーティリティ**: 90%以上
- **コンポーネント**: 70%以上
- **Content Collections**: 85%以上

### Lighthouseスコア目標
- **Performance（パフォーマンス）**: 90+点
- **Accessibility（アクセシビリティ）**: 90+点
- **Best Practices（ベストプラクティス）**: 90+点
- **SEO**: 90+点

## 関連文書

- **アーキテクチャ**: [architecture.md](architecture.md)
- **データフロー**: [dataflow.md](dataflow.md)
- **Vitest設定**: [vitest.config.example.ts](vitest.config.example.ts)
- **Playwright設定**: [playwright.config.example.ts](playwright.config.example.ts)
