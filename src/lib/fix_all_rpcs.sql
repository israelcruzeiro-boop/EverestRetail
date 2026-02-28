-- ========================================================
-- FIX DEFINITIVO: Todas as funções de recompensa
-- Corrige INSERT no coin_ledger para incluir 'action'
-- NÃO duplica nada. Usa DROP IF EXISTS antes de recriar.
-- ========================================================

-- 1. SEGURANÇA: Garantir que 'action' aceite NULL e 'meta' exista
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'coin_ledger' AND column_name = 'action') THEN
        ALTER TABLE public.coin_ledger ALTER COLUMN action DROP NOT NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'coin_ledger' AND column_name = 'meta') THEN
        ALTER TABLE public.coin_ledger ADD COLUMN meta JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 2. FIX: complete_mission (adicionar 'action' ao INSERT do coin_ledger)
DROP FUNCTION IF EXISTS public.complete_mission(TEXT, TEXT);
CREATE OR REPLACE FUNCTION public.complete_mission(mission_code TEXT, p_reference_id TEXT DEFAULT NULL)
RETURNS JSONB
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
    IF v_user_id IS NULL THEN RETURN jsonb_build_object('success', false, 'message', 'Não autorizado'); END IF;

    v_today := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::DATE;

    SELECT id, reward, active INTO v_mission_id, v_reward, v_active
    FROM public.missions WHERE code = mission_code;

    IF v_mission_id IS NULL OR NOT v_active THEN 
        RETURN jsonb_build_object('success', false, 'message', 'Missão inválida'); 
    END IF;

    -- Verificar se já completou hoje
    IF EXISTS (
        SELECT 1 FROM public.mission_completions
        WHERE profile_id = v_user_id AND mission_id = v_mission_id
        AND (reference_id = p_reference_id OR (reference_id IS NULL AND p_reference_id IS NULL))
        AND (completed_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::DATE = v_today
    ) THEN
        SELECT COALESCE(coins_balance, 0) INTO v_new_balance FROM public.profiles WHERE id = v_user_id;
        RETURN jsonb_build_object('success', true, 'awarded', false, 'balance', v_new_balance);
    END IF;

    -- Registrar Conclusão
    INSERT INTO public.mission_completions (profile_id, mission_id, reference_id, completed_at)
    VALUES (v_user_id, v_mission_id, p_reference_id, now());

    -- Ledger (COMPATÍVEL: inclui 'action')
    INSERT INTO public.coin_ledger (profile_id, type, action, amount, meta)
    VALUES (v_user_id, 'mission', mission_code, v_reward, jsonb_build_object('mission_code', mission_code, 'ref', p_reference_id));

    -- Update Profiles (fonte principal de saldo)
    UPDATE public.profiles
    SET 
        coins_balance = COALESCE(coins_balance, 0) + v_reward,
        coins_earned_total = COALESCE(coins_earned_total, 0) + v_reward,
        updated_at = now()
    WHERE id = v_user_id
    RETURNING coins_balance INTO v_new_balance;

    -- Lógica de Streak
    SELECT COUNT(*) INTO v_total_missions FROM public.missions WHERE active = true;
    SELECT COUNT(DISTINCT mission_id) INTO v_completed_missions 
    FROM public.mission_completions
    WHERE profile_id = v_user_id AND (completed_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::DATE = v_today;

    IF v_completed_missions >= v_total_missions THEN
        BEGIN
            v_streak_result := public.apply_mission_streak_bonus(v_user_id);
        EXCEPTION WHEN OTHERS THEN
            v_streak_result := NULL;
        END;
    END IF;

    RETURN jsonb_build_object(
        'success', true, 
        'awarded', true, 
        'amount', v_reward, 
        'balance', v_new_balance,
        'day_complete', COALESCE((v_streak_result->>'awarded')::BOOLEAN, false),
        'streak_bonus', COALESCE((v_streak_result->>'amount')::INTEGER, 0),
        'streak_count', COALESCE((v_streak_result->>'streak')::INTEGER, 0)
    );
END;
$$;

-- 3. FIX: complete_sponsored_video (adicionar 'action' ao INSERT do coin_ledger)
DROP FUNCTION IF EXISTS public.complete_sponsored_video(UUID, INTEGER);
CREATE OR REPLACE FUNCTION public.complete_sponsored_video(p_video_id UUID, p_watched_seconds INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_reward INTEGER;
    v_active BOOLEAN;
    v_daily_limit INTEGER;
    v_count_today INTEGER;
    v_new_balance INTEGER;
    v_today DATE;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN RETURN 0; END IF;
    
    v_today := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::DATE;

    SELECT reward, active, daily_limit INTO v_reward, v_active, v_daily_limit
    FROM public.sponsored_videos WHERE id = p_video_id;

    IF v_reward IS NULL OR NOT v_active THEN RETURN 0; END IF;

    SELECT COUNT(*) INTO v_count_today
    FROM public.video_views
    WHERE profile_id = v_user_id AND video_id = p_video_id AND rewarded = true AND view_date = v_today;

    IF v_count_today >= v_daily_limit THEN
        SELECT COALESCE(coins_balance, 0) INTO v_new_balance FROM public.profiles WHERE id = v_user_id;
        RETURN v_new_balance;
    END IF;

    -- Registrar Visualização
    INSERT INTO public.video_views (profile_id, video_id, watched_seconds, rewarded, view_date)
    VALUES (v_user_id, p_video_id, p_watched_seconds, true, v_today);

    -- Ledger (COMPATÍVEL: inclui 'action')
    INSERT INTO public.coin_ledger (profile_id, type, action, amount, meta)
    VALUES (v_user_id, 'sponsor_video', 'watch_sponsor', v_reward, jsonb_build_object('video_id', p_video_id));

    -- Update Profiles
    UPDATE public.profiles
    SET 
        coins_balance = COALESCE(coins_balance, 0) + v_reward,
        coins_earned_total = COALESCE(coins_earned_total, 0) + v_reward,
        updated_at = now()
    WHERE id = v_user_id
    RETURNING coins_balance INTO v_new_balance;

    RETURN v_new_balance;
END;
$$;

-- 4. FIX: apply_mission_streak_bonus (adicionar 'action' ao INSERT do coin_ledger)
DROP FUNCTION IF EXISTS public.apply_mission_streak_bonus(UUID);
CREATE OR REPLACE FUNCTION public.apply_mission_streak_bonus(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_today DATE;
    v_yesterday DATE;
    v_last_complete DATE;
    v_streak INTEGER;
    v_bonus INTEGER;
BEGIN
    v_today := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::DATE;
    v_yesterday := v_today - INTERVAL '1 day';

    -- Buscar último dia completo
    SELECT last_login_date, COALESCE(login_streak, 0) INTO v_last_complete, v_streak
    FROM public.user_progress WHERE profile_id = p_user_id;

    -- Calcular streak
    IF v_last_complete = v_yesterday THEN
        v_streak := v_streak + 1;
    ELSE
        v_streak := 1;
    END IF;

    -- Bônus baseado no streak
    CASE v_streak
        WHEN 1 THEN v_bonus := 5;
        WHEN 2 THEN v_bonus := 8;
        WHEN 3 THEN v_bonus := 12;
        WHEN 4 THEN v_bonus := 16;
        WHEN 5 THEN v_bonus := 20;
        ELSE v_bonus := 25;
    END CASE;

    -- Registrar no Ledger (COMPATÍVEL)
    INSERT INTO public.coin_ledger (profile_id, type, action, amount, meta)
    VALUES (p_user_id, 'mission_streak', 'mission_streak', v_bonus, jsonb_build_object('streak', v_streak));

    -- Update Profiles
    UPDATE public.profiles
    SET 
        coins_balance = COALESCE(coins_balance, 0) + v_bonus,
        coins_earned_total = COALESCE(coins_earned_total, 0) + v_bonus,
        updated_at = now()
    WHERE id = p_user_id;

    RETURN jsonb_build_object('awarded', true, 'amount', v_bonus, 'streak', v_streak);
END;
$$;
