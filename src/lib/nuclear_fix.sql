-- ==========================================
-- RESET NUCLEAR E CORREÇÃO DEFINITIVA (V4)
-- ==========================================

-- 1. Limpeza Profunda (Garante que nada antigo interfira)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profile_role_update ON public.profiles;
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.sync_user_role_to_auth();
DROP FUNCTION IF EXISTS public.is_admin();

-- Remove TODAS as políticas da tabela profiles
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- 2. Garantir Estrutura correta da Tabela
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS user_type TEXT NOT NULL DEFAULT 'user' CHECK (user_type IN ('admin', 'user'));

-- 3. Políticas de RLS Minimalistas e Seguras (Zero Recursão)
-- Não usamos nenhuma função que consulte a tabela profiles dentro das policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_self" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_self" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Admin Policy: USA APENAS METADADOS DO JWT (Não consulta a tabela)
CREATE POLICY "profiles_admin_all" ON public.profiles
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- 4. Gatilhos (Triggers) Reformulados

-- Função: Criar Perfil e Sincronizar Metadata (Rodando como SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
DECLARE
  v_role TEXT := 'viewer';
BEGIN
  -- Se o email for o admin inicial, já setamos como admin
  IF new.email IN ('admin@email.com', 'israel@email.com') THEN
    v_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, name, email, role, user_type, status)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)), 
    new.email, 
    v_role, 
    CASE WHEN v_role = 'admin' THEN 'admin' ELSE 'user' END,
    'active'
  );

  -- IMPORTANTE: Atualiza o metadado no Auth para o RLS funcionar instantaneamente
  UPDATE auth.users 
  SET raw_user_meta_data = raw_user_meta_data || 
    jsonb_build_object(
      'role', v_role, 
      'user_type', CASE WHEN v_role = 'admin' THEN 'admin' ELSE 'user' END
    )
  WHERE id = new.id;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Forçar reparo nos usuários existentes
UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin", "user_type": "admin"}' WHERE email IN ('admin@email.com', 'israel@email.com');
UPDATE public.profiles SET role = 'admin', user_type = 'admin' WHERE email IN ('admin@email.com', 'israel@email.com');
