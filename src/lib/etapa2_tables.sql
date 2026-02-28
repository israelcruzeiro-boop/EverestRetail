-- ==========================================
-- ETAPA 2: TABELAS DE PRODUTOS, PARCEIROS E SOLICITAÇÕES
-- Rode este script completo no SQL Editor do Supabase
-- ==========================================

-- ============================================
-- 1. TABELA: partners
-- ============================================
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Tecnologia' CHECK (type IN ('Fornecedor', 'Consultoria', 'Tecnologia')),
  logo_url TEXT,
  contact_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. TABELA: products
-- ============================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  category TEXT NOT NULL DEFAULT 'SaaS' CHECK (category IN ('SaaS', 'Consultoria', 'IA', 'Operação', 'Financeiro', 'RH', 'Marketing')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),

  price_cents INTEGER NOT NULL DEFAULT 0,
  billing_period TEXT DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly')),
  price_label TEXT,

  short_description TEXT NOT NULL DEFAULT '',
  long_description TEXT,

  hero_image_url TEXT,
  logo_image_url TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,

  benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  testimonial JSONB,

  cta_primary_label TEXT,
  cta_secondary_label TEXT,

  partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. TABELA: publication_requests
-- ============================================
CREATE TABLE IF NOT EXISTS public.publication_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  partner_type TEXT NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 4. TRIGGERS: updated_at automático
-- ============================================
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.products;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.partners;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.publication_requests;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.publication_requests
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- ============================================
-- 5. RLS (Row Level Security)
-- ============================================

-- PRODUCTS --
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa autenticada pode ver produtos ativos
CREATE POLICY "products_select_active" ON public.products
  FOR SELECT USING (status = 'active');

-- Admin pode ver/fazer tudo (via JWT metadata)
CREATE POLICY "products_admin_all" ON public.products
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- PARTNERS --
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Qualquer autenticado pode ver parceiros ativos
CREATE POLICY "partners_select_active" ON public.partners
  FOR SELECT USING (status = 'active');

-- Admin pode ver/fazer tudo
CREATE POLICY "partners_admin_all" ON public.partners
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- PUBLICATION REQUESTS --
ALTER TABLE public.publication_requests ENABLE ROW LEVEL SECURITY;

-- Usuário pode ver suas próprias solicitações
CREATE POLICY "requests_select_own" ON public.publication_requests
  FOR SELECT USING (auth.uid() = requester_user_id);

-- Usuário pode criar suas próprias solicitações
CREATE POLICY "requests_insert_own" ON public.publication_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_user_id);

-- Admin pode ver/gerenciar todas as solicitações
CREATE POLICY "requests_admin_all" ON public.publication_requests
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ============================================
-- 6. ÍNDICES para Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_partner_id ON public.products(partner_id);
CREATE INDEX IF NOT EXISTS idx_partners_status ON public.partners(status);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.publication_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_user ON public.publication_requests(requester_user_id);

-- ============================================
-- 7. SEED: Produto de exemplo
-- ============================================
INSERT INTO public.products (name, slug, category, status, price_cents, billing_period, short_description, hero_image_url, benefits)
SELECT 'Checkii+', 'checkii-plus', 'SaaS', 'active', 29900, 'monthly',
  'O checklist inteligente que garante a execução perfeita da sua loja.',
  'https://images.unsplash.com/photo-1454165833767-027ffea9e7a7?auto=format&fit=crop&q=80&w=800',
  '[{"id": "b1", "text": "Digitalização de processos"}, {"id": "b2", "text": "Redução de erros operacionais"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.products WHERE slug = 'checkii-plus');
