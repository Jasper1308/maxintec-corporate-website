import { supabase } from '@/lib/supabase/client';

import type {
  CreateTicketInput,
  TicketPriority,
  TicketStatus,
} from './types';

async function getAuthenticatedUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error('Sua sessão expirou. Entre novamente para continuar.');
  }

  return user.id;
}

export async function createTicket(
  input: CreateTicketInput
): Promise<string> {
  const openedBy = await getAuthenticatedUserId();
  const title = input.title.trim();
  const description = input.description.trim();

  if (!input.condominiumId || !title || !description) {
    throw new Error('Preencha todos os campos obrigatórios do chamado.');
  }

  const { data, error } = await supabase
    .from('tickets')
    .insert({
      condominium_id: input.condominiumId,
      opened_by: openedBy,
      title,
      description,
      category: input.category,
      priority: input.priority,
      status: 'open',
    })
    .select('id')
    .single();

  if (error) {
    throw error;
  }

  return (data as { id: string }).id;
}

export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus
): Promise<void> {
  const { data, error } = await supabase
    .from('tickets')
    .update({ status })
    .eq('id', ticketId)
    .select('id')
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('A alteração não foi aplicada. Verifique sua permissão.');
  }
}

export async function updateTicketPriority(
  ticketId: string,
  priority: TicketPriority
): Promise<void> {
  const { data, error } = await supabase
    .from('tickets')
    .update({ priority })
    .eq('id', ticketId)
    .select('id')
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('A alteração não foi aplicada. Verifique sua permissão.');
  }
}

export async function assignTicket(
  ticketId: string,
  profileId: string | null
): Promise<void> {
  const { data, error } = await supabase
    .from('tickets')
    .update({ assigned_to: profileId })
    .eq('id', ticketId)
    .select('id')
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('A alteração não foi aplicada. Verifique sua permissão.');
  }
}

export async function addTicketComment(
  ticketId: string,
  rawMessage: string
): Promise<void> {
  const actorId = await getAuthenticatedUserId();
  const message = rawMessage.trim();

  if (!message) {
    throw new Error('Escreva um comentário antes de enviar.');
  }

  const { error } = await supabase.from('ticket_events').insert({
    ticket_id: ticketId,
    event_type: 'comment',
    actor_id: actorId,
    message,
  });

  if (error) {
    throw error;
  }
}
