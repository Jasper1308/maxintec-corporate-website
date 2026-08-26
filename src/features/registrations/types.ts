export type RegistrationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export type ResidentType =
  | 'morador'
  | 'locatario'
  | 'dependente';

export interface RegistrationCondominium {
  id: string;
  name: string;
  slug: string;
}

export interface RegistrationFile {
  id: string;
  registration_id: string;
  storage_path: string;
  kind: string;
  created_at: string;
}

export interface Registration {
  id: string;
  user_id: string | null;
  condominium_id: string | null;

  condominio: string | null;
  bloco: string | null;
  apartamento: string;
  tipo_residente: ResidentType;

  cpf: string;
  nome_completo: string;

  telefone: string | null;
  email: string | null;

  foto_path: string | null;
  documentos_paths: string[] | null;

  status: RegistrationStatus;

  approved_by: string | null;
  approved_at: string | null;

  rejected_at: string | null;
  rejection_reason: string | null;

  created_at: string;
  updated_at: string;

  condominium: RegistrationCondominium | null;
  files: RegistrationFile[];
}

export interface RegistrationDocument {
  kind: 'photo' | 'document';
  label: string;
  path: string;
}

export type ResidentListItem = Pick<
  Registration,
  | 'id'
  | 'condominium_id'
  | 'condominio'
  | 'bloco'
  | 'apartamento'
  | 'tipo_residente'
  | 'nome_completo'
  | 'telefone'
  | 'email'
  | 'status'
  | 'approved_at'
  | 'condominium'
>;

export interface ResidentListFilters {
  page: number;
  pageSize: number;
  search?: string;
  condominiumId?: string;
  block?: string;
}
