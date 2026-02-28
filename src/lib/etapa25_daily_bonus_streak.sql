-- ========================================================
-- ETAPA 25: SISTEMA DE BÔNUS DIÁRIO E STREAK (CORREÇÃO)
-- ========================================================

-- 1. Criar tabela user_progress (Usando profile_id para consistência com o projeto)
CREATE TABLE IF NOT EXISTS public.user_progress (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    coins_balance INTEGER DEFAULT 0,
    total_coins_earned INTEGER DEFAULT 0,
    last_login_date DATE,
    login_streak INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Criar tabela coin_ledger
CREATE TABLE IF NOT EXISTS public.coin_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, 
    amount INTEGER NOT NULL,
    meta JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_ledger ENABLE ROW LEVEL SECURITY;

-- 3. Políticas RLS
DROP POLICY IF EXISTS "Usuários podem ver seu próprio progresso" ON public.user_progress;
CREATE POLICY "Usuários podem ver seu próprio progresso"
ON public.user_progress FOR SELECT
TO authenticated
USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Usuários podem ver seu próprio histórico de moedas" ON public.coin_ledger;
CREATE POLICY "Usuários podem ver seu próprio histórico de moedas"
ON public.coin_ledger FOR SELECT
TO authenticated
USING (auth.uid() = profile_id);

-- 4. Função RPC: claim_daily_login_bonus()
DROP FUNCTION IF EXISTS public.claim_daily_login_bonus();
CREATE OR REPLACE FUNCTION public.claim_daily_login_bonus()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_profile_id UUID;
    v_today DATE;
    v_yesterDAY DATE;
    v_last_login DATE;
    v_streak INTEGER;
    v_base_bonus INTEGER := 10;
    v_streak_bonus INTEGER := 0;
    v_total_awarded INTEGER;
    v_current_balance INTEGER;
    v_progress_row RECORD;
BEGIN
    v_profile_id := auth.uid();
    IF v_profile_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Não autenticado');
    END IF;

    -- Timezone America/Sao_Paulo
    v_today := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::DATE;
    v_yesterDAY := v_today - INTERVAL '1 day';

    -- Buscar ou criar progresso do usuário (LOCK para evitar concorrência)
    SELECT * INTO v_progress_row FROM public.user_progress WHERE profile_id = v_profile_id FOR UPDATE;
    
    IF NOT FOUND THEN
        INSERT INTO public.user_progress (profile_id, coins_balance, total_coins_earned, last_login_date, login_streak)
        VALUES (v_profile_id, 0, 0, NULL, 0)
        RETURNING * INTO v_progress_row;
    END IF;

    v_last_login := v_progress_row.last_login_date;
    v_streak := v_progress_row.login_streak;

    -- Verificar se já recebeu hoje
    IF v_last_login IS NOT NULL AND v_last_login = v_today THEN
        RETURN jsonb_build_object(
            'awarded', false, 
            'message', 'Bônus já resgatado hoje',
            'amount', 0,
            'streak', v_streak,
            'balance', v_progress_row.coins_balance
        );
    END IF;

    -- Lógica de Streak
    IF v_last_login IS NOT NULL AND v_last_login = v_yesterDAY THEN
        v_streak := v_streak + 1;
    ELSE
        v_streak := 1;
    END IF;

    -- Tabela de Bônus (10 base + streak)
    CASE v_streak
        WHEN 1 THEN v_streak_bonus := 0;
        WHEN 2 THEN v_streak_bonus := 2;
        WHEN 3 THEN v_streak_bonus := 4;
        WHEN 4 THEN v_streak_bonus := 6;
        WHEN 5 THEN v_streak_bonus := 10;
        WHEN 6 THEN v_streak_bonus := 14;
        ELSE v_streak_bonus := 20; -- Dia 7+ o total será 30
    END CASE;

    v_total_awarded := v_base_bonus + v_streak_bonus;

    -- Atualizar User Progress
    UPDATE public.user_progress
    SET 
        coins_balance = coins_balance + v_total_awarded,
        total_coins_earned = total_coins_earned + v_total_awarded,
        last_login_date = v_today,
        login_streak = v_streak,
        updated_at = now()
    WHERE profile_id = v_profile_id
    RETURNING coins_balance INTO v_current_balance;

    -- Sincronizar com a tabela PROFILES (central de saldo)
    UPDATE public.profiles
    SET 
        coins_balance = COALESCE(coins_balance, 0) + v_total_awarded,
        coins_earned_total = COALESCE(coins_earned_total, 0) + v_total_awarded,
        updated_at = now()
    WHERE id = v_profile_id;

    -- Registrar no Ledger para auditoria
    INSERT INTO public.coin_ledger (profile_id, type, amount, meta)
    VALUES (
        v_profile_id, 
        'daily_login', 
        v_total_awarded, 
        jsonb_build_object('streak', v_streak, 'base_bonus', v_base_bonus, 'streak_bonus', v_streak_bonus)
    );

    RETURN jsonb_build_object(
        'awarded', true,
        'amount', v_total_awarded,
        'streak', v_streak,
        'balance', v_current_balance
    );
END;
$$;
