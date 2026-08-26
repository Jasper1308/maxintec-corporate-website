'use client';

import { Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

import { PageHeader } from '@/components/portal/PageHeader';
import { Pagination } from '@/components/portal/Pagination';
import { AccessDenied, EmptyState, ErrorState, LoadingState } from '@/components/portal/PortalStates';
import { StatusBadge } from '@/components/portal/StatusBadge';
import { useAuth } from '@/features/auth/AuthProvider';
import { getCondominiumBlocks, getCondominiums } from '@/features/condominiums/queries';
import type { CondominiumBlock, CondominiumListItem } from '@/features/condominiums/types';
import { ResidentDetailsModal } from '@/features/registrations/components/ResidentDetailsModal';
import { getCondominiumName, residentTypeLabels } from '@/features/registrations/labels';
import { getApprovedResidentsPage } from '@/features/registrations/queries';
import type { ResidentListItem } from '@/features/registrations/types';
import { formatDate } from '@/lib/format';

const PAGE_SIZE = 25;

function getUnit(registration: ResidentListItem): string {
  return [registration.bloco, registration.apartamento].filter(Boolean).join(' · ');
}

export default function ResidentsPage() {
  const { isManager, loading: identityLoading } = useAuth();
  const [residents, setResidents] = useState<ResidentListItem[]>([]);
  const [condominiums, setCondominiums] = useState<CondominiumListItem[]>([]);
  const [blocks, setBlocks] = useState<CondominiumBlock[]>([]);
  const [draftSearch, setDraftSearch] = useState('');
  const [draftCondominium, setDraftCondominium] = useState('');
  const [draftBlock, setDraftBlock] = useState('');
  const [filters, setFilters] = useState({ search: '', condominiumId: '', block: '' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getApprovedResidentsPage({ page, pageSize: PAGE_SIZE, ...filters });
      setResidents(result.items);
      setTotal(result.total);
    } catch (queryError) {
      console.error('Failed to load approved residents:', queryError);
      setError('Não foi possível carregar os moradores. Tente novamente em instantes.');
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    if (identityLoading || !isManager) return;
    const timeoutId = window.setTimeout(() => void loadResidents(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [identityLoading, isManager, loadResidents]);

  useEffect(() => {
    if (identityLoading || !isManager) return;
    let active = true;
    void getCondominiums()
      .then(async available => {
        const availableBlocks = await getCondominiumBlocks(available.map(item => item.id));
        if (active) { setCondominiums(available); setBlocks(availableBlocks); }
      })
      .catch(reason => console.warn('Resident filters unavailable:', reason));
    return () => { active = false; };
  }, [identityLoading, isManager]);

  const blockOptions = useMemo(
    () => [...new Set(blocks.filter(block => !draftCondominium || block.condominium_id === draftCondominium).map(block => block.name))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [blocks, draftCondominium]
  );

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setFilters({ search: draftSearch, condominiumId: draftCondominium, block: draftBlock });
  }

  if (identityLoading) return <LoadingState />;
  if (!isManager) return <AccessDenied />;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Moradores" description="Consulte cadastros aprovados no escopo permitido pela RLS." />

      <form onSubmit={applyFilters} className="portal-card mb-5 grid gap-4 p-4 md:grid-cols-[minmax(14rem,2fr)_minmax(11rem,1fr)_minmax(10rem,1fr)_auto] md:items-end">
        <label className="portal-label">Busca
          <span className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-slate-950/50 px-3"><Search className="h-4 w-4 text-slate-500" /><input type="search" value={draftSearch} onChange={event => setDraftSearch(event.target.value)} placeholder="Nome, e-mail ou unidade" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none" /></span>
        </label>
        <label className="portal-label">Condomínio
          <select value={draftCondominium} onChange={event => { setDraftCondominium(event.target.value); setDraftBlock(''); }} className="portal-field"><option value="">Todos permitidos</option>{condominiums.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        </label>
        <label className="portal-label">Bloco / torre
          <select value={draftBlock} onChange={event => setDraftBlock(event.target.value)} className="portal-field"><option value="">Todos</option>{blockOptions.map(block => <option key={block} value={block}>{block}</option>)}</select>
        </label>
        <button type="submit" disabled={loading} className="portal-button portal-button-primary">Aplicar filtros</button>
      </form>

      {error && <div className="mb-5"><ErrorState message={error} retry={() => void loadResidents()} /></div>}
      {loading ? <LoadingState /> : residents.length === 0 ? <EmptyState title="Nenhum morador corresponde aos filtros." /> : (
        <>
          <div className="portal-table-shell overflow-x-auto">
            <table className="portal-table min-w-[980px]">
              <thead><tr><th className="px-5 py-4">Morador</th><th className="px-5 py-4">Condomínio</th><th className="px-5 py-4">Unidade</th><th className="px-5 py-4">Tipo</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Aprovado em</th></tr></thead>
              <tbody>{residents.map(registration => (
                <tr key={registration.id} onClick={() => setSelectedId(registration.id)} className="cursor-pointer text-slate-300 transition hover:bg-white/[0.04]">
                  <td className="px-5 py-4"><p className="font-medium text-white">{registration.nome_completo}</p><p className="mt-1 text-xs text-slate-500">{registration.email ?? 'E-mail não informado'}</p></td>
                  <td className="px-5 py-4">{getCondominiumName(registration)}</td><td className="px-5 py-4">{getUnit(registration)}</td><td className="px-5 py-4">{residentTypeLabels[registration.tipo_residente]}</td>
                  <td className="px-5 py-4"><StatusBadge value="approved" label="Aprovado" /></td><td className="px-5 py-4">{formatDate(registration.approved_at)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} disabled={loading} onPageChange={setPage} />
        </>
      )}
      {selectedId && <ResidentDetailsModal key={selectedId} registrationId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
