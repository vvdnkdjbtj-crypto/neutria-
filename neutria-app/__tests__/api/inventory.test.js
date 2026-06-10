import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockReq, mockRes, fetchResponse } from '../../test/helpers';

// inventory.js reads SHOPIFY_* env vars at module-load time, so each test
// sets env then dynamically imports a fresh module instance.
async function loadHandler({ domain, token } = {}) {
  vi.resetModules();
  if (domain === undefined) delete process.env.SHOPIFY_DOMAIN;
  else process.env.SHOPIFY_DOMAIN = domain;
  if (token === undefined) delete process.env.SHOPIFY_TOKEN;
  else process.env.SHOPIFY_TOKEN = token;
  return (await import('../../pages/api/inventory')).default;
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('GET /api/inventory', () => {
  it('rejects non-GET methods with 405', async () => {
    const handler = await loadHandler({ domain: 'shop.myshopify.com', token: 't' });
    const res = mockRes();
    await handler(mockReq({ method: 'POST' }), res);
    expect(res.statusCode).toBe(405);
  });

  it('returns 500 when Shopify credentials are missing', async () => {
    const handler = await loadHandler({}); // no env
    const res = mockRes();
    await handler(mockReq({ method: 'GET' }), res);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toContain('credentials not configured');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('cleans the domain (strips protocol and trailing slash) when building the URL', async () => {
    const handler = await loadHandler({ domain: 'https://shop.myshopify.com/', token: 'tok' });
    fetch.mockResolvedValue(fetchResponse({ ok: true, json: { products: [] } }));
    const res = mockRes();
    await handler(mockReq({ method: 'GET' }), res);

    const [url, opts] = fetch.mock.calls[0];
    expect(url).toBe(
      'https://shop.myshopify.com/admin/api/2025-07/products.json?limit=100',
    );
    expect(opts.headers['X-Shopify-Access-Token']).toBe('tok');
  });

  it('maps Shopify products into inventory items with defaults', async () => {
    const handler = await loadHandler({ domain: 'shop.myshopify.com', token: 'tok' });
    fetch.mockResolvedValue(
      fetchResponse({
        ok: true,
        json: {
          products: [
            {
              id: 1,
              title: 'Jacket',
              status: 'active',
              product_type: 'Outerwear',
              created_at: '2024-01-01',
              variants: [{ price: '49.99' }],
              images: [{ src: 'http://img/1.jpg' }],
            },
            { id: 2 }, // missing everything -> exercises defaults
          ],
        },
      }),
    );
    const res = mockRes();
    await handler(mockReq({ method: 'GET' }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.items[0]).toEqual({
      id: 1,
      title: 'Jacket',
      price: 49.99, // string coerced to number
      status: 'active',
      image: 'http://img/1.jpg',
      category: 'Outerwear',
      createdAt: '2024-01-01',
    });
    expect(res.body.items[1]).toMatchObject({
      id: 2,
      title: 'Untitled Item',
      price: 0,
      image: null,
      category: 'Misc',
    });
  });

  it('passes through Shopify error status', async () => {
    const handler = await loadHandler({ domain: 'shop.myshopify.com', token: 'tok' });
    fetch.mockResolvedValue(fetchResponse({ ok: false, status: 401, text: 'unauthorized' }));
    const res = mockRes();
    await handler(mockReq({ method: 'GET' }), res);
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Shopify returned an error');
  });

  it('returns 500 when fetch throws', async () => {
    const handler = await loadHandler({ domain: 'shop.myshopify.com', token: 'tok' });
    fetch.mockRejectedValue(new Error('dns fail'));
    const res = mockRes();
    await handler(mockReq({ method: 'GET' }), res);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Inventory fetch failed');
  });
});
