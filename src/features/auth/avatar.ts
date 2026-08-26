import { supabase } from '@/lib/supabase/client';

const avatarTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maximumAvatarSize = 2 * 1024 * 1024;

function extension(file: File): string {
  return { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[file.type] ?? '';
}

export function validateAvatar(file: File): void {
  if (!avatarTypes.includes(file.type)) throw new Error('Escolha uma imagem JPG, PNG ou WebP.');
  if (file.size <= 0 || file.size > maximumAvatarSize) throw new Error('A imagem deve ter no máximo 2 MB.');
}

export async function uploadOwnAvatar(file: File, previousPath: string | null): Promise<string> {
  validateAvatar(file);
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) throw userError ?? new Error('Entre novamente para continuar.');
  const path = `${user.id}/${crypto.randomUUID()}.${extension(file)}`;
  const bucket = supabase.storage.from('avatars');
  const { error: uploadError } = await bucket.upload(path, file, { upsert: false, contentType: file.type });
  if (uploadError) throw uploadError;
  const { data, error: updateError } = await supabase.from('profiles').update({ avatar_path: path }).eq('id', user.id).select('id').maybeSingle();
  if (updateError || !data) {
    await bucket.remove([path]);
    throw updateError ?? new Error('Não foi possível atualizar a imagem do perfil.');
  }
  if (previousPath && previousPath !== path) await bucket.remove([previousPath]);
  return path;
}

export async function removeOwnAvatar(path: string): Promise<void> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user || !path.startsWith(`${user.id}/`)) throw userError ?? new Error('Entre novamente para continuar.');
  const { data, error } = await supabase.from('profiles').update({ avatar_path: null }).eq('id', user.id).select('id').maybeSingle();
  if (error || !data) throw error ?? new Error('Não foi possível remover a imagem do perfil.');
  const { error: removeError } = await supabase.storage.from('avatars').remove([path]);
  if (removeError) throw removeError;
}

export async function getOwnAvatarUrl(path: string): Promise<string> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user || !path.startsWith(`${user.id}/`)) throw userError ?? new Error('Imagem indisponível.');
  const { data, error } = await supabase.storage.from('avatars').createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}
