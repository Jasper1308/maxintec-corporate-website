import { describe, expect, it } from 'vitest';

import {
  ticketCategories,
  ticketCategoryLabels,
  ticketPriorities,
  ticketPriorityLabels,
  ticketStatuses,
  ticketStatusLabels,
} from './types';
import { getTicketErrorMessage } from './errors';

describe('ticket labels', () => {
  it('has a user-facing label for every supported value', () => {
    expect(ticketStatuses.map(status => ticketStatusLabels[status])).toEqual([
      'Aberto',
      'Em andamento',
      'Aguardando',
      'Resolvido',
      'Fechado',
    ]);
    expect(ticketPriorities.map(priority => ticketPriorityLabels[priority])).toEqual([
      'Baixa',
      'Normal',
      'Alta',
      'Urgente',
    ]);
    expect(ticketCategories.map(category => ticketCategoryLabels[category])).toHaveLength(
      ticketCategories.length
    );
  });
});

describe('getTicketErrorMessage', () => {
  it('preserves explicit application errors', () => {
    expect(getTicketErrorMessage(new Error('Comentário obrigatório'), 'Falha')).toBe(
      'Comentário obrigatório'
    );
  });

  it('maps PostgreSQL permission errors without exposing internals', () => {
    expect(getTicketErrorMessage({ code: '42501' }, 'Falha')).toBe(
      'Você não tem permissão para realizar esta operação.'
    );
  });

  it('uses the supplied fallback for unknown errors', () => {
    expect(getTicketErrorMessage({ code: 'XX000' }, 'Falha segura')).toBe(
      'Falha segura'
    );
  });
});
