export type RegistrationStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled';

export interface Registration {
  id: string;
  user_id: string | null;
  condominium_id: string;

  condominio: string;
  bloco: string;
  apartamento: string;
  tipo_residente: string;

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

  condominium?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}