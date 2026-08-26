'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import { updateAccountPassword } from '@/features/auth/password';
import { errorMessage } from '@/lib/format';

export default function ResetPasswordPage() {
  const { user, loading } = useAuth();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault(); if (saving) return;
    setSaving(true); setError(null);
    try { await updateAccountPassword(password, confirmation); setSuccess(true); }
    catch (reason) { console.error('Password recovery update failed:', reason); setError(errorMessage(reason, 'Não foi possível definir a nova senha.')); }
    finally { setSaving(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 px-4"><section className="portal-card w-full max-w-md p-8"><h1 className="text-2xl font-bold text-white">Definir nova senha</h1>{loading ? <p className="mt-6 text-sm text-slate-400">Validando o acesso...</p> : success ? <><p role="status" className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">Senha alterada com sucesso.</p><Link href="/portal" className="portal-button portal-button-primary mt-5 w-full">Ir para o portal</Link></> : !user ? <><p className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">Este acesso de recuperação não é válido ou expirou. Solicite novas instruções.</p><Link href="/forgot-password" className="mt-5 block text-center text-sm text-blue-300">Solicitar novamente</Link></> : <form onSubmit={handleSubmit} className="mt-6 space-y-4">{error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}<label className="portal-label">Nova senha<input type="password" minLength={8} required autoComplete="new-password" value={password} disabled={saving} onChange={event => setPassword(event.target.value)} className="portal-field" /></label><label className="portal-label">Confirmar senha<input type="password" minLength={8} required autoComplete="new-password" value={confirmation} disabled={saving} onChange={event => setConfirmation(event.target.value)} className="portal-field" /></label><button disabled={saving} className="portal-button portal-button-primary w-full">{saving ? 'Salvando...' : 'Salvar nova senha'}</button></form>}</section></main>;
}
