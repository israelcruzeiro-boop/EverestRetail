-- =============================================
-- ETAPA 24.1: CORREÇÃO DE TRIGGER E RLS (BLOG)
-- =============================================

-- Atualizar a função para SECURITY DEFINER para permitir que usuários 
-- que não são donos do post possam atualizar as médias ao avaliar.
CREATE OR REPLACE FUNCTION public.update_post_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.posts
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM public.post_ratings
            WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
        ),
        total_votes = (
            SELECT COUNT(*)
            FROM public.post_ratings
            WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
        )
    WHERE id = COALESCE(NEW.post_id, OLD.post_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que a trigger também dispare ao deletar uma avaliação
DROP TRIGGER IF EXISTS tr_update_post_rating ON public.post_ratings;
CREATE TRIGGER tr_update_post_rating
AFTER INSERT OR UPDATE OR DELETE ON public.post_ratings
FOR EACH ROW EXECUTE FUNCTION public.update_post_rating();
