# Área de Cliente - Guia de Setup

## Resumo do que foi criado

✅ **Autenticação**: Sistema de login/signup com Supabase
✅ **Dashboard**: Página inicial com ferramentas disponíveis
✅ **Formulário de Cadastro de Condomínio**: Com validações e upload de arquivos
✅ **Segurança**: RLS policies, validação de arquivos, proteção de rotas

---

## 🚀 Passos para Ativar

### 1. Instalar Supabase

No terminal WSL/bash:
```bash
cd /home/adrianjasper/projects/maxintec-corporate-website
npm install @supabase/supabase-js
```

### 2. Configurar Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto ou use um existente
3. Copie as chaves do dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

### 3. Adicionar variáveis ao `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-aqui
```

### 4. Criar tabelas no Supabase

1. No dashboard do Supabase, vá para **SQL Editor**
2. Crie uma nova query
3. Cole o conteúdo de `docs/supabase-setup.sql`
4. Execute a query

### 5. Criar Storage Bucket

1. No dashboard, vá para **Storage**
2. Clique **Create new bucket**
3. Nome: `client-documents`
4. Deixe como Public (✓ Public bucket)
5. Clique **Create bucket**

### 6. Habilitar Email Authentication (opcional mas recomendado)

1. Vá para **Authentication** > **Providers**
2. Confirme que "Email" está habilitado
3. Configure templates de email em **Email Templates** se quiser

---

## 📁 Estrutura de Pastas Criadas

```
src/app/(client)/
├── layout.tsx                           # Proteção de rotas
├── login/page.tsx                       # Página de login
├── signup/page.tsx                      # Página de cadastro
└── tools/
    ├── page.tsx                         # Dashboard
    └── condominio-registration/
        └── page.tsx                     # Formulário principal

src/lib/
└── supabase.ts                          # Cliente Supabase

src/hooks/
└── useAuth.ts                           # Hook de autenticação

docs/
├── supabase-setup.sql                   # Schema e RLS policies
└── client-setup.md                      # Documentação completa
```

---

## 🔐 Segurança Implementada

✅ **Row Level Security**: Usuários só veem seus próprios dados
✅ **Validação de CPF**: 11 dígitos obrigatórios
✅ **Validação de Arquivo**:
   - Fotos: apenas imagens, máx 5MB
   - Documentos: apenas PDFs, máx 10MB
✅ **Proteção de Rota**: Não autenticados redirecionam para login
✅ **Formatação Automática**: CPF (000.000.000-00) e Telefone ((00) 00000-0000)

---

## 📝 Formulário de Cadastro - Campos

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| Condomínio | Select | Sim | Lista pré-preenchida |
| Apartamento | Text | Sim | Texto livre |
| Tipo de Residente | Select | Sim | morador/locatário/dependente |
| CPF | Text | Sim | 11 dígitos (formatado) |
| Nome Completo | Text | Sim | Texto livre |
| Telefone | Text | Não | Formatado automaticamente |
| Email | Text | Não | Preenchido do usuário logado |
| Foto | File | Não | Imagem < 5MB |
| Documentos | File | Não | PDFs < 10MB (múltiplos) |

---

## 🔗 URLs de Acesso

- **Login**: `http://localhost:3000/client/login`
- **Sign Up**: `http://localhost:3000/client/signup`
- **Dashboard**: `http://localhost:3000/client/tools`
- **Formulário**: `http://localhost:3000/client/tools/condominio-registration`

---

## 📊 Dados Armazenados

No Supabase, tabela `condominio_registrations`:
- `id` - Identificador único
- `user_id` - ID do usuário autenticado
- `condominio` - Código do condomínio
- `apartamento` - Número/letra da unidade
- `tipo_residente` - Tipo de residente
- `cpf` - CPF sem formatação (único)
- `nome_completo` - Nome do residente
- `telefone` - Telefone sem formatação
- `email` - Email do residente
- `foto_path` - Caminho do arquivo de foto no storage
- `documentos_paths` - Array de caminhos dos PDFs
- `created_at` - Data de criação
- `updated_at` - Data da última atualização

---

## 🛠️ Próximas Melhorias

Sugestões para adicionar depois:

- [ ] Email de confirmação ao registrar
- [ ] Dashboard admin para revisar/aprovar registros
- [ ] Notificações por email
- [ ] Verificação automática de documentos
- [ ] Rate limiting em uploads
- [ ] Criptografia de CPF na base de dados
- [ ] Integração com WhatsApp para notificações
- [ ] Exportar registros para PDF/Excel
- [ ] Histórico de alterações
- [ ] Múltiplas ferramentas/formulários adicionais

---

## ⚠️ Troubleshooting

**Erro: "Missing Supabase environment variables"**
- Verifique se `.env.local` existe com as variáveis corretas

**Erro: "SUPABASE_URL is not defined"**
- Restart o dev server: `npm run dev`

**Upload falhando**
- Confirme que bucket `client-documents` é PUBLIC
- Verifique tamanho do arquivo (max 5MB fotos, 10MB PDFs)

**Usuário não consegue fazer login**
- Confirme que email está verificado no Supabase
- Verifique se usuário foi criado com sucesso
- Veja logs em **Authentication** > **Logs** no dashboard

---

## 💡 Design System

Seguindo o design do site:
- **Cores**: Azul (#16569B), Slate backgrounds, Green accents
- **Tipografia**: Sistema de scales responsivo
- **Componentes**: Cards com borders white/10, dark mode completo
- **Efeitos**: Shadows sutis, transitions suaves, hover states

---

Tudo pronto! 🎉
