import { supabase } from '@/lib/supabase/client';

import type { CondominiumListItem } from './types';

export async function getCondominiums(
  options: { activeOnly?: boolean } = {}
): Promise<CondominiumListItem[]> {
  let query = supabase
    .from('condominiums')
    .select('id, name, legacy_code, active')
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
