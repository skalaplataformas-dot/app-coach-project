// ═══════════════════════════════════════════════════════════════════════════
// MÓDULO DE VOZ DEL COACH — Charlie Ossa ("El Parcero Experto")
// ═══════════════════════════════════════════════════════════════════════════
//
// ARQUITECTURA:
// 1. STATIC_MESSAGES: Fallback inmediato, cero latencia, siempre disponibles
// 2. MESSAGE_POOL: Variaciones por contexto, rotación automática
// 3. _cache: Mensajes cacheados en memoria (futuro: desde API/LLM)
// 4. voice(): Función única de acceso — resuelve pool > cache > static
//
// PARA CAMBIAR UN MENSAJE: edita este archivo
// PARA AGREGAR VARIACIONES: agrega al MESSAGE_POOL
// PARA INTEGRAR LLM (futuro): alimentar _cache via loadVoiceFromAPI()
//
// PERFIL: Coloquial-fraterno, entusiasta, pedagógico. Identidad paisa.
// TONO: Motivador, humilde, honesto, cercano.
// ═══════════════════════════════════════════════════════════════════════════

// ─── CACHE EN MEMORIA (ligero, sin persistencia) ────────────────────────
const _cache = new Map();
const _poolIndex = new Map(); // Tracking de rotación para no repetir

