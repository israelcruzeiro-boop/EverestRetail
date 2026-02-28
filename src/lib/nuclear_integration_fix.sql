-- ========================================================
-- NUCLEAR INTEGRATION FIX: UNIFICAÇÃO DO SISTEMA DE MOEDAS
-- ========================================================
-- Este script corrige a fragmentação entre wallets, user_progress e profiles,
-- além de resolver o erro de constraint no coin_ledger.

-- 1. UNIFICAÇÃO DO COIN_LEDGER
-- Permite que novas RPCs funcionem sem precisar da coluna 'action' legada
ALTER TABLE public.coin_ledger ALTER COLUMN action DROP NOT NULL;
ALTER TABLE public.coin_ledger ALTER COLUMN type TYPE VARCHAR(100);

-- 2. GARANTIR ESTRUTURA DE TABELAS DE SALDO
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coins_balance INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coins_earned_total INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.user_progress (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    coins_balance INTEGER DEFAULT 0,
    total_coins_earned INTEGER DEFAULT 0,
    last_login_date DATE,
    login_streak INTEGER DEFAULT 0,
    last_missions_completed_date DATE,
    missions_streak INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.wallets (
    profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT balance_non_negative CHECK (balance >= 0)
);

-- 3. TRIGGER DE SINCRONIZAÇÃO AUTOMÁTICA (O CORAÇÃO DO FIX)
-- Garante que qualquer alteração em public.profiles se reflita em user_progress e wallets
CREATE OR REPLACE FUNCTION public.sync_user_balances()
RETURNS TRIGGER AS $$
BEGIN
    -- Sincronizar com user_progress
    INSERT INTO public.user_progress (profile_id, coins_balance, total_coins_earned)
    VALUES (NEW.id, NEW.coins_balance, NEW.coins_earned_total)
    ON CONFLICT (profile_id) DO UPDATE SET
        coins_balance = NEW.coins_balance,
        total_coins_earned = NEW.coins_earned_total,
        updated_at = now();

    -- Sincronizar com wallets
    INSERT INTO public.wallets (profile_id, balance, updated_at)
    VALUES (NEW.id, NEW.coins_balance, now())
    ON CONFLICT (profile_id) DO UPDATE SET
        balance = NEW.coins_balance,
        updated_at = now();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_user_balances ON public.profiles;
CREATE TRIGGER trigger_sync_user_balances
    AFTER UPDATE OF coins_balance, coins_earned_total ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.sync_user_balances();

-- 4. RPC UNIFICADA: add_coins_reward
-- Função mestre para qualquer ganho de moedas
DROP FUNCTION IF EXISTS public.add_coins_reward(TEXT, INTEGER, TEXT, INTEGER);
CREATE OR REPLACE FUNCTION public.add_coins_reward(
    p_action_type TEXT, 
    p_amount INTEGER, 
    p_reference_id TEXT DEFAULT NULL, 
    p_cooldown_days INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_new_balance INTEGER;
    v_today DATE;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Não autorizado');
    END IF;

    v_today := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::DATE;

    -- Verificar cooldown (opcional)
    IF p_cooldown_days > 0 THEN
        IF EXISTS (
            SELECT 1 FROM public.coin_ledger 
            WHERE profile_id = v_user_id 
            AND type = p_action_type
            AND (meta->>'ref' = p_reference_id OR p_reference_id IS NULL)
            AND created_at > (now() - (p_cooldown_days || ' days')::INTERVAL)
        ) THEN
            SELECT coins_balance INTO v_new_balance FROM public.profiles WHERE id = v_user_id;
            RETURN jsonb_build_object('success', false, 'awarded', false, 'balance', COALESCE(v_new_balance, 0), 'message', 'Cooldown ativo');
        END IF;
    END IF;

    -- Registrar no Ledger
    INSERT INTO public.coin_ledger (profile_id, type, amount, meta, created_at)
    VALUES (v_user_id, p_action_type, p_amount, jsonb_build_object('ref', p_reference_id), now());

    -- Atualizar Profile (O trigger cuidará do resto)
    UPDATE public.profiles
    SET 
        coins_balance = COALESCE(coins_balance, 0) + p_amount,
        coins_earned_total = COALESCE(coins_earned_total, 0) + p_amount,
        updated_at = now()
    WHERE id = v_user_id
    RETURNING coins_balance INTO v_new_balance;

    RETURN jsonb_build_object('success', true, 'awarded', true, 'amount', p_amount, 'balance', v_new_balance);
END;
$$;

-- 5. RE-IMPLEMENTAÇÃO RPC: claim_daily_login_bonus
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
    v_bonus INTEGER := 10;
    v_extra INTEGER := 0;
    v_current_balance INTEGER;
BEGIN
    v_profile_id := auth.uid();
    IF v_profile_id IS NULL THEN RETURN jsonb_build_object('success', false); END IF;

    v_today := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::DATE;
    v_yesterDAY := v_today - INTERVAL '1 day';

    -- Buscar progresso
    SELECT last_login_date, login_streak INTO v_last_login, v_streak
    FROM public.user_progress WHERE profile_id = v_profile_id;

    IF v_last_login IS NOT NULL AND v_last_login = v_today THEN
        SELECT coins_balance INTO v_current_balance FROM public.profiles WHERE id = v_profile_id;
        RETURN jsonb_build_object('awarded', false, 'streak', v_streak, 'balance', v_current_balance);
    END IF;

    -- Streak
    IF v_last_login IS NOT NULL AND v_last_login = v_yesterDAY THEN
        v_streak := COALESCE(v_streak, 0) + 1;
    ELSE
        v_streak := 1;
    END IF;

    -- Bônus Extra
    CASE v_streak
        WHEN 2 THEN v_extra := 2;
        WHEN 3 THEN v_extra := 4;
        WHEN 4 THEN v_extra := 6;
        WHEN 5 THEN v_extra := 10;
        WHEN 6 THEN v_extra := 14;
        WHEN 7 THEN v_extra := 20;
        ELSE IF v_streak > 7 THEN v_extra := 20; ELSE v_extra := 0; END IF;
    END CASE;

    v_bonus := v_bonus + v_extra;

    -- Registrar no Ledger
    INSERT INTO public.coin_ledger (profile_id, type, amount, meta)
    VALUES (v_profile_id, 'daily_login', v_bonus, jsonb_build_object('streak', v_streak));

    -- Atualizar Profile (O trigger sincroniza o user_progress.last_login_date abaixo via update manual se necessário)
    UPDATE public.profiles
    SET 
        coins_balance = COALESCE(coins_balance, 0) + v_bonus,
        coins_earned_total = COALESCE(coins_earned_total, 0) + v_bonus,
        updated_at = now()
    WHERE id = v_profile_id
    RETURNING coins_balance INTO v_current_balance;

    -- Atualizar campos específicos de login no user_progress
    UPDATE public.user_progress
    SET last_login_date = v_today, login_streak = v_streak
    WHERE profile_id = v_profile_id;

    RETURN jsonb_build_object('awarded', true, 'amount', v_bonus, 'streak', v_streak, 'balance', v_current_balance);
END;
$$;

-- 6. RE-IMPLEMENTAÇÃO RPC: complete_mission
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
    IF v_user_id IS NULL THEN RETURN jsonb_build_object('success', false); END IF;

    v_today := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')::DATE;

    SELECT id, reward, active INTO v_mission_id, v_reward, v_active
    FROM public.missions WHERE code = mission_code;

    IF v_mission_id IS NULL OR NOT v_active THEN RETURN jsonb_build_object('success', false); END IF;

    -- Já completou hoje?
    IF EXISTS (
        SELECT 1 FROM public.mission_completions
        WHERE profile_id = v_user_id AND mission_id = v_mission_id
        AND (reference_id = p_reference_id OR (reference_id IS NULL AND p_reference_id IS NULL))
        AND completed_at::DATE = v_today
    ) THEN
        SELECT coins_balance INTO v_new_balance FROM public.profiles WHERE id = v_user_id;
        RETURN jsonb_build_object('success', true, 'awarded', false, 'balance', COALESCE(v_new_balance, 0));
    END IF;

    -- Registrar Conclusão
    INSERT INTO public.mission_completions (profile_id, mission_id, reference_id, completed_at)
    VALUES (v_user_id, v_mission_id, p_reference_id, now());

    -- Registrar no Ledger
    INSERT INTO public.coin_ledger (profile_id, type, amount, meta)
    VALUES (v_user_id, 'mission', v_reward, jsonb_build_object('mission_code', mission_code, 'ref', p_reference_id));

    -- Atualizar Profile
    UPDATE public.profiles
    SET 
        coins_balance = COALESCE(coins_balance, 0) + v_reward,
        coins_earned_total = COALESCE(coins_earned_total, 0) + v_reward,
        updated_at = now()
    WHERE id = v_user_id
    RETURNING coins_balance INTO v_new_balance;

    -- Streak (Dia Completo)
    SELECT COUNT(*) INTO v_total_missions FROM public.missions WHERE active = true;
    SELECT COUNT(DISTINCT mission_id) INTO v_completed_missions 
    FROM public.mission_completions
    WHERE profile_id = v_user_id AND completed_at::DATE = v_today;

    IF v_completed_missions >= v_total_missions THEN
        v_streak_result := public.apply_mission_streak_bonus(v_user_id);
    END IF;

    RETURN jsonb_build_object(
        'success', true, 'awarded', true, 'amount', v_reward, 'balance', v_new_balance,
        'day_complete', COALESCE((v_streak_result->>'awarded')::BOOLEAN, false),
        'streak_bonus', COALESCE((v_streak_result->>'amount')::INTEGER, 0),
        'streak_count', COALESCE((v_streak_result->>'streak')::INTEGER, 0)
    );
END;
$$;

-- 7. RE-IMPLEMENTAÇÃO RPC: complete_sponsored_video
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

    -- Limite diário
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

    -- Registrar no Ledger
    INSERT INTO public.coin_ledger (profile_id, type, amount, meta)
    VALUES (v_user_id, 'sponsor_video', v_reward, jsonb_build_object('video_id', p_video_id));

    -- Atualizar Profile
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

-- 8. REPARAR SALDOS ATUAIS (Migração de dados)
-- Garantir que Profiles tenha o valor mais alto entre Wallet e user_progress
UPDATE public.profiles p
SET 
  coins_balance = GREATEST(COALESCE(p.coins_balance, 0), COALESCE(w.balance, 0), COALESCE(up.coins_balance, 0)),
  coins_earned_total = GREATEST(COALESCE(p.coins_earned_total, 0), COALESCE(up.total_coins_earned, 0))
FROM public.profiles p2
LEFT JOIN public.wallets w ON w.profile_id = p.id
LEFT JOIN public.user_progress up ON up.profile_id = p.id
WHERE p.id = p2.id;
