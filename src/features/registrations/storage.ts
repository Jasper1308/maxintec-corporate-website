import { supabase } from '@/lib/supabase/client';

const PRIVATE_DOCUMENTS_BUCKET = 'client-documents';
const SIGNED_URL_TTL_SECONDS = 5 * 60;

function normalizeStoragePath(path: string): string {
  const normalizedPath = path.trim().replace(/^\/+/, '');
  const bucketPrefix = `${PRIVATE_DOCUMENTS_BUCKET}/`;

  return normalizedPath.startsWith(bucketPrefix)
    ? normalizedPath.slice(bucketPrefix.length)
    : normalizedPath;
}

export async function createDocumentUrl(
  path: string
): Promise<string> {
  const storagePath = normalizeStoragePath(path);

  if (!storagePath) {
    throw new Error('Caminho do documento inválido.');
  }

  const { data, error } = await supabase.storage
    .from(PRIVATE_DOCUMENTS_BUCKET)
    .createSignedUrl(
      storagePath,
      SIGNED_URL_TTL_SECONDS
    );

  if (error) {
    throw error;
  }

  return data.signedUrl;
}
