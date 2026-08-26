import { describe, expect, it } from 'vitest';

import { supabaseMock } from '../../../tests/mocks/supabase';
import type { CondominiumInput } from './types';
import { acceptManagerInvitation, createCondominium, inviteManager, revokeManagerInvitation, saveCondominiumBlock, searchManagerCandidates, setCondominiumActive, setCondominiumBlockActive, setManagerMembership, updateCondominium } from './actions';

const input: CondominiumInput = { name: ' Condomínio A ', cnpj: '', postalCode: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '', phone: '', adminEmail: '', internalNotes: '', erpCode: ' A-01 ', active: true };

describe('condominium administrative actions', () => {
  it('creates a complete condominium through the protected operation', async () => {
    const saved = { id: 'condo-a', name: 'Condomínio A' };
    supabaseMock.rpc.mockResolvedValueOnce({ data: saved, error: null });
    await expect(createCondominium(input)).resolves.toEqual(saved);
    expect(supabaseMock.rpc).toHaveBeenCalledWith('admin_upsert_condominium', expect.objectContaining({ p_condominium_id: null, p_name: 'Condomínio A', p_erp_code: 'A-01', p_active: true }));
  });
  it('updates using the same server-validated boundary', async () => {
    supabaseMock.rpc.mockResolvedValueOnce({ data: { id: 'condo-a' }, error: null });
    await updateCondominium('condo-a', input);
    expect(supabaseMock.rpc).toHaveBeenCalledWith('admin_upsert_condominium', expect.objectContaining({ p_condominium_id: 'condo-a' }));
  });
  it('changes status without deleting data', async () => {
    await setCondominiumActive('condo-a', false);
    expect(supabaseMock.rpc).toHaveBeenCalledWith('admin_set_condominium_active', { p_condominium_id: 'condo-a', p_active: false });
  });
  it('creates, edits and deactivates blocks through protected operations', async () => {
    await saveCondominiumBlock('condo-a', null, ' Bloco A ');
    await setCondominiumBlockActive('block-a', false);
    expect(supabaseMock.rpc).toHaveBeenNthCalledWith(1, 'admin_upsert_condominium_block', { p_condominium_id: 'condo-a', p_block_id: null, p_name: 'Bloco A' });
    expect(supabaseMock.rpc).toHaveBeenNthCalledWith(2, 'admin_set_condominium_block_active', { p_block_id: 'block-a', p_active: false });
  });
  it('searches and associates an existing manager without exposing extra data', async () => {
    supabaseMock.rpc.mockResolvedValueOnce({ data: [{ id: 'user-a', full_name: 'User A', email: 'a@test.com', membership_status: null }], error: null });
    await expect(searchManagerCandidates('condo-a', ' User ')).resolves.toHaveLength(1);
    await setManagerMembership('user-a', 'condo-a', 'approved');
    expect(supabaseMock.rpc).toHaveBeenLastCalledWith('admin_set_membership', { p_user_id: 'user-a', p_condominium_id: 'condo-a', p_status: 'approved' });
  });
  it('sends privileged invitations only through the server function', async () => {
    await inviteManager({ condominiumId: 'condo-a', email: 'manager@test.com' });
    expect(supabaseMock.functions.invoke).toHaveBeenCalledWith('invite-manager', { body: { condominiumId: 'condo-a', email: 'manager@test.com' } });
  });
  it('revokes and accepts invitations through identity-validating operations', async () => {
    supabaseMock.rpc.mockResolvedValue({ data: { id: 'membership-a' }, error: null });
    await revokeManagerInvitation('invite-a');
    await acceptManagerInvitation('invite-a');
    expect(supabaseMock.rpc).toHaveBeenCalledWith('admin_revoke_invitation', { p_invitation_id: 'invite-a' });
    expect(supabaseMock.rpc).toHaveBeenCalledWith('accept_condominium_invitation', { p_invitation_id: 'invite-a' });
  });
  it('propagates safe operation failures', async () => {
    supabaseMock.rpc.mockResolvedValueOnce({ data: null, error: new Error('operation failed') });
    await expect(setCondominiumActive('condo-a', false)).rejects.toThrow('operation failed');
  });
});
