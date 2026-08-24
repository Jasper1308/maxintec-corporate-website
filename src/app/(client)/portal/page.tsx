'use client';

import Link from 'next/link';

import {
  Building2,
  ClipboardCheck,
  Ticket,
  Users,
} from 'lucide-react';

import { useAuth } from '@/features/auth/AuthProvider';

const cards = [
  {
    title: 'Chamados',
    description:
      'Acompanhe solicitações e atendimentos.',
    href: '/portal/tickets',
    icon: Ticket,
    access: 'all',
  },
  {
    title: 'Aprovações',
    description:
      'Cadastros aguardando análise.',
    href: '/portal/approvals',
    icon: ClipboardCheck,
    access: 'manager',
  },
  {
    title: 'Moradores',
    description:
      'Gerencie moradores e vínculos.',
    href: '/portal/residents',
    icon: Users,
    access: 'manager',
  },
  {
    title: 'Condomínios',
    description:
      'Administre os clientes da plataforma.',
    href: '/portal/condominiums',
    icon: Building2,
    access: 'admin',
  },
];

export default function PortalPage() {
  const {
    profile,
    isAdmin,
    isManager,
  } = useAuth();

  const visibleCards =
    cards.filter(card => {
      if (card.access === 'all') {
        return true;
      }

      if (card.access === 'admin') {
        return isAdmin;
      }

      if (card.access === 'manager') {
        return isManager;
      }

      return false;
    });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-sm font-medium text-blue-400">
          Área do Cliente
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Olá,{' '}
          {profile?.full_name ??
            'bem-vindo'}
        </h1>

        <p className="mt-2 text-slate-400">
          {isAdmin
            ? 'Visão geral da operação MaxInTec.'
            : isManager
              ? 'Gerencie seu condomínio e acompanhe as solicitações.'
              : 'Acompanhe seus serviços e solicitações.'}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {visibleCards.map(card => {
          const Icon = card.icon;

          return (
            <Link
              href={card.href}
              key={card.href}
              className="group rounded-2xl border border-white/10 bg-slate-900/60 p-6 transition hover:border-blue-500/40 hover:bg-slate-900"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Icon className="h-5 w-5" />
              </div>

              <h2 className="font-semibold text-white">
                {card.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                {card.description}
              </p>

              <p className="mt-5 text-sm font-medium text-blue-400">
                Acessar →
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}