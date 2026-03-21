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

// ─── SCHEDULE MANAGEMENT ────────────────────────────────────────────────

// GET /api/coach/users/:userId/schedule?date=2026-03-20 — get user's weekly schedule
router.get('/users/:userId/schedule', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const baseDate = req.query.date ? new Date(req.query.date) : new Date();
    const day = baseDate.getDay();
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() - (day === 0 ? 6 : day - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const startDate = monday.toISOString().split('T')[0];
    const endDate = sunday.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('workout_schedule')
      .select('*, workouts(id, title, category, difficulty, duration_minutes)')
      .eq('user_id', req.params.userId)
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)
      .order('scheduled_date', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    next(err);
  }
});

// POST /api/coach/users/:userId/schedule — assign workout to a date
router.post('/users/:userId/schedule', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const { workout_id, scheduled_date } = req.body;
    if (!workout_id || !scheduled_date) {
      return res.status(400).json({ error: 'workout_id y scheduled_date son requeridos' });
    }

    // Verify user belongs to this coach
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', req.params.userId)
      .eq('coach_id', req.user.id)
      .single();

    if (!profile) return res.status(404).json({ error: 'Usuario no asignado a este coach' });

    const { data, error } = await supabase
      .from('workout_schedule')
      .insert({
        user_id: req.params.userId,
        workout_id,
        scheduled_date,
      })
      .select('*, workouts(id, title, category, difficulty, duration_minutes)')
      .single();

    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Ya existe ese entrenamiento en esa fecha' });
      throw error;
    }
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/coach/users/:userId/schedule/:scheduleId — remove scheduled workout
router.delete('/users/:userId/schedule/:scheduleId', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('workout_schedule')
      .delete()
      .eq('id', req.params.scheduleId)
      .eq('user_id', req.params.userId);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// ─── WORKOUT TEMPLATE MANAGEMENT ────────────────────────────────────────

// POST /api/coach/workouts — create a workout template
router.post('/workouts', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const { title, description, difficulty, duration_minutes, category, muscle_group, exercises } = req.body;
    if (!title) return res.status(400).json({ error: 'Título es requerido' });

    // Create workout
    const { data: workout, error } = await supabase
      .from('workouts')
      .insert({ title, description, difficulty: difficulty || 'intermediate', duration_minutes: duration_minutes || 45, category: category || 'strength', muscle_group: muscle_group || null })
      .select()
      .single();

    if (error) throw error;

    // Create exercises if provided
    if (exercises?.length > 0) {
      const exerciseRows = exercises.map((ex, i) => ({
        workout_id: workout.id,
        name: ex.name,
        sets: ex.sets || 3,
        reps: ex.reps || '12',
        rest_seconds: ex.rest_seconds || 60,
        sort_order: ex.sort_order || i + 1,
        notes: ex.notes || null,
        muscle_group: ex.muscle_group || null,
        video_url: ex.video_url || null,
      }));

      const { error: exError } = await supabase.from('exercises').insert(exerciseRows);
      if (exError) throw exError;
    }

    // Return workout with exercises
    const { data: full } = await supabase
      .from('workouts')
      .select('*, exercises(*)')
      .eq('id', workout.id)
      .single();

    res.status(201).json(full);
  } catch (err) {
    next(err);
  }
});

// PUT /api/coach/workouts/:id — update a workout template
router.put('/workouts/:id', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const { title, description, difficulty, duration_minutes, category, muscle_group } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (difficulty !== undefined) updates.difficulty = difficulty;
    if (duration_minutes !== undefined) updates.duration_minutes = duration_minutes;
    if (category !== undefined) updates.category = category;
    if (muscle_group !== undefined) updates.muscle_group = muscle_group || null;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from('workouts').update(updates).eq('id', req.params.id);
      if (error) throw error;
    }

    // Update exercises if provided
    if (req.body.exercises) {
      // Delete old exercises
      await supabase.from('exercises').delete().eq('workout_id', req.params.id);

      // Insert new ones
      if (req.body.exercises.length > 0) {
        const exerciseRows = req.body.exercises.map((ex, i) => ({
          workout_id: req.params.id,
          name: ex.name,
          sets: ex.sets || 3,
          reps: ex.reps || '12',
          rest_seconds: ex.rest_seconds || 60,
          sort_order: ex.sort_order || i + 1,
          notes: ex.notes || null,
          muscle_group: ex.muscle_group || null,
          video_url: ex.video_url || null,
        }));

        const { error: exError } = await supabase.from('exercises').insert(exerciseRows);
        if (exError) throw exError;
      }
    }

    const { data: full } = await supabase
      .from('workouts')
      .select('*, exercises(*)')
      .eq('id', req.params.id)
      .order('sort_order', { referencedTable: 'exercises', ascending: true })
      .single();

    res.json(full);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/coach/workouts/:id — delete a workout template
router.delete('/workouts/:id', requireAuth, adminOnly, async (req, res, next) => {
  try {
    // Exercises cascade delete via FK
    const { error } = await supabase.from('workouts').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/coach/workouts — list all workouts with exercise count
router.get('/workouts', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*, exercises(id)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const result = (data || []).map(w => ({
      ...w,
      exercise_count: w.exercises?.length || 0,
      exercises: undefined,
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/coach/workouts/:id — get workout with full exercises
router.get('/workouts/:id', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*, exercises(*)')
      .eq('id', req.params.id)
      .order('sort_order', { referencedTable: 'exercises', ascending: true })
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/coach/unassigned — list users without a coach
router.get('/unassigned', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, sex, age, goal, weight_kg, onboarding_completed, created_at')
      .neq('role', 'admin')
      .is('coach_id', null)
      .is('deactivated_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    next(err);
  }
});

// POST /api/coach/assign — assign user(s) to this coach
router.post('/assign', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const { user_ids } = req.body;
    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ error: 'user_ids es requerido' });
    }

    const { error } = await supabase
      .from('profiles')
      .update({ coach_id: req.user.id })
      .in('id', user_ids);

    if (error) throw error;
    res.json({ success: true, assigned: user_ids.length });
  } catch (err) {
    next(err);
  }
});

// POST /api/coach/unassign — remove user from this coach
router.post('/unassign', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ error: 'user_id es requerido' });

    const { error } = await supabase
      .from('profiles')
      .update({ coach_id: null })
      .eq('id', user_id)
      .eq('coach_id', req.user.id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/coach/exercises — list unique exercises as a library
router.get('/exercises', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('exercises')
      .select('name, sets, reps, rest_seconds, notes, muscle_group, video_url')
      .order('name', { ascending: true });

    if (error) throw error;

    // Deduplicate by name, keep the most complete version
    const seen = new Map();
    (data || []).forEach(ex => {
      const key = ex.name.toLowerCase().trim();
      if (!seen.has(key) || (ex.video_url && !seen.get(key).video_url)) {
        seen.set(key, ex);
      }
    });

    res.json(Array.from(seen.values()));
  } catch (err) {
    next(err);
  }
});

export default router;
