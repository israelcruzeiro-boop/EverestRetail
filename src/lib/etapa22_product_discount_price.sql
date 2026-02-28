-- =============================================
-- ETAPA 22: SUPORTE PARA PREÇO "DE / POR"
-- =============================================

ALTER TABLE public.products 
ADD COLUMN original_price_cents INTEGER;

COMMENT ON COLUMN public.products.original_price_cents IS 'Preço original (antes do desconto) em centavos';
