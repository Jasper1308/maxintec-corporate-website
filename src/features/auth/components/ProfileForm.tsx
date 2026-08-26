'use client';

import { useState, type FormEvent } from 'react';

import { ErrorState } from '@/components/portal/PortalStates';
import { errorMessage } from '@/lib/format';

import { updateOwnProfile } from '../actions';

export function ProfileForm({ userId, email, initialName, initialPhone, onSaved }: { userId: string; email: string; initialName: string; initialPhone: string; onSaved: () => Promise<void> }) {
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateOwnProfile(userId, { fullName, phone });
      await onSaved();
      setSuccess('Perfil atualizado com sucesso.');
    } catch (reason) {
      console.error('Failed to update profile:', reason);
      setError(errorMessage(reason, 'Não foi possível atualizar seu perfil.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="portal-card max-w-2xl space-y-5 p-6">
      {error && <ErrorState message={error} />}
      {success && <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</p>}
      <label className="portal-label">Nome completo<input required minLength={2} value={fullName} disabled={saving} onChange={event => setFullName(event.target.value)} className="portal-field" /></label>
      <label className="portal-label">Telefone<input value={phone} disabled={saving} onChange={event => setPhone(event.target.value)} className="portal-field" placeholder="Opcional" /></label>
      <label className="portal-label">E-mail<input value={email} disabled className="portal-field opacity-70" /><span className="mt-1 text-xs font-normal text-slate-500">A alteração de e-mail não faz parte deste fluxo.</span></label>
      <div className="flex justify-end"><button type="submit" disabled={saving || !fullName.trim()} className="portal-button portal-button-primary">{saving ? 'Salvando...' : 'Salvar perfil'}</button></div>
    </form>
  );
}
