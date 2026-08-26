import { supabase } from '@/lib/supabase/client';
import { getPageRange, normalizeSearch, type PaginatedResult } from '@/lib/listing';
import type {
  Registration,
  ResidentListFilters,
  ResidentListItem,
} from './types';

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
  ),
  files:registration_files (
    id,
    registration_id,
    storage_path,
    kind,
    created_at
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

const residentListSelect = `
  id,
  condominium_id,
  condominio,
  bloco,
  apartamento,
  tipo_residente,
  nome_completo,
  telefone,
  email,
  status,
  approved_at,
  condominium:condominiums (
    id,
    name,
    slug
  )
`;

export async function getApprovedResidentsPage(
  filters: ResidentListFilters
): Promise<PaginatedResult<ResidentListItem>> {
  const { from, to } = getPageRange(filters.page, filters.pageSize);
  let query = supabase
    .from('condominio_registrations')
    .select(residentListSelect, { count: 'exact' })
    .eq('status', 'approved');

  const search = normalizeSearch(filters.search ?? '');
  if (search) {
    query = query.or(
      `nome_completo.ilike.%${search}%,email.ilike.%${search}%,apartamento.ilike.%${search}%`
    );
  }
  if (filters.condominiumId) {
    query = query.eq('condominium_id', filters.condominiumId);
  }
  if (filters.block) {
    query = query.eq('bloco', filters.block);
  }

  const { data, error, count } = await query
    .order('nome_completo')
    .range(from, to);

  if (error) throw error;

  return {
    items: (data ?? []) as unknown as ResidentListItem[],
    total: count ?? 0,
  };
}

export async function getRegistrationById(
  registrationId: string
): Promise<Registration | null> {
  const { data, error } = await supabase
    .from('condominio_registrations')
    .select(registrationSelect)
    .eq('id', registrationId)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as Registration | null;
}
