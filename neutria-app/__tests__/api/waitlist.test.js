import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mockReq, mockRes, fetchResponse } from '../../test/helpers';
import handler from '../../pages/api/waitlist';

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(fetchResponse({ ok: true })));
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('POST /api/waitlist', () => {
  it('rejects non-POST methods with 405', async () => {
    const res = mockRes();
    await handler(mockReq({ method: 'GET' }), res);
    expect(res.statusCode).toBe(405);
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([undefined, '', 'nope', 'a@b', 'a@b.', '@b.com', 'a b@x.com'])(
    'rejects invalid email %j with 400',
    async (email) => {
      const res = mockRes();
      await handler(mockReq({ body: { email } }), res);
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'Invalid email' });
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  it('forwards a valid email to Formspree and returns 200', async () => {
    const res = mockRes();
    await handler(mockReq({ body: { email: 'user@example.com' } }), res);

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, opts] = fetch.mock.calls[0];
    expect(url).toContain('formspree.io');
    const sent = JSON.parse(opts.body);
    expect(sent.email).toBe('user@example.com');
    expect(sent.source).toContain('waitlist');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('returns 502 when Formspree rejects', async () => {
    fetch.mockResolvedValueOnce(fetchResponse({ ok: false, text: 'spam blocked' }));
    const res = mockRes();
    await handler(mockReq({ body: { email: 'user@example.com' } }), res);
    expect(res.statusCode).toBe(502);
    expect(res.body.error).toBe('Formspree rejected');
  });

  it('returns 500 when the fetch throws', async () => {
    fetch.mockRejectedValueOnce(new Error('network down'));
    const res = mockRes();
    await handler(mockReq({ body: { email: 'user@example.com' } }), res);
    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('Waitlist forward failed');
  });
});
