import { describe, expect, it } from 'vitest';

import { queryBuilderMock, queueSupabaseQueryResults } from '../../../tests/mocks/supabase';
import { updateOwnProfile } from './actions';

describe('profile actions', () => {
  it('updates only safe profile fields for the authenticated id', async () => {
    queueSupabaseQueryResults({ data: { id: 'resident-a' }, error: null });
    await updateOwnProfile('resident-a', { fullName: ' Resident A ', phone: ' 48999998888 ' });
    expect(queryBuilderMock.update).toHaveBeenCalledWith({ full_name: 'Resident A', phone: '48999998888' });
    expect(queryBuilderMock.eq).toHaveBeenCalledWith('id', 'resident-a');
  });

  it('does not send an invalid profile to Supabase', async () => {
    await expect(updateOwnProfile('resident-a', { fullName: ' ', phone: '' })).rejects.toThrow('nome completo');
    expect(queryBuilderMock.update).not.toHaveBeenCalled();
  });
});
