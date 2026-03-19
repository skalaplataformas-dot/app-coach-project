/**
 * Mapping: Spanish exercise names → ExerciseDB IDs + muscle groups
 * GIF URL format: https://static.exercisedb.dev/media/{exercisedbId}.gif
 */

export const EXERCISE_MAP = {
  // === FULL BODY ===
  'Sentadillas con peso corporal': { exercisedbId: 'xdYPUtE', muscleGroup: 'legs' },
  'Flexiones de pecho (rodillas)': { exercisedbId: 'ZOuKWir', muscleGroup: 'chest' },
  'Peso muerto con mancuernas': { exercisedbId: 'nUwVh7b', muscleGroup: 'legs' },
  'Remo con mancuerna': { exercisedbId: 'C0MA9bC', muscleGroup: 'back' },
  'Plancha': { exercisedbId: 'VBAWRPG', muscleGroup: 'core' },

  // === PECHO Y TRICEPS ===
  'Press de banca con barra': { exercisedbId: 'JsKq9so', muscleGroup: 'chest' },
  'Press inclinado con mancuernas': { exercisedbId: '8eqjhOl', muscleGroup: 'chest' },
  'Aperturas con mancuernas': { exercisedbId: 'w4dLzSx', muscleGroup: 'chest' },
  'Fondos en paralelas': { exercisedbId: 'LkoAWAE', muscleGroup: 'chest' },
  'Extensión de tríceps con cuerda': { exercisedbId: 'gAwDzB3', muscleGroup: 'arms' },

  // === ESPALDA Y BICEPS ===
  'Dominadas (o asistidas)': { exercisedbId: 'lBDjFxJ', muscleGroup: 'back' },
  'Dominadas': { exercisedbId: 'lBDjFxJ', muscleGroup: 'back' },
  'Remo con barra': { exercisedbId: 'eZyBC3j', muscleGroup: 'back' },
  'Jalón al pecho': { exercisedbId: 'ecpY0rH', muscleGroup: 'back' },
  'Remo en polea baja': { exercisedbId: 'fUBheHs', muscleGroup: 'back' },
  'Curl de bíceps con barra': { exercisedbId: 'q6y3OhV', muscleGroup: 'arms' },
  'Curl martillo': { exercisedbId: 'slDvUAU', muscleGroup: 'arms' },

  // === PIERNAS ===
  'Sentadilla con barra': { exercisedbId: 'oR7O9LW', muscleGroup: 'legs' },
  'Prensa de piernas': { exercisedbId: 'V07qpXy', muscleGroup: 'legs' },
  'Peso muerto rumano': { exercisedbId: 'wQ2c4XD', muscleGroup: 'legs' },
  'Extensión de cuádriceps': { exercisedbId: 'Y1MsI1l', muscleGroup: 'legs' },
  'Curl femoral': { exercisedbId: '17lJ1kr', muscleGroup: 'legs' },
  'Elevación de pantorrillas': { exercisedbId: '8ozhUIZ', muscleGroup: 'legs' },

  // === HOMBROS ===
  'Press militar con barra': { exercisedbId: 'CggQhII', muscleGroup: 'shoulders' },
  'Press militar sentado': { exercisedbId: 'CggQhII', muscleGroup: 'shoulders' },
  'Elevaciones laterales': { exercisedbId: 'DsgkuIt', muscleGroup: 'shoulders' },
  'Elevaciones frontales': { exercisedbId: '3eGE2JC', muscleGroup: 'shoulders' },
  'Pájaros (rear delt fly)': { exercisedbId: 'XUUD0Fs', muscleGroup: 'shoulders' },
  'Encogimiento de hombros': { exercisedbId: 'trmte8s', muscleGroup: 'shoulders' },

  // === HIIT ===
  'Burpees': { exercisedbId: 'dK9394r', muscleGroup: 'cardio' },
  'Mountain Climbers': { exercisedbId: 'RJgzwny', muscleGroup: 'cardio' },
  'Jump Squats': { exercisedbId: 'LIlE5Tn', muscleGroup: 'cardio' },
  'High Knees': { exercisedbId: 'ealLwvX', muscleGroup: 'cardio' },
  'Plancha con toques de hombro': { exercisedbId: 'h1ezqSu', muscleGroup: 'core' },

  // === CARDIO ===
  'Caminata rápida / Trote': { exercisedbId: 'Qoujh3Q', muscleGroup: 'cardio' },
  'Jumping Jacks': { exercisedbId: 'HtfCpfi', muscleGroup: 'cardio' },
  'Skipping': { exercisedbId: 'Qoujh3Q', muscleGroup: 'cardio' },
  'Step-ups': { exercisedbId: 'gFyFj9z', muscleGroup: 'legs' },
  'Cooldown - Caminata': { exercisedbId: null, muscleGroup: 'cardio' },

  // === CORE ===
  'Crunch abdominal': { exercisedbId: 's8nrDXF', muscleGroup: 'core' },
  'Plancha frontal': { exercisedbId: 'VBAWRPG', muscleGroup: 'core' },
  'Plancha lateral': { exercisedbId: 'VO2qeJg', muscleGroup: 'core' },
  'Bicicleta (bicycle crunch)': { exercisedbId: 'tZkGYZ9', muscleGroup: 'core' },
  'Elevación de piernas': { exercisedbId: 'I3tsCnC', muscleGroup: 'core' },

  // === PPL PUSH ===
  'Press de banca plano': { exercisedbId: 'JsKq9so', muscleGroup: 'chest' },
  'Press inclinado mancuernas': { exercisedbId: '8eqjhOl', muscleGroup: 'chest' },
  'Press francés': { exercisedbId: 'h8LFzo9', muscleGroup: 'arms' },

  // === PPL PULL ===
  'Peso muerto convencional': { exercisedbId: 'hrVQWvE', muscleGroup: 'back' },
  'Face pulls': { exercisedbId: 'wqNPGCg', muscleGroup: 'shoulders' },
  'Curl con barra Z': { exercisedbId: '6TG6x2w', muscleGroup: 'arms' },

  // === FLEXIBILITY ===
  'Estiramiento de cuádriceps': { exercisedbId: 'qBcKorM', muscleGroup: 'flexibility' },
  'Estiramiento de isquiotibiales': { exercisedbId: '99rWm7w', muscleGroup: 'flexibility' },
  'Apertura de cadera (pigeon pose)': { exercisedbId: null, muscleGroup: 'flexibility' },
  'Estiramiento de pectorales en pared': { exercisedbId: null, muscleGroup: 'flexibility' },
  'Cat-Cow (gato-vaca)': { exercisedbId: 'GSDioYu', muscleGroup: 'flexibility' },
  'Rotación torácica': { exercisedbId: null, muscleGroup: 'flexibility' },

  // === HIIT TABATA ===
  'Thrusters con mancuernas': { exercisedbId: 'f7Y9eDZ', muscleGroup: 'shoulders' },
  'Box jumps': { exercisedbId: 'iPm26QU', muscleGroup: 'cardio' },
  'Battle ropes': { exercisedbId: 'yaAxcQr', muscleGroup: 'cardio' },
};

