import type {
  Registration,
  RegistrationDocument,
  RegistrationStatus,
  ResidentType,
} from './types';

export const registrationStatusLabels = {
  pending: 'Aguardando aprovação',
  approved: 'Aprovado',
  rejected: 'Precisa de revisão',
  cancelled: 'Cancelado',
} satisfies Record<RegistrationStatus, string>;

export const residentTypeLabels = {
  morador: 'Morador proprietário',
  locatario: 'Locatário',
  dependente: 'Dependente',
} satisfies Record<ResidentType, string>;

export function getCondominiumName(
  registration: Pick<Registration, 'condominium' | 'condominio'>
): string {
  return (
    registration.condominium?.name ??
    registration.condominio ??
    'Condomínio não informado'
  );
}

function getFileName(path: string): string {
  const fileName = path.split('/').at(-1);

  if (!fileName) {
    return 'Documento';
  }

  try {
    return decodeURIComponent(fileName);
  } catch {
    return fileName;
  }
}

export function getRegistrationDocuments(
  registration: Registration
): RegistrationDocument[] {
  const documents: RegistrationDocument[] = [];

  if (registration.foto_path) {
    documents.push({
      kind: 'photo',
      label: 'Foto do residente',
      path: registration.foto_path,
    });
  }

  for (const path of registration.documentos_paths ?? []) {
    if (!path || documents.some(document => document.path === path)) {
      continue;
    }

    documents.push({
      kind: 'document',
      label: getFileName(path),
      path,
    });
  }

  for (const file of registration.files ?? []) {
    const path = file.storage_path;

    if (!path || documents.some(document => document.path === path)) {
      continue;
    }

    const normalizedKind = file.kind.toLocaleLowerCase('pt-BR');
    const isPhoto = ['photo', 'foto', 'image', 'avatar'].includes(normalizedKind);

    documents.push({
      kind: isPhoto ? 'photo' : 'document',
      label: isPhoto ? 'Foto do residente' : getFileName(path),
      path,
    });
  }

  return documents;
}
