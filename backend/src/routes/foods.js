import { Router } from 'express';
import supabase from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { validateFood, validateFoodSearch } from '../middleware/validate.js';

const router = Router();

// GET /api/foods — list all foods (with optional category filter)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    let query = supabase
      .from('foods')
      .select('*')
      .order('category')
      .order('name');

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

// GET /api/foods/search?q=pollo
router.get('/search', requireAuth, ...validateFoodSearch, async (req, res, next) => {
  try {
    const q = req.query.q?.trim().slice(0, 100).replace(/[%_]/g, '');
    if (!q) return res.json([]);

    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .ilike('name', `%${q}%`)
      .order('name')
      .limit(20);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /api/foods — create food (admin only)
router.post('/', requireAuth, adminOnly, ...validateFood, async (req, res, next) => {
  try {
    const { name, category, serving_size, serving_unit, calories,
      protein_g, carbs_g, fat_g, sodium_mg, fiber_g, sugar_g } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const { data, error } = await supabase
      .from('foods')
      .insert({
        name, category, serving_size, serving_unit,
        calories, protein_g, carbs_g, fat_g,
        sodium_mg, fiber_g, sugar_g,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
});

// PUT /api/foods/:id — update food (admin only)
router.put('/:id', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const allowed = [
      'name', 'category', 'serving_size', 'serving_unit',
      'calories', 'protein_g', 'carbs_g', 'fat_g',
      'sodium_mg', 'fiber_g', 'sugar_g',
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('foods')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/foods/:id — delete food (admin only)
router.delete('/:id', requireAuth, adminOnly, async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('foods')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
