-- ========================================================
-- ETAPA 34: GARANTIA DE VISUALIZAÇÃO DE POSTS E PERFIS
-- ========================================================

-- Certifica que publicações são recuperáveis por anônimos e pessoas logadas
-- É crucial para que o Home.tsx do visitante e as requisições do SSR/SSG funcionem perfeitamente.

-- 1. Posts devem ser visíveis publicamente
DROP POLICY IF EXISTS "posts_select_all" ON public.posts;
CREATE POLICY "posts_select_all" ON public.posts
    FOR SELECT 
    USING (true);

-- 2. Perfis também precisam ser visíveis para renderizar os avatares (Inner Join / Left Join restrito pelo RLS da Profile)
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;
CREATE POLICY "profiles_select_public" ON public.profiles
    FOR SELECT 
    USING (true);

-- 3. A view de notas/avaliações (se aplicável ao card da home)
DROP POLICY IF EXISTS "post_ratings_select_all" ON public.post_ratings;
CREATE POLICY "post_ratings_select_all" ON public.post_ratings
    FOR SELECT 
    USING (true);

-- 4. Liberando Roles (caso as Policies não sejam suficientes se a Grant não existir)
GRANT SELECT ON public.posts TO anon;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.post_ratings TO anon;
GRANT SELECT ON public.posts TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.post_ratings TO authenticated;
