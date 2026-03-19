import { Router } from 'express';
import supabase from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { getExerciseMedia, MUSCLE_GROUP_LABELS, MUSCLE_GROUP_COLORS } from '../utils/exercise-media-map.js';

const router = Router();

// GET /api/workouts
router.get('/', requireAuth, async (req, res, next) => {
  try {
    let query = supabase
      .from('workouts')
      .select('*')
      .order('created_at', { ascending: false });

    if (req.query.category) {
      query = query.eq('category', req.query.category);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/workouts/:id
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { data: workout, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    const { data: exercises } = await supabase
      .from('exercises')
      .select('*')
      .eq('workout_id', req.params.id)
      .order('sort_order', { ascending: true });

    // Check if user completed this workout
    const { data: logs } = await supabase
      .from('workout_logs')
      .select('completed_at')
      .eq('user_id', req.user.id)
      .eq('workout_id', req.params.id)
      .order('completed_at', { ascending: false })
      .limit(1);

    // Enrich exercises with media URLs
    const enrichedExercises = (exercises || []).map(ex => {
      // Priority: DB video_url > DB exercisedb_id > mapping fallback
      const media = getExerciseMedia(ex.name);
      const gifUrl = ex.video_url || (ex.exercisedb_id
        ? `https://static.exercisedb.dev/media/${ex.exercisedb_id}.gif`
        : media.gifUrl);
      const muscleGroup = ex.muscle_group || media.muscleGroup;

      return {
        ...ex,
        gif_url: gifUrl,
        muscle_group: muscleGroup,
        muscle_group_label: muscleGroup ? MUSCLE_GROUP_LABELS[muscleGroup] || muscleGroup : null,
      };
    });

    res.json({
      ...workout,
      exercises: enrichedExercises,
      last_completed: logs?.[0]?.completed_at || null,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/workouts/:id/complete
router.post('/:id/complete', requireAuth, async (req, res, next) => {
  try {
    // Verify workout exists
    const { data: workout } = await supabase
      .from('workouts')
      .select('id')
      .eq('id', req.params.id)
      .single();

    if (!workout) {
      return res.status(404).json({ error: 'Workout not found' });
    }

    const { data, error } = await supabase
      .from('workout_logs')
      .insert({
        user_id: req.user.id,
        workout_id: req.params.id,
        duration_seconds: req.body.duration_seconds || null,
        notes: req.body.notes || null,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
