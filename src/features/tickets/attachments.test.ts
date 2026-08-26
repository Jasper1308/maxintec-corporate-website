import { describe, expect, it } from 'vitest';

import { queueSupabaseQueryResults, storageBucketMock, supabaseMock } from '../../../tests/mocks/supabase';
import { createTicketAttachmentUrl, uploadTicketAttachments, validateTicketAttachments } from './attachments';

describe('ticket attachments', () => {
  it('limits quantity, type and file size', () => {
    const valid = new File(['pdf'], 'manual.pdf', { type: 'application/pdf' });
    expect(() => validateTicketAttachments(Array.from({ length: 6 }, () => valid))).toThrow('5 anexos');
    expect(() => validateTicketAttachments([new File(['x'], 'file.txt', { type: 'text/plain' })])).toThrow('JPG');
  });
  it('uploads with the authenticated user and records metadata', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-a' } }, error: null });
    queueSupabaseQueryResults({ data: null, error: null });
    const result = await uploadTicketAttachments('ticket-a', [new File(['pdf'], 'manual.pdf', { type: 'application/pdf' })]);
    expect(result).toEqual({ uploaded: 1, failed: [] });
    expect(storageBucketMock.upload.mock.calls[0][0]).toMatch(/^ticket-a\/user-a\//);
    expect(supabaseMock.from).toHaveBeenCalledWith('ticket_attachments');
  });
  it('preserves the ticket and reports a failed file', async () => {
    supabaseMock.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-a' } }, error: null });
    storageBucketMock.upload.mockResolvedValueOnce({ data: null, error: new Error('upload unavailable') });
    await expect(uploadTicketAttachments('ticket-a', [new File(['pdf'], 'manual.pdf', { type: 'application/pdf' })])).resolves.toEqual({ uploaded: 0, failed: ['manual.pdf'] });
  });
  it('opens files through a temporary private URL', async () => {
    await expect(createTicketAttachmentUrl({ id: 'a', ticket_id: 'ticket-a', uploaded_by: 'user-a', storage_path: 'ticket-a/user-a/a.pdf', original_name: 'a.pdf', mime_type: 'application/pdf', size_bytes: 10, created_at: '2026-01-01' })).resolves.toContain('storage.test');
  });
});
