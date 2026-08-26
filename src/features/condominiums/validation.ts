import type { CondominiumInput } from './types';

export function condominiumSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeCondominiumInput(
  input: CondominiumInput
): CondominiumInput {
  const name = input.name.trim();
  const slug = condominiumSlug(input.slug || name);

  if (name.length < 2) {
    throw new Error('Informe um nome válido para o condomínio.');
  }

  if (!slug) {
    throw new Error('Informe um identificador válido para o condomínio.');
  }

  return {
    name,
    legacyCode: input.legacyCode.trim(),
    slug,
  };
}
