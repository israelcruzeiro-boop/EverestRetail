-- ==========================================
-- ETAPA 7: ANALYTICS E DASHBOARDS
-- Rode no SQL Editor do Supabase
-- ==========================================

BEGIN;

-- ============================================
-- 1. TABELA: analytics_events
-- ============================================
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'page_view', 'click', 'conversion', etc.
    session_id TEXT,
    meta_json JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. ÍNDICES DE PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_analytics_type ON public.analytics_events(type);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON public.analytics_events(timestamp DESC);

-- ============================================
-- 3. RLS: Policies
-- ============================================
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Público (Anon): Apenas Inserção (para rastrear visitas)
CREATE POLICY "public_insert_analytics" ON public.analytics_events FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Admin: Acesso total para leitura e análise
CREATE POLICY "admin_all_analytics" ON public.analytics_events FOR ALL TO authenticated USING (public.is_admin());

-- ============================================
-- 4. VIEW PARA MÉTRICAS SIMPLES (Opcional, mas útil)
-- ============================================
CREATE OR REPLACE VIEW public.dashboard_metrics AS
SELECT 
    (SELECT count(*) FROM public.products WHERE status = 'active') as active_products,
    (SELECT count(*) FROM public.publication_requests WHERE status = 'pending') as pending_requests,
    (SELECT count(*) FROM public.analytics_events WHERE type = 'checkout_confirmed' AND timestamp > (now() - interval '30 days')) as monthly_conversions;

COMMIT;
