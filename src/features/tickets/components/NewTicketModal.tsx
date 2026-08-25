'use client';

import { useState, type FormEvent } from 'react';

import { Modal } from '@/components/portal/Modal';
import { ErrorState } from '@/components/portal/PortalStates';

import { createTicket } from '../actions';
import { getTicketErrorMessage } from '../errors';
import {
  ticketCategories,
  ticketCategoryLabels,
  ticketPriorities,
  ticketPriorityLabels,
  type TicketCategory,
  type TicketCondominium,
  type TicketPriority,
} from '../types';

interface NewTicketModalProps {
  open: boolean;
  condominiums: TicketCondominium[];
  condominiumsLoading?: boolean;
  onClose: () => void;
  onCreated: (ticketId: string) => Promise<void> | void;
}

const fieldClassName =
  'mt-2 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500';

export function NewTicketModal({
  open,
  condominiums,
  condominiumsLoading = false,
  onClose,
  onCreated,
}: NewTicketModalProps) {
  const [condominiumId, setCondominiumId] = useState('');
  const [category, setCategory] = useState<TicketCategory>('geral');
  const [priority, setPriority] = useState<TicketPriority>('normal');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setCondominiumId('');
    setCategory('geral');
    setPriority('normal');
    setTitle('');
    setDescription('');
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const ticketId = await createTicket({
        condominiumId,
        category,
        priority,
        title,
        description,
      });

      await onCreated(ticketId);
      resetForm();
      onClose();
    } catch (caughtError) {
      console.error('Failed to create ticket:', caughtError);
      setError(
        getTicketErrorMessage(
          caughtError,
          'Não foi possível abrir o chamado. Tente novamente.'
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    if (!submitting) {
      resetForm();
      onClose();
    }
  }

  return (
    <Modal open={open} title="Novo chamado" onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <ErrorState message={error} />}

        <label className="block text-sm font-medium text-slate-200">
          Condomínio
          <select
            required
            value={condominiumId}
            onChange={event => setCondominiumId(event.target.value)}
            disabled={submitting || condominiumsLoading}
            className={fieldClassName}
          >
            <option value="">
              {condominiumsLoading
                ? 'Carregando condomínios...'
                : 'Selecione um condomínio'}
            </option>
            {condominiums.map(condominium => (
              <option key={condominium.id} value={condominium.id}>
                {condominium.name}
              </option>
            ))}
          </select>
        </label>

        {!condominiumsLoading && condominiums.length === 0 && (
          <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">
            Nenhum condomínio disponível. É necessário possuir um vínculo aprovado
            para abrir um chamado.
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-200">
            Categoria
            <select
              value={category}
              onChange={event =>
                setCategory(event.target.value as TicketCategory)
              }
              disabled={submitting}
              className={fieldClassName}
            >
              {ticketCategories.map(value => (
                <option key={value} value={value}>
                  {ticketCategoryLabels[value]}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm font-medium text-slate-200">
            Prioridade
            <select
              value={priority}
              onChange={event =>
                setPriority(event.target.value as TicketPriority)
              }
              disabled={submitting}
              className={fieldClassName}
            >
              {ticketPriorities.map(value => (
                <option key={value} value={value}>
                  {ticketPriorityLabels[value]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="block text-sm font-medium text-slate-200">
          Título
          <input
            required
            maxLength={160}
            value={title}
            onChange={event => setTitle(event.target.value)}
            disabled={submitting}
            className={fieldClassName}
            placeholder="Resuma o que precisa ser atendido"
          />
        </label>

        <label className="block text-sm font-medium text-slate-200">
          Descrição
          <textarea
            required
            rows={6}
            value={description}
            onChange={event => setDescription(event.target.value)}
            disabled={submitting}
            className={fieldClassName}
            placeholder="Descreva o problema e inclua informações importantes"
          />
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={
              submitting || condominiumsLoading || condominiums.length === 0
            }
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Abrindo...' : 'Abrir chamado'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
