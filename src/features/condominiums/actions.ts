import { supabase } from '@/lib/supabase/client';

import type { CondominiumInput, CondominiumListItem } from './types';
import { normalizeCondominiumInput } from './validation';

const condominiumColumns = 'id, name, legacy_code, slug, active';

function writePayload(input: CondominiumInput) {
  const normalized = normalizeCondominiumInput(input);

  return {
    name: normalized.name,
    legacy_code: normalized.legacyCode || null,
    slug: normalized.slug,
  };
}

export async function createCondominium(
  input: CondominiumInput
): Promise<CondominiumListItem> {
  const { data, error } = await supabase
    .from('condominiums')
    .insert({ ...writePayload(input), active: true })
    .select(condominiumColumns)
    .single();

  if (error) throw error;

  return data as CondominiumListItem;
}

export async function updateCondominium(
  condominiumId: string,
  input: CondominiumInput
): Promise<CondominiumListItem> {
  const { data, error } = await supabase
    .from('condominiums')
    .update(writePayload(input))
    .eq('id', condominiumId)
    .select(condominiumColumns)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error('A alteração não foi aplicada. Verifique sua permissão.');
  }

  return data as CondominiumListItem;
}

export async function setCondominiumActive(
  condominiumId: string,
  active: boolean
): Promise<void> {
  const { data, error } = await supabase
    .from('condominiums')
    .update({ active })
    .eq('id', condominiumId)
    .select('id')
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error('A alteração não foi aplicada. Verifique sua permissão.');
  }
}
