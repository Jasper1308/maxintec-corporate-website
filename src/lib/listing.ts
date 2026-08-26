export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

export function getPageRange(page: number, pageSize: number) {
  const safePage = Math.max(1, Math.trunc(page));
  const safePageSize = Math.max(1, Math.trunc(pageSize));
  const from = (safePage - 1) * safePageSize;

  return {
    from,
    to: from + safePageSize - 1,
  };
}

export function getTotalPages(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(Math.max(0, total) / Math.max(1, pageSize)));
}

export function normalizeSearch(value: string): string {
  return value
    .trim()
    .replace(/[%_*(),]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
