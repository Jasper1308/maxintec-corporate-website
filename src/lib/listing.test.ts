import { describe, expect, it } from 'vitest';

import { getPageRange, getTotalPages, normalizeSearch } from './listing';

describe('listing helpers', () => {
  it.each([
    [1, 25, { from: 0, to: 24 }],
    [2, 25, { from: 25, to: 49 }],
    [3, 20, { from: 40, to: 59 }],
  ])('builds the range for page %s', (page, pageSize, expected) => {
    expect(getPageRange(page, pageSize)).toEqual(expected);
  });

  it('keeps invalid page values inside a safe range', () => {
    expect(getPageRange(0, 0)).toEqual({ from: 0, to: 0 });
  });

  it.each([[0, 25, 1], [1, 25, 1], [25, 25, 1], [26, 25, 2]])(
    'calculates total pages for %s records',
    (total, pageSize, expected) => {
      expect(getTotalPages(total, pageSize)).toBe(expected);
    }
  );

  it('removes PostgREST filter punctuation from search input', () => {
    expect(normalizeSearch('  torre%,(A)_*  ')).toBe('torre A');
  });
});