export const EXERCISEDB_GIF_BASE = 'https://static.exercisedb.dev/media';

export function getExerciseMedia(exerciseName) {
  const mapping = EXERCISE_MAP[exerciseName];
  if (!mapping) return { gifUrl: null, muscleGroup: null };

  return {
    gifUrl: mapping.exercisedbId ? `${EXERCISEDB_GIF_BASE}/${mapping.exercisedbId}.gif` : null,
    muscleGroup: mapping.muscleGroup,
    exercisedbId: mapping.exercisedbId,
  };
}

export const MUSCLE_GROUP_LABELS = {
  chest: 'Pecho',
  back: 'Espalda',
  legs: 'Piernas',
  shoulders: 'Hombros',
  arms: 'Brazos',
  core: 'Core',
  cardio: 'Cardio',
  flexibility: 'Flexibilidad',
};

export const MUSCLE_GROUP_COLORS = {
  chest: { text: 'text-green-400', bg: 'bg-green-400/10', dot: 'bg-green-400' },
  back: { text: 'text-blue-400', bg: 'bg-blue-400/10', dot: 'bg-blue-400' },
  legs: { text: 'text-cyan-400', bg: 'bg-cyan-400/10', dot: 'bg-cyan-400' },
  shoulders: { text: 'text-orange-400', bg: 'bg-orange-400/10', dot: 'bg-orange-400' },
  arms: { text: 'text-purple-400', bg: 'bg-purple-400/10', dot: 'bg-purple-400' },
  core: { text: 'text-yellow-400', bg: 'bg-yellow-400/10', dot: 'bg-yellow-400' },
  cardio: { text: 'text-red-400', bg: 'bg-red-400/10', dot: 'bg-red-400' },
  flexibility: { text: 'text-emerald-400', bg: 'bg-emerald-400/10', dot: 'bg-emerald-400' },
};
