'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { supabase } from '@/lib/supabase/client';
import { reportSupabaseError } from '@/lib/supabase/errors';

import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from './api';
import type { PortalNotification } from './types';

interface UseNotificationsResult {
  notifications: PortalNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markingIds: ReadonlySet<string>;
  isMarkingAll: boolean;
  refresh: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
}

export function useNotifications(
  userId: string | null | undefined
): UseNotificationsResult {
  const [notifications, setNotifications] = useState<PortalNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);
  const [markingIds, setMarkingIds] = useState<Set<string>>(new Set());
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const mountedRef = useRef(true);
  const currentUserIdRef = useRef(userId);
  const notificationsRef = useRef<PortalNotification[]>([]);
  const pendingIdsRef = useRef(new Set<string>());
  const markingAllRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    currentUserIdRef.current = userId;
  }, [userId]);

  const loadNotifications = useCallback(
    async (silent: boolean) => {
      if (!userId) {
        notificationsRef.current = [];
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        setError(null);
        return;
      }

      if (!silent) {
        notificationsRef.current = [];
        setNotifications([]);
        setUnreadCount(0);
        setLoading(true);
        setError(null);
      }

      try {
        const snapshot = await getNotifications(userId);

        if (
          !mountedRef.current ||
          currentUserIdRef.current !== userId
        ) {
          return;
        }

        notificationsRef.current = snapshot.notifications;
        setNotifications(snapshot.notifications);
        setUnreadCount(snapshot.unreadCount);
        setError(null);
      } catch (loadError) {
        reportSupabaseError('Failed to load notifications', loadError);

        if (
          mountedRef.current &&
          currentUserIdRef.current === userId
        ) {
          setError('Não foi possível carregar as notificações.');
        }
      } finally {
        if (
          mountedRef.current &&
          currentUserIdRef.current === userId &&
          !silent
        ) {
          setLoading(false);
        }
      }
    },
    [userId]
  );

  const refresh = useCallback(
    async () => {
      await loadNotifications(false);
    },
    [loadNotifications]
  );

  useEffect(() => {
    let active = true;

    queueMicrotask(() => {
      if (active) {
        void loadNotifications(false);
      }
    });

    return () => {
      active = false;
    };
  }, [loadNotifications]);

  useEffect(() => {
    if (!userId) {
      return;
    }

    const channel = supabase
      .channel(`portal-notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void loadNotifications(true);
        }
      )
      .subscribe(status => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`Notifications Realtime unavailable: ${status}`);
        }
      });

    return () => {
      void supabase.removeChannel(channel).catch(removeError => {
        console.warn('Failed to close notifications channel:', removeError);
      });
    };
  }, [loadNotifications, userId]);

  const markAsRead = useCallback(
    async (notificationId: string): Promise<boolean> => {
      if (
        !userId ||
        markingAllRef.current ||
        pendingIdsRef.current.has(notificationId)
      ) {
        return false;
      }

      pendingIdsRef.current.add(notificationId);
      setMarkingIds(new Set(pendingIdsRef.current));

      try {
        const readAt = await markNotificationAsRead(userId, notificationId);

        if (
          !mountedRef.current ||
          currentUserIdRef.current !== userId
        ) {
          return true;
        }

        const wasUnread = notificationsRef.current.some(
          notification =>
            notification.id === notificationId && !notification.read_at
        );

        const nextNotifications = notificationsRef.current.map(notification =>
          notification.id === notificationId
            ? { ...notification, read_at: notification.read_at ?? readAt }
            : notification
        );

        notificationsRef.current = nextNotifications;
        setNotifications(nextNotifications);

        if (wasUnread) {
          setUnreadCount(current => Math.max(0, current - 1));
        }

        setError(null);
        return true;
      } catch (markError) {
        reportSupabaseError('Failed to mark notification as read', markError);

        if (mountedRef.current) {
          setError('Não foi possível marcar a notificação como lida.');
        }

        return false;
      } finally {
        pendingIdsRef.current.delete(notificationId);

        if (mountedRef.current) {
          setMarkingIds(new Set(pendingIdsRef.current));
        }
      }
    },
    [userId]
  );

  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    if (!userId || markingAllRef.current) {
      return false;
    }

    markingAllRef.current = true;
    setIsMarkingAll(true);

    try {
      const readAt = await markAllNotificationsAsRead(userId);

      if (
        !mountedRef.current ||
        currentUserIdRef.current !== userId
      ) {
        return true;
      }

      const nextNotifications = notificationsRef.current.map(notification => ({
        ...notification,
        read_at: notification.read_at ?? readAt,
      }));

      notificationsRef.current = nextNotifications;
      setNotifications(nextNotifications);
      setUnreadCount(0);
      setError(null);
      return true;
    } catch (markError) {
      reportSupabaseError('Failed to mark all notifications as read', markError);

      if (mountedRef.current) {
        setError('Não foi possível marcar todas as notificações como lidas.');
      }

      return false;
    } finally {
      markingAllRef.current = false;

      if (mountedRef.current) {
        setIsMarkingAll(false);
      }
    }
  }, [userId]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markingIds,
    isMarkingAll,
    refresh,
    markAsRead,
    markAllAsRead,
  };
}
