import { supabase } from '@/lib/supabase/client';

export interface ProfileInput {
  fullName: string;
  phone: string;
}

export async function updateOwnProfile(
  userId: string,
  input: ProfileInput
): Promise<void> {
  const fullName = input.fullName.trim();
  const phone = input.phone.trim();

  if (fullName.length < 2) {
    throw new Error('Informe seu nome completo.');
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, phone: phone || null })
    .eq('id', userId)
    .select('id')
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error('A alteração não foi aplicada. Verifique sua sessão.');
  }
}
