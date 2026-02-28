-- Tabela para carrossel dinâmico da Hero
CREATE TABLE IF NOT EXISTS public.hero_carousel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    alt_text TEXT,
    title TEXT,
    subtitle TEXT,
    cta_label TEXT DEFAULT 'Explorar Marketplace',
    link_url TEXT DEFAULT '/marketplace',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS
ALTER TABLE public.hero_carousel ENABLE ROW LEVEL SECURITY;

-- Permissões de Leitura (Público)
CREATE POLICY "Leitura pública para hero_carousel"
ON public.hero_carousel FOR SELECT
TO anon, authenticated
USING (true);

-- Permissões de Gestão (Admin)
CREATE POLICY "Gestão total para admins no hero_carousel"
ON public.hero_carousel FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Seed Inicial com as imagens de marca enviadas
INSERT INTO public.hero_carousel (image_url, alt_text, sort_order)
VALUES 
('/hero/hero-1.jpg', 'Everest Retail Branding', 1),
('/hero/hero-2.jpg', 'Everest Outdoor Billboard', 2),
('/hero/hero-3.jpg', 'Everest Corporate Office', 3),
('/hero/hero-4.jpg', 'Everest Strategic Advertising', 4),
('/hero/hero-5.jpg', 'Everest Urban Media', 5)
ON CONFLICT DO NOTHING;
