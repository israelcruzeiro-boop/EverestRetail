-- ==========================================
-- ETAPA 20: SISTEMA DE AVALIAÇÕES (0-10)
-- ==========================================

-- 1. Tabela de Contratações (Hires)
-- Registra quem contratou qual produto/serviço
CREATE TABLE IF NOT EXISTS public.product_hires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    hired_at TIMESTAMPTZ DEFAULT now(),
    -- Um usuário pode contratar o mesmo produto múltiplas vezes (ex: renovação), 
    -- mas para avaliação, basta ter pelo menos um registro.
    UNIQUE(profile_id, product_id)
);

-- 2. Tabela de Avaliações (Reviews)
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 10),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    -- Um usuário só pode avaliar um produto uma vez
    UNIQUE(profile_id, product_id)
);

-- 3. RLS para product_hires
ALTER TABLE public.product_hires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own hires"
    ON public.product_hires FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Admins can view all hires"
    ON public.product_hires FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND (role = 'admin' OR user_type = 'admin')
        )
    );

-- 4. RLS para product_reviews
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are public"
    ON public.product_reviews FOR SELECT
    USING (true);

CREATE POLICY "Users can manage their own reviews"
    ON public.product_reviews FOR ALL
    USING (auth.uid() = profile_id);

-- 5. Trigger para updated_at em product_reviews
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_product_reviews_updated_at
    BEFORE UPDATE ON public.product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 6. Validação: Apenas quem contratou pode avaliar
-- (Isso pode ser feito via App Logic, mas um constraint de banco é mais robusto)
CREATE OR REPLACE FUNCTION public.check_review_eligibility()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.product_hires 
        WHERE profile_id = NEW.profile_id AND product_id = NEW.product_id
    ) THEN
        RAISE EXCEPTION 'Apenas usuários que contrataram o produto podem avaliá-lo.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_check_review_eligibility
    BEFORE INSERT ON public.product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.check_review_eligibility();
