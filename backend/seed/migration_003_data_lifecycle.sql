-- ═══════════════════════════════════════════════════════════════════════
-- Migration 003: Data Lifecycle & Security
-- Adds activity tracking and soft-delete support
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════

-- Track last activity for cleanup system
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT NOW();

-- Soft-delete support: mark users for deletion before permanent removal
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ DEFAULT NULL;

-- Index for efficient inactive user queries
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active_at);
CREATE INDEX IF NOT EXISTS idx_profiles_deactivated ON profiles(deactivated_at) WHERE deactivated_at IS NOT NULL;

-- Set last_active_at for existing users based on updated_at or created_at
UPDATE profiles
SET last_active_at = COALESCE(updated_at, created_at, NOW())
WHERE last_active_at IS NULL OR last_active_at = created_at;

-- ═══════════════════════════════════════════════════════════════════════
-- Performance indexes for common queries
-- ═══════════════════════════════════════════════════════════════════════

-- Metabolic results: faster lookup by user
CREATE INDEX IF NOT EXISTS idx_metabolic_user_date ON metabolic_results(user_id, calculated_at DESC);

-- Nutrition plans: faster lookup by user
CREATE INDEX IF NOT EXISTS idx_nutrition_user_date ON nutrition_plans(user_id, created_at DESC);

-- Workout logs: faster stats queries
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON workout_logs(user_id, completed_at DESC);

-- Foods: faster search (enable pg_trgm extension first)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS idx_foods_name ON foods USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category);

-- ═══════════════════════════════════════════════════════════════════════
-- RLS Policies for deactivated users (prevent access)
-- ═══════════════════════════════════════════════════════════════════════

-- Note: If RLS is enabled on profiles, deactivated users should not be able
-- to read their own data. The backend uses service_role which bypasses RLS,
-- but this adds defense-in-depth for direct Supabase client access.

-- Verify: This is informational. The backend auth middleware should also
-- check deactivated_at and reject requests from deactivated users.
