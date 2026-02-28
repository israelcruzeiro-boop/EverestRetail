-- =============================================
-- ETAPA 24: MÓDULO BLOG COMPLETO
-- =============================================

-- 1. Tabela de Posts
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Avaliações (Ratings)
CREATE TABLE IF NOT EXISTS public.post_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, profile_id)
);

-- 3. Tabela de Comentários
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Função para Recalcular Média de Avaliações
CREATE OR REPLACE FUNCTION public.update_post_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.posts
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM public.post_ratings
            WHERE post_id = NEW.post_id
        ),
        total_votes = (
            SELECT COUNT(*)
            FROM public.post_ratings
            WHERE post_id = NEW.post_id
        )
    WHERE id = NEW.post_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para Avaliações
DROP TRIGGER IF EXISTS tr_update_post_rating ON public.post_ratings;
CREATE TRIGGER tr_update_post_rating
AFTER INSERT OR UPDATE ON public.post_ratings
FOR EACH ROW EXECUTE FUNCTION public.update_post_rating();

-- 6. Políticas de RLS (Row Level Security)

-- Posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts visíveis para todos os usuários autenticados" 
ON public.posts FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Usuários autenticados podem criar posts" 
ON public.posts FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Apenas dono pode editar seu post" 
ON public.posts FOR UPDATE 
TO authenticated 
USING (auth.uid() = profile_id);

CREATE POLICY "Apenas dono ou admin pode deletar seu post" 
ON public.posts FOR DELETE 
TO authenticated 
USING (auth.uid() = profile_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));

-- Ratings
ALTER TABLE public.post_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings visíveis para todos os usuários autenticados" 
ON public.post_ratings FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Usuários autenticados podem avaliar uma vez" 
ON public.post_ratings FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Usuário pode editar sua avaliação" 
ON public.post_ratings FOR UPDATE 
TO authenticated 
USING (auth.uid() = profile_id);

-- Comments
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Comentários visíveis para todos os usuários autenticados" 
ON public.post_comments FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Usuários autenticados podem comentar" 
ON public.post_comments FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Apenas dono ou admin pode deletar comentário" 
ON public.post_comments FOR DELETE 
TO authenticated 
USING (auth.uid() = profile_id OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));
