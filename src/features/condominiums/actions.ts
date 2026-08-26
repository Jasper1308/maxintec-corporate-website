import { supabase } from '@/lib/supabase/client';

import type { CondominiumInput, CondominiumListItem, ProfileSearchResult } from './types';
import { normalizeCondominiumInput } from './validation';

function condominiumParameters(condominiumId: string | null, input: CondominiumInput) {
  const value = normalizeCondominiumInput(input);
  return {
    p_condominium_id: condominiumId,
    p_name: value.name,
    p_cnpj: value.cnpj || null,
    p_postal_code: value.postalCode || null,
    p_street: value.street || null,
    p_number: value.number || null,
    p_complement: value.complement || null,
    p_neighborhood: value.neighborhood || null,
    p_city: value.city || null,
    p_state: value.state || null,
    p_phone: value.phone || null,
    p_admin_email: value.adminEmail || null,
    p_internal_notes: value.internalNotes || null,
    p_erp_code: value.erpCode || null,
    p_active: value.active,
  };
}

async function saveCondominium(condominiumId: string | null, input: CondominiumInput) {
  const { data, error } = await supabase.rpc('admin_upsert_condominium', condominiumParameters(condominiumId, input));
  if (error) throw error;
  return data as CondominiumListItem;
}

export function createCondominium(input: CondominiumInput): Promise<CondominiumListItem> {
  return saveCondominium(null, input);
}

export function updateCondominium(condominiumId: string, input: CondominiumInput): Promise<CondominiumListItem> {
  return saveCondominium(condominiumId, input);
}

export async function setCondominiumActive(condominiumId: string, active: boolean): Promise<void> {
  const { error } = await supabase.rpc('admin_set_condominium_active', { p_condominium_id: condominiumId, p_active: active });
  if (error) throw error;
}

export async function saveCondominiumBlock(condominiumId: string, blockId: string | null, name: string): Promise<void> {
  const normalizedName = name.trim();
  if (!normalizedName) throw new Error('Informe o nome do bloco ou torre.');
  const { error } = await supabase.rpc('admin_upsert_condominium_block', {
    p_condominium_id: condominiumId,
    p_block_id: blockId,
    p_name: normalizedName,
  });
  if (error) throw error;
}

export async function setCondominiumBlockActive(blockId: string, active: boolean): Promise<void> {
  const { error } = await supabase.rpc('admin_set_condominium_block_active', { p_block_id: blockId, p_active: active });
  if (error) throw error;
}

export async function searchManagerCandidates(condominiumId: string, search: string): Promise<ProfileSearchResult[]> {
  const { data, error } = await supabase.rpc('admin_search_profiles', { p_condominium_id: condominiumId, p_search: search.trim() });
  if (error) throw error;
  return (data ?? []) as ProfileSearchResult[];
}

export async function setManagerMembership(userId: string, condominiumId: string, status: 'approved' | 'suspended'): Promise<void> {
  const { error } = await supabase.rpc('admin_set_membership', { p_user_id: userId, p_condominium_id: condominiumId, p_status: status });
  if (error) throw error;
}

export async function revokeManagerInvitation(invitationId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_revoke_invitation', { p_invitation_id: invitationId });
  if (error) throw error;
}

export async function inviteManager(input: { condominiumId?: string; email?: string; invitationId?: string }): Promise<void> {
  const { error } = await supabase.functions.invoke('invite-manager', { body: input });
  if (!error) return;
  const context = 'context' in error ? (error as { context?: Response }).context : undefined;
  if (context && typeof context.json === 'function') {
    let safeMessage: string | undefined;
    try {
      const body = await context.json() as { message?: string };
      safeMessage = body.message;
    } catch { /* The fallback below intentionally hides transport details. */ }
    if (safeMessage) throw new Error(safeMessage);
  }
  throw new Error('Não foi possível enviar o convite agora.');
}

export async function acceptManagerInvitation(invitationId: string): Promise<void> {
  const { data, error } = await supabase.rpc('accept_condominium_invitation', { p_invitation_id: invitationId });
  if (error) throw error;
  if (!data) throw new Error('Este convite expirou. Solicite um novo convite ao administrador.');
}
