-- ========================================================
-- CONSOLIDATED COIN & MISSION FIX (V5)
-- ========================================================

-- 1. CORREÇÃO DE SCHEMA: coin_ledger 
-- Remove a obrigatoriedade da coluna 'action' que causava falhas de INSERT (rollbacks silenciosos)
DO $$ 
BEGIN
    -- Permitir nulo em 'action' caso ela exista
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coin_ledger' AND column_name = 'action') THEN
        ALTER TABLE public.coin_ledger ALTER COLUMN action DROP NOT NULL;
    END IF;
    
    -- Garantir que a coluna 'meta' existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'coin_ledger' AND column_name = 'meta') THEN
        ALTER TABLE public.coin_ledger ADD COLUMN meta JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Ajustar tamanho do tipo para garantir compatibilidade
    ALTER TABLE public.coin_ledger ALTER COLUMN type TYPE VARCHAR(100);
END $$;

-- 2. GARANTIR ESTRUTURA DE SALDO EM PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coins_balance INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coins_earned_total INTEGER DEFAULT 0;

-- 3. UNIFICAÇÃO DE TABELAS (Sincronização via TRIGGER)
-- Remove triggers antigos para evitar loops ou duplicidade
DROP TRIGGER IF EXISTS trigger_sync_user_balances ON public.profiles;
DROP TRIGGER IF EXISTS trigger_sync_balances_from_profiles ON public.profiles;

-- Função de Sincronização: Profiles -> Outras (Wallets e User_Progress)
CREATE OR REPLACE FUNCTION public.sync_balances_from_profiles()
RETURNS TRIGGER AS $$
BEGIN
    -- Sincronizar user_progress
    INSERT INTO public.user_progress (profile_id, coins_balance, total_coins_earned)
    VALUES (NEW.id, NEW.coins_balance, NEW.coins_earned_total)
    ON CONFLICT (profile_id) DO UPDATE SET
        coins_balance = EXCLUDED.coins_balance,
        total_coins_earned = EXCLUDED.total_coins_earned,
        updated_at = now();

    -- Sincronizar wallets
    INSERT INTO public.wallets (profile_id, balance, updated_at)
    VALUES (NEW.id, NEW.coins_balance, now())
    ON CONFLICT (profile_id) DO UPDATE SET
        balance = EXCLUDED.balance,
        updated_at = now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_sync_balances_from_profiles
    AFTER UPDATE OF coins_balance, coins_earned_total ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.sync_balances_from_profiles();

-- 4. RE-IMPLEMENTAÇÃO RPC: complete_mission (Refatorada)
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

    -- Timezone SP
    v_today := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::DATE;

    SELECT id, reward, active INTO v_mission_id, v_reward, v_active
    FROM public.missions WHERE code = mission_code;

    IF v_mission_id IS NULL OR NOT v_active THEN 
        RETURN jsonb_build_object('success', false, 'message', 'Missão inválida'); 
    END IF;

    -- Verificar se já completou hoje (usando timezone SP para comparar a data)
    IF EXISTS (
        SELECT 1 FROM public.mission_completions
        WHERE profile_id = v_user_id AND mission_id = v_mission_id
        AND (reference_id = p_reference_id OR (reference_id IS NULL AND p_reference_id IS NULL))
        AND (completed_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::DATE = v_today
    ) THEN
        SELECT coins_balance INTO v_new_balance FROM public.profiles WHERE id = v_user_id;
        RETURN jsonb_build_object('success', true, 'awarded', false, 'balance', COALESCE(v_new_balance, 0));
    END IF;

    -- Registrar Conclusão
    INSERT INTO public.mission_completions (profile_id, mission_id, reference_id, completed_at)
    VALUES (v_user_id, v_mission_id, p_reference_id, now());

    -- Ledger (Insert simplificado sem 'action' obrigatória)
    INSERT INTO public.coin_ledger (profile_id, type, amount, meta)
    VALUES (v_user_id, 'mission', v_reward, jsonb_build_object('mission_code', mission_code, 'ref', p_reference_id));

    -- Update Profiles (Trigger sincroniza as outras tabelas)
    UPDATE public.profiles
    SET 
        coins_balance = COALESCE(coins_balance, 0) + v_reward,
        coins_earned_total = COALESCE(coins_earned_total, 0) + v_reward,
        updated_at = now()
    WHERE id = v_user_id
    RETURNING coins_balance INTO v_new_balance;

    -- Lógica de Streak (Dia Completo)
    SELECT COUNT(*) INTO v_total_missions FROM public.missions WHERE active = true;
    SELECT COUNT(DISTINCT mission_id) INTO v_completed_missions 
    FROM public.mission_completions
    WHERE profile_id = v_user_id AND (completed_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::DATE = v_today;

    IF v_completed_missions >= v_total_missions THEN
        -- Tenta chamar o bônus de streak se a função existir
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

-- 5. RE-IMPLEMENTAÇÃO RPC: complete_sponsored_video (Refatorada)
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
    
    -- Timezone SP
    v_today := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::DATE;

    SELECT reward, active, daily_limit INTO v_reward, v_active, v_daily_limit
    FROM public.sponsored_videos WHERE id = p_video_id;

    IF v_reward IS NULL OR NOT v_active THEN RETURN 0; END IF;

    -- Limite diário usando a data de SP
    SELECT COUNT(*) INTO v_count_today
    FROM public.video_views
    WHERE profile_id = v_user_id AND video_id = p_video_id AND rewarded = true AND view_date = v_today;

    IF v_count_today >= v_daily_limit THEN
        SELECT coins_balance INTO v_new_balance FROM public.profiles WHERE id = v_user_id;
        RETURN COALESCE(v_new_balance, 0);
    END IF;

    -- Registrar Visualização
    INSERT INTO public.video_views (profile_id, video_id, watched_seconds, rewarded, view_date)
    VALUES (v_user_id, p_video_id, p_watched_seconds, true, v_today);

    -- Ledger
    INSERT INTO public.coin_ledger (profile_id, type, amount, meta)
    VALUES (v_user_id, 'sponsor_video', v_reward, jsonb_build_object('video_id', p_video_id));

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

-- 6. REPARAR DADOS DE SALDO (Migração Silenciosa)
-- Migra o saldo de wallets para profiles se profiles estiver zerado
UPDATE public.profiles p
SET 
    coins_balance = GREATEST(COALESCE(p.coins_balance, 0), COALESCE(w.balance, 0), COALESCE(up.coins_balance, 0)),
    coins_earned_total = GREATEST(COALESCE(p.coins_earned_total, 0), COALESCE(up.total_coins_earned, 0))
FROM public.profiles p2
LEFT JOIN public.wallets w ON w.profile_id = p2.id
LEFT JOIN public.user_progress up ON up.profile_id = p2.id
WHERE p.id = p2.id AND (p.coins_balance = 0 OR p.coins_balance IS NULL);
