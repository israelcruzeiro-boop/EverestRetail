-- ==========================================
-- SCRIPT DE REPARO: ADICIONAR USER_TYPE
-- ==========================================

-- 1. Adiciona a coluna se ela não existir
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'user_type') THEN
        ALTER TABLE public.profiles ADD COLUMN user_type TEXT NOT NULL DEFAULT 'user' CHECK (user_type IN ('admin', 'user'));
    END IF;
END $$;

-- 2. Atualiza os dados existentes baseados na role
UPDATE public.profiles 
SET user_type = CASE WHEN role = 'admin' THEN 'admin' ELSE 'user' END;

-- 3. Atualiza a Função de Novo Usuário (Handle New User)
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

  -- Sincroniza role e user_type no JWT
  UPDATE auth.users 
  SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('role', 'viewer', 'user_type', 'user')
  WHERE id = new.id;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Atualiza a Função de Sincronização (Sync Role)
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

-- 5. Garante que o Trigger use a nova função (BEFORE para poder alterar NEW.user_type)
DROP TRIGGER IF EXISTS on_profile_role_update ON public.profiles;
CREATE TRIGGER on_profile_role_update
  BEFORE UPDATE OF role, user_type ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.sync_user_role_to_auth();
