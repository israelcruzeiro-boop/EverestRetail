-- ==========================================
-- ETAPA 4: SUPABASE STORAGE — BUCKETS + POLICIES
-- Rode no SQL Editor do Supabase
-- ==========================================

-- ============================================
-- 1. BUCKET: product-images (hero, logo, gallery)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. BUCKET: partner-uploads (logos, covers de solicitações)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'partner-uploads',
  'partner-uploads',
  true,
  2097152, -- 2MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. POLICIES: product-images
-- ============================================

-- Qualquer pessoa pode ver (bucket público)
CREATE POLICY "product_images_public_read" ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'product-images');

-- Admin pode fazer upload
CREATE POLICY "product_images_admin_upload" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'product-images'
    AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Admin pode atualizar
CREATE POLICY "product_images_admin_update" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- Admin pode deletar
CREATE POLICY "product_images_admin_delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'product-images'
    AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );

-- ============================================
-- 4. POLICIES: partner-uploads
-- ============================================

-- Qualquer pessoa pode ver (bucket público)
CREATE POLICY "partner_uploads_public_read" ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'partner-uploads');

-- Qualquer usuário autenticado pode fazer upload (ao enviar solicitação)
CREATE POLICY "partner_uploads_auth_upload" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'partner-uploads');

-- O dono pode atualizar/deletar seus arquivos (path começa com user id)
CREATE POLICY "partner_uploads_owner_manage" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'partner-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "partner_uploads_owner_delete" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'partner-uploads'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admin pode gerenciar tudo
CREATE POLICY "partner_uploads_admin_all" ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'partner-uploads'
    AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  );
