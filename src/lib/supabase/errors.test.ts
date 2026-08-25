import { describe, expect, it, vi } from 'vitest';

import {
  reportSupabaseError,
  SupabaseOperationError,
  toSupabaseErrorDiagnostic,
} from './errors';

describe('Supabase error diagnostics', () => {
  it('preserves only useful PostgREST fields', () => {
    const diagnostic = toSupabaseErrorDiagnostic({
      message: 'column notifications.metadata does not exist',
      code: '42703',
      details: 'Requested column was not found',
      hint: 'Refresh the schema cache',
      status: 400,
      authorization: 'Bearer secret-token',
    });

    expect(diagnostic).toEqual({
      message: 'column notifications.metadata does not exist',
      code: '42703',
      details: 'Requested column was not found',
      hint: 'Refresh the schema cache',
      status: 400,
    });
    expect(diagnostic).not.toHaveProperty('authorization');
  });

  it('redacts tokens and personal identifiers from diagnostic text', () => {
    const diagnostic = toSupabaseErrorDiagnostic({
      message: 'Bearer top-secret-token failed for resident@example.test',
      details: 'token=eyJhbGciOiJIUzI1NiJ9.payload.signature',
    });
    const serialized = JSON.stringify(diagnostic);

    expect(serialized).not.toContain('top-secret-token');
    expect(serialized).not.toContain('resident@example.test');
    expect(serialized).not.toContain('eyJhbGciOiJIUzI1NiJ9');
    expect(serialized).toContain('[redacted]');
  });

  it('annotates the exact failed operation and logs a structured warning', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const error = new SupabaseOperationError('notifications.list', {
      message: 'permission denied for table notifications',
      code: '42501',
    });

    reportSupabaseError('Failed to load notifications', error);

    expect(consoleWarn).toHaveBeenCalledWith(
      '[Supabase] Failed to load notifications',
      expect.objectContaining({
        operation: 'notifications.list',
        message: 'permission denied for table notifications',
        code: '42501',
      })
    );
  });

  it('handles an empty serialized error without throwing', () => {
    expect(toSupabaseErrorDiagnostic({})).toEqual({
      message: 'Unknown Supabase error',
    });
  });
});
