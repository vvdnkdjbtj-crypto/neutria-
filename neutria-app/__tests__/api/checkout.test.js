import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockReq, mockRes } from '../../test/helpers';

// Capture the args Stripe is called with. vi.hoisted so the spy exists
// when the (hoisted) vi.mock factory runs.
const { createSession } = vi.hoisted(() => ({ createSession: vi.fn() }));

// Mock the stripe SDK before the handler module is imported.
vi.mock('stripe', () => ({
  default: class Stripe {
    constructor() {
      this.checkout = { sessions: { create: createSession } };
    }
  },
}));

let handler;
beforeEach(async () => {
  vi.clearAllMocks();
  createSession.mockResolvedValue({ url: 'https://stripe.test/session/abc' });
  process.env.NEXT_PUBLIC_APP_URL = 'https://neutria.co.uk';
  handler = (await import('../../pages/api/checkout')).default;
});

describe('POST /api/checkout', () => {
  it('rejects non-POST methods with 405', async () => {
    const res = mockRes();
    await handler(mockReq({ method: 'GET' }), res);
    expect(res.status).toHaveBeenCalledWith(405);
  });

  it('rejects an unknown plan with 400', async () => {
    const res = mockRes();
    await handler(mockReq({ body: { plan: 'enterprise' } }), res);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid plan' });
    expect(createSession).not.toHaveBeenCalled();
  });

  it('rejects a missing plan with 400', async () => {
    const res = mockRes();
    await handler(mockReq({ body: {} }), res);
    expect(res.statusCode).toBe(400);
  });

  it.each([
    ['seller', 1299, 'Neutria Seller Plan'],
    ['pro', 3900, 'Neutria Pro Plan'],
    ['business', 15900, 'Neutria Business Plan'],
  ])('builds a correct subscription session for the %s plan', async (plan, amount, productName) => {
    const res = mockRes();
    await handler(mockReq({ body: { plan } }), res);

    expect(createSession).toHaveBeenCalledTimes(1);
    const arg = createSession.mock.calls[0][0];
    expect(arg.mode).toBe('subscription');
    expect(arg.line_items[0].price_data.currency).toBe('gbp');
    expect(arg.line_items[0].price_data.unit_amount).toBe(amount);
    expect(arg.line_items[0].price_data.product_data.name).toBe(productName);
    expect(arg.line_items[0].price_data.recurring).toEqual({ interval: 'month' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ url: 'https://stripe.test/session/abc' });
  });

  it('falls back to env-derived success/cancel URLs', async () => {
    const res = mockRes();
    await handler(mockReq({ body: { plan: 'pro' } }), res);
    const arg = createSession.mock.calls[0][0];
    expect(arg.success_url).toBe('https://neutria.co.uk/dashboard?success=true');
    expect(arg.cancel_url).toBe('https://neutria.co.uk/membership');
  });

  it('honours explicit success/cancel URLs from the request', async () => {
    const res = mockRes();
    await handler(
      mockReq({ body: { plan: 'pro', successUrl: 'https://x/ok', cancelUrl: 'https://x/no' } }),
      res,
    );
    const arg = createSession.mock.calls[0][0];
    expect(arg.success_url).toBe('https://x/ok');
    expect(arg.cancel_url).toBe('https://x/no');
  });

  it('surfaces Stripe errors as 500', async () => {
    createSession.mockRejectedValueOnce(new Error('card declined'));
    const res = mockRes();
    await handler(mockReq({ body: { plan: 'seller' } }), res);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'card declined' });
  });
});
