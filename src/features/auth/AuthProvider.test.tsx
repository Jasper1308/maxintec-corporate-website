import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  emitAuthStateChange,
  supabaseMock,
} from '../../../tests/mocks/supabase';
import { AuthProvider, useAuth } from './AuthProvider';
import { getMemberships, getProfile } from './queries';
import type { Membership, Profile } from './types';

const routerMock = vi.hoisted(() => ({
  replace: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => routerMock,
}));

vi.mock('./queries', () => ({
  getProfile: vi.fn(),
  getMemberships: vi.fn(),
}));

const getProfileMock = vi.mocked(getProfile);
const getMembershipsMock = vi.mocked(getMemberships);

function user(id: string): User {
  return {
    id,
    email: `${id}@example.test`,
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2026-01-01T00:00:00Z',
  } as User;
}

function profile(id: string, globalRole: Profile['global_role'] = 'user'): Profile {
  return {
    id,
    full_name: id,
    email: `${id}@example.test`,
    phone: null,
    global_role: globalRole,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };
}

function membership(
  id: string,
  role: Membership['role'],
  status: Membership['status'] = 'approved'
): Membership {
  return {
    id: `membership-${id}`,
    user_id: id,
    condominium_id: 'condominium-a',
    role,
    status,
    approved_at: status === 'approved' ? '2026-01-01T00:00:00Z' : null,
    condominium: {
      id: 'condominium-a',
      legacy_code: 'A',
      name: 'Condominium A',
      slug: 'a',
      active: true,
    },
  };
}

function AuthProbe() {
  const auth = useAuth();

  return (
    <div>
      <output data-testid="loading">{String(auth.loading)}</output>
      <output data-testid="user">{auth.user?.id ?? 'none'}</output>
      <output data-testid="profile">{auth.profile?.id ?? 'none'}</output>
      <output data-testid="memberships">{auth.memberships.length}</output>
      <output data-testid="admin">{String(auth.isAdmin)}</output>
      <output data-testid="manager">{String(auth.isManager)}</output>
      <output data-testid="resident">{String(auth.isResident)}</output>
      <button type="button" onClick={() => void auth.signOut()}>
        Logout
      </button>
    </div>
  );
}

function renderProvider() {
  return render(
    <AuthProvider>
      <AuthProbe />
    </AuthProvider>
  );
}

async function expectLoadingToFinish() {
  await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
}

describe('AuthProvider', () => {
  beforeEach(() => {
    routerMock.replace.mockReset();
    routerMock.refresh.mockReset();
    getProfileMock.mockResolvedValue(null);
    getMembershipsMock.mockResolvedValue([]);
  });

  it('initializes without a user and always finishes loading', async () => {
    renderProvider();

    expect(screen.getByTestId('loading')).toHaveTextContent('true');
    await expectLoadingToFinish();
    expect(screen.getByTestId('user')).toHaveTextContent('none');
    expect(getProfileMock).not.toHaveBeenCalled();
    expect(getMembershipsMock).not.toHaveBeenCalled();
  });

  it('restores a session, loads identity in parallel and computes manager access', async () => {
    const currentUser = user('manager-a');
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user: currentUser },
      error: null,
    });
    getProfileMock.mockResolvedValue(profile(currentUser.id));
    getMembershipsMock.mockResolvedValue([
      membership(currentUser.id, 'manager'),
    ]);

    renderProvider();
    await expectLoadingToFinish();

    expect(screen.getByTestId('user')).toHaveTextContent('manager-a');
    expect(screen.getByTestId('profile')).toHaveTextContent('manager-a');
    expect(screen.getByTestId('memberships')).toHaveTextContent('1');
    expect(screen.getByTestId('admin')).toHaveTextContent('false');
    expect(screen.getByTestId('manager')).toHaveTextContent('true');
    expect(screen.getByTestId('resident')).toHaveTextContent('false');
    expect(getProfileMock).toHaveBeenCalledWith('manager-a');
    expect(getMembershipsMock).toHaveBeenCalledWith('manager-a');
  });

  it('treats admins as managers and ignores unapproved memberships', async () => {
    const currentUser = user('admin');
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user: currentUser },
      error: null,
    });
    getProfileMock.mockResolvedValue(profile(currentUser.id, 'admin'));
    getMembershipsMock.mockResolvedValue([
      membership(currentUser.id, 'resident', 'pending'),
    ]);

    renderProvider();
    await expectLoadingToFinish();

    expect(screen.getByTestId('admin')).toHaveTextContent('true');
    expect(screen.getByTestId('manager')).toHaveTextContent('true');
    expect(screen.getByTestId('resident')).toHaveTextContent('false');
  });

  it.each(['profile', 'memberships'] as const)(
    'does not remain loading when %s loading fails',
    async failingBoundary => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const currentUser = user('resident-a');
      supabaseMock.auth.getUser.mockResolvedValue({
        data: { user: currentUser },
        error: null,
      });
      getProfileMock.mockResolvedValue(profile(currentUser.id));
      getMembershipsMock.mockResolvedValue([
        membership(currentUser.id, 'resident'),
      ]);

      if (failingBoundary === 'profile') {
        getProfileMock.mockRejectedValue(new Error('profile unavailable'));
      } else {
        getMembershipsMock.mockRejectedValue(new Error('memberships unavailable'));
      }

      renderProvider();
      await expectLoadingToFinish();

      expect(screen.getByTestId('user')).toHaveTextContent('resident-a');
      expect(consoleError).toHaveBeenCalled();
    }
  );

  it('keeps the latest identity during rapid auth state changes', async () => {
    renderProvider();
    await expectLoadingToFinish();

    getProfileMock.mockImplementation(async id => profile(id));
    getMembershipsMock.mockImplementation(async id => [membership(id, 'resident')]);

    act(() => {
      emitAuthStateChange('SIGNED_IN', { user: user('resident-a') });
      emitAuthStateChange('SIGNED_IN', { user: user('resident-b') });
    });

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('resident-b'));
    await expectLoadingToFinish();
    expect(screen.getByTestId('profile')).toHaveTextContent('resident-b');
    expect(screen.getByTestId('resident')).toHaveTextContent('true');
    expect(getProfileMock).not.toHaveBeenCalledWith('resident-a');
  });

  it('clears identity after a signed-out event', async () => {
    const currentUser = user('resident-a');
    supabaseMock.auth.getUser.mockResolvedValue({
      data: { user: currentUser },
      error: null,
    });
    getProfileMock.mockResolvedValue(profile(currentUser.id));
    getMembershipsMock.mockResolvedValue([
      membership(currentUser.id, 'resident'),
    ]);
    renderProvider();
    await expectLoadingToFinish();

    act(() => emitAuthStateChange('SIGNED_OUT', null));

    await waitFor(() => expect(screen.getByTestId('user')).toHaveTextContent('none'));
    await expectLoadingToFinish();
    expect(screen.getByTestId('profile')).toHaveTextContent('none');
    expect(screen.getByTestId('memberships')).toHaveTextContent('0');
  });

  it('signs out and redirects without exposing session details', async () => {
    const userEventApi = userEvent.setup();
    renderProvider();
    await expectLoadingToFinish();

    await userEventApi.click(screen.getByRole('button', { name: 'Logout' }));

    expect(supabaseMock.auth.signOut).toHaveBeenCalledOnce();
    expect(routerMock.replace).toHaveBeenCalledWith('/login');
    expect(routerMock.refresh).toHaveBeenCalledOnce();
  });
});
