/**
 * Meal suggestion engine v3 — linear optimization approach
 *
 * For MAIN MEALS (Desayuno, Almuerzo, Cena):
 *   Pick 1 protein + 1 carb + optional fat + optional fruit, then solve for
 *   multipliers that minimize total weighted deviation across all 4 macros.
 *
 * For SNACKS (≤12% daily calories):
 *   Search ALL foods for the best single-item calorie match, scale it,
 *   optionally add fruit to cover carb shortfall.
 *
 * Solver: coordinate descent — each iteration sweeps every food's multiplier
 * to the value that minimizes the sum-of-squared-errors given the other
 * multipliers held fixed. Converges in 20–50 iterations for 2–4 foods.
 */

const MIN_MULT = 0.15;
const MAX_MULT = 5.0;

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function groupByCategory(foods) {
  const g = {};
  for (const f of foods) {
    const c = f.category || 'Otros';
    (g[c] = g[c] || []).push(f);
  }
  return g;
}

function pick(arr, seed) {
  if (!arr || !arr.length) return null;
  return arr[((seed % arr.length) + arr.length) % arr.length];
}

function roundDisplay(amount, unit) {
  if (!unit) return Math.round(amount);
  const u = unit.toLowerCase();
  if (u.includes('gr') || u.includes('ml') || u === 'g') return Math.round(amount / 5) * 5 || 5;
  return Math.round(amount * 2) / 2 || 0.5;
}

// ─── Macro vectors ─────────────────────────────────────────────────────
// We represent macros as 4-element arrays: [calories, protein, carbs, fat]
// This lets us do linear algebra operations cleanly.

function macroVec(obj) {
  return [obj.calories || 0, obj.protein_g || 0, obj.carbs_g || 0, obj.fat_g || 0];
}

function foodPerServing(food) {
  return [food.calories, food.protein_g, food.carbs_g, food.fat_g];
}

// Weighted sum of squared relative errors
// Weights: calories=1, protein=2, carbs=2, fat=2  (macros matter more than kcal)
const WEIGHTS = [1, 2, 2, 2];

function objective(mults, foodVecs, target) {
  let cost = 0;
  for (let k = 0; k < 4; k++) {
    let total = 0;
    for (let i = 0; i < mults.length; i++) {
      total += mults[i] * foodVecs[i][k];
    }
    const t = target[k];
    if (t > 0) {
      const rel = (total - t) / t;
      cost += WEIGHTS[k] * rel * rel;
    }
  }
  return cost;
}

// ─── Coordinate descent solver ─────────────────────────────────────────
// For each food i, holding all other multipliers fixed, the optimal m_i
// minimizes sum_k w_k * ((sum_{j!=i} m_j*f_jk + m_i*f_ik - t_k)/t_k)^2
//
// Taking derivative w.r.t. m_i and setting to 0:
//   m_i = sum_k [w_k * f_ik * (t_k - rest_k) / t_k^2]
//        / sum_k [w_k * f_ik^2 / t_k^2]
// where rest_k = sum_{j!=i} m_j * f_jk

function solveMultipliers(foodVecs, target, initialMults, iterations = 80) {
  const n = foodVecs.length;
  const mults = [...initialMults];
  const tgt = target;

  for (let iter = 0; iter < iterations; iter++) {
    let changed = false;
    for (let i = 0; i < n; i++) {
      // Compute rest (contribution from all other foods)
      let numerator = 0;
      let denominator = 0;
      for (let k = 0; k < 4; k++) {
        if (tgt[k] <= 0) continue;
        const fik = foodVecs[i][k];
        if (fik === 0) continue;
        let rest = 0;
        for (let j = 0; j < n; j++) {
          if (j !== i) rest += mults[j] * foodVecs[j][k];
        }
        const wt = WEIGHTS[k] / (tgt[k] * tgt[k]);
        numerator += wt * fik * (tgt[k] - rest);
        denominator += wt * fik * fik;
      }
      if (denominator > 0) {
        const newMult = clamp(numerator / denominator, MIN_MULT, MAX_MULT);
        if (Math.abs(newMult - mults[i]) > 1e-6) changed = true;
        mults[i] = newMult;
      }
    }
    if (!changed) break;
  }

  return mults;
}

