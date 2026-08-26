export interface CondominiumListItem {
  id: string;
  name: string;
  legacy_code: string | null;
  slug: string;
  active: boolean;
  cnpj: string | null;
  postal_code: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  admin_email: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CondominiumInput {
  name: string;
  cnpj: string;
  postalCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  phone: string;
  adminEmail: string;
  internalNotes: string;
  erpCode: string;
  active: boolean;
}

export interface CondominiumBlock {
  id: string;
  condominium_id: string;
  name: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CondominiumManager {
  membershipId: string;
  userId: string;
  status: 'pending' | 'approved' | 'suspended';
  approvedAt: string | null;
  fullName: string | null;
  email: string | null;
}

export interface CondominiumInvitation {
  id: string;
  condominium_id: string;
  email: string;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  created_at: string;
  expires_at: string;
}

export interface ProfileSearchResult {
  id: string;
  full_name: string | null;
  email: string | null;
  membership_status: string | null;
}

export interface CondominiumDetails {
  blocks: CondominiumBlock[];
  managers: CondominiumManager[];
  invitations: CondominiumInvitation[];
  approvedResidents: number;
  tickets: number;
  pendingRegistrations: number;
}
