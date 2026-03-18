/**
 * Test script: validates meal suggestion accuracy across all scenarios.
 * Ensures macro deviation ≤5% for every meal in every scenario.
 *
 * Run: node test-meal-suggestions.js
 */

import { generateNutritionPlan } from './src/utils/nutrition-plan.js';
import { generateMealSuggestions } from './src/utils/meal-suggestions.js';

// Simulated food database (mirrors the 64 foods from seeds)
const FOODS = [
  // PROTEINAS
  { id: 1, name: 'Huevo', category: 'Proteinas', serving_size: '1', serving_unit: 'unidad', calories: 70, protein_g: 6, carbs_g: 0.6, fat_g: 5 },
  { id: 2, name: 'Clara de Huevo', category: 'Proteinas', serving_size: '1', serving_unit: 'unidad', calories: 17, protein_g: 3.6, carbs_g: 0.2, fat_g: 0.1 },
  { id: 3, name: 'Whey Protein', category: 'Proteinas', serving_size: '26', serving_unit: 'gr', calories: 90, protein_g: 21, carbs_g: 1, fat_g: 0 },
  { id: 4, name: 'Pechuga de Pollo', category: 'Proteinas', serving_size: '100', serving_unit: 'gr', calories: 149, protein_g: 28, carbs_g: 0, fat_g: 3.6 },
  { id: 5, name: 'Pierna de Pollo', category: 'Proteinas', serving_size: '100', serving_unit: 'gr', calories: 168, protein_g: 24.4, carbs_g: 0, fat_g: 7.7 },
  { id: 6, name: 'Lata de Atun', category: 'Proteinas', serving_size: '85', serving_unit: 'gr', calories: 99, protein_g: 21.68, carbs_g: 0, fat_g: 1.3 },
  { id: 7, name: 'Salmon', category: 'Proteinas', serving_size: '100', serving_unit: 'gr', calories: 159, protein_g: 20.6, carbs_g: 0, fat_g: 7.9 },
  { id: 8, name: 'Tilapia', category: 'Proteinas', serving_size: '100', serving_unit: 'gr', calories: 121, protein_g: 25.3, carbs_g: 0, fat_g: 1.7 },
  { id: 9, name: 'Camarones', category: 'Proteinas', serving_size: '100', serving_unit: 'gr', calories: 91, protein_g: 17.4, carbs_g: 0, fat_g: 1.4 },
  { id: 10, name: 'Lomo de Cerdo', category: 'Proteinas', serving_size: '100', serving_unit: 'gr', calories: 147, protein_g: 26, carbs_g: 0, fat_g: 4.2 },
  { id: 11, name: 'Carne Magra', category: 'Proteinas', serving_size: '100', serving_unit: 'gr', calories: 159, protein_g: 29.6, carbs_g: 0, fat_g: 4.2 },
  { id: 12, name: 'Yogurt Griego', category: 'Proteinas', serving_size: '100', serving_unit: 'gr', calories: 75, protein_g: 9, carbs_g: 3.5, fat_g: 2.5 },
  { id: 13, name: 'Jamon de Pavo', category: 'Proteinas', serving_size: '2', serving_unit: 'lonjas', calories: 44, protein_g: 7.7, carbs_g: 1, fat_g: 0.8 },
  { id: 14, name: 'Complex 8', category: 'Proteinas', serving_size: '1', serving_unit: 'scoop', calories: 190, protein_g: 40, carbs_g: 5, fat_g: 2 },
  { id: 15, name: 'Pechuga de Pavo', category: 'Proteinas', serving_size: '100', serving_unit: 'gr', calories: 104, protein_g: 17.07, carbs_g: 0, fat_g: 3.22 },
  { id: 16, name: 'Salchichas de Pavo', category: 'Proteinas', serving_size: '50', serving_unit: 'gr', calories: 60, protein_g: 9.5, carbs_g: 0.5, fat_g: 2 },
  // CARBOHIDRATOS
  { id: 17, name: 'Arroz', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 185, protein_g: 3.5, carbs_g: 40.1, fat_g: 0.5 },
  { id: 18, name: 'Maduro', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 122, protein_g: 1.3, carbs_g: 31.8, fat_g: 0.4 },
  { id: 19, name: 'Yuca', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 120, protein_g: 1.4, carbs_g: 26.8, fat_g: 0.3 },
  { id: 20, name: 'Papa Blanca', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 110, protein_g: 2.6, carbs_g: 26, fat_g: 0.1 },
  { id: 21, name: 'Pan Integral', category: 'Carbohidratos', serving_size: '2', serving_unit: 'rebanadas', calories: 154, protein_g: 5.4, carbs_g: 28.4, fat_g: 2.2 },
  { id: 22, name: 'Avena', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 345, protein_g: 12, carbs_g: 55, fat_g: 7 },
  { id: 23, name: 'Arepa Choclo', category: 'Carbohidratos', serving_size: '80', serving_unit: 'gr', calories: 130, protein_g: 2.7, carbs_g: 28, fat_g: 0.9 },
  { id: 24, name: 'Pasta Spaghetti', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 350, protein_g: 12, carbs_g: 75.8, fat_g: 1.5 },
  { id: 25, name: 'Frijol', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 126, protein_g: 9, carbs_g: 22.6, fat_g: 0.5 },
  { id: 26, name: 'Pan Artesanal', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 260, protein_g: 8.5, carbs_g: 52, fat_g: 1.5 },
  { id: 27, name: 'Vegetales', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 120, protein_g: 3, carbs_g: 28, fat_g: 0.2 },
  // FRUTAS
  { id: 28, name: 'Fresas', category: 'Frutas', serving_size: '100', serving_unit: 'gr', calories: 32, protein_g: 0.7, carbs_g: 7.7, fat_g: 0.3 },
  { id: 29, name: 'Banano', category: 'Frutas', serving_size: '100', serving_unit: 'gr', calories: 59, protein_g: 1.1, carbs_g: 22.8, fat_g: 0.3 },
  { id: 30, name: 'Manzana', category: 'Frutas', serving_size: '100', serving_unit: 'gr', calories: 59, protein_g: 0.4, carbs_g: 15, fat_g: 0.2 },
  { id: 31, name: 'Mango', category: 'Frutas', serving_size: '100', serving_unit: 'gr', calories: 60, protein_g: 0.8, carbs_g: 15, fat_g: 0.4 },
  { id: 32, name: 'Papaya', category: 'Frutas', serving_size: '100', serving_unit: 'gr', calories: 39, protein_g: 0.5, carbs_g: 9.8, fat_g: 0.3 },
  { id: 33, name: 'Arandanos', category: 'Frutas', serving_size: '100', serving_unit: 'gr', calories: 57, protein_g: 0.7, carbs_g: 14.5, fat_g: 0.3 },
  // GRASAS
  { id: 34, name: 'Mantequilla de Mani', category: 'Grasas', serving_size: '100', serving_unit: 'gr', calories: 667, protein_g: 22.2, carbs_g: 20, fat_g: 53.3 },
  { id: 35, name: 'Aguacate', category: 'Grasas', serving_size: '100', serving_unit: 'gr', calories: 160, protein_g: 2, carbs_g: 8.5, fat_g: 14.7 },
  { id: 36, name: 'Almendras', category: 'Grasas', serving_size: '100', serving_unit: 'gr', calories: 579, protein_g: 21.2, carbs_g: 21.7, fat_g: 49.9 },
  { id: 37, name: 'Aceite de Oliva', category: 'Grasas', serving_size: '100', serving_unit: 'gr', calories: 900, protein_g: 0, carbs_g: 0, fat_g: 100 },
  { id: 38, name: 'Queso Mozarella', category: 'Grasas', serving_size: '1', serving_unit: 'tajada', calories: 90, protein_g: 5, carbs_g: 1, fat_g: 7 },
  { id: 39, name: 'Queso Fitness', category: 'Grasas', serving_size: '30', serving_unit: 'gr', calories: 70, protein_g: 5, carbs_g: 3, fat_g: 5 },
  // EMPACADOS
  { id: 40, name: 'FitBar', category: 'Empacados', serving_size: '1', serving_unit: 'barra', calories: 170, protein_g: 25, carbs_g: 17, fat_g: 5 },
  { id: 41, name: 'Protein Pancakes', category: 'Empacados', serving_size: '55', serving_unit: 'gr', calories: 180, protein_g: 20, carbs_g: 20, fat_g: 3 },
];

