import { describe, expect, it } from 'vitest';

import { queryBuilderMock, queueSupabaseQueryResults } from '../../../tests/mocks/supabase';
import { getApprovedResidentsPage } from './queries';

describe('resident pagination and filters', () => {
  it('queries only an approved, filtered page under RLS', async () => {
    queueSupabaseQueryResults({ data: [], error: null, count: 27 });
    await expect(getApprovedResidentsPage({ page: 2, pageSize: 20, search: 'Ana,(*)', condominiumId: 'condo-a', block: 'Torre 1' })).resolves.toEqual({ items: [], total: 27 });
    expect(queryBuilderMock.eq).toHaveBeenCalledWith('status', 'approved');
    expect(queryBuilderMock.or).toHaveBeenCalledWith('nome_completo.ilike.%Ana%,email.ilike.%Ana%,apartamento.ilike.%Ana%');
    expect(queryBuilderMock.eq).toHaveBeenCalledWith('condominium_id', 'condo-a');
    expect(queryBuilderMock.eq).toHaveBeenCalledWith('bloco', 'Torre 1');
    expect(queryBuilderMock.range).toHaveBeenCalledWith(20, 39);
  });
});
