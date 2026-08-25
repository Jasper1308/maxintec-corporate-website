const MAX_DIAGNOSTIC_LENGTH = 1_000;

export interface SupabaseErrorDiagnostic {
  operation?: string;
  name?: string;
  message: string;
  code?: string;
  details?: string;
  hint?: string;
  status?: string | number;
}

type ErrorLike = Record<string, unknown>;

function safeText(value: unknown): string | undefined {
  if (typeof value !== 'string' || value.length === 0) {
    return undefined;
  }

  return value
    .replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, 'Bearer [redacted]')
    .replace(/\b[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[redacted-jwt]')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[redacted-email]')
    .replace(/([?&](?:apikey|token|access_token|refresh_token|password)=)[^&\s]+/gi, '$1[redacted]')
    .slice(0, MAX_DIAGNOSTIC_LENGTH);
}

function errorLike(error: unknown): ErrorLike {
  return typeof error === 'object' && error !== null
    ? error as ErrorLike
    : {};
}

export function toSupabaseErrorDiagnostic(
  error: unknown
): SupabaseErrorDiagnostic {
  const candidate = errorLike(error);
  const fallbackMessage = typeof error === 'string'
    ? safeText(error)
    : undefined;

  const diagnostic: SupabaseErrorDiagnostic = {
    message:
      safeText(candidate.message) ??
      fallbackMessage ??
      'Unknown Supabase error',
  };

  const operation = safeText(candidate.operation);
  const name = safeText(candidate.name);
  const code = safeText(candidate.code);
  const details = safeText(candidate.details);
  const hint = safeText(candidate.hint);
  const status = candidate.status;

  if (operation) diagnostic.operation = operation;
  if (name) diagnostic.name = name;
  if (code) diagnostic.code = code;
  if (details) diagnostic.details = details;
  if (hint) diagnostic.hint = hint;
  if (typeof status === 'string' || typeof status === 'number') {
    diagnostic.status = status;
  }

  return diagnostic;
}

export class SupabaseOperationError extends Error {
  readonly operation: string;
  readonly code?: string;
  readonly details?: string;
  readonly hint?: string;
  readonly status?: string | number;

  constructor(operation: string, error: unknown) {
    const diagnostic = toSupabaseErrorDiagnostic(error);
    super(diagnostic.message);
    this.name = 'SupabaseOperationError';
    this.operation = operation;
    this.code = diagnostic.code;
    this.details = diagnostic.details;
    this.hint = diagnostic.hint;
    this.status = diagnostic.status;
  }
}

export function reportSupabaseError(context: string, error: unknown): void {
  // Next.js displays console.error calls in its development overlay. This is an
  // operational failure already surfaced in the UI, so keep a structured,
  // allow-listed diagnostic in the console without blocking the portal.
  console.warn(`[Supabase] ${context}`, toSupabaseErrorDiagnostic(error));
}
