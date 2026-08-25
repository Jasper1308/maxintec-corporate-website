import { supabase } from '@/lib/supabase/client';

import type { AuditLog } from './types';

export async function getAuditLogs(limit = 100): Promise<AuditLog[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 100);
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      id,
      action,
      entity_type,
      condominium_id,
      created_at,
      metadata,
      condominium:condominiums (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(safeLimit);

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as AuditLog[];
}
