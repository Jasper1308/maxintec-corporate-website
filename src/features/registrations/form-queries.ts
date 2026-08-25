import { supabase } from '@/lib/supabase/client';

import type { RegistrationCondominiumOption } from './form-types';

interface CondominiumRow {
  id: string;
  name: string;
}

interface BlockRow {
  condominium_id?: unknown;
  name?: unknown;
}

export async function getRegistrationCondominiums(): Promise<RegistrationCondominiumOption[]> {
  const { data: condominiums, error: condominiumsError } = await supabase
    .from('condominiums')
    .select('id, name')
    .eq('active', true)
    .order('name');

  if (condominiumsError) throw condominiumsError;

  const condominiumRows = (condominiums ?? []) as CondominiumRow[];
  if (condominiumRows.length === 0) return [];

  const { data: blocks, error: blocksError } = await supabase
    .from('condominium_blocks')
    .select('*')
    .in('condominium_id', condominiumRows.map(condominium => condominium.id));

  if (blocksError) throw blocksError;

  const blockRows = (blocks ?? []) as BlockRow[];
  return condominiumRows.map(condominium => ({
    ...condominium,
    blocks: blockRows
      .filter(block => block.condominium_id === condominium.id)
      .map(block => block.name)
      .filter((name): name is string => typeof name === 'string' && name.length > 0)
      .sort((a, b) => a.localeCompare(b, 'pt-BR')),
  }));
}
