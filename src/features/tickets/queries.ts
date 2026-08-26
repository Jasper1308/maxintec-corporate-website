import { supabase } from '@/lib/supabase/client';
import { getPageRange, normalizeSearch, type PaginatedResult } from '@/lib/listing';

import type {
  Ticket,
  TicketCondominium,
  TicketEvent,
  TicketProfile,
  TicketListFilters,
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

  return hydrateTickets((data ?? []) as unknown as RawTicket[]);
}

async function hydrateTickets(tickets: RawTicket[]): Promise<Ticket[]> {
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

export async function getTicketsPage(
  filters: TicketListFilters
): Promise<PaginatedResult<Ticket>> {
  const { from, to } = getPageRange(filters.page, filters.pageSize);
  let query = supabase
    .from('tickets')
    .select(ticketColumns, { count: 'exact' });

  const search = normalizeSearch(filters.search ?? '');
  if (search) {
    query = /^\d+$/.test(search)
      ? query.or(`title.ilike.%${search}%,ticket_number.eq.${search}`)
      : query.ilike('title', `%${search}%`);
  }
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.priority) query = query.eq('priority', filters.priority);
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.condominiumId) {
    query = query.eq('condominium_id', filters.condominiumId);
  }
  if (filters.assignedTo === 'unassigned') {
    query = query.is('assigned_to', null);
  } else if (filters.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    items: await hydrateTickets((data ?? []) as unknown as RawTicket[]),
    total: count ?? 0,
  };
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
