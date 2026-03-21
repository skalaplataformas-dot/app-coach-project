import { Router } from 'express';
import supabase from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// GET /api/coach/users — list all non-admin users with summary data
router.get('/users', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, full_name, sex, age, goal, weight_kg, target_weight_kg, height_cm, body_type, activity_level, onboarding_completed, created_at, updated_at, last_active_at, deactivated_at, coach_id')
      .eq('coach_id', req.user.id)
      .neq('role', 'admin')
      .is('deactivated_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch latest metabolic result for each user
    const userIds = (users || []).map(u => u.id);
    let metabolicMap = {};
    let nutritionMap = {};
    let statsMap = {};

    if (userIds.length > 0) {
      // Get latest metabolic results
      const { data: metabolics } = await supabase
        .from('metabolic_results')
        .select('user_id, bmi, avg_body_fat_pct, avg_tdee, muscle_mass_kg, calculated_at')
        .in('user_id', userIds)
        .order('calculated_at', { ascending: false });

      // Keep only latest per user
      for (const m of (metabolics || [])) {
        if (!metabolicMap[m.user_id]) metabolicMap[m.user_id] = m;
      }

      // Get latest nutrition plans
      const { data: plans } = await supabase
        .from('nutrition_plans')
        .select('user_id, daily_calories, protein_g, carbs_g, fat_g, goal, created_at')
        .in('user_id', userIds)
        .order('created_at', { ascending: false });

      for (const p of (plans || [])) {
        if (!nutritionMap[p.user_id]) nutritionMap[p.user_id] = p;
      }

      // Get workout counts
      const { data: logs } = await supabase
        .from('workout_logs')
        .select('user_id, completed_at')
        .in('user_id', userIds);

      for (const l of (logs || [])) {
        statsMap[l.user_id] = (statsMap[l.user_id] || 0) + 1;
      }
    }

    const enrichedUsers = (users || []).map(u => ({
      ...u,
      metabolic: metabolicMap[u.id] || null,
      nutrition: nutritionMap[u.id] || null,
      total_workouts: statsMap[u.id] || 0,
    }));

    res.json(enrichedUsers);
  } catch (err) {
    next(err);
  }
});

// GET /api/coach/users/:userId — full detail of a specific user
router.get('/users/:userId', requireAuth, adminOnly, async (req, res, next) => {
  try {
    // Profile — only if assigned to this coach
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.params.userId)
      .eq('coach_id', req.user.id)
      .single();

    if (profileErr || !profile) {
      return res.status(404).json({ error: 'Usuario no encontrado o no asignado a este coach' });
    }

    // Latest metabolic result
    const { data: metabolic } = await supabase
      .from('metabolic_results')
      .select('*')
      .eq('user_id', req.params.userId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Latest nutrition plan
    const { data: nutrition } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('user_id', req.params.userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Workout stats
    const { data: logs } = await supabase
      .from('workout_logs')
      .select('completed_at, workout_id')
      .eq('user_id', req.params.userId)
      .order('completed_at', { ascending: false });

    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const weekWorkouts = (logs || []).filter(l => new Date(l.completed_at) >= weekAgo).length;

    // Streak calculation
    let streak = 0;
    if (logs && logs.length > 0) {
      const days = new Set(logs.map(l => new Date(l.completed_at).toDateString()));
      let checkDate = new Date();
      while (days.has(checkDate.toDateString())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    // Metabolic history (for progress tracking)
    const { data: metabolicHistory } = await supabase
      .from('metabolic_results')
      .select('bmi, avg_body_fat_pct, avg_tdee, muscle_mass_kg, avg_fat_mass_kg, calculated_at')
      .eq('user_id', req.params.userId)
      .order('calculated_at', { ascending: true })
      .limit(20);

    res.json({
      profile,
      metabolic: metabolic || null,
      nutrition: nutrition || null,
      metabolic_history: metabolicHistory || [],
      stats: {
        total_workouts: (logs || []).length,
        week_workouts: weekWorkouts,
        streak,
        recent_workouts: (logs || []).slice(0, 10).map(l => ({
          date: l.completed_at,
          workout_id: l.workout_id,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/coach/users/:userId — edit a user's profile
router.put('/users/:userId', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const allowed = [
      'full_name', 'sex', 'age', 'goal', 'body_type',
      'weight_kg', 'target_weight_kg', 'height_cm',
      'neck_cm', 'waist_cm', 'hip_cm',
      'activity_level', 'experience_level', 'meals_per_day', 'diet_type',
      'medical_conditions', 'injuries', 'medications', 'allergies',
    ];

    const updates = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // Only allow editing users assigned to this coach
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.params.userId)
      .eq('coach_id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Usuario no encontrado o no asignado a este coach' });

    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
