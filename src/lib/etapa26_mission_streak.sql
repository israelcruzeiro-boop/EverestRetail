-- ========================================================
-- ETAPA 26: SISTEMA DE STREAK DE MISSÕES DIÁRIAS
-- ========================================================

-- 1. Adicionar campos de streak de missões em user_progress
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS last_missions_completed_date DATE,
ADD COLUMN IF NOT EXISTS missions_streak INTEGER DEFAULT 0;

-- 2. Garantir que a tabela mission_completions tenha política robusta
-- (Já existe, mas vamos garantir que o profile_id seja respeitado)

-- 3. Função RPC: apply_mission_streak_bonus()
-- Esta função é interna, chamada pela complete_mission
DROP FUNCTION IF EXISTS public.apply_mission_streak_bonus(UUID);
CREATE OR REPLACE FUNCTION public.apply_mission_streak_bonus(p_profile_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_today DATE;
    v_yesterDAY DATE;
    v_last_date DATE;
    v_streak INTEGER;
    v_bonus INTEGER := 0;
    v_current_balance INTEGER;
BEGIN
    -- Timezone America/Sao_Paulo
    v_today := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::DATE;
    v_yesterDAY := v_today - INTERVAL '1 day';

    -- Verificar se já recebeu bônus de MISSÃO hoje (trava via ledger para evitar duplicidade)
    IF EXISTS (
        SELECT 1 FROM public.coin_ledger 
        WHERE profile_id = p_profile_id 
        AND type = 'mission_streak_bonus' 
        AND created_at::DATE = v_today
    ) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Bônus de streak já aplicado hoje');
    END IF;

    -- Buscar progresso
    SELECT last_missions_completed_date, missions_streak INTO v_last_date, v_streak
    FROM public.user_progress
    WHERE profile_id = p_profile_id;

    -- Lógica de Streak
    IF v_last_date IS NOT NULL AND v_last_date = v_yesterDAY THEN
        v_streak := v_streak + 1;
    ELSE
        v_streak := 1;
    END IF;

    -- Tabela de Bônus de Missões
    -- streak 1: +20, 2: +25, 3: +30, 4: +40, 5: +50, 6: +60, 7+: +80
    CASE v_streak
        WHEN 1 THEN v_bonus := 20;
        WHEN 2 THEN v_bonus := 25;
        WHEN 3 THEN v_bonus := 30;
        WHEN 4 THEN v_bonus := 40;
        WHEN 5 THEN v_bonus := 50;
        WHEN 6 THEN v_bonus := 60;
        ELSE v_bonus := 80;
    END CASE;

    -- Atualizar User Progress
    UPDATE public.user_progress
    SET 
        coins_balance = coins_balance + v_bonus,
        total_coins_earned = total_coins_earned + v_bonus,
        last_missions_completed_date = v_today,
        missions_streak = v_streak,
        updated_at = now()
    WHERE profile_id = p_profile_id
    RETURNING coins_balance INTO v_current_balance;

    -- Sincronizar PROFILES
    UPDATE public.profiles
    SET 
        coins_balance = COALESCE(coins_balance, 0) + v_bonus,
        coins_earned_total = COALESCE(coins_earned_total, 0) + v_bonus,
        updated_at = now()
    WHERE id = p_profile_id;

    -- Registrar no Ledger
    INSERT INTO public.coin_ledger (profile_id, type, amount, meta)
    VALUES (p_profile_id, 'mission_streak_bonus', v_bonus, jsonb_build_object('streak', v_streak));

    RETURN jsonb_build_object(
        'awarded', true,
        'amount', v_bonus,
        'streak', v_streak,
        'balance', v_current_balance
    );
END;
$$;

-- 4. Atualizar RPC: complete_mission()
-- Refatoração para incluir bônus de streak
DROP FUNCTION IF EXISTS public.complete_mission(TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.complete_mission(mission_code TEXT, p_reference_id TEXT DEFAULT NULL)
RETURNS JSONB -- Alterado para devolver JSONB com info de streak
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_mission_id UUID;
    v_reward INTEGER;
    v_active BOOLEAN;
    v_today DATE;
    v_new_balance INTEGER;
    v_total_missions INTEGER;
    v_completed_missions INTEGER;
    v_streak_result JSONB := NULL;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Não autorizado');
    END IF;

    v_today := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::DATE;

    -- 1) Buscar dados da missão
    SELECT id, reward, active INTO v_mission_id, v_reward, v_active
    FROM public.missions
    WHERE code = mission_code;

    IF v_mission_id IS NULL OR NOT v_active THEN
        RETURN jsonb_build_object('success', false, 'message', 'Missão inválida ou inativa');
    END IF;

    -- 2) Verificar se já completou hoje (referência opcional)
    IF EXISTS (
        SELECT 1 FROM public.mission_completions
        WHERE profile_id = v_user_id
        AND mission_id = v_mission_id
        AND (reference_id = p_reference_id OR (reference_id IS NULL AND p_reference_id IS NULL))
        AND completed_at::DATE = v_today
    ) THEN
        -- Já completou, buscar balanço atual
        SELECT coins_balance INTO v_new_balance FROM public.user_progress WHERE profile_id = v_user_id;
        RETURN jsonb_build_object('success', true, 'awarded', false, 'balance', v_new_balance, 'message', 'Missão já concluída hoje');
    END IF;

    -- 3) Registrar Conclusão
    INSERT INTO public.mission_completions (profile_id, mission_id, reference_id)
    VALUES (v_user_id, v_mission_id, p_reference_id);

    -- 4) Atualizar Saldos e Ledger
    INSERT INTO public.coin_ledger (profile_id, type, amount, meta)
    VALUES (v_user_id, 'mission', v_reward, jsonb_build_object('mission_code', mission_code, 'ref', p_reference_id));

    -- Atualizar user_progress
    INSERT INTO public.user_progress (profile_id, coins_balance, total_coins_earned)
    VALUES (v_user_id, v_reward, v_reward)
    ON CONFLICT (profile_id) DO UPDATE
    SET coins_balance = user_progress.coins_balance + EXCLUDED.coins_balance,
        total_coins_earned = user_progress.total_coins_earned + EXCLUDED.total_coins_earned;

    -- Sincronizar profiles
    UPDATE public.profiles
    SET coins_balance = COALESCE(coins_balance, 0) + v_reward,
        coins_earned_total = COALESCE(coins_earned_total, 0) + v_reward
    WHERE id = v_user_id
    RETURNING coins_balance INTO v_new_balance;

    -- 5) Verificar Streak (Dia Completo)
    -- Contar missões ativas totais vs concluídas hoje
    SELECT COUNT(*) INTO v_total_missions FROM public.missions WHERE active = true;
    
    SELECT COUNT(DISTINCT mission_id) INTO v_completed_missions 
    FROM public.mission_completions
    WHERE profile_id = v_user_id AND completed_at::DATE = v_today;

    IF v_completed_missions >= v_total_missions THEN
        -- TODAS AS MISSÕES CONCLUÍDAS! Aplicar bônus de streak.
        v_streak_result := public.apply_mission_streak_bonus(v_user_id);
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'awarded', true,
        'amount', v_reward,
        'balance', v_new_balance,
        'day_complete', (v_streak_result->>'awarded')::BOOLEAN,
        'streak_bonus', (v_streak_result->>'amount')::INTEGER,
        'streak_count', (v_streak_result->>'streak')::INTEGER
    );
END;
$$;
