'use client';

import { useCallback, useEffect, useState } from 'react';

import { PageHeader } from '@/components/portal/PageHeader';
import {
  AccessDenied,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/portal/PortalStates';
import { getAuditLogs } from '@/features/audit/queries';
import type { AuditLog } from '@/features/audit/types';
import { useAuth } from '@/features/auth/AuthProvider';
import { errorMessage, formatDateTime } from '@/lib/format';

function Metadata({ value }: { value: AuditLog['metadata'] }) {
  if (!value || Object.keys(value).length === 0) {
    return <span className="text-slate-500">—</span>;
  }

  return (
    <details>
      <summary className="cursor-pointer rounded text-sm font-medium text-blue-300 transition hover:text-blue-200">Visualizar</summary>
      <pre className="mt-2 max-w-md overflow-x-auto whitespace-pre-wrap rounded-lg border border-white/10 bg-slate-950 p-3 text-xs text-slate-300">
        {JSON.stringify(value, null, 2)}
      </pre>
    </details>
  );
}

export default function AuditPage() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<AuditLog[]>([]);
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
      setItems(await getAuditLogs());
    } catch (reason) {
      console.error('Failed to load audit logs:', reason);
      setError(errorMessage(reason, 'Não foi possível carregar a auditoria.'));
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
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Auditoria"
        description="Últimos 100 eventos registrados pela plataforma."
      />

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} retry={() => void load()} />
      ) : items.length === 0 ? (
        <EmptyState title="Nenhum evento de auditoria encontrado." />
      ) : (
        <div className="portal-table-shell">
          <div className="overflow-x-auto">
            <table className="portal-table min-w-[900px]">
              <thead>
                <tr>
                  <th className="px-5 py-4">Data</th>
                  <th className="px-5 py-4">Ação</th>
                  <th className="px-5 py-4">Entidade</th>
                  <th className="px-5 py-4">Condomínio</th>
                  <th className="px-5 py-4">Metadados</th>
                </tr>
              </thead>
              <tbody className="align-top">
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-400">{formatDateTime(item.created_at)}</td>
                    <td className="px-5 py-4 font-medium text-white">{item.action}</td>
                    <td className="px-5 py-4 text-slate-300">{item.entity_type}</td>
                    <td className="px-5 py-4 text-slate-300">{item.condominium?.name ?? '—'}</td>
                    <td className="px-5 py-4"><Metadata value={item.metadata} /></td>
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
