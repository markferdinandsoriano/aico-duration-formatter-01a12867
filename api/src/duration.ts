/**
 * Formats a duration given in seconds as `H:MM:SS`.
 *
 * - Fractional seconds are truncated toward zero (never rounded).
 *   `formatDuration(0.999)` is `"0:00:00"`; `formatDuration(59.999)` is `"0:00:59"`.
 * - Hours are not zero-padded and do not wrap at 24: `formatDuration(86400)` is `"24:00:00"`.
 * - Minutes and seconds are always two digits: `formatDuration(60)` is `"0:01:00"`.
 * - Negative zero is treated as zero: `formatDuration(-0)` is `"0:00:00"`.
 * - Throws `RangeError` for negative values (`-1`, `-0.5`), `NaN`, `Infinity` and `-Infinity`.
 *   Negative fractions are rejected before truncation: `formatDuration(-0.5)` throws.
 * - Exact for whole and fractional inputs up to `Number.MAX_SAFE_INTEGER`:
 *   `formatDuration(9007199254740991)` is `"2501999792983:36:31"`.
 *
 * @param seconds Duration in seconds. Must be finite and not negative.
 * @returns The duration as `H:MM:SS`.
 * @throws {RangeError} If `seconds` is negative, `NaN`, `Infinity` or `-Infinity`.
 */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new RangeError(`seconds must be a finite, non-negative number, got ${String(seconds)}`);
  }
  // "+ 0" normalises -0 to 0.
  const total = Math.trunc(seconds) + 0;
  const remainder = total % 3600;
  // (total - remainder) is an exact multiple of 3600, so this division is exact.
  const hours = (total - remainder) / 3600;
  const minutes = Math.floor(remainder / 60);
  const secs = remainder % 60;
  // BigInt keeps the hours as plain decimal digits for very large values
  // (String() would switch to exponent notation at 1e21).
  return `${BigInt(hours).toString()}:${pad2(minutes)}:${pad2(secs)}`;
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}
