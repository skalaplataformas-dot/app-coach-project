import { Router } from 'express';
import supabase from '../config/supabase.js';
import { requireAuth } from '../middleware/auth.js';
import { calculateMetabolicData } from '../utils/metabolic-math.js';
import { strictLimiter } from '../middleware/rateLimiter.js';
import { validateMetabolic } from '../middleware/validate.js';

const router = Router();

// POST /api/metabolic/calculate
router.post('/calculate', requireAuth, strictLimiter, ...validateMetabolic, async (req, res, next) => {
  try {
    const { weight, height, age, sex, activityLevel, neck, waist, hip } = req.body;

    if (!weight || !height || !age || !sex || !activityLevel || !neck || !waist) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const patientData = {
      weight: Number(weight),
      height: Number(height),
      age: Number(age),
      sex: sex === 'female' ? 'F' : sex === 'male' ? 'M' : sex,
      activityLevel: Number(activityLevel),
      neck: Number(neck),
      waist: Number(waist),
      hip: hip ? Number(hip) : undefined,
    };

    const results = calculateMetabolicData(patientData);

    // Save to database
    const { data, error } = await supabase
      .from('metabolic_results')
      .insert({
        user_id: req.user.id,
        bmi: results.bmi,
        avg_body_fat_pct: results.averageBodyFatPercentage,
        avg_lean_mass_kg: results.averageLeanMassKg,
        avg_fat_mass_kg: results.averageFatMassKg,
        muscle_mass_kg: results.muscleMassKg,
        bone_mass_kg: results.boneMassKg,
        avg_rmr: results.averageRMR,
        avg_tdee: results.averageTDEE,
        eta: results.eta,
        calculation_data: results,
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ id: data.id, ...results });
  } catch (err) {
    next(err);
  }
});

// GET /api/metabolic/history
router.get('/history', requireAuth, async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('metabolic_results')
      .select('*')
      .eq('user_id', req.user.id)
      .order('calculated_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
