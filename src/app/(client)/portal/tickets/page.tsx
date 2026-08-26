'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

import { Plus, Search } from 'lucide-react';

import { PageHeader } from '@/components/portal/PageHeader';
import { Pagination } from '@/components/portal/Pagination';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/portal/PortalStates';
import { useAuth } from '@/features/auth/AuthProvider';
import { NewTicketModal } from '@/features/tickets/components/NewTicketModal';
import { TicketDetailModal } from '@/features/tickets/components/TicketDetailModal';
import { TicketList } from '@/features/tickets/components/TicketList';
import { getTicketErrorMessage } from '@/features/tickets/errors';
import {
  getActiveCondominiums,
  getAdminProfiles,
  getTicketsPage,
} from '@/features/tickets/queries';
import {
  ticketCategories,
  ticketCategoryLabels,
  ticketPriorities,
  ticketPriorityLabels,
  ticketStatuses,
  ticketStatusLabels,
  type Ticket,
  type TicketCategory,
  type TicketCondominium,
  type TicketListFilters,
  type TicketPriority,
  type TicketProfile,
  type TicketStatus,
} from '@/features/tickets/types';

const PAGE_SIZE = 25;

interface DraftFilters {
  search: string;
  status: '' | TicketStatus;
  priority: '' | TicketPriority;
  category: '' | TicketCategory;
  condominiumId: string;
  assignedTo: string;
}

const emptyFilters: DraftFilters = {
  search: '',
  status: '',
  priority: '',
  category: '',
  condominiumId: '',
  assignedTo: '',
};