// ─── Test Scenarios ───────────────────────────────────────────────────────

const SCENARIOS = [
  // Scenario 1: Maria - lose weight
  { name: 'Maria (perder peso, 3 comidas)', tdee: 2317, goal: 'lose_weight', weight: 65, targetWeight: 58, mealsPerDay: 3, deficitLevel: 'moderate' },
  // Scenario 2: Carlos - gain muscle
  { name: 'Carlos (ganar musculo, 5 comidas)', tdee: 3042, goal: 'gain_muscle', weight: 70, targetWeight: 80, mealsPerDay: 5, deficitLevel: 'moderate' },
  // Scenario 3: Edge case - low calories
  { name: 'Edge Case (definicion, 4 comidas)', tdee: 1395, goal: 'get_shredded', weight: 40, targetWeight: 40, mealsPerDay: 4, deficitLevel: 'moderate' },
  // Scenario 4: Heavy person - high calories
  { name: 'Pesado (ganar musculo, 6 comidas)', tdee: 3500, goal: 'gain_muscle', weight: 100, targetWeight: 105, mealsPerDay: 6, deficitLevel: 'aggressive' },
  // Scenario 5: Light deficit
  { name: 'Conservador (perder peso, 2 comidas)', tdee: 2000, goal: 'lose_weight', weight: 80, targetWeight: 70, mealsPerDay: 2, deficitLevel: 'conservative' },
  // Scenario 6: Shredded high meals
  { name: 'Definicion extrema (6 comidas)', tdee: 2500, goal: 'get_shredded', weight: 75, targetWeight: 70, mealsPerDay: 6, deficitLevel: 'moderate' },
];

