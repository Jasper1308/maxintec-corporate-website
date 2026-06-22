'use client';

import { FormEvent, useState, ChangeEvent, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { condominiosDisponiveis } from '@/data/condominiumContent';
import { responsiveHeadings } from '@/data/typographyScale';

type ResidentType = 'morador' | 'locatario' | 'dependente';

interface FormData {
  condominio: string;
  bloco: string;
  apartamento: string;
  tipo: ResidentType;
  cpf: string;
  nomeCompleto: string;
  telefone: string;
  email: string;
  foto: File | null;
  documentos: File[];
}

export default function CondominioRegistrationPage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [availableBlocks, setAvailableBlocks] = useState<string[]>([]);

  const [form, setForm] = useState<FormData>({
    condominio: '',
    bloco: '',
    apartamento: '',
    tipo: 'morador',
    cpf: '',
    nomeCompleto: '',
    telefone: '',
    email: user?.email || '',
    foto: null,
    documentos: [],
  });

  // Atualiza a lista de blocos quando o condomínio muda
  useEffect(() => {
    const selectedCondo = condominiosDisponiveis.find(c => c.id === form.condominio);
    if (selectedCondo) {
      setAvailableBlocks(selectedCondo.blocks);
      setForm(prev => ({ ...prev, bloco: '' })); // Reseta o bloco anterior
    } else {
      setAvailableBlocks([]);
    }
  }, [form.condominio]);

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
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
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

      if (uploadError) throw uploadError;
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
    if (!form.condominio || !form.bloco || !form.apartamento || !form.cpf || !form.nomeCompleto) {
      setError('Preencha todos os campos obrigatórios');
      setLoading(false);
      return;
    }

    const cpfNumbers = form.cpf.replace(/\D/g, '');
    if (cpfNumbers.length !== 11) {
      setError('CPF inválido');
      setLoading(false);
      return;
    }

    const userId = user?.id;
    if (!userId) throw new Error('Usuário não autenticado');

    // Função auxiliar para limpar caracteres especiais e espaços do nome do arquivo
    const sanitizeFilename = (name: string) => {
      return name
        .normalize("NFD")                  // Separa os acentos das letras
        .replace(/[\u0300-\u036f]/g, "")   // Remove os acentos
        .replace(/[^a-zA-Z0-9.]/g, "_")    // Substitui espaços, hifens e símbolos por underline
        .replace(/_+/g, "_");              // Evita múltiplos underlines seguidos
    };

    // Upload da foto com nome limpo
    const fotoPath = form.foto
      ? await uploadFile(form.foto, `${userId}/photo/${Date.now()}-${sanitizeFilename(form.foto.name)}`)
      : null;

    // Upload dos documentos com nome limpo
    const documentosPaths: string[] = [];
    for (const doc of form.documentos) {
      const cleanName = sanitizeFilename(doc.name);
      const path = await uploadFile(doc, `${userId}/documents/${Date.now()}-${cleanName}`);
      if (path) documentosPaths.push(path);
    }

    // Salvar na tabela do Banco
    const { error: dbError } = await supabase.from('condominio_registrations').insert({
      user_id: userId,
      condominio: form.condominio,
      bloco: form.bloco,
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
      bloco: '',
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
    // Printa o erro completo no console do navegador para sabermos os detalhes técnicos
    console.error("Erro detalhado do formulário:", err);

    // Se o erro for do Supabase, ele costuma vir com err.message. 
    if (err instanceof Error) {
      setError(err.message);
    } else if (typeof err === 'object' && err !== null && 'message' in err) {
      setError((err as { message: string }).message);
    } else {
      setError(JSON.stringify(err) || 'Erro desconhecido ao enviar formulário');
    }
  } finally {
    setLoading(false);
  }
}

  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      {/* Seção Hero Superior Combinando com o Corporativo */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-slate-950 to-slate-900 py-16 sm:py-20">
        <div className="container mx-auto px-6 max-w-4xl">
          <Link href="/tools" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-white/20 hover:bg-white/10 mb-6">
            ← Voltar às ferramentas
          </Link>
          <span className="block text-xs uppercase tracking-[0.28em] text-blue-300 mb-2">Área de Identificação</span>
          <h1 className={`${responsiveHeadings.h2 || 'text-3xl sm:text-4xl font-bold'} text-white`}>
            Cadastro de Condomínio
          </h1>
          <p className="mt-3 text-slate-400 text-base max-w-xl">
            Insira suas informações residenciais e envie a documentação necessária para ativação do seu acesso na portaria tecnológica.
          </p>
        </div>
      </section>

      {/* Seção do Formulário */}
      <section className="container mx-auto px-6 max-w-4xl pb-24 -mt-8 relative z-10">
        {/* Alertas */}
        {success && (
          <div className="mb-6 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-green-400 backdrop-blur-md">
            ✨ Cadastro realizado com sucesso! Seus dados e arquivos foram salvos.
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-400 backdrop-blur-md">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-8 sm:p-10 shadow-2xl shadow-blue-950/20 backdrop-blur-xl space-y-8">
          
          {/* Seção 1: Localização */}
          <div>
            <h3 className="text-lg font-semibold text-blue-300 mb-4 pb-2 border-b border-white/5">1. Localização Residencial</h3>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="sm:col-span-1">
                <label htmlFor="condominio" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Condomínio *
                </label>
                <select
                  id="condominio"
                  name="condominio"
                  value={form.condominio}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition text-sm appearance-none"
                >
                  <option value="">Selecione...</option>
                  {condominiosDisponiveis.map((cond) => (
                    <option key={cond.id} value={cond.id}>{cond.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="bloco" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Bloco / Torre *
                </label>
                <select
                  id="bloco"
                  name="bloco"
                  value={form.bloco}
                  onChange={handleInputChange}
                  disabled={!form.condominio}
                  required
                  className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition text-sm disabled:opacity-40"
                >
                  <option value="">{form.condominio ? 'Selecione o Bloco...' : 'Aguardando condomínio...'}</option>
                  {availableBlocks.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="apartamento" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Apartamento / Unidade *
                </label>
                <input
                  type="text"
                  id="apartamento"
                  name="apartamento"
                  value={form.apartamento}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: 301, 104-B"
                  className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition text-sm"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Identificação Pessoal */}
          <div>
            <h3 className="text-lg font-semibold text-blue-300 mb-4 pb-2 border-b border-white/5">2. Informações do Residente</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label htmlFor="nomeCompleto" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  id="nomeCompleto"
                  name="nomeCompleto"
                  value={form.nomeCompleto}
                  onChange={handleInputChange}
                  required
                  placeholder="Nome sem abreviações"
                  className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition text-sm"
                />
              </div>

              <div>
                <label htmlFor="cpf" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
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
                  className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition text-sm"
                />
              </div>

              <div>
                <label htmlFor="tipo" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Vínculo com o Imóvel *
                </label>
                <select
                  id="tipo"
                  name="tipo"
                  value={form.tipo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition text-sm"
                >
                  <option value="morador">Morador Proprietário</option>
                  <option value="locatario">Locatário (Inquilino)</option>
                  <option value="dependente">Dependente / Familiar</option>
                </select>
              </div>

              <div>
                <label htmlFor="telefone" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Telefone / WhatsApp
                </label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={form.telefone}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition text-sm"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  E-mail de Contato
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={form.email}
                  disabled
                  className="w-full px-4 py-3 bg-slate-950/40 border border-white/5 rounded-xl text-slate-500 cursor-not-allowed text-sm"
                />
              </div>
            </div>
          </div>

          {/* Seção 3: Biometria Facial e Arquivos */}
          <div>
            <h3 className="text-lg font-semibold text-blue-300 mb-4 pb-2 border-b border-white/5">3. Identificação Facial e Documentos</h3>
            <div className="grid sm:grid-cols-2 gap-8">
              
              {/* Foto de Perfil */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Foto Cadastral (Portaria)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center border border-dashed border-white/15 rounded-2xl bg-slate-950/40 p-4 min-h-[140px] transition hover:border-blue-500/40">
                  {previewPhoto ? (
                    <div className="relative group w-24 h-24">
                      <img src={previewPhoto} alt="Preview" className="w-24 h-24 object-cover rounded-full border border-blue-500" />
                      <button type="button" onClick={() => { setForm(p => ({ ...p, foto: null })); setPreviewPhoto(null); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-80 hover:opacity-100">✕</button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex flex-col items-center gap-2 text-sm text-slate-400 hover:text-white transition"
                    >
                      <span className="text-2xl">📸</span>
                      <span>Escolher Imagem</span>
                    </button>
                  )}
                </div>
              </div>

              {/* PDFs */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Comprovantes / Contratos (PDF)
                </label>
                <input
                  ref={documentInputRef}
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleDocumentsSelect}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center border border-dashed border-white/15 rounded-2xl bg-slate-950/40 p-4 min-h-[140px] transition hover:border-blue-500/40">
                  <button
                    type="button"
                    onClick={() => documentInputRef.current?.click()}
                    className="inline-flex flex-col items-center gap-2 text-sm text-slate-400 hover:text-white transition"
                  >
                    <span className="text-2xl">📂</span>
                    <span>Anexar PDFs</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Lista de PDFs Selecionados */}
            {form.documentos.length > 0 && (
              <div className="mt-4 space-y-2 max-w-md">
                {form.documentos.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-xl border border-white/5 text-xs text-slate-300">
                    <span className="truncate max-w-[90%]">📄 {doc.name}</span>
                    <button type="button" onClick={() => removeDocument(idx)} className="text-red-400 hover:text-red-300 font-bold px-1">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botão de Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl transition shadow-lg shadow-blue-950/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processando Envio...' : 'Enviar Cadastro e Validar'}
            </button>
          </div>

        </form>
      </section>
    </main>
  );
}