import { ChevronLeft, ChevronRight } from 'lucide-react';

import { getTotalPages } from '@/lib/listing';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  disabled?: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  pageSize,
  total,
  disabled = false,
  onPageChange,
}: PaginationProps) {
  const totalPages = getTotalPages(total, pageSize);
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Paginação"
      className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400"
    >
      <p>
        {from}–{to} de {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="portal-button portal-button-secondary min-h-10 px-3"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>
        <span className="min-w-20 text-center">
          {page} de {totalPages}
        </span>
        <button
          type="button"
          disabled={disabled || page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="portal-button portal-button-secondary min-h-10 px-3"
        >
          Próxima
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}