// ─── Run Tests ────────────────────────────────────────────────────────────

let totalTests = 0;
let passed = 0;
let failed = 0;
const failures = [];

console.log('═══════════════════════════════════════════════════════════════');
console.log('  MEAL SUGGESTION ACCURACY TEST (max 5% deviation)');
console.log('═══════════════════════════════════════════════════════════════\n');

for (const scenario of SCENARIOS) {
  const plan = generateNutritionPlan(scenario);

  // Test with multiple seeds for rotation coverage
  for (let seed = 0; seed < 10; seed++) {
    const enrichedMeals = generateMealSuggestions(plan.mealDistribution, FOODS, seed);

    for (const meal of enrichedMeals) {
      totalTests++;
      const t = meal.suggestion_totals;
      if (!t) {
        failed++;
        failures.push(`${scenario.name} | ${meal.name} (seed ${seed}): No suggestions generated`);
        continue;
      }

      const calDev = meal.calories > 0 ? Math.abs(t.calories - meal.calories) / meal.calories : 0;
      const protDev = meal.protein_g > 0 ? Math.abs(t.protein_g - meal.protein_g) / meal.protein_g : 0;
      const carbsDev = meal.carbs_g > 0 ? Math.abs(t.carbs_g - meal.carbs_g) / meal.carbs_g : 0;
      const fatDev = meal.fat_g > 0 ? Math.abs(t.fat_g - meal.fat_g) / meal.fat_g : 0;

      const maxDev = Math.max(calDev, protDev, carbsDev, fatDev);
      const ok = maxDev <= 0.05;

      if (ok) {
        passed++;
      } else {
        failed++;
        const worst = [
          { name: 'Cal', dev: calDev, actual: t.calories, target: meal.calories },
          { name: 'Prot', dev: protDev, actual: t.protein_g, target: meal.protein_g },
          { name: 'Carbs', dev: carbsDev, actual: t.carbs_g, target: meal.carbs_g },
          { name: 'Fat', dev: fatDev, actual: t.fat_g, target: meal.fat_g },
        ].sort((a, b) => b.dev - a.dev)[0];

        failures.push(
          `${scenario.name} | ${meal.name} (seed ${seed}): ${worst.name} dev=${(worst.dev * 100).toFixed(1)}% (${worst.actual} vs ${worst.target}) | match=${meal.match_pct}%`
        );
      }
    }
  }
}

console.log(`\nResults: ${passed}/${totalTests} passed, ${failed} failed\n`);

if (failures.length > 0) {
  console.log('─── FAILURES (>5% deviation) ─────────────────────────────────\n');
  for (const f of failures) {
    console.log(`  ✗ ${f}`);
  }
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`  ${failed === 0 ? '✅ ALL TESTS PASSED' : `❌ ${failed} TESTS FAILED`}`);
console.log('═══════════════════════════════════════════════════════════════\n');

process.exit(failed > 0 ? 1 : 0);
