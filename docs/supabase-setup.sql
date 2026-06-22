-- Tabela para registros de condomínios
-- Execute esta query no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS condominio_registrations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  condominio VARCHAR(255) NOT NULL,
  apartamento VARCHAR(50) NOT NULL,
  tipo_residente VARCHAR(20) NOT NULL CHECK (tipo_residente IN ('morador', 'locatario', 'dependente')),
  cpf VARCHAR(11) NOT NULL UNIQUE,
  nome_completo VARCHAR(255) NOT NULL,
  telefone VARCHAR(11),
  email VARCHAR(255),
  foto_path VARCHAR(255),
  documentos_paths TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_condominio_registrations_user_id ON condominio_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_condominio_registrations_cpf ON condominio_registrations(cpf);
CREATE INDEX IF NOT EXISTS idx_condominio_registrations_created_at ON condominio_registrations(created_at);

-- Habilitar Row Level Security
ALTER TABLE condominio_registrations ENABLE ROW LEVEL SECURITY;

-- Política para usuários só poderem ver seus próprios registros
CREATE POLICY "Users can view their own registrations"
ON condominio_registrations FOR SELECT
USING (auth.uid() = user_id);

-- Política para usuários poderem inserir seus próprios registros
CREATE POLICY "Users can insert their own registrations"
ON condominio_registrations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política para usuários poderem atualizar seus próprios registros
CREATE POLICY "Users can update their own registrations"
ON condominio_registrations FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política para usuários poderem deletar seus próprios registros
CREATE POLICY "Users can delete their own registrations"
ON condominio_registrations FOR DELETE
USING (auth.uid() = user_id);
