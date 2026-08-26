import { supabase } from '@/lib/supabase/client';

import type { TicketAttachment } from './types';

export const maximumTicketAttachments = 5;
export const maximumTicketAttachmentSize = 10 * 1024 * 1024;
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

function extension(file: File): string {
  return { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'application/pdf': 'pdf' }[file.type] ?? '';
}

export function validateTicketAttachments(files: File[]): void {
  if (files.length > maximumTicketAttachments) throw new Error('Selecione no máximo 5 anexos.');
  for (const file of files) {
    if (!allowedTypes.includes(file.type)) throw new Error(`${file.name}: envie uma imagem JPG, PNG, WebP ou um PDF.`);
    if (file.size <= 0 || file.size > maximumTicketAttachmentSize) throw new Error(`${file.name}: o arquivo deve ter no máximo 10 MB.`);
  }
}

export async function uploadTicketAttachments(ticketId: string, files: File[]): Promise<{ uploaded: number; failed: string[] }> {
  validateTicketAttachments(files);
  if (!files.length) return { uploaded: 0, failed: [] };
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { uploaded: 0, failed: files.map(file => file.name) };
  const bucket = supabase.storage.from('ticket-attachments');
  const failed: string[] = [];
  let uploaded = 0;
  for (const file of files) {
    const path = `${ticketId}/${user.id}/${crypto.randomUUID()}.${extension(file)}`;
    const { error: uploadError } = await bucket.upload(path, file, { upsert: false, contentType: file.type });
    if (uploadError) { failed.push(file.name); continue; }
    const { error: metadataError } = await supabase.from('ticket_attachments').insert({
      ticket_id: ticketId,
      uploaded_by: user.id,
      storage_path: path,
      original_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
    });
    if (metadataError) { await bucket.remove([path]); failed.push(file.name); continue; }
    uploaded += 1;
  }
  return { uploaded, failed };
}

export async function getTicketAttachments(ticketId: string): Promise<TicketAttachment[]> {
  const { data, error } = await supabase.from('ticket_attachments').select('id, ticket_id, uploaded_by, storage_path, original_name, mime_type, size_bytes, created_at').eq('ticket_id', ticketId).order('created_at');
  if (error) throw error;
  return (data ?? []) as TicketAttachment[];
}

export async function createTicketAttachmentUrl(attachment: TicketAttachment): Promise<string> {
  const { data, error } = await supabase.storage.from('ticket-attachments').createSignedUrl(attachment.storage_path, 300);
  if (error) throw error;
  return data.signedUrl;
}
