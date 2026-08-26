'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState, type FormEvent } from 'react';

import { useAuth } from '@/features/auth/AuthProvider';
import { updateOwnProfile } from '@/features/auth/actions';
import { updateAccountPassword } from '@/features/auth/password';
import { acceptManagerInvitation } from '@/features/condominiums/actions';
import { errorMessage } from '@/lib/format';

function AcceptInviteContent() {
  const invitationId = useSearchParams().get('invitation');
  const { user, profile, loading, refreshIdentity } = useAuth();
  const [fullName, setFullName] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault(); if (!user || !invitationId || saving) return;
    setSaving(true); setError(null);
    try {
      await updateAccountPassword(password, confirmation);
      await updateOwnProfile(user.id, { fullName: fullName ?? profile?.full_name ?? '', phone: phone ?? profile?.phone ?? '' });
      await acceptManagerInvitation(invitationId);
      await refreshIdentity(); setAccepted(true);
    } catch (reason) { console.error('Failed to accept invitation:', reason); setError(errorMessage(reason, 'Não foi possível aceitar o convite. Verifique se ele ainda é válido e se foi enviado para esta conta.')); }
    finally { setSaving(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 px-4 py-10"><section className="portal-card w-full max-w-lg p-8"><h1 className="text-2xl font-bold text-white">Aceitar convite de gestor</h1>{loading ? <p className="mt-6 text-sm text-slate-400">Validando sua conta...</p> : !invitationId ? <p className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">O convite informado é inválido.</p> : accepted ? <><p role="status" className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">Convite aceito. Seu acesso de gestor está ativo.</p><Link href="/portal" className="portal-button portal-button-primary mt-5 w-full">Entrar no portal</Link></> : !user ? <><p className="mt-6 text-sm leading-6 text-slate-300">Conclua a ativação pelo link recebido por e-mail. Se você já ativou a conta, entre com o mesmo endereço que recebeu o convite.</p><Link href={`/login`} className="portal-button portal-button-primary mt-5 w-full">Entrar</Link></> : <form onSubmit={handleSubmit} className="mt-6 space-y-4">{error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}<div className="rounded-xl border border-white/10 bg-slate-950/40 p-4"><p className="text-xs uppercase tracking-wide text-slate-500">Conta do convite</p><p className="mt-1 text-sm text-white">{user.email}</p></div><label className="portal-label">Nome completo<input required minLength={2} value={fullName ?? profile?.full_name ?? ''} disabled={saving} onChange={event => setFullName(event.target.value)} className="portal-field" /></label><label className="portal-label">Telefone<input value={phone ?? profile?.phone ?? ''} disabled={saving} onChange={event => setPhone(event.target.value)} className="portal-field" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="portal-label">Criar senha<input type="password" minLength={8} required autoComplete="new-password" value={password} disabled={saving} onChange={event => setPassword(event.target.value)} className="portal-field" /></label><label className="portal-label">Confirmar senha<input type="password" minLength={8} required autoComplete="new-password" value={confirmation} disabled={saving} onChange={event => setConfirmation(event.target.value)} className="portal-field" /></label></div><button disabled={saving} className="portal-button portal-button-primary w-full">{saving ? 'Ativando acesso...' : 'Aceitar convite'}</button></form>}</section></main>;
}

export default function AcceptInvitePage() {
  return <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-300">Carregando convite...</main>}><AcceptInviteContent /></Suspense>;
}
