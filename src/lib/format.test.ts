import { describe, expect, it } from 'vitest';

import { errorMessage, formatDate, formatDateTime, maskCpf } from './format';

describe('formatDate', () => {
  it('formats a valid date using pt-BR conventions', () => {
    expect(formatDate('2026-08-25T12:30:00')).toBe('25/08/2026');
  });

  it.each([null, undefined, '', 'not-a-date'])(
    'returns a placeholder for invalid input: %s',
    value => {
      expect(formatDate(value)).toBe('—');
    }
  );
});

describe('formatDateTime', () => {
  it('formats date and time using pt-BR conventions', () => {
    expect(formatDateTime('2026-08-25T12:30:00')).toContain('25/08/2026');
    expect(formatDateTime('2026-08-25T12:30:00')).toContain('12:30');
  });

  it('returns a placeholder for an invalid date', () => {
    expect(formatDateTime('invalid')).toBe('—');
  });
});

describe('maskCpf', () => {
  it('keeps only the non-sensitive middle digits', () => {
    expect(maskCpf('123.456.789-01')).toBe('***.456.789-**');
  });

  it('does not expose malformed values', () => {
    expect(maskCpf('123')).toBe('•••.•••.•••-••');
  });
});

describe('errorMessage', () => {
  it.each([
    ['JWT expired', 'Sua sessão expirou. Entre novamente para continuar.'],
    ['row-level security policy violation', 'Você não tem permissão para concluir esta operação.'],
    ['Network request failed', 'Não foi possível conectar ao serviço. Verifique sua conexão.'],
  ])('maps %s to a safe user-facing message', (message, expected) => {
    expect(errorMessage(new Error(message))).toBe(expected);
  });

  it('uses the fallback without leaking unknown error details', () => {
    expect(errorMessage({ secret: 'internal' }, 'Falha controlada')).toBe(
      'Falha controlada'
    );
    expect(errorMessage(new Error('database internals'), 'Falha controlada')).toBe(
      'Falha controlada'
    );
  });
});
