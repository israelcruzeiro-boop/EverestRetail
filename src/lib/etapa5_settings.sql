-- ==========================================
-- ETAPA 5: SETTINGS — CONFIGURAÇÕES GERAIS
-- Rode no SQL Editor do Supabase
-- ==========================================

BEGIN;

-- ============================================
-- 1. TABELA: public.settings
-- ============================================
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 2. RLS: Configurações
-- ============================================
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Admin tem acesso total
CREATE POLICY "settings_admin_all" ON public.settings
    FOR ALL
    TO authenticated
    USING (public.is_admin());

-- Leitura pública das configurações (permitindo acesso a informações não sensíveis)
-- Nota: Caso queira proteger chaves específicas, pode-se filtrar no SELECT ou criar policies por chave.
CREATE POLICY "settings_public_read" ON public.settings
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- ============================================
-- 3. SEED: Configurações Iniciais
-- ============================================
INSERT INTO public.settings (key, value, description)
VALUES 
    ('site_info', '{
        "name": "Marketplace ENT2",
        "description": "Ecossistema tecnológico influente",
        "support_email": "suporte@exemplo.com",
        "support_phone": "(11) 99999-9999"
    }'::jsonb, 'Informações básicas do site'),
    ('social_links', '{
        "instagram": "https://instagram.com",
        "linkedin": "https://linkedin.com",
        "whatsapp": "https://wa.me/5511999999999"
    }'::jsonb, 'Links para redes sociais'),
    ('legal_texts', '{
        "terms_of_use": "Termos de uso iniciais...",
        "privacy_policy": "Política de privacidade inicial..."
    }'::jsonb, 'Documentação jurídica')
ON CONFLICT (key) DO NOTHING;

COMMIT;
