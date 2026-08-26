'use client';

import { Download, Paperclip } from 'lucide-react';

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from 'react';

import { Modal } from '@/components/portal/Modal';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/portal/PortalStates';
import { StatusBadge } from '@/components/portal/StatusBadge';
import { formatDateTime } from '@/lib/format';

import {
  addTicketComment,
  assignTicket,
  updateTicketPriority,
  updateTicketStatus,
} from '../actions';
import { createTicketAttachmentUrl, getTicketAttachments } from '../attachments';
import { getTicketErrorMessage } from '../errors';
import { getTicketEvents } from '../queries';
import {
  ticketCategoryLabels,
  ticketPriorities,
  ticketPriorityLabels,
  ticketStatuses,
  ticketStatusLabels,
  type Ticket,
  type TicketAttachment,
  type TicketEvent,
  type TicketPriority,
  type TicketProfile,
  type TicketStatus,
} from '../types';

interface TicketDetailModalProps {
  open: boolean;
  ticket: Ticket | null;
  canManage: boolean;
  isAdmin: boolean;
  adminProfiles: TicketProfile[];
  onClose: () => void;
  onTicketChanged: () => Promise<void>;
}

const selectClassName = 'portal-field';

const eventLabels: Record<string, string> = {
  comment: 'Comentário',
  created: 'Chamado aberto',
  ticket_created: 'Chamado aberto',
  status_changed: 'Status alterado',
  status_change: 'Status alterado',
  priority_changed: 'Prioridade alterada',
  priority_change: 'Prioridade alterada',
  assigned: 'Responsável alterado',
  assignment_changed: 'Responsável alterado',
  attachment_added: 'Anexo adicionado',
};

function eventLabel(eventType: string): string {
  return (
    eventLabels[eventType] ??
    eventType
      .split('_')
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  );
}

