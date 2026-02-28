-- ==========================================
-- ETAPA 13: VÍDEOS PATROCINADOS (REWARDS)
-- ==========================================

-- 1) Tabela de Vídeos Patrocinados
CREATE TABLE IF NOT EXISTS public.sponsored_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    reward INTEGER NOT NULL,
    daily_limit INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,
    sponsor_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Tabela de Visualizações (Histórico de Recompensas)
CREATE TABLE IF NOT EXISTS public.video_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    video_id UUID REFERENCES public.sponsored_videos(id) ON DELETE CASCADE,
    watched_seconds INTEGER NOT NULL DEFAULT 0,
    rewarded BOOLEAN DEFAULT FALSE,
    view_date DATE DEFAULT CURRENT_DATE, -- Coluna dedicada para facilitar o índice único diário
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3) Índice Único para Limite Diário
-- Garante que um usuário só receba recompensa por um vídeo uma vez por dia civil
CREATE UNIQUE INDEX IF NOT EXISTS idx_video_views_daily_unique 
ON public.video_views (profile_id, video_id, view_date);

-- ==========================================
-- RLS (ROW LEVEL SECURITY)
-- ==========================================

ALTER TABLE public.sponsored_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_views ENABLE ROW LEVEL SECURITY;

-- Vídeos podem ser lidos por qualquer usuário logado
CREATE POLICY "sponsored_videos_select_all" ON public.sponsored_videos 
FOR SELECT USING (active = true OR public.is_admin());

-- Visualizações: Usuário só vê as suas, Admin vê tudo
CREATE POLICY "video_views_select_own" ON public.video_views 
FOR SELECT USING (profile_id = auth.uid() OR public.is_admin());

-- ==========================================
-- RPC: COMPLETAR VÍDEO PATROCINADO
-- ==========================================

CREATE OR REPLACE FUNCTION public.complete_sponsored_video(p_video_id UUID, p_watched_seconds INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER -- Permite atualizar wallets e ledger independentemente do RLS do usuário
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_reward INTEGER;
    v_active BOOLEAN;
    v_daily_limit INTEGER;
    v_count_today INTEGER;
    v_new_balance INTEGER;
BEGIN
    -- 1) Validar Sessão
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado.';
    END IF;

    -- 2) Buscar dados do vídeo e validar status
    SELECT reward, active, daily_limit INTO v_reward, v_active, v_daily_limit
    FROM public.sponsored_videos
    WHERE id = p_video_id;

    IF v_reward IS NULL OR NOT v_active THEN
        RAISE EXCEPTION 'Vídeo inválido ou inativo.';
    END IF;

    -- 3) Verificar limite diário (Segurança extra via software)
    SELECT COUNT(*) INTO v_count_today
    FROM public.video_views
    WHERE profile_id = v_user_id
    AND video_id = p_video_id
    AND rewarded = true
    AND created_at >= CURRENT_DATE;

    IF v_count_today >= v_daily_limit THEN
        -- Retornar saldo atual sem erro (silent skip no front-end para evitar Toasts repetidos)
        SELECT balance INTO v_new_balance FROM public.wallets WHERE profile_id = v_user_id;
        RETURN COALESCE(v_new_balance, 0);
    END IF;

    -- 4) Registrar Visualização
    INSERT INTO public.video_views (profile_id, video_id, watched_seconds, rewarded)
    VALUES (v_user_id, p_video_id, p_watched_seconds, true);

    -- 5) Inserir Ledger de Moedas (Histórico de transação)
    INSERT INTO public.coin_ledger (profile_id, type, action, reference_id, amount)
    VALUES (v_user_id, 'mission', 'sponsored_video_reward', p_video_id::TEXT, v_reward);

    -- 6) Atualizar Carteira (Wallet)
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
-- SEED DATA: VÍDEO DE EXEMPLO
-- ==========================================
INSERT INTO public.sponsored_videos (title, description, video_url, reward, sponsor_name)
VALUES ('Bem-vindo ao Everest', 'Assista e conheça o ecossistema Everest para ganhar suas primeiras moedas.', 'https://youtube.com/watch?v=dQw4w9WgXcQ', 50, 'Everest Team')
ON CONFLICT DO NOTHING;
