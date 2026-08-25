import { supabase } from '@/lib/supabase/client';

import type {
  Ticket,
  TicketCondominium,
  TicketEvent,
  TicketProfile,
} from './types';

type RawTicket = Omit<
  Ticket,
  'condominium' | 'opener' | 'assignee'
>;

type RawTicketEvent = Omit<TicketEvent, 'actor'>;

const ticketColumns = `
  id,
  ticket_number,
  condominium_id,
  opened_by,
  assigned_to,
  title,
  description,
  category,
  priority,
  status,
  created_at,
  updated_at,
  resolved_at,
  closed_at
`;

function unique(values: Array<string | null>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

async function getProfilesByIds(
  profileIds: string[]
): Promise<Map<string, TicketProfile>> {
  if (profileIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', profileIds);

  if (error) {
    throw error;
  }

  const profiles = (data ?? []) as TicketProfile[];

  return new Map(profiles.map(profile => [profile.id, profile]));
}

async function getCondominiumsByIds(
  condominiumIds: string[]
): Promise<Map<string, TicketCondominium>> {
  if (condominiumIds.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from('condominiums')
    .select('id, name, active')
    .in('id', condominiumIds);

  if (error) {
    throw error;
  }

  const condominiums = (data ?? []) as TicketCondominium[];

  return new Map(
    condominiums.map(condominium => [condominium.id, condominium])
  );
}

/**
 * RLS is intentionally responsible for deciding which tickets are visible.
 * Do not add role or user filters here.
 */
export async function getTickets(): Promise<Ticket[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select(ticketColumns)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const tickets = (data ?? []) as unknown as RawTicket[];
  const condominiumIds = unique(
    tickets.map(ticket => ticket.condominium_id)
  );
  const profileIds = unique(
    tickets.flatMap(ticket => [ticket.opened_by, ticket.assigned_to])
  );

  const [condominiums, profiles] = await Promise.all([
    getCondominiumsByIds(condominiumIds),
    getProfilesByIds(profileIds),
  ]);

  return tickets.map(ticket => ({
    ...ticket,
    condominium: condominiums.get(ticket.condominium_id) ?? null,
    opener: profiles.get(ticket.opened_by) ?? null,
    assignee: ticket.assigned_to
      ? profiles.get(ticket.assigned_to) ?? null
      : null,
  }));
}

export async function getTicketEvents(
  ticketId: string
): Promise<TicketEvent[]> {
  const { data, error } = await supabase
    .from('ticket_events')
    .select('id, ticket_id, event_type, actor_id, message, created_at')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  const events = (data ?? []) as unknown as RawTicketEvent[];
  const profiles = await getProfilesByIds(
    unique(events.map(event => event.actor_id))
  );

  return events.map(event => ({
    ...event,
    actor: event.actor_id ? profiles.get(event.actor_id) ?? null : null,
  }));
}

export async function getAdminProfiles(): Promise<TicketProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .eq('global_role', 'admin')
    .order('full_name');

  if (error) {
    throw error;
  }

  return (data ?? []) as TicketProfile[];
}

export async function getActiveCondominiums(): Promise<
  TicketCondominium[]
> {
  const { data, error } = await supabase
    .from('condominiums')
    .select('id, name, active')
    .eq('active', true)
    .order('name');

  if (error) {
    throw error;
  }

  return (data ?? []) as TicketCondominium[];
}
