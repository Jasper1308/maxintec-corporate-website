'use client';

import { useState } from 'react';

import { ExternalLink, FileText, ImageIcon } from 'lucide-react';

import { Modal } from '@/components/portal/Modal';

import { createDocumentUrl } from '../storage';
import type { RegistrationDocument } from '../types';

interface PrivateDocumentListProps {
  documents: RegistrationDocument[];
}

interface PreviewState {
  label: string;
  url: string | null;
}

export function PrivateDocumentList({
  documents,
}: PrivateDocumentListProps) {
  const [preview, setPreview] =
    useState<PreviewState | null>(null);
  const [loadingPath, setLoadingPath] =
    useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function openDocument(
    document: RegistrationDocument
  ) {
    if (loadingPath) {
      return;
    }

    setError(null);
    setLoadingPath(document.path);
    setPreview({ label: document.label, url: null });

    try {
      const url = await createDocumentUrl(document.path);
      setPreview({ label: document.label, url });
    } catch (documentError) {
      console.error(
        'Não foi possível criar a URL assinada do documento:',
        documentError
      );
      setPreview(null);
      setError(
        'Não foi possível abrir este arquivo. Verifique sua permissão e tente novamente.'
      );
    } finally {
      setLoadingPath(null);
    }
  }

  if (documents.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        Nenhum arquivo enviado.
      </p>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {documents.map(document => {
          const Icon =
            document.kind === 'photo' ? ImageIcon : FileText;
          const loading = loadingPath === document.path;

          return (
            <button
              key={`${document.kind}-${document.path}`}
              type="button"
              disabled={Boolean(loadingPath)}
              onClick={() => void openDocument(document)}
              className="portal-button portal-button-secondary min-h-9 px-3 py-2 text-left text-xs"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="max-w-52 truncate">
                {loading ? 'Autorizando acesso...' : document.label}
              </span>
            </button>
          );
        })}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <Modal
        open={Boolean(preview)}
        title={preview?.label ?? 'Documento'}
        onClose={() => {
          if (!loadingPath) {
            setPreview(null);
          }
        }}
      >
        {!preview?.url ? (
          <div role="status" className="flex min-h-64 items-center justify-center text-sm text-slate-400">
            Autorizando acesso ao arquivo...
          </div>
        ) : (
          <div>
            <iframe
              src={preview.url}
              title={preview.label}
              className="h-[65vh] w-full rounded-xl border border-white/10 bg-white"
            />
            <a
              href={preview.url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-300 transition hover:text-blue-200"
            >
              Abrir em uma nova aba
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}
      </Modal>
    </>
  );
}
