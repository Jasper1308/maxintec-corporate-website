import { describe, expect, it } from 'vitest';

import type { CondominiumInput } from './types';
import { formatCnpj, formatPhone, formatPostalCode, normalizeCondominiumInput } from './validation';

const input = (overrides: Partial<CondominiumInput> = {}): CondominiumInput => ({
  name: ' Condomínio A ', cnpj: '12.345.678/0001-90', postalCode: '88000-123', street: ' Rua A ', number: ' 10 ',
  complement: ' Sala 2 ', neighborhood: ' Centro ', city: ' Florianópolis ', state: 'sc', phone: '(48) 99999-8888',
  adminEmail: ' ADMIN@EXAMPLE.COM ', internalNotes: ' Nota ', erpCode: ' ERP-1 ', active: true, ...overrides,
});

describe('complete condominium validation', () => {
  it('normalizes masks and text fields', () => expect(normalizeCondominiumInput(input())).toEqual({
    name: 'Condomínio A', cnpj: '12345678000190', postalCode: '88000123', street: 'Rua A', number: '10',
    complement: 'Sala 2', neighborhood: 'Centro', city: 'Florianópolis', state: 'SC', phone: '48999998888',
    adminEmail: 'admin@example.com', internalNotes: 'Nota', erpCode: 'ERP-1', active: true,
  }));
  it('formats CNPJ as the user types', () => expect(formatCnpj('12345678000190')).toBe('12.345.678/0001-90'));
  it('formats CEP as the user types', () => expect(formatPostalCode('88000123')).toBe('88000-123'));
  it('formats phone as the user types', () => expect(formatPhone('48999998888')).toBe('(48) 99999-8888'));
  it('rejects a missing name', () => expect(() => normalizeCondominiumInput(input({ name: ' ' }))).toThrow('nome válido'));
  it('rejects an incomplete CNPJ', () => expect(() => normalizeCondominiumInput(input({ cnpj: '123' }))).toThrow('14 dígitos'));
  it('rejects an incomplete CEP', () => expect(() => normalizeCondominiumInput(input({ postalCode: '123' }))).toThrow('8 dígitos'));
  it('rejects an invalid administrative email', () => expect(() => normalizeCondominiumInput(input({ adminEmail: 'invalid' }))).toThrow('e-mail administrativo'));
});
