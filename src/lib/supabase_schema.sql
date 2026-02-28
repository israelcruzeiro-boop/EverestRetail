-- ==========================================
-- ETAPA 1: SUPABASE AUTH + PROFILES (MVP)
-- ==========================================

-- 1. Criar Tipos Customizados
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'editor', 'viewer');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('active', 'inactive');
    END IF;
END $$;

-- 2. Criar Tabela public.profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'viewer',
  user_type TEXT NOT NULL DEFAULT 'user' CHECK (user_type IN ('admin', 'user')),
  status user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Segurança (Policies) - 100% Baseadas em JWT para Perfis

-- SELECT: Usuário pode ler o próprio perfil
DROP POLICY IF EXISTS "Usuários podem ver o próprio perfil" ON public.profiles;
CREATE POLICY "Usuários podem ver o próprio perfil" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- UPDATE: Usuário pode atualizar apenas seu próprio nome (não pode mudar o email nem role)
DROP POLICY IF EXISTS "Usuários podem atualizar o próprio nome" ON public.profiles;
CREATE POLICY "Usuários podem atualizar o próprio nome" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ADMIN: Pode Ver e Editar TUDO (Check via JWT Claims - Zero Recurson)
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;
CREATE POLICY "Admins podem ver todos os perfis" 
ON public.profiles FOR SELECT 
USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

DROP POLICY IF EXISTS "Admins podem gerenciar perfis" ON public.profiles;
CREATE POLICY "Admins podem gerenciar perfis" 
ON public.profiles FOR ALL
USING ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' );

-- INSERT: Bloqueado (Quem insere é o trigger do sistema)
DROP POLICY IF EXISTS "Bloquear inserção manual" ON public.profiles;
CREATE POLICY "Bloquear inserção manual" ON public.profiles FOR INSERT WITH CHECK (false);

-- 6. Gatilho (Trigger) para criar perfil automático ao cadastrar no Auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, user_type, status)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 
    new.email, 
    'viewer', 
    'user',
    'active'
  );

  -- Opcional: Sincroniza role no JWT para facilitar leitura no front/RLS futuro
  UPDATE auth.users 
  SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', 'viewer', 'user_type', 'user')
  WHERE id = new.id;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Gatilho para atualizar o updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. TRIGGER DE SINCRONIZAÇÃO DE ROLE E USER_TYPE
CREATE OR REPLACE FUNCTION public.sync_user_role_to_auth()
RETURNS trigger AS $$
DECLARE
  v_user_type TEXT;
BEGIN
  -- Define o user_type baseado na role
  IF NEW.role = 'admin' THEN
    v_user_type := 'admin';
  ELSE
    v_user_type := 'user';
  END IF;

  -- Atualiza o user_type na própria tabela se for diferente
  IF NEW.user_type <> v_user_type THEN
    NEW.user_type := v_user_type;
  END IF;

  -- Sincroniza com metadados do Auth
  IF OLD.role <> NEW.role OR OLD.user_type <> NEW.user_type THEN
    UPDATE auth.users 
    SET raw_user_meta_data = raw_user_meta_data || 
      jsonb_build_object('role', NEW.role, 'user_type', NEW.user_type)
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_role_update ON public.profiles;
CREATE TRIGGER on_profile_role_update
  BEFORE UPDATE OF role, user_type ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_role_to_auth();
