'use client';

import { ChevronRight } from 'lucide-react';

import { StatusBadge } from '@/components/portal/StatusBadge';
import { formatDateTime } from '@/lib/format';

import {
  ticketCategoryLabels,
  ticketPriorityLabels,
  ticketStatusLabels,
  type Ticket,
} from '../types';

interface TicketListProps {
  tickets: Ticket[];
  onSelect: (ticket: Ticket) => void;
}

export function TicketList({ tickets, onSelect }: TicketListProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60">
      <div className="hidden grid-cols-[minmax(7rem,0.7fr)_minmax(15rem,2fr)_minmax(11rem,1.2fr)_minmax(8rem,0.8fr)_minmax(9rem,1fr)_2rem] gap-4 border-b border-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:grid">
        <span>Número</span>
        <span>Chamado</span>
        <span>Condomínio</span>
        <span>Prioridade</span>
        <span>Status</span>
        <span className="sr-only">Abrir</span>
      </div>

      <div className="divide-y divide-white/10">
        {tickets.map(ticket => (
          <button
            key={ticket.id}
            type="button"
            onClick={() => onSelect(ticket)}
            className="grid w-full gap-3 px-5 py-4 text-left transition hover:bg-white/[0.04] md:grid-cols-[minmax(7rem,0.7fr)_minmax(15rem,2fr)_minmax(11rem,1.2fr)_minmax(8rem,0.8fr)_minmax(9rem,1fr)_2rem] md:items-center md:gap-4"
          >
            <div>
              <span className="text-sm font-semibold text-blue-300">
                #{String(ticket.ticket_number)}
              </span>
              <p className="mt-1 text-xs text-slate-500 md:hidden">
                {formatDateTime(ticket.created_at)}
              </p>
            </div>

            <div className="min-w-0">
              <p className="truncate font-medium text-white">{ticket.title}</p>
              <p className="mt-1 text-xs text-slate-500">
                {ticketCategoryLabels[ticket.category] ?? ticket.category}
                <span className="hidden md:inline">
                  {' · '}
                  {formatDateTime(ticket.created_at)}
                </span>
              </p>
            </div>

            <p className="truncate text-sm text-slate-300">
              <span className="mr-1 text-slate-500 md:hidden">Condomínio:</span>
              {ticket.condominium?.name ?? 'Condomínio indisponível'}
            </p>

            <p className="text-sm text-slate-300">
              <span className="mr-1 text-slate-500 md:hidden">Prioridade:</span>
              {ticketPriorityLabels[ticket.priority] ?? ticket.priority}
            </p>

            <div>
              <StatusBadge
                value={ticket.status}
                label={ticketStatusLabels[ticket.status] ?? ticket.status}
              />
            </div>

            <ChevronRight className="hidden h-4 w-4 text-slate-500 md:block" />
          </button>
        ))}
      </div>
    </div>
  );
}
