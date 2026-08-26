'use client';

import Image from 'next/image';
import { Camera, ShieldCheck, Trash2, UserRound } from 'lucide-react';
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';

import { ErrorState } from '@/components/portal/PortalStates';
import { errorMessage } from '@/lib/format';

import { updateOwnProfile } from '../actions';
import { removeOwnAvatar, uploadOwnAvatar } from '../avatar';
import { updateAccountPassword } from '../password';
import type { Membership } from '../types';
import { useAvatarUrl } from '../useAvatarUrl';

interface Props {
  userId: string;
  email: string;
  initialName: string;
  initialPhone: string;
  initialAvatarPath: string | null;
  memberships: Membership[];
  onSaved: () => Promise<void>;
}

export function ProfileForm({ userId, email, initialName, initialPhone, initialAvatarPath, memberships, onSaved }: Props) {
  const avatarInput = useRef<HTMLInputElement>(null);
  const avatarUrl = useAvatarUrl(initialAvatarPath);
  const [fullName, setFullName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (saving) return;
    setSaving(true); setError(null); setSuccess(null);
    try { await updateOwnProfile(userId, { fullName, phone }); await onSaved(); setSuccess('Perfil atualizado com sucesso.'); }
    catch (reason) { console.error('Failed to update profile:', reason); setError(errorMessage(reason, 'Não foi possível atualizar seu perfil.')); }
    finally { setSaving(false); }
  }

  async function handleAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file || avatarBusy) return;
    setAvatarBusy(true); setError(null); setSuccess(null);
    try { await uploadOwnAvatar(file, initialAvatarPath); await onSaved(); setSuccess('Imagem de perfil atualizada.'); }
    catch (reason) { console.error('Failed to upload avatar:', reason); setError(errorMessage(reason, 'Não foi possível atualizar a imagem.')); }
    finally { setAvatarBusy(false); }
  }

  async function handleRemoveAvatar() {
    if (!initialAvatarPath || avatarBusy) return;
    setAvatarBusy(true); setError(null); setSuccess(null);
    try { await removeOwnAvatar(initialAvatarPath); await onSaved(); setSuccess('Imagem de perfil removida.'); }
    catch (reason) { console.error('Failed to remove avatar:', reason); setError(errorMessage(reason, 'Não foi possível remover a imagem.')); }
    finally { setAvatarBusy(false); }
  }

  async function handlePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (passwordBusy) return;
    setPasswordBusy(true); setError(null); setSuccess(null);
    try { await updateAccountPassword(password, confirmation); setPassword(''); setConfirmation(''); setSuccess('Senha alterada com sucesso.'); }
    catch (reason) { console.error('Failed to update password:', reason); setError(errorMessage(reason, 'Não foi possível alterar a senha.')); }
    finally { setPasswordBusy(false); }
  }

  return <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
    <div className="space-y-6">
      {error && <ErrorState message={error} />}
      {success && <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</p>}
      <section className="portal-card p-6">
        <h2 className="font-semibold text-white">Imagem de perfil</h2>
        <div className="mt-4 flex flex-wrap items-center gap-5">
          <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-slate-900 text-slate-400">{avatarUrl ? <Image src={avatarUrl} alt="Imagem de perfil" fill unoptimized className="object-cover" /> : <UserRound className="h-9 w-9" />}</div>
          <div className="flex flex-wrap gap-2"><input ref={avatarInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleAvatar} className="hidden" /><button type="button" disabled={avatarBusy} onClick={() => avatarInput.current?.click()} className="portal-button portal-button-secondary"><Camera className="h-4 w-4" />{avatarBusy ? 'Processando...' : 'Escolher imagem'}</button>{initialAvatarPath && <button type="button" disabled={avatarBusy} onClick={() => void handleRemoveAvatar()} className="portal-button portal-button-secondary"><Trash2 className="h-4 w-4" />Remover</button>}</div>
        </div><p className="mt-3 text-xs text-slate-500">JPG, PNG ou WebP, com até 2 MB. A foto enviada no cadastro residencial permanece separada.</p>
      </section>
      <form onSubmit={handleSubmit} className="portal-card space-y-5 p-6">
        <h2 className="font-semibold text-white">Dados pessoais</h2>
        <label className="portal-label">Nome completo<input required minLength={2} value={fullName} disabled={saving} onChange={event => setFullName(event.target.value)} className="portal-field" /></label>
        <label className="portal-label">Telefone<input value={phone} disabled={saving} onChange={event => setPhone(event.target.value)} className="portal-field" placeholder="Opcional" /></label>
        <div className="rounded-xl border border-white/10 bg-slate-950/40 p-4"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">E-mail da conta</p><p className="mt-2 break-all text-sm font-medium text-white">{email}</p><p className="mt-2 text-xs text-slate-500">Para alterar o endereço de e-mail, entre em contato com o suporte.</p></div>
        <div className="flex justify-end"><button type="submit" disabled={saving || !fullName.trim()} className="portal-button portal-button-primary">{saving ? 'Salvando...' : 'Salvar perfil'}</button></div>
      </form>
      <form onSubmit={handlePassword} className="portal-card space-y-5 p-6">
        <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-blue-300" /><h2 className="font-semibold text-white">Segurança</h2></div>
        <div className="grid gap-5 sm:grid-cols-2"><label className="portal-label">Nova senha<input type="password" required minLength={8} autoComplete="new-password" value={password} disabled={passwordBusy} onChange={event => setPassword(event.target.value)} className="portal-field" /></label><label className="portal-label">Confirmar senha<input type="password" required minLength={8} autoComplete="new-password" value={confirmation} disabled={passwordBusy} onChange={event => setConfirmation(event.target.value)} className="portal-field" /></label></div>
        <div className="flex justify-end"><button type="submit" disabled={passwordBusy || !password || !confirmation} className="portal-button portal-button-primary">{passwordBusy ? 'Alterando...' : 'Alterar senha'}</button></div>
      </form>
    </div>
    <aside className="portal-card h-fit p-6"><h2 className="font-semibold text-white">Associações</h2>{memberships.length === 0 ? <p className="mt-4 text-sm text-slate-500">Nenhuma associação disponível.</p> : <ul className="mt-4 space-y-3">{memberships.map(membership => <li key={membership.id} className="rounded-xl border border-white/10 bg-slate-950/40 p-4"><p className="font-medium text-white">{membership.condominium?.name ?? 'Condomínio'}</p><p className="mt-1 text-sm text-slate-400">{membership.role === 'manager' ? 'Gestor' : 'Morador'} · {membership.status === 'approved' ? 'Ativo' : membership.status === 'suspended' ? 'Suspenso' : 'Em análise'}</p></li>)}</ul>}</aside>
  </div>;
}
