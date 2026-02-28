-- ========================================================
-- FIX: Blog Ratings Persistence
-- ========================================================
-- PROBLEMA: As avaliações não persistem porque:
-- 1. O trigger update_post_rating tenta UPDATE na tabela posts
--    mas a RLS de posts só permite UPDATE para o DONO do post.
--    Quando outro usuário avalia, o trigger falha silenciosamente.
-- 2. A função precisa ser SECURITY DEFINER para bypassar a RLS.
-- 
-- SOLUÇÃO: Recriar a função com SECURITY DEFINER e garantir
-- que funcione em INSERT, UPDATE e DELETE.
-- ========================================================

-- 1. Recriar a função com SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.update_post_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_post_id UUID;
BEGIN
    v_post_id := COALESCE(NEW.post_id, OLD.post_id);
    
    UPDATE public.posts
    SET 
        average_rating = (
            SELECT ROUND(COALESCE(AVG(rating)::numeric, 0), 1)
            FROM public.post_ratings
            WHERE post_id = v_post_id
        ),
        total_votes = (
            SELECT COUNT(*)
            FROM public.post_ratings
            WHERE post_id = v_post_id
        )
    WHERE id = v_post_id;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Recriar o trigger (INSERT, UPDATE e DELETE)
DROP TRIGGER IF EXISTS tr_update_post_rating ON public.post_ratings;
CREATE TRIGGER tr_update_post_rating
AFTER INSERT OR UPDATE OR DELETE ON public.post_ratings
FOR EACH ROW EXECUTE FUNCTION public.update_post_rating();

-- 3. Garantir que a RLS de post_ratings permita DELETE (para re-avaliações via upsert)
-- Supabase upsert com ON CONFLICT pode internamente fazer DELETE + INSERT em alguns casos
DROP POLICY IF EXISTS "Usuário pode deletar sua avaliação" ON public.post_ratings;
CREATE POLICY "Usuário pode deletar sua avaliação"
ON public.post_ratings FOR DELETE
TO authenticated
USING (auth.uid() = profile_id);

-- 4. Sincronizar dados existentes
UPDATE public.posts p
SET 
    average_rating = (SELECT ROUND(COALESCE(AVG(rating)::numeric, 0), 1) FROM public.post_ratings WHERE post_id = p.id),
    total_votes = (SELECT COUNT(*) FROM public.post_ratings WHERE post_id = p.id);
