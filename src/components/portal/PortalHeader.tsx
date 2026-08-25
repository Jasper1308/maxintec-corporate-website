'use client';

import {
  Bell,
  CheckCheck,
  LoaderCircle,
  LogOut,
  UserRound,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  useEffect,
  useRef,
  useState,
} from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import type { PortalNotification } from '@/features/notifications/types';
import { useNotifications } from '@/features/notifications/useNotifications';
import { formatDateTime } from '@/lib/format';

function getNotificationHref(notification: PortalNotification): string | null {
  const candidates = [
    notification.metadata?.href,
    notification.metadata?.url,
    notification.metadata?.link,
    notification.metadata?.action_url,
  ];
  const candidate = candidates.find(value => typeof value === 'string');

  return typeof candidate === 'string' && candidate.startsWith('/portal')
    ? candidate
    : null;
}

function getNotificationMessage(notification: PortalNotification): string {
  const candidates = [
    notification.metadata?.message,
    notification.metadata?.body,
    notification.metadata?.description,
  ];
  const message = candidates.find(value => typeof value === 'string');

  return typeof message === 'string'
    ? message
    : 'Há uma nova atualização disponível.';
}

export default function PortalHeader() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const {
    profile,
    user,
    isAdmin,
    isManager,
    signOut,
  } = useAuth();

  const {
    notifications,
    unreadCount,
    loading,
    error,
    markingIds,
    isMarkingAll,
    refresh,
    markAsRead,
    markAllAsRead,
  } = useNotifications(user?.id);

  useEffect(() => {
    if (!notificationsOpen) {
      return;
    }

    function closeOnOutsideClick(event: MouseEvent) {
      if (
        event.target instanceof Node &&
        !dropdownRef.current?.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [notificationsOpen]);

  const role = isAdmin
    ? 'Administrador'
    : isManager
      ? 'Síndico'
      : 'Morador';

  async function handleNotificationClick(notification: PortalNotification) {
    if (!notification.read_at) {
      await markAsRead(notification.id);
    }

    const href = getNotificationHref(notification);

    if (href) {
      router.push(href);
      setNotificationsOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-40 flex min-h-18 items-center justify-between border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-xl sm:px-6 md:min-h-20">
      <div className="flex min-w-0 items-center gap-3">
        <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/10 text-blue-300 sm:flex">
          <UserRound className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {profile?.full_name ?? user?.email}
          </p>

          <p className="mt-0.5 text-xs text-slate-400">{role}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            aria-label={
              unreadCount > 0
                ? `${unreadCount} notificações não lidas`
                : 'Notificações'
            }
            aria-expanded={notificationsOpen}
            aria-haspopup="dialog"
            onClick={() => setNotificationsOpen(open => !open)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900/40 text-slate-300 transition hover:border-white/20 hover:bg-slate-800/70 hover:text-white"
          >
            <Bell className="h-4 w-4" />

            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-slate-950">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <section
              role="dialog"
              aria-label="Notificações"
              className="portal-card portal-popover absolute right-0 top-12 z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden shadow-2xl shadow-black/40"
            >
              <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
                <div>
                  <h2 className="font-semibold text-white">Notificações</h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {unreadCount === 0
                      ? 'Nenhuma não lida'
                      : `${unreadCount} não ${unreadCount === 1 ? 'lida' : 'lidas'}`}
                  </p>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    disabled={isMarkingAll}
                    onClick={() => {
                      void markAllAsRead();
                    }}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-400 transition hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isMarkingAll ? (
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCheck className="h-3.5 w-3.5" />
                    )}
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              {error && (
                <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                  <button
                    type="button"
                    onClick={() => {
                      void refresh();
                    }}
                    className="ml-2 font-medium underline"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              <div className="max-h-[min(28rem,65vh)] overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-400">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    Carregando notificações...
                  </div>
                ) : notifications.length === 0 ? (
                  <p className="px-4 py-10 text-center text-sm text-slate-400">
                    Você ainda não recebeu notificações.
                  </p>
                ) : (
                  notifications.map(notification => {
                    const isUnread = !notification.read_at;
                    const isMarking = markingIds.has(notification.id);

                    return (
                      <button
                        type="button"
                        key={notification.id}
                        disabled={isMarking || isMarkingAll}
                        onClick={() => {
                          void handleNotificationClick(notification);
                        }}
                        className={`relative block w-full border-b border-white/5 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-800/70 disabled:cursor-wait ${
                          isUnread ? 'bg-blue-500/[0.06]' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <span
                            aria-hidden="true"
                            className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
                              isUnread ? 'bg-blue-400' : 'bg-transparent'
                            }`}
                          />

                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-white">
                              {notification.title ?? 'Atualização no portal'}
                            </span>
                            <span className="mt-1 block text-sm leading-5 text-slate-400">
                              {getNotificationMessage(notification)}
                            </span>
                            <span className="mt-2 block text-xs text-slate-500">
                              {formatDateTime(notification.created_at)}
                            </span>
                          </span>

                          {isMarking && (
                            <LoaderCircle className="mt-1 h-3.5 w-3.5 shrink-0 animate-spin text-blue-400" />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </section>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            void signOut().catch(signOutError => {
              console.error('Failed to sign out:', signOutError);
            });
          }}
          className="portal-button portal-button-secondary h-10 min-h-10 px-3 sm:px-4"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
