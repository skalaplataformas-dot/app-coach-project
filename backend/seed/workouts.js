/**
 * Seed workouts and exercises.
 * Run: node seed/workouts.js
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const workouts = [
  {
    title: 'Full Body Principiante',
    description: 'Entrenamiento completo para quienes empiezan. Trabaja todos los grupos musculares principales.',
    difficulty: 'beginner',
    duration_minutes: 40,
    category: 'strength',
    exercises: [
      { name: 'Sentadillas con peso corporal', sets: 3, reps: '15', rest_seconds: 60, sort_order: 1, notes: 'Bajar hasta que los muslos estén paralelos al suelo' },
      { name: 'Flexiones de pecho (rodillas)', sets: 3, reps: '10', rest_seconds: 60, sort_order: 2, notes: 'Mantener el core activado' },
      { name: 'Peso muerto con mancuernas', sets: 3, reps: '12', rest_seconds: 60, sort_order: 3 },
      { name: 'Remo con mancuerna', sets: 3, reps: '12', rest_seconds: 60, sort_order: 4 },
      { name: 'Plancha', sets: 3, reps: '30s', rest_seconds: 45, sort_order: 5 },
    ],
  },
  {
    title: 'Pecho y Tríceps',
    description: 'Enfoque en pectorales y tríceps con ejercicios compuestos y de aislamiento.',
    difficulty: 'intermediate',
    duration_minutes: 50,
    category: 'strength',
    exercises: [
      { name: 'Press de banca con barra', sets: 4, reps: '10', rest_seconds: 90, sort_order: 1 },
      { name: 'Press inclinado con mancuernas', sets: 3, reps: '12', rest_seconds: 75, sort_order: 2 },
      { name: 'Aperturas con mancuernas', sets: 3, reps: '12', rest_seconds: 60, sort_order: 3 },
      { name: 'Fondos en paralelas', sets: 3, reps: '10', rest_seconds: 75, sort_order: 4 },
      { name: 'Extensión de tríceps con cuerda', sets: 3, reps: '15', rest_seconds: 60, sort_order: 5 },
    ],
  },
  {
    title: 'Espalda y Bíceps',
    description: 'Trabaja dorsales, romboides y bíceps para una espalda fuerte.',
    difficulty: 'intermediate',
    duration_minutes: 50,
    category: 'strength',
    exercises: [
      { name: 'Dominadas (o asistidas)', sets: 4, reps: '8', rest_seconds: 90, sort_order: 1 },
      { name: 'Remo con barra', sets: 4, reps: '10', rest_seconds: 75, sort_order: 2 },
      { name: 'Jalón al pecho', sets: 3, reps: '12', rest_seconds: 60, sort_order: 3 },
      { name: 'Remo en polea baja', sets: 3, reps: '12', rest_seconds: 60, sort_order: 4 },
      { name: 'Curl de bíceps con barra', sets: 3, reps: '12', rest_seconds: 60, sort_order: 5 },
      { name: 'Curl martillo', sets: 3, reps: '12', rest_seconds: 60, sort_order: 6 },
    ],
  },
  {
    title: 'Piernas Completo',
    description: 'Cuádriceps, isquiotibiales, glúteos y pantorrillas.',
    difficulty: 'intermediate',
    duration_minutes: 55,
    category: 'strength',
    exercises: [
      { name: 'Sentadilla con barra', sets: 4, reps: '10', rest_seconds: 120, sort_order: 1, notes: 'Profundidad completa, rodillas en línea con los pies' },
      { name: 'Prensa de piernas', sets: 4, reps: '12', rest_seconds: 90, sort_order: 2 },
      { name: 'Peso muerto rumano', sets: 3, reps: '10', rest_seconds: 90, sort_order: 3 },
      { name: 'Extensión de cuádriceps', sets: 3, reps: '15', rest_seconds: 60, sort_order: 4 },
      { name: 'Curl femoral', sets: 3, reps: '12', rest_seconds: 60, sort_order: 5 },
      { name: 'Elevación de pantorrillas', sets: 4, reps: '15', rest_seconds: 45, sort_order: 6 },
    ],
  },
  {
    title: 'Hombros y Trapecios',
    description: 'Deltoides anterior, lateral y posterior con trabajo de trapecios.',
    difficulty: 'intermediate',
    duration_minutes: 45,
    category: 'strength',
    exercises: [
      { name: 'Press militar con barra', sets: 4, reps: '10', rest_seconds: 90, sort_order: 1 },
      { name: 'Elevaciones laterales', sets: 4, reps: '15', rest_seconds: 60, sort_order: 2 },
      { name: 'Elevaciones frontales', sets: 3, reps: '12', rest_seconds: 60, sort_order: 3 },
      { name: 'Pájaros (rear delt fly)', sets: 3, reps: '15', rest_seconds: 60, sort_order: 4 },
      { name: 'Encogimiento de hombros', sets: 4, reps: '15', rest_seconds: 60, sort_order: 5 },
    ],
  },
  {
    title: 'HIIT Quema Grasa',
    description: 'Circuito de alta intensidad para quemar calorías y mejorar resistencia cardiovascular.',
    difficulty: 'intermediate',
    duration_minutes: 30,
    category: 'hiit',
    exercises: [
      { name: 'Burpees', sets: 4, reps: '45s', rest_seconds: 15, sort_order: 1 },
      { name: 'Mountain Climbers', sets: 4, reps: '45s', rest_seconds: 15, sort_order: 2 },
      { name: 'Jump Squats', sets: 4, reps: '45s', rest_seconds: 15, sort_order: 3 },
      { name: 'High Knees', sets: 4, reps: '45s', rest_seconds: 15, sort_order: 4 },
      { name: 'Plancha con toques de hombro', sets: 4, reps: '45s', rest_seconds: 15, sort_order: 5 },
    ],
  },
  {
    title: 'Cardio Moderado',
    description: 'Sesión de cardio de intensidad moderada para quemar grasa y mejorar salud cardiovascular.',
    difficulty: 'beginner',
    duration_minutes: 35,
    category: 'cardio',
    exercises: [
      { name: 'Caminata rápida / Trote', sets: 1, reps: '10 min', rest_seconds: 0, sort_order: 1 },
      { name: 'Jumping Jacks', sets: 3, reps: '1 min', rest_seconds: 30, sort_order: 2 },
      { name: 'Skipping', sets: 3, reps: '1 min', rest_seconds: 30, sort_order: 3 },
      { name: 'Step-ups', sets: 3, reps: '1 min', rest_seconds: 30, sort_order: 4 },
      { name: 'Cooldown - Caminata', sets: 1, reps: '5 min', rest_seconds: 0, sort_order: 5 },
    ],
  },
  {
    title: 'Core y Abdominales',
    description: 'Trabajo completo de core: recto abdominal, oblicuos y transverso.',
    difficulty: 'beginner',
    duration_minutes: 25,
    category: 'strength',
    exercises: [
      { name: 'Crunch abdominal', sets: 3, reps: '20', rest_seconds: 45, sort_order: 1 },
      { name: 'Plancha frontal', sets: 3, reps: '45s', rest_seconds: 45, sort_order: 2 },
      { name: 'Plancha lateral', sets: 3, reps: '30s por lado', rest_seconds: 45, sort_order: 3 },
      { name: 'Bicicleta (bicycle crunch)', sets: 3, reps: '20', rest_seconds: 45, sort_order: 4 },
      { name: 'Elevación de piernas', sets: 3, reps: '15', rest_seconds: 45, sort_order: 5 },
    ],
  },
  {
    title: 'Push Pull Legs - Push Day',
    description: 'Día de empuje: pecho, hombros y tríceps.',
    difficulty: 'advanced',
    duration_minutes: 60,
    category: 'strength',
    exercises: [
      { name: 'Press de banca plano', sets: 4, reps: '8', rest_seconds: 120, sort_order: 1 },
      { name: 'Press militar sentado', sets: 4, reps: '10', rest_seconds: 90, sort_order: 2 },
      { name: 'Press inclinado mancuernas', sets: 3, reps: '10', rest_seconds: 75, sort_order: 3 },
      { name: 'Elevaciones laterales', sets: 4, reps: '15', rest_seconds: 60, sort_order: 4 },
      { name: 'Fondos en paralelas', sets: 3, reps: '12', rest_seconds: 75, sort_order: 5 },
      { name: 'Press francés', sets: 3, reps: '12', rest_seconds: 60, sort_order: 6 },
    ],
  },
  {
    title: 'Push Pull Legs - Pull Day',
    description: 'Día de tracción: espalda y bíceps.',
    difficulty: 'advanced',
    duration_minutes: 60,
    category: 'strength',
    exercises: [
      { name: 'Peso muerto convencional', sets: 4, reps: '6', rest_seconds: 180, sort_order: 1, notes: 'Forma estricta, no redondear la espalda' },
      { name: 'Dominadas', sets: 4, reps: '8', rest_seconds: 90, sort_order: 2 },
      { name: 'Remo con barra', sets: 4, reps: '10', rest_seconds: 75, sort_order: 3 },
      { name: 'Face pulls', sets: 3, reps: '15', rest_seconds: 60, sort_order: 4 },
      { name: 'Curl con barra Z', sets: 3, reps: '12', rest_seconds: 60, sort_order: 5 },
      { name: 'Curl martillo', sets: 3, reps: '12', rest_seconds: 60, sort_order: 6 },
    ],
  },
  {
    title: 'Flexibilidad y Movilidad',
    description: 'Sesión de estiramiento y movilidad articular para mejorar recuperación.',
    difficulty: 'beginner',
    duration_minutes: 30,
    category: 'flexibility',
    exercises: [
      { name: 'Estiramiento de cuádriceps', sets: 2, reps: '30s por lado', rest_seconds: 15, sort_order: 1 },
      { name: 'Estiramiento de isquiotibiales', sets: 2, reps: '30s por lado', rest_seconds: 15, sort_order: 2 },
      { name: 'Apertura de cadera (pigeon pose)', sets: 2, reps: '45s por lado', rest_seconds: 15, sort_order: 3 },
      { name: 'Estiramiento de pectorales en pared', sets: 2, reps: '30s por lado', rest_seconds: 15, sort_order: 4 },
      { name: 'Cat-Cow (gato-vaca)', sets: 2, reps: '10', rest_seconds: 15, sort_order: 5 },
      { name: 'Rotación torácica', sets: 2, reps: '10 por lado', rest_seconds: 15, sort_order: 6 },
    ],
  },
  {
    title: 'HIIT Avanzado - Tabata',
    description: 'Protocolo Tabata: 20s trabajo / 10s descanso x 8 rondas por ejercicio.',
    difficulty: 'advanced',
    duration_minutes: 25,
    category: 'hiit',
    exercises: [
      { name: 'Burpees', sets: 8, reps: '20s', rest_seconds: 10, sort_order: 1, notes: 'Protocolo Tabata: máxima intensidad' },
      { name: 'Thrusters con mancuernas', sets: 8, reps: '20s', rest_seconds: 10, sort_order: 2 },
      { name: 'Box jumps', sets: 8, reps: '20s', rest_seconds: 10, sort_order: 3 },
      { name: 'Battle ropes', sets: 8, reps: '20s', rest_seconds: 10, sort_order: 4 },
    ],
  },
];

async function seed() {
  console.log(`Seeding ${workouts.length} workouts...`);

  for (const workout of workouts) {
    const { exercises, ...workoutData } = workout;

    // Insert workout
    const { data, error } = await supabase
      .from('workouts')
      .insert(workoutData)
      .select('id')
      .single();

    if (error) {
      console.error(`Error inserting "${workout.title}":`, error.message);
      continue;
    }

    // Insert exercises
    const exercisesWithId = exercises.map(ex => ({
      ...ex,
      workout_id: data.id,
    }));

    const { error: exError } = await supabase
      .from('exercises')
      .insert(exercisesWithId);

    if (exError) {
      console.error(`Error inserting exercises for "${workout.title}":`, exError.message);
    } else {
      console.log(`  + ${workout.title} (${exercises.length} exercises)`);
    }
  }

  console.log('Workout seed complete!');
}

seed().catch(console.error);
