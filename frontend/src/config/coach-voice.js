// ═══════════════════════════════════════════════════════════════════════════
// MÓDULO DE VOZ DEL COACH — Charlie Ossa ("El Parcero Experto")
// ═══════════════════════════════════════════════════════════════════════════
// Este archivo es la ÚNICA FUENTE DE VERDAD para el estilo comunicativo
// de la app. Todos los mensajes user-facing deben salir de aquí.
//
// PERFIL: Coloquial-fraterno, entusiasta, pedagógico. Identidad paisa.
// TONO: Motivador, humilde, honesto, cercano.
// REGLAS:
//   1. Si usas un término técnico, explícalo con "o sea"
//   2. Trata al usuario como "parcero" o "crack"
//   3. Usa chimba, brutal, nivel, facha con naturalidad
//   4. Ante logros: "no es por ser lámpara, pero..."
//   5. Humor autocrítico breve, nunca cómico puro
//   6. Regionalismos paisas como puntuación, NO saturar
// ═══════════════════════════════════════════════════════════════════════════

// ─── SALUDOS POR HORA DEL DÍA ──────────────────────────────────────────
export const GREETINGS = {
  morning: [
    '¿Bien o no? Arrancamos el día con toda',
    'Buenos días, crack. Hoy vamos con todo',
    '¿Qué más? A darle que el día apenas empieza',
  ],
  afternoon: [
    '¿Bien o no? Vamos que la tarde está para darle',
    'Buenas tardes, crack. Échele gafa a tu progreso',
    '¿Qué más? A seguir dándole, que vamos bien',
  ],
  evening: [
    '¿Bien o no? Ya casi cerramos el día con todo',
    'Buenas noches, crack. Buen día de proceso',
    'Descansa bien que mañana seguimos con toda',
  ],
};

// ─── MENSAJES DEL ONBOARDING (Coach Tips) ───────────────────────────────
export const ONBOARDING_COACH_TIPS = {
  body_type:
    'Échele gafa: conocer tu somatotipo nos ayuda a armar un plan de entrenamiento y nutrición que de verdad funcione para ti.',
  sex:
    'Pille, los cálculos metabólicos varían resto entre hombres y mujeres. Por eso necesitamos este dato.',
  age:
    'A partir de los 30, tu metabolismo baja como un 2% por década. O sea, este dato es clave para calcular bien.',
  height:
    'Tu altura junto con tu peso nos permite calcular tu IMC y composición corporal. Datos que necesitamos sí o sí.',
  weight:
    'Este es tu punto de partida, crack. Cada cambio que logres va a ser visible desde aquí.',
  target_weight:
    'Un objetivo realista es perder entre 0.5 y 1 kilo por semana, o ganar 0.25 a 0.5 de músculo. Paso a paso, sin afán.',
  neck:
    'La medida del cuello es clave en la fórmula Navy para estimar tu porcentaje de grasa. O sea, sin esto no podemos calcular bien.',
  waist:
    'La circunferencia de cintura es el indicador número uno de salud metabólica según la OMS. Échele gafa a este dato.',
  hip:
    'Esta medida complementa la fórmula Navy para mujeres. O sea, nos da mayor precisión en el cálculo.',
  activity:
    'Tu nivel de actividad multiplica tu metabolismo basal para obtener tu gasto real diario. Esto define cuántas calorías necesitas.',
  meals:
    'No hay un número mágico, crack. Lo importante es la consistencia y los macros totales del día.',
  preferred_foods:
    'Échele gafa: tus alimentos favoritos van a tener prioridad en tu plan nutricional. O sea, vas a comer lo que te gusta.',
  diet_type:
    'Respetamos tu estilo alimentario al 100%. Tu plan se va a adaptar completamente a lo que prefieras.',
  photos:
    'Las fotos son opcionales, pero son la mejor forma de ver tu progreso real con el tiempo. Solo las ves tú.',
  health:
    'Tu salud es primero, parcero. Esta información nos ayuda a cuidarte mejor en todo el proceso.',
  sleep:
    'Dormir entre 7 y 9 horas puede mejorar tus resultados hasta un 40%. O sea, el descanso es parte del entrenamiento.',
  water:
    'La hidratación adecuada mejora el metabolismo y la recuperación muscular. Tómate tu agua, crack.',
  stress:
    'El estrés crónico eleva el cortisol y dificulta la pérdida de grasa. O sea, hay que manejar eso también.',
  alcohol:
    'El alcohol aporta 7 calorías por gramo y dificulta la síntesis de proteínas. Dato importante para tu plan.',
};

