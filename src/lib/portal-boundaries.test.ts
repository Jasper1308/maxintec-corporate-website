import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

function productionSource(directory: string): string {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return productionSource(path);
    return /\.(ts|tsx)$/.test(entry.name) && !entry.name.includes('.test.') ? [readFileSync(path, 'utf8')] : [];
  }).join('\n');
}

describe('mocked and source-level security boundaries (not database authorization integration)', () => {
  const clientSource = productionSource(join(process.cwd(), 'src'));
  const invitationFunction = readFileSync(join(process.cwd(), 'supabase/functions/invite-manager/index.ts'), 'utf8');
  const migration = readFileSync(join(process.cwd(), 'supabase/migrations/20260826000000_portal_base_completion.sql'), 'utf8');

  it('keeps administrative credentials and account administration out of the frontend', () => {
    expect(clientSource).not.toMatch(/service_role/i);
    expect(clientSource).not.toMatch(/auth\.admin/);
  });
  it('validates administrator identity in the invitation function', () => {
    expect(invitationFunction).toContain("callerProfile?.global_role !== 'admin'");
    expect(invitationFunction).toContain("Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')");
    expect(invitationFunction).not.toMatch(/console\.log\([^)]*authorization/i);
  });
  it('validates invitation identity and authenticated ownership in database operations', () => {
    expect(migration).toContain('authenticated_email <> lower(invitation.email)');
    expect(migration).toContain('uploaded_by = auth.uid()');
    expect(migration).toContain("(storage.foldername(name))[1] = auth.uid()::text");
  });
});
