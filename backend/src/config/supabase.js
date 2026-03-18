import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || url.includes('YOUR_PROJECT')) {
  console.warn('WARNING: SUPABASE_URL not configured. Set it in .env');
}

const supabase = (url && !url.includes('YOUR_PROJECT'))
  ? createClient(url, key)
  : null;

export default supabase;
