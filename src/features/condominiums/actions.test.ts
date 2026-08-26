import { describe, expect, it } from 'vitest';

import { queryBuilderMock, queueSupabaseQueryResults } from '../../../tests/mocks/supabase';
import { createCondominium, setCondominiumActive, updateCondominium } from './actions';

const saved = { id: 'condo-a', name: 'Condomínio A', legacy_code: 'A-01', slug: 'condominio-a', active: true };

describe('condominium actions', () => {
  it('creates an active condominium with normalized known fields', async () => {
    queueSupabaseQueryResults({ data: saved, error: null });
    await expect(createCondominium({ name: ' Condomínio A ', legacyCode: ' A-01 ', slug: '' })).resolves.toEqual(saved);
    expect(queryBuilderMock.insert).toHaveBeenCalledWith({ name: 'Condomínio A', legacy_code: 'A-01', slug: 'condominio-a', active: true });
  });

  it('updates without changing status implicitly', async () => {
    queueSupabaseQueryResults({ data: saved, error: null });
    await updateCondominium('condo-a', { name: saved.name, legacyCode: saved.legacy_code, slug: saved.slug });
    expect(queryBuilderMock.update).toHaveBeenCalledWith({ name: saved.name, legacy_code: saved.legacy_code, slug: saved.slug });
    expect(queryBuilderMock.eq).toHaveBeenCalledWith('id', 'condo-a');
  });

  it('uses soft deactivation instead of delete', async () => {
    queueSupabaseQueryResults({ data: { id: 'condo-a' }, error: null });
    await setCondominiumActive('condo-a', false);
    expect(queryBuilderMock.update).toHaveBeenCalledWith({ active: false });
    expect(queryBuilderMock.delete).not.toHaveBeenCalled();
  });

  it('reports when RLS applies no update', async () => {
    queueSupabaseQueryResults({ data: null, error: null });
    await expect(setCondominiumActive('condo-a', false)).rejects.toThrow('não foi aplicada');
  });
});
