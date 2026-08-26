# Configuração manual do Supabase para o Portal

Nada descrito neste documento foi aplicado automaticamente. Faça primeiro em um projeto descartável, revise os resultados e só depois planeje produção.

## 1. Migration

Revisar e aplicar manualmente, na ordem normal das migrations:

`supabase/migrations/20260826000000_portal_base_completion.sql`

Ela é aditiva: inclui colunas, tabelas, índices, validações, operações administrativas, automações, regras de acesso e dois buckets privados. Não há remoção de tabelas ou de registros de negócio.

Antes da aplicação, confira se as tabelas já existentes possuem as colunas usadas nos registros de atividade e notificações. Faça backup e execute a migration primeiro em ambiente temporário.

## 2. Buckets privados

A migration cria/configura:

- `avatars`: JPG, PNG e WebP, máximo de 2 MB; caminho `<user_id>/<uuid>.<ext>`.
- `ticket-attachments`: JPG, PNG, WebP e PDF, máximo de 10 MB; caminho `<ticket_id>/<user_id>/<uuid>.<ext>`.

Os buckets permanecem privados. Não transforme arquivos em públicos e não use URLs públicas para esses conteúdos.

## 3. Edge Function de convite

Código: `supabase/functions/invite-manager/index.ts`.

Configurar no ambiente da função:

- `PORTAL_SITE_URL`: origem canônica do portal, por exemplo `https://portal.exemplo.com`.
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`: normalmente fornecidas pelo próprio ambiente de execução do Supabase.

Publicar manualmente a função somente depois de aplicar e validar a migration. Não exponha a credencial administrativa em variáveis `NEXT_PUBLIC_*` nem no hosting do frontend.

A função usa exclusivamente o e-mail nativo do Supabase Auth. Ela valida o token do solicitante, confere o papel administrativo no servidor, fixa o redirecionamento em `PORTAL_SITE_URL/accept-invite` e recusa conta duplicada.

## 4. URLs de autenticação

No Dashboard do Supabase, em Authentication > URL Configuration:

1. Defina a Site URL com a origem real do portal.
2. Adicione às Redirect URLs as origens permitidas para:
   - `/reset-password`
   - `/accept-invite`
3. Inclua a URL local apenas nos ambientes de desenvolvimento que realmente a utilizam.

Como o portal usa exportação estática, essas rotas são páginas cliente e o hosting deve servir seus arquivos exportados normalmente.

## 5. E-mails nativos

Revisar no Dashboard os modelos de:

- convite de usuário;
- recuperação de senha;
- confirmação de conta, se habilitada.

Os links precisam preservar o redirecionamento informado pelo portal/função. Teste convite, reenvio, link expirado, identidade divergente e recuperação de senha.

O registro de convite foi preparado com validade de uma hora, acompanhando o valor padrão atual de expiração dos links de e-mail do Supabase. Se `Email OTP Expiration` for alterado no Dashboard, revise também esse intervalo na migration antes de aplicá-la.

O provedor nativo é suficiente para desenvolvimento e validação desta fase. Para produção, recomenda-se SMTP próprio por confiabilidade, branding e limites de envio; isso é hardening futuro e não faz parte desta entrega.

## 6. Validação recomendada

Após a configuração manual:

1. Criar um administrador de teste e conferir `profiles.global_role = admin`.
2. Cadastrar um condomínio e blocos.
3. Associar uma conta existente como gestor, suspender e reativar.
4. Convidar um novo e-mail, ativar a conta e aceitar o convite.
5. Testar recuperação e troca de senha.
6. Enviar/remover imagem de perfil.
7. Abrir chamado com anexos e testar leitura como solicitante, gestor, administrador e usuário sem acesso.
8. Confirmar os registros de atividade e notificações.
9. Conferir que nenhum bucket está público.

## 7. Itens não configurados

- Nenhuma migration remota foi executada.
- Nenhuma Edge Function foi publicada.
- Nenhum segredo foi criado ou alterado.
- Nenhum serviço externo, Google OAuth ou SMTP externo foi configurado.
- Login com Google permanece futuro e dependente de configuração externa.
