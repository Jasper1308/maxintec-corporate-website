import type { RegistrationStatus } from '@/features/registrations/types';

export interface DashboardMetrics {
  pendingRegistrations: number;
  approvedResidents: number;
  totalRegistrations: number;
  latestRegistrationStatus: RegistrationStatus | null;
  totalTickets: number;
  openTickets: number;
  urgentTickets: number;
  unassignedTickets: number;
  resolvedTickets: number;
  activeCondominiums: number;
  unreadNotifications: number;
}
