'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { requestPasswordReset } from '@/features/auth/password';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault(); if (sending) return;
    setSending(true);
    try { await requestPasswordReset(email, `${window.location.origin}/reset-password`); }
    catch (error) { console.error('Password reset request failed:', error); }
    finally { setSending(false); setSent(true); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 px-4"><section className="portal-card w-full max-w-md p-8"><h1 className="text-2xl font-bold text-white">Recuperar senha</h1><p className="mt-2 text-sm leading-6 text-slate-400">Informe o e-mail usado no portal.</p>{sent ? <div role="status" className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-100">Se existir uma conta para este e-mail, enviaremos as instruções.</div> : <form onSubmit={handleSubmit} className="mt-6 space-y-4"><label className="portal-label">E-mail<input type="email" required autoComplete="email" value={email} disabled={sending} onChange={event => setEmail(event.target.value)} className="portal-field" /></label><button disabled={sending} className="portal-button portal-button-primary w-full">{sending ? 'Enviando...' : 'Enviar instruções'}</button></form>}<Link href="/login" className="mt-6 block text-center text-sm text-blue-300 hover:text-blue-200">Voltar ao acesso</Link></section></main>;
}
