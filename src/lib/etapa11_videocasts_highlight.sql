-- ==========================================
-- ETAPA 11: VIDEOCASTS HIGHLIGHT
-- Rode no SQL Editor do Supabase
-- ==========================================

BEGIN;

ALTER TABLE public.videocasts ADD COLUMN IF NOT EXISTS is_highlight BOOLEAN DEFAULT false;

COMMIT;
