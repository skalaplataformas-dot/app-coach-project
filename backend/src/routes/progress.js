import { Router } from 'express';
import supabase from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/progress — get current user's progress history
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    const { data, error } = await supabase
      .from('progress_entries')
      .select('*')
      .eq('user_id', req.user.id)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    next(err);
  }
});

// POST /api/progress — record a new progress entry
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const allowed = [
      'weight_kg', 'neck_cm', 'waist_cm', 'hip_cm',
      'chest_cm', 'arm_cm', 'thigh_cm', 'body_fat_pct',
      'photo_front', 'photo_side', 'photo_back', 'notes',
    ];

    const entry = { user_id: req.user.id };
    let hasData = false;
    for (const key of allowed) {
      if (req.body[key] !== undefined && req.body[key] !== null && req.body[key] !== '') {
        entry[key] = req.body[key];
        hasData = true;
      }
    }

    if (!hasData) {
      return res.status(400).json({ error: 'Debes incluir al menos un dato (peso, medida o foto)' });
    }

    // Allow custom date for backdating entries
    if (req.body.recorded_at) {
      entry.recorded_at = req.body.recorded_at;
    }

    const { data, error } = await supabase
      .from('progress_entries')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;

    // Also update the profile with latest weight/measurements if provided
    const profileUpdates = {};
    if (entry.weight_kg) profileUpdates.weight_kg = entry.weight_kg;
    if (entry.neck_cm) profileUpdates.neck_cm = entry.neck_cm;
    if (entry.waist_cm) profileUpdates.waist_cm = entry.waist_cm;
    if (entry.hip_cm) profileUpdates.hip_cm = entry.hip_cm;

    if (Object.keys(profileUpdates).length > 0) {
      profileUpdates.updated_at = new Date().toISOString();
      await supabase.from('profiles').update(profileUpdates).eq('id', req.user.id);
    }

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/progress/user/:userId — coach gets a specific user's progress
router.get('/user/:userId', requireAuth, async (req, res, next) => {
  try {
    // Verify coach has access to this user
    const { data: profile } = await supabase
      .from('profiles')
      .select('coach_id')
      .eq('id', req.params.userId)
      .single();

    if (!profile) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Check if requester is admin or the user's coach
    const { data: requester } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (requester?.role !== 'admin' && profile.coach_id !== req.user.id) {
      return res.status(403).json({ error: 'No tienes acceso a este usuario' });
    }

    const limit = Math.min(Number(req.query.limit) || 50, 100);

    const { data, error } = await supabase
      .from('progress_entries')
      .select('*')
      .eq('user_id', req.params.userId)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    next(err);
  }
});

export default router;
