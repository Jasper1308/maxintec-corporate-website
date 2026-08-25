'use client';

import Link from 'next/link';
import Image from 'next/image';
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
  canAccessPortalPermission,
  portalNavigation,
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

  const items =
    portalNavigation.filter(item =>
      canAccessPortalPermission(item.permission, { isAdmin, isManager })
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
          aria-current={active ? 'page' : undefined}
          className={[
            'group flex items-center rounded-xl border text-sm font-medium transition',
            mobile ? 'min-h-10 shrink-0 gap-2 px-3 py-2' : 'gap-3 px-4 py-3',
            active
              ? 'border-blue-400/20 bg-blue-600 text-white shadow-lg shadow-blue-950/30'
              : 'border-transparent text-slate-400 hover:border-white/10 hover:bg-white/5 hover:text-white',
          ].join(' ')}
        >
          <Icon className="h-4.5 w-4.5 shrink-0" />
          <span>{item.label}</span>
        </Link>
      );
    });
  }

  return (
    <>
      <div className="border-b border-white/10 bg-slate-950/95 md:hidden">
        <div className="flex min-h-16 items-center justify-between px-4 py-3">
          <Link href="/portal" aria-label="Ir para o início do portal" className="flex min-w-0 items-center gap-3">
            <Image
              src="/maxinteclogo.webp"
              alt="MaxInTec"
              width={763}
              height={180}
              priority
              className="h-7 w-auto object-contain"
            />
            <span className="hidden border-l border-white/15 pl-3 text-xs font-medium text-slate-400 min-[390px]:block">
              Portal do Cliente
            </span>
          </Link>
        </div>
        <nav aria-label="Navegação do portal" className="flex w-full gap-2 overflow-x-auto px-3 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navigationLinks(true)}
        </nav>
      </div>
      <aside className="hidden h-screen w-72 shrink-0 border-r border-white/10 bg-slate-950/95 md:sticky md:top-0 md:flex md:flex-col">
        <div className="border-b border-white/10 px-6 py-7">
          <Link href="/portal" aria-label="Ir para o início do portal" className="block">
            <Image
              src="/maxinteclogo.webp"
              alt="MaxInTec"
              width={763}
              height={180}
              priority
              className="h-9 w-auto object-contain"
            />
          </Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Portal do Cliente
          </p>
        </div>
        <nav aria-label="Navegação do portal" className="flex-1 space-y-1.5 overflow-y-auto p-4">
          {navigationLinks()}
        </nav>
        <div className="border-t border-white/10 px-6 py-5">
          <p className="text-xs leading-5 text-slate-500">
            Segurança e automação com tecnologia MaxInTec.
          </p>
        </div>
      </aside>
    </>
  );
}
