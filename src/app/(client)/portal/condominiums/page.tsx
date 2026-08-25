'use client';

import { useCallback, useEffect, useState } from 'react';

import { PageHeader } from '@/components/portal/PageHeader';
import {
  AccessDenied,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/portal/PortalStates';
import { useAuth } from '@/features/auth/AuthProvider';
import { getCondominiums } from '@/features/condominiums/queries';
import type { CondominiumListItem } from '@/features/condominiums/types';
import { errorMessage } from '@/lib/format';

export default function CondominiumsPage() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<CondominiumListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setItems(await getCondominiums());
    } catch (reason) {
      console.error('Failed to load condominiums:', reason);
      setError(errorMessage(reason, 'Não foi possível carregar os condomínios.'));
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void load();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [load]);

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Condomínios"
        description="Clientes cadastrados na plataforma."
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} retry={() => void load()} />
      ) : items.length === 0 ? (
        <EmptyState title="Nenhum condomínio encontrado." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-4">Nome</th>
                  <th className="px-5 py-4">Código legado</th>
                  <th className="px-5 py-4">Situação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="px-5 py-4 font-medium text-white">{item.name}</td>
                    <td className="px-5 py-4 text-slate-400">{item.legacy_code ?? '—'}</td>
                    <td className="px-5 py-4">
                      <span className={item.active ? 'text-emerald-300' : 'text-slate-400'}>
                        {item.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
