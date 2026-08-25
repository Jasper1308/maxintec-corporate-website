import { formatDate, maskCpf } from '@/lib/format';

import {
  getCondominiumName,
  residentTypeLabels,
} from '../labels';
import type { Registration } from '../types';

interface RegistrationDetailsProps {
  registration: Registration;
  showCpf?: boolean;
  dateLabel?: string;
  dateValue?: string | null;
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-slate-200">
        {value || '—'}
      </dd>
    </div>
  );
}

export function RegistrationDetails({
  registration,
  showCpf = false,
  dateLabel = 'Enviado em',
  dateValue = registration.created_at,
}: RegistrationDetailsProps) {
  const unit = [
    registration.bloco,
    registration.apartamento,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <Detail
        label="Condomínio"
        value={getCondominiumName(registration)}
      />
      <Detail label="Bloco / unidade" value={unit} />
      <Detail
        label="Tipo"
        value={
          residentTypeLabels[registration.tipo_residente] ??
          registration.tipo_residente
        }
      />
      {registration.email && (
        <Detail label="E-mail" value={registration.email} />
      )}
      {showCpf && (
        <Detail label="CPF" value={maskCpf(registration.cpf)} />
      )}
      <Detail label={dateLabel} value={formatDate(dateValue)} />
    </dl>
  );
}