// ─── PANTALLAS MOTIVACIONALES ───────────────────────────────────────────
export const MOTIVATIONAL_SCREENS = {
  lose_weight: {
    title: '¡Vamos con toda, parcero!',
    message:
      'Cada kilo que pierdas te acerca a tu mejor versión. Te voy a guiar paso a paso en este proceso.',
    stat: 'El 73% de nuestros usuarios alcanzan su peso objetivo en menos de 90 días',
  },
  gain_muscle: {
    title: '¡Es hora de crecer!',
    message:
      'Construir músculo transforma tu cuerpo y tu confianza. Vamos a diseñar tu camino al crecimiento.',
    stat: 'Usuarios con tu perfil ganan en promedio 4.2kg de masa muscular en 12 semanas',
  },
  get_shredded: {
    title: '¡Definición total, crack!',
    message:
      'Vas por el siguiente nivel. Te voy a ayudar a esculpir cada músculo con precisión. Échele gafa.',
    stat: 'El 68% de usuarios logran reducir su porcentaje de grasa a niveles fitness en 8 semanas',
  },
  measurements_done: {
    title: '¡Qué nivel! Ya tenemos tus datos',
    message:
      'Con estas medidas vamos a calcular tu composición corporal con precisión científica. Brutal.',
    stat: 'Nuestros cálculos utilizan 7 fórmulas clínicas validadas internacionalmente',
  },
  target_set: {
    title: '¡Meta registrada, crack!',
    maintain:
      '¡De una! Vamos a mantener tu peso mientras mejoramos tu composición corporal.',
    change: (kg, action) =>
      `${kg} kg por ${action}. ¡Es un objetivo totalmente alcanzable! Te acompaño en cada paso del proceso.`,
    timeline: (weeks, rate) =>
      `A un ritmo saludable de ${rate}kg por semana, lo lograrás en aproximadamente ${weeks} semanas`,
  },
};

// ─── TOAST / NOTIFICACIONES ─────────────────────────────────────────────
export const TOASTS = {
  // Éxitos
  workout_completed: '¡Brutal! Entrenamiento completado',
  profile_updated: '¡De una! Perfil actualizado correctamente',
  metabolic_recalculated: 'Metabolismo recalculado y plan actualizado. Échele gafa a los nuevos datos',
  message_published: '¡Listo! Mensaje publicado para los muchachos',
  message_updated: 'Mensaje actualizado correctamente',
  message_deleted: 'Mensaje eliminado',
  food_created: '¡De una! Nuevo alimento agregado',
  food_updated: 'Alimento actualizado correctamente',
  food_deleted: 'Alimento eliminado',
  users_deactivated: (count) => `${count} usuario(s) desactivados`,
  users_deleted: (count) => `${count} usuario(s) eliminados permanentemente`,
  cleanup_done: (label) => `Limpieza de ${label} completada`,
  plan_generated: '¡Chimba! Tu plan nutricional está listo',
  section_saved: '¡De una! Sección guardada correctamente',

  // Errores
  error_workouts: 'Parce, hubo un error al cargar los entrenamientos',
  error_workout_detail: 'Error al cargar el entrenamiento. Intenta de nuevo',
  error_workout_log: 'Error al registrar el entrenamiento',
  error_coach_users: 'Error al cargar la lista de asesorados',
  error_coach_user: 'Error al cargar los datos del usuario',
  error_save: 'Parce, hubo un error al guardar. Intenta de nuevo',
  error_profile: 'Error al cargar tu perfil',
  error_nutrition: 'Error al cargar tu plan nutricional',
  error_messages: 'Error al cargar los mensajes',
  error_message_save: 'Error al guardar el mensaje',
  error_message_delete: 'Error al eliminar el mensaje',
  error_message_update: 'Error al actualizar el mensaje',
  error_system_health: (err) => `Error al cargar salud del sistema: ${err}`,
  error_inactive_search: (err) => `Error al buscar usuarios inactivos: ${err}`,
  error_deactivate: (err) => `Error al desactivar: ${err}`,
  error_delete: (err) => `Error al eliminar: ${err}`,
  error_cleanup: (err) => `Error en limpieza: ${err}`,
  error_recalculate: 'Completa peso, altura y edad primero, crack',
  error_recalculate_detail: (err) => `Error al recalcular: ${err}`,
};

