import type { CondominiumInput } from './types';

export function digits(value: string, maximum: number): string {
  return value.replace(/\D/g, '').slice(0, maximum);
}

export function formatCnpj(value: string): string {
  return digits(value, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2');
}

export function formatPostalCode(value: string): string {
  return digits(value, 8).replace(/^(\d{5})(\d)/, '$1-$2');
}

export function formatPhone(value: string): string {
  const valueDigits = digits(value, 11);
  if (valueDigits.length <= 2) return valueDigits;
  if (valueDigits.length <= 6) return `(${valueDigits.slice(0, 2)}) ${valueDigits.slice(2)}`;
  if (valueDigits.length <= 10) return `(${valueDigits.slice(0, 2)}) ${valueDigits.slice(2, 6)}-${valueDigits.slice(6)}`;
  return `(${valueDigits.slice(0, 2)}) ${valueDigits.slice(2, 7)}-${valueDigits.slice(7)}`;
}

export function normalizeCondominiumInput(input: CondominiumInput): CondominiumInput {
  const normalized: CondominiumInput = {
    name: input.name.trim(),
    cnpj: digits(input.cnpj, 14),
    postalCode: digits(input.postalCode, 8),
    street: input.street.trim(),
    number: input.number.trim(),
    complement: input.complement.trim(),
    neighborhood: input.neighborhood.trim(),
    city: input.city.trim(),
    state: input.state.trim().toUpperCase().slice(0, 2),
    phone: digits(input.phone, 11),
    adminEmail: input.adminEmail.trim().toLowerCase(),
    internalNotes: input.internalNotes.trim(),
    erpCode: input.erpCode.trim(),
    active: input.active,
  };
  if (normalized.name.length < 2) throw new Error('Informe um nome válido para o condomínio.');
  if (normalized.cnpj && normalized.cnpj.length !== 14) throw new Error('O CNPJ deve ter 14 dígitos.');
  if (normalized.postalCode && normalized.postalCode.length !== 8) throw new Error('O CEP deve ter 8 dígitos.');
  if (normalized.state && normalized.state.length !== 2) throw new Error('Informe a UF com duas letras.');
  if (normalized.adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.adminEmail)) throw new Error('Informe um e-mail administrativo válido.');
  return normalized;
}