// ─── SELECTOR DE MENSAJE CON ROTACIÓN ───────────────────────────────────
// Rota secuencialmente por el pool para que no se repita el mismo mensaje
function _pick(key, pool) {
  if (!pool || pool.length === 0) return null;
  if (pool.length === 1) return pool[0];
  const idx = (_poolIndex.get(key) || 0) % pool.length;
  _poolIndex.set(key, idx + 1);
  return pool[idx];
}

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE_POOL — Variaciones por contexto
// Cada key puede tener múltiples variaciones. voice() rota entre ellas.
// Para mensajes que no necesitan variación, un solo string basta.
// ═══════════════════════════════════════════════════════════════════════════
const MESSAGE_POOL = {
  // ─── Saludos ────────────────────────────────────────────────────────
  'greeting.morning': [
    '¿Bien o no? Arrancamos el día con toda',
    'Buenos días, crack. Hoy vamos con todo',
    '¿Qué más? A darle que el día apenas empieza',
  ],
  'greeting.afternoon': [
    '¿Bien o no? Vamos que la tarde está para darle',
    'Buenas tardes, crack. Échele gafa a tu progreso',
    '¿Qué más? A seguir dándole, que vamos bien',
  ],
  'greeting.evening': [
    '¿Bien o no? Ya casi cerramos el día con todo',
    'Buenas noches, crack. Buen día de proceso',
    'Descansa bien que mañana seguimos con toda',
  ],

  // ─── Coach Tips (Onboarding) ────────────────────────────────────────
  'tip.body_type': [
    'Échele gafa: conocer tu somatotipo nos ayuda a armar un plan de entrenamiento y nutrición que de verdad funcione para ti.',
  ],
  'tip.sex': [
    'Pille, los cálculos metabólicos varían resto entre hombres y mujeres. Por eso necesitamos este dato.',
  ],
  'tip.age': [
    'A partir de los 30, tu metabolismo baja como un 2% por década. O sea, este dato es clave para calcular bien.',
    'La edad influye directo en tu metabolismo. O sea, entre más preciso, mejor te calculamos todo.',
  ],
  'tip.height': [
    'Tu altura junto con tu peso nos permite calcular tu IMC y composición corporal. Datos que necesitamos sí o sí.',
  ],
  'tip.weight': [
    'Este es tu punto de partida, crack. Cada cambio que logres va a ser visible desde aquí.',
    'Acá empezamos, parcero. Todo progreso se va a medir desde este punto.',
  ],
  'tip.target_weight': [
    'Un objetivo realista es perder entre 0.5 y 1 kilo por semana, o ganar 0.25 a 0.5 de músculo. Paso a paso, sin afán.',
  ],
  'tip.neck': [
    'La medida del cuello es clave en la fórmula Navy para estimar tu porcentaje de grasa. O sea, sin esto no podemos calcular bien.',
  ],
  'tip.waist': [
    'La circunferencia de cintura es el indicador número uno de salud metabólica según la OMS. Échele gafa a este dato.',
  ],
  'tip.hip': [
    'Esta medida complementa la fórmula Navy para mujeres. O sea, nos da mayor precisión en el cálculo.',
  ],
  'tip.activity': [
    'Tu nivel de actividad multiplica tu metabolismo basal para obtener tu gasto real diario. Esto define cuántas calorías necesitas.',
  ],
  'tip.meals': [
    'No hay un número mágico, crack. Lo importante es la consistencia y los macros totales del día.',
    'Lo que importa es el total del día, no cuántas veces comes. O sea, elige lo que te funcione mejor.',
  ],
  'tip.preferred_foods': [
    'Échele gafa: tus alimentos favoritos van a tener prioridad en tu plan nutricional. O sea, vas a comer lo que te gusta.',
  ],
  'tip.diet_type': [
    'Respetamos tu estilo alimentario al 100%. Tu plan se va a adaptar completamente a lo que prefieras.',
  ],
  'tip.photos': [
    'Las fotos son opcionales, pero son la mejor forma de ver tu progreso real con el tiempo. Solo las ves tú.',
  ],
  'tip.health': [
    'Tu salud es primero, parcero. Esta información nos ayuda a cuidarte mejor en todo el proceso.',
  ],
  'tip.sleep': [
    'Dormir entre 7 y 9 horas puede mejorar tus resultados hasta un 40%. O sea, el descanso es parte del entrenamiento.',
  ],
  'tip.water': [
    'La hidratación adecuada mejora el metabolismo y la recuperación muscular. Tómate tu agua, crack.',
  ],
  'tip.stress': [
    'El estrés crónico eleva el cortisol y dificulta la pérdida de grasa. O sea, hay que manejar eso también.',
  ],
  'tip.alcohol': [
    'El alcohol aporta 7 calorías por gramo y dificulta la síntesis de proteínas. Dato importante para tu plan.',
  ],

  // ─── Pantallas Motivacionales ───────────────────────────────────────
  'motiv.lose_weight.title': ['¡Vamos con toda, parcero!'],
  'motiv.lose_weight.message': [
    'Cada kilo que pierdas te acerca a tu mejor versión. Te voy a guiar paso a paso en este proceso.',
    'Tu transformación empieza hoy. Vamos a diseñar un plan que de verdad funcione para ti.',
  ],
  'motiv.gain_muscle.title': ['¡Es hora de crecer!'],
  'motiv.gain_muscle.message': [
    'Construir músculo transforma tu cuerpo y tu confianza. Vamos a diseñar tu camino al crecimiento.',
  ],
  'motiv.get_shredded.title': ['¡Definición total, crack!'],
  'motiv.get_shredded.message': [
    'Vas por el siguiente nivel. Te voy a ayudar a esculpir cada músculo con precisión. Échele gafa.',
  ],
  'motiv.measurements_done.title': ['¡Qué nivel! Ya tenemos tus datos'],
  'motiv.measurements_done.message': [
    'Con estas medidas vamos a calcular tu composición corporal con precisión científica. Brutal.',
  ],
  'motiv.target_set.title': ['¡Meta registrada, crack!'],

  // ─── Toast Éxitos ───────────────────────────────────────────────────
  'toast.workout_completed': [
    '¡Brutal! Entrenamiento completado',
    '¡Qué nivel, crack! Otro entreno en el bolsillo',
    '¡De una! Eso es compromiso con el proceso',
  ],
  'toast.profile_updated': [
    '¡De una! Perfil actualizado correctamente',
    '¡Listo, parcero! Datos guardados',
  ],
  'toast.metabolic_recalculated': [
    'Metabolismo recalculado y plan actualizado. Échele gafa a los nuevos datos',
  ],
  'toast.message_published': [
    '¡Listo! Mensaje publicado para los muchachos',
  ],
  'toast.message_updated': ['Mensaje actualizado correctamente'],
  'toast.message_deleted': ['Mensaje eliminado'],
  'toast.food_created': ['¡De una! Nuevo alimento agregado'],
  'toast.food_updated': ['Alimento actualizado correctamente'],
  'toast.food_deleted': ['Alimento eliminado'],
  'toast.plan_generated': [
    '¡Chimba! Tu plan nutricional está listo',
    '¡De una! Plan nutricional generado, échele gafa',
  ],
  'toast.section_saved': ['¡De una! Sección guardada correctamente'],

  // ─── Toast Errores ──────────────────────────────────────────────────
  'toast.error_workouts': [
    'Parce, hubo un error al cargar los entrenamientos',
    'Error cargando entrenamientos. Dale retry, crack',
  ],
  'toast.error_workout_detail': ['Error al cargar el entrenamiento. Intenta de nuevo'],
  'toast.error_workout_log': ['Error al registrar el entrenamiento'],
  'toast.error_coach_users': ['Error al cargar la lista de asesorados'],
  'toast.error_coach_user': ['Error al cargar los datos del usuario'],
  'toast.error_save': [
    'Parce, hubo un error al guardar. Intenta de nuevo',
    'Error al guardar. Dale de nuevo, crack',
  ],
  'toast.error_profile': ['Error al cargar tu perfil'],
  'toast.error_nutrition': ['Error al cargar tu plan nutricional'],
  'toast.error_messages': ['Error al cargar los mensajes'],
  'toast.error_message_save': ['Error al guardar el mensaje'],
  'toast.error_message_delete': ['Error al eliminar el mensaje'],
  'toast.error_message_update': ['Error al actualizar el mensaje'],
  'toast.error_recalculate': ['Completa peso, altura y edad primero, crack'],

  // ─── Frases Contextuales ────────────────────────────────────────────
  'ctx.achievement': [
    '¡Qué nivel, crack! Vas por buen camino',
    '¡Brutal! Sigue así que el proceso se nota',
    'No es por ser lámpara, pero estás haciéndolo una chimba',
    '¡De una! Eso es compromiso con el proceso',
  ],
  'ctx.motivation': [
    'Vamos, que cada día cuenta en el proceso',
    'No le bajes al ritmo, crack. Tú puedes',
    'Recuerda por qué empezaste. Échele gafa a tu meta',
    'El proceso es largo pero los resultados son brutales',
  ],
  'ctx.error_empathy': [
    'Parce, algo salió mal. Dale de nuevo',
    'Tranquilo, esto pasa. Intenta otra vez',
    'Ups, algo falló. No te preocupes, dale retry',
  ],
  'ctx.section_complete': [
    '¡De una! Sección completada',
    '¡Qué chimba! Vamos avanzando',
    'Brutal, ya queda menos. Sigue así',
  ],
  'ctx.welcome': [
    'Échele gafa a tu resumen de hoy',
    'Tu resumen de hoy',
    'Vamos a ver cómo vas en el proceso',
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// voice() — FUNCIÓN PRINCIPAL DE ACCESO
// ═══════════════════════════════════════════════════════════════════════════
// Resuelve: cache > pool > null
// Uso: voice('toast.workout_completed') → "¡Brutal! Entrenamiento completado"
//      voice('tip.age') → tip del coach para edad (rota si hay variaciones)
//
export function voice(key) {
  // 1. Cache primero (futuro: poblado por LLM)
  if (_cache.has(key)) return _cache.get(key);
  // 2. Pool de variaciones
  const pool = MESSAGE_POOL[key];
  if (pool) return _pick(key, pool);
  // 3. Null si no existe (el consumidor debe tener fallback)
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════
// API PÚBLICA — Wrappers tipados para mantener compatibilidad
// ═══════════════════════════════════════════════════════════════════════════

// Saludos
export const GREETINGS = {
  morning: MESSAGE_POOL['greeting.morning'],
  afternoon: MESSAGE_POOL['greeting.afternoon'],
  evening: MESSAGE_POOL['greeting.evening'],
};

// Onboarding tips (compatibilidad con import existente)
export const ONBOARDING_COACH_TIPS = {
  body_type: voice('tip.body_type'),
  sex: voice('tip.sex'),
  age: voice('tip.age'),
  height: voice('tip.height'),
  weight: voice('tip.weight'),
  target_weight: voice('tip.target_weight'),
  neck: voice('tip.neck'),
  waist: voice('tip.waist'),
  hip: voice('tip.hip'),
  activity: voice('tip.activity'),
  meals: voice('tip.meals'),
  preferred_foods: voice('tip.preferred_foods'),
  diet_type: voice('tip.diet_type'),
  photos: voice('tip.photos'),
  health: voice('tip.health'),
  sleep: voice('tip.sleep'),
  water: voice('tip.water'),
  stress: voice('tip.stress'),
  alcohol: voice('tip.alcohol'),
};

// Motivacionales (compatibilidad)
export const MOTIVATIONAL_SCREENS = {
  lose_weight: {
    title: voice('motiv.lose_weight.title'),
    message: voice('motiv.lose_weight.message'),
    stat: 'El 73% de nuestros usuarios alcanzan su peso objetivo en menos de 90 días',
  },
  gain_muscle: {
    title: voice('motiv.gain_muscle.title'),
    message: voice('motiv.gain_muscle.message'),
    stat: 'Usuarios con tu perfil ganan en promedio 4.2kg de masa muscular en 12 semanas',
  },
  get_shredded: {
    title: voice('motiv.get_shredded.title'),
    message: voice('motiv.get_shredded.message'),
    stat: 'El 68% de usuarios logran reducir su porcentaje de grasa a niveles fitness en 8 semanas',
  },
  measurements_done: {
    title: voice('motiv.measurements_done.title'),
    message: voice('motiv.measurements_done.message'),
    stat: 'Nuestros cálculos utilizan 7 fórmulas clínicas validadas internacionalmente',
  },
  target_set: {
    title: voice('motiv.target_set.title'),
    maintain: '¡De una! Vamos a mantener tu peso mientras mejoramos tu composición corporal.',
    change: (kg, action) =>
      `${kg} kg por ${action}. ¡Es un objetivo totalmente alcanzable! Te acompaño en cada paso del proceso.`,
    timeline: (weeks, rate) =>
      `A un ritmo saludable de ${rate}kg por semana, lo lograrás en aproximadamente ${weeks} semanas`,
  },
};

// Toasts (compatibilidad — usa voice() con rotación)
export const TOASTS = {
  // Éxitos
  get workout_completed() { return voice('toast.workout_completed'); },
  get profile_updated() { return voice('toast.profile_updated'); },
  get metabolic_recalculated() { return voice('toast.metabolic_recalculated'); },
  get message_published() { return voice('toast.message_published'); },
  get message_updated() { return voice('toast.message_updated'); },
  get message_deleted() { return voice('toast.message_deleted'); },
  get food_created() { return voice('toast.food_created'); },
  get food_updated() { return voice('toast.food_updated'); },
  get food_deleted() { return voice('toast.food_deleted'); },
  users_deactivated: (count) => `${count} usuario(s) desactivados`,
  users_deleted: (count) => `${count} usuario(s) eliminados permanentemente`,
  cleanup_done: (label) => `Limpieza de ${label} completada`,
  get plan_generated() { return voice('toast.plan_generated'); },
  get section_saved() { return voice('toast.section_saved'); },

  // Errores (rotación en los que tienen variaciones)
  get error_workouts() { return voice('toast.error_workouts'); },
  get error_workout_detail() { return voice('toast.error_workout_detail'); },
  get error_workout_log() { return voice('toast.error_workout_log'); },
  get error_coach_users() { return voice('toast.error_coach_users'); },
  get error_coach_user() { return voice('toast.error_coach_user'); },
  get error_save() { return voice('toast.error_save'); },
  get error_profile() { return voice('toast.error_profile'); },
  get error_nutrition() { return voice('toast.error_nutrition'); },
  get error_messages() { return voice('toast.error_messages'); },
  get error_message_save() { return voice('toast.error_message_save'); },
  get error_message_delete() { return voice('toast.error_message_delete'); },
  get error_message_update() { return voice('toast.error_message_update'); },
  error_system_health: (err) => `Error al cargar salud del sistema: ${err}`,
  error_inactive_search: (err) => `Error al buscar usuarios inactivos: ${err}`,
  error_deactivate: (err) => `Error al desactivar: ${err}`,
  error_delete: (err) => `Error al eliminar: ${err}`,
  error_cleanup: (err) => `Error en limpieza: ${err}`,
  get error_recalculate() { return voice('toast.error_recalculate'); },
  error_recalculate_detail: (err) => `Error al recalcular: ${err}`,
};

// Confirmaciones
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

// Labels de interfaz
export const UI_LABELS = {
  app_name: 'FitBro',
  nav: { home: 'Inicio', calculator: 'Cálculo', nutrition: 'Nutrición', workouts: 'Entreno', profile: 'Perfil' },
  admin_nav: { coach: 'Asesorados', foods: 'Alimentos', feed: 'Mensajes', onboarding: 'Onboarding', system: 'Sistema' },
  buttons: { save: 'Guardar', cancel: 'Cancelar', next: 'Continuar', back: 'Atrás', skip: 'Omitir', begin: 'Comenzar', delete: 'Eliminar', edit: 'Editar', create: 'Crear', search: 'Buscar...', loading: 'Cargando...', logout: 'Cerrar sesión' },
  goals: { lose_weight: 'Perder grasa corporal', gain_muscle: 'Ganar masa muscular', get_shredded: 'Definición extrema' },
  body_types: {
    ectomorph: { name: 'Ectomorfo', desc: 'Complexión delgada, metabolismo rápido' },
    mesomorph: { name: 'Mesomorfo', desc: 'Atlético, gana músculo fácilmente' },
    endomorph: { name: 'Endomorfo', desc: 'Complexión robusta, tiende a acumular grasa' },
  },
  sections: {
    personal_info: { title: 'Información Personal', desc: 'Datos básicos para personalizar tu plan' },
    measurements: { title: 'Medidas Corporales', desc: 'Medidas para calcular tu composición corporal' },
    photos: { title: 'Registro Fotográfico', desc: 'Fotos opcionales para seguimiento visual' },
    health: { title: 'Salud y Bienestar', desc: 'Tu salud es lo primero, parcero' },
    habits: { title: 'Hábitos de Vida', desc: 'Para optimizar tu plan al máximo' },
    preferences: { title: 'Preferencias', desc: 'Personaliza tu experiencia' },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

export function getGreeting(name) {
  const hour = new Date().getHours();
  let period = 'morning';
  if (hour >= 12 && hour < 18) period = 'afternoon';
  else if (hour >= 18) period = 'evening';
  const msg = voice(`greeting.${period}`);
  return name ? `${msg}, ${name}` : msg;
}

export function getPhrase(context) {
  return voice(`ctx.${context}`) || '';
}

export function getCoachTip(stepKey) {
  return voice(`tip.${stepKey}`) || '';
}

// ═══════════════════════════════════════════════════════════════════════════
// INTEGRACIÓN FUTURA CON LLM
// ═══════════════════════════════════════════════════════════════════════════
// Para generar mensajes dinámicos desde un LLM:
//
// 1. Crear endpoint: POST /api/coach/generate-messages
//    - Recibe: { context, user_data }
//    - Envía el COACH_PROFILE al LLM con el contexto
//    - Retorna mensajes generados
//
// 2. Llamar loadVoiceFromAPI() al iniciar la app
//    - Carga un batch de mensajes generados
//    - Los guarda en _cache
//    - voice() los usa automáticamente antes del pool estático
//
// 3. El perfil del coach para el LLM:
export const COACH_PROFILE = {
  name: 'Charlie Ossa',
  alias: 'El Parcero Experto',
  tone: 'Coloquial-fraterno, entusiasta, pedagógico',
  identity: 'Paisa colombiano, fitness, motivador humilde',
  rules: [
    'Si usas término técnico, explícalo con "o sea"',
    'Trata al usuario como "parcero", "crack" o "muchachos"',
    'Usa chimba, brutal, nivel, facha con naturalidad',
    'Ante logros: "no es por ser lámpara, pero..."',
    'Humor autocrítico breve, nunca cómico puro',
    'Regionalismos paisas como puntuación, NO saturar',
    '"Parce" no en cada frase, es marcador de inicio o énfasis',
    'Aperturas incluyen "¿Bien o no?"',
    'Reformulación: término técnico + "o sea" + explicación llana',
  ],
  expressions: [
    'Échele gafa', 'De una', '¿Bien o no?', 'Todo bien',
    'Qué chimba', 'Qué nivel', 'Brutal', 'No es por ser lámpara',
  ],
  contexts: {
    training: 'Frases cortas, onomatopeyas de esfuerzo, aliento repetitivo',
    explanation: 'Longitud media, "o sea" para traducir, accesible',
    reflection: 'Más pausado, menos jerga, honestidad emocional',
    casual: 'Humor autocrítico, meta-comentarios, jerga paisa',
  },
};

// Función para cargar mensajes generados desde API (futuro)
// Ligero: solo carga una vez, cachea en memoria, sin persistencia
export async function loadVoiceFromAPI(apiUrl) {
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) return; // Falla silenciosa, usa fallback estático
    const messages = await res.json();
    // messages = { 'toast.workout_completed': 'mensaje generado', ... }
    Object.entries(messages).forEach(([key, value]) => {
      _cache.set(key, value);
    });
  } catch {
    // Falla silenciosa — los mensajes estáticos siempre funcionan
  }
}

// Función para inyectar mensajes manualmente (testing/iteración)
export function setVoice(key, message) {
  _cache.set(key, message);
}

// Función para limpiar cache (reset a estáticos)
export function resetVoice() {
  _cache.clear();
  _poolIndex.clear();
}
