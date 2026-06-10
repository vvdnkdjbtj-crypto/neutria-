import { describe, it, expect } from 'vitest';
import { fmt, pct, money } from './format';

describe('fmt', () => {
  it('formats a number as GBP with thousands separators', () => {
    expect(fmt(3420)).toBe('£3,420');
    expect(fmt(8160)).toBe('£8,160');
  });

  it('coerces nullish/invalid input to £0', () => {
    expect(fmt(null)).toBe('£0');
    expect(fmt(undefined)).toBe('£0');
    expect(fmt(0)).toBe('£0');
    expect(fmt('')).toBe('£0');
  });

  it('coerces numeric strings', () => {
    expect(fmt('1500')).toBe('£1,500');
  });
});

describe('pct', () => {
  it('computes the percentage discount of a vs b', () => {
    expect(pct(75, 100)).toBe(25);
    expect(pct(50, 200)).toBe(75);
  });

  it('rounds to the nearest whole percent', () => {
    expect(pct(1, 3)).toBe(67); // 66.6% -> 67
  });

  it('guards against divide-by-zero when b <= 0', () => {
    expect(pct(10, 0)).toBe(0);
    expect(pct(10, -5)).toBe(0);
  });

  it('can return a negative percent when a > b (price went up)', () => {
    expect(pct(150, 100)).toBe(-50);
  });
});

describe('money', () => {
  it('formats with exactly two decimals', () => {
    expect(money(12.5)).toBe('£12.50');
    expect(money(12.999)).toBe('£13.00');
  });

  it('coerces nullish input to £0.00', () => {
    expect(money(null)).toBe('£0.00');
    expect(money(undefined)).toBe('£0.00');
  });
});
