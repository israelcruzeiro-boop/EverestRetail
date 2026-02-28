-- ========================================================
-- FIX: claim_daily_login_bonus (Compatível com schema real)
-- ========================================================
-- PROBLEMA ENCONTRADO:
-- 1. A tabela coin_ledger tem 'action TEXT NOT NULL' (criada pela etapa10).
--    A função antiga inseria sem 'action', causando rollback silencioso.
-- 2. O trigger sync_balances_from_profiles conflitava com FOR UPDATE.
-- 
-- SOLUÇÃO:
-- 1. Incluir 'action' no INSERT do coin_ledger.
-- 2. Atualizar PROFILES primeiro (sem FOR UPDATE no user_progress) e
--    deixar o trigger sincronizar user_progress automaticamente.
-- 3. Atualizar user_progress DEPOIS para gravar last_login_date e login_streak.
-- ========================================================

-- Garantir que 'action' permita NULL (caso a coluna exista mas tenha constraint)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'coin_ledger' AND column_name = 'action') THEN
        ALTER TABLE public.coin_ledger ALTER COLUMN action DROP NOT NULL;
    END IF;
    -- Garantir que 'meta' exista
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'coin_ledger' AND column_name = 'meta') THEN
        ALTER TABLE public.coin_ledger ADD COLUMN meta JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- Recriar a função com a correção
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
    v_yesterday DATE;
    v_last_login DATE;
    v_streak INTEGER;
    v_base_bonus INTEGER := 10;
    v_streak_bonus INTEGER := 0;
    v_total_awarded INTEGER;
    v_current_balance INTEGER;
BEGIN
    v_profile_id := auth.uid();
    IF v_profile_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Não autenticado');
    END IF;

    -- Timezone America/Sao_Paulo
    v_today := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::DATE;
    v_yesterday := v_today - INTERVAL '1 day';

    -- Garantir que o user_progress existe
    INSERT INTO public.user_progress (profile_id, coins_balance, total_coins_earned, last_login_date, login_streak)
    VALUES (v_profile_id, 0, 0, NULL, 0)
    ON CONFLICT (profile_id) DO NOTHING;

    -- Buscar dados atuais
    SELECT last_login_date, login_streak 
    INTO v_last_login, v_streak 
    FROM public.user_progress 
    WHERE profile_id = v_profile_id;

    -- Verificar se já recebeu hoje
    IF v_last_login IS NOT NULL AND v_last_login = v_today THEN
        SELECT COALESCE(coins_balance, 0) INTO v_current_balance FROM public.profiles WHERE id = v_profile_id;
        RETURN jsonb_build_object(
            'awarded', false, 
            'message', 'Bônus já resgatado hoje',
            'amount', 0,
            'streak', COALESCE(v_streak, 0),
            'balance', COALESCE(v_current_balance, 0)
        );
    END IF;

    -- Lógica de Streak
    IF v_last_login IS NOT NULL AND v_last_login = v_yesterday THEN
        v_streak := COALESCE(v_streak, 0) + 1;
    ELSE
        v_streak := 1;
    END IF;

    -- Tabela de Bônus
    CASE v_streak
        WHEN 1 THEN v_streak_bonus := 0;
        WHEN 2 THEN v_streak_bonus := 2;
        WHEN 3 THEN v_streak_bonus := 4;
        WHEN 4 THEN v_streak_bonus := 6;
        WHEN 5 THEN v_streak_bonus := 10;
        WHEN 6 THEN v_streak_bonus := 14;
        ELSE v_streak_bonus := 20;
    END CASE;

    v_total_awarded := v_base_bonus + v_streak_bonus;

    -- 1. Atualizar user_progress (streak + data + saldo)
    UPDATE public.user_progress
    SET 
        coins_balance = COALESCE(coins_balance, 0) + v_total_awarded,
        total_coins_earned = COALESCE(total_coins_earned, 0) + v_total_awarded,
        last_login_date = v_today,
        login_streak = v_streak,
        updated_at = now()
    WHERE profile_id = v_profile_id;

    -- 2. Atualizar profiles (fonte de verdade para o front-end)
    UPDATE public.profiles
    SET 
        coins_balance = COALESCE(coins_balance, 0) + v_total_awarded,
        coins_earned_total = COALESCE(coins_earned_total, 0) + v_total_awarded,
        updated_at = now()
    WHERE id = v_profile_id
    RETURNING coins_balance INTO v_current_balance;

    -- 3. Registrar no Ledger (COMPATÍVEL com schema real: inclui 'action')
    INSERT INTO public.coin_ledger (profile_id, type, action, amount, meta)
    VALUES (
        v_profile_id, 
        'daily_login', 
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
