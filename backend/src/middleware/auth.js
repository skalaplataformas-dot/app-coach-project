import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import supabase from '../config/supabase.js';
import { trackActivity } from './trackActivity.js';

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const authClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const { data: { user }, error } = await authClient.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Check if user account is deactivated
  const { data: profile } = await supabase
    .from('profiles')
    .select('deactivated_at')
    .eq('id', user.id)
    .single();

  if (profile?.deactivated_at) {
    return res.status(403).json({
      error: 'Cuenta desactivada. Contacta al administrador para reactivarla.',
    });
  }

  req.user = user;
  req.token = token;

  // Track activity (fire-and-forget, throttled)
  trackActivity(req, res, next);
}
