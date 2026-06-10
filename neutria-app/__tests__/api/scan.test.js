import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockReq, mockRes, fetchResponse } from '../../test/helpers';
import handler from '../../pages/api/scan';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('POST /api/scan', () => {
  it('rejects non-POST methods with 405', async () => {
    const res = mockRes();
    await handler(mockReq({ method: 'GET' }), res);
    expect(res.statusCode).toBe(405);
  });

  it('rejects a missing imageBase64 with 400', async () => {
    const res = mockRes();
    await handler(mockReq({ body: {} }), res);
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toContain('Missing imageBase64');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('strips the data-URI prefix before forwarding to HF', async () => {
    fetch.mockResolvedValue(fetchResponse({ ok: true, json: {} }));
    const res = mockRes();
    await handler(
      mockReq({ body: { imageBase64: 'data:image/png;base64,AAAabc123' } }),
      res,
    );
    const sent = JSON.parse(fetch.mock.calls[0][1].body);
    expect(sent.imageBase64).toBe('AAAabc123');
    expect(sent.create_shopify).toBe(false);
  });

  it('passes create_shopify through as a boolean', async () => {
    fetch.mockResolvedValue(fetchResponse({ ok: true, json: {} }));
    const res = mockRes();
    await handler(mockReq({ body: { imageBase64: 'x', createShopify: 1 } }), res);
    const sent = JSON.parse(fetch.mock.calls[0][1].body);
    expect(sent.create_shopify).toBe(true);
  });

  it('normalises the HF response into the frontend shape', async () => {
    fetch.mockResolvedValue(
      fetchResponse({
        ok: true,
        json: {
          title: 'Nike Hoodie',
          suggested_price: 30,
          category: 'Clothing',
          condition: 'Excellent',
          body_html: '<p>Cosy</p>',
          ocr_text: ['NIKE', 'M'],
          shopify: { id: 1 },
        },
      }),
    );
    const res = mockRes();
    await handler(mockReq({ body: { imageBase64: 'x' } }), res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      title: 'Nike Hoodie',
      price: 30, // falls back from suggested_price
      suggested_price: 30,
      category: 'Clothing',
      condition: 'Excellent',
      description: '<p>Cosy</p>',
      brand_text: 'NIKE M', // ocr_text array joined
      shopify: { id: 1 },
    });
  });

  it('applies safe defaults when HF returns empty fields', async () => {
    fetch.mockResolvedValue(fetchResponse({ ok: true, json: {} }));
    const res = mockRes();
    await handler(mockReq({ body: { imageBase64: 'x' } }), res);
    expect(res.body).toMatchObject({
      title: 'Secondhand Item',
      price: 0,
      category: 'Misc',
      condition: 'Good',
      brand_text: '',
      shopify: null,
    });
  });

  it('passes through HF error status with a fallback item shape', async () => {
    fetch.mockResolvedValue(fetchResponse({ ok: false, status: 503, text: 'overloaded' }));
    const res = mockRes();
    await handler(mockReq({ body: { imageBase64: 'x' } }), res);
    expect(res.statusCode).toBe(503);
    expect(res.body.error).toBe('HF scanner returned an error');
    expect(res.body.title).toBe('Unknown Item');
  });

  it('returns 500 with a fallback shape when fetch throws', async () => {
    fetch.mockRejectedValue(new Error('boom'));
    const res = mockRes();
    await handler(mockReq({ body: { imageBase64: 'x' } }), res);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Scan proxy failed');
    expect(res.body.details).toBe('boom');
  });
});
