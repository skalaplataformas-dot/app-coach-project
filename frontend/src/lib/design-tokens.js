/**
 * Design Tokens — Single source of truth for all visual styling.
 *
 * To change the app's visual identity, modify ONLY this file.
 * All components reference these tokens instead of hardcoding colors.
 *
 * Colors reference the Tailwind config in tailwind.config.js:
 *   primary: #00ff88, primary-dark: #00cc6a
 *   dark-900: #0a0a0a, dark-800: #111111, etc.
 */

// ─── Brand ────────────────────────────────────────────────────────────────

export const BRAND = {
  name: 'FitBro',
  tagline: 'Tu coach de fitness inteligente',
  description: 'Cálculos metabólicos avanzados, planes nutricionales personalizados y entrenamientos adaptados a tus objetivos',
};

// ─── Color classes (Tailwind) ─────────────────────────────────────────────

export const COLORS = {
  // Primary accent
  primary: 'text-primary',           // #00ff88
  primaryBg: 'bg-primary',
  primaryBorder: 'border-primary',
  primaryGlow: 'shadow-[0_0_20px_rgba(0,255,136,0.3)]',

  // Macro colors (for nutrition charts, badges, bars)
  protein: {
    text: 'text-green-400',
    bg: 'bg-green-400',
    bgSoft: 'bg-green-400/10',
    border: 'border-green-400/30',
    hex: '#4ade80',
    label: 'Proteína',
  },
  carbs: {
    text: 'text-blue-400',
    bg: 'bg-blue-400',
    bgSoft: 'bg-blue-400/10',
    border: 'border-blue-400/30',
    hex: '#60a5fa',
    label: 'Carbohidratos',
  },
  fat: {
    text: 'text-yellow-400',
    bg: 'bg-yellow-400',
    bgSoft: 'bg-yellow-400/10',
    border: 'border-yellow-400/30',
    hex: '#facc15',
    label: 'Grasas',
  },

  // Food category colors
  foodCategory: {
    Proteinas:      { text: 'text-green-400',  bg: 'bg-green-400/10',  border: 'border-green-400/30',  dot: 'bg-green-400' },
    Carbohidratos:  { text: 'text-cyan-400',   bg: 'bg-cyan-400/10',   border: 'border-cyan-400/30',   dot: 'bg-cyan-400' },
    Grasas:         { text: 'text-yellow-400',  bg: 'bg-yellow-400/10',  border: 'border-yellow-400/30',  dot: 'bg-yellow-400' },
    Frutas:         { text: 'text-emerald-300', bg: 'bg-emerald-300/10', border: 'border-emerald-300/30', dot: 'bg-emerald-300' },
    Empacados:      { text: 'text-purple-400',  bg: 'bg-purple-400/10',  border: 'border-purple-400/30',  dot: 'bg-purple-400' },
  },

  // Goal badges
  goal: {
    lose_weight:  { text: 'text-orange-400', bg: 'bg-orange-400/10', label: 'Perder Grasa' },
    gain_muscle:  { text: 'text-primary',    bg: 'bg-primary/10',    label: 'Ganar Músculo' },
    get_shredded: { text: 'text-red-400',    bg: 'bg-red-400/10',    label: 'Definición Extrema' },
  },

  // Difficulty badges (workouts)
  difficulty: {
    Principiante: { text: 'text-green-400',  bg: 'bg-green-400/10' },
    Intermedio:   { text: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    Avanzado:     { text: 'text-red-400',    bg: 'bg-red-400/10' },
  },

  // Status
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400',
};

// ─── Typography ───────────────────────────────────────────────────────────

export const TYPOGRAPHY = {
  heading1: 'text-3xl sm:text-4xl font-bold',
  heading2: 'text-2xl font-bold',
  heading3: 'text-xl font-bold',
  heading4: 'text-lg font-semibold',
  body: 'text-base text-gray-300',
  small: 'text-sm text-gray-400',
  tiny: 'text-xs text-gray-500',
  label: 'text-xs uppercase tracking-wider text-gray-500',
};

// ─── Card Styles ──────────────────────────────────────────────────────────

export const CARD = {
  base: 'bg-dark-800 border border-dark-500 rounded-2xl p-6',
  interactive: 'bg-dark-800 border border-dark-500 rounded-2xl p-6 hover:border-primary/30 transition-colors',
  compact: 'bg-dark-800 border border-dark-500 rounded-xl p-4',
};

// ─── Button Styles ────────────────────────────────────────────────────────

export const BUTTON = {
  primary: 'bg-primary text-dark-900 font-bold rounded-xl hover:bg-primary-dark transition-colors',
  secondary: 'border border-dark-500 text-gray-300 font-semibold rounded-xl hover:border-primary/50 hover:text-white transition-colors',
  ghost: 'text-gray-400 hover:text-white transition-colors',
};

// ─── Macro Bar Colors (for stacked bars) ──────────────────────────────────

export const MACRO_BAR_COLORS = {
  protein: 'bg-green-500',
  carbs: 'bg-blue-500',
  fat: 'bg-yellow-500',
};
