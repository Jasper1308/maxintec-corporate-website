import { supabase } from '@/lib/supabase/client';

import type {
  CondominiumBlock,
  CondominiumDetails,
  CondominiumListItem,
  CondominiumManager,
} from './types';

export async function getCondominiums(
  options: { activeOnly?: boolean } = {}
): Promise<CondominiumListItem[]> {
  let query = supabase
    .from('condominiums')
    .select('id, name, legacy_code, slug, active')
    .order('name');

  if (options.activeOnly) {
    query = query.eq('active', true);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as CondominiumListItem[];
}

interface MembershipRow {
  id: string;
  user_id: string;
  status: CondominiumManager['status'];
  approved_at: string | null;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
}

function countOrThrow(
  result: { count: number | null; error: { message: string } | null }
): number {
  if (result.error) throw result.error;
  return result.count ?? 0;
}

export async function getCondominiumDetails(
  condominiumId: string
): Promise<CondominiumDetails> {
  const [blocksResult, managersResult, residentsResult, ticketsResult, pendingResult] =
    await Promise.all([
      supabase
        .from('condominium_blocks')
        .select('condominium_id, name')
        .eq('condominium_id', condominiumId)
        .order('name'),
      supabase
        .from('condominium_memberships')
        .select('id, user_id, status, approved_at')
        .eq('condominium_id', condominiumId)
        .eq('role', 'manager'),
      supabase
        .from('condominio_registrations')
        .select('id', { count: 'exact', head: true })
        .eq('condominium_id', condominiumId)
        .eq('status', 'approved'),
      supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true })
        .eq('condominium_id', condominiumId),
      supabase
        .from('condominio_registrations')
        .select('id', { count: 'exact', head: true })
        .eq('condominium_id', condominiumId)
        .eq('status', 'pending'),
    ]);

  if (blocksResult.error) throw blocksResult.error;
  if (managersResult.error) throw managersResult.error;

  const memberships = (managersResult.data ?? []) as MembershipRow[];
  let profiles: ProfileRow[] = [];

  if (memberships.length > 0) {
    const profilesResult = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', memberships.map(membership => membership.user_id));

    if (profilesResult.error) throw profilesResult.error;
    profiles = (profilesResult.data ?? []) as ProfileRow[];
  }

  const profilesById = new Map(profiles.map(profile => [profile.id, profile]));

  return {
    blocks: (blocksResult.data ?? []) as CondominiumBlock[],
    managers: memberships.map(membership => {
      const profile = profilesById.get(membership.user_id);
      return {
        membershipId: membership.id,
        userId: membership.user_id,
        status: membership.status,
        approvedAt: membership.approved_at,
        fullName: profile?.full_name ?? null,
        email: profile?.email ?? null,
      };
    }),
    approvedResidents: countOrThrow(residentsResult),
    tickets: countOrThrow(ticketsResult),
    pendingRegistrations: countOrThrow(pendingResult),
  };
}

export async function getCondominiumBlocks(
  condominiumIds: string[] = []
): Promise<CondominiumBlock[]> {
  let query = supabase
    .from('condominium_blocks')
    .select('condominium_id, name')
    .order('name');

  if (condominiumIds.length > 0) {
    query = query.in('condominium_id', condominiumIds);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CondominiumBlock[];
}
