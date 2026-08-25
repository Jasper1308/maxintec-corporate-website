import type { ReactNode } from 'react';
import { CircleAlert, Inbox, LoaderCircle, ShieldAlert } from 'lucide-react';

export function LoadingState({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div role="status" className="portal-card p-8 text-center text-sm text-slate-400">
      <LoaderCircle className="mx-auto mb-3 h-6 w-6 animate-spin text-blue-400" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900/30 p-8 text-center sm:p-10">
      <span className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
        <Inbox className="h-5 w-5" />
      </span>
      <p className="font-semibold text-white">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-400">{children}</div>}
    </div>
  );
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-5 text-red-100">
      <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
      <div>
        <p className="text-sm leading-6">{message}</p>
        {retry && (
          <button type="button" onClick={retry} className="portal-button portal-button-danger mt-3">
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  );
}

export function AccessDenied() {
  return (
    <div role="alert" className="portal-card mx-auto max-w-xl p-8 text-center">
      <ShieldAlert className="mx-auto h-9 w-9 text-amber-300" />
      <h1 className="mt-4 text-xl font-semibold text-white">Acesso restrito</h1>
      <p className="mt-2 text-sm text-slate-400">Você não tem acesso a esta área.</p>
    </div>
  );
}
