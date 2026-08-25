'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { Search } from 'lucide-react';

import { PageHeader } from '@/components/portal/PageHeader';
import {
  AccessDenied,
  EmptyState,
  ErrorState,
  LoadingState,
} from '@/components/portal/PortalStates';
import { useAuth } from '@/features/auth/AuthProvider';
import {
  getCondominiumName,
  residentTypeLabels,
} from '@/features/registrations/labels';
import { getApprovedResidents } from '@/features/registrations/queries';
import type { Registration } from '@/features/registrations/types';
import { formatDate } from '@/lib/format';

function normalizeSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR')
    .trim();
}

function getUnit(registration: Registration): string {
  return [registration.bloco, registration.apartamento]
    .filter(Boolean)
    .join(' · ');
}

export default function ResidentsPage() {
  const { isManager, loading: identityLoading } = useAuth();
  const [residents, setResidents] = useState<Registration[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResidents = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setResidents(await getApprovedResidents());
    } catch (queryError) {
      console.error(
        'Não foi possível carregar os moradores aprovados:',
        queryError
      );
      setError(
        'Não foi possível carregar os moradores. Tente novamente em instantes.'
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

    getApprovedResidents()
      .then(data => {
        if (active) {
          setResidents(data);
        }
      })
      .catch(queryError => {
        console.error(
          'Não foi possível carregar os moradores aprovados:',
          queryError
        );

        if (active) {
          setError(
            'Não foi possível carregar os moradores. Tente novamente em instantes.'
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

  const filteredResidents = useMemo(() => {
    const term = normalizeSearch(search);

    if (!term) {
      return residents;
    }

    return residents.filter(registration => {
      const searchableValues = [
        registration.nome_completo,
        getCondominiumName(registration),
        registration.bloco,
        registration.apartamento,
        getUnit(registration),
        registration.email,
      ];

      return searchableValues.some(value =>
        normalizeSearch(value ?? '').includes(term)
      );
    });
  }, [residents, search]);

  if (identityLoading) {
    return <LoadingState />;
  }

  if (!isManager) {
    return <AccessDenied />;
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Moradores"
        description="Consulte os moradores aprovados nos condomínios permitidos pelo seu acesso."
      />

      <label className="mb-5 flex min-h-11 max-w-xl items-center gap-3 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-2.5 transition focus-within:border-blue-500 focus-within:ring-3 focus-within:ring-blue-500/10">
        <Search className="h-4 w-4 shrink-0 text-slate-500" />
        <span className="sr-only">Buscar moradores</span>
        <input
          type="search"
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Buscar por nome, condomínio, unidade ou e-mail"
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
        />
      </label>

      {error && (
        <div className="mb-5">
          <ErrorState message={error} retry={() => void loadResidents()} />
        </div>
      )}

      {loading ? (
        <LoadingState />
      ) : error && residents.length === 0 ? null : residents.length === 0 ? (
        <EmptyState title="Nenhum morador aprovado encontrado." />
      ) : filteredResidents.length === 0 ? (
        <EmptyState title="Nenhum morador corresponde à busca." />
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filteredResidents.map(registration => (
              <article
                key={registration.id}
                className="portal-card p-5"
              >
                <h2 className="font-semibold text-white">
                  {registration.nome_completo}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {registration.email ?? 'E-mail não informado'}
                </p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="col-span-2">
                    <dt className="text-xs text-slate-500">Condomínio</dt>
                    <dd className="mt-1 text-slate-200">
                      {getCondominiumName(registration)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Unidade</dt>
                    <dd className="mt-1 text-slate-200">
                      {getUnit(registration)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">Tipo</dt>
                    <dd className="mt-1 text-slate-200">
                      {residentTypeLabels[registration.tipo_residente]}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs text-slate-500">Aprovado em</dt>
                    <dd className="mt-1 text-slate-200">
                      {formatDate(registration.approved_at)}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>

          <div className="portal-table-shell hidden md:block">
            <div className="overflow-x-auto">
            <table className="portal-table min-w-[900px]">
              <thead>
                <tr>
                  <th className="px-5 py-4 font-medium">Morador</th>
                  <th className="px-5 py-4 font-medium">Condomínio</th>
                  <th className="px-5 py-4 font-medium">Unidade</th>
                  <th className="px-5 py-4 font-medium">Tipo</th>
                  <th className="px-5 py-4 font-medium">Aprovado em</th>
                </tr>
              </thead>
              <tbody>
                {filteredResidents.map(registration => (
                  <tr key={registration.id} className="text-slate-300">
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">
                        {registration.nome_completo}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {registration.email ?? 'E-mail não informado'}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      {getCondominiumName(registration)}
                    </td>
                    <td className="px-5 py-4">{getUnit(registration)}</td>
                    <td className="px-5 py-4">
                      {residentTypeLabels[registration.tipo_residente]}
                    </td>
                    <td className="px-5 py-4">
                      {formatDate(registration.approved_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
