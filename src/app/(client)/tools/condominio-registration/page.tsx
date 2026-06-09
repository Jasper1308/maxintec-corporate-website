'use client';

import { FormEvent, useState, ChangeEvent, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

type ResidentType = 'morador' | 'locatario' | 'dependente';

interface FormData {
  condominio: string;
  apartamento: string;
  tipo: ResidentType;
  cpf: string;
  nomeCompleto: string;
  telefone: string;
  email: string;
  foto: File | null;
  documentos: File[];
}

// Mock de condomínios disponíveis
const condominiosDisponiveis = [
  { id: 'cond-001', name: 'Condomínio Bela Vista' },
  { id: 'cond-002', name: 'Condomínio Residencial Park' },
  { id: 'cond-003', name: 'Condomínio Central' },
  { id: 'cond-004', name: 'Condomínio Luxury Towers' },
];

export default function CondominioRegistrationPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>({
    condominio: '',
    apartamento: '',
    tipo: 'morador',
    cpf: '',
    nomeCompleto: '',
    telefone: '',
    email: user?.email || '',
    foto: null,
    documentos: [],
  });

  function formatCPF(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
    if (cleaned.length <= 9)
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`;
  }

  function formatPhone(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
  }

  function handleInputChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;

    if (name === 'cpf') {
      setForm((prev) => ({ ...prev, cpf: formatCPF(value) }));
    } else if (name === 'telefone') {
      setForm((prev) => ({ ...prev, telefone: formatPhone(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  }

  function handlePhotoSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Foto deve ter menos de 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Arquivo deve ser uma imagem');
        return;
      }
      setForm((prev) => ({ ...prev, foto: file }));
      const reader = new FileReader();
      reader.onload = (e) => setPreviewPhoto(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  function handleDocumentsSelect(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} é muito grande (máximo 10MB)`);
        return false;
      }
      if (file.type !== 'application/pdf') {
        setError(`${file.name} não é um PDF`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setForm((prev) => ({
        ...prev,
        documentos: [...prev.documentos, ...validFiles],
      }));
      setError(null);
    }
  }

  function removeDocument(index: number) {
    setForm((prev) => ({
      ...prev,
      documentos: prev.documentos.filter((_, i) => i !== index),
    }));
  }

  async function uploadFile(file: File, path: string): Promise<string | null> {
    try {
      const { data, error: uploadError } = await supabase.storage
        .from('client-documents')
        .upload(path, file, { upsert: false });

      if (uploadError) {
        throw uploadError;
      }

      return data.path;
    } catch (err) {
      console.error('Upload error:', err);
      return null;
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!form.condominio || !form.apartamento || !form.cpf || !form.nomeCompleto) {
        setError('Preencha todos os campos obrigatórios');
        setLoading(false);
        return;
      }

      // Validar CPF (formato básico)
      const cpfNumbers = form.cpf.replace(/\D/g, '');
      if (cpfNumbers.length !== 11) {
        setError('CPF inválido');
        setLoading(false);
        return;
      }

      const userId = user?.id;
      if (!userId) throw new Error('Usuário não autenticado');

      // Upload files
      const fotoPath = form.foto
        ? await uploadFile(form.foto, `${userId}/photo/${form.foto.name}`)
        : null;

      const documentosPaths: string[] = [];
      for (const doc of form.documentos) {
        const path = await uploadFile(doc, `${userId}/documents/${doc.name}`);
        if (path) documentosPaths.push(path);
      }

      // Salvar dados no Supabase
      const { error: dbError } = await supabase.from('condominio_registrations').insert({
        user_id: userId,
        condominio: form.condominio,
        apartamento: form.apartamento,
        tipo_residente: form.tipo,
        cpf: cpfNumbers,
        nome_completo: form.nomeCompleto,
        telefone: form.telefone.replace(/\D/g, ''),
        email: form.email,
        foto_path: fotoPath,
        documentos_paths: documentosPaths,
        created_at: new Date().toISOString(),
      });

      if (dbError) throw dbError;

      setSuccess(true);
      setForm({
        condominio: '',
        apartamento: '',
        tipo: 'morador',
        cpf: '',
        nomeCompleto: '',
        telefone: '',
        email: user?.email || '',
        foto: null,
        documentos: [],
      });
      setPreviewPhoto(null);

      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar formulário');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/tools" className="text-blue-400 hover:text-blue-300 mb-4 inline-flex items-center">
            ← Voltar às ferramentas
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Cadastro de Condomínio</h1>
          <p className="text-slate-400">Preencha as informações abaixo para se registrar</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
            Cadastro realizado com sucesso! Seus dados foram salvos.
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm shadow-xl">
          {/* Row 1: Condomínio e Apartamento */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="condominio" className="block text-sm font-medium text-slate-300 mb-2">
                Condomínio *
              </label>
              <select
                id="condominio"
                name="condominio"
                value={form.condominio}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
              >
                <option value="">Selecione um condomínio</option>
                {condominiosDisponiveis.map((cond) => (
                  <option key={cond.id} value={cond.id}>
                    {cond.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="apartamento" className="block text-sm font-medium text-slate-300 mb-2">
                Apartamento/Unidade *
              </label>
              <input
                type="text"
                id="apartamento"
                name="apartamento"
                value={form.apartamento}
                onChange={handleInputChange}
                required
                placeholder="Ex: 301, 102A"
                className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* Row 2: Tipo de Residente */}
          <div className="mb-6">
            <label htmlFor="tipo" className="block text-sm font-medium text-slate-300 mb-2">
              Tipo de Residente *
            </label>
            <select
              id="tipo"
              name="tipo"
              value={form.tipo}
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
            >
              <option value="morador">Morador</option>
              <option value="locatario">Locatário</option>
              <option value="dependente">Dependente</option>
            </select>
          </div>

          {/* Row 3: CPF e Nome */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-slate-300 mb-2">
                CPF *
              </label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={form.cpf}
                onChange={handleInputChange}
                required
                placeholder="000.000.000-00"
                className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label htmlFor="nomeCompleto" className="block text-sm font-medium text-slate-300 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                id="nomeCompleto"
                name="nomeCompleto"
                value={form.nomeCompleto}
                onChange={handleInputChange}
                required
                placeholder="Seu nome completo"
                className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>
          </div>

          {/* Row 4: Telefone e Email */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-slate-300 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                id="telefone"
                name="telefone"
                value={form.telefone}
                onChange={handleInputChange}
                placeholder="(00) 00000-0000"
                className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                disabled
                className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Foto de Perfil
            </label>
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-2 border border-white/10 rounded-lg text-white hover:bg-slate-900/50 transition"
                >
                  Selecionar Foto
                </button>
              </div>
              {form.foto && (
                <div className="text-sm text-slate-400 py-2">{form.foto.name}</div>
              )}
            </div>
            {previewPhoto && (
              <img
                src={previewPhoto}
                alt="Preview"
                className="mt-4 w-32 h-32 object-cover rounded-lg"
              />
            )}
          </div>

          {/* Documents Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Documentos (PDFs)
            </label>
            <input
              ref={documentInputRef}
              type="file"
              accept=".pdf"
              multiple
              onChange={handleDocumentsSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => documentInputRef.current?.click()}
              className="w-full px-4 py-2 border border-white/10 rounded-lg text-white hover:bg-slate-900/50 transition"
            >
              Adicionar PDFs
            </button>

            {form.documentos.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-slate-400">{form.documentos.length} documento(s) selecionado(s)</p>
                {form.documentos.map((doc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-slate-900/50 rounded border border-white/10"
                  >
                    <span className="text-sm text-slate-300">📄 {doc.name}</span>
                    <button
                      type="button"
                      onClick={() => removeDocument(idx)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : 'Enviar Cadastro'}
          </button>
        </form>
      </div>
    </div>
  );
}
