# Documentação Técnica - Área de Cliente

## API Endpoints & Hooks

### `useAuth()` Hook

```typescript
const { user, loading, signUp, signIn, signOut } = useAuth();
```

**Propriedades:**
- `user` - Objeto do usuário autenticado (null se não autenticado)
- `loading` - Boolean indicando se ainda está carregando
- `signUp(email, password)` - Cria nova conta
- `signIn(email, password)` - Faz login
- `signOut()` - Faz logout

**Exemplo:**
```typescript
const { signIn } = useAuth();
const result = await signIn('user@example.com', 'password123');
if (result.error) {
  console.error(result.error);
}
```

---

## Supabase Schemas

### Tabela: `condominio_registrations`

```sql
CREATE TABLE condominio_registrations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  condominio VARCHAR(255),          -- ID do condomínio
  apartamento VARCHAR(50),          -- Número/letra da unidade
  tipo_residente VARCHAR(20),       -- morador|locatario|dependente
  cpf VARCHAR(11) UNIQUE,           -- Sem formatação (11 dígitos)
  nome_completo VARCHAR(255),       -- Nome do residente
  telefone VARCHAR(11),             -- Sem formatação
  email VARCHAR(255),               -- Email
  foto_path VARCHAR(255),           -- Caminho no storage
  documentos_paths TEXT[],          -- Array de caminhos
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Storage Bucket: `client-documents`

Estrutura de diretórios:
```
client-documents/
└── {user_id}/
    ├── photo/
    │   └── {filename}
    └── documents/
        └── {filename}.pdf
```

---

## Row Level Security (RLS) Policies

Todas as operações (SELECT, INSERT, UPDATE, DELETE) requerem que `auth.uid() == user_id`.

**Isso significa:** Usuários só conseguem ver/modificar seus próprios registros.

---

## Fluxo de Upload de Arquivo

1. **Validação Cliente**:
   - Foto: `.startsWith('image/')` && `size <= 5MB`
   - PDF: `type === 'application/pdf'` && `size <= 10MB`

2. **Upload para Storage**:
   ```typescript
   await supabase.storage
     .from('client-documents')
     .upload(path, file)
   ```

3. **Salvar Referência no Banco**:
   ```typescript
   await supabase
     .from('condominio_registrations')
     .insert({ ..., foto_path, documentos_paths })
   ```

---

## Fluxo de Autenticação

```
1. Usuário acessa /client/login
   ↓
2. Layout (client) verifica se está autenticado
   ├─ Sim → renderiza página
   └─ Não → redireciona para /client/login
   ↓
3. Usuário faz login com email + senha
   ↓
4. useAuth chama supabase.auth.signInWithPassword()
   ↓
5. Supabase retorna session com user
   ↓
6. Redireciona para /client/tools
   ↓
7. Layout atualiza context, renderiza dashboard
```

---

## Formatação de Dados

### CPF
- Input: `12345678901` → Display: `123.456.789-01`
- Storage: sempre sem formatação (`12345678901`)
- Validação: 11 dígitos exatos

### Telefone
- Input: `1199999999` → Display: `(11) 99999-9999`
- Storage: sempre sem formatação (`1199999999`)
- Validação: 10-11 dígitos

---

## Tratamento de Erros

### Tipo: `{ error: string | null }`

```typescript
const { error } = await signIn(email, password);

if (error) {
  // error pode ser:
  // - "Invalid login credentials"
  // - "Email not confirmed"
  // - "User not found"
  // - Custom error messages
}
```

---

## Performance & Otimizações

✅ Índices em:
- `user_id` - Para queries rápidas por usuário
- `cpf` - Para verificações de duplicatas
- `created_at` - Para listagens ordenadas

✅ Lazy loading de imagens

✅ Validação cliente antes de enviar

✅ Proteção de rota no layout (sem renderização de página antes de verificar auth)

---

## Segurança - Checklist

- [x] Senhas salvas com bcrypt (Supabase padrão)
- [x] Session tokens JWT automáticos
- [x] RLS policies em todas as tabelas
- [x] Validação de tipo de arquivo
- [x] Limite de tamanho de arquivo
- [x] Proteção contra upload traversal (Supabase gerencia)
- [x] CPF armazenado sem formatação (reduz espaço)
- [x] Usuários não conseguem modificar dados de outros

### Recomendações Futuras

- Criptografia de CPF com chave mestra
- Hash de email para verificação de duplicatas
- Audit log para todas as alterações
- Rate limiting em endpoints
- 2FA (autenticação de dois fatores)
- Biometria para mobile (se implementar app)

---

## Variáveis de Ambiente

```env
# Públicas (seguro expor no browser)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

# Privadas (servidor apenas - não usar)
# Quando necessário adicionar admin key:
# SUPABASE_SERVICE_ROLE_KEY
```

⚠️ **Importante**: `NEXT_PUBLIC_*` são públicas por design. Não coloque secrets aqui.

---

## Testing

Para testar manualmente:

1. **Sign Up novo usuário**
   ```
   Email: test@example.com
   Senha: TestPassword123!
   ```

2. **Login**
   ```
   Email: test@example.com
   Senha: TestPassword123!
   ```

3. **Preencher Formulário**
   - Selecionar condomínio
   - Preencher apartamento
   - Enviar foto (< 5MB, imagem)
   - Anexar PDFs (< 10MB cada)

4. **Verificar no Supabase**
   - SQL Editor: `SELECT * FROM condominio_registrations WHERE user_id = '{id}';`
   - Storage: Verificar arquivos em `client-documents`

---

## Deployment

### Vercel / Netlify

Adicionar variáveis de ambiente:
```
NEXT_PUBLIC_SUPABASE_URL = seu-url
NEXT_PUBLIC_SUPABASE_ANON_KEY = sua-chave
```

Build será automático, sem mudanças no código necessárias.

---

## Suporte e Debugging

### Enable Debug Logs
```typescript
// Em src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key, {
  auth: {
    debug: true, // Para ver logs de auth
  },
});
```

### Verificar Logs
- **Supabase Dashboard**: Authentication → Logs
- **Browser Console**: Network tab (requests para supabase)
- **Server Logs**: `npm run dev` output
