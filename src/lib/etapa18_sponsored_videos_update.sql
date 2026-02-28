-- ==========================================
-- ETAPA 18: ATUALIZAÇÃO VÍDEOS PATROCINADOS
-- ==========================================

-- Adicionar coluna para link do patrocinador
ALTER TABLE public.sponsored_videos 
ADD COLUMN IF NOT EXISTS sponsor_url TEXT;

-- Nota: Não removemos thumbnail_url do banco para evitar perda de dados legados,
-- mas vamos parar de usar na interface conforme solicitado.
