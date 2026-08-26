import { supabase } from '@/lib/supabase/client';

import type { CondominiumBlock, CondominiumDetails, CondominiumInvitation, CondominiumListItem, CondominiumManager } from './types';

const condominiumColumns = 'id, name, legacy_code, slug, active, cnpj, postal_code, street, number, complement, neighborhood, city, state, phone, admin_email, internal_notes, created_at, updated_at';

export async function getCondominiums(options: { activeOnly?: boolean } = {}): Promise<CondominiumListItem[]> {
  let query = supabase.from('condominiums').select(condominiumColumns).order('name');
  if (options.activeOnly) query = query.eq('active', true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CondominiumListItem[];
}

interface MembershipRow { id: string; user_id: string; status: CondominiumManager['status']; approved_at: string | null }
interface ProfileRow { id: string; full_name: string | null; email: string | null }

function countOrThrow(result: { count: number | null; error: { message: string } | null }): number {
  if (result.error) throw result.error;
  return result.count ?? 0;
}

export async function getCondominiumDetails(condominiumId: string): Promise<CondominiumDetails> {
  const [blocksResult, managersResult, invitationsResult, residentsResult, ticketsResult, pendingResult] = await Promise.all([
    supabase.from('condominium_blocks').select('id, condominium_id, name, active, created_at, updated_at').eq('condominium_id', condominiumId).order('active', { ascending: false }).order('name'),
    supabase.from('condominium_memberships').select('id, user_id, status, approved_at').eq('condominium_id', condominiumId).eq('role', 'manager'),
    supabase.from('condominium_invitations').select('id, condominium_id, email, status, created_at, expires_at').eq('condominium_id', condominiumId).order('created_at', { ascending: false }),
    supabase.from('condominio_registrations').select('id', { count: 'exact', head: true }).eq('condominium_id', condominiumId).eq('status', 'approved'),
    supabase.from('tickets').select('id', { count: 'exact', head: true }).eq('condominium_id', condominiumId),
    supabase.from('condominio_registrations').select('id', { count: 'exact', head: true }).eq('condominium_id', condominiumId).eq('status', 'pending'),
  ]);
  if (blocksResult.error) throw blocksResult.error;
  if (managersResult.error) throw managersResult.error;
  if (invitationsResult.error) throw invitationsResult.error;
  const memberships = (managersResult.data ?? []) as MembershipRow[];
  let profiles: ProfileRow[] = [];
  if (memberships.length) {
    const profilesResult = await supabase.from('profiles').select('id, full_name, email').in('id', memberships.map(item => item.user_id));
    if (profilesResult.error) throw profilesResult.error;
    profiles = (profilesResult.data ?? []) as ProfileRow[];
  }
  const profilesById = new Map(profiles.map(profile => [profile.id, profile]));
  return {
    blocks: (blocksResult.data ?? []) as CondominiumBlock[],
    managers: memberships.map(membership => ({
      membershipId: membership.id,
      userId: membership.user_id,
      status: membership.status,
      approvedAt: membership.approved_at,
      fullName: profilesById.get(membership.user_id)?.full_name ?? null,
      email: profilesById.get(membership.user_id)?.email ?? null,
    })),
    invitations: ((invitationsResult.data ?? []) as CondominiumInvitation[]).map(invitation =>
      invitation.status === 'pending' && new Date(invitation.expires_at).getTime() <= Date.now()
        ? { ...invitation, status: 'expired' }
        : invitation
    ),
    approvedResidents: countOrThrow(residentsResult),
    tickets: countOrThrow(ticketsResult),
    pendingRegistrations: countOrThrow(pendingResult),
  };
}

export async function getCondominiumBlocks(condominiumIds: string[] = []): Promise<CondominiumBlock[]> {
  let query = supabase.from('condominium_blocks').select('id, condominium_id, name, active, created_at, updated_at').eq('active', true).order('name');
  if (condominiumIds.length) query = query.in('condominium_id', condominiumIds);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CondominiumBlock[];
}
