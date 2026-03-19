import { body, query, validationResult } from 'express-validator';

// ─── Error handler for validation results ────────────────────────────────
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
}

// ─── Profile update validation ───────────────────────────────────────────
export const validateProfile = [
  body('full_name').optional().trim().isLength({ max: 100 }).withMessage('Nombre muy largo (max 100 caracteres)'),
  body('sex').optional().isIn(['M', 'F']).withMessage('Sexo debe ser M o F'),
  body('age').optional().isInt({ min: 10, max: 120 }).withMessage('Edad debe estar entre 10 y 120'),
  body('weight_kg').optional().isFloat({ min: 20, max: 500 }).withMessage('Peso debe estar entre 20 y 500 kg'),
  body('height_cm').optional().isFloat({ min: 50, max: 300 }).withMessage('Altura debe estar entre 50 y 300 cm'),
  body('target_weight_kg').optional().isFloat({ min: 20, max: 500 }).withMessage('Peso objetivo invalido'),
  body('neck_cm').optional().isFloat({ min: 15, max: 80 }).withMessage('Circunferencia de cuello invalida'),
  body('waist_cm').optional().isFloat({ min: 30, max: 200 }).withMessage('Circunferencia de cintura invalida'),
  body('hip_cm').optional().isFloat({ min: 30, max: 200 }).withMessage('Circunferencia de cadera invalida'),
  body('activity_level').optional().isInt({ min: 1, max: 6 }).withMessage('Nivel de actividad debe ser 1-6'),
  body('meals_per_day').optional().isInt({ min: 1, max: 10 }).withMessage('Comidas al dia debe ser 1-10'),
  body('diet_type').optional().isIn(['none', 'standard', 'vegetarian', 'vegan', 'keto', 'paleo', 'mediterranean']).withMessage('Tipo de dieta invalido'),
  body('goal').optional().isIn(['lose_weight', 'gain_muscle', 'get_shredded']).withMessage('Objetivo invalido'),
  body('body_type').optional().isIn(['thin', 'average', 'heavy', 'ectomorph', 'mesomorph', 'endomorph']).withMessage('Tipo de cuerpo invalido'),
  body('stress_level').optional().isInt({ min: 1, max: 5 }).withMessage('Nivel de estres debe ser 1-5'),
  body('sleep_hours').optional().isFloat({ min: 0, max: 24 }).withMessage('Horas de sueno invalidas'),
  body('water_liters').optional().isFloat({ min: 0, max: 20 }).withMessage('Litros de agua invalidos'),
  body('alcohol_frequency').optional().isIn(['never', 'occasional', 'moderate', 'frequent']).withMessage('Frecuencia de alcohol invalida'),
  body('smoking').optional().isBoolean().withMessage('Valor de fumador invalido'),
  // Photos must be URLs, not base64 blobs
  body('photo_front').optional().isLength({ max: 2000 }).withMessage('URL de foto muy larga'),
  body('photo_side').optional().isLength({ max: 2000 }).withMessage('URL de foto muy larga'),
  body('photo_back').optional().isLength({ max: 2000 }).withMessage('URL de foto muy larga'),
  handleValidationErrors,
];

// ─── Metabolic calculation validation ────────────────────────────────────
export const validateMetabolic = [
  body('weight').notEmpty().isFloat({ min: 20, max: 500 }).withMessage('Peso requerido (20-500 kg)'),
  body('height').notEmpty().isFloat({ min: 50, max: 300 }).withMessage('Altura requerida (50-300 cm)'),
  body('age').notEmpty().isInt({ min: 10, max: 120 }).withMessage('Edad requerida (10-120)'),
  body('sex').notEmpty().isIn(['M', 'F', 'male', 'female']).withMessage('Sexo requerido (M/F)'),
  body('activityLevel').notEmpty().isInt({ min: 1, max: 6 }).withMessage('Nivel de actividad requerido (1-6)'),
  body('neck').notEmpty().isFloat({ min: 15, max: 80 }).withMessage('Medida de cuello requerida'),
  body('waist').notEmpty().isFloat({ min: 30, max: 200 }).withMessage('Medida de cintura requerida'),
  body('hip').optional().isFloat({ min: 30, max: 200 }).withMessage('Medida de cadera invalida'),
  handleValidationErrors,
];

// ─── Nutrition plan validation ───────────────────────────────────────────
export const validateNutritionPlan = [
  body('tdee').notEmpty().isFloat({ min: 500, max: 10000 }).withMessage('TDEE requerido (500-10000)'),
  body('goal').notEmpty().isIn(['lose_weight', 'gain_muscle', 'get_shredded']).withMessage('Objetivo invalido'),
  body('weight').notEmpty().isFloat({ min: 20, max: 500 }).withMessage('Peso requerido'),
  body('target_weight').optional().isFloat({ min: 20, max: 500 }).withMessage('Peso objetivo invalido'),
  body('meals_per_day').optional().isInt({ min: 1, max: 10 }).withMessage('Comidas al dia invalido'),
  handleValidationErrors,
];

// ─── Food creation validation ────────────────────────────────────────────
export const validateFood = [
  body('name').notEmpty().trim().isLength({ max: 200 }).withMessage('Nombre requerido (max 200 caracteres)'),
  body('category').notEmpty().isIn(['Proteinas', 'Carbohidratos', 'Frutas', 'Grasas', 'Empacados']).withMessage('Categoria invalida'),
  body('calories').optional().isFloat({ min: 0 }).withMessage('Calorias debe ser positivo'),
  body('protein_g').optional().isFloat({ min: 0 }).withMessage('Proteina debe ser positivo'),
  body('carbs_g').optional().isFloat({ min: 0 }).withMessage('Carbs debe ser positivo'),
  body('fat_g').optional().isFloat({ min: 0 }).withMessage('Grasa debe ser positivo'),
  body('serving_size').optional().isFloat({ min: 0 }).withMessage('Porcion debe ser positivo'),
  handleValidationErrors,
];

// ─── Food search sanitization ────────────────────────────────────────────
export const validateFoodSearch = [
  query('q').optional().trim().isLength({ max: 100 }).withMessage('Busqueda muy larga'),
  handleValidationErrors,
];

// ─── Onboarding photo validation ─────────────────────────────────────────
export const validatePhoto = [
  body('type').notEmpty().isIn(['front', 'side', 'back']).withMessage('Tipo debe ser front, side o back'),
  body('url').notEmpty().isLength({ max: 2000 }).withMessage('URL invalida'),
  handleValidationErrors,
];

// ─── Onboarding section update validation ────────────────────────────────
export const validateSectionUpdate = [
  body('title').optional().trim().isLength({ max: 200 }).withMessage('Titulo muy largo'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Descripcion muy larga'),
  body('icon').optional().trim().isLength({ max: 50 }).withMessage('Icono invalido'),
  body('sort_order').optional().isInt({ min: 0, max: 100 }).withMessage('Orden invalido'),
  body('enabled').optional().isBoolean().withMessage('Valor enabled invalido'),
  body('required').optional().isBoolean().withMessage('Valor required invalido'),
  handleValidationErrors,
];
