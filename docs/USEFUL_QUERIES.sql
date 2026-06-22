-- Queries úteis para gerenciar dados da área de cliente

-- 1. Ver todos os registros de um usuário específico
SELECT * FROM condominio_registrations 
WHERE user_id = 'uuid-do-usuario'
ORDER BY created_at DESC;

-- 2. Contar registros por condomínio
SELECT condominio, COUNT(*) as total 
FROM condominio_registrations
GROUP BY condominio
ORDER BY total DESC;

-- 3. Contar registros por tipo de residente
SELECT tipo_residente, COUNT(*) as total
FROM condominio_registrations
GROUP BY tipo_residente;

-- 4. Buscar registros entre datas
SELECT * FROM condominio_registrations
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY created_at DESC;

-- 5. Verificar registros sem documentos
SELECT id, nome_completo, email, documentos_paths
FROM condominio_registrations
WHERE documentos_paths IS NULL OR array_length(documentos_paths, 1) = 0;

-- 6. Registros incompletos (sem foto)
SELECT id, nome_completo, email, foto_path
FROM condominio_registrations
WHERE foto_path IS NULL;

-- 7. Deletar um registro específico (seguro com RLS)
DELETE FROM condominio_registrations
WHERE id = 123 AND user_id = auth.uid();

-- 8. Atualizar tipo de residente
UPDATE condominio_registrations
SET tipo_residente = 'morador'
WHERE id = 123 AND user_id = auth.uid();

-- 9. Buscar por CPF
SELECT * FROM condominio_registrations
WHERE cpf = '12345678901';

-- 10. Ver estatísticas gerais
SELECT 
  COUNT(*) as total_registros,
  COUNT(DISTINCT user_id) as usuarios_unicos,
  COUNT(DISTINCT condominio) as condominios,
  COUNT(CASE WHEN foto_path IS NOT NULL THEN 1 END) as com_foto,
  COUNT(CASE WHEN array_length(documentos_paths, 1) > 0 THEN 1 END) as com_documentos
FROM condominio_registrations;

-- 11. Registros criados hoje
SELECT * FROM condominio_registrations
WHERE created_at >= CURRENT_DATE
ORDER BY created_at DESC;

-- 12. Usuários ativos (com login recente)
SELECT DISTINCT user_id, MAX(created_at) as ultimo_registro
FROM condominio_registrations
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY user_id
ORDER BY ultimo_registro DESC;

-- 13. Exportar dados para análise (sem dados sensíveis)
SELECT 
  condominio,
  apartamento,
  tipo_residente,
  created_at
FROM condominio_registrations
ORDER BY created_at DESC;

-- 14. Listar certificados faltantes (sem foto ou documentos)
SELECT 
  id,
  nome_completo,
  email,
  CASE 
    WHEN foto_path IS NULL THEN 'Foto faltando'
    WHEN array_length(documentos_paths, 1) IS NULL THEN 'Documentos faltando'
    ELSE 'Completo'
  END as status
FROM condominio_registrations;

-- 15. Auditar mudanças (ver quando registros foram atualizados)
SELECT 
  id,
  nome_completo,
  created_at,
  updated_at,
  EXTRACT(EPOCH FROM (updated_at - created_at)) / 60 as minutos_ate_atualizacao
FROM condominio_registrations
WHERE updated_at > created_at
ORDER BY updated_at DESC;
