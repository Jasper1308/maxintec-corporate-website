# Configuração da Área de Cliente

## 1. Variáveis de Ambiente

Adicionar ao `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-key
```

## 2. Setup no Supabase

### 2.1 Criar Bucket de Storage
- Ir para Storage no Supabase Dashboard
- Criar novo bucket chamado `client-documents`
- Configurar como Public para acesso aos arquivos

### 2.2 Executar SQL
- Copiar conteúdo de `docs/supabase-setup.sql`
- Colar no SQL Editor do Supabase Dashboard
- Executar para criar tabela com RLS policies

## 3. Estrutura de Rotas

### Autenticação
- `/client/login` - Página de login
- `/client/signup` - Página de cadastro
- Proteção: Layout em `(client)` redireciona não autenticados para login

### Ferramentas
- `/client/tools` - Dashboard com lista de ferramentas
- `/client/tools/condominio-registration` - Formulário de cadastro

## 4. Segurança Implementada

✅ Row Level Security (RLS) no Supabase
✅ Validação de arquivo (tipo e tamanho)
✅ CPF e Telefone formatados e validados
✅ Usuários só veem seus próprios dados
✅ Upload restrito a imagens (<5MB) e PDFs (<10MB)

## 5. Próximas Melhorias

- [ ] Email de confirmação
- [ ] Administrador dashboard para revisar registros
- [ ] Notificações por email ao enviar formulário
- [ ] Verificação de documento antes de aprovar
- [ ] Rate limiting nos uploads
- [ ] Criptografia de dados sensíveis

## 6. Instalação de Dependências

```bash
npm install @supabase/supabase-js
```

## 7. Estrutura de Pastas

```
src/
├── app/
│   └── (client)/
│       ├── layout.tsx (proteção de rota)
│       ├── login/
│       │   └── page.tsx
│       ├── signup/
│       │   └── page.tsx
│       └── tools/
│           ├── page.tsx (dashboard)
│           └── condominio-registration/
│               └── page.tsx
├── lib/
│   └── supabase.ts (cliente Supabase)
├── hooks/
│   └── useAuth.ts (gerenciamento de autenticação)
```
