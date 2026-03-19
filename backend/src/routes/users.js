import { Router } from 'express';
import supabase from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { validateProfile } from '../middleware/validate.js';

const router = Router();

// GET /api/users/me
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    // Get latest metabolic result (use array to avoid .single() error when no rows)
    const { data: metabolicArr } = await supabase
      .from('metabolic_results')
      .select('*')
      .eq('user_id', req.user.id)
      .order('calculated_at', { ascending: false })
      .limit(1);
    const metabolic = metabolicArr?.[0] || null;

    res.json({ ...profile, metabolic_result: metabolic });
  } catch (err) {
    next(err);
  }
});

// PUT /api/users/me
router.put('/me', requireAuth, ...validateProfile, async (req, res, next) => {
  try {
    const allowed = [
      'full_name', 'sex', 'age', 'goal', 'body_type',
      'weight_kg', 'target_weight_kg', 'height_cm',
      'neck_cm', 'waist_cm', 'hip_cm',
      'activity_level', 'experience_level',
      'meals_per_day', 'diet_type', 'body_fat_estimate',
      'onboarding_completed',
      // Health
      'medical_conditions', 'injuries', 'medications', 'allergies',
      // Habits
      'sleep_hours', 'water_liters', 'stress_level', 'alcohol_frequency', 'smoking',
      // Photos
      'photo_front', 'photo_side', 'photo_back',
      // Preferences
      'preferred_foods',
    ];

    // Map frontend keys to DB column names
    const keyMap = { bodyType: 'body_type' };

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }
    // Also check mapped keys
    for (const [frontKey, dbKey] of Object.entries(keyMap)) {
      if (req.body[frontKey] !== undefined) {
        updates[dbKey] = req.body[frontKey];
      }
    }
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/users/me/stats
router.get('/me/stats', requireAuth, async (req, res, next) => {
  try {
    // Total workouts completed
    const { count: totalWorkouts } = await supabase
      .from('workout_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id);

    // Workouts this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { count: weekWorkouts } = await supabase
      .from('workout_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.user.id)
      .gte('completed_at', weekAgo.toISOString());

    // Current streak (consecutive days with workouts)
    const { data: logs } = await supabase
      .from('workout_logs')
      .select('completed_at')
      .eq('user_id', req.user.id)
      .order('completed_at', { ascending: false })
      .limit(60);

    let streak = 0;
    if (logs && logs.length > 0) {
      const days = new Set(logs.map(l =>
        new Date(l.completed_at).toISOString().split('T')[0]
      ));
      const today = new Date();
      for (let i = 0; i < 60; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        if (days.has(key)) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }
    }

    res.json({
      total_workouts: totalWorkouts || 0,
      week_workouts: weekWorkouts || 0,
      streak,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
