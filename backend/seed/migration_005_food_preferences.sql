-- Migration 005: Add food preferences column to profiles
-- Run this in Supabase SQL Editor

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_foods JSONB DEFAULT NULL;

-- Structure example:
-- {
--   "Proteinas": ["Pechuga de Pollo", "Salmon", "Huevo"],
--   "Carbohidratos": ["Arroz", "Avena"],
--   "Grasas": ["Aguacate", "Almendras"]
-- }
