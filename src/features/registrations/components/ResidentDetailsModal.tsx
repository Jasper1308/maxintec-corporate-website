'use client';

import { useCallback, useEffect, useState } from 'react';

import { Modal } from '@/components/portal/Modal';
import { ErrorState, LoadingState } from '@/components/portal/PortalStates';

import { getRegistrationDocuments } from '../labels';
import { getRegistrationById } from '../queries';
import type { Registration } from '../types';
import { PrivateDocumentList } from './PrivateDocumentList';
import { RegistrationDetails } from './RegistrationDetails';

export function ResidentDetailsModal({ registrationId, onClose }: { registrationId: string; onClose: () => void }) {
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getRegistrationById(registrationId);
      if (!result) throw new Error('Cadastro não disponível para esta sessão.');
      setRegistration(result);
    } catch (reason) {
      console.error('Failed to load resident details:', reason);
      setError('Não foi possível carregar este cadastro. Verifique sua permissão.');
    } finally {
      setLoading(false);
    }
  }, [registrationId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timeoutId);
  }, [load]);

  return (
    <Modal open title={registration?.nome_completo ?? 'Detalhes do morador'} onClose={onClose}>
      {loading ? <LoadingState /> : error ? <ErrorState message={error} retry={() => void load()} /> : registration ? (
        <div className="space-y-7">
          <RegistrationDetails registration={registration} showCpf dateLabel="Aprovado em" dateValue={registration.approved_at} />
          <section><h3 className="mb-3 font-semibold text-white">Arquivos autorizados</h3><PrivateDocumentList documents={getRegistrationDocuments(registration)} /></section>
        </div>
      ) : null}
    </Modal>
  );
}