// ─── CONFIRMACIONES ─────────────────────────────────────────────────────
export const CONFIRMATIONS = {
  delete_message: '¿Eliminar este mensaje?',
  delete_food: '¿Eliminar este alimento?',
  deactivate_users: (count) =>
    `Vas a DESACTIVAR ${count} usuario(s). Sus datos se conservarán pero no podrán iniciar sesión. ¿Continuar?`,
  delete_users: (count) =>
    `ATENCIÓN: Vas a ELIMINAR PERMANENTEMENTE ${count} usuario(s) y TODOS sus datos. Esta acción NO se puede deshacer. ¿Continuar?`,
  delete_users_confirm: 'Segunda confirmación: ¿Estás absolutamente seguro?',
  run_cleanup: (label) => `¿Ejecutar limpieza de ${label}?`,
};

// ─── LABELS DE INTERFAZ ─────────────────────────────────────────────────
export const UI_LABELS = {
  // Navegación
  app_name: 'FitBro',
  nav: {
    home: 'Inicio',
    calculator: 'Cálculo',
    nutrition: 'Nutrición',
    workouts: 'Entreno',
    profile: 'Perfil',
  },
  admin_nav: {
    coach: 'Asesorados',
    foods: 'Alimentos',
    feed: 'Mensajes',
    onboarding: 'Onboarding',
    system: 'Sistema',
  },

  // Botones comunes
  buttons: {
    save: 'Guardar',
    cancel: 'Cancelar',
    next: 'Continuar',
    back: 'Atrás',
    skip: 'Omitir',
    begin: 'Comenzar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
    search: 'Buscar...',
    loading: 'Cargando...',
    logout: 'Cerrar sesión',
  },

  // Objetivos
  goals: {
    lose_weight: 'Perder grasa corporal',
    gain_muscle: 'Ganar masa muscular',
    get_shredded: 'Definición extrema',
  },

  // Somatotipos
  body_types: {
    ectomorph: { name: 'Ectomorfo', desc: 'Complexión delgada, metabolismo rápido' },
    mesomorph: { name: 'Mesomorfo', desc: 'Atlético, gana músculo fácilmente' },
    endomorph: { name: 'Endomorfo', desc: 'Complexión robusta, tiende a acumular grasa' },
  },

  // Secciones del onboarding
  sections: {
    personal_info: { title: 'Información Personal', desc: 'Datos básicos para personalizar tu plan' },
    measurements: { title: 'Medidas Corporales', desc: 'Medidas para calcular tu composición corporal' },
    photos: { title: 'Registro Fotográfico', desc: 'Fotos opcionales para seguimiento visual' },
    health: { title: 'Salud y Bienestar', desc: 'Tu salud es lo primero, parcero' },
    habits: { title: 'Hábitos de Vida', desc: 'Para optimizar tu plan al máximo' },
    preferences: { title: 'Preferencias', desc: 'Personaliza tu experiencia' },
  },

  // Perfil
  profile: {
    title: 'Mi Perfil',
    personal_data: 'Datos Personales',
    full_name: 'Nombre completo',
    sex: 'Sexo',
    male: 'Hombre',
    female: 'Mujer',
    age: 'Edad',
    current_weight: 'Peso actual (kg)',
    target_weight: 'Peso objetivo (kg)',
    height: 'Altura (cm)',
    measurements: 'Medidas Corporales',
    neck: 'Cuello (cm)',
    waist: 'Cintura (cm)',
    hip: 'Cadera (cm)',
    preferences: 'Preferencias',
    goal: 'Objetivo',
    activity_level: 'Nivel de actividad',
    meals_per_day: 'Comidas por día',
    diet_type: 'Tipo de dieta',
  },

  // Nutrición
  nutrition: {
    title: 'Plan Nutricional',
    daily_calories: 'Calorías/día',
    protein: 'Proteína',
    carbs: 'Carbohidratos',
    fat: 'Grasas',
    macro_distribution: 'Distribución de Macros',
    goal_label: 'Objetivo',
    surplus: 'Superávit',
    deficit: 'Déficit',
    timeline: 'Tiempo estimado',
    projected_change: 'Cambio proyectado',
    meal_suggestions: 'Sugerencias de Comidas',
    view_detail: 'Ver detalle',
    match: 'coincidencia',
    servings: 'porciones',
    suggested_foods: 'Alimentos Sugeridos',
  },

  // Entrenamientos
  workouts: {
    title: 'Entrenamientos',
    all: 'Todos',
    strength: 'Fuerza',
    cardio: 'Cardio',
    hiit: 'HIIT',
    flexibility: 'Flexibilidad',
    sets: 'series',
    reps: 'reps',
    rest: 'descanso',
    start: 'Iniciar Entrenamiento',
    complete: 'Completar',
  },

  // Calculadora
  calculator: {
    title: 'Calculadora Metabólica',
    patient_data: 'Datos del Paciente',
    anthropometry: 'Antropometría (CM)',
    calculate: 'Calcular',
    results: 'Resultados',
  },

  // Feed
  feed: {
    title: 'Novedades',
    coach_label: 'Coach',
    pinned: 'Fijado',
    no_messages: 'No hay publicaciones aún',
    admin_title: 'Gestión de Mensajes',
    new_message: 'Nuevo mensaje',
    edit_message: 'Editar mensaje',
    title_optional: 'Título (opcional)',
    placeholder: 'Escribe tu mensaje aquí...',
    pin_message: 'Fijar mensaje arriba',
    publish: 'Publicar',
    update: 'Actualizar',
    published_count: (count) => `Mensajes publicados (${count})`,
  },

  // Admin Foods
  admin_foods: {
    title: 'Gestión de Alimentos',
    add: '+ Agregar',
    new_food: 'Nuevo Alimento',
    edit_food: 'Editar Alimento',
    all_categories: 'Todas las categorías',
    name: 'Nombre',
    category: 'Categoría',
    serving: 'Porción',
    unit: 'Unidad',
    calories: 'Calorías',
    protein: 'Proteína (g)',
    carbs: 'Carbs (g)',
    fat: 'Grasa (g)',
    sodium: 'Sodio (mg)',
    fiber: 'Fibra (g)',
    sugar: 'Azúcar (g)',
  },

  // Coach Dashboard
  coach: {
    title: 'Mis Asesorados',
    total_users: 'Total Usuarios',
    active_week: 'Activos esta semana',
    onboarding_done: 'Onboarding completo',
    search_placeholder: 'Buscar por nombre...',
    all_goals: 'Todos los objetivos',
    user_detail: 'Detalle del Asesorado',
    back_to_list: 'Volver a la lista',
    metabolic_section: 'Datos Metabólicos',
    nutrition_section: 'Plan Nutricional',
    workout_section: 'Entrenamientos',
    health_section: 'Salud',
  },
};

