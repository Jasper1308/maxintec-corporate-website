import { describe, expect, it } from 'vitest';

import type { Registration } from './types';
import {
  getCondominiumName,
  getRegistrationDocuments,
  registrationStatusLabels,
  residentTypeLabels,
} from './labels';

function registration(overrides: Partial<Registration> = {}): Registration {
  return {
    id: 'registration-a',
    user_id: 'resident-a',
    condominium_id: 'condominium-a',
    condominio: 'Legado A',
    bloco: 'Torre 1',
    apartamento: '101',
    tipo_residente: 'morador',
    cpf: '12345678901',
    nome_completo: 'Resident A',
    telefone: null,
    email: 'resident-a@example.test',
    foto_path: null,
    documentos_paths: [],
    status: 'pending',
    approved_by: null,
    approved_at: null,
    rejected_at: null,
    rejection_reason: null,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    condominium: { id: 'condominium-a', name: 'Condominium A', slug: 'a' },
    files: [],
    ...overrides,
  };
}

describe('registration labels', () => {
  it('covers every supported status and resident type', () => {
    expect(registrationStatusLabels).toEqual({
      pending: 'Aguardando aprovação',
      approved: 'Aprovado',
      rejected: 'Precisa de revisão',
      cancelled: 'Cancelado',
    });
    expect(residentTypeLabels).toEqual({
      morador: 'Morador proprietário',
      locatario: 'Locatário',
      dependente: 'Dependente',
    });
  });

  it('prefers the related condominium and falls back safely', () => {
    expect(getCondominiumName(registration())).toBe('Condominium A');
    expect(getCondominiumName(registration({ condominium: null }))).toBe(
      'Legado A'
    );
    expect(
      getCondominiumName(registration({ condominium: null, condominio: null }))
    ).toBe('Condomínio não informado');
  });
});

describe('getRegistrationDocuments', () => {
  it('combines legacy and relational files without duplicate paths', () => {
    const documents = getRegistrationDocuments(
      registration({
        foto_path: 'resident-a/photo.jpg',
        documentos_paths: [
          'resident-a/documento%20principal.pdf',
          'resident-a/shared.pdf',
        ],
        files: [
          {
            id: 'file-1',
            registration_id: 'registration-a',
            storage_path: 'resident-a/shared.pdf',
            kind: 'document',
            created_at: '2026-01-01T00:00:00Z',
          },
          {
            id: 'file-2',
            registration_id: 'registration-a',
            storage_path: 'resident-a/avatar.png',
            kind: 'image',
            created_at: '2026-01-01T00:00:00Z',
          },
        ],
      })
    );

    expect(documents).toEqual([
      { kind: 'photo', label: 'Foto do residente', path: 'resident-a/photo.jpg' },
      {
        kind: 'document',
        label: 'documento principal.pdf',
        path: 'resident-a/documento%20principal.pdf',
      },
      { kind: 'document', label: 'shared.pdf', path: 'resident-a/shared.pdf' },
      { kind: 'photo', label: 'Foto do residente', path: 'resident-a/avatar.png' },
    ]);
  });

  it('ignores empty paths', () => {
    expect(
      getRegistrationDocuments(
        registration({ documentos_paths: ['', 'document.pdf'] })
      )
    ).toEqual([
      { kind: 'document', label: 'document.pdf', path: 'document.pdf' },
    ]);
  });
});
