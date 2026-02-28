-- ==========================================
-- ETAPA 21: CORREÇÃO DE RLS (PRODUCT_HIRES)
-- ==========================================

-- Adicionando permissão de inserção para o próprio usuário
CREATE POLICY "Users can insert their own hires"
    ON public.product_hires FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

-- Opcional: Permitir update (caso o repositório use upsert)
CREATE POLICY "Users can update their own hires"
    ON public.product_hires FOR UPDATE
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);
