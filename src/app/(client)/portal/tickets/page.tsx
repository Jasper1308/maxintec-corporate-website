'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Plus } from 'lucide-react';

import { PageHeader } from '@/components/portal/PageHeader';
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
  getTickets,
} from '@/features/tickets/queries';
import {
  ticketStatuses,
  ticketStatusLabels,
  type Ticket,
  type TicketCondominium,
  type TicketProfile,
  type TicketStatus,
} from '@/features/tickets/types';

type StatusFilter = 'all' | TicketStatus;

export default function TicketsPage() {
  const { user, memberships, isAdmin, isManager } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

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
      setTickets(await getTickets());
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
  }, []);

  const loadAdminSupportingData = useCallback(async () => {
    if (!isAdmin) {
      setAdminCondominiums([]);
      setAdminProfiles([]);
      setSupportingDataError(null);
      setSupportingDataLoading(false);
      return;
    }

    setSupportingDataLoading(true);
    setSupportingDataError(null);

    const [condominiumsResult, profilesResult] = await Promise.allSettled([
      getActiveCondominiums(),
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
  }, [isAdmin]);

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

  const filteredTickets = useMemo(
    () =>
      statusFilter === 'all'
        ? tickets
        : tickets.filter(ticket => ticket.status === statusFilter),
    [tickets, statusFilter]
  );

  const selectedTicket = useMemo(
    () => tickets.find(ticket => ticket.id === selectedTicketId) ?? null,
    [tickets, selectedTicketId]
  );

  async function handleCreated() {
    await loadTickets(false);
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
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            Novo chamado
          </button>
        }
      />

      {supportingDataError && isAdmin && (
        <div className="mb-5">
          <ErrorState
            message={supportingDataError}
            retry={() => void loadAdminSupportingData()}
          />
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          {tickets.length}{' '}
          {tickets.length === 1 ? 'chamado disponível' : 'chamados disponíveis'}
        </p>
        <label className="flex items-center gap-2 text-sm text-slate-400">
          Status
          <select
            value={statusFilter}
            onChange={event =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="all">Todos</option>
            {ticketStatuses.map(status => (
              <option key={status} value={status}>
                {ticketStatusLabels[status]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} retry={() => void loadTickets()} />
      ) : filteredTickets.length === 0 ? (
        <EmptyState
          title={
            tickets.length === 0
              ? 'Nenhum chamado encontrado.'
              : 'Nenhum chamado possui este status.'
          }
        >
          {tickets.length === 0
            ? 'Use “Novo chamado” para registrar sua primeira solicitação.'
            : 'Selecione outro status para ver os demais chamados.'}
        </EmptyState>
      ) : (
        <TicketList
          tickets={filteredTickets}
          onSelect={ticket => setSelectedTicketId(ticket.id)}
        />
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
