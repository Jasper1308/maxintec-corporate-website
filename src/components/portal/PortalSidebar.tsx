'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  ScrollText,
  Ticket,
  UserCheck,
  Users,
} from 'lucide-react';

import { useAuth } from '@/features/auth/AuthProvider';
import {
  portalNavigation,
  type PortalPermission,
} from '@/config/portal-navigation';

const icons: Record<string, React.ElementType> = {
  '/portal': LayoutDashboard,
  '/portal/registrations': ClipboardList,
  '/portal/tickets': Ticket,
  '/portal/approvals': UserCheck,
  '/portal/residents': Users,
  '/portal/condominiums': Building2,
  '/portal/audit': ScrollText,
};

export default function PortalSidebar() {
  const pathname = usePathname();

  const {
    isAdmin,
    isManager,
  } = useAuth();

  function canAccess(
    permission: PortalPermission
  ) {
    if (permission === 'authenticated') {
      return true;
    }

    if (permission === 'admin') {
      return isAdmin;
    }

    if (permission === 'manager') {
      return isManager;
    }

    if (permission === 'resident') {
      return !isAdmin;
    }

    return false;
  }

  const items =
    portalNavigation.filter(item =>
      canAccess(item.permission)
    );

  function navigationLinks(mobile = false) {
    return items.map(item => {
      const Icon = icons[item.href] ?? LayoutDashboard;
      const active = item.href === '/portal'
        ? pathname === '/portal'
        : pathname.startsWith(item.href);

      return (
        <Link
          key={item.href}
          href={item.href}
          title={mobile ? item.label : undefined}
          className={[
            'flex items-center rounded-xl text-sm font-medium transition',
            mobile ? 'shrink-0 gap-2 px-3 py-2' : 'gap-3 px-4 py-3',
            active
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:bg-white/5 hover:text-white',
          ].join(' ')}
        >
          <Icon className="h-5 w-5" />
          <span>{item.label}</span>
        </Link>
      );
    });
  }

  return (
    <>
      <nav aria-label="Navegação do portal" className="flex w-full gap-2 overflow-x-auto border-b border-white/10 bg-slate-950 p-3 md:hidden">
        {navigationLinks(true)}
      </nav>
      <aside className="hidden min-h-screen w-64 shrink-0 border-r border-white/10 bg-slate-950 md:flex md:flex-col">
        <div className="border-b border-white/10 px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">MaxInTec</p>
          <h1 className="mt-1 text-xl font-bold text-white">Portal</h1>
        </div>
        <nav aria-label="Navegação do portal" className="flex-1 space-y-1 p-4">
          {navigationLinks()}
        </nav>
      </aside>
    </>
  );
}
