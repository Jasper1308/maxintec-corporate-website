import { describe, expect, it } from 'vitest';

import { supabaseMock } from '../../../tests/mocks/supabase';
import { requestPasswordReset, updateAccountPassword } from './password';

describe('password flows', () => {
  it('requests recovery with a fixed application redirect', async () => {
    await requestPasswordReset(' USER@EXAMPLE.COM ', 'https://portal.example/reset-password');
    expect(supabaseMock.auth.resetPasswordForEmail).toHaveBeenCalledWith('user@example.com', { redirectTo: 'https://portal.example/reset-password' });
  });
  it('updates the password through the authenticated account', async () => {
    await updateAccountPassword('secure-pass', 'secure-pass');
    expect(supabaseMock.auth.updateUser).toHaveBeenCalledWith({ password: 'secure-pass' });
  });
  it('rejects short or mismatched passwords before calling the service', async () => {
    await expect(updateAccountPassword('short', 'short')).rejects.toThrow('8 caracteres');
    await expect(updateAccountPassword('secure-pass', 'different-pass')).rejects.toThrow('não coincidem');
    expect(supabaseMock.auth.updateUser).not.toHaveBeenCalled();
  });
});
