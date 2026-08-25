export const ticketStatuses = [
  'open',
  'in_progress',
  'waiting',
  'resolved',
  'closed',
] as const;

export type TicketStatus = (typeof ticketStatuses)[number];

export const ticketPriorities = [
  'low',
  'normal',
  'high',
  'urgent',
] as const;

export type TicketPriority = (typeof ticketPriorities)[number];

export const ticketCategories = [
  'geral',
  'controle_acesso',
  'interfone',
  'portao',
  'cftv',
  'alarme',
  'rede',
] as const;

export type TicketCategory = (typeof ticketCategories)[number];

export interface TicketProfile {
  id: string;
  full_name: string | null;
  email: string | null;
}

export interface TicketCondominium {
  id: string;
  name: string;
  active?: boolean;
}

export interface Ticket {
  id: string;
  ticket_number: string | number;
  condominium_id: string;
  opened_by: string;
  assigned_to: string | null;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  condominium: TicketCondominium | null;
  opener: TicketProfile | null;
  assignee: TicketProfile | null;
}

export interface TicketEvent {
  id: string;
  ticket_id: string;
  event_type: string;
  actor_id: string | null;
  message: string | null;
  created_at: string;
  actor: TicketProfile | null;
}

export interface CreateTicketInput {
  condominiumId: string;
  category: TicketCategory;
  priority: TicketPriority;
  title: string;
  description: string;
}

export const ticketStatusLabels: Record<TicketStatus, string> = {
  open: 'Aberto',
  in_progress: 'Em andamento',
  waiting: 'Aguardando',
  resolved: 'Resolvido',
  closed: 'Fechado',
};

export const ticketPriorityLabels: Record<TicketPriority, string> = {
  low: 'Baixa',
  normal: 'Normal',
  high: 'Alta',
  urgent: 'Urgente',
};

export const ticketCategoryLabels: Record<TicketCategory, string> = {
  geral: 'Geral',
  controle_acesso: 'Controle de acesso',
  interfone: 'Interfone',
  portao: 'Portão',
  cftv: 'CFTV',
  alarme: 'Alarme',
  rede: 'Rede',
};
