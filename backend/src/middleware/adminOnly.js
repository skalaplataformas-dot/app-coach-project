import supabase from '../config/supabase.js';

export async function adminOnly(req, res, next) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', req.user.id)
    .single();

  if (error || profile?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
}
