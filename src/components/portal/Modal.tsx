'use client';

import { type ReactNode, useEffect, useId } from 'react';

export function Modal({ open, title, children, onClose }: { open: boolean; title: string; children: ReactNode; onClose: () => void }) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onMouseDown={event => event.target === event.currentTarget && onClose()}><section role="dialog" aria-modal="true" aria-labelledby={titleId} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl sm:p-6"><div className="mb-5 flex items-center justify-between gap-4"><h2 id={titleId} className="text-xl font-semibold">{title}</h2><button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white">Fechar</button></div>{children}</section></div>;
}
