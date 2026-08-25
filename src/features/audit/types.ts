export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  condominium_id: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
  condominium: {
    id: string;
    name: string;
  } | null;
}
