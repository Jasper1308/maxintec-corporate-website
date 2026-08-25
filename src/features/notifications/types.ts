export interface PortalNotification {
  id: string;
  user_id: string;
  title: string | null;
  type: string;
  metadata: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationsSnapshot {
  notifications: PortalNotification[];
  unreadCount: number;
}
