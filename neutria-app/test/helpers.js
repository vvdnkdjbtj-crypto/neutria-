// test/helpers.js
// Minimal Next.js API req/res mocks for unit-testing route handlers.

import { vi } from 'vitest';

// Builds a res object that records status code and the JSON/ended body,
// with the chainable shape (res.status(n).json(...)) the handlers expect.
export function mockRes() {
  const res = {
    statusCode: 200,
    body: undefined,
    ended: false,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    end(payload) {
      this.ended = true;
      if (payload !== undefined) this.body = payload;
      return this;
    },
  };
  vi.spyOn(res, 'status');
  vi.spyOn(res, 'json');
  vi.spyOn(res, 'end');
  return res;
}

export function mockReq({ method = 'POST', body = {} } = {}) {
  return { method, body };
}

// A fetch Response stand-in.
export function fetchResponse({ ok = true, status = 200, json = {}, text = '' } = {}) {
  return {
    ok,
    status,
    json: async () => json,
    text: async () => text,
  };
}
