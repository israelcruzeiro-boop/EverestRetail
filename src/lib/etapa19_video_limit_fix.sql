-- ==========================================
-- ETAPA 19: AJUSTE DE LIMITE DIÁRIO
-- ==========================================

-- Remover o índice que impedia assistir o MESMO vídeo mais de uma vez por dia
-- O controle agora é feito apenas pela lógica do daily_limit no RPC/Repositório.
DROP INDEX IF EXISTS public.idx_video_views_daily_unique;

-- Nota: A tabela public.video_views continua registrando cada visualização.
-- O RPC complete_sponsored_video já valida o daily_limit da tabela sponsored_videos.
