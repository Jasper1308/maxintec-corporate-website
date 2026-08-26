import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { updateOwnProfile } from '../actions';
import { updateAccountPassword } from '../password';
import { ProfileForm } from './ProfileForm';

vi.mock('../actions', () => ({ updateOwnProfile: vi.fn() }));
vi.mock('../password', () => ({ updateAccountPassword: vi.fn() }));
vi.mock('../avatar', () => ({ uploadOwnAvatar: vi.fn(), removeOwnAvatar: vi.fn(), getOwnAvatarUrl: vi.fn() }));

describe('ProfileForm account boundaries', () => {
  it('shows email as information, never as an editable field', () => {
    render(<ProfileForm userId="user-a" email="user@example.com" initialName="User A" initialPhone="" initialAvatarPath={null} memberships={[]} onSaved={vi.fn()} />);
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('user@example.com')).not.toBeInTheDocument();
    expect(screen.getByText(/entre em contato com o suporte/)).toBeInTheDocument();
  });
  it('changes password without attempting to change email', async () => {
    const user = userEvent.setup();
    vi.mocked(updateAccountPassword).mockResolvedValue();
    render(<ProfileForm userId="user-a" email="user@example.com" initialName="User A" initialPhone="" initialAvatarPath={null} memberships={[]} onSaved={vi.fn()} />);
    await user.type(screen.getByLabelText('Nova senha'), 'secure-pass');
    await user.type(screen.getByLabelText('Confirmar senha'), 'secure-pass');
    await user.click(screen.getByRole('button', { name: 'Alterar senha' }));
    expect(updateAccountPassword).toHaveBeenCalledWith('secure-pass', 'secure-pass');
    expect(updateOwnProfile).not.toHaveBeenCalled();
  });
});
