import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { beforeEach, describe, expect, it } from 'vitest';
import SEO from './SEO.astro';

describe('SEO Component', () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeEach(async () => {
    container = await AstroContainer.create();
  });

  it('renders og:title', async () => {
    const result = await container.renderToString(SEO, {
      props: { title: 'Test', description: 'Desc' },
    });
    expect(result).toContain('<meta property="og:title" content="Test"');
  });

  it('renders twitter:card', async () => {
    const result = await container.renderToString(SEO, {
      props: { title: 'Test', description: 'Desc' },
    });
    expect(result).toContain('<meta name="twitter:card" content="summary_large_image"');
  });

  it('renders WebSite schema', async () => {
    const result = await container.renderToString(SEO, {
      props: { title: 'Test', description: 'Desc' },
    });
    expect(result).toContain('"@type":"WebSite"');
  });
});
