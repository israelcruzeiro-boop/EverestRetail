-- ==========================================
-- ETAPA 16: SISTEMA DE RANKING DINÂMICO
-- ==========================================

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

-- Garantir que todos possam ler o ranking (é público para usuários autenticados)
GRANT EXECUTE ON FUNCTION public.get_ranking(TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ranking(TEXT, INTEGER) TO anon;
