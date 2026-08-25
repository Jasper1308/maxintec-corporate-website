import { supabase } from '@/lib/supabase/client';

import type {
  NotificationsSnapshot,
  PortalNotification,
} from './types';

const DEFAULT_NOTIFICATION_LIMIT = 12;

export async function getNotifications(
  limit = DEFAULT_NOTIFICATION_LIMIT
): Promise<NotificationsSnapshot> {
  const [notificationsResult, unreadResult] = await Promise.all([
    supabase
      .from('notifications')
      .select('id, user_id, title, type, metadata, read_at, created_at')
      .order('created_at', { ascending: false })
      .limit(limit),
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .is('read_at', null),
  ]);

  if (notificationsResult.error) {
    throw notificationsResult.error;
  }

  if (unreadResult.error) {
    throw unreadResult.error;
  }

  return {
    notifications:
      (notificationsResult.data ?? []) as unknown as PortalNotification[],
    unreadCount: unreadResult.count ?? 0,
  };
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<string> {
  const readAt = new Date().toISOString();

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: readAt })
    .eq('id', notificationId);

  if (error) {
    throw error;
  }

  return readAt;
}

export async function markAllNotificationsAsRead(): Promise<string> {
  const readAt = new Date().toISOString();

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: readAt })
    .is('read_at', null);

  if (error) {
    throw error;
  }

  return readAt;
}
