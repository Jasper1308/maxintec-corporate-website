import { supabase } from '@/lib/supabase/client';

import type { RegistrationFormValues } from './form-types';

function sanitizeFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_');
}

async function uploadFile(file: File, path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('client-documents')
    .upload(path, file, { upsert: false });

  if (error) throw error;
  return data.path;
}

export async function submitRegistration(values: RegistrationFormValues): Promise<void> {
  if (!values.privacyAccepted) {
    throw new Error('Confirme que está ciente da Política de Privacidade.');
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw authError ?? new Error('Sua sessão expirou. Entre novamente para continuar.');
  }

  const uploadedPaths: string[] = [];
  const folder = `${user.id}/registrations/${crypto.randomUUID()}`;

  try {
    const photoPath = values.photo
      ? await uploadFile(values.photo, `${folder}/photo/${sanitizeFilename(values.photo.name)}`)
      : null;

    if (photoPath) uploadedPaths.push(photoPath);

    const documentPaths: string[] = [];
    for (const document of values.documents) {
      const path = await uploadFile(
        document,
        `${folder}/documents/${crypto.randomUUID()}-${sanitizeFilename(document.name)}`
      );
      documentPaths.push(path);
      uploadedPaths.push(path);
    }

    const { error } = await supabase.from('condominio_registrations').insert({
      user_id: user.id,
      condominium_id: values.condominiumId,
      condominio: values.condominiumName,
      bloco: values.block,
      apartamento: values.apartment.trim(),
      tipo_residente: values.residentType,
      cpf: values.cpf.replace(/\D/g, ''),
      nome_completo: values.fullName.trim(),
      telefone: values.phone.replace(/\D/g, '') || null,
      email: user.email ?? values.email,
      foto_path: photoPath,
      documentos_paths: documentPaths,
      status: 'pending',
      privacy_policy_version: '2026-08-26',
    });

    if (error) throw error;
  } catch (error) {
    if (uploadedPaths.length > 0) {
      const { error: cleanupError } = await supabase.storage
        .from('client-documents')
        .remove(uploadedPaths);
      if (cleanupError) console.error('Failed to clean up registration uploads:', cleanupError);
    }
    throw error;
  }
}
