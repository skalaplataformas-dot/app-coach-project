import { Router } from 'express';
import supabase from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { generateNutritionPlan } from '../utils/nutrition-plan.js';
import { strictLimiter } from '../middleware/rateLimiter.js';
import { validateNutritionPlan } from '../middleware/validate.js';

const router = Router();

// POST /api/nutrition/plan — generate a new nutrition plan
router.post('/plan', requireAuth, strictLimiter, ...validateNutritionPlan, async (req, res, next) => {
  try {
    const { tdee, goal, weight, target_weight, meals_per_day, deficit_level } = req.body;

    if (!tdee || !goal || !weight || !meals_per_day) {
      return res.status(400).json({ error: 'Missing required fields: tdee, goal, weight, meals_per_day' });
    }

    const plan = generateNutritionPlan({
      tdee: Number(tdee),
      goal,
      weight: Number(weight),
      targetWeight: target_weight ? Number(target_weight) : null,
      mealsPerDay: Number(meals_per_day),
      deficitLevel: deficit_level || 'moderate',
    });

    // Save to database
    const { data, error } = await supabase
      .from('nutrition_plans')
      .insert({
        user_id: req.user.id,
        goal,
        daily_calories: plan.dailyCalories,
        protein_g: plan.protein,
        carbs_g: plan.carbs,
        fat_g: plan.fat,
        deficit_or_surplus: plan.deficitOrSurplus,
        meals_per_day: Number(meals_per_day),
        meal_distribution: plan.mealDistribution,
        timeline_days: plan.timelineDays,
        projected_change_kg: plan.projectedChangeKg,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// GET /api/nutrition/plan — get current (latest) plan
router.get('/plan', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.json(data || null);
  } catch (err) {
    next(err);
  }
});

export default router;
