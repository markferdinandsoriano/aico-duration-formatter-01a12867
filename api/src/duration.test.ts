import { describe, expect, it } from 'vitest';
import * as duration from './duration.js';
import { formatDuration } from './duration.js';

describe('formatDuration', () => {
  it('exports only formatDuration', () => {
    expect(Object.keys(duration)).toEqual(['formatDuration']);
    expect(typeof formatDuration).toBe('function');
  });

  it('formats small values with minute and second rollover (US-1)', () => {
    expect(formatDuration(0)).toBe('0:00:00');
    expect(formatDuration(5)).toBe('0:00:05');
    expect(formatDuration(59)).toBe('0:00:59');
    expect(formatDuration(60)).toBe('0:01:00');
    expect(formatDuration(61)).toBe('0:01:01');
    expect(formatDuration(3599)).toBe('0:59:59');
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3661)).toBe('1:01:01');
  });

  it('does not wrap hours and does not pad them (US-2)', () => {
    expect(formatDuration(86399)).toBe('23:59:59');
    expect(formatDuration(86400)).toBe('24:00:00');
    expect(formatDuration(360000)).toBe('100:00:00');
    expect(formatDuration(18000)).toBe('5:00:00');
  });

  it('truncates fractional seconds toward zero (US-3)', () => {
    expect(formatDuration(0.999)).toBe('0:00:00');
    expect(formatDuration(1.5)).toBe('0:00:01');
    expect(formatDuration(0.5)).toBe('0:00:00');
    expect(formatDuration(1.999)).toBe('0:00:01');
    expect(formatDuration(59.999)).toBe('0:00:59');
    expect(formatDuration(3600.9)).toBe('1:00:00');
    expect(formatDuration(3599.9999999999995)).toBe('0:59:59');
    expect(formatDuration(5e-324)).toBe('0:00:00');
  });

  it('is exact up to Number.MAX_SAFE_INTEGER (FR-8)', () => {
    expect(formatDuration(9007199254740991)).toBe('2501999792983:36:31');
    expect(formatDuration(9007199254740990)).toBe('2501999792983:36:30');
    expect(formatDuration(9007199254738800)).toBe('2501999792983:00:00');
  });

  it('returns H:MM:SS shape for values above the safe-integer limit (FR-9)', () => {
    for (const value of [1e20, 1e30, Number.MAX_VALUE]) {
      expect(formatDuration(value)).toMatch(/^\d+:[0-5]\d:[0-5]\d$/);
    }
  });

  it('treats -0 as zero', () => {
    expect(formatDuration(-0)).toBe('0:00:00');
  });

  it('throws RangeError for negative values, including negative fractions', () => {
    expect(() => formatDuration(-1)).toThrow(RangeError);
    expect(() => formatDuration(-0.5)).toThrow(RangeError);
    expect(() => formatDuration(-0.999)).toThrow(RangeError);
  });

  it('throws RangeError for NaN and infinities', () => {
    expect(() => formatDuration(NaN)).toThrow(RangeError);
    expect(() => formatDuration(Infinity)).toThrow(RangeError);
    expect(() => formatDuration(-Infinity)).toThrow(RangeError);
  });

  it('returns no string for any invalid input', () => {
    const invalid = [-1, -0.5, -0.999, NaN, Infinity, -Infinity];
    for (const value of invalid) {
      let result: unknown;
      let thrown: unknown;
      try {
        result = formatDuration(value);
      } catch (error) {
        thrown = error;
      }
      expect(result).toBeUndefined();
      expect(thrown).toBeInstanceOf(RangeError);
    }
  });

  it('is deterministic and stateless', () => {
    const first = formatDuration(3661);
    formatDuration(0);
    formatDuration(86400);
    expect(formatDuration(3661)).toBe(first);
    expect(first).toBe('1:01:01');
  });

  it('uses only ASCII digits and colons', () => {
    for (const value of [0, 3661, 360000, 9007199254740991]) {
      expect(formatDuration(value)).toMatch(/^[0-9]+:[0-9]{2}:[0-9]{2}$/);
    }
  });

  it('matches an independent computation for every whole second 0 to 86399', () => {
    for (let n = 0; n < 86400; n++) {
      const h = Math.floor(n / 3600);
      const m = Math.floor((n % 3600) / 60);
      const s = n % 60;
      const expected = `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      expect(formatDuration(n)).toBe(expected);
    }
  });
});
