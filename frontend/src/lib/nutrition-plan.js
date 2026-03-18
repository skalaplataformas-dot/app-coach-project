/**
 * Client-side nutrition plan generator (same logic as backend).
 * Used in onboarding to preview the plan before saving.
 *
 * Safety constraints:
 *  - Max deficit: 500 kcal/day (no aggressive deficits)
 *  - Protein capped: 1.2 - 3.0 g/kg bodyweight
 *  - If user requests a bigger deficit, timeline adjusts to a realistic pace
 */

const KCAL_PER_KG_FAT = 7700;

// Max deficit capped at 500 for safety
const MAX_DEFICIT = 500;

const DEFICIT_LEVELS = { conservative: 300, moderate: 500 };
const SURPLUS_LEVELS = { conservative: 200, moderate: 300, aggressive: 500 };

// Protein safety limits (g per kg bodyweight)
const PROTEIN_MIN_PER_KG = 1.2;
const PROTEIN_MAX_PER_KG = 3.0;

const MACRO_RATIOS = {
  lose_weight:  { protein: 0.40, carbs: 0.30, fat: 0.30 },
  gain_muscle:  { protein: 0.30, carbs: 0.45, fat: 0.25 },
  get_shredded: { protein: 0.40, carbs: 0.30, fat: 0.30 },
};

const MEAL_DISTRIBUTIONS = {
  2: [{ name: 'Almuerzo', pct: 0.55 }, { name: 'Cena', pct: 0.45 }],
  3: [{ name: 'Desayuno', pct: 0.30 }, { name: 'Almuerzo', pct: 0.40 }, { name: 'Cena', pct: 0.30 }],
  4: [{ name: 'Desayuno', pct: 0.25 }, { name: 'Almuerzo', pct: 0.35 }, { name: 'Snack', pct: 0.10 }, { name: 'Cena', pct: 0.30 }],
  5: [{ name: 'Desayuno', pct: 0.20 }, { name: 'Snack AM', pct: 0.10 }, { name: 'Almuerzo', pct: 0.30 }, { name: 'Snack PM', pct: 0.10 }, { name: 'Cena', pct: 0.30 }],
  6: [{ name: 'Desayuno', pct: 0.18 }, { name: 'Snack AM', pct: 0.08 }, { name: 'Almuerzo', pct: 0.25 }, { name: 'Snack PM 1', pct: 0.10 }, { name: 'Snack PM 2', pct: 0.10 }, { name: 'Cena', pct: 0.29 }],
};

export function generateNutritionPlan({ tdee, goal, weight, targetWeight, mealsPerDay, deficitLevel }) {
  // 1. Calculate deficit/surplus (max deficit capped at 500)
  let adjustment = 0;
  const level = deficitLevel || 'moderate';

  if (goal === 'lose_weight' || goal === 'get_shredded') {
    const requested = DEFICIT_LEVELS[level] || DEFICIT_LEVELS.moderate;
    adjustment = -Math.min(requested, MAX_DEFICIT);
  } else if (goal === 'gain_muscle') {
    adjustment = SURPLUS_LEVELS[level] || SURPLUS_LEVELS.moderate;
  }

  const dailyCalories = Math.round(tdee + adjustment);

  // 2. Macro distribution with protein safety clamp
  const ratios = MACRO_RATIOS[goal] || MACRO_RATIOS.lose_weight;

  // Calculate initial protein from ratio
  let protein = Math.round((dailyCalories * ratios.protein) / 4);

  // Clamp protein to safe range (1.2 - 3.0 g/kg)
  const proteinMin = Math.round(weight * PROTEIN_MIN_PER_KG);
  const proteinMax = Math.round(weight * PROTEIN_MAX_PER_KG);
  protein = Math.max(proteinMin, Math.min(proteinMax, protein));

  // Recalculate remaining calories after protein clamping
  const proteinCals = protein * 4;
  const remainingCals = dailyCalories - proteinCals;

  // Distribute remaining between carbs and fat using original ratio proportion
  const carbFatTotal = ratios.carbs + ratios.fat;
  const carbShare = ratios.carbs / carbFatTotal;
  const fatShare = ratios.fat / carbFatTotal;

  const carbs = Math.round((remainingCals * carbShare) / 4);
  const fat = Math.round((remainingCals * fatShare) / 9);

  // Actual macro ratios after clamping
  const totalMacroCals = (protein * 4) + (carbs * 4) + (fat * 9);
  const actualProteinPct = Math.round((protein * 4 / totalMacroCals) * 100);
  const actualCarbsPct = Math.round((carbs * 4 / totalMacroCals) * 100);
  const actualFatPct = 100 - actualProteinPct - actualCarbsPct;

  // 3. Meal distribution
  const meals = mealsPerDay >= 2 && mealsPerDay <= 6 ? mealsPerDay : 4;
  const distribution = MEAL_DISTRIBUTIONS[meals] || MEAL_DISTRIBUTIONS[4];

  const mealDistribution = distribution.map(meal => ({
    name: meal.name,
    percentage: Math.round(meal.pct * 100),
    calories: Math.round(dailyCalories * meal.pct),
    protein_g: Math.round(protein * meal.pct),
    carbs_g: Math.round(carbs * meal.pct),
    fat_g: Math.round(fat * meal.pct),
  }));

  // 4. Timeline projection
  let timelineDays = null;
  let projectedChangeKg = null;

  if (targetWeight && targetWeight !== weight) {
    const deltaKg = Math.abs(targetWeight - weight);
    const dailyChange = Math.abs(adjustment);
    if (dailyChange > 0) {
      timelineDays = Math.ceil((deltaKg * KCAL_PER_KG_FAT) / dailyChange);
      projectedChangeKg = goal === 'gain_muscle' ? deltaKg : -deltaKg;
    }
  }

  return {
    dailyCalories, protein, carbs, fat,
    proteinPerKg: +(protein / weight).toFixed(2),
    deficitOrSurplus: adjustment,
    mealDistribution, timelineDays, projectedChangeKg,
    macroRatios: {
      protein: actualProteinPct,
      carbs: actualCarbsPct,
      fat: actualFatPct,
    },
  };
}
