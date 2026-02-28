-- ========================================================
-- ETAPA 24.2: CORREÇÃO ABRANGENTE DO MÓDULO BLOG
-- ========================================================

-- 1. Garantir que as colunas de agregação existem na tabela posts
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='average_rating') THEN
        ALTER TABLE public.posts ADD COLUMN average_rating NUMERIC DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='posts' AND column_name='total_votes') THEN
        ALTER TABLE public.posts ADD COLUMN total_votes INTEGER DEFAULT 0;
    END IF;
END $$;

-- 2. Corrigir a função de atualização de média (SECURITY DEFINER ignora RLS)
CREATE OR REPLACE FUNCTION public.update_post_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_post_id UUID;
BEGIN
    -- Determina o ID do post (funciona para INSERT, UPDATE e DELETE)
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
    
    RETURN NULL; -- AFTER trigger pode retornar NULL
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recriar Trigger (Garante que dispare sempre)
DROP TRIGGER IF EXISTS tr_update_post_rating ON public.post_ratings;
CREATE TRIGGER tr_update_post_rating
AFTER INSERT OR UPDATE OR DELETE ON public.post_ratings
FOR EACH ROW EXECUTE FUNCTION public.update_post_rating();

-- 4. Permissões de Storage para Imagens do Blog (Bucket partner-uploads)
-- Assumindo que o bucket 'partner-uploads' já existe.
-- Se não existir, o repositório usará fallback ou dará erro de bucket not found.
-- Esta política permite que usuários autenticados façam upload para sua própria pasta /blog/
DO $$
BEGIN
    -- Permitir INSERT no bucket partner-uploads para usuários autenticados
    -- Nota: O caminho no repositório é partner-uploads/[userId]/blog/[fileName]
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('partner-uploads', 'partner-uploads', true)
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Política de Upload: Qualquer autenticado pode subir se for no seu diretório (blogRepo usa uploadPartnerImage)
DROP POLICY IF EXISTS "Permitir upload de fotos do blog para autenticados" ON storage.objects;
CREATE POLICY "Permitir upload de fotos do blog para autenticados"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'partner-uploads');

DROP POLICY IF EXISTS "Permitir leitura pública de fotos do blog" ON storage.objects;
CREATE POLICY "Permitir leitura pública de fotos do blog"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'partner-uploads');

-- 5. Sincronizar dados existentes (caso já existam avaliações)
UPDATE public.posts p
SET 
    average_rating = (SELECT ROUND(COALESCE(AVG(rating)::numeric, 0), 1) FROM public.post_ratings WHERE post_id = p.id),
    total_votes = (SELECT COUNT(*) FROM public.post_ratings WHERE post_id = p.id);
