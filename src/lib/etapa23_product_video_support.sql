-- =============================================
-- ETAPA 23: SUPORTE PARA VÍDEO NO PRODUTO
-- =============================================

ALTER TABLE public.products 
ADD COLUMN video_url TEXT;

COMMENT ON COLUMN public.products.video_url IS 'URL do vídeo (YouTube/MP4) para o carrossel da solução';