export function TicketDetailModal({
  open,
  ticket,
  canManage,
  isAdmin,
  adminProfiles,
  onClose,
  onTicketChanged,
}: TicketDetailModalProps) {
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [comment, setComment] = useState('');

  const loadEvents = useCallback(async () => {
    if (!ticket) return;

    setEventsLoading(true);
    setEventsError(null);

    try {
      const [nextEvents, nextAttachments] = await Promise.all([
        getTicketEvents(ticket.id),
        getTicketAttachments(ticket.id),
      ]);
      setEvents(nextEvents);
      setAttachments(nextAttachments);
    } catch (error) {
      console.error('Failed to load ticket events:', error);
      setEventsError(
        getTicketErrorMessage(
          error,
          'Não foi possível carregar o histórico deste chamado.'
        )
      );
    } finally {
      setEventsLoading(false);
    }
  }, [ticket]);

  useEffect(() => {
    if (!open || !ticket) return;

    const timeoutId = window.setTimeout(() => {
      void loadEvents();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [open, ticket, loadEvents]);

  if (!ticket) {
    return null;
  }

  const activeTicket = ticket;

  async function runUpdate(
    actionName: string,
    operation: () => Promise<void>
  ) {
    if (pendingAction) return;

    setPendingAction(actionName);
    setActionError(null);

    try {
      await operation();
      await Promise.all([onTicketChanged(), loadEvents()]);
    } catch (error) {
      console.error(`Failed to update ticket (${actionName}):`, error);
      setActionError(
        getTicketErrorMessage(
          error,
          'Não foi possível atualizar o chamado. Tente novamente.'
        )
      );
    } finally {
      setPendingAction(null);
    }
  }

  async function handleComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pendingAction || !comment.trim()) return;

    setPendingAction('comment');
    setActionError(null);

    try {
      await addTicketComment(activeTicket.id, comment);
      setComment('');
      await loadEvents();
    } catch (error) {
      console.error('Failed to add ticket comment:', error);
      setActionError(
        getTicketErrorMessage(
          error,
          'Não foi possível enviar o comentário. Tente novamente.'
        )
      );
    } finally {
      setPendingAction(null);
    }
  }

  const requester =
    ticket.opener?.full_name ?? ticket.opener?.email ?? 'Não informado';
  const currentAssigneeIsListed = adminProfiles.some(
    profile => profile.id === ticket.assigned_to
  );

  function handleClose() {
    if (pendingAction) return;

    setComment('');
    setActionError(null);
    onClose();
  }

  async function openAttachment(attachment: TicketAttachment) {
    setActionError(null);
    try {
      const url = await createTicketAttachmentUrl(attachment);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to open ticket attachment:', error);
      setActionError('Não foi possível abrir o anexo. Tente novamente.');
    }
  }

  return (
    <Modal
      open={open}
      title={`Chamado #${String(ticket.ticket_number)}`}
      onClose={handleClose}
    >
      <div className="space-y-7">
        {actionError && <ErrorState message={actionError} />}

        <section>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold text-white">{ticket.title}</h3>
              <p className="mt-1 text-sm text-slate-400">
                Aberto em {formatDateTime(ticket.created_at)}
              </p>
            </div>
            <StatusBadge
              value={ticket.status}
              label={ticketStatusLabels[ticket.status] ?? ticket.status}
            />
          </div>

          <p className="mt-5 whitespace-pre-wrap rounded-xl border border-white/10 bg-slate-950/70 p-4 text-sm leading-6 text-slate-200">
            {ticket.description}
          </p>

          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Condomínio</dt>
              <dd className="mt-1 text-slate-200">
                {ticket.condominium?.name ?? 'Não disponível'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Solicitante</dt>
              <dd className="mt-1 text-slate-200">{requester}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Categoria</dt>
              <dd className="mt-1 text-slate-200">
                {ticketCategoryLabels[ticket.category] ?? ticket.category}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Responsável</dt>
              <dd className="mt-1 text-slate-200">
                {ticket.assignee?.full_name ??
                  ticket.assignee?.email ??
                  'Não atribuído'}
              </dd>
            </div>
          </dl>
        </section>

        {canManage && (
          <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <h3 className="font-semibold text-white">Gerenciar chamado</h3>
            <div className={`mt-4 grid gap-4 ${isAdmin ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
              <label className="portal-label">
                Status
                <select
                  value={ticket.status}
                  disabled={Boolean(pendingAction)}
                  onChange={event => {
                    const status = event.target.value as TicketStatus;
                    void runUpdate('status', () =>
                      updateTicketStatus(ticket.id, status)
                    );
                  }}
                  className={selectClassName}
                >
                  {ticketStatuses.map(status => (
                    <option key={status} value={status}>
                      {ticketStatusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="portal-label">
                Prioridade
                <select
                  value={ticket.priority}
                  disabled={Boolean(pendingAction)}
                  onChange={event => {
                    const priority = event.target.value as TicketPriority;
                    void runUpdate('priority', () =>
                      updateTicketPriority(ticket.id, priority)
                    );
                  }}
                  className={selectClassName}
                >
                  {ticketPriorities.map(priority => (
                    <option key={priority} value={priority}>
                      {ticketPriorityLabels[priority]}
                    </option>
                  ))}
                </select>
              </label>

              {isAdmin && (
                <label className="portal-label">
                  Responsável
                  <select
                    value={ticket.assigned_to ?? ''}
                    disabled={Boolean(pendingAction)}
                    onChange={event => {
                      const profileId = event.target.value || null;
                      void runUpdate('assignment', () =>
                        assignTicket(ticket.id, profileId)
                      );
                    }}
                    className={selectClassName}
                  >
                    <option value="">Não atribuído</option>
                    {ticket.assigned_to && !currentAssigneeIsListed && (
                      <option value={ticket.assigned_to}>
                        {ticket.assignee?.full_name ??
                          ticket.assignee?.email ??
                          'Responsável atual'}
                      </option>
                    )}
                    {adminProfiles.map(profile => (
                      <option key={profile.id} value={profile.id}>
                        {profile.full_name ?? profile.email ?? 'Administrador'}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
            {pendingAction && pendingAction !== 'comment' && (
              <p className="mt-3 text-xs text-blue-300">Salvando alteração...</p>
            )}
          </section>
        )}

        <section>
          <h3 className="flex items-center gap-2 font-semibold text-white"><Paperclip className="h-4 w-4 text-blue-300" />Anexos</h3>
          <div className="mt-4">
            {eventsLoading ? <LoadingState /> : attachments.length === 0 ? <p className="text-sm text-slate-500">Nenhum anexo neste chamado.</p> : <ul className="divide-y divide-white/10 rounded-xl border border-white/10">{attachments.map(attachment => <li key={attachment.id} className="flex flex-wrap items-center justify-between gap-3 p-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-slate-200">{attachment.original_name}</p><p className="mt-1 text-xs text-slate-500">{(attachment.size_bytes / 1024 / 1024).toFixed(1)} MB · {formatDateTime(attachment.created_at)}</p></div><button type="button" onClick={() => void openAttachment(attachment)} className="portal-button portal-button-secondary min-h-9 px-3"><Download className="h-3.5 w-3.5" />{attachment.mime_type === 'application/pdf' ? 'Baixar' : 'Visualizar'}</button></li>)}</ul>}
          </div>
        </section>

        <section>
          <h3 className="font-semibold text-white">Histórico</h3>
          <div className="mt-4">
            {eventsLoading ? (
              <LoadingState />
            ) : eventsError ? (
              <ErrorState message={eventsError} retry={() => void loadEvents()} />
            ) : events.length === 0 ? (
              <EmptyState title="Nenhum evento registrado." />
            ) : (
              <ol className="space-y-3">
                {events.map(ticketEvent => (
                  <li
                    key={ticketEvent.id}
                    className="rounded-xl border border-white/10 bg-slate-950/45 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-200">
                        {eventLabel(ticketEvent.event_type)}
                      </p>
                      <time className="text-xs text-slate-500">
                        {formatDateTime(ticketEvent.created_at)}
                      </time>
                    </div>
                    {ticketEvent.message && (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                        {ticketEvent.message}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-slate-500">
                      {ticketEvent.actor?.full_name ??
                        ticketEvent.actor?.email ??
                        'Sistema'}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>

        <form onSubmit={handleComment}>
          <label className="portal-label">
            Adicionar comentário
            <textarea
              rows={4}
              value={comment}
              onChange={event => setComment(event.target.value)}
              disabled={Boolean(pendingAction)}
              className="portal-field"
              placeholder="Escreva uma atualização para o histórico"
            />
          </label>
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={Boolean(pendingAction) || !comment.trim()}
              className="portal-button portal-button-primary"
            >
              {pendingAction === 'comment' ? 'Enviando...' : 'Enviar comentário'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
