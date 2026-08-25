# Revisão inicial de performance

Esta fase apenas identifica riscos. Nenhuma otimização de dados ou arquitetura foi aplicada.

| Prioridade | Problema | Impacto provável | Recomendação |
|---|---|---|---|
| Alta | Cadastros, moradores e chamados carregam listas completas sem paginação. | Tempo de resposta, memória e payload crescem linearmente; telas administrativas degradam primeiro. | Definir paginação server-side/cursor preservando RLS e filtros. Medir volume antes de escolher tamanho de página. |
| Alta | Queries de cadastro trazem CPF, paths e relação de arquivos para todas as linhas. | Payload sensível e pesado mesmo quando a lista usa poucos campos. | Separar select de resumo e select de detalhe, depois de testes RLS específicos. |
| Média | `getTickets` carrega tickets e depois executa queries adicionais de condomínios e profiles. | São três requests por carga; não é N+1, mas adiciona latência. | Avaliar join seguro ou view/RPC após medir e validar policies das relações. |
| Média | `getTicketEvents` faz uma segunda query para profiles em cada abertura de modal. | Latência perceptível em histórico e repetição ao reabrir chamado. | Medir cache curto por profile ou relação segura no select. |
| Média | Inicialização do AuthProvider pode receber `getUser` e `INITIAL_SESSION` próximos. | Requests de identidade podem ser iniciados/cancelados; a proteção de request evita estado obsoleto, mas não necessariamente tráfego duplicado. | Instrumentar contagem de requests antes de refatorar. O teste atual protege apenas correção/loading. |
| Média | `public/videos/bg.mp4` possui cerca de 3,35 MB; `equipe.png`, 1,6 MB; `bombeiro.png`, 0,91 MB. | LCP, dados móveis e cache inicial do site institucional. | Medir Lighthouse/WebPageTest e gerar variantes responsivas/codec moderno em tarefa própria. |
| Baixa | Grande parte do portal é client component. | Bundle e hidratação maiores. | Manter por enquanto devido ao cliente Supabase; avaliar extração somente de conteúdo estático após análise de bundle. |
| Baixa | Dashboard realiza nove consultas paralelas de contagem. | Paralelismo reduz latência, mas aumenta quantidade de requests. | Medir; considerar uma RPC agregada somente se houver ganho e com testes de permissão. |

## Pontos positivos encontrados

- Dashboard usa `Promise.all`, evitando sequência desnecessária.
- Tickets enriquecem dados em lotes, não em N+1 por item.
- Auditoria limita resultados a no máximo 100.
- Notificações limitam a lista inicial e removem o canal Realtime no cleanup.
- Signed URL de documentos usa TTL curto de cinco minutos.

## Próxima medição recomendada

1. Capturar volume real anonimizado por tabela.
2. Medir requests/payload das rotas principais para cada role.
3. Rodar Lighthouse nas páginas públicas e analisar bundle do portal.
4. Definir SLO inicial de carregamento antes de alterar queries.
5. Implementar paginação começando por moradores, cadastros e chamados, acompanhada de testes RLS.
