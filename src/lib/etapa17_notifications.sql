-- ============================================
-- TABELA: admin_notifications
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver e gerenciar notificações
CREATE POLICY "admin_notifications_all" ON public.admin_notifications
  FOR ALL USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Trigger para updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.admin_notifications;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.admin_notifications
  FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.admin_notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.admin_notifications(created_at DESC);
