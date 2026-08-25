'use client';

import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
} from 'react';

import { Check, X } from 'lucide-react';

import { Modal } from '@/components/portal/Modal';
import { PageHeader } from '@/components/portal/PageHeader';
import {
  AccessDenied,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/portal/PortalStates';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  approveRegistration,
  rejectRegistration,
} from '@/features/registrations/actions';
import { PrivateDocumentList } from '@/features/registrations/components/PrivateDocumentList';
import { RegistrationDetails } from '@/features/registrations/components/RegistrationDetails';
import { getRegistrationDocuments } from '@/features/registrations/labels';
import { getPendingRegistrations } from '@/features/registrations/queries';
import type { Registration } from '@/features/registrations/types';

type ProcessingAction = 'approve' | 'reject';

interface ProcessingState {
  registrationId: string;
  action: ProcessingAction;
}

export default function ApprovalsPage() {
  const { isManager, loading: identityLoading } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [processing, setProcessing] =
    useState<ProcessingState | null>(null);
  const [rejectionTarget, setRejectionTarget] =
    useState<Registration | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionValidation, setRejectionValidation] =
    useState<string | null>(null);

  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setRegistrations(await getPendingRegistrations());
    } catch (queryError) {
      console.error(
        'Não foi possível carregar os cadastros pendentes:',
        queryError
      );
      setError(
        'Não foi possível carregar as aprovações. Tente novamente em instantes.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (identityLoading || !isManager) {
      return;
    }

    let active = true;

    getPendingRegistrations()
      .then(data => {
        if (active) {
          setRegistrations(data);
        }
      })
      .catch(queryError => {
        console.error(
          'Não foi possível carregar os cadastros pendentes:',
          queryError
        );

        if (active) {
          setError(
            'Não foi possível carregar as aprovações. Tente novamente em instantes.'
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [identityLoading, isManager]);

  async function refreshAfterAction(registrationId: string) {
    setRegistrations(current =>
      current.filter(registration => registration.id !== registrationId)
    );

    try {
      setRegistrations(await getPendingRegistrations());
    } catch (refreshError) {
      console.error(
        'A operação foi concluída, mas a lista não pôde ser atualizada:',
        refreshError
      );
    }
  }

  async function handleApprove(registration: Registration) {
    if (processing) {
      return;
    }

    setFeedback(null);
    setError(null);
    setProcessing({
      registrationId: registration.id,
      action: 'approve',
    });

    try {
      await approveRegistration(registration.id);
      await refreshAfterAction(registration.id);
      setFeedback(`${registration.nome_completo} foi aprovado com sucesso.`);
    } catch (approvalError) {
      console.error('Erro ao aprovar cadastro:', approvalError);
      setError(
        'Não foi possível aprovar este cadastro. Verifique sua permissão e tente novamente.'
      );
    } finally {
      setProcessing(null);
    }
  }

  function openRejectionModal(registration: Registration) {
    if (processing) {
      return;
    }

    setFeedback(null);
    setError(null);
    setRejectionValidation(null);
    setRejectionReason('');
    setRejectionTarget(registration);
  }

  function closeRejectionModal() {
    if (processing?.action === 'reject') {
      return;
    }

    setRejectionTarget(null);
    setRejectionReason('');
    setRejectionValidation(null);
  }

  async function handleReject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!rejectionTarget || processing) {
      return;
    }

    const normalizedReason = rejectionReason.trim();

    if (!normalizedReason) {
      setRejectionValidation('Informe o motivo da rejeição.');
      return;
    }

    setRejectionValidation(null);
    setError(null);
    setProcessing({
      registrationId: rejectionTarget.id,
      action: 'reject',
    });

    try {
      await rejectRegistration(rejectionTarget.id, normalizedReason);
      await refreshAfterAction(rejectionTarget.id);
      setFeedback(
        `${rejectionTarget.nome_completo} foi rejeitado e poderá revisar o cadastro.`
      );
      setRejectionTarget(null);
      setRejectionReason('');
    } catch (rejectionError) {
      console.error('Erro ao rejeitar cadastro:', rejectionError);
      setRejectionValidation(
        'Não foi possível rejeitar este cadastro. Verifique sua permissão e tente novamente.'
      );
    } finally {
      setProcessing(null);
    }
  }

  if (identityLoading) {
    return <LoadingState />;
  }

  if (!isManager) {
    return <AccessDenied />;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Aprovações"
        description="Analise os cadastros pendentes dos condomínios que você pode gerenciar."
      />

      {feedback && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-100"
        >
          {feedback}
        </div>
      )}

      {error && (
        <div className="mb-5">
          <ErrorState message={error} retry={() => void loadRegistrations()} />
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : error && registrations.length === 0 ? null : registrations.length === 0 ? (
        <EmptyState title="Nenhum cadastro aguardando aprovação.">
          Quando houver um novo envio permitido pelo seu acesso, ele aparecerá aqui.
        </EmptyState>
      ) : (
        <div className="space-y-5">
          {registrations.map(registration => {
            const isProcessing =
              processing?.registrationId === registration.id;

            return (
              <article
                key={registration.id}
                className="portal-card p-5 sm:p-6"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-semibold text-white">
                      {registration.nome_completo}
                    </h2>
                    <div className="mt-5">
                      <RegistrationDetails
                        registration={registration}
                        showCpf
                      />
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-3">
                    <button
                      type="button"
                      disabled={Boolean(processing)}
                      onClick={() => void handleApprove(registration)}
                      className="portal-button portal-button-success"
                    >
                      <Check className="h-4 w-4" />
                      {isProcessing && processing.action === 'approve'
                        ? 'Aprovando...'
                        : 'Aprovar'}
                    </button>
                    <button
                      type="button"
                      disabled={Boolean(processing)}
                      onClick={() => openRejectionModal(registration)}
                      className="portal-button portal-button-danger"
                    >
                      <X className="h-4 w-4" />
                      {isProcessing && processing.action === 'reject'
                        ? 'Rejeitando...'
                        : 'Rejeitar'}
                    </button>
                  </div>
                </div>

                <div className="mt-6 border-t border-white/10 pt-5">
                  <h3 className="mb-3 text-sm font-medium text-slate-300">
                    Foto e documentos
                  </h3>
                  <PrivateDocumentList
                    documents={getRegistrationDocuments(registration)}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Modal
        open={Boolean(rejectionTarget)}
        title="Rejeitar cadastro"
        onClose={closeRejectionModal}
      >
        <form onSubmit={handleReject}>
          <p className="text-sm leading-6 text-slate-300">
            Informe o que precisa ser corrigido no cadastro de{' '}
            <strong className="font-semibold text-white">
              {rejectionTarget?.nome_completo}
            </strong>
            . O motivo ficará disponível para o usuário.
          </p>

          <label
            htmlFor="rejection-reason"
            className="portal-label mt-5"
          >
            Motivo da rejeição
          </label>
          <textarea
            id="rejection-reason"
            value={rejectionReason}
            onChange={event => {
              setRejectionReason(event.target.value);
              setRejectionValidation(null);
            }}
            rows={5}
            maxLength={1000}
            required
            disabled={processing?.action === 'reject'}
            className="portal-field"
            placeholder="Descreva de forma clara o que deve ser revisado."
          />

          {rejectionValidation && (
            <p role="alert" className="mt-2 text-sm text-red-300">
              {rejectionValidation}
            </p>
          )}

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button
              type="button"
              onClick={closeRejectionModal}
              disabled={processing?.action === 'reject'}
              className="portal-button portal-button-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={Boolean(processing)}
              className="portal-button portal-button-danger-solid"
            >
              {processing?.action === 'reject'
                ? 'Rejeitando...'
                : 'Confirmar rejeição'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
