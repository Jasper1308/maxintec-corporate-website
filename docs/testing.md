# Estratégia de testes

## Objetivo

A suíte protege comportamentos cujo rompimento teria impacto real: autenticação, encerramento de loading, permissões visuais, cadastros, chamados e componentes reutilizados. Coverage é um indicador secundário, não o objetivo.

Termos usados neste projeto:

- **Implementado**: código ou teste existe no repositório.
- **Executado**: o comando foi realmente iniciado no ambiente informado.
- **Aprovado**: a execução terminou com código zero e todas as asserções passaram.
- **Preparado, não executado**: estrutura existe, mas depende de infraestrutura ou secrets ausentes.

## Pirâmide adotada

1. **Unitários**: funções puras, labels, transformação de documentos, mensagens de erro e matriz de navegação.
2. **Componentes**: comportamento observável com React Testing Library; Supabase e actions são mockados nas fronteiras.
3. **Integração de banco**: RLS, RPCs e Storage contra banco descartável. Ainda bloqueada; consulte `security-testing.md`.
4. **E2E**: quatro jornadas pequenas de autenticação e roles com Playwright, exclusivamente contra Supabase de testes.

## Estrutura

```text
src/**/*.test.ts(x)          # unitários e componentes próximos ao código
tests/mocks/supabase.ts      # mock central da fronteira Supabase
tests/e2e/                   # jornadas Playwright
tests/rls/                   # status e futura suíte de integração
vitest.config.mts
playwright.config.ts
```

O mock central permite controlar autenticação, query builder, insert/update, RPC, Storage e Realtime sem acessar rede. Prefira mockar funções de domínio (`createTicket`, `submitRegistration`) nos testes de componente e usar o mock Supabase apenas quando a própria fronteira é o objeto do teste.

## Comandos

```bash
npm run test          # suíte unitária/componente uma vez
npm run test:unit     # equivalente direto do Vitest
npm run test:watch    # desenvolvimento interativo
npm run test:coverage # suíte + relatório e thresholds
npm run test:e2e      # Playwright
npm run typecheck
npm run lint
npm run build
```

O relatório HTML de coverage é gerado em `coverage/index.html` e permanece ignorado pelo Git.

## Coverage

O coverage é deliberadamente limitado ao escopo crítico inicialmente testado. Gates atuais:

| Métrica | Threshold |
|---|---:|
| Statements | 70% |
| Branches | 60% |
| Functions | 70% |
| Lines | 70% |

Ao adicionar um arquivo ao escopo crítico, inclua-o em `coverage.include` e escreva testes comportamentais antes de elevar thresholds.

## Matriz de permissões

Esta matriz valida UI e navegação. Segurança real continua sendo responsabilidade das policies/RPCs no banco.

| Capacidade | Resident | Manager | Admin |
|---|:---:|:---:|:---:|
| Meu cadastro | ✅ | ✅ | ✅ |
| Abrir chamado | ✅ | ✅ | ✅ |
| Ver próprios chamados | ✅ | ✅ | ✅ |
| Ver chamados do condomínio | ❌ | ✅ | ✅ |
| Aprovar cadastro | ❌ | ✅ | ✅ |
| Rejeitar cadastro | ❌ | ✅ | ✅ |
| Ver moradores | ❌ | ✅ | ✅ |
| Ver condomínios administrativos | ❌ | ❌ | ✅ |
| Ver auditoria | ❌ | ❌ | ✅ |

`src/config/portal-navigation.test.ts` protege a parcela dessa matriz representada pela navegação atual.

## Autenticação

Os testes do `AuthProvider` cobrem:

- inicialização sem usuário;
- restauração de sessão com profile e memberships;
- cálculo de admin, manager e resident;
- memberships não aprovadas;
- falha individual de profile ou memberships;
- mudanças rápidas de sessão, mantendo somente a identidade mais recente;
- evento de logout e logout explícito;
- regressão de loading infinito: em todos os caminhos, `loading` retorna a `false`.

## E2E local

1. Copie `.env.test.example` para `.env.test`.
2. Use somente um projeto Supabase exclusivo de testes ou Supabase local.
3. Crie usuários determinísticos para resident A, manager A e admin.
4. Instale o browser uma vez:

   ```bash
   npx playwright install chromium
   ```

5. Execute `npm run test:e2e`.

Sem credenciais, os quatro testes são descobertos e marcados como skipped. Isso valida a configuração, mas **não valida os fluxos**.

Nunca reutilize `.env.local` de produção para E2E destrutivo.

## E2E no GitHub Actions

O job de qualidade sempre roda. O job E2E só instala browser e executa testes quando todos estes secrets estiverem presentes:

- `E2E_SUPABASE_URL`
- `E2E_SUPABASE_ANON_KEY`
- `E2E_RESIDENT_EMAIL`
- `E2E_RESIDENT_PASSWORD`
- `E2E_MANAGER_EMAIL`
- `E2E_MANAGER_PASSWORD`
- `E2E_ADMIN_EMAIL`
- `E2E_ADMIN_PASSWORD`

Os secrets devem apontar para um projeto descartável de testes, nunca produção.

## Como adicionar testes

- Nomeie pelo comportamento, não pelo método interno.
- Teste resultado visível, payload na fronteira e estados de erro/loading.
- Não replique implementação no teste.
- Evite snapshots grandes.
- Use fixtures sintéticas com domínio `.example.test`.
- Se o teste precisa de banco, declare explicitamente qual ambiente será modificado e como será resetado.
- Uma falha de RLS deve permanecer visível; não enfraqueça a policy para fazê-la passar.
