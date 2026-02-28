-- ==========================================
-- ETAPA 3: PARCEIROS + SOLICITAÇÕES DE PUBLICAÇÃO
-- Migração completa — Rode no SQL Editor do Supabase
-- ==========================================
-- ATENÇÃO: Este script DROPA as tabelas partners e publication_requests
-- antigas (da Etapa 2) e recria com o novo schema.
-- A tabela products é preservada, apenas recebe a coluna created_by.

BEGIN;

-- ============================================
-- 0. PREPARAÇÃO: Limpar estruturas antigas
-- ============================================

-- Remover policies antigas
DROP POLICY IF EXISTS "partners_admin_all" ON public.partners;
DROP POLICY IF EXISTS "partners_select_active" ON public.partners;
DROP POLICY IF EXISTS "requests_admin_all" ON public.publication_requests;
DROP POLICY IF EXISTS "requests_select_own" ON public.publication_requests;
DROP POLICY IF EXISTS "requests_insert_own" ON public.publication_requests;

-- Remover triggers antigos
DROP TRIGGER IF EXISTS set_updated_at ON public.partners;
DROP TRIGGER IF EXISTS set_updated_at ON public.publication_requests;

-- Remover tabelas antigas (ordem importa por FK)
DROP TABLE IF EXISTS public.publication_requests CASCADE;
DROP TABLE IF EXISTS public.partners CASCADE;

-- ============================================
-- 1. ADICIONAR created_by EM products (se não existir)
-- ============================================
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.products ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================
-- 2. TABELA: partners (novo schema)
-- ============================================
CREATE TABLE public.partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. TABELA: publication_requests (novo schema)
-- ============================================
CREATE TABLE public.publication_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.partners(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'product' CHECK (type IN ('product', 'service')),
  name TEXT NOT NULL,
  slug TEXT,
  category TEXT,
  short_description TEXT,
  description TEXT,
  price_cents INTEGER DEFAULT 0,
  billing_period TEXT DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'yearly')),
  benefits TEXT[] DEFAULT '{}',
  cover_image_url TEXT,
  gallery_image_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'under_review', 'approved', 'rejected')),
  admin_notes TEXT,
  created_product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 4. TRIGGERS: updated_at automático
-- ============================================
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.publication_requests
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- ============================================
-- 5. FUNÇÃO: is_admin() — helper reutilizável
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ============================================
-- 6. RPC: approve_publication_request
-- ============================================
CREATE OR REPLACE FUNCTION public.approve_publication_request(request_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  req RECORD;
  new_product_id UUID;
BEGIN
  -- Verificar se é admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado: somente administradores podem aprovar solicitações.';
  END IF;

  -- Buscar a solicitação
  SELECT * INTO req FROM public.publication_requests WHERE id = request_id;
  IF req IS NULL THEN
    RAISE EXCEPTION 'Solicitação não encontrada.';
  END IF;

  IF req.status = 'approved' THEN
    RAISE EXCEPTION 'Solicitação já foi aprovada.';
  END IF;

  -- Gerar slug se não existir
  IF req.slug IS NULL OR req.slug = '' THEN
    req.slug := lower(regexp_replace(req.name, '[^a-zA-Z0-9]+', '-', 'g'));
  END IF;

  -- Criar produto
  INSERT INTO public.products (
    name, slug, category, status, price_cents, billing_period,
    short_description, long_description, hero_image_url,
    gallery, benefits, partner_id, created_by
  ) VALUES (
    req.name,
    req.slug,
    coalesce(req.category, 'SaaS'),
    'pending',
    coalesce(req.price_cents, 0),
    coalesce(req.billing_period, 'monthly'),
    coalesce(req.short_description, ''),
    req.description,
    req.cover_image_url,
    coalesce(to_jsonb(req.gallery_image_urls), '[]'::jsonb),
    coalesce(
      (SELECT jsonb_agg(jsonb_build_object('id', gen_random_uuid()::text, 'text', b))
       FROM unnest(req.benefits) AS b),
      '[]'::jsonb
    ),
    req.partner_id,
    auth.uid()
  ) RETURNING id INTO new_product_id;

  -- Atualizar a solicitação
  UPDATE public.publication_requests
  SET status = 'approved',
      created_product_id = new_product_id,
      updated_at = now()
  WHERE id = request_id;

  RETURN new_product_id;
END;
$$;

-- ============================================
-- 7. RPC: reject_publication_request
-- ============================================
CREATE OR REPLACE FUNCTION public.reject_publication_request(request_id UUID, notes TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se é admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado: somente administradores podem rejeitar solicitações.';
  END IF;

  UPDATE public.publication_requests
  SET status = 'rejected',
      admin_notes = coalesce(notes, admin_notes),
      updated_at = now()
  WHERE id = request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Solicitação não encontrada.';
  END IF;
END;
$$;

-- ============================================
-- 8. RLS: partners
-- ============================================
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Dono vê o próprio
CREATE POLICY "partners_select_own" ON public.partners
  FOR SELECT USING (
    owner_profile_id = auth.uid() OR public.is_admin()
  );

-- Usuário logado pode criar partner vinculado a si
CREATE POLICY "partners_insert_own" ON public.partners
  FOR INSERT TO authenticated
  WITH CHECK (owner_profile_id = auth.uid());

-- Dono pode atualizar campos básicos; admin pode tudo
CREATE POLICY "partners_update" ON public.partners
  FOR UPDATE USING (
    owner_profile_id = auth.uid() OR public.is_admin()
  );

-- Admin pode deletar
CREATE POLICY "partners_delete_admin" ON public.partners
  FOR DELETE USING (public.is_admin());

-- ============================================
-- 9. RLS: publication_requests
-- ============================================
ALTER TABLE public.publication_requests ENABLE ROW LEVEL SECURITY;

-- Requisitante vê as próprias; admin vê tudo
CREATE POLICY "requests_select" ON public.publication_requests
  FOR SELECT USING (
    requester_profile_id = auth.uid() OR public.is_admin()
  );

-- Usuário logado pode inserir request vinculada a si
CREATE POLICY "requests_insert" ON public.publication_requests
  FOR INSERT TO authenticated
  WITH CHECK (requester_profile_id = auth.uid());

-- Usuário pode editar enquanto submitted; admin pode sempre
CREATE POLICY "requests_update" ON public.publication_requests
  FOR UPDATE USING (
    (requester_profile_id = auth.uid() AND status = 'submitted')
    OR public.is_admin()
  );

-- ============================================
-- 10. ÍNDICES de performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_pub_requests_status ON public.publication_requests(status);
CREATE INDEX IF NOT EXISTS idx_pub_requests_requester ON public.publication_requests(requester_profile_id);
CREATE INDEX IF NOT EXISTS idx_partners_owner ON public.partners(owner_profile_id);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON public.products(created_by);

COMMIT;
