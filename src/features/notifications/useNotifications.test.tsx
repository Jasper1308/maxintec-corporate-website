import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getNotifications } from './api';
import { useNotifications } from './useNotifications';

vi.mock('./api', () => ({
  getNotifications: vi.fn(),
  markNotificationAsRead: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
}));

const getNotificationsMock = vi.mocked(getNotifications);
const snapshot = {
  notifications: [
    {
      id: 'notification-a',
      user_id: 'resident-a',
      title: 'Chamado atualizado',
      type: 'ticket_updated',
      metadata: null,
      read_at: null,
      created_at: '2026-01-01T00:00:00Z',
    },
  ],
  unreadCount: 1,
};

describe('useNotifications', () => {
  beforeEach(() => {
    getNotificationsMock.mockReset();
  });

  it('does not query before an authenticated user exists', async () => {
    const { result } = renderHook(() => useNotifications(null));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getNotificationsMock).not.toHaveBeenCalled();
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('loads notifications only for the established identity', async () => {
    getNotificationsMock.mockResolvedValue(snapshot);
    const { result } = renderHook(() => useNotifications('resident-a'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getNotificationsMock).toHaveBeenCalledOnce();
    expect(getNotificationsMock).toHaveBeenCalledWith('resident-a');
    expect(result.current.notifications).toEqual(snapshot.notifications);
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('recovers from a PostgREST failure without looping or blocking the portal', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    getNotificationsMock.mockRejectedValue({
      message: 'permission denied for table notifications',
      code: '42501',
      details: null,
      hint: null,
      status: 403,
    });
    const { result } = renderHook(() => useNotifications('resident-a'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Não foi possível carregar as notificações.');
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
    expect(getNotificationsMock).toHaveBeenCalledOnce();
    expect(consoleWarn).toHaveBeenCalledWith(
      '[Supabase] Failed to load notifications',
      expect.objectContaining({
        message: 'permission denied for table notifications',
        code: '42501',
        status: 403,
      })
    );
  });

  it('clears data from the previous identity when the next load fails', async () => {
    getNotificationsMock.mockResolvedValueOnce(snapshot);
    const { result, rerender } = renderHook(
      ({ userId }) => useNotifications(userId),
      { initialProps: { userId: 'resident-a' as string | null } }
    );

    await waitFor(() => expect(result.current.unreadCount).toBe(1));
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    getNotificationsMock.mockRejectedValueOnce(new Error('network unavailable'));
    rerender({ userId: 'resident-b' });

    await waitFor(() => {
      expect(result.current.error).toBe(
        'Não foi possível carregar as notificações.'
      );
    });
    expect(result.current.loading).toBe(false);
    expect(getNotificationsMock).toHaveBeenLastCalledWith('resident-b');
    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.error).toBe('Não foi possível carregar as notificações.');
  });
});
