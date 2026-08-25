import type { ReactNode } from 'react';

export function LoadingState({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div role="status" className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 text-center text-slate-400">
      <span className="mx-auto mb-3 block h-6 w-6 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
      {label}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center"><p className="font-medium text-white">{title}</p>{children && <div className="mt-2 text-sm text-slate-400">{children}</div>}</div>;
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <div role="alert" className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-200"><p>{message}</p>{retry && <button type="button" onClick={retry} className="mt-3 rounded-lg border border-red-400/30 px-3 py-2 text-sm hover:bg-red-500/10">Tentar novamente</button>}</div>;
}

export function AccessDenied() {
  return <ErrorState message="Você não tem acesso a esta área." />;
}