// ─── FRASES CONTEXTUALES (para generación dinámica futura) ──────────────
export const CONTEXTUAL_PHRASES = {
  // Cuando el usuario logra algo
  achievement: [
    '¡Qué nivel, crack! Vas por buen camino',
    '¡Brutal! Sigue así que el proceso se nota',
    'No es por ser lámpara, pero estás haciéndolo una chimba',
    '¡De una! Eso es compromiso con el proceso',
  ],
  // Cuando hay que motivar
  motivation: [
    'Vamos, que cada día cuenta en el proceso',
    'No le bajes al ritmo, crack. Tú puedes',
    'Recuerda por qué empezaste. Échele gafa a tu meta',
    'El proceso es largo pero los resultados son brutales',
  ],
  // Cuando hay un error o problema
  error_empathy: [
    'Parce, algo salió mal. Dale de nuevo',
    'Tranquilo, esto pasa. Intenta otra vez',
    'Ups, algo falló. No te preocupes, dale retry',
  ],
  // Cuando completa una sección
  section_complete: [
    '¡De una! Sección completada',
    '¡Qué chimba! Vamos avanzando',
    'Brutal, ya queda menos. Sigue así',
  ],
  // Bienvenida al dashboard
  welcome: [
    'Échele gafa a tu resumen de hoy',
    'Tu resumen de hoy',
    'Vamos a ver cómo vas en el proceso',
  ],
};

// ─── HELPER: Obtener saludo por hora ────────────────────────────────────
export function getGreeting(name) {
  const hour = new Date().getHours();
  let period = 'morning';
  if (hour >= 12 && hour < 18) period = 'afternoon';
  else if (hour >= 18) period = 'evening';

  const greetings = GREETINGS[period];
  const idx = Math.floor(Math.random() * greetings.length);
  return name ? `${greetings[idx]}, ${name}` : greetings[idx];
}

// ─── HELPER: Obtener frase contextual aleatoria ─────────────────────────
export function getPhrase(context) {
  const phrases = CONTEXTUAL_PHRASES[context];
  if (!phrases || phrases.length === 0) return '';
  return phrases[Math.floor(Math.random() * phrases.length)];
}

// ─── HELPER: Obtener coach tip del onboarding ───────────────────────────
export function getCoachTip(stepKey) {
  return ONBOARDING_COACH_TIPS[stepKey] || '';
}
