import { supabase } from '@/lib/supabase/client';
import type { Registration } from './types';

const registrationSelect = `
  id,
  user_id,
  condominium_id,
  condominio,
  bloco,
  apartamento,
  tipo_residente,
  cpf,
  nome_completo,
  telefone,
  email,
  foto_path,
  documentos_paths,
  status,
  approved_by,
  approved_at,
  rejected_at,
  rejection_reason,
  created_at,
  updated_at,
  condominium:condominiums (
    id,
    name,
    slug
  )
`;

export async function getMyRegistrations(
  userId: string
): Promise<Registration[]> {
  const { data, error } = await supabase
    .from('condominio_registrations')
    .select(registrationSelect)
    .eq('user_id', userId)
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as Registration[];
}

export async function getPendingRegistrations():
  Promise<Registration[]> {
  const { data, error } = await supabase
    .from('condominio_registrations')
    .select(registrationSelect)
    .eq('status', 'pending')
    .order('created_at', {
      ascending: false,
    });

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as Registration[];
}

export async function getApprovedResidents():
  Promise<Registration[]> {
  const { data, error } = await supabase
    .from('condominio_registrations')
    .select(registrationSelect)
    .eq('status', 'approved')
    .order('nome_completo');

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as Registration[];
}