-- APP COACH MVP — Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================
-- 1. PROFILES (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  sex TEXT CHECK (sex IN ('M', 'F')),
  age INTEGER,
  goal TEXT CHECK (goal IN ('lose_weight', 'gain_muscle', 'get_shredded')),
  body_type TEXT CHECK (body_type IN ('thin', 'average', 'heavy')),
  weight_kg DECIMAL(5,1),
  target_weight_kg DECIMAL(5,1),
  height_cm DECIMAL(5,1),
  neck_cm DECIMAL(5,1),
  waist_cm DECIMAL(5,1),
  hip_cm DECIMAL(5,1),
  activity_level INTEGER CHECK (activity_level BETWEEN 1 AND 6),
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  meals_per_day INTEGER CHECK (meals_per_day BETWEEN 2 AND 6),
  diet_type TEXT CHECK (diet_type IN ('none', 'vegetarian', 'vegan', 'keto', 'mediterranean')),
  body_fat_estimate DECIMAL(5,1),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 2. METABOLIC RESULTS
-- ============================================
CREATE TABLE metabolic_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bmi DECIMAL(5,2),
  avg_body_fat_pct DECIMAL(5,2),
  avg_lean_mass_kg DECIMAL(5,2),
  avg_fat_mass_kg DECIMAL(5,2),
  muscle_mass_kg DECIMAL(5,2),
  bone_mass_kg DECIMAL(5,2),
  avg_rmr DECIMAL(7,2),
  avg_tdee DECIMAL(7,2),
  eta DECIMAL(7,2),
  calculation_data JSONB,
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. NUTRITION PLANS
-- ============================================
CREATE TABLE nutrition_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  daily_calories INTEGER,
  protein_g INTEGER,
  carbs_g INTEGER,
  fat_g INTEGER,
  deficit_or_surplus INTEGER,
  meals_per_day INTEGER,
  meal_distribution JSONB,
  timeline_days INTEGER,
  projected_change_kg DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. FOODS DATABASE
-- ============================================
CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Proteinas', 'Carbohidratos', 'Frutas', 'Grasas', 'Empacados')),
  serving_size TEXT,
  serving_unit TEXT,
  calories DECIMAL(7,1),
  protein_g DECIMAL(6,1),
  carbs_g DECIMAL(6,1),
  fat_g DECIMAL(6,1),
  sodium_mg DECIMAL(7,1),
  fiber_g DECIMAL(6,1),
  sugar_g DECIMAL(6,1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. WORKOUTS
-- ============================================
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_minutes INTEGER,
  category TEXT CHECK (category IN ('strength', 'cardio', 'flexibility', 'hiit')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. EXERCISES
-- ============================================
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sets INTEGER,
  reps TEXT,
  rest_seconds INTEGER,
  sort_order INTEGER DEFAULT 0,
  notes TEXT
);

-- ============================================
-- 7. WORKOUT LOGS
-- ============================================
CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES workouts(id),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INTEGER,
  notes TEXT
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE metabolic_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users read/update own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Metabolic results: users CRUD own
CREATE POLICY "Users can view own metabolic results" ON metabolic_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own metabolic results" ON metabolic_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Nutrition plans: users CRUD own
CREATE POLICY "Users can view own nutrition plans" ON nutrition_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nutrition plans" ON nutrition_plans FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Foods: all authenticated can read, admin can CRUD
CREATE POLICY "Authenticated can view foods" ON foods FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin can insert foods" ON foods FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can update foods" ON foods FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admin can delete foods" ON foods FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Workouts & exercises: all authenticated can read
CREATE POLICY "Authenticated can view workouts" ON workouts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can view exercises" ON exercises FOR SELECT TO authenticated USING (true);

-- Workout logs: users CRUD own
CREATE POLICY "Users can view own workout logs" ON workout_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout logs" ON workout_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
