-- Tabla de registros de progreso (peso, medidas, fotos en el tiempo)
CREATE TABLE IF NOT EXISTS progress_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),

  -- Peso
  weight_kg DECIMAL(5,1),

  -- Medidas corporales (cm)
  neck_cm DECIMAL(5,1),
  waist_cm DECIMAL(5,1),
  hip_cm DECIMAL(5,1),
  chest_cm DECIMAL(5,1),
  arm_cm DECIMAL(5,1),
  thigh_cm DECIMAL(5,1),

  -- Composicion corporal (calculada o estimada)
  body_fat_pct DECIMAL(5,2),

  -- Fotos de progreso
  photo_front TEXT,
  photo_side TEXT,
  photo_back TEXT,

  -- Notas del asesorado o coach
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indice para consultas rapidas por usuario y fecha
CREATE INDEX IF NOT EXISTS idx_progress_user_date ON progress_entries(user_id, recorded_at DESC);

-- RLS: usuarios solo ven sus propios registros
ALTER TABLE progress_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON progress_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON progress_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin/coach puede ver todo (via service_role_key en backend)
