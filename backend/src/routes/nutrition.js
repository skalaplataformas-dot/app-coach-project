import { Router } from 'express';
import supabase from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { generateNutritionPlan } from '../utils/nutrition-plan.js';
import { generateMealSuggestions } from '../utils/meal-suggestions.js';
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

    // Fetch foods and user preferences, then generate meal suggestions
    const [{ data: foods }, { data: profile }] = await Promise.all([
      supabase.from('foods').select('*'),
      supabase.from('profiles').select('preferred_foods').eq('id', req.user.id).single(),
    ]);
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const enrichedMeals = generateMealSuggestions(plan.mealDistribution, foods || [], dayOfYear, profile?.preferred_foods);

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
        meal_distribution: enrichedMeals,
        timeline_days: plan.timelineDays,
        projected_change_kg: plan.projectedChangeKg,
      })
      .select()
      .single();

    if (error) throw error;

    // Cleanup: delete old plans, keep only the latest one
    supabase
      .from('nutrition_plans')
      .delete()
      .eq('user_id', req.user.id)
      .neq('id', data.id)
      .then(() => {})
      .catch(() => {});

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

// POST /api/nutrition/regenerate-suggestions — regenerate food suggestions for existing plan
router.post('/regenerate-suggestions', requireAuth, async (req, res, next) => {
  try {
    // Get current plan
    const { data: plan, error: planErr } = await supabase
      .from('nutrition_plans')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (planErr || !plan) {
      return res.status(404).json({ error: 'No tienes un plan nutricional. Genera uno primero.' });
    }

    if (!plan.meal_distribution || plan.meal_distribution.length === 0) {
      return res.status(400).json({ error: 'El plan no tiene distribución de comidas.' });
    }

    // Fetch foods and preferences
    const [{ data: foods }, { data: profile }] = await Promise.all([
      supabase.from('foods').select('*'),
      supabase.from('profiles').select('preferred_foods').eq('id', req.user.id).single(),
    ]);

    // Strip old suggestions to get clean meal targets
    const cleanMeals = plan.meal_distribution.map(m => ({
      name: m.name,
      percentage: m.percentage,
      calories: m.calories,
      protein_g: m.protein_g,
      carbs_g: m.carbs_g,
      fat_g: m.fat_g,
    }));

    // Generate new suggestions with different seed for variety
    const seed = Math.floor(Date.now() / 1000) % 365;
    const enrichedMeals = generateMealSuggestions(cleanMeals, foods || [], seed, profile?.preferred_foods);

    // Update the plan in place
    const { data: updated, error: updateErr } = await supabase
      .from('nutrition_plans')
      .update({ meal_distribution: enrichedMeals })
      .eq('id', plan.id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
