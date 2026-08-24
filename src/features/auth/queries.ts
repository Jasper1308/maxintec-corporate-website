import { supabase } from '@/lib/supabase/client';
import type {
  Membership,
  Profile,
} from './types';

export async function getProfile(
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Failed to load profile:', error);
    return null;
  }

  return data as Profile;
}

export async function getMemberships(
  userId: string
): Promise<Membership[]> {
  const { data, error } = await supabase
    .from('condominium_memberships')
    .select(`
      id,
      user_id,
      condominium_id,
      role,
      status,
      approved_at,
      condominium:condominiums (
        id,
        legacy_code,
        name,
        slug,
        active
      )
    `)
    .eq('user_id', userId);

  if (error) {
    console.error(
      'Failed to load memberships:',
      error
    );

    return [];
  }

  return (data ?? []) as unknown as Membership[];
}