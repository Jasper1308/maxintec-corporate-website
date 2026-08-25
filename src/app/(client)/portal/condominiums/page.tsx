'use client';

import { useCallback, useEffect, useState } from 'react';

import { PageHeader } from '@/components/portal/PageHeader';
import { StatusBadge } from '@/components/portal/StatusBadge';
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
        <div className="portal-table-shell">
          <div className="overflow-x-auto">
            <table className="portal-table min-w-[620px]">
              <thead>
                <tr>
                  <th className="px-5 py-4">Nome</th>
                  <th className="px-5 py-4">Código legado</th>
                  <th className="px-5 py-4">Situação</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="px-5 py-4 font-medium text-white">{item.name}</td>
                    <td className="px-5 py-4 text-slate-400">{item.legacy_code ?? '—'}</td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        value={item.active ? 'active' : 'inactive'}
                        label={item.active ? 'Ativo' : 'Inativo'}
                      />
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
