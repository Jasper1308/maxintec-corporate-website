'use client';

import { useState, type FormEvent } from 'react';

import { Modal } from '@/components/portal/Modal';
import { ErrorState } from '@/components/portal/PortalStates';
import { errorMessage } from '@/lib/format';

import type { CondominiumInput, CondominiumListItem } from '../types';
import { condominiumSlug } from '../validation';

interface CondominiumFormModalProps {
  condominium: CondominiumListItem | null;
  onClose: () => void;
  onSave: (input: CondominiumInput) => Promise<void>;
}

export function CondominiumFormModal({ condominium, onClose, onSave }: CondominiumFormModalProps) {
  const [name, setName] = useState(condominium?.name ?? '');
  const [legacyCode, setLegacyCode] = useState(condominium?.legacy_code ?? '');
  const [slug, setSlug] = useState(condominium?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(condominium));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({ name, legacyCode, slug });
    } catch (reason) {
      console.error('Failed to save condominium:', reason);
      setError(errorMessage(reason, 'Não foi possível salvar o condomínio.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open title={condominium ? 'Editar condomínio' : 'Novo condomínio'} onClose={() => { if (!saving) onClose(); }}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <ErrorState message={error} />}
        <label className="portal-label">
          Nome
          <input required minLength={2} value={name} disabled={saving} onChange={event => {
            const nextName = event.target.value;
            setName(nextName);
            if (!slugTouched) setSlug(condominiumSlug(nextName));
          }} className="portal-field" />
        </label>
        <label className="portal-label">
          Código legado
          <input value={legacyCode} disabled={saving} onChange={event => setLegacyCode(event.target.value)} className="portal-field" placeholder="Opcional" />
        </label>
        <label className="portal-label">
          Identificador
          <input required value={slug} disabled={saving} onChange={event => { setSlugTouched(true); setSlug(event.target.value); }} className="portal-field" placeholder="condominio-exemplo" />
          <span className="mt-1 text-xs font-normal text-slate-500">Apenas letras, números e hífens serão mantidos.</span>
        </label>
        <div className="flex justify-end gap-3">
          <button type="button" disabled={saving} onClick={onClose} className="portal-button portal-button-secondary">Cancelar</button>
          <button type="submit" disabled={saving || !name.trim() || !slug.trim()} className="portal-button portal-button-primary">
            {saving ? 'Salvando...' : condominium ? 'Salvar alterações' : 'Criar condomínio'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
