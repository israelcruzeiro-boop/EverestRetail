-- ========================================================
-- ETAPA 30: MÓDULO DE LOJA (XP E BOOST) - REFINADO
-- ========================================================

-- 1. Alterar tabela de posts para suportar Boost
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'posts' AND column_name = 'boosted_until') THEN
        ALTER TABLE public.posts ADD COLUMN boosted_until TIMESTAMPTZ;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_posts_boosted ON public.posts (boosted_until DESC NULLS LAST);

-- 2. Alterar user_progress para suportar XP
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_progress' AND column_name = 'xp_total') THEN
        ALTER TABLE public.user_progress ADD COLUMN xp_total INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. Adaptar tabela store_items existente
DO $$ 
BEGIN 
    -- Adicionar 'code'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_items' AND column_name = 'code') THEN
        ALTER TABLE public.store_items ADD COLUMN code TEXT UNIQUE;
    END IF;
    -- Adicionar 'benefit_type'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_items' AND column_name = 'benefit_type') THEN
        ALTER TABLE public.store_items ADD COLUMN benefit_type TEXT;
    END IF;
    -- Adicionar 'benefit_value'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'store_items' AND column_name = 'benefit_value') THEN
        ALTER TABLE public.store_items ADD COLUMN benefit_value INTEGER;
    END IF;
    
    -- Ajustar colunas existentes se necessário
    -- 'price' já existe. 'is_active' já existe.
END $$;

-- 4. Adaptar tabela user_purchases existente
DO $$ 
BEGIN 
    -- Adicionar 'target_id'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_purchases' AND column_name = 'target_id') THEN
        ALTER TABLE public.user_purchases ADD COLUMN target_id UUID;
    END IF;
    -- Adicionar 'price_paid'
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_purchases' AND column_name = 'price_paid') THEN
        ALTER TABLE public.user_purchases ADD COLUMN price_paid INTEGER;
    END IF;
END $$;

-- Habilitar RLS (caso não esteja)
ALTER TABLE public.store_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
DROP POLICY IF EXISTS "store_items_select_all" ON public.store_items;
CREATE POLICY "store_items_select_all" ON public.store_items FOR SELECT TO authenticated USING (is_active = TRUE);

DROP POLICY IF EXISTS "user_purchases_select_own" ON public.user_purchases;
CREATE POLICY "user_purchases_select_own" ON public.user_purchases FOR SELECT TO authenticated USING (profile_id = auth.uid());

-- 5. RPC: purchase_store_item
CREATE OR REPLACE FUNCTION public.purchase_store_item(p_item_code TEXT, p_target_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_profile_id UUID;
    v_item RECORD;
    v_current_balance INTEGER;
    v_post_owner UUID;
BEGIN
    -- 1. Validar autenticação
    v_profile_id := auth.uid();
    IF v_profile_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Não autenticado');
    END IF;

    -- 2. Buscar item da loja (LOCK para consistência)
    SELECT * INTO v_item FROM public.store_items WHERE code = p_item_code AND is_active = TRUE FOR SHARE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Item não encontrado ou inativo');
    END IF;

    -- 3. Validar e travar saldo (LOCK na wallet)
    SELECT balance INTO v_current_balance FROM public.wallets WHERE profile_id = v_profile_id FOR UPDATE;
    IF v_current_balance < v_item.price THEN
        RETURN jsonb_build_object('success', false, 'message', 'Saldo de Everest Coins insuficiente');
    END IF;

    -- 4. Lógica Específica por Tipo de Benefício
    IF v_item.benefit_type = 'xp' THEN
        -- Adicionar XP ao usuário
        UPDATE public.user_progress
        SET xp_total = COALESCE(xp_total, 0) + v_item.benefit_value,
            updated_at = now()
        WHERE profile_id = v_profile_id;

    ELSIF v_item.benefit_type = 'boost' THEN
        -- Validar target_id (post)
        IF p_target_id IS NULL THEN
            RETURN jsonb_build_object('success', false, 'message', 'ID do post é obrigatório para Boost');
        END IF;

        -- Verificar propriedade e existência (LOCK no post)
        SELECT profile_id INTO v_post_owner FROM public.posts WHERE id = p_target_id FOR UPDATE;
        IF NOT FOUND THEN
            RETURN jsonb_build_object('success', false, 'message', 'Post não encontrado');
        END IF;

        IF v_post_owner != v_profile_id THEN
            RETURN jsonb_build_object('success', false, 'message', 'Você só pode impulsionar seus próprios posts');
        END IF;

        -- Atualizar Timestamp de Boost (Stacking)
        UPDATE public.posts
        SET boosted_until = GREATEST(COALESCE(boosted_until, now()), now()) + (v_item.benefit_value * INTERVAL '1 hour'),
            updated_at = now()
        WHERE id = p_target_id;

    ELSE
        RETURN jsonb_build_object('success', false, 'message', 'Tipo de benefício desconhecido');
    END IF;

    -- 5. Debitar Moedas na Wallet
    UPDATE public.wallets
    SET balance = balance - v_item.price,
        updated_at = now()
    WHERE profile_id = v_profile_id;

    -- Sincronizar com profiles
    UPDATE public.profiles
    SET coins_balance = COALESCE(coins_balance, 0) - v_item.price,
        updated_at = now()
    WHERE id = v_profile_id;

    -- 6. Registrar no Ledger (Auditoria Geral)
    INSERT INTO public.coin_ledger (profile_id, type, action, amount, reference_id)
    VALUES (v_profile_id, 'purchase', p_item_code, -v_item.price, p_target_id::text);

    -- 7. Registrar Transação na user_purchases
    INSERT INTO public.user_purchases (profile_id, item_id, target_id, price_paid, purchased_at)
    VALUES (v_profile_id, v_item.id, p_target_id, v_item.price, now());

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Compra realizada com sucesso!',
        'new_balance', v_current_balance - v_item.price
    );
END;
$$;

-- 6. Seed Items (Limpando placeholders se necessário e inserindo novos)
DELETE FROM public.store_items WHERE code IS NULL;

INSERT INTO public.store_items (code, name, description, price, benefit_type, benefit_value, is_active)
VALUES 
    ('xp_pack_500', 'Pacote de XP (500 pts)', 'Evolua seu nível mais rápido com este pacote de experiência.', 250, 'xp', 500, TRUE),
    ('boost_blog_24h', 'Destaque no Blog (24h)', 'Coloque sua publicação no topo do feed por 24 horas.', 150, 'boost', 24, TRUE)
ON CONFLICT (code) DO UPDATE SET
    price = EXCLUDED.price,
    benefit_value = EXCLUDED.benefit_value,
    is_active = EXCLUDED.is_active;
