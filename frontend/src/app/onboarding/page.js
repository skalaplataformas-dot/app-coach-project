'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { calculateMetabolicData } from '@/lib/metabolic-math';
import { apiFetch } from '@/lib/api';
import { createClientSupabase } from '@/lib/supabase/client';
import {
  Flame, Dumbbell, Zap, User, Ruler, Scale, Target, Activity,
  Utensils, Leaf, ChevronLeft, Check, Trophy, Heart, TrendingUp,
  ArrowRight, Sparkles, Crown, Timer, Apple, Beef, Salad, Fish,
  CircleDot, ChartBar, Brain, Shield, Star, MessageCircle,
  Camera, Moon, Droplets, Wind, Wine, Cigarette, AlertTriangle,
  Pill, Stethoscope, Bandage, Settings, Coffee,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════
// SECTION DEFINITIONS — Each section groups related steps
// ═══════════════════════════════════════════════════════════════════════

const SECTION_STEPS = {
  personal_info: [
    {
      key: 'bodyType', title: '¿CUÁL ES TU TIPO DE CUERPO?',
      subtitle: 'Selecciona el que más se parezca al tuyo',
      type: 'body_type',
      options: [
        { label: 'Ectomorfo', value: 'thin', subtext: 'Complexión delgada, metabolismo rápido', Icon: Activity },
        { label: 'Mesomorfo', value: 'average', subtext: 'Atlético, gana músculo fácilmente', Icon: Dumbbell },
        { label: 'Endomorfo', value: 'heavy', subtext: 'Complexión robusta, retiene energía', Icon: Shield },
      ],
    },
    {
      key: 'goal', title: '¿CUÁL ES TU OBJETIVO PRINCIPAL?',
      subtitle: 'Esto determina todo tu plan personalizado',
      type: 'options',
      options: [
        { label: 'Perder grasa corporal', value: 'lose_weight', subtext: 'Quemar grasa y mejorar composición', Icon: Flame },
        { label: 'Ganar masa muscular', value: 'gain_muscle', subtext: 'Aumentar tamaño y fuerza', Icon: Dumbbell },
        { label: 'Definición extrema', value: 'get_shredded', subtext: 'Marcar cada músculo al máximo', Icon: Zap },
      ],
      motivational: 'after_goal',
    },
    {
      key: 'sex', title: 'TU GÉNERO BIOLÓGICO',
      subtitle: 'Necesario para cálculos metabólicos precisos',
      type: 'options',
      options: [
        { label: 'Masculino', value: 'M', Icon: User },
        { label: 'Femenino', value: 'F', Icon: Heart },
      ],
    },
    {
      key: 'age', title: '¿CUÁNTOS AÑOS TIENES?',
      subtitle: 'Tu metabolismo cambia con la edad',
      type: 'slider', SliderIcon: Timer,
      config: { min: 14, max: 70, step: 1, unit: 'años', default: 25 },
    },
  ],

  measurements: [
    {
      key: 'height_cm', title: 'TU ALTURA',
      subtitle: 'Fundamental para calcular tu metabolismo basal',
      type: 'slider', SliderIcon: Ruler,
      config: { min: 140, max: 210, step: 1, unit: 'cm', default: 175 },
    },
    {
      key: 'weight_kg', title: 'TU PESO ACTUAL',
      subtitle: 'Sé honesto, es tu punto de partida',
      type: 'slider', SliderIcon: Scale,
      config: { min: 40, max: 180, step: 0.5, unit: 'kg', default: 75 },
    },
    {
      key: 'target_weight_kg', title: 'TU PESO OBJETIVO',
      subtitle: '¿A dónde quieres llegar?',
      type: 'slider', SliderIcon: Target,
      config: { min: 40, max: 180, step: 0.5, unit: 'kg', default: 70 },
      motivational: 'after_target',
    },
    {
      key: 'neck_cm', title: 'CIRCUNFERENCIA DE CUELLO',
      subtitle: 'Mide justo debajo de la nuez de Adán',
      type: 'slider', SliderIcon: CircleDot,
      config: { min: 25, max: 55, step: 0.5, unit: 'cm', default: 38 },
    },
    {
      key: 'waist_cm', title: 'CIRCUNFERENCIA DE CINTURA',
      subtitle: 'Mide a la altura del ombligo, relajado',
      type: 'slider', SliderIcon: CircleDot,
      config: { min: 55, max: 150, step: 0.5, unit: 'cm', default: 82 },
      motivational: 'after_measurements',
    },
    {
      key: 'hip_cm', title: 'CIRCUNFERENCIA DE CADERA',
      subtitle: 'La parte más ancha de los glúteos',
      type: 'slider', SliderIcon: CircleDot,
      config: { min: 60, max: 160, step: 0.5, unit: 'cm', default: 95 },
      condition: (ans) => ans.sex === 'F',
    },
  ],

  photos: [
    {
      key: 'photos', title: 'FOTOS DE PROGRESO',
      subtitle: 'Tu punto de partida visual. Opcional pero recomendado.',
      type: 'photos',
    },
  ],

  health: [
    {
      key: 'medical_conditions', title: 'CONDICIONES MÉDICAS',
      subtitle: 'Nos ayuda a adaptar tu plan de forma segura',
      type: 'text_optional',
      placeholder: 'Ej: Diabetes, hipertensión, hipotiroidismo...',
      helpText: 'Si no tienes ninguna, puedes saltar este paso.',
      Icon: Stethoscope,
    },
    {
      key: 'injuries', title: 'LESIONES O LIMITACIONES',
      subtitle: 'Para evitar ejercicios que puedan afectarte',
      type: 'text_optional',
      placeholder: 'Ej: Rodilla izquierda, espalda baja...',
      helpText: 'Si no tienes ninguna, puedes saltar este paso.',
      Icon: Bandage,
    },
    {
      key: 'medications', title: 'MEDICAMENTOS',
      subtitle: 'Algunos medicamentos afectan el metabolismo',
      type: 'text_optional',
      placeholder: 'Ej: Metformina, levotiroxina...',
      helpText: 'Esta información es confidencial.',
      Icon: Pill,
    },
    {
      key: 'allergies', title: 'ALERGIAS ALIMENTARIAS',
      subtitle: 'Para tu plan nutricional seguro',
      type: 'text_optional',
      placeholder: 'Ej: Gluten, lactosa, frutos secos...',
      helpText: 'Si no tienes ninguna, puedes saltar este paso.',
      Icon: AlertTriangle,
    },
  ],

  habits: [
    {
      key: 'sleep_hours', title: '¿CUÁNTAS HORAS DUERMES?',
      subtitle: 'El sueño es clave para la recuperación muscular',
      type: 'slider', SliderIcon: Moon,
      config: { min: 3, max: 12, step: 1, unit: 'horas', default: 7 },
    },
    {
      key: 'water_liters', title: '¿CUÁNTA AGUA TOMAS AL DÍA?',
      subtitle: 'La hidratación afecta directamente tu rendimiento',
      type: 'slider', SliderIcon: Droplets,
      config: { min: 0.5, max: 5, step: 0.5, unit: 'litros', default: 2 },
    },
    {
      key: 'stress_level', title: 'TU NIVEL DE ESTRÉS',
      subtitle: 'El cortisol alto afecta la composición corporal',
      type: 'options',
      options: [
        { label: 'Muy bajo', value: 1, subtext: 'Tranquilo y relajado', Icon: Star },
        { label: 'Bajo', value: 2, subtext: 'Ocasionalmente estresado', Icon: Wind },
        { label: 'Moderado', value: 3, subtext: 'Estrés regular', Icon: Activity },
        { label: 'Alto', value: 4, subtext: 'Frecuentemente estresado', Icon: TrendingUp },
        { label: 'Muy alto', value: 5, subtext: 'Estrés constante', Icon: AlertTriangle },
      ],
    },
    {
      key: 'alcohol_frequency', title: 'CONSUMO DE ALCOHOL',
      subtitle: 'El alcohol impacta la recuperación y los resultados',
      type: 'options',
      options: [
        { label: 'Nunca', value: 'never', subtext: 'No consumo alcohol', Icon: Shield },
        { label: 'Ocasional', value: 'occasional', subtext: '1-2 veces al mes', Icon: Wine },
        { label: 'Moderado', value: 'moderate', subtext: '1-2 veces por semana', Icon: Wine },
        { label: 'Frecuente', value: 'frequent', subtext: '3+ veces por semana', Icon: Wine },
      ],
    },
    {
      key: 'smoking', title: '¿FUMAS?',
      subtitle: 'El tabaco afecta la capacidad cardiovascular',
      type: 'options',
      options: [
        { label: 'No fumo', value: false, subtext: 'Sin consumo de tabaco', Icon: Shield },
        { label: 'Sí fumo', value: true, subtext: 'Consumo regular de tabaco', Icon: Cigarette },
      ],
    },
  ],

  preferences: [
    {
      key: 'activity_level', title: '¿QUÉ TAN ACTIVO ERES?',
      subtitle: 'Sé realista para obtener cálculos precisos',
      type: 'options',
      options: [
        { label: 'Sedentario', value: 1, subtext: 'Escritorio todo el día', Icon: User },
        { label: 'Ligeramente activo', value: 2, subtext: '1-2 días por semana', Icon: Activity },
        { label: 'Moderadamente activo', value: 3, subtext: '3-5 días por semana', Icon: TrendingUp },
        { label: 'Muy activo', value: 4, subtext: '6-7 días por semana', Icon: Dumbbell },
        { label: 'Extremadamente activo', value: 5, subtext: 'Atleta dedicado', Icon: Trophy },
        { label: 'Atleta profesional', value: 6, subtext: 'Doble sesión diaria', Icon: Crown },
      ],
    },
    {
      key: 'meals_per_day', title: '¿CUÁNTAS COMIDAS AL DÍA?',
      subtitle: 'Distribuiremos tus macros en cada comida',
      type: 'options',
      options: [
        { label: '2 comidas', value: 2, subtext: 'Ayuno intermitente', Icon: Timer },
        { label: '3 comidas', value: 3, subtext: 'Clásico', Icon: Utensils },
        { label: '4 comidas', value: 4, subtext: 'Ideal para músculo', Icon: Utensils },
        { label: '5 comidas', value: 5, subtext: 'Metabolismo activo', Icon: Utensils },
        { label: '6+ comidas', value: 6, subtext: 'Máximo rendimiento', Icon: Zap },
      ],
    },
    {
      key: 'preferred_foods', title: 'TUS ALIMENTOS FAVORITOS',
      subtitle: 'Selecciona hasta 5 alimentos que prefieras por categoría',
      type: 'food_picker',
    },
    {
      key: 'diet_type', title: '¿ALGUNA PREFERENCIA ALIMENTARIA?',
      subtitle: 'Adaptaremos tu plan a tu estilo de vida',
      type: 'options',
      options: [
        { label: 'Sin restricciones', value: 'none', subtext: 'Como de todo', Icon: Beef },
        { label: 'Vegetariana', value: 'vegetarian', subtext: 'Sin carne', Icon: Salad },
        { label: 'Vegana', value: 'vegan', subtext: 'Sin productos animales', Icon: Leaf },
        { label: 'Keto / Low Carb', value: 'keto', subtext: 'Alta grasa, bajos carbs', Icon: Fish },
        { label: 'Mediterránea', value: 'mediterranean', subtext: 'Equilibrada y natural', Icon: Apple },
      ],
    },
  ],
};

// Section icons mapping
const SECTION_ICONS = {
  User, Ruler, Camera, Heart, Coffee, Settings,
};

// ═══════════════════════════════════════════════════════════════════════
// COACH MESSAGES
// ═══════════════════════════════════════════════════════════════════════

const COACH_MESSAGES = {
  bodyType: 'Conocer tu somatotipo nos ayuda a personalizar tu plan de entrenamiento y nutrición.',
  sex: 'Los cálculos metabólicos varían significativamente entre hombres y mujeres.',
  age: 'A partir de los 30, tu metabolismo basal disminuye ~2% por década. Por eso es clave este dato.',
  height_cm: 'Tu altura junto con tu peso nos permite calcular tu IMC y composición corporal.',
  weight_kg: 'Este es tu punto de partida. Cada cambio que logres será visible desde aquí.',
  target_weight_kg: 'Un objetivo realista es perder 0.5-1kg por semana o ganar 0.25-0.5kg de músculo.',
  neck_cm: 'La medida del cuello es clave en la fórmula Navy para estimar tu porcentaje de grasa.',
  waist_cm: 'La circunferencia de cintura es el indicador #1 de salud metabólica según la OMS.',
  activity_level: 'Tu nivel de actividad multiplica tu metabolismo basal para obtener tu gasto real diario.',
  meals_per_day: 'No hay un número mágico. Lo importante es la consistencia y los macros totales del día.',
  preferred_foods: 'Tus alimentos favoritos tendrán prioridad en tu plan nutricional personalizado.',
  diet_type: 'Respetamos tu estilo alimentario. Tu plan se adaptará 100% a tu preferencia.',
  photos: 'Las fotos son opcionales pero son la mejor forma de ver tu progreso real con el tiempo.',
  medical_conditions: 'Tu salud es primero. Esta información nos ayuda a cuidarte mejor.',
  sleep_hours: 'Dormir entre 7-9 horas puede mejorar tus resultados hasta un 40%.',
  water_liters: 'La hidratación adecuada mejora el metabolismo y la recuperación muscular.',
  stress_level: 'El estrés crónico eleva el cortisol y dificulta la pérdida de grasa.',
  alcohol_frequency: 'El alcohol aporta 7 cal/g y dificulta la síntesis de proteínas.',
};

// ═══════════════════════════════════════════════════════════════════════
// MOTIVATIONAL SCREENS
// ═══════════════════════════════════════════════════════════════════════

const MOTIVATIONAL_SCREENS = {
  after_goal: {
    lose_weight: {
      Icon: Flame, title: '¡Vamos a lograrlo!',
      message: 'Cada kilo que pierdas te acerca más a tu mejor versión. Te vamos a guiar en cada paso del camino.',
      color: '#ff8844',
      stat: 'El 73% de nuestros usuarios alcanzan su peso objetivo en menos de 90 días',
    },
    gain_muscle: {
      Icon: Dumbbell, title: '¡Es hora de crecer!',
      message: 'Construir músculo transforma tu cuerpo y tu confianza. Vamos a diseñar tu camino al crecimiento.',
      color: '#00ddff',
      stat: 'Usuarios con tu perfil ganan en promedio 4.2kg de masa muscular en 12 semanas',
    },
    get_shredded: {
      Icon: Zap, title: '¡Definición total!',
      message: 'Vas por el siguiente nivel. Te ayudaremos a esculpir cada músculo con precisión.',
      color: '#00ff88',
      stat: 'El 68% de usuarios logran reducir su % de grasa a niveles fitness en 8 semanas',
    },
  },
  after_measurements: {
    Icon: ChartBar, title: '¡Excelente! Ya tenemos tus datos',
    message: 'Con estas medidas vamos a calcular tu composición corporal con precisión científica.',
    color: '#00ff88',
    stat: 'Nuestros cálculos utilizan 7 fórmulas clínicas validadas internacionalmente',
  },
  after_target: {
    Icon: Target, title: '¡Meta registrada!', message: null, color: '#00ddff', stat: null,
  },
};

// ═══════════════════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════

function CoachBubble({ message, visible }) {
  if (!visible || !message) return null;
  return (
    <div className="fixed bottom-6 left-4 right-4 z-50 flex items-end gap-3 animate-slide-up-page max-w-md mx-auto">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center shadow-lg shadow-primary/20">
        <Sparkles className="w-6 h-6 text-black" />
      </div>
      <div className="glass-card px-4 py-3 flex-1 text-sm text-gray-200 leading-relaxed">
        <div className="text-xs font-bold text-primary mb-1">FitBro Coach</div>
        {message}
      </div>
    </div>
  );
}

function BodySilhouette({ type, selected, sex = 'M' }) {
  const getColor = () => {
    if (!selected) return { main: '#444', accent: '#333' };
    const colors = {
      thin: { main: '#00ddff', accent: '#0099bb' },
      average: { main: '#00ff88', accent: '#00cc6a' },
      heavy: { main: '#ff8844', accent: '#cc6633' },
    };
    return colors[type];
  };
  const c = getColor();
  const glow = selected ? `drop-shadow(0 0 12px ${c.main}40)` : 'none';

  if (sex === 'F') {
    const silhouettes = {
      thin: (
        <svg viewBox="0 0 100 200" className="w-20 h-40 transition-all duration-500" style={{ filter: glow }}>
          <defs><linearGradient id={`gf-thin-${selected}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c.main} /><stop offset="100%" stopColor={c.accent} /></linearGradient></defs>
          <ellipse cx="50" cy="24" rx="13" ry="15" fill={`url(#gf-thin-${selected})`} />
          <path d="M44 39 L42 42 C40 45 38 50 37 56 L35 70 C34 78 35 85 36 90 L34 125 C33 135 34 145 35 155 L36 170 L42 170 L44 140 L46 125 L50 125 L54 125 L56 140 L58 170 L64 170 L65 155 C66 145 67 135 66 125 L64 90 C65 85 66 78 65 70 L63 56 C62 50 60 45 58 42 L56 39 Z" fill={`url(#gf-thin-${selected})`} />
          <path d="M37 48 L22 78 L26 80 L38 58" fill={`url(#gf-thin-${selected})`} />
          <path d="M63 48 L78 78 L74 80 L62 58" fill={`url(#gf-thin-${selected})`} />
          <ellipse cx="36" cy="170" rx="6" ry="3" fill={c.accent} /><ellipse cx="64" cy="170" rx="6" ry="3" fill={c.accent} />
        </svg>
      ),
      average: (
        <svg viewBox="0 0 100 200" className="w-20 h-40 transition-all duration-500" style={{ filter: glow }}>
          <defs><linearGradient id={`gf-avg-${selected}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c.main} /><stop offset="100%" stopColor={c.accent} /></linearGradient></defs>
          <ellipse cx="50" cy="24" rx="14" ry="15" fill={`url(#gf-avg-${selected})`} />
          <path d="M40 39 L38 43 C35 48 32 55 31 62 L30 72 C29 80 31 88 33 94 L30 128 C29 138 31 148 32 158 L33 172 L40 172 L43 142 L46 128 L50 128 L54 128 L57 142 L60 172 L67 172 L68 158 C69 148 71 138 70 128 L67 94 C69 88 71 80 70 72 L69 62 C68 55 65 48 62 43 L60 39 Z" fill={`url(#gf-avg-${selected})`} />
          <path d="M34 48 L18 76 L23 79 L37 56" fill={`url(#gf-avg-${selected})`} /><path d="M66 48 L82 76 L77 79 L63 56" fill={`url(#gf-avg-${selected})`} />
          <ellipse cx="33" cy="172" rx="7" ry="3" fill={c.accent} /><ellipse cx="67" cy="172" rx="7" ry="3" fill={c.accent} />
        </svg>
      ),
      heavy: (
        <svg viewBox="0 0 100 200" className="w-20 h-40 transition-all duration-500" style={{ filter: glow }}>
          <defs><linearGradient id={`gf-hvy-${selected}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c.main} /><stop offset="100%" stopColor={c.accent} /></linearGradient></defs>
          <ellipse cx="50" cy="24" rx="15" ry="16" fill={`url(#gf-hvy-${selected})`} />
          <path d="M36 40 L33 45 C29 52 26 60 25 68 L24 80 C23 90 25 98 28 104 L24 135 C23 146 25 155 27 163 L28 175 L37 175 L41 148 L45 132 L50 132 L55 132 L59 148 L63 175 L72 175 L73 163 C75 155 77 146 76 135 L72 104 C75 98 77 90 76 80 L75 68 C74 60 71 52 67 45 L64 40 Z" fill={`url(#gf-hvy-${selected})`} />
          <path d="M30 50 L12 78 L18 82 L34 58" fill={`url(#gf-hvy-${selected})`} /><path d="M70 50 L88 78 L82 82 L66 58" fill={`url(#gf-hvy-${selected})`} />
          <ellipse cx="28" cy="175" rx="9" ry="4" fill={c.accent} /><ellipse cx="72" cy="175" rx="9" ry="4" fill={c.accent} />
        </svg>
      ),
    };
    return silhouettes[type] || null;
  }

  const silhouettes = {
    thin: (
      <svg viewBox="0 0 100 200" className="w-20 h-40 transition-all duration-500" style={{ filter: glow }}>
        <defs><linearGradient id={`g-thin-${selected}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c.main} /><stop offset="100%" stopColor={c.accent} /></linearGradient></defs>
        <ellipse cx="50" cy="22" rx="13" ry="15" fill={`url(#g-thin-${selected})`} />
        <rect x="45" y="37" width="10" height="4" rx="2" fill={c.accent} />
        <path d="M38 41 C38 41 35 60 36 78 L34 80 L33 118 L33 155 L39 155 L42 120 L44 100 L50 100 L56 100 L58 120 L61 155 L67 155 L67 118 L66 80 L64 78 C65 60 62 41 62 41 Z" fill={`url(#g-thin-${selected})`} />
        <path d="M38 46 L20 78 L25 80 L40 56" fill={`url(#g-thin-${selected})`} /><path d="M62 46 L80 78 L75 80 L60 56" fill={`url(#g-thin-${selected})`} />
        <rect x="32" y="153" width="8" height="5" rx="2" fill={c.accent} /><rect x="60" y="153" width="8" height="5" rx="2" fill={c.accent} />
      </svg>
    ),
    average: (
      <svg viewBox="0 0 100 200" className="w-20 h-40 transition-all duration-500" style={{ filter: glow }}>
        <defs><linearGradient id={`g-avg-${selected}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c.main} /><stop offset="100%" stopColor={c.accent} /></linearGradient></defs>
        <ellipse cx="50" cy="22" rx="14" ry="15" fill={`url(#g-avg-${selected})`} />
        <rect x="42" y="37" width="16" height="5" rx="2" fill={c.accent} />
        <path d="M32 42 C32 42 28 58 29 72 C28 82 30 92 32 98 L30 118 L29 155 L37 155 L41 120 L44 100 L50 100 L56 100 L59 120 L63 155 L71 155 L70 118 L68 98 C70 92 72 82 71 72 C72 58 68 42 68 42 Z" fill={`url(#g-avg-${selected})`} />
        <path d="M32 47 L12 76 L18 79 L36 55" fill={`url(#g-avg-${selected})`} /><path d="M68 47 L88 76 L82 79 L64 55" fill={`url(#g-avg-${selected})`} />
        <rect x="28" y="153" width="10" height="5" rx="2" fill={c.accent} /><rect x="62" y="153" width="10" height="5" rx="2" fill={c.accent} />
      </svg>
    ),
    heavy: (
      <svg viewBox="0 0 100 200" className="w-20 h-40 transition-all duration-500" style={{ filter: glow }}>
        <defs><linearGradient id={`g-hvy-${selected}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c.main} /><stop offset="100%" stopColor={c.accent} /></linearGradient></defs>
        <ellipse cx="50" cy="22" rx="15" ry="16" fill={`url(#g-hvy-${selected})`} />
        <rect x="40" y="38" width="20" height="5" rx="2" fill={c.accent} />
        <path d="M26 43 C26 43 22 58 23 72 C22 85 24 96 27 104 L24 125 L23 160 L33 160 L38 125 L42 105 L50 105 L58 105 L62 125 L67 160 L77 160 L76 125 L73 104 C76 96 78 85 77 72 C78 58 74 43 74 43 Z" fill={`url(#g-hvy-${selected})`} />
        <path d="M28 48 L8 76 L15 80 L33 56" fill={`url(#g-hvy-${selected})`} /><path d="M72 48 L92 76 L85 80 L67 56" fill={`url(#g-hvy-${selected})`} />
        <rect x="22" y="158" width="12" height="6" rx="2" fill={c.accent} /><rect x="66" y="158" width="12" height="6" rx="2" fill={c.accent} />
      </svg>
    ),
  };
  return silhouettes[type] || null;
}

function BodyFatVisual({ percentage, sex }) {
  const ranges = sex === 'F'
    ? [
        { min: 10, max: 16, label: 'Atlética', color: '#00ddff', icon: Crown },
        { min: 16, max: 22, label: 'Fitness', color: '#00ff88', icon: Star },
        { min: 22, max: 28, label: 'Promedio', color: '#ffcc00', icon: Activity },
        { min: 28, max: 35, label: 'Alto', color: '#ff8844', icon: TrendingUp },
        { min: 35, max: 45, label: 'Muy alto', color: '#ff4444', icon: Shield },
      ]
    : [
        { min: 6, max: 12, label: 'Atlético', color: '#00ddff', icon: Crown },
        { min: 12, max: 18, label: 'Fitness', color: '#00ff88', icon: Star },
        { min: 18, max: 24, label: 'Promedio', color: '#ffcc00', icon: Activity },
        { min: 24, max: 30, label: 'Alto', color: '#ff8844', icon: TrendingUp },
        { min: 30, max: 40, label: 'Muy alto', color: '#ff4444', icon: Shield },
      ];
  const current = ranges.find(r => percentage >= r.min && percentage < r.max) || ranges[ranges.length - 1];
  return (
    <div className="animate-scale-in">
      <div className="flex items-end justify-center gap-2 mb-4">
        {ranges.map((r, i) => {
          const isActive = r === current;
          const Icon = r.icon;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              {isActive && <Icon className="w-4 h-4 animate-pop-in" style={{ color: r.color }} />}
              <div className={`w-10 rounded-lg transition-all duration-500 ${isActive ? 'ring-2 ring-white shadow-lg' : 'opacity-30'}`}
                style={{ backgroundColor: r.color, height: isActive ? '4.5rem' : '3rem' }} />
              <span className={`text-[10px] ${isActive ? 'text-white font-bold' : 'text-gray-600'}`}>{r.label}</span>
            </div>
          );
        })}
      </div>
      <div className="text-center">
        <span className="text-4xl font-bold" style={{ color: current.color }}>{percentage.toFixed(1)}%</span>
        <span className="text-gray-400 text-sm ml-2">grasa corporal</span>
      </div>
    </div>
  );
}

function MotivationalScreen({ config, onContinue }) {
  const { Icon } = config;
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center animate-pop-in"
          style={{ background: `${config.color}15`, border: `2px solid ${config.color}30` }}>
          <Icon className="w-10 h-10" style={{ color: config.color }} />
        </div>
        <h2 className="text-2xl font-bold mb-3 animate-slide-up-page" style={{ color: config.color }}>{config.title}</h2>
        <p className="text-gray-300 text-lg mb-4 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>{config.message}</p>
        {config.stat && (
          <div className="glass-card px-4 py-3 mb-8 animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
              <span>{config.stat}</span>
            </div>
          </div>
        )}
        <button onClick={onContinue}
          className="btn-primary w-full max-w-xs text-lg animate-fade-in inline-flex items-center justify-center gap-2"
          style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
          Continuar <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function SliderInput({ value, onChange, min, max, step = 1, unit, Icon }) {
  const progress = ((value - min) / (max - min)) * 100;
  return (
    <div className="animate-slide-up-page">
      <div className="flex items-center justify-center gap-4 mb-8">
        {Icon && (
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Icon className="w-7 h-7 text-primary" />
          </div>
        )}
        <div className="text-center">
          <span className="text-5xl font-bold gradient-text">{value}</span>
          <span className="text-gray-400 text-xl ml-2">{unit}</span>
        </div>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))} className="w-full mb-3"
        style={{ '--progress': `${progress}%` }} />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{min} {unit}</span><span>{max} {unit}</span>
      </div>
    </div>
  );
}

function OptionCard({ label, subtext, selected, onClick, Icon, delay = 0 }) {
  return (
    <button onClick={onClick}
      className={`w-full glass-card text-left p-4 transition-all duration-300 animate-slide-up-page ${
        selected ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(0,255,136,0.15)]' : 'hover:border-primary/30 hover:bg-dark-700'
      }`} style={{ animationDelay: `${delay}s`, animationFillMode: 'both' }}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selected ? 'bg-primary/20' : 'bg-dark-600'}`}>
            <Icon className={`w-5 h-5 ${selected ? 'text-primary' : 'text-gray-400'}`} />
          </div>
        )}
        <div className="flex-1">
          <div className="font-semibold text-[15px]">{label}</div>
          {subtext && <div className="text-sm text-gray-400 mt-0.5">{subtext}</div>}
        </div>
        {selected && (
          <div className="animate-pop-in">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-4 h-4 text-black" strokeWidth={3} />
            </div>
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Photo Upload Component ──────────────────────────────────────────────
function PhotoUploadStep({ answers, setAnswers, onContinue }) {
  const photoTypes = [
    { key: 'photo_front', label: 'Frente', desc: 'Foto de frente, brazos relajados' },
    { key: 'photo_side', label: 'Lateral', desc: 'Foto de perfil, postura natural' },
    { key: 'photo_back', label: 'Espalda', desc: 'Foto de espalda, brazos relajados' },
  ];

  const handleFileSelect = async (type, file) => {
    if (!file) return;
    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAnswers(prev => ({ ...prev, [type]: e.target.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="animate-slide-up-page">
      <div className="grid grid-cols-3 gap-3 mb-6">
        {photoTypes.map(({ key, label, desc }) => (
          <label key={key} className="cursor-pointer group">
            <div className={`aspect-[3/4] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${
              answers[key] ? 'border-primary bg-primary/5' : 'border-dark-400 hover:border-primary/50 bg-dark-700'
            }`}>
              {answers[key] ? (
                <img src={answers[key]} alt={label} className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera className="w-6 h-6 text-gray-500 mb-2 group-hover:text-primary transition-colors" />
                  <span className="text-xs text-gray-500 text-center px-2">{desc}</span>
                </>
              )}
            </div>
            <div className="text-center mt-2 text-sm font-medium text-gray-300">{label}</div>
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => handleFileSelect(key, e.target.files[0])} />
          </label>
        ))}
      </div>
      <p className="text-xs text-gray-500 text-center mb-6">
        Las fotos son opcionales y solo las ves tú. Sirven para comparar tu progreso con el tiempo.
      </p>
      <button onClick={onContinue}
        className="btn-primary w-full text-lg inline-flex items-center justify-center gap-2">
        {answers.photo_front || answers.photo_side || answers.photo_back ? 'Continuar' : 'Saltar este paso'}
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// ─── Text Optional Step (for health fields) ──────────────────────────────
// ─── Food Picker Step ──────────────────────────────────────────────────

const FOOD_CATEGORIES = ['Proteinas', 'Carbohidratos', 'Grasas'];
const FOOD_CAT_LABELS = { Proteinas: 'Proteínas', Carbohidratos: 'Carbohidratos', Grasas: 'Grasas' };
const FOOD_CAT_COLORS = {
  Proteinas: { active: 'bg-green-400 text-black', inactive: 'bg-dark-600 text-gray-300' },
  Carbohidratos: { active: 'bg-cyan-400 text-black', inactive: 'bg-dark-600 text-gray-300' },
  Grasas: { active: 'bg-yellow-400 text-black', inactive: 'bg-dark-600 text-gray-300' },
};
const MAX_PER_CATEGORY = 5;

function FoodPickerStep({ value, onChange, onContinue }) {
  const [foods, setFoods] = useState([]);
  const [activeTab, setActiveTab] = useState('Proteinas');
  const [loadingFoods, setLoadingFoods] = useState(true);
  const selected = value || {};

  useEffect(() => {
    apiFetch('/api/foods')
      .then(data => setFoods(data || []))
      .catch(() => setFoods([]))
      .finally(() => setLoadingFoods(false));
  }, []);

  const foodsByCategory = {};
  for (const cat of FOOD_CATEGORIES) {
    foodsByCategory[cat] = foods.filter(f => f.category === cat);
  }

  const toggleFood = (category, foodName) => {
    const current = selected[category] || [];
    let updated;
    if (current.includes(foodName)) {
      updated = current.filter(n => n !== foodName);
    } else {
      if (current.length >= MAX_PER_CATEGORY) return;
      updated = [...current, foodName];
    }
    onChange({ ...selected, [category]: updated });
  };

  const totalSelected = Object.values(selected).reduce((s, arr) => s + (arr?.length || 0), 0);

  return (
    <div className="animate-slide-up-page">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Star className="w-8 h-8 text-primary" />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4">
        {FOOD_CATEGORIES.map(cat => {
          const isActive = activeTab === cat;
          const count = (selected[cat] || []).length;
          const colors = FOOD_CAT_COLORS[cat];
          return (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${
                isActive ? colors.active : colors.inactive
              }`}
            >
              {FOOD_CAT_LABELS[cat]} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Food chips */}
      {loadingFoods ? (
        <div className="text-gray-400 text-center py-8">Cargando alimentos...</div>
      ) : (
        <div className="max-h-64 overflow-y-auto pr-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            {(foodsByCategory[activeTab] || []).map(food => {
              const isSelected = (selected[activeTab] || []).includes(food.name);
              const atMax = !isSelected && (selected[activeTab] || []).length >= MAX_PER_CATEGORY;
              return (
                <button
                  key={food.id}
                  onClick={() => toggleFood(activeTab, food.name)}
                  disabled={atMax}
                  className={`px-3 py-2 rounded-xl text-sm transition-all ${
                    isSelected
                      ? 'bg-primary/15 border border-primary/40 text-primary font-medium'
                      : atMax
                        ? 'bg-dark-700 border border-dark-600 text-gray-600 cursor-not-allowed'
                        : 'bg-dark-700 border border-dark-500 text-gray-300 hover:border-gray-400'
                  }`}
                >
                  {isSelected && <span className="mr-1">✓</span>}
                  {food.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Counter */}
      <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
        <span>{(selected[activeTab] || []).length}/{MAX_PER_CATEGORY} en {FOOD_CAT_LABELS[activeTab]}</span>
        <span>{totalSelected} alimentos seleccionados</span>
      </div>

      {/* Continue button */}
      <button
        onClick={onContinue}
        className="w-full mt-4 py-4 bg-primary text-dark-900 font-bold rounded-2xl text-lg hover:bg-primary-dark transition-colors"
      >
        {totalSelected > 0 ? 'Continuar' : 'Omitir'} →
      </button>
    </div>
  );
}

function TextOptionalStep({ step, value, onChange, onContinue }) {
  const StepIcon = step.Icon;
  return (
    <div className="animate-slide-up-page">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <StepIcon className="w-8 h-8 text-primary" />
        </div>
      </div>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={step.placeholder}
        className="w-full bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-primary focus:outline-none resize-none h-28 mb-3"
      />
      {step.helpText && (
        <p className="text-xs text-gray-500 mb-6">{step.helpText}</p>
      )}
      <button onClick={onContinue}
        className="btn-primary w-full text-lg inline-flex items-center justify-center gap-2">
        {value ? 'Continuar' : 'Saltar'} <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}

// ─── Section Intro Screen ────────────────────────────────────────────────
function SectionIntro({ section, sectionIndex, totalSections, onStart }) {
  const IconComp = SECTION_ICONS[section.icon] || Settings;
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-xs text-gray-500 uppercase tracking-widest mb-6 animate-fade-in">
          Sección {sectionIndex + 1} de {totalSections}
        </div>
        <div className="w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center animate-pop-in bg-primary/10 border-2 border-primary/20">
          <IconComp className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-3 animate-slide-up-page text-white">{section.title}</h2>
        <p className="text-gray-400 text-lg mb-8 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          {section.description}
        </p>
        {!section.required && (
          <p className="text-xs text-gray-500 mb-4 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
            Esta sección es opcional
          </p>
        )}
        <button onClick={onStart}
          className="btn-primary w-full max-w-xs text-lg animate-fade-in inline-flex items-center justify-center gap-2"
          style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
          Comenzar <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// ─── Progress Bar ────────────────────────────────────────────────────────
function ProgressBar({ current, total, sections, currentSectionIndex }) {
  const progress = (current / total) * 100;
  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div className="w-full h-1.5 bg-dark-500 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #00ff88, #00ddff)' }} />
      </div>
      <div className="flex justify-between mt-2">
        {sections.map((s, i) => {
          const IconComp = SECTION_ICONS[s.icon] || Settings;
          const active = i <= currentSectionIndex;
          return (
            <div key={s.key} className="flex flex-col items-center">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${active ? 'bg-primary/20' : 'bg-dark-600'}`}>
                <IconComp className={`w-3 h-3 ${active ? 'text-primary' : 'text-gray-600'}`} />
              </div>
              <span className={`text-[10px] mt-1 max-w-[50px] text-center leading-tight ${active ? 'text-primary font-medium' : 'text-gray-600'}`}>
                {s.title.split(' ')[0]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN ONBOARDING PAGE
// ═══════════════════════════════════════════════════════════════════════

export default function OnboardingPage() {
  const [sections, setSections] = useState(null); // from API
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentStepInSection, setCurrentStepInSection] = useState(-1); // -1 = section intro
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showMotivational, setShowMotivational] = useState(null);
  const [animKey, setAnimKey] = useState(0);
  const [showCoach, setShowCoach] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const router = useRouter();

  const FALLBACK_SECTIONS = [
    { key: 'personal_info', title: 'Información Personal', description: 'Datos básicos', icon: 'User', required: true },
    { key: 'measurements', title: 'Medidas Corporales', description: 'Medidas para cálculos', icon: 'Ruler', required: true },
    { key: 'photos', title: 'Fotos de Progreso', description: 'Registro visual', icon: 'Camera', required: false },
    { key: 'health', title: 'Salud', description: 'Info médica', icon: 'Heart', required: false },
    { key: 'habits', title: 'Hábitos', description: 'Estilo de vida', icon: 'Coffee', required: false },
    { key: 'preferences', title: 'Preferencias', description: 'Actividad y dieta', icon: 'Settings', required: true },
  ];

  // Derived state (safe to compute even when sections is null)
  const safeSections = sections || FALLBACK_SECTIONS;
  const currentSection = safeSections[currentSectionIndex] || null;
  const sectionSteps = currentSection ? (SECTION_STEPS[currentSection.key] || []) : [];
  const activeStepsInSection = sectionSteps.filter(s => !s.condition || s.condition(answers));
  const totalSteps = safeSections.reduce((sum, sec) => {
    const steps = SECTION_STEPS[sec.key] || [];
    return sum + steps.filter(s => !s.condition || s.condition(answers)).length;
  }, 0);
  const completedSteps = safeSections.slice(0, currentSectionIndex).reduce((sum, sec) => {
    const steps = SECTION_STEPS[sec.key] || [];
    return sum + steps.filter(s => !s.condition || s.condition(answers)).length;
  }, 0) + Math.max(0, currentStepInSection);
  const step = currentStepInSection >= 0 ? activeStepsInSection[currentStepInSection] : null;
  const isFinished = currentSectionIndex >= safeSections.length;

  // Load sections config from API
  useEffect(() => {
    apiFetch('/api/onboarding/sections')
      .then(data => {
        setSections(data && data.length > 0 ? data : FALLBACK_SECTIONS);
        setLoadingConfig(false);
      })
      .catch(() => {
        setSections(FALLBACK_SECTIONS);
        setLoadingConfig(false);
      });
  }, []);

  // Show coach bubble
  useEffect(() => {
    setShowCoach(false);
    if (step && COACH_MESSAGES[step.key]) {
      const timer = setTimeout(() => setShowCoach(true), 800);
      return () => clearTimeout(timer);
    }
  }, [currentStepInSection, currentSectionIndex, animKey]);

  useEffect(() => {
    if (showCoach) {
      const timer = setTimeout(() => setShowCoach(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [showCoach]);

  // Init slider defaults
  useEffect(() => {
    if (step?.type === 'slider' && answers[step.key] === undefined) {
      setAnswers(prev => ({ ...prev, [step.key]: step.config.default }));
    }
  }, [currentStepInSection, currentSectionIndex]);

  // Calculate metabolic results when all sections are done
  useEffect(() => {
    if (isFinished && !results) {
      const patientData = {
        weight: Number(answers.weight_kg) || 70, height: Number(answers.height_cm) || 170,
        age: Number(answers.age) || 30, sex: answers.sex || 'M',
        activityLevel: Number(answers.activity_level) || 3,
        neck: Number(answers.neck_cm) || 38, waist: Number(answers.waist_cm) || 80,
        hip: Number(answers.hip_cm) || 90,
      };
      setResults(calculateMetabolicData(patientData));
    }
  }, [isFinished]);

  const advanceStep = useCallback(() => {
    setAnimKey(k => k + 1);
    setShowCoach(false);

    if (currentStepInSection + 1 < activeStepsInSection.length) {
      setCurrentStepInSection(prev => prev + 1);
    } else {
      // Move to next section
      if (currentSectionIndex + 1 < safeSections.length) {
        setCurrentSectionIndex(prev => prev + 1);
        setCurrentStepInSection(-1); // show section intro
      } else {
        setCurrentSectionIndex(safeSections.length); // mark finished
      }
    }
  }, [currentStepInSection, activeStepsInSection.length, currentSectionIndex, safeSections.length]);

  const goNext = useCallback((selectedValue) => {
    if (step?.motivational) {
      let config;
      const currentValue = selectedValue !== undefined ? selectedValue : answers[step.key];
      if (step.motivational === 'after_goal') {
        config = MOTIVATIONAL_SCREENS.after_goal[currentValue];
      } else if (step.motivational === 'after_target') {
        const targetW = step.key === 'target_weight_kg' ? Number(currentValue) : Number(answers.target_weight_kg);
        const currentW = Number(answers.weight_kg);
        const delta = targetW - currentW;
        const verb = delta > 0 ? 'ganar' : 'perder';
        const kg = Math.abs(delta).toFixed(1);
        config = {
          ...MOTIVATIONAL_SCREENS.after_target,
          message: delta === 0
            ? '¡Perfecto! Vamos a mantener tu peso mientras mejoramos tu composición corporal.'
            : `${kg} kg por ${verb}. ¡Es un objetivo totalmente alcanzable! Te acompañaremos en cada paso.`,
          stat: delta !== 0
            ? `A un ritmo saludable de ${delta > 0 ? '0.3kg' : '0.5kg'} por semana, lo lograrás en aproximadamente ${Math.ceil(Math.abs(delta) / (delta > 0 ? 0.3 : 0.5))} semanas`
            : null,
        };
      } else if (step.motivational === 'after_measurements') {
        config = MOTIVATIONAL_SCREENS.after_measurements;
      }
      if (config) { setShowMotivational(config); return; }
    }
    advanceStep();
  }, [step, answers, advanceStep]);

  const handleSelect = (value) => {
    setAnswers(prev => ({ ...prev, [step.key]: value }));
    setTimeout(() => goNext(value), 300);
  };

  const goBack = () => {
    setAnimKey(k => k + 1);
    setShowCoach(false);

    if (currentStepInSection > 0) {
      setCurrentStepInSection(prev => prev - 1);
    } else if (currentStepInSection === 0) {
      setCurrentStepInSection(-1); // back to section intro
    } else if (currentSectionIndex > 0) {
      // Go to last step of previous section
      const prevSection = safeSections[currentSectionIndex - 1];
      const prevSteps = (SECTION_STEPS[prevSection.key] || []).filter(s => !s.condition || s.condition(answers));
      setCurrentSectionIndex(prev => prev - 1);
      setCurrentStepInSection(prevSteps.length - 1);
    }
  };

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Only send fields that the DB knows about
      // Core profile fields (always exist)
      const coreFields = [
        'bodyType', 'goal', 'sex', 'age', 'height_cm', 'weight_kg',
        'target_weight_kg', 'neck_cm', 'waist_cm', 'hip_cm',
        'activity_level', 'meals_per_day', 'diet_type',
      ];
      // New fields (require migration_002)
      const newFields = [
        'medical_conditions', 'injuries', 'medications', 'allergies',
        'sleep_hours', 'water_liters', 'stress_level', 'alcohol_frequency', 'smoking',
        'photo_front', 'photo_side', 'photo_back',
        'preferred_foods',
      ];

      const profileData = { onboarding_completed: true };
      for (const key of coreFields) {
        if (answers[key] !== undefined) profileData[key] = answers[key];
      }

      await apiFetch('/api/users/me', { method: 'PUT', body: profileData });

      // Try saving new fields separately (won't fail if columns don't exist yet)
      const newData = {};
      let hasNew = false;
      for (const key of newFields) {
        if (answers[key] !== undefined && answers[key] !== '' && answers[key] !== null) {
          newData[key] = answers[key];
          hasNew = true;
        }
      }
      if (hasNew) {
        await apiFetch('/api/users/me', { method: 'PUT', body: newData }).catch(() => {
          // Silently ignore if columns don't exist yet
        });
      }
      await apiFetch('/api/metabolic/calculate', {
        method: 'POST',
        body: {
          weight: answers.weight_kg, height: answers.height_cm, age: answers.age,
          sex: answers.sex, activityLevel: answers.activity_level,
          neck: answers.neck_cm, waist: answers.waist_cm, hip: answers.hip_cm,
        },
      });
      await apiFetch('/api/nutrition/plan', {
        method: 'POST',
        body: {
          tdee: results.averageTDEE, goal: answers.goal, weight: answers.weight_kg,
          target_weight: answers.target_weight_kg, meals_per_day: answers.meals_per_day,
        },
      });
      router.push('/dashboard');
      router.refresh();
    } catch (e) {
      alert('Error guardando datos: ' + e.message);
    }
    setSaving(false);
  };

  // ── Loading Screen ──
  if (loadingConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Preparando tu experiencia...</p>
        </div>
      </div>
    );
  }

  // ── Motivational Screen ──
  if (showMotivational) {
    return <MotivationalScreen config={showMotivational} onContinue={() => {
      setShowMotivational(null);
      setAnimKey(k => k + 1);
      advanceStep();
    }} />;
  }

  // ── Section Intro Screen ──
  if (!isFinished && currentStepInSection === -1 && currentSection) {
    return (
      <SectionIntro
        section={currentSection}
        sectionIndex={currentSectionIndex}
        totalSections={safeSections.length}
        onStart={() => {
          setAnimKey(k => k + 1);
          setCurrentStepInSection(0);
        }}
      />
    );
  }

  // ── Results Screen ──
  if (isFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4 animate-pop-in">
              <Trophy className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold animate-slide-up-page">
              Análisis <span className="gradient-text">Completado</span>
            </h2>
            <p className="text-gray-400 mt-2 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              Tu perfil metabólico personalizado
            </p>
          </div>

          {results && (
            <div className="space-y-4 mb-8">
              <div className="glass-card p-6 text-center animate-scale-in">
                <div className="text-sm text-gray-400 mb-1">Gasto Diario Total (TDEE)</div>
                <div className="text-5xl font-bold gradient-text">{Math.round(results.averageTDEE)}</div>
                <div className="text-sm text-gray-400 mt-1">calorías / día</div>
              </div>
              <div className="glass-card p-6 animate-scale-in" style={{ animationDelay: '0.15s', animationFillMode: 'both' }}>
                <BodyFatVisual percentage={results.averageBodyFatPercentage} sex={answers.sex} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'M. Muscular', value: `${results.muscleMassKg.toFixed(1)}kg`, color: '#00ddff', Icon: Dumbbell },
                  { label: 'M. Grasa', value: `${(Number(answers.weight_kg) * results.averageBodyFatPercentage / 100).toFixed(1)}kg`, color: '#ff8844', Icon: Scale },
                  { label: 'BMI', value: results.bmi.toFixed(1), color: results.bmi < 25 ? '#00ff88' : '#ffcc00', Icon: ChartBar },
                ].map((stat, i) => (
                  <div key={stat.label} className="glass-card p-4 text-center animate-count-up"
                    style={{ animationDelay: `${0.3 + i * 0.1}s`, animationFillMode: 'both' }}>
                    <stat.Icon className="w-4 h-4 mx-auto mb-1" style={{ color: stat.color }} />
                    <div className="text-xs text-gray-400">{stat.label}</div>
                    <div className="text-xl font-bold mt-1" style={{ color: stat.color }}>{stat.value}</div>
                  </div>
                ))}
              </div>
              <div className="glass-card p-4 animate-fade-in" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400">Metabolismo Basal</div>
                    <div className="text-lg font-bold text-white">{Math.round(results.averageRMR)} kcal</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400">Masa Ósea</div>
                    <div className="text-lg font-bold text-white">{results.boneMassKg.toFixed(1)} kg</div>
                  </div>
                </div>
              </div>
              <div className="glass-card p-3 animate-fade-in flex items-center gap-2 text-sm text-gray-300"
                style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
                <Brain className="w-4 h-4 text-primary flex-shrink-0" />
                <span>Calculado con 7 fórmulas clínicas: Navy, Duerenberg, Mifflin-St Jeor, Cunningham y más</span>
              </div>
            </div>
          )}

          <button onClick={handleFinish} disabled={saving}
            className="btn-primary w-full text-lg disabled:opacity-50 animate-pulse-glow inline-flex items-center justify-center gap-2">
            {saving ? 'Generando tu plan...' : <>Generar Mi Plan <ArrowRight className="w-5 h-5" /></>}
          </button>
        </div>
      </div>
    );
  }

  if (!step) return null;

  // ── Wizard Step ──
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 pb-24">
      <ProgressBar current={completedSteps + 1} total={totalSteps} sections={safeSections} currentSectionIndex={currentSectionIndex} />

      {(currentStepInSection > 0 || currentSectionIndex > 0) && (
        <button onClick={goBack}
          className="text-gray-400 hover:text-white mb-4 self-start ml-4 flex items-center gap-1 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Atrás
        </button>
      )}

      <div key={animKey} className="w-full max-w-md animate-slide-up-page">
        <h2 className="text-xl font-bold text-center mb-1">{step.title}</h2>
        {step.subtitle && <p className="text-gray-400 text-center text-sm mb-6">{step.subtitle}</p>}

        {step.type === 'body_type' && (
          <div>
            <div className="flex justify-center gap-8 mb-6">
              {step.options.map(opt => (
                <button key={opt.value} onClick={() => handleSelect(opt.value)} className="flex flex-col items-center group">
                  <BodySilhouette type={opt.value} selected={answers[step.key] === opt.value} sex={answers.sex} />
                  <span className={`text-xs mt-2 font-medium transition-colors ${
                    answers[step.key] === opt.value ? 'text-primary' : 'text-gray-500 group-hover:text-gray-300'}`}>
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {step.options.map((opt, i) => (
                <OptionCard key={opt.value} label={opt.label} subtext={opt.subtext}
                  Icon={opt.Icon} selected={answers[step.key] === opt.value}
                  onClick={() => handleSelect(opt.value)} delay={i * 0.05} />
              ))}
            </div>
          </div>
        )}

        {step.type === 'options' && (
          <div className="space-y-2">
            {step.options.map((opt, i) => (
              <OptionCard key={String(opt.value)} label={opt.label} subtext={opt.subtext}
                Icon={opt.Icon} selected={answers[step.key] === opt.value}
                onClick={() => handleSelect(opt.value)} delay={i * 0.05} />
            ))}
          </div>
        )}

        {step.type === 'slider' && (
          <div className="mt-4">
            <SliderInput value={answers[step.key] ?? step.config.default}
              onChange={(v) => setAnswers(prev => ({ ...prev, [step.key]: v }))}
              min={step.config.min} max={step.config.max}
              step={step.config.step} unit={step.config.unit}
              Icon={step.SliderIcon} />
            <button onClick={() => goNext()} className="btn-primary w-full mt-8 text-lg inline-flex items-center justify-center gap-2">
              Continuar <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {step.type === 'photos' && (
          <PhotoUploadStep answers={answers} setAnswers={setAnswers} onContinue={advanceStep} />
        )}

        {step.type === 'text_optional' && (
          <TextOptionalStep step={step} value={answers[step.key]}
            onChange={(v) => setAnswers(prev => ({ ...prev, [step.key]: v }))}
            onContinue={advanceStep} />
        )}

        {step.type === 'food_picker' && (
          <FoodPickerStep
            value={answers[step.key] || {}}
            onChange={(v) => setAnswers(prev => ({ ...prev, [step.key]: v }))}
            onContinue={advanceStep}
          />
        )}
      </div>

      <CoachBubble message={step ? COACH_MESSAGES[step.key] : null} visible={showCoach} />
    </div>
  );
}
