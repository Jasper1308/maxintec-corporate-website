'use client';

import { useCallback, useEffect, useState } from 'react';

import Link from 'next/link';
import { Plus } from 'lucide-react';

import { PageHeader } from '@/components/portal/PageHeader';
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/portal/PortalStates';
import { StatusBadge } from '@/components/portal/StatusBadge';
import { useAuth } from '@/features/auth/AuthProvider';
import { RegistrationDetails } from '@/features/registrations/components/RegistrationDetails';
import { registrationStatusLabels } from '@/features/registrations/labels';
import { getMyRegistrations } from '@/features/registrations/queries';
import type { Registration } from '@/features/registrations/types';

export default function RegistrationsPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRegistrations = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setRegistrations(await getMyRegistrations(user.id));
    } catch (queryError) {
      console.error(
        'Não foi possível carregar os cadastros do usuário:',
        queryError
      );
      setError(
        'Não foi possível carregar seus cadastros. Tente novamente em instantes.'
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

    let active = true;

    getMyRegistrations(user.id)
      .then(data => {
        if (active) {
          setRegistrations(data);
        }
      })
      .catch(queryError => {
        console.error(
          'Não foi possível carregar os cadastros do usuário:',
          queryError
        );

        if (active) {
          setError(
            'Não foi possível carregar seus cadastros. Tente novamente em instantes.'
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
  }, [user]);

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Meu cadastro"
        description="Acompanhe os dados enviados e o andamento de cada solicitação."
        action={
          <Link
            href="/portal/registrations/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            Novo cadastro
          </Link>
        }
      />

      {error && (
        <div className="mb-5">
          <ErrorState message={error} retry={() => void loadRegistrations()} />
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : error && registrations.length === 0 ? null : registrations.length === 0 ? (
        <EmptyState title="Você ainda não enviou nenhum cadastro.">
          Use “Novo cadastro” para informar seu condomínio e enviar os documentos.
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {registrations.map(registration => (
            <article
              key={registration.id}
              className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 sm:p-6"
            >
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-white">
                    {registration.nome_completo}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Solicitação #{registration.id}
                  </p>
                </div>
                <StatusBadge
                  value={registration.status}
                  label={registrationStatusLabels[registration.status]}
                />
              </div>

              <RegistrationDetails registration={registration} />

              {registration.status === 'rejected' &&
                registration.rejection_reason && (
                  <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-red-300">
                      Motivo da revisão
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-100">
                      {registration.rejection_reason}
                    </p>
                  </div>
                )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
