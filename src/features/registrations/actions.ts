import { supabase } from '@/lib/supabase/client';

export async function approveRegistration(
  registrationId: string
) {
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
  reason?: string
) {
  const { error } = await supabase.rpc(
    'reject_registration',
    {
      p_registration_id: registrationId,
      p_reason: reason ?? null,
    }
  );

  if (error) {
    throw error;
  }
}