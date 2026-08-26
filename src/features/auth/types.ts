import type { User } from '@supabase/supabase-js';

export type GlobalRole = 'user' | 'admin';

export type MembershipRole = 'resident' | 'manager';

export type MembershipStatus =
  | 'pending'
  | 'approved'
  | 'suspended';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_path: string | null;
  global_role: GlobalRole;
  created_at: string;
  updated_at: string;
}

export interface Condominium {
  id: string;
  legacy_code: string;
  name: string;
  slug: string;
  active: boolean;
}

export interface Membership {
  id: string;
  user_id: string;
  condominium_id: string;
  role: MembershipRole;
  status: MembershipStatus;
  approved_at: string | null;
  condominium: Condominium | null;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
  memberships: Membership[];

  loading: boolean;

  isAdmin: boolean;
  isManager: boolean;
  isResident: boolean;
}