export default function TicketsPage() {
  const { user, memberships, isAdmin, isManager } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [draftFilters, setDraftFilters] = useState<DraftFilters>(emptyFilters);
  const [filters, setFilters] = useState<DraftFilters>(emptyFilters);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  const [adminCondominiums, setAdminCondominiums] = useState<
    TicketCondominium[]
  >([]);
  const [adminProfiles, setAdminProfiles] = useState<TicketProfile[]>([]);
  const [supportingDataLoading, setSupportingDataLoading] = useState(false);
  const [supportingDataError, setSupportingDataError] = useState<string | null>(
    null
  );

  const loadTickets = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const queryFilters: TicketListFilters = {
        page,
        pageSize: PAGE_SIZE,
        search: filters.search || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
        category: filters.category || undefined,
        condominiumId: filters.condominiumId || undefined,
        assignedTo: filters.assignedTo || undefined,
      };
      const result = await getTicketsPage(queryFilters);
      setTickets(result.items);
      setTotal(result.total);
    } catch (caughtError) {
      console.error('Failed to load tickets:', caughtError);
      setError(
        getTicketErrorMessage(
          caughtError,
          'Não foi possível carregar os chamados. Tente novamente.'
        )
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [filters, page]);

  const loadAdminSupportingData = useCallback(async () => {
    if (!isManager) {
      setAdminCondominiums([]);
      setAdminProfiles([]);
      setSupportingDataError(null);
      setSupportingDataLoading(false);
      return;
    }

    setSupportingDataLoading(true);
    setSupportingDataError(null);

    const [condominiumsResult, profilesResult] = await Promise.allSettled([
      isAdmin ? getActiveCondominiums() : Promise.resolve([]),
      getAdminProfiles(),
    ]);

    const failures: unknown[] = [];

    if (condominiumsResult.status === 'fulfilled') {
      setAdminCondominiums(condominiumsResult.value);
    } else {
      failures.push(condominiumsResult.reason);
      setAdminCondominiums([]);
      console.error(
        'Failed to load active condominiums:',
        condominiumsResult.reason
      );
    }

    if (profilesResult.status === 'fulfilled') {
      setAdminProfiles(profilesResult.value);
    } else {
      failures.push(profilesResult.reason);
      setAdminProfiles([]);
      console.error('Failed to load admin profiles:', profilesResult.reason);
    }

    if (failures.length > 0) {
      setSupportingDataError(
        getTicketErrorMessage(
          failures[0],
          'Alguns dados de gestão não puderam ser carregados.'
        )
      );
    }

    setSupportingDataLoading(false);
  }, [isAdmin, isManager]);

  useEffect(() => {
    if (!user) return;

    const timeoutId = window.setTimeout(() => {
      void loadTickets();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [user, loadTickets]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAdminSupportingData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadAdminSupportingData]);

  const membershipCondominiums = useMemo(() => {
    const uniqueCondominiums = new Map<string, TicketCondominium>();

    memberships.forEach(membership => {
      if (membership.status !== 'approved' || !membership.condominium) {
        return;
      }

      uniqueCondominiums.set(membership.condominium.id, {
        id: membership.condominium.id,
        name: membership.condominium.name,
        active: membership.condominium.active,
      });
    });

    return [...uniqueCondominiums.values()].sort((first, second) =>
      first.name.localeCompare(second.name, 'pt-BR')
    );
  }, [memberships]);

  const availableCondominiums = isAdmin
    ? adminCondominiums
    : membershipCondominiums;

  const selectedTicket = useMemo(
    () => tickets.find(ticket => ticket.id === selectedTicketId) ?? null,
    [tickets, selectedTicketId]
  );

  async function handleCreated() {
    await loadTickets(false);
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setFilters(draftFilters);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Chamados"
        description="Abra solicitações e acompanhe o atendimento em um só lugar."
        action={
          <button
            type="button"
            onClick={() => setNewTicketOpen(true)}
            className="portal-button portal-button-primary"
          >
            <Plus className="h-4 w-4" />
            Novo chamado
          </button>
        }
      />

      {supportingDataError && isManager && (
        <div className="mb-5">
          <ErrorState
            message={supportingDataError}
            retry={() => void loadAdminSupportingData()}
          />
        </div>
      )}

      <form onSubmit={applyFilters} className="portal-card mb-5 grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="portal-label xl:col-span-2">Busca
          <span className="flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-slate-950/50 px-3"><Search className="h-4 w-4 text-slate-500" /><input type="search" value={draftFilters.search} onChange={event => setDraftFilters(current => ({ ...current, search: event.target.value }))} placeholder="Número exato ou título" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none" /></span>
        </label>
        <label className="portal-label">Status<select value={draftFilters.status} onChange={event => setDraftFilters(current => ({ ...current, status: event.target.value as DraftFilters['status'] }))} className="portal-field"><option value="">Todos</option>{ticketStatuses.map(status => <option key={status} value={status}>{ticketStatusLabels[status]}</option>)}</select></label>
        <label className="portal-label">Prioridade<select value={draftFilters.priority} onChange={event => setDraftFilters(current => ({ ...current, priority: event.target.value as DraftFilters['priority'] }))} className="portal-field"><option value="">Todas</option>{ticketPriorities.map(priority => <option key={priority} value={priority}>{ticketPriorityLabels[priority]}</option>)}</select></label>
        <label className="portal-label">Categoria<select value={draftFilters.category} onChange={event => setDraftFilters(current => ({ ...current, category: event.target.value as DraftFilters['category'] }))} className="portal-field"><option value="">Todas</option>{ticketCategories.map(category => <option key={category} value={category}>{ticketCategoryLabels[category]}</option>)}</select></label>
        <label className="portal-label">Condomínio<select value={draftFilters.condominiumId} onChange={event => setDraftFilters(current => ({ ...current, condominiumId: event.target.value }))} className="portal-field"><option value="">Todos permitidos</option>{availableCondominiums.map(condominium => <option key={condominium.id} value={condominium.id}>{condominium.name}</option>)}</select></label>
        <label className="portal-label">Responsável<select value={draftFilters.assignedTo} onChange={event => setDraftFilters(current => ({ ...current, assignedTo: event.target.value }))} className="portal-field"><option value="">Todos</option><option value="unassigned">Não atribuído</option>{adminProfiles.map(profile => <option key={profile.id} value={profile.id}>{profile.full_name ?? profile.email ?? 'Administrador'}</option>)}</select></label>
        <div className="flex items-end"><button type="submit" disabled={loading} className="portal-button portal-button-primary w-full">Aplicar filtros</button></div>
      </form>

      <p className="mb-4 text-sm text-slate-400">{total} {total === 1 ? 'chamado encontrado' : 'chamados encontrados'}</p>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} retry={() => void loadTickets()} />
      ) : tickets.length === 0 ? (
        <EmptyState title="Nenhum chamado corresponde aos filtros.">Ajuste os filtros ou use “Novo chamado” para registrar uma solicitação.</EmptyState>
      ) : (
        <><TicketList tickets={tickets} onSelect={ticket => setSelectedTicketId(ticket.id)} /><Pagination page={page} pageSize={PAGE_SIZE} total={total} disabled={loading} onPageChange={setPage} /></>
      )}

      <NewTicketModal
        open={newTicketOpen}
        condominiums={availableCondominiums}
        condominiumsLoading={isAdmin && supportingDataLoading}
        onClose={() => setNewTicketOpen(false)}
        onCreated={handleCreated}
      />

      <TicketDetailModal
        open={Boolean(selectedTicket)}
        ticket={selectedTicket}
        canManage={isManager}
        isAdmin={isAdmin}
        adminProfiles={adminProfiles}
        onClose={() => setSelectedTicketId(null)}
        onTicketChanged={() => loadTickets(false)}
      />
    </div>
  );
}
