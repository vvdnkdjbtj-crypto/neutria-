import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockReq, mockRes, fetchResponse } from '../../test/helpers';
import handler from '../../pages/api/partners';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fetchResponse({ ok: true })));
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('POST /api/partners', () => {
  it('rejects non-POST methods with 405', async () => {
    const res = mockRes();
    await handler(mockReq({ method: 'GET' }), res);
    expect(res.statusCode).toBe(405);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects a missing/invalid email with 400', async () => {
    const res = mockRes();
    await handler(mockReq({ body: { name: 'Ada', message: 'hi' } }), res);
    expect(res.statusCode).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('forwards full partner form to Formspree and returns 200', async () => {
    const res = mockRes();
    await handler(
      mockReq({
        body: { name: 'Ada', company: 'Lovelace Ltd', email: 'ada@l.com', message: 'partner?' },
      }),
      res,
    );

    expect(fetch).toHaveBeenCalledTimes(1);
    const sent = JSON.parse(fetch.mock.calls[0][1].body);
    expect(sent).toMatchObject({
      name: 'Ada',
      company: 'Lovelace Ltd',
      email: 'ada@l.com',
      message: 'partner?',
      source: 'neutria.co.uk partners',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('defaults optional fields to empty strings', async () => {
    const res = mockRes();
    await handler(mockReq({ body: { email: 'ada@l.com' } }), res);
    const sent = JSON.parse(fetch.mock.calls[0][1].body);
    expect(sent.name).toBe('');
    expect(sent.company).toBe('');
    expect(sent.message).toBe('');
  });

  it('returns 502 when Formspree rejects', async () => {
    fetch.mockResolvedValueOnce(fetchResponse({ ok: false, text: 'blocked' }));
    const res = mockRes();
    await handler(mockReq({ body: { email: 'ada@l.com' } }), res);
    expect(res.statusCode).toBe(502);
  });
});
