import { supabase } from '@/lib/supabase/client';

export async function approveRegistration(
  registrationId: string
): Promise<void> {
  const { error } = await supabase.rpc(
    'approve_registration',
    {
      p_registration_id: registrationId,
    }
  );

  if (error) {
    throw error;
  }
}

export async function rejectRegistration(
  registrationId: string,
  reason: string
): Promise<void> {
  const normalizedReason = reason.trim();

  if (!normalizedReason) {
    throw new Error('Informe o motivo da rejeição.');
  }

  const { error } = await supabase.rpc(
    'reject_registration',
    {
      p_registration_id: registrationId,
      p_reason: normalizedReason,
    }
  );

  if (error) {
    throw error;
  }
}
