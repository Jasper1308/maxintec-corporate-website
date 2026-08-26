'use client';

import { Building2, Pencil, Plus, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Modal } from '@/components/portal/Modal';
import { PageHeader } from '@/components/portal/PageHeader';
import { AccessDenied, EmptyState, ErrorState, LoadingState } from '@/components/portal/PortalStates';
import { StatusBadge } from '@/components/portal/StatusBadge';
import { useAuth } from '@/features/auth/AuthProvider';
import { createCondominium, setCondominiumActive, updateCondominium } from '@/features/condominiums/actions';
import { CondominiumDetailsModal } from '@/features/condominiums/components/CondominiumDetailsModal';
import { CondominiumFormModal } from '@/features/condominiums/components/CondominiumFormModal';
import { getCondominiums } from '@/features/condominiums/queries';
import type { CondominiumInput, CondominiumListItem } from '@/features/condominiums/types';
import { errorMessage } from '@/lib/format';

function searchable(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export default function CondominiumsPage() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<CondominiumListItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formTarget, setFormTarget] = useState<CondominiumListItem | 'new' | null>(null);
  const [detailsTarget, setDetailsTarget] = useState<CondominiumListItem | null>(null);
  const [toggleTarget, setToggleTarget] = useState<CondominiumListItem | null>(null);
  const [toggling, setToggling] = useState(false);

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
    const timeoutId = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  const filteredItems = useMemo(() => {
    const term = searchable(search.trim());
    if (!term) return items;
    return items.filter(item =>
      [item.name, item.legacy_code ?? '', item.slug].some(value => searchable(value).includes(term))
    );
  }, [items, search]);

  async function handleSave(input: CondominiumInput) {
    if (formTarget === 'new') {
      await createCondominium(input);
      setSuccess('Condomínio criado com sucesso.');
    } else if (formTarget) {
      await updateCondominium(formTarget.id, input);
      setSuccess('Condomínio atualizado com sucesso.');
    }
    setFormTarget(null);
    await load();
  }

  async function handleToggle() {
    if (!toggleTarget || toggling) return;
    setToggling(true);
    setError(null);
    try {
      await setCondominiumActive(toggleTarget.id, !toggleTarget.active);
      setSuccess(toggleTarget.active ? 'Condomínio desativado.' : 'Condomínio reativado.');
      setToggleTarget(null);
      await load();
    } catch (reason) {
      console.error('Failed to change condominium status:', reason);
      setError(errorMessage(reason, 'Não foi possível alterar o status do condomínio.'));
    } finally {
      setToggling(false);
    }
  }

  if (!isAdmin) return <AccessDenied />;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader title="Condomínios" description="Administre os clientes cadastrados sem exclusão física de dados." action={
        <button type="button" onClick={() => { setSuccess(null); setFormTarget('new'); }} className="portal-button portal-button-primary"><Plus className="h-4 w-4" />Novo condomínio</button>
      } />

      {success && <p role="status" className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</p>}
      {error && <div className="mb-5"><ErrorState message={error} retry={() => void load()} /></div>}

      <label className="mb-5 flex min-h-11 max-w-xl items-center gap-3 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2.5 focus-within:border-blue-500">
        <Search className="h-4 w-4 text-slate-500" /><span className="sr-only">Buscar condomínios</span>
        <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar por nome, código ou identificador" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
      </label>

      {loading ? <LoadingState /> : items.length === 0 ? <EmptyState title="Nenhum condomínio encontrado." /> : filteredItems.length === 0 ? <EmptyState title="Nenhum condomínio corresponde à busca." /> : (
        <div className="portal-table-shell overflow-x-auto">
          <table className="portal-table min-w-[900px]">
            <thead><tr><th className="px-5 py-4">Nome</th><th className="px-5 py-4">Código</th><th className="px-5 py-4">Identificador</th><th className="px-5 py-4">Situação</th><th className="px-5 py-4 text-right">Ações</th></tr></thead>
            <tbody>{filteredItems.map(item => (
              <tr key={item.id}>
                <td className="px-5 py-4 font-medium text-white">{item.name}</td><td className="px-5 py-4 text-slate-400">{item.legacy_code ?? '—'}</td><td className="px-5 py-4 text-slate-400">{item.slug}</td>
                <td className="px-5 py-4"><StatusBadge value={item.active ? 'active' : 'inactive'} label={item.active ? 'Ativo' : 'Inativo'} /></td>
                <td className="px-5 py-4"><div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setDetailsTarget(item)} className="portal-button portal-button-secondary min-h-9 px-3"><Building2 className="h-3.5 w-3.5" />Detalhes</button>
                  <button type="button" onClick={() => setFormTarget(item)} className="portal-button portal-button-secondary min-h-9 px-3"><Pencil className="h-3.5 w-3.5" />Editar</button>
                  <button type="button" onClick={() => setToggleTarget(item)} className="portal-button portal-button-secondary min-h-9 px-3">{item.active ? 'Desativar' : 'Reativar'}</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {formTarget && <CondominiumFormModal key={formTarget === 'new' ? 'new' : formTarget.id} condominium={formTarget === 'new' ? null : formTarget} onClose={() => setFormTarget(null)} onSave={handleSave} />}
      {detailsTarget && <CondominiumDetailsModal key={detailsTarget.id} condominium={detailsTarget} onClose={() => setDetailsTarget(null)} />}
      {toggleTarget && <Modal open title={toggleTarget.active ? 'Desativar condomínio' : 'Reativar condomínio'} onClose={() => { if (!toggling) setToggleTarget(null); }}>
        <p className="text-sm leading-6 text-slate-300">{toggleTarget.active ? `“${toggleTarget.name}” deixará de aparecer nos fluxos ativos. Os dados existentes serão preservados.` : `“${toggleTarget.name}” voltará a ficar disponível nos fluxos ativos.`}</p>
        <div className="mt-6 flex justify-end gap-3"><button type="button" disabled={toggling} onClick={() => setToggleTarget(null)} className="portal-button portal-button-secondary">Cancelar</button><button type="button" disabled={toggling} onClick={() => void handleToggle()} className="portal-button portal-button-primary">{toggling ? 'Processando...' : 'Confirmar'}</button></div>
      </Modal>}
    </div>
  );
}
