import { supabase } from '@/lib/supabase/client';
import { SupabaseOperationError } from '@/lib/supabase/errors';

import type {
  NotificationsSnapshot,
  PortalNotification,
} from './types';

const DEFAULT_NOTIFICATION_LIMIT = 12;

export async function getNotifications(
  userId: string,
  limit = DEFAULT_NOTIFICATION_LIMIT
): Promise<NotificationsSnapshot> {
  const [notificationsResult, unreadResult] = await Promise.all([
    supabase
      .from('notifications')
      .select('id, user_id, title, type, metadata, read_at, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null),
  ]);

  if (notificationsResult.error) {
    throw new SupabaseOperationError(
      'notifications.list',
      notificationsResult.error
    );
  }

  if (unreadResult.error) {
    throw new SupabaseOperationError(
      'notifications.unread-count',
      unreadResult.error
    );
  }

  return {
    notifications:
      (notificationsResult.data ?? []) as unknown as PortalNotification[],
    unreadCount: unreadResult.count ?? 0,
  };
}

export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<string> {
  const readAt = new Date().toISOString();

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: readAt })
    .eq('user_id', userId)
    .eq('id', notificationId);

  if (error) {
    throw new SupabaseOperationError('notifications.mark-read', error);
  }

  return readAt;
}

export async function markAllNotificationsAsRead(
  userId: string
): Promise<string> {
  const readAt = new Date().toISOString();

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: readAt })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) {
    throw new SupabaseOperationError('notifications.mark-all-read', error);
  }

  return readAt;
}
