-- ==========================================
-- FIX: Ajuste de RLS para acesso público (anon)
-- Rode DEPOIS do etapa2_tables.sql
-- ==========================================

-- O problema: a policy "products_select_active" e "partners_select_active"
-- foram criadas sem especificar TO, mas o Supabase as aplica ao role "authenticated".
-- Usuários não-autenticados (anon) que acessam o Marketplace público não conseguem ler.

-- Fix: Recriar as policies de leitura pública com "TO anon, authenticated"

-- PRODUCTS: remover e recriar a policy de select
DROP POLICY IF EXISTS "products_select_active" ON public.products;
CREATE POLICY "products_select_active" ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

-- PARTNERS: remover e recriar a policy de select
DROP POLICY IF EXISTS "partners_select_active" ON public.partners;
CREATE POLICY "partners_select_active" ON public.partners
  FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

-- Confirmar que as policies estão corretas
SELECT tablename, policyname, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('products', 'partners', 'profiles', 'publication_requests')
ORDER BY tablename, policyname;
