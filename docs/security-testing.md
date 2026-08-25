# Testes de segurança, RLS, RPC e Storage

## Estado atual

Status: **preparado, não executado**.

Na auditoria deste repositório não foram encontrados:

- `supabase/config.toml`;
- migrations versionadas do schema atual;
- seed determinístico;
- Supabase CLI instalado;
- Docker disponível no ambiente.

O único SQL versionado, `docs/supabase-setup.sql`, representa uma versão antiga e parcial do cadastro. Ele não contém o schema/RLS/RPC/trigger atual do MVP e não pode ser usado como fonte de verdade para afirmar segurança.

## Pré-requisitos para tornar a suíte executável

1. Versionar o schema atual em `supabase/migrations/` sem editar retroativamente o histórico aplicado.
2. Adicionar `supabase/config.toml` e seed exclusivamente sintético.
3. Instalar Supabase CLI e Docker no ambiente local/CI.
4. Confirmar que `supabase db reset` recria o MVP completo.
5. Criar usuários de teste determinísticos sem emails, CPFs ou documentos reais.
6. Executar assertions com sessões reais de cada ator, nunca com `service_role` para a operação testada.

## Fixtures determinísticas

| Fixture | Identidade |
|---|---|
| Condominium A | `00000000-0000-4000-8000-00000000000a` |
| Condominium B | `00000000-0000-4000-8000-00000000000b` |
| Admin | `admin@example.test` |
| Manager A | `manager-a@example.test` |
| Resident A | `resident-a@example.test` |
| Resident B | `resident-b@example.test` |

Senhas devem vir do ambiente ou ser criadas durante seed local; nunca devem ser commitadas.

## Casos RLS obrigatórios

### Resident A

- lê apenas os próprios cadastros permitidos;
- não lê cadastro do Resident B;
- não lê chamado privado de B;
- não lê `audit_logs`;
- não executa `approve_registration` ou `reject_registration`;
- não altera condomínio, membership ou chamado fora da própria permissão;
- não atualiza notification de outro usuário usando ID arbitrário.

### Manager A

- lê moradores aprovados do Condominium A;
- não lê moradores do Condominium B;
- lê e atualiza somente chamados permitidos de A;
- aprova/rejeita cadastro permitido de A;
- não administra B;
- não lê auditoria administrativa global.

### Admin

- lê as visões administrativas autorizadas pelas policies atuais;
- executa workflows administrativos previstos;
- não ganha acesso a objetos que a policy explicitamente exclui.

Cada teste negativo deve consultar/alterar um ID existente de outro condomínio. Um resultado vazio também precisa ser distinguido de erro para evitar falso positivo.

## RPCs

Para `approve_registration(p_registration_id)`:

- resident recebe erro de permissão;
- manager B não aprova cadastro de A;
- manager A/admin permitido altera `status` para `approved`;
- membership esperado é criado ou atualizado uma única vez;
- reexecução respeita a regra de idempotência definida;
- audit log e notification são validados se triggers atuais os criarem.

Para `reject_registration(p_registration_id, p_reason)`:

- motivo vazio é rejeitado;
- ator sem permissão recebe erro;
- status final, `rejected_at` e motivo normalizado são persistidos;
- audit log/notification são validados quando aplicável.

Não execute essas RPCs em produção durante testes.

## Storage privado

Bucket esperado: `client-documents`, sempre privado.

- usuário autorizado envia arquivo dentro do próprio prefixo;
- tipo e tamanho inválidos são recusados pela fronteira confiável/policy disponível;
- Resident A não lê nem cria signed URL para caminho de B;
- manager acessa somente documentos de cadastros do condomínio permitido;
- uma URL pública direta não funciona;
- signed URL é emitida apenas após a policy autorizar e usa TTL curto;
- remoção/cleanup não permite paths arbitrários de terceiro.

O frontend usa signed URL de 5 minutos, um TTL adequado. A autorização ainda precisa ser provada pela policy local.

## Auditoria estática do frontend

### CRÍTICO

Nenhum achado confirmado.

### ALTO

1. **RLS/RPC/Storage atuais não estão versionados nem reproduzíveis.** Impacto: não é possível provar isolamento entre condomínios ou detectar regressões no CI. Recomendação: versionar migrations e seed antes de qualquer alteração de policy.
2. **Documentação antiga instruía tornar `client-documents` público.** Impacto potencial: exposição de documentos privados se seguida. A instrução foi corrigida nesta fase; o estado remoto ainda deve ser conferido manualmente.

### MÉDIO

1. Queries e actions recebem IDs (`userId`, `ticketId`, `notificationId`, paths) e dependem integralmente de RLS/Storage policies. Isso é arquiteturalmente aceitável, mas sem a suíte local permanece um risco de IDOR não verificado.
2. Tipo/tamanho de upload são validados no componente, não em uma fronteira server-side. Com `output: export`, a proteção confiável precisa existir nas policies/restrições do Storage.
3. `docs/supabase-setup.sql` permite update/delete do próprio cadastro e não representa o workflow/status atual. Não aplicar esse arquivo em um ambiente moderno sem revisão/migration formal.
4. Erros Supabase completos são enviados a `console.error` no browser. Não foi identificado log explícito de JWT, mas mensagens futuras podem conter detalhes operacionais. Recomenda-se sanitização central em uma etapa separada.

### BAIXO

1. `dangerouslySetInnerHTML` aparece somente no bootstrap de GTM com ID vindo de variável controlada no build. Não há entrada de usuário, mas deve continuar restrito a configuração confiável.

### INFORMATIVO

- Nenhum `service_role`, JWT, senha ou chave privada está versionado no frontend.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` é pública por design; segurança deve vir de RLS.
- `.env.local` e `.env.test` permanecem ignorados pelo Git.
- Não há uso de `createPublicUrl`; documentos usam `createSignedUrl` com TTL de 300 segundos.

## Regra de resposta a falhas

Se um teste demonstrar falha de RLS/RPC/trigger, mantenha a evidência, classifique o impacto e proponha migration separada. Não altere policy automaticamente e nunca use `service_role` para mascarar a falha.

## Auditoria de dependências

`npm audit fix` sem `--force` atualizou três dependências transitivas de tooling e removeu os achados em `brace-expansion` e `js-yaml`.

Permanecem três vulnerabilidades altas agrupadas no Next.js 16.1.6 e suas dependências internas `postcss`/`sharp`. O npm propõe Next 16.3.3, fora do range atual. O upgrade não foi aplicado automaticamente; deve ocorrer em branch própria, seguido por lint, typecheck, testes, build e regressão visual/E2E.
