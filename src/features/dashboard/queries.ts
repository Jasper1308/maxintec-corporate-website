import type { RegistrationStatus } from '@/features/registrations/types';
import { supabase } from '@/lib/supabase/client';

import type { DashboardMetrics } from './types';

const registrationStatuses: RegistrationStatus[] = [
  'pending',
  'approved',
  'rejected',
  'cancelled',
];

function parseRegistrationStatus(value: unknown): RegistrationStatus | null {
  return typeof value === 'string' &&
    registrationStatuses.includes(value as RegistrationStatus)
    ? (value as RegistrationStatus)
    : null;
}

function readCount(
  area: string,
  result: {
    count: number | null;
    error: { message: string } | null;
  }
): number {
  if (result.error) {
    throw new Error(
      `Falha ao carregar ${area} no dashboard: ${result.error.message}`
    );
  }

  return result.count ?? 0;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [
    pendingRegistrationsResult,
    approvedResidentsResult,
    totalRegistrationsResult,
    latestRegistrationResult,
    totalTicketsResult,
    openTicketsResult,
    resolvedTicketsResult,
    activeCondominiumsResult,
    unreadNotificationsResult,
  ] = await Promise.all([
    supabase
      .from('condominio_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('condominio_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved'),
    supabase
      .from('condominio_registrations')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('condominio_registrations')
      .select('status')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .in('status', ['open', 'in_progress', 'waiting']),
    supabase
      .from('tickets')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'resolved'),
    supabase
      .from('condominiums')
      .select('id', { count: 'exact', head: true })
      .eq('active', true),
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .is('read_at', null),
  ]);

  if (latestRegistrationResult.error) {
    throw new Error(
      `Falha ao carregar o cadastro mais recente no dashboard: ${latestRegistrationResult.error.message}`
    );
  }

  return {
    pendingRegistrations: readCount(
      'aprovações pendentes',
      pendingRegistrationsResult
    ),
    approvedResidents: readCount(
      'moradores aprovados',
      approvedResidentsResult
    ),
    totalRegistrations: readCount(
      'cadastros',
      totalRegistrationsResult
    ),
    latestRegistrationStatus: parseRegistrationStatus(
      latestRegistrationResult.data?.status
    ),
    totalTickets: readCount('chamados', totalTicketsResult),
    openTickets: readCount('chamados abertos', openTicketsResult),
    resolvedTickets: readCount('chamados resolvidos', resolvedTicketsResult),
    activeCondominiums: readCount(
      'condomínios ativos',
      activeCondominiumsResult
    ),
    unreadNotifications: readCount(
      'notificações não lidas',
      unreadNotificationsResult
    ),
  };
}