// ─── Max relative deviation ────────────────────────────────────────────

function maxDeviation(mults, foodVecs, target) {
  let maxDev = 0;
  for (let k = 0; k < 4; k++) {
    if (target[k] <= 0) continue;
    let total = 0;
    for (let i = 0; i < mults.length; i++) {
      total += mults[i] * foodVecs[i][k];
    }
    const dev = Math.abs(total - target[k]) / target[k];
    if (dev > maxDev) maxDev = dev;
  }
  return maxDev;
}

// ─── Build suggestion object ───────────────────────────────────────────

function makeSuggestion(food, mult) {
  const m = clamp(mult, MIN_MULT, MAX_MULT);
  const servNum = parseFloat(food.serving_size) || 100;
  const disp = roundDisplay(servNum * m, food.serving_unit);
  return {
    food_id: food.id,
    name: food.name,
    category: food.category,
    servings: +m.toFixed(2),
    serving_size: food.serving_size,
    serving_unit: food.serving_unit,
    display_amount: `${disp} ${food.serving_unit}`,
    calories: Math.round(food.calories * m),
    protein_g: +(food.protein_g * m).toFixed(1),
    carbs_g: +(food.carbs_g * m).toFixed(1),
    fat_g: +(food.fat_g * m).toFixed(1),
  };
}

