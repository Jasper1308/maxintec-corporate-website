import { describe, expect, it } from 'vitest';

import { queryBuilderMock, queueSupabaseQueryResults } from '../../../tests/mocks/supabase';
import { getTicketsPage } from './queries';

describe('ticket pagination and filters', () => {
  it('applies all administrative filters before pagination', async () => {
    queueSupabaseQueryResults({ data: [], error: null, count: 51 });
    const result = await getTicketsPage({ page: 2, pageSize: 25, search: 'Portão', status: 'open', priority: 'urgent', category: 'portao', condominiumId: 'condo-a', assignedTo: 'unassigned' });
    expect(result).toEqual({ items: [], total: 51 });
    expect(queryBuilderMock.ilike).toHaveBeenCalledWith('title', '%Portão%');
    expect(queryBuilderMock.eq).toHaveBeenCalledWith('status', 'open');
    expect(queryBuilderMock.eq).toHaveBeenCalledWith('priority', 'urgent');
    expect(queryBuilderMock.eq).toHaveBeenCalledWith('category', 'portao');
    expect(queryBuilderMock.eq).toHaveBeenCalledWith('condominium_id', 'condo-a');
    expect(queryBuilderMock.is).toHaveBeenCalledWith('assigned_to', null);
    expect(queryBuilderMock.range).toHaveBeenCalledWith(25, 49);
  });

  it('searches an exact ticket number without loading every ticket', async () => {
    queueSupabaseQueryResults({ data: [], error: null, count: 0 });
    await getTicketsPage({ page: 1, pageSize: 25, search: ' 1042 ' });
    expect(queryBuilderMock.or).toHaveBeenCalledWith('title.ilike.%1042%,ticket_number.eq.1042');
    expect(queryBuilderMock.range).toHaveBeenCalledWith(0, 24);
  });
});
