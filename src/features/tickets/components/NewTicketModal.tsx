'use client';

import { FileUp, X } from 'lucide-react';
import { useRef, useState, type ChangeEvent, type FormEvent } from 'react';

import { Modal } from '@/components/portal/Modal';
import { ErrorState } from '@/components/portal/PortalStates';

import { createTicket } from '../actions';
import { maximumTicketAttachments, uploadTicketAttachments, validateTicketAttachments } from '../attachments';
import { getTicketErrorMessage } from '../errors';
import { ticketCategories, ticketCategoryLabels, ticketPriorities, ticketPriorityLabels, type TicketCategory, type TicketCondominium, type TicketPriority } from '../types';

interface Props { open: boolean; condominiums: TicketCondominium[]; condominiumsLoading?: boolean; onClose: () => void; onCreated: (ticketId: string) => Promise<void> | void }

function fileSize(value: number): string { return value < 1024 * 1024 ? `${Math.ceil(value / 1024)} KB` : `${(value / 1024 / 1024).toFixed(1)} MB`; }

export function NewTicketModal({ open, condominiums, condominiumsLoading = false, onClose, onCreated }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [condominiumId, setCondominiumId] = useState('');
  const [category, setCategory] = useState<TicketCategory>('geral');
  const [priority, setPriority] = useState<TicketPriority>('normal');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachmentWarning, setAttachmentWarning] = useState(false);

  function resetForm() { setCondominiumId(''); setCategory('geral'); setPriority('normal'); setTitle(''); setDescription(''); setFiles([]); setError(null); setAttachmentWarning(false); }
  function handleClose() { if (!submitting) { resetForm(); onClose(); } }

  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const selected = [...files, ...Array.from(event.target.files ?? [])]; event.target.value = '';
    try { validateTicketAttachments(selected); setFiles(selected); setError(null); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Não foi possível selecionar os anexos.'); }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (submitting) return;
    setSubmitting(true); setError(null);
    try {
      const ticketId = await createTicket({ condominiumId, category, priority, title, description });
      const result = await uploadTicketAttachments(ticketId, files);
      await onCreated(ticketId);
      if (result.failed.length) {
        setAttachmentWarning(true); setFiles([]); setTitle(''); setDescription('');
      } else { resetForm(); onClose(); }
    } catch (reason) {
      console.error('Failed to create ticket:', reason);
      setError(getTicketErrorMessage(reason, 'Não foi possível abrir o chamado. Tente novamente.'));
    } finally { setSubmitting(false); }
  }

  return <Modal open={open} title="Novo chamado" onClose={handleClose}>{attachmentWarning ? <div><p role="status" className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm leading-6 text-amber-100">Chamado criado, mas alguns anexos não puderam ser enviados.</p><div className="mt-5 flex justify-end"><button type="button" onClick={handleClose} className="portal-button portal-button-primary">Fechar</button></div></div> : <form onSubmit={handleSubmit} className="space-y-5">
    {error && <ErrorState message={error} />}
    <label className="portal-label">Condomínio<select required value={condominiumId} onChange={event => setCondominiumId(event.target.value)} disabled={submitting || condominiumsLoading} className="portal-field"><option value="">{condominiumsLoading ? 'Carregando condomínios...' : 'Selecione um condomínio'}</option>{condominiums.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    {!condominiumsLoading && condominiums.length === 0 && <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">Nenhum condomínio disponível. É necessário possuir um vínculo aprovado para abrir um chamado.</p>}
    <div className="grid gap-5 sm:grid-cols-2"><label className="portal-label">Categoria<select value={category} onChange={event => setCategory(event.target.value as TicketCategory)} disabled={submitting} className="portal-field">{ticketCategories.map(value => <option key={value} value={value}>{ticketCategoryLabels[value]}</option>)}</select></label><label className="portal-label">Prioridade<select value={priority} onChange={event => setPriority(event.target.value as TicketPriority)} disabled={submitting} className="portal-field">{ticketPriorities.map(value => <option key={value} value={value}>{ticketPriorityLabels[value]}</option>)}</select></label></div>
    <label className="portal-label">Título<input required maxLength={160} value={title} onChange={event => setTitle(event.target.value)} disabled={submitting} className="portal-field" placeholder="Resuma o que precisa ser atendido" /></label>
    <label className="portal-label">Descrição<textarea required rows={6} value={description} onChange={event => setDescription(event.target.value)} disabled={submitting} className="portal-field" placeholder="Descreva o problema e inclua informações importantes" /></label>
    <section><p className="portal-label">Anexos</p><input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" onChange={selectFiles} className="hidden" /><button type="button" disabled={submitting || files.length >= maximumTicketAttachments} onClick={() => inputRef.current?.click()} className="portal-button portal-button-secondary mt-2"><FileUp className="h-4 w-4" />Selecionar imagem/PDF</button><p className="mt-2 text-xs text-slate-500">Até 5 arquivos, com no máximo 10 MB cada.</p>{files.length > 0 && <ul className="mt-3 space-y-2">{files.map((file, index) => <li key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-2"><span className="min-w-0 truncate text-sm text-slate-300">{file.name} · {fileSize(file.size)}</span><button type="button" aria-label={`Remover ${file.name}`} disabled={submitting} onClick={() => setFiles(current => current.filter((_, itemIndex) => itemIndex !== index))} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-300 hover:bg-red-500/10"><X className="h-4 w-4" /></button></li>)}</ul>}</section>
    <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={handleClose} disabled={submitting} className="portal-button portal-button-secondary">Cancelar</button><button type="submit" disabled={submitting || condominiumsLoading || condominiums.length === 0} className="portal-button portal-button-primary">{submitting ? 'Abrindo...' : 'Abrir chamado'}</button></div>
  </form>}</Modal>;
}
