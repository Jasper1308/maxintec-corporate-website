# Fechamento do Portal Base

Data da preparação: 26 de agosto de 2026.

Esta entrega fecha os fluxos-base com Next.js estático e recursos nativos do Supabase. A migration e a Edge Function foram apenas preparadas no repositório: não foram aplicadas ou publicadas.

## Fluxos entregues

- Condomínio completo: dados cadastrais, endereço, contato, situação, observações internas e código ERP. O identificador de URL é gerado no banco e não aparece na interface.
- Central do condomínio: indicadores, dados gerais, blocos/torres, gestores, convites e atividade.
- Blocos/torres: inclusão, edição, desativação e reativação sem exclusão física.
- Gestores: busca de conta existente, associação confirmada, suspensão e reativação.
- Convites: ciclo `pending`, `accepted`, `revoked` e `expired`, envio nativo pelo Supabase Auth, reenvio, revogação e aceite com conferência do e-mail autenticado.
- Conta: recuperação de senha, definição de nova senha e troca de senha autenticada. O e-mail é exibido como informação e não pode ser alterado nesse fluxo.
- Perfil: nome, telefone, imagem privada e associações por condomínio. A imagem do perfil é separada da foto cadastral.
- Chamados: até cinco imagens/PDFs privados de 10 MB por chamado, com acesso temporário no detalhe. Falhas parciais não apagam o chamado.
- Privacidade: ciência obrigatória no cadastro residencial, versão registrada e horário atribuído no banco, além de página pública inicial.
- Auditoria: condomínio, blocos, mudanças de gestor e convites relevantes são registrados pelo banco.

## Decisões operacionais

A retirada do acesso de gestor usa `status = suspended`. O vínculo e seu histórico permanecem disponíveis e podem ser reativados; não há exclusão física nem conversão automática para morador.

O envio de convites ocorre somente na Edge Function `invite-manager`. A aplicação web não possui credencial administrativa nem usa administração de contas diretamente.

Os testes de fronteira usam mocks e inspeção de código para provar a separação cliente/servidor. Eles não substituem testes de autorização contra uma instância local ou temporária do Supabase.

## Revisões antes de produção

- Revisar a migration com o modelo real de `audit_logs`, `notifications`, `ticket_events` e `condominium_memberships`.
- Confirmar e tratar eventuais CNPJs ou nomes de blocos duplicados existentes. A migration preserva esses registros e impede novos conflitos pelas operações administrativas.
- Validar permissões com usuários reais de cada papel em um projeto descartável.
- Fazer revisão administrativa/jurídica da Política de Privacidade.
- Definir retenção de convites, imagens, anexos e documentos cadastrais.

## Roadmap

Login com Google — **STATUS: FUTURO / BLOQUEADO POR CONFIGURAÇÃO EXTERNA**.

Também ficam para uma fase posterior integrações com ERP, monitoramento externo, consulta automática de CEP e qualquer serviço de terceiros.
