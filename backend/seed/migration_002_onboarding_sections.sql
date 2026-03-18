-- MIGRATION 002: Onboarding Sections + Health/Habits/Photos columns
-- Run this in Supabase SQL Editor AFTER schema.sql

-- ============================================
-- 1. NEW COLUMNS IN PROFILES (health, habits, photos)
-- ============================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS medical_conditions TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS injuries TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS medications TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS allergies TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sleep_hours INTEGER CHECK (sleep_hours BETWEEN 3 AND 12);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS water_liters DECIMAL(3,1);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 5);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alcohol_frequency TEXT CHECK (alcohol_frequency IN ('never', 'occasional', 'moderate', 'frequent'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS smoking BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_front TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_side TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_back TEXT;

-- ============================================
-- 2. ONBOARDING SECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS onboarding_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'ClipboardList',
  sort_order INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE onboarding_sections ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read sections (needed for onboarding flow)
CREATE POLICY "Authenticated can view onboarding sections"
  ON onboarding_sections FOR SELECT TO authenticated USING (true);

-- Only admins can modify sections
CREATE POLICY "Admin can insert onboarding sections"
  ON onboarding_sections FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can update onboarding sections"
  ON onboarding_sections FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can delete onboarding sections"
  ON onboarding_sections FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================
-- 3. SEED DEFAULT SECTIONS
-- ============================================
INSERT INTO onboarding_sections (key, title, description, icon, sort_order, enabled, required)
VALUES
  ('personal_info', 'Informacion Personal', 'Datos basicos para personalizar tu plan', 'User', 1, true, true),
  ('measurements', 'Medidas Corporales', 'Medidas para calcular tu composicion corporal', 'Ruler', 2, true, true),
  ('photos', 'Fotos de Progreso', 'Registro visual de tu punto de partida', 'Camera', 3, true, false),
  ('health', 'Salud', 'Informacion medica relevante para tu seguridad', 'Heart', 4, true, false),
  ('habits', 'Habitos', 'Tu estilo de vida actual', 'Coffee', 5, true, false),
  ('preferences', 'Preferencias', 'Actividad fisica y alimentacion', 'Settings', 6, true, true)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 4. SUPABASE STORAGE BUCKET FOR PHOTOS
-- ============================================
-- Run this separately in SQL Editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('progress-photos', 'progress-photos', false);
--
-- Then add storage policies:
-- CREATE POLICY "Users can upload own photos" ON storage.objects
--   FOR INSERT TO authenticated WITH CHECK (bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
-- CREATE POLICY "Users can view own photos" ON storage.objects
--   FOR SELECT TO authenticated USING (bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
