'use client';

import { useState, type FormEvent } from 'react';

import { Modal } from '@/components/portal/Modal';
import { ErrorState } from '@/components/portal/PortalStates';
import { errorMessage } from '@/lib/format';

import type { CondominiumInput, CondominiumListItem } from '../types';
import { formatCnpj, formatPhone, formatPostalCode } from '../validation';

interface Props {
  condominium: CondominiumListItem | null;
  onClose: () => void;
  onSave: (input: CondominiumInput) => Promise<void>;
}

function initialValue(item: CondominiumListItem | null): CondominiumInput {
  return {
    name: item?.name ?? '', cnpj: formatCnpj(item?.cnpj ?? ''), postalCode: formatPostalCode(item?.postal_code ?? ''),
    street: item?.street ?? '', number: item?.number ?? '', complement: item?.complement ?? '',
    neighborhood: item?.neighborhood ?? '', city: item?.city ?? '', state: item?.state ?? '',
    phone: formatPhone(item?.phone ?? ''), adminEmail: item?.admin_email ?? '', internalNotes: item?.internal_notes ?? '',
    erpCode: item?.legacy_code ?? '', active: item?.active ?? true,
  };
}

export function CondominiumFormModal({ condominium, onClose, onSave }: Props) {
  const [form, setForm] = useState(() => initialValue(condominium));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const update = <K extends keyof CondominiumInput>(field: K, value: CondominiumInput[K]) => setForm(current => ({ ...current, [field]: value }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true); setError(null);
    try { await onSave(form); }
    catch (reason) {
      console.error('Failed to save condominium:', reason);
      setError(errorMessage(reason, 'Não foi possível salvar o condomínio. Revise os dados e tente novamente.'));
    } finally { setSaving(false); }
  }

  return (
    <Modal open size="wide" title={condominium ? 'Editar condomínio' : 'Novo condomínio'} onClose={() => { if (!saving) onClose(); }}>
      <form onSubmit={handleSubmit} className="space-y-7">
        {error && <ErrorState message={error} />}
        <fieldset disabled={saving} className="space-y-5">
          <legend className="mb-4 font-semibold text-white">Dados gerais</legend>
          <div className="grid gap-5 md:grid-cols-3">
            <label className="portal-label md:col-span-2">Nome do condomínio <span className="portal-required">*</span><input required minLength={2} value={form.name} onChange={event => update('name', event.target.value)} className="portal-field" /></label>
            <label className="portal-label">CNPJ<input inputMode="numeric" value={form.cnpj} onChange={event => update('cnpj', formatCnpj(event.target.value))} className="portal-field" placeholder="00.000.000/0000-00" /></label>
            <label className="portal-label">CEP<input inputMode="numeric" value={form.postalCode} onChange={event => update('postalCode', formatPostalCode(event.target.value))} className="portal-field" placeholder="00000-000" /></label>
            <label className="portal-label md:col-span-2">Rua<input value={form.street} onChange={event => update('street', event.target.value)} className="portal-field" /></label>
            <label className="portal-label">Número<input value={form.number} onChange={event => update('number', event.target.value)} className="portal-field" /></label>
            <label className="portal-label md:col-span-2">Complemento<input value={form.complement} onChange={event => update('complement', event.target.value)} className="portal-field" /></label>
            <label className="portal-label">Bairro<input value={form.neighborhood} onChange={event => update('neighborhood', event.target.value)} className="portal-field" /></label>
            <label className="portal-label">Cidade<input value={form.city} onChange={event => update('city', event.target.value)} className="portal-field" /></label>
            <label className="portal-label">Estado<input maxLength={2} value={form.state} onChange={event => update('state', event.target.value.toUpperCase().replace(/[^A-Z]/g, ''))} className="portal-field" placeholder="SP" /></label>
            <label className="portal-label">Telefone<input inputMode="tel" value={form.phone} onChange={event => update('phone', formatPhone(event.target.value))} className="portal-field" /></label>
            <label className="portal-label md:col-span-2">E-mail administrativo<input type="email" value={form.adminEmail} onChange={event => update('adminEmail', event.target.value)} className="portal-field" /></label>
            <label className="portal-label">Situação<select value={form.active ? 'active' : 'inactive'} onChange={event => update('active', event.target.value === 'active')} className="portal-field"><option value="active">Ativo</option><option value="inactive">Inativo</option></select></label>
          </div>
        </fieldset>
        <details className="rounded-xl border border-white/10 bg-slate-950/30 p-4">
          <summary className="cursor-pointer font-semibold text-white">Dados internos</summary>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="portal-label">Código ERP<input value={form.erpCode} disabled={saving} onChange={event => update('erpCode', event.target.value)} className="portal-field" placeholder="Opcional" /></label>
            <label className="portal-label md:col-span-2">Observações internas<textarea rows={4} value={form.internalNotes} disabled={saving} onChange={event => update('internalNotes', event.target.value)} className="portal-field" /></label>
          </div>
        </details>
        <div className="flex justify-end gap-3">
          <button type="button" disabled={saving} onClick={onClose} className="portal-button portal-button-secondary">Cancelar</button>
          <button type="submit" disabled={saving || !form.name.trim()} className="portal-button portal-button-primary">{saving ? 'Salvando...' : condominium ? 'Salvar alterações' : 'Criar condomínio'}</button>
        </div>
      </form>
    </Modal>
  );
}
