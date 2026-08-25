export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR').format(date);
}
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}
export function maskCpf(value: string | null | undefined): string {
  const digits = value?.replace(/\D/g, '') ?? '';
  return digits.length === 11 ? `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**` : '•••.•••.•••-••';
}
export function errorMessage(error: unknown, fallback = 'Não foi possível concluir a operação.'): string {
  if (!(error instanceof Error)) return fallback;

  const message = error.message.toLowerCase();
  if (message.includes('jwt') || message.includes('session')) {
    return 'Sua sessão expirou. Entre novamente para continuar.';
  }
  if (message.includes('permission') || message.includes('policy') || message.includes('row-level security')) {
    return 'Você não tem permissão para concluir esta operação.';
  }
  if (message.includes('fetch') || message.includes('network')) {
    return 'Não foi possível conectar ao serviço. Verifique sua conexão.';
  }

  return fallback;
}
