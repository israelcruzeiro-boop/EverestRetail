-- ==========================================
-- ETAPA 10: SISTEMA DE MOEDAS (EVEREST COINS)
-- ==========================================

-- 1) Tabela de Carteiras (Saldo)
CREATE TABLE IF NOT EXISTS public.wallets (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT balance_non_negative CHECK (balance >= 0)
);

-- 2) Tabela de Definição de Missões
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL, -- 'view_highlight_daily', 'watch_videocast_daily', 'share_solution_daily'
    description TEXT,
    reward INTEGER NOT NULL,
    daily_limit INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3) Tabela de Histórico (Ledger)
CREATE TABLE IF NOT EXISTS public.coin_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,  -- 'mission', 'bonus', 'redeem'
    action TEXT NOT NULL, -- 'view_highlight', 'watch_videocast', 'share_solution'
    reference_id TEXT,    -- slug ou uuid do conteúdo
    amount INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4) Tabela de Conclusão de Missões
CREATE TABLE IF NOT EXISTS public.mission_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
    reference_id TEXT, -- ID do conteúdo específico
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- RLS (ROW LEVEL SECURITY)
-- ==========================================

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_completions ENABLE ROW LEVEL SECURITY;

-- Políticas para Wallets
CREATE POLICY "wallets_select_own" ON public.wallets FOR SELECT USING (profile_id = auth.uid() OR public.is_admin());
-- Nota: Update é feito via RPC (security definer), usuários não podem dar update direto.

-- Políticas para Ledger
CREATE POLICY "coin_ledger_select_own" ON public.coin_ledger FOR SELECT USING (profile_id = auth.uid() OR public.is_admin());

-- Políticas para Missions
CREATE POLICY "missions_select_all" ON public.missions FOR SELECT USING (true);

-- Políticas para Mission Completions
CREATE POLICY "mission_completions_select_own" ON public.mission_completions FOR SELECT USING (profile_id = auth.uid() OR public.is_admin());

-- ==========================================
-- RPC: COMPLETAR MISSÃO (Segurança no Banco)
-- ==========================================

CREATE OR REPLACE FUNCTION public.complete_mission(mission_code TEXT, reference_id TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER -- Permite rodar com privilégios de owner para atualizar saldo
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_mission_id UUID;
    v_reward INTEGER;
    v_active BOOLEAN;
    v_last_completion TIMESTAMPTZ;
    v_new_balance INTEGER;
BEGIN
    -- 1) Identificar usuário
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Acesso não autorizado.';
    END IF;

    -- 2) Buscar dados da missão
    SELECT id, reward, active INTO v_mission_id, v_reward, v_active
    FROM public.missions
    WHERE code = mission_code;

    IF v_mission_id IS NULL OR NOT v_active THEN
        RAISE EXCEPTION 'Missão inválida ou inativa.';
    END IF;

    -- 3) Verificar se já foi concluída hoje para este conteúdo específico
    SELECT completed_at INTO v_last_completion
    FROM public.mission_completions
    WHERE profile_id = v_user_id
    AND mission_id = v_mission_id
    AND (public.mission_completions.reference_id = $2 OR (public.mission_completions.reference_id IS NULL AND $2 IS NULL))
    AND completed_at >= CURRENT_DATE
    LIMIT 1;

    IF v_last_completion IS NOT NULL THEN
        -- Já completou hoje, apenas retornar saldo atual sem erro (silent skip ou erro dependendo da UX desejada)
        SELECT balance INTO v_new_balance FROM public.wallets WHERE profile_id = v_user_id;
        RETURN COALESCE(v_new_balance, 0);
    END IF;

    -- 4) Registrar Conclusão
    INSERT INTO public.mission_completions (profile_id, mission_id, reference_id)
    VALUES (v_user_id, v_mission_id, reference_id);

    -- 5) Inserir Ledger
    INSERT INTO public.coin_ledger (profile_id, type, action, reference_id, amount)
    VALUES (v_user_id, 'mission', mission_code, reference_id, v_reward);

    -- 6) Atualizar Wallet (Upsert caso não exista)
    INSERT INTO public.wallets (profile_id, balance, updated_at)
    VALUES (v_user_id, v_reward, now())
    ON CONFLICT (profile_id) DO UPDATE
    SET balance = wallets.balance + EXCLUDED.balance,
        updated_at = EXCLUDED.updated_at
    RETURNING balance INTO v_new_balance;

    RETURN v_new_balance;
END;
$$;

-- ==========================================
-- DATA: SEED MISSIONS
-- ==========================================

INSERT INTO public.missions (code, description, reward) VALUES
('view_highlight', 'Ver um destaque estratégico', 10),
('watch_videocast', 'Assistir a um videocast', 20),
('share_solution', 'Compartilhar uma solução do marketplace', 15)
ON CONFLICT (code) DO NOTHING;
