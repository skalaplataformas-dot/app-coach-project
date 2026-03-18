/**
 * Seed food database from user's spreadsheet.
 * Run: node seed/foods.js
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const foods = [
  // === PROTEINAS ===
  { name: 'Huevo', category: 'Proteinas', serving_size: '1', serving_unit: 'unidad', calories: 70, protein_g: 6, carbs_g: 0, fat_g: 5, sodium_mg: 438.2, fiber_g: 0, sugar_g: 0 },
  { name: 'Clara de Huevo', category: 'Proteinas', serving_size: '1', serving_unit: 'unidad', calories: 17, protein_g: 3.6, carbs_g: 0.2, fat_g: 0.1, sodium_mg: 54.8, fiber_g: 0, sugar_g: 0 },
  { name: 'Whey Protein', category: 'Proteinas', serving_size: '26', serving_unit: 'gr', calories: 90, protein_g: 21, carbs_g: 1, fat_g: 0.5, sodium_mg: 110, fiber_g: 0, sugar_g: 0 },
  { name: 'Pechuga de Pollo', category: 'Proteinas', serving_size: '100', serving_unit: 'gr', calories: 149, protein_g: 28, carbs_g: 2, fat_g: 3.3, sodium_mg: 334, fiber_g: 0, sugar_g: 0 },
  { name: 'Pierna de Pollo', category: 'Proteinas', serving_size: '100', serving_unit: 'gr', calories: 168, protein_g: 24.4, carbs_g: 0, fat_g: 7.1, sodium_mg: 345, fiber_g: 0, sugar_g: 0 },
  { name: 'Lata de Atun', category: 'Proteinas', serving_size: '85', serving_unit: 'gr', calories: 99, protein_g: 21.68, carbs_g: 0, fat_g: 0.7, sodium_mg: 287, fiber_g: 0, sugar_g: 0 },
  { name: 'Salmon', category: 'Proteinas', serving_size: '100', serving_unit: 'gr', calories: 159, protein_g: 20.6, carbs_g: 0, fat_g: 8.2, sodium_mg: 41.2, fiber_g: 0, sugar_g: 0 },
  { name: 'Tilapia', category: 'Proteinas', serving_size: '100', serving_unit: 'gr', calories: 121, protein_g: 25.3, carbs_g: 0.1, fat_g: 2.1, sodium_mg: 388, fiber_g: 0, sugar_g: 0 },
  { name: 'Camarones', category: 'Proteinas', serving_size: '100', serving_unit: 'gr', calories: 91, protein_g: 17.4, carbs_g: 1.2, fat_g: 1.3, sodium_mg: 347, fiber_g: 0, sugar_g: 0 },
  { name: 'Lomo de Cerdo', category: 'Proteinas', serving_size: '100', serving_unit: 'gr', calories: 147, protein_g: 26, carbs_g: 0, fat_g: 4, sodium_mg: 57, fiber_g: 0, sugar_g: 0 },
  { name: 'Carne Magra', category: 'Proteinas', serving_size: '100', serving_unit: 'gr', calories: 159, protein_g: 29.6, carbs_g: 0, fat_g: 4.4, sodium_mg: 389, fiber_g: 0, sugar_g: 0 },
  { name: 'Pechuga de Pollo (muslo)', category: 'Proteinas', serving_size: '100', serving_unit: 'gr', calories: 145, protein_g: 22.2, carbs_g: 0, fat_g: 6.2, sodium_mg: 66, fiber_g: 0, sugar_g: 0 },
  { name: 'Yogurt Griego sin Azucar', category: 'Proteinas', serving_size: '100', serving_unit: 'gr', calories: 75, protein_g: 9, carbs_g: 5, fat_g: 2, sodium_mg: 40, fiber_g: 0, sugar_g: 2 },
  { name: 'Jamon Pietran (Pavo)', category: 'Proteinas', serving_size: '2', serving_unit: 'lonjas', calories: 44, protein_g: 7.7, carbs_g: 2.5, fat_g: 0.3, sodium_mg: 162, fiber_g: 0, sugar_g: 0.2 },
  { name: 'Jamon Pietran (Pollo)', category: 'Proteinas', serving_size: '2', serving_unit: 'lonjas', calories: 44, protein_g: 7.7, carbs_g: 2.5, fat_g: 0.3, sodium_mg: 162, fiber_g: 0, sugar_g: 0.2 },
  { name: 'Complex 8', category: 'Proteinas', serving_size: '1', serving_unit: 'scoop', calories: 190, protein_g: 40, carbs_g: 7, fat_g: 1, sodium_mg: 70, fiber_g: 0.5, sugar_g: 6 },
  { name: 'Pechuga de Pavo', category: 'Proteinas', serving_size: '100', serving_unit: 'gr', calories: 104, protein_g: 17.07, carbs_g: 4.21, fat_g: 1.66, sodium_mg: 2.54, fiber_g: 0.5, sugar_g: 0 },
  { name: 'Salchichas de Pavo', category: 'Proteinas', serving_size: '50', serving_unit: 'gr', calories: 60, protein_g: 9.5, carbs_g: 0.8, fat_g: 0, sodium_mg: 156, fiber_g: 0, sugar_g: 0 },

  // === CARBOHIDRATOS ===
  { name: 'Arroz', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 185, protein_g: 3.8, carbs_g: 40.1, fat_g: 0.4, sodium_mg: 524.5, fiber_g: 0.5, sugar_g: 0.1 },
  { name: 'Maduro', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 122, protein_g: 1.3, carbs_g: 31.8, fat_g: 0.4, sodium_mg: 3.9, fiber_g: 2.3, sugar_g: 15.1 },
  { name: 'Yuca', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 120, protein_g: 3.1, carbs_g: 26.8, fat_g: 0.4, sodium_mg: 0, fiber_g: 0, sugar_g: 0 },
  { name: 'Papa Blanca', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 110, protein_g: 3, carbs_g: 26, fat_g: 3, sodium_mg: 10, fiber_g: 2, sugar_g: 1 },
  { name: 'Pan Blanco (Bimbo)', category: 'Carbohidratos', serving_size: '2', serving_unit: 'rebanadas', calories: 130, protein_g: 6, carbs_g: 24, fat_g: 1, sodium_mg: 190, fiber_g: 1, sugar_g: 2 },
  { name: 'Pan Integral (Bimbo)', category: 'Carbohidratos', serving_size: '2', serving_unit: 'rebanadas', calories: 154, protein_g: 5.8, carbs_g: 28.4, fat_g: 2, sodium_mg: 250, fiber_g: 3.4, sugar_g: 4.4 },
  { name: 'Tortillas Integrales (Medium)', category: 'Carbohidratos', serving_size: '2', serving_unit: 'unidades', calories: 200, protein_g: 4, carbs_g: 30, fat_g: 6, sodium_mg: 360, fiber_g: 4, sugar_g: 4 },
  { name: 'Avena', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 345, protein_g: 13, carbs_g: 55, fat_g: 8, sodium_mg: 7, fiber_g: 11, sugar_g: 0 },
  { name: 'Arepa Choclo', category: 'Carbohidratos', serving_size: '80', serving_unit: 'gr', calories: 130, protein_g: 3, carbs_g: 28, fat_g: 1.5, sodium_mg: 180, fiber_g: 3, sugar_g: 0 },
  { name: 'Pasta Spaghetti Crudo', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 350, protein_g: 12, carbs_g: 75.8, fat_g: 1.5, sodium_mg: 10, fiber_g: 4, sugar_g: 0 },
  { name: 'Miel', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 300, protein_g: 0, carbs_g: 80, fat_g: 0, sodium_mg: 0, fiber_g: 0, sugar_g: 70 },
  { name: 'Harina de Arroz', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 350, protein_g: 8.8, carbs_g: 74.4, fat_g: 1.5, sodium_mg: 0, fiber_g: 0, sugar_g: 1 },
  { name: 'Frijol', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 126, protein_g: 6.5, carbs_g: 22.6, fat_g: 0.5, sodium_mg: 220, fiber_g: 7.4, sugar_g: 0.3 },
  { name: 'Cereal Azucar', category: 'Carbohidratos', serving_size: '30', serving_unit: 'gr', calories: 110, protein_g: 1, carbs_g: 27, fat_g: 0, sodium_mg: 115, fiber_g: 0.5, sugar_g: 12 },
  { name: 'Pan Artesanal Blanco', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 260, protein_g: 11, carbs_g: 52, fat_g: 1.6, sodium_mg: 435, fiber_g: 2.5, sugar_g: 5.9 },
  { name: 'Pan Pita', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 263, protein_g: 11, carbs_g: 52, fat_g: 1.6, sodium_mg: 490, fiber_g: 1.5, sugar_g: 4 },
  { name: 'Pan Baguette', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 215, protein_g: 7.2, carbs_g: 44.6, fat_g: 0.9, sodium_mg: 0, fiber_g: 0, sugar_g: 0.6 },
  { name: 'Arepa Maiz Masmai', category: 'Carbohidratos', serving_size: '1', serving_unit: 'unidad', calories: 184, protein_g: 5, carbs_g: 31, fat_g: 4.8, sodium_mg: 48, fiber_g: 0.9, sugar_g: 0 },
  { name: 'Cereal Maiz', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 354, protein_g: 6.1, carbs_g: 87, fat_g: 0, sodium_mg: 270, fiber_g: 9.3, sugar_g: 7.2 },
  { name: 'Galletas de Maiz', category: 'Carbohidratos', serving_size: '28', serving_unit: 'gr', calories: 101, protein_g: 1.5, carbs_g: 24, fat_g: 0, sodium_mg: 72, fiber_g: 0.5, sugar_g: 0 },
  { name: 'Vegetales', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 120, protein_g: 4, carbs_g: 28, fat_g: 0, sodium_mg: 60, fiber_g: 8, sugar_g: 0 },
  { name: 'Cereal Alkosto', category: 'Carbohidratos', serving_size: '40', serving_unit: 'gr', calories: 130, protein_g: 8, carbs_g: 26, fat_g: 1.5, sodium_mg: 40, fiber_g: 2, sugar_g: 8 },
  { name: 'Hojuelas de Maiz', category: 'Carbohidratos', serving_size: '100', serving_unit: 'gr', calories: 353, protein_g: 6, carbs_g: 86.7, fat_g: 0, sodium_mg: 0, fiber_g: 9.3, sugar_g: 7 },

  // === FRUTAS ===
  { name: 'Fresas', category: 'Frutas', serving_size: '100', serving_unit: 'gr', calories: 32, protein_g: 0.7, carbs_g: 7.7, fat_g: 0.3, sodium_mg: 1, fiber_g: 2, sugar_g: 4.9 },
  { name: 'Piña', category: 'Frutas', serving_size: '100', serving_unit: 'gr', calories: 50, protein_g: 0.5, carbs_g: 13, fat_g: 0.1, sodium_mg: 1, fiber_g: 1.4, sugar_g: 10 },
  { name: 'Banano', category: 'Frutas', serving_size: '100', serving_unit: 'gr', calories: 59, protein_g: 1.1, carbs_g: 22.8, fat_g: 0.3, sodium_mg: 1, fiber_g: 2.6, sugar_g: 12.2 },
  { name: 'Manzana', category: 'Frutas', serving_size: '100', serving_unit: 'gr', calories: 59, protein_g: 0.3, carbs_g: 15, fat_g: 0.2, sodium_mg: 1, fiber_g: 2.3, sugar_g: 10.5 },
  { name: 'Mango', category: 'Frutas', serving_size: '100', serving_unit: 'gr', calories: 60, protein_g: 0.8, carbs_g: 15, fat_g: 0.4, sodium_mg: 1, fiber_g: 1.6, sugar_g: 13.7 },
  { name: 'Pera', category: 'Frutas', serving_size: '100', serving_unit: 'gr', calories: 58, protein_g: 0.4, carbs_g: 15.5, fat_g: 0, sodium_mg: 1, fiber_g: 3.1, sugar_g: 9.8 },
  { name: 'Papaya', category: 'Frutas', serving_size: '100', serving_unit: 'gr', calories: 39, protein_g: 0.6, carbs_g: 9.8, fat_g: 0.1, sodium_mg: 8, fiber_g: 1.8, sugar_g: 6.9 },
  { name: 'Arandanos', category: 'Frutas', serving_size: '100', serving_unit: 'gr', calories: 57, protein_g: 0.7, carbs_g: 14.5, fat_g: 0.3, sodium_mg: 1, fiber_g: 2.4, sugar_g: 10 },

  // === GRASAS ===
  { name: 'Mantequilla de Mani', category: 'Grasas', serving_size: '100', serving_unit: 'gr', calories: 667, protein_g: 23.3, carbs_g: 20, fat_g: 53.3, sodium_mg: 50, fiber_g: 6.7, sugar_g: 10 },
  { name: 'Mantequilla de Almendra', category: 'Grasas', serving_size: '100', serving_unit: 'gr', calories: 614, protein_g: 21, carbs_g: 19, fat_g: 56, sodium_mg: 7, fiber_g: 10, sugar_g: 4 },
  { name: 'Aguacate', category: 'Grasas', serving_size: '100', serving_unit: 'gr', calories: 160, protein_g: 2, carbs_g: 8.5, fat_g: 14.7, sodium_mg: 7, fiber_g: 6.7, sugar_g: 0.7 },
  { name: 'Almendras', category: 'Grasas', serving_size: '100', serving_unit: 'gr', calories: 579, protein_g: 21.1, carbs_g: 21.5, fat_g: 49.9, sodium_mg: 1, fiber_g: 12.5, sugar_g: 4.3 },
  { name: 'Mani', category: 'Grasas', serving_size: '100', serving_unit: 'gr', calories: 633, protein_g: 26.7, carbs_g: 20, fat_g: 50, sodium_mg: 250, fiber_g: 10, sugar_g: 3.3 },
  { name: 'Aceite de Coco', category: 'Grasas', serving_size: '100', serving_unit: 'gr', calories: 840, protein_g: 0, carbs_g: 0, fat_g: 93.3, sodium_mg: 3.3, fiber_g: 0, sugar_g: 0 },
  { name: 'Aceite de Oliva', category: 'Grasas', serving_size: '100', serving_unit: 'gr', calories: 900, protein_g: 0, carbs_g: 0, fat_g: 100, sodium_mg: 0, fiber_g: 0, sugar_g: 0 },
  { name: 'Queso Mozarella', category: 'Grasas', serving_size: '1', serving_unit: 'tajada', calories: 90, protein_g: 6, carbs_g: 0, fat_g: 7, sodium_mg: 170, fiber_g: 0, sugar_g: 0 },
  { name: 'Queso Pera (Vecchio)', category: 'Grasas', serving_size: '100', serving_unit: 'gr', calories: 289, protein_g: 24.4, carbs_g: 4.4, fat_g: 20, sodium_mg: 533.3, fiber_g: 2.2, sugar_g: 0 },
  { name: 'Queso Fitness', category: 'Grasas', serving_size: '30', serving_unit: 'gr', calories: 70, protein_g: 7, carbs_g: 0, fat_g: 5, sodium_mg: 95, fiber_g: 0, sugar_g: 0 },
  { name: 'Queso Cuajada', category: 'Grasas', serving_size: '30', serving_unit: 'gr', calories: 89, protein_g: 5.6, carbs_g: 1.3, fat_g: 6.8, sodium_mg: 67, fiber_g: 0, sugar_g: 0 },
  { name: 'Quesito', category: 'Grasas', serving_size: '100', serving_unit: 'gr', calories: 175, protein_g: 9.9, carbs_g: 6.8, fat_g: 12, sodium_mg: 411, fiber_g: 0, sugar_g: 6.5 },
  { name: 'Cacao sin Azucar', category: 'Grasas', serving_size: '100', serving_unit: 'gr', calories: 355, protein_g: 27, carbs_g: 18, fat_g: 11, sodium_mg: 0, fiber_g: 25, sugar_g: 1.5 },

  // === EMPACADOS ===
  { name: 'FitBar', category: 'Empacados', serving_size: '1', serving_unit: 'barra', calories: 170, protein_g: 25, carbs_g: 17, fat_g: 1, sodium_mg: 90, fiber_g: 0, sugar_g: 3 },
  { name: 'Protein Pancakes', category: 'Empacados', serving_size: '55', serving_unit: 'gr', calories: 180, protein_g: 20, carbs_g: 20, fat_g: 2, sodium_mg: 240, fiber_g: 0, sugar_g: 0 },
];

async function seed() {
  console.log(`Seeding ${foods.length} foods...`);

  // Clear existing foods
  const { error: deleteError } = await supabase.from('foods').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) console.warn('Warning clearing foods:', deleteError.message);

  // Insert in batches of 20
  for (let i = 0; i < foods.length; i += 20) {
    const batch = foods.slice(i, i + 20);
    const { error } = await supabase.from('foods').insert(batch);
    if (error) {
      console.error(`Error inserting batch ${i}:`, error.message);
    } else {
      console.log(`Inserted ${Math.min(i + 20, foods.length)}/${foods.length}`);
    }
  }

  console.log('Food seed complete!');
}

seed().catch(console.error);
