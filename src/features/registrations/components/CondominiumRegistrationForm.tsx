'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, FileUp, ImagePlus } from 'lucide-react';
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from 'react';

import { PageHeader } from '@/components/portal/PageHeader';
import { ErrorState, LoadingState } from '@/components/portal/PortalStates';
import { useAuth } from '@/features/auth/AuthProvider';
import { errorMessage } from '@/lib/format';

import { getRegistrationCondominiums } from '../form-queries';
import type { RegistrationCondominiumOption, RegistrationFormValues } from '../form-types';
import { submitRegistration } from '../submit-registration';

const inputClass = 'portal-field';

const emptyForm = (email = ''): RegistrationFormValues => ({
  condominiumId: '', condominiumName: '', block: '', apartment: '',
  residentType: 'morador', cpf: '', fullName: '', phone: '', email,
  photo: null, documents: [], privacyAccepted: false,
});

function formatCpfInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11)
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function CondominiumRegistrationForm() {
  const { user } = useAuth();
  const photoInput = useRef<HTMLInputElement>(null);
  const documentInput = useRef<HTMLInputElement>(null);
  const [options, setOptions] = useState<RegistrationCondominiumOption[]>([]);
  const [form, setForm] = useState(() => emptyForm(user?.email ?? ''));
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const selectedCondominium = useMemo(
    () => options.find(option => option.id === form.condominiumId) ?? null,
    [form.condominiumId, options]
  );

  useEffect(() => {
    let active = true;
    async function loadOptions() {
      try {
        const data = await getRegistrationCondominiums();
        if (active) setOptions(data);
      } catch (reason) {
        console.error('Failed to load registration options:', reason);
        if (active) setError(errorMessage(reason, 'Não foi possível carregar os condomínios.'));
      } finally {
        if (active) setLoadingOptions(false);
      }
    }
    void loadOptions();
    return () => { active = false; };
  }, []);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function updateField(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value, type } = event.target;
    if (name === 'condominiumId') {
      const condominium = options.find(option => option.id === value);
      setForm(current => ({ ...current, condominiumId: value, condominiumName: condominium?.name ?? '', block: '' }));
      return;
    }
    const nextValue = type === 'checkbox' && event.target instanceof HTMLInputElement ? event.target.checked : value;
    setForm(current => ({ ...current, [name]: name === 'cpf' ? formatCpfInput(value) : name === 'phone' ? formatPhoneInput(value) : nextValue }));
  }

  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('A foto precisa ser um arquivo de imagem.');
    if (file.size > 5 * 1024 * 1024) return setError('A foto deve ter no máximo 5 MB.');
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setForm(current => ({ ...current, photo: file }));
    setError(null);
  }

  function selectDocuments(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const invalid = files.find(file => file.type !== 'application/pdf' || file.size > 10 * 1024 * 1024);
    if (invalid) return setError(`${invalid.name}: envie somente PDF de até 10 MB.`);
    setForm(current => ({ ...current, documents: [...current.documents, ...files] }));
    setError(null);
    event.target.value = '';
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError(null); setSuccess(false);
    if (!form.condominiumId || !form.block || !form.apartment.trim() || !form.fullName.trim()) return setError('Preencha todos os campos obrigatórios.');
    if (form.cpf.replace(/\D/g, '').length !== 11) return setError('Informe um CPF com 11 dígitos.');
    if (!form.privacyAccepted) return setError('Confirme que está ciente da Política de Privacidade.');
    setSubmitting(true);
    try {
      await submitRegistration(form);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null); setForm(emptyForm(user?.email ?? '')); setSuccess(true);
    } catch (reason) {
      console.error('Failed to submit condominium registration:', reason);
      setError(errorMessage(reason, 'Não foi possível enviar o cadastro. Tente novamente.'));
    } finally { setSubmitting(false); }
  }

  if (loadingOptions) return <LoadingState />;

  return <div className="mx-auto max-w-4xl">
    <Link href="/portal/registrations" className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-blue-300 transition hover:text-blue-200"><ArrowLeft className="h-4 w-4" />Voltar aos cadastros</Link>
    <PageHeader title="Novo cadastro de condomínio" description="Envie seus dados residenciais para análise da administração." />
    {success && <div role="status" className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100">Cadastro enviado. Acompanhe a análise em Meu cadastro.</div>}
    {error && <div className="mb-5"><ErrorState message={error} /></div>}
    <form onSubmit={handleSubmit} className="portal-card space-y-8 p-6 sm:p-8">
      <fieldset disabled={submitting}><legend className="mb-5 text-lg font-semibold text-white">Localização residencial</legend><div className="grid gap-5 sm:grid-cols-3">
        <label className="portal-label">Condomínio <span className="portal-required">*</span><select name="condominiumId" value={form.condominiumId} onChange={updateField} className={inputClass} required><option value="">Selecione...</option>{options.map(option => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
        <label className="portal-label">Bloco / torre <span className="portal-required">*</span>{selectedCondominium?.blocks.length ? <select name="block" value={form.block} onChange={updateField} className={inputClass} required><option value="">Selecione...</option>{selectedCondominium.blocks.map(block => <option key={block}>{block}</option>)}</select> : <input name="block" value={form.block} onChange={updateField} className={inputClass} disabled={!selectedCondominium} required />}</label>
        <label className="portal-label">Apartamento / unidade <span className="portal-required">*</span><input name="apartment" value={form.apartment} onChange={updateField} className={inputClass} required /></label>
      </div></fieldset>
      <fieldset disabled={submitting} className="border-t border-white/10 pt-8"><legend className="mb-5 text-lg font-semibold text-white">Dados do residente</legend><div className="grid gap-5 sm:grid-cols-2">
        <label className="portal-label sm:col-span-2">Nome completo <span className="portal-required">*</span><input name="fullName" value={form.fullName} onChange={updateField} className={inputClass} required /></label>
        <label className="portal-label">CPF <span className="portal-required">*</span><input name="cpf" value={form.cpf} onChange={updateField} inputMode="numeric" className={inputClass} required /></label>
        <label className="portal-label">Vínculo <span className="portal-required">*</span><select name="residentType" value={form.residentType} onChange={updateField} className={inputClass}><option value="morador">Morador proprietário</option><option value="locatario">Locatário</option><option value="dependente">Dependente / familiar</option></select></label>
        <label className="portal-label">Telefone<input name="phone" value={form.phone} onChange={updateField} inputMode="tel" className={inputClass} /></label>
        <label className="portal-label">E-mail<input value={form.email} disabled className={inputClass} /></label>
      </div></fieldset>
      <fieldset disabled={submitting} className="border-t border-white/10 pt-8"><legend className="mb-5 text-lg font-semibold text-white">Foto e documentos</legend><div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-dashed border-white/15 bg-slate-950/30 p-5 text-center transition hover:border-blue-400/30"><input ref={photoInput} type="file" accept="image/*" onChange={selectPhoto} className="hidden" />{preview ? <div className="relative mx-auto mb-3 h-24 w-24 overflow-hidden rounded-full ring-2 ring-blue-400/30"><Image src={preview} alt="Prévia da foto" fill unoptimized className="object-cover" /></div> : <><ImagePlus className="mx-auto mb-3 h-6 w-6 text-blue-300" /><p className="mb-3 text-sm text-slate-400">Foto cadastral (até 5 MB)</p></>}<button type="button" onClick={() => photoInput.current?.click()} className="portal-button portal-button-secondary">Escolher foto</button></div>
        <div className="rounded-xl border border-dashed border-white/15 bg-slate-950/30 p-5 text-center transition hover:border-blue-400/30"><input ref={documentInput} type="file" accept="application/pdf" multiple onChange={selectDocuments} className="hidden" /><FileUp className="mx-auto mb-3 h-6 w-6 text-blue-300" /><p className="mb-3 text-sm text-slate-400">Comprovantes em PDF (até 10 MB cada)</p><button type="button" onClick={() => documentInput.current?.click()} className="portal-button portal-button-secondary">Anexar PDFs</button></div>
      </div>{form.documents.length > 0 && <ul className="mt-4 space-y-2 text-sm text-slate-300">{form.documents.map((document, index) => <li key={`${document.name}-${index}`} className="flex items-center justify-between gap-3 rounded-lg bg-slate-950/60 px-3 py-2"><span className="min-w-0 truncate">{document.name}</span><button type="button" onClick={() => setForm(current => ({ ...current, documents: current.documents.filter((_, itemIndex) => itemIndex !== index) }))} className="min-h-9 shrink-0 rounded-lg px-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 hover:text-red-200">Remover</button></li>)}</ul>}</fieldset>
      <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-4 text-sm leading-6 text-slate-300"><input type="checkbox" name="privacyAccepted" checked={form.privacyAccepted} onChange={updateField} required disabled={submitting} className="mt-1 h-4 w-4 shrink-0 accent-blue-500" /><span>Li e estou ciente do tratamento dos meus dados conforme a <Link href="/privacy-policy" target="_blank" className="font-medium text-blue-300 underline hover:text-blue-200">Política de Privacidade</Link>.</span></label>
      <button type="submit" disabled={submitting || options.length === 0} className="portal-button portal-button-primary w-full">{submitting ? 'Enviando cadastro...' : 'Enviar cadastro'}</button>
    </form>
  </div>;
}
