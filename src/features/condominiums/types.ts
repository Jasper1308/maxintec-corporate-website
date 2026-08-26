export interface CondominiumListItem {
  id: string;
  name: string;
  legacy_code: string | null;
  slug: string;
  active: boolean;
}

export interface CondominiumInput {
  name: string;
  legacyCode: string;
  slug: string;
}

export interface CondominiumBlock {
  condominium_id: string;
  name: string;
}

export interface CondominiumManager {
  membershipId: string;
  userId: string;
  status: 'pending' | 'approved' | 'suspended';
  approvedAt: string | null;
  fullName: string | null;
  email: string | null;
}

export interface CondominiumDetails {
  blocks: CondominiumBlock[];
  managers: CondominiumManager[];
  approvedResidents: number;
  tickets: number;
  pendingRegistrations: number;
}
