export interface RegistrationCondominiumOption {
  id: string;
  name: string;
  blocks: string[];
}

import type { ResidentType } from './types';

export interface RegistrationFormValues {
  condominiumId: string;
  condominiumName: string;
  block: string;
  apartment: string;
  residentType: ResidentType;
  cpf: string;
  fullName: string;
  phone: string;
  email: string;
  photo: File | null;
  documents: File[];
  privacyAccepted: boolean;
}
