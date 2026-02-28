-- ==========================================
-- ETAPA 6: HOME CONTENT — GESTÃO DA HOME
-- Rode no SQL Editor do Supabase
-- ==========================================

BEGIN;

-- ============================================
-- 1. TABELA: highlights (Curadoria Semanal)
-- ============================================
CREATE TABLE IF NOT EXISTS public.highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subtitle TEXT,
    slug TEXT UNIQUE NOT NULL,
    tag TEXT DEFAULT 'INSIGHT',
    image_url TEXT,
    content_cover_url TEXT,
    read_time_label TEXT,
    cta_label TEXT DEFAULT 'Ler agora',
    link_type TEXT DEFAULT 'internal', -- 'internal' | 'external'
    link_url TEXT,
    status TEXT DEFAULT 'active', -- 'active' | 'inactive'
    sort_order INTEGER DEFAULT 0,
    body_json JSONB DEFAULT '[]'::jsonb,
    author_name TEXT DEFAULT 'Redação ENT',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. TABELA: suggested_products (Sugestões IA)
-- ============================================
CREATE TABLE IF NOT EXISTS public.suggested_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    custom_title TEXT,
    custom_cta TEXT DEFAULT 'Saber mais',
    status TEXT DEFAULT 'active',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. TABELA: videocasts (Vídeo-Casts)
-- ============================================
CREATE TABLE IF NOT EXISTS public.videocasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category_label TEXT,
    description TEXT,
    thumbnail_url TEXT,
    video_url TEXT NOT NULL,
    speaker_label TEXT,
    status TEXT DEFAULT 'active',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 4. RLS: Policies
-- ============================================

ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggested_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videocasts ENABLE ROW LEVEL SECURITY;

-- Admin: Acesso total
CREATE POLICY "admin_all_highlights" ON public.highlights FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "admin_all_suggested" ON public.suggested_products FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "admin_all_videocasts" ON public.videocasts FOR ALL TO authenticated USING (public.is_admin());

-- Público: Leitura de itens ativos
CREATE POLICY "public_read_highlights" ON public.highlights FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "public_read_suggested" ON public.suggested_products FOR SELECT TO anon, authenticated USING (status = 'active');
CREATE POLICY "public_read_videocasts" ON public.videocasts FOR SELECT TO anon, authenticated USING (status = 'active');

-- ============================================
-- 5. Triggers: updated_at
-- ============================================
CREATE TRIGGER set_updated_at_highlights BEFORE UPDATE ON public.highlights FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
CREATE TRIGGER set_updated_at_suggested BEFORE UPDATE ON public.suggested_products FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
CREATE TRIGGER set_updated_at_videocasts BEFORE UPDATE ON public.videocasts FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

COMMIT;
