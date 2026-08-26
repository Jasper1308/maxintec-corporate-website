'use client';

import { useCallback, useEffect, useState } from 'react';

import { Modal } from '@/components/portal/Modal';
import { EmptyState, ErrorState, LoadingState } from '@/components/portal/PortalStates';
import { StatusBadge } from '@/components/portal/StatusBadge';
import { formatDate } from '@/lib/format';

import { getCondominiumDetails } from '../queries';
import type { CondominiumDetails, CondominiumListItem } from '../types';

export function CondominiumDetailsModal({ condominium, onClose }: { condominium: CondominiumListItem; onClose: () => void }) {
  const [details, setDetails] = useState<CondominiumDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setDetails(await getCondominiumDetails(condominium.id));
    } catch (reason) {
      console.error('Failed to load condominium details:', reason);
      setError('Não foi possível carregar os detalhes permitidos deste condomínio.');
    } finally {
      setLoading(false);
    }
  }, [condominium.id]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  return (
    <Modal open title={condominium.name} onClose={onClose}>
      <div className="space-y-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
            <div><dt className="text-slate-500">Código legado</dt><dd className="mt-1 text-slate-200">{condominium.legacy_code ?? '—'}</dd></div>
            <div><dt className="text-slate-500">Identificador</dt><dd className="mt-1 text-slate-200">{condominium.slug}</dd></div>
          </dl>
          <StatusBadge value={condominium.active ? 'active' : 'inactive'} label={condominium.active ? 'Ativo' : 'Inativo'} />
        </div>
        {loading ? <LoadingState /> : error ? <ErrorState message={error} retry={() => void load()} /> : details ? (
          <>
            <section className="grid gap-3 sm:grid-cols-3">
              {[
                ['Moradores aprovados', details.approvedResidents],
                ['Cadastros pendentes', details.pendingRegistrations],
                ['Chamados', details.tickets],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl border border-white/10 bg-slate-950/50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-semibold text-white">{value}</p></div>
              ))}
            </section>
            <section>
              <h3 className="font-semibold text-white">Blocos e torres</h3>
              {details.blocks.length === 0 ? <div className="mt-3"><EmptyState title="Nenhum bloco visível." /></div> : (
                <div className="mt-3 flex flex-wrap gap-2">{details.blocks.map((block, index) => <span key={`${block.name}-${index}`} className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200">{block.name}</span>)}</div>
              )}
              <p className="mt-3 text-xs text-amber-200/80">Edição bloqueada até existir uma chave identificadora e contrato de remoção seguros no schema versionado.</p>
            </section>
            <section>
              <h3 className="font-semibold text-white">Gestores</h3>
              {details.managers.length === 0 ? <div className="mt-3"><EmptyState title="Nenhum gestor visível." /></div> : (
                <ul className="mt-3 divide-y divide-white/10 rounded-xl border border-white/10">{details.managers.map(manager => (
                  <li key={manager.membershipId} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div><p className="font-medium text-white">{manager.fullName ?? manager.email ?? 'Perfil não disponível'}</p>{manager.fullName && manager.email && <p className="mt-1 text-xs text-slate-500">{manager.email}</p>}<p className="mt-1 text-xs text-slate-500">Aprovado em {formatDate(manager.approvedAt)}</p></div>
                    <StatusBadge value={manager.status} label={manager.status === 'approved' ? 'Aprovado' : manager.status === 'suspended' ? 'Suspenso' : 'Pendente'} />
                  </li>
                ))}</ul>
              )}
              <p className="mt-3 text-xs text-amber-200/80">Associação e suspensão estão bloqueadas até uma RPC administrativa ou policies versionadas comprovarem o workflow.</p>
            </section>
          </>
        ) : null}
      </div>
    </Modal>
  );
}
