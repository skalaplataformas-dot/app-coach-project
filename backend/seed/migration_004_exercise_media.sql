-- Migration 004: Add media columns to exercises
-- Run this in Supabase SQL Editor

-- Video/GIF URL for custom exercise demos
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT NULL;

-- ExerciseDB ID for automatic GIF fallback
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS exercisedb_id TEXT DEFAULT NULL;

-- Primary muscle group for visual categorization
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS muscle_group TEXT DEFAULT NULL;

-- Step-by-step instructions
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS instructions TEXT[] DEFAULT NULL;
