import { describe, expect, it } from 'vitest';

import { condominiumSlug, normalizeCondominiumInput } from './validation';

describe('condominium validation', () => {
  it('creates a stable slug without accents or punctuation', () => {
    expect(condominiumSlug(' Residencial São João ')).toBe('residencial-sao-joao');
  });

  it('normalizes only fields proven by the current schema', () => {
    expect(normalizeCondominiumInput({ name: '  Condomínio A ', legacyCode: ' A-01 ', slug: '' })).toEqual({
      name: 'Condomínio A',
      legacyCode: 'A-01',
      slug: 'condominio-a',
    });
  });

  it('rejects a missing name', () => {
    expect(() => normalizeCondominiumInput({ name: ' ', legacyCode: '', slug: 'a' })).toThrow('nome válido');
  });

  it('rejects an unusable slug', () => {
    expect(() => normalizeCondominiumInput({ name: 'Condomínio', legacyCode: '', slug: '---' })).toThrow('identificador válido');
  });
});
