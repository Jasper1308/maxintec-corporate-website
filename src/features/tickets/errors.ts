interface ErrorLike {
  code?: unknown;
  message?: unknown;
}

export function getTicketErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'object' && error !== null) {
    const candidate = error as ErrorLike;

    if (candidate.code === '42501') {
      return 'Você não tem permissão para realizar esta operação.';
    }
  }

  return fallback;
}
