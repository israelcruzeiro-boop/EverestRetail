-- ==========================================
-- FIX: REPARO DO SISTEMA DE RANKING (AVATAR)
-- ==========================================

-- 1. Adicionar coluna avatar_url na tabela profiles se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- 2. Atualizar a função handle_new_user para capturar avatar do metadata
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
DECLARE
  v_role TEXT := 'viewer';
BEGIN
  -- Se o email for o admin inicial, já setamos como admin
  IF new.email IN ('admin@email.com', 'israel@email.com') THEN
    v_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, name, email, role, user_type, status, avatar_url)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 
    new.email, 
    v_role, 
    CASE WHEN v_role = 'admin' THEN 'admin' ELSE 'user' END,
    'active',
    new.raw_user_meta_data->>'avatar_url'
  );

  -- IMPORTANTE: Atualiza o metadado no Auth para o RLS funcionar instantaneamente
  UPDATE auth.users 
  SET raw_user_meta_data = raw_user_meta_data || 
    jsonb_build_object(
      'role', v_role, 
      'user_type', CASE WHEN v_role = 'admin' THEN 'admin' ELSE 'user' END
    )
  WHERE id = new.id;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar a RPC de Ranking (Garante que avatar_url seja selecionado corretamente)
CREATE OR REPLACE FUNCTION public.get_ranking(p_criteria TEXT, p_limit INTEGER DEFAULT 50)
RETURNS TABLE (
    profile_id UUID,
    name TEXT,
    avatar_url TEXT,
    score BIGINT,
    rank_position BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF p_criteria = 'balance' THEN
        RETURN QUERY
        SELECT 
            p.id,
            p.name,
            p.avatar_url,
            w.balance::BIGINT as score,
            ROW_NUMBER() OVER (ORDER BY w.balance DESC) as rank_position
        FROM public.profiles p
        JOIN public.wallets w ON w.profile_id = p.id
        WHERE w.balance > 0
        ORDER BY w.balance DESC
        LIMIT p_limit;

    ELSIF p_criteria = 'earnings' THEN
        RETURN QUERY
        SELECT 
            p.id,
            p.name,
            p.avatar_url,
            SUM(cl.amount)::BIGINT as score,
            ROW_NUMBER() OVER (ORDER BY SUM(cl.amount) DESC) as rank_position
        FROM public.profiles p
        JOIN public.coin_ledger cl ON cl.profile_id = p.id
        WHERE cl.amount > 0
        GROUP BY p.id, p.name, p.avatar_url
        ORDER BY score DESC
        LIMIT p_limit;

    ELSIF p_criteria = 'spending' THEN
        RETURN QUERY
        SELECT 
            p.id,
            p.name,
            p.avatar_url,
            ABS(SUM(cl.amount))::BIGINT as score,
            ROW_NUMBER() OVER (ORDER BY ABS(SUM(cl.amount)) DESC) as rank_position
        FROM public.profiles p
        JOIN public.coin_ledger cl ON cl.profile_id = p.id
        WHERE cl.amount < 0
        GROUP BY p.id, p.name, p.avatar_url
        ORDER BY score DESC
        LIMIT p_limit;
    
    ELSE
        RAISE EXCEPTION 'Critério de ranking inválido: %', p_criteria;
    END IF;
END;
$$;

-- 4. Garantir permissões
GRANT EXECUTE ON FUNCTION public.get_ranking(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ranking(TEXT, INTEGER) TO anon;

-- 5. Dar 1000 moedas para o israel@email.com se ele existir (para teste de ranking)
-- Busca o ID do perfil
DO $$
DECLARE
    v_israel_id UUID;
BEGIN
    SELECT id INTO v_israel_id FROM public.profiles WHERE email = 'israel@email.com';
    IF v_israel_id IS NOT NULL THEN
        INSERT INTO public.wallets (profile_id, balance) 
        VALUES (v_israel_id, 1000)
        ON CONFLICT (profile_id) DO UPDATE SET balance = 1000;
    END IF;
END $$;
