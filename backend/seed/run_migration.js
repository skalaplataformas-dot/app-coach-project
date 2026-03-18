import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function runSQL(sql) {
  // Use Supabase's pg_net or rpc to run raw SQL
  // Since we don't have direct SQL access, we'll use the REST API approach
  const url = `${process.env.SUPABASE_URL}/rest/v1/rpc/`;

  // Try using supabase-js to create the table via individual operations
  // First, let's try direct fetch to the Supabase SQL endpoint
  const pgUrl = process.env.SUPABASE_URL.replace('.supabase.co', '.supabase.co');

  const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  return response;
}

async function migrate() {
  console.log('=== Migration 002: Onboarding Sections ===\n');

  // Step 1: Try to add columns to profiles (these work even if column exists with IF NOT EXISTS)
  const profileColumns = [
    { name: 'medical_conditions', type: 'TEXT' },
    { name: 'injuries', type: 'TEXT' },
    { name: 'medications', type: 'TEXT' },
    { name: 'allergies', type: 'TEXT' },
    { name: 'sleep_hours', type: 'INTEGER' },
    { name: 'water_liters', type: 'DECIMAL(3,1)' },
    { name: 'stress_level', type: 'INTEGER' },
    { name: 'alcohol_frequency', type: 'TEXT' },
    { name: 'smoking', type: 'BOOLEAN' },
    { name: 'photo_front', type: 'TEXT' },
    { name: 'photo_side', type: 'TEXT' },
    { name: 'photo_back', type: 'TEXT' },
  ];

  // Test if columns exist
  const { data: testProfile, error: testErr } = await supabase
    .from('profiles')
    .select('medical_conditions')
    .limit(1);

  if (testErr && testErr.message.includes('medical_conditions')) {
    console.log('Profile columns need to be added.');
    console.log('Please run the following SQL in Supabase SQL Editor:\n');
    const sqlFile = readFileSync(join(__dirname, 'migration_002_onboarding_sections.sql'), 'utf-8');
    console.log(sqlFile);
    console.log('\n--- Copy everything above and paste in SQL Editor ---');
    process.exit(1);
  } else {
    console.log('[OK] Profile health/habits/photos columns exist');
  }

  // Step 2: Check onboarding_sections table
  const { data: existing, error: checkErr } = await supabase
    .from('onboarding_sections')
    .select('*')
    .order('sort_order');

  if (checkErr) {
    console.log('\n[NEEDED] onboarding_sections table does not exist.');
    console.log('Please run the following SQL in Supabase SQL Editor:\n');
    const sqlFile = readFileSync(join(__dirname, 'migration_002_onboarding_sections.sql'), 'utf-8');
    console.log(sqlFile);
    console.log('\n--- Copy everything above and paste in SQL Editor ---');
    process.exit(1);
  }

  if (existing.length === 0) {
    console.log('[SEEDING] Inserting default sections...');
    const { data, error } = await supabase.from('onboarding_sections').insert([
      { key: 'personal_info', title: 'Informacion Personal', description: 'Datos basicos para personalizar tu plan', icon: 'User', sort_order: 1, enabled: true, required: true },
      { key: 'measurements', title: 'Medidas Corporales', description: 'Medidas para calcular tu composicion corporal', icon: 'Ruler', sort_order: 2, enabled: true, required: true },
      { key: 'photos', title: 'Fotos de Progreso', description: 'Registro visual de tu punto de partida', icon: 'Camera', sort_order: 3, enabled: true, required: false },
      { key: 'health', title: 'Salud', description: 'Informacion medica relevante para tu seguridad', icon: 'Heart', sort_order: 4, enabled: true, required: false },
      { key: 'habits', title: 'Habitos', description: 'Tu estilo de vida actual', icon: 'Coffee', sort_order: 5, enabled: true, required: false },
      { key: 'preferences', title: 'Preferencias', description: 'Actividad fisica y alimentacion', icon: 'Settings', sort_order: 6, enabled: true, required: true },
    ]).select();

    if (error) {
      console.log('[ERROR] Seed failed:', error.message);
    } else {
      console.log('[OK] Seeded', data.length, 'sections');
    }
  } else {
    console.log('[OK] Sections exist:', existing.length, 'sections');
    existing.forEach(s => console.log(`  - ${s.key} | enabled: ${s.enabled} | required: ${s.required} | order: ${s.sort_order}`));
  }

  console.log('\n=== Migration complete ===');
}

migrate().catch(e => console.error('Migration failed:', e.message));