function sumMacros(items) {
  return items.reduce((a, s) => ({
    calories: a.calories + s.calories,
    protein_g: +(a.protein_g + s.protein_g).toFixed(1),
    carbs_g: +(a.carbs_g + s.carbs_g).toFixed(1),
    fat_g: +(a.fat_g + s.fat_g).toFixed(1),
  }), { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
}

function deviation(actual, target) {
  if (target <= 0) return actual <= 0 ? 0 : 1;
  return Math.abs(actual - target) / target;
}

function matchPct(totals, target) {
  const d = (deviation(totals.calories, target.calories) +
    deviation(totals.protein_g, target.protein_g) +
    deviation(totals.carbs_g, target.carbs_g) +
    deviation(totals.fat_g, target.fat_g)) / 4;
  return Math.round((1 - d) * 100);
}

// ─── Try a food combination and return its deviation ───────────────────

function tryCombination(selectedFoods, target) {
  const foodVecs = selectedFoods.map(f => foodPerServing(f));
  const tgt = macroVec(target);

  // Initial multipliers: rough guess based on primary macro
  const initMults = selectedFoods.map(f => {
    if (f.calories > 0) {
      return clamp(target.calories / selectedFoods.length / f.calories, MIN_MULT, MAX_MULT);
    }
    return 1;
  });

  const mults = solveMultipliers(foodVecs, tgt, initMults);
  const dev = maxDeviation(mults, foodVecs, tgt);
  return { mults, dev, foodVecs };
}

// ─── Main Meal Composer ────────────────────────────────────────────────
// Try multiple food combos (protein × carb × fat presence × fruit presence)
// and pick the one with lowest max deviation.

function composeMeal(target, groups, seed) {
  const proteins = groups['Proteinas'] || [];
  const carbs = groups['Carbohidratos'] || [];
  const fats = groups['Grasas'] || [];
  const fruits = groups['Frutas'] || [];

  if (proteins.length === 0 || carbs.length === 0) return [];

  const tgt = macroVec(target);
  let bestDev = Infinity;
  let bestResult = null;

  // We try a few protein/carb/fat/fruit combinations seeded deterministically
  // and pick the best one.
  const protCandidates = [
    pick(proteins, seed),
    pick(proteins, seed + 1),
    pick(proteins, seed + 3),
  ].filter(Boolean);

  const carbCandidates = [
    pick(carbs, seed),
    pick(carbs, seed + 1),
    pick(carbs, seed + 2),
  ].filter(Boolean);

  // Deduplicate
  const uniqueProts = [...new Map(protCandidates.map(f => [f.id, f])).values()];
  const uniqueCarbs = [...new Map(carbCandidates.map(f => [f.id, f])).values()];

  for (const protFood of uniqueProts) {
    for (const carbFood of uniqueCarbs) {
      // Combo A: protein + carb only
      {
        const foods = [protFood, carbFood];
        const r = tryCombination(foods, target);
        if (r.dev < bestDev) {
          bestDev = r.dev;
          bestResult = { foods, mults: r.mults };
        }
      }

      // Combo B: protein + carb + fat
      if (fats.length > 0) {
        for (let fi = 0; fi < Math.min(fats.length, 3); fi++) {
          const fatFood = pick(fats, seed + fi);
          if (!fatFood) continue;
          const foods = [protFood, carbFood, fatFood];
          const r = tryCombination(foods, target);
          if (r.dev < bestDev) {
            bestDev = r.dev;
            bestResult = { foods, mults: r.mults };
          }

          // Combo C: protein + carb + fat + fruit
          if (fruits.length > 0) {
            for (let fri = 0; fri < Math.min(fruits.length, 2); fri++) {
              const fruitFood = pick(fruits, seed + fri);
              if (!fruitFood) continue;
              const foods4 = [protFood, carbFood, fatFood, fruitFood];
              const r4 = tryCombination(foods4, target);
              if (r4.dev < bestDev) {
                bestDev = r4.dev;
                bestResult = { foods: foods4, mults: r4.mults };
              }
            }
          }
        }
      }

      // Combo D: protein + carb + fruit (no fat)
      if (fruits.length > 0) {
        for (let fri = 0; fri < Math.min(fruits.length, 2); fri++) {
          const fruitFood = pick(fruits, seed + fri);
          if (!fruitFood) continue;
          const foods = [protFood, carbFood, fruitFood];
          const r = tryCombination(foods, target);
          if (r.dev < bestDev) {
            bestDev = r.dev;
            bestResult = { foods, mults: r.mults };
          }
        }
      }
    }
  }

  if (!bestResult) return [];

  // If best is still >5%, do an exhaustive search over all proteins × carbs
  // with the winning fat/fruit combo structure
  if (bestDev > 0.05) {
    const bestFoodCount = bestResult.foods.length;
    // Try every protein with every carb, keeping fat/fruit from best
    const extraFoods = bestResult.foods.slice(2); // fat + fruit if any

    for (const p of proteins) {
      for (const c of carbs) {
        const foods = [p, c, ...extraFoods];
        const r = tryCombination(foods, target);
        if (r.dev < bestDev) {
          bestDev = r.dev;
          bestResult = { foods, mults: r.mults };
          if (bestDev <= 0.02) break;
        }
      }
      if (bestDev <= 0.02) break;
    }
  }

  // Build suggestion objects
  return bestResult.foods.map((food, i) =>
    makeSuggestion(food, bestResult.mults[i])
  );
}

// ─── Snack Composer ────────────────────────────────────────────────────
// For snacks, we search broadly for the best 1-food or 2-food combo.

function composeSnack(target, groups, seed, allFoods) {
  const tgt = macroVec(target);
  let bestDev = Infinity;
  let bestResult = null;

  // Strategy 1: single food from any category
  for (const food of allFoods) {
    if (food.calories <= 0) continue;
    const mult = clamp(target.calories / food.calories, MIN_MULT, MAX_MULT);
    const foodVec = foodPerServing(food);
    const mults = solveMultipliers([foodVec], tgt, [mult]);
    const dev = maxDeviation(mults, [foodVec], tgt);
    if (dev < bestDev) {
      bestDev = dev;
      bestResult = { foods: [food], mults };
    }
  }

  // Strategy 2: two foods — try pairing best single food with every other food
  if (bestDev > 0.03 && bestResult) {
    const mainFood = bestResult.foods[0];
    for (const food2 of allFoods) {
      if (food2.id === mainFood.id) continue;
      const foodVecs = [foodPerServing(mainFood), foodPerServing(food2)];
      const initMults = [
        clamp(target.calories * 0.7 / mainFood.calories, MIN_MULT, MAX_MULT),
        clamp(target.calories * 0.3 / food2.calories, MIN_MULT, MAX_MULT),
      ];
      const mults = solveMultipliers(foodVecs, tgt, initMults);
      const dev = maxDeviation(mults, foodVecs, tgt);
      if (dev < bestDev) {
        bestDev = dev;
        bestResult = { foods: [mainFood, food2], mults };
      }
    }
  }

  // Strategy 3: if still >5%, try ALL pairs exhaustively
  if (bestDev > 0.05) {
    // Prioritize empacados + proteins + fruits (likely snack foods)
    const empacados = groups['Empacados'] || [];
    const proteins = groups['Proteinas'] || [];
    const fruits = groups['Frutas'] || [];
    const snackCandidates = [...empacados, ...proteins, ...fruits];

    for (let i = 0; i < snackCandidates.length; i++) {
      for (let j = i + 1; j < allFoods.length; j++) {
        const f1 = snackCandidates[i];
        const f2 = allFoods[j];
        if (f1.id === f2.id) continue;
        const foodVecs = [foodPerServing(f1), foodPerServing(f2)];
        const initMults = [
          clamp(target.calories * 0.6 / f1.calories, MIN_MULT, MAX_MULT),
          clamp(target.calories * 0.4 / f2.calories, MIN_MULT, MAX_MULT),
        ];
        const mults = solveMultipliers(foodVecs, tgt, initMults);
        const dev = maxDeviation(mults, foodVecs, tgt);
        if (dev < bestDev) {
          bestDev = dev;
          bestResult = { foods: [f1, f2], mults };
          if (bestDev <= 0.02) break;
        }
      }
      if (bestDev <= 0.02) break;
    }
  }

  // Strategy 4: 3-food combos for stubborn snacks
  if (bestDev > 0.05) {
    const empacados = groups['Empacados'] || [];
    const proteins = groups['Proteinas'] || [];
    const fruits = groups['Frutas'] || [];
    const carbos = groups['Carbohidratos'] || [];
    const fatsArr = groups['Grasas'] || [];

    // Try protein + carb + fruit/fat combos (like a mini-meal)
    const pool1 = [...empacados, ...proteins].slice(0, 8);
    const pool2 = [...carbos, ...fruits].slice(0, 6);
    const pool3 = [...fruits, ...fatsArr].slice(0, 6);

    for (const f1 of pool1) {
      for (const f2 of pool2) {
        if (f1.id === f2.id) continue;
        for (const f3 of pool3) {
          if (f3.id === f1.id || f3.id === f2.id) continue;
          const foodVecs = [foodPerServing(f1), foodPerServing(f2), foodPerServing(f3)];
          const initMults = foodVecs.map((_, idx) =>
            clamp(target.calories / 3 / [f1, f2, f3][idx].calories, MIN_MULT, MAX_MULT)
          );
          const mults = solveMultipliers(foodVecs, tgt, initMults);
          const dev = maxDeviation(mults, foodVecs, tgt);
          if (dev < bestDev) {
            bestDev = dev;
            bestResult = { foods: [f1, f2, f3], mults };
            if (bestDev <= 0.02) break;
          }
        }
        if (bestDev <= 0.02) break;
      }
      if (bestDev <= 0.02) break;
    }
  }

  if (!bestResult) return [];

  return bestResult.foods.map((food, i) =>
    makeSuggestion(food, bestResult.mults[i])
  );
}

// ─── Public API ────────────────────────────────────────────────────────

export function generateMealSuggestions(mealDistribution, foods, seed = 0) {
  if (!foods || foods.length === 0) return mealDistribution;

  const groups = groupByCategory(foods);
  const dailyCal = mealDistribution.reduce((s, m) => s + m.calories, 0);

  return mealDistribution.map((meal, idx) => {
    const isSnack = meal.name.toLowerCase().includes('snack') ||
      meal.percentage <= 10 ||
      meal.calories < (dailyCal * 0.12);
    const mealSeed = seed + idx * 7;

    const target = {
      calories: meal.calories,
      protein_g: meal.protein_g,
      carbs_g: meal.carbs_g,
      fat_g: meal.fat_g,
    };

    const suggestions = isSnack
      ? composeSnack(target, groups, mealSeed, foods)
      : composeMeal(target, groups, mealSeed);

    const totals = sumMacros(suggestions);
    const match = matchPct(totals, target);

    return {
      ...meal,
      suggestions,
      suggestion_totals: totals,
      match_pct: match,
    };
  });
}
