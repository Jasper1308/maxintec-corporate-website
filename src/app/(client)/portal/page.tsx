'use client';

import {
  Bell,
  Building2,
  CircleCheckBig,
  ClipboardCheck,
  ClipboardList,
  Ticket,
  Users,
} from 'lucide-react';

import { ErrorState, LoadingState } from '@/components/portal/PortalStates';
import { PageHeader } from '@/components/portal/PageHeader';
import { useAuth } from '@/features/auth/AuthProvider';
import { DashboardMetricCard } from '@/features/dashboard/components/DashboardMetricCard';
import { useDashboardMetrics } from '@/features/dashboard/useDashboardMetrics';
import type { RegistrationStatus } from '@/features/registrations/types';

const registrationStatusLabels: Record<RegistrationStatus, string> = {
  pending: 'Aguardando aprovação',
  approved: 'Aprovado',
  rejected: 'Precisa de revisão',
  cancelled: 'Cancelado',
};

export default function PortalPage() {
  const {
    user,
    profile,
    isAdmin,
    isManager,
  } = useAuth();

  const {
    metrics,
    loading,
    error,
    refresh,
  } = useDashboardMetrics(Boolean(user));

  const hasManagementView = isAdmin || isManager;
  const registrationStatus = metrics?.latestRegistrationStatus;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Área do Cliente"
        title={`Olá, ${profile?.full_name ?? 'bem-vindo'}`}
        description={
          isAdmin
            ? 'Visão geral da operação MaxInTec.'
            : isManager
              ? 'Acompanhe os indicadores dos condomínios sob sua gestão.'
              : 'Acompanhe seu cadastro, seus chamados e suas notificações.'
        }
      />

      {loading && <LoadingState />}

      {!loading && error && (
        <ErrorState
          message={error}
          retry={() => {
            void refresh();
          }}
        />
      )}

      {!loading && !error && metrics && hasManagementView && (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          <DashboardMetricCard
            title="Aprovações pendentes"
            value={metrics.pendingRegistrations}
            description="Cadastros aguardando análise nas áreas permitidas para você."
            href="/portal/approvals"
            icon={<ClipboardCheck className="h-5 w-5" />}
          />

          <DashboardMetricCard
            title="Moradores aprovados"
            value={metrics.approvedResidents}
            description="Moradores aprovados visíveis pela sua sessão."
            href="/portal/residents"
            icon={<Users className="h-5 w-5" />}
          />

          <DashboardMetricCard
            title="Chamados abertos"
            value={metrics.openTickets}
            description="Chamados abertos, em andamento ou aguardando retorno."
            href="/portal/tickets"
            icon={<Ticket className="h-5 w-5" />}
          />

          <DashboardMetricCard
            title="Chamados resolvidos"
            value={metrics.resolvedTickets}
            description="Solicitações que já foram marcadas como resolvidas."
            href="/portal/tickets"
            icon={<CircleCheckBig className="h-5 w-5" />}
          />

          <DashboardMetricCard
            title="Chamados urgentes"
            value={metrics.urgentTickets}
            description="Chamados urgentes ainda ativos no escopo permitido."
            href="/portal/tickets"
            icon={<Ticket className="h-5 w-5" />}
          />

          <DashboardMetricCard
            title="Sem responsável"
            value={metrics.unassignedTickets}
            description="Chamados ativos que ainda não possuem responsável."
            href="/portal/tickets"
            icon={<Users className="h-5 w-5" />}
          />

          <DashboardMetricCard
            title="Condomínios ativos"
            value={metrics.activeCondominiums}
            description="Condomínios ativos que as políticas permitem visualizar."
            href={isAdmin ? '/portal/condominiums' : undefined}
            icon={<Building2 className="h-5 w-5" />}
          />
        </div>
      )}

      {!loading && !error && metrics && !hasManagementView && (
        <div className="grid gap-5 md:grid-cols-3">
          <DashboardMetricCard
            title="Meu cadastro"
            value={
              registrationStatus
                ? registrationStatusLabels[registrationStatus]
                : 'Não enviado'
            }
            description={
              registrationStatus === 'rejected'
                ? 'Consulte o motivo informado e revise seus dados.'
                : metrics.totalRegistrations > 0
                  ? 'Consulte os detalhes e acompanhe a análise do seu cadastro.'
                  : 'Envie seu cadastro para se vincular ao condomínio.'
            }
            href="/portal/registrations"
            icon={<ClipboardList className="h-5 w-5" />}
          />

          <DashboardMetricCard
            title="Meus chamados"
            value={metrics.totalTickets}
            description={`${metrics.openTickets} ${
              metrics.openTickets === 1 ? 'chamado ativo' : 'chamados ativos'
            } no momento.`}
            href="/portal/tickets"
            icon={<Ticket className="h-5 w-5" />}
          />

          <DashboardMetricCard
            title="Notificações"
            value={metrics.unreadNotifications}
            description={
              metrics.unreadNotifications === 1
                ? 'Você tem uma notificação não lida. Abra o sino no topo.'
                : `Você tem ${metrics.unreadNotifications} notificações não lidas. Abra o sino no topo.`
            }
            icon={<Bell className="h-5 w-5" />}
          />
        </div>
      )}
    </div>
  );
}
