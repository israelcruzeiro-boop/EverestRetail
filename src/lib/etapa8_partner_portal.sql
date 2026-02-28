-- ==========================================
-- ETAPA 8: PORTAL DO PARCEIRO
-- Ajustes de RLS para Gestão de Soluções Próprias
-- ==========================================

BEGIN;

-- 1. Permitir que parceiros vejam seus próprios produtos (mesmo pendentes/inativos)
DROP POLICY IF EXISTS "products_select_own" ON public.products;
CREATE POLICY "products_select_own" ON public.products
    FOR SELECT USING (
        created_by = auth.uid() OR status = 'active' OR public.is_admin()
    );

-- 2. Permitir que parceiros atualizem seus próprios produtos
-- Nota: Admin já possui permissão 'ALL'
DROP POLICY IF EXISTS "products_update_own" ON public.products;
CREATE POLICY "products_update_own" ON public.products
    FOR UPDATE USING (
        created_by = auth.uid()
    )
    WITH CHECK (
        created_by = auth.uid()
    );

-- 3. Melhorar RLS de Analytics para leitura de performance própria
-- Precisamos permitir que o parceiro leia eventos relacionados aos SEUS produtos
DROP POLICY IF EXISTS "partner_read_own_analytics" ON public.analytics_events;
CREATE POLICY "partner_read_own_analytics" ON public.analytics_events
    FOR SELECT USING (
        public.is_admin() OR
        EXISTS (
            SELECT 1 FROM public.products 
            WHERE products.id::text = (analytics_events.meta_json->>'productId')
            AND products.created_by = auth.uid()
        )
    );

COMMIT;
