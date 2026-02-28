-- ========================================================
-- FIX: Sincronização Definitiva dos Saldos
-- ========================================================
-- PROBLEMA: As 3 tabelas que armazenam saldo divergiram porque
-- o sistema antigo (etapa10) atualizava 'wallets' diretamente,
-- sem atualizar 'profiles'. Agora 'profiles' é a fonte de verdade,
-- mas seus valores estão desatualizados.
--
-- SOLUÇÃO: Tomar o MAIOR valor entre as 3 tabelas e definir
-- como saldo oficial em 'profiles', depois sincronizar as outras.
-- ========================================================

-- 1. Sincronizar profiles COM o maior valor entre as 3 tabelas
UPDATE public.profiles p
SET 
    coins_balance = GREATEST(
        COALESCE(p.coins_balance, 0),
        COALESCE(w.balance, 0),
        COALESCE(up.coins_balance, 0)
    ),
    coins_earned_total = GREATEST(
        COALESCE(p.coins_earned_total, 0),
        COALESCE(up.total_coins_earned, 0)
    ),
    updated_at = now()
FROM public.profiles p2
LEFT JOIN public.wallets w ON w.profile_id = p2.id
LEFT JOIN public.user_progress up ON up.profile_id = p2.id
WHERE p.id = p2.id;

-- 2. Agora sincronizar de profiles → wallets
INSERT INTO public.wallets (profile_id, balance, updated_at)
SELECT id, COALESCE(coins_balance, 0), now()
FROM public.profiles
ON CONFLICT (profile_id) DO UPDATE SET
    balance = EXCLUDED.balance,
    updated_at = now();

-- 3. Agora sincronizar de profiles → user_progress (apenas os campos de saldo)
INSERT INTO public.user_progress (profile_id, coins_balance, total_coins_earned)
SELECT id, COALESCE(coins_balance, 0), COALESCE(coins_earned_total, 0)
FROM public.profiles
ON CONFLICT (profile_id) DO UPDATE SET
    coins_balance = EXCLUDED.coins_balance,
    total_coins_earned = EXCLUDED.total_coins_earned,
    updated_at = now();
