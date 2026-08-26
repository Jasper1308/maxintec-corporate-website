import { supabase } from '@/lib/supabase/client';

export async function requestPasswordReset(email: string, redirectTo: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return;
  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo });
  if (error) throw error;
}

export async function updateAccountPassword(password: string, confirmation: string): Promise<void> {
  if (password.length < 8) throw new Error('A nova senha deve ter pelo menos 8 caracteres.');
  if (password !== confirmation) throw new Error('As senhas não coincidem.');
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}
