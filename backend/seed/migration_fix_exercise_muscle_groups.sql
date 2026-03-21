-- Asignar muscle_group a todos los ejercicios existentes

-- PECHO
UPDATE exercises SET muscle_group = 'chest' WHERE name ILIKE '%press de banca%';
UPDATE exercises SET muscle_group = 'chest' WHERE name ILIKE '%press inclinado%';
UPDATE exercises SET muscle_group = 'chest' WHERE name ILIKE '%press plano%';
UPDATE exercises SET muscle_group = 'chest' WHERE name ILIKE '%aperturas%';
UPDATE exercises SET muscle_group = 'chest' WHERE name ILIKE '%flexiones de pecho%';
UPDATE exercises SET muscle_group = 'chest' WHERE name ILIKE '%fondos en paralelas%';
UPDATE exercises SET muscle_group = 'chest' WHERE name ILIKE '%estiramiento de pectorales%';

-- ESPALDA
UPDATE exercises SET muscle_group = 'back' WHERE name ILIKE '%dominada%';
UPDATE exercises SET muscle_group = 'back' WHERE name ILIKE '%remo%';
UPDATE exercises SET muscle_group = 'back' WHERE name ILIKE '%jalon%' OR name ILIKE '%jalón%';
UPDATE exercises SET muscle_group = 'back' WHERE name ILIKE '%peso muerto%';
UPDATE exercises SET muscle_group = 'back' WHERE name ILIKE '%face pull%';

-- HOMBROS
UPDATE exercises SET muscle_group = 'shoulders' WHERE name ILIKE '%press militar%';
UPDATE exercises SET muscle_group = 'shoulders' WHERE name ILIKE '%elevaciones laterales%';
UPDATE exercises SET muscle_group = 'shoulders' WHERE name ILIKE '%elevaciones frontales%';
UPDATE exercises SET muscle_group = 'shoulders' WHERE name ILIKE '%pajaros%' OR name ILIKE '%pájaros%';
UPDATE exercises SET muscle_group = 'shoulders' WHERE name ILIKE '%encogimiento%';
UPDATE exercises SET muscle_group = 'shoulders' WHERE name ILIKE '%plancha con toques de hombro%';

-- BRAZOS (biceps + triceps)
UPDATE exercises SET muscle_group = 'arms' WHERE name ILIKE '%curl%';
UPDATE exercises SET muscle_group = 'arms' WHERE name ILIKE '%extension de triceps%' OR name ILIKE '%extensión de tríceps%';
UPDATE exercises SET muscle_group = 'arms' WHERE name ILIKE '%press frances%' OR name ILIKE '%press francés%';

-- PIERNAS
UPDATE exercises SET muscle_group = 'legs' WHERE name ILIKE '%sentadilla%';
UPDATE exercises SET muscle_group = 'legs' WHERE name ILIKE '%prensa de piernas%';
UPDATE exercises SET muscle_group = 'legs' WHERE name ILIKE '%extension de cuadriceps%' OR name ILIKE '%extensión de cuádriceps%';
UPDATE exercises SET muscle_group = 'legs' WHERE name ILIKE '%curl femoral%';
UPDATE exercises SET muscle_group = 'legs' WHERE name ILIKE '%pantorrilla%';
UPDATE exercises SET muscle_group = 'legs' WHERE name ILIKE '%jump squat%';
UPDATE exercises SET muscle_group = 'legs' WHERE name ILIKE '%step-up%';
UPDATE exercises SET muscle_group = 'legs' WHERE name ILIKE '%estiramiento de cuadriceps%' OR name ILIKE '%estiramiento de cuádriceps%';
UPDATE exercises SET muscle_group = 'legs' WHERE name ILIKE '%estiramiento de isquiotibiales%';
UPDATE exercises SET muscle_group = 'legs' WHERE name ILIKE '%apertura de cadera%';
UPDATE exercises SET muscle_group = 'legs' WHERE name ILIKE '%box jump%';

-- CORE / ABDOMINALES
UPDATE exercises SET muscle_group = 'core' WHERE name ILIKE '%crunch%';
UPDATE exercises SET muscle_group = 'core' WHERE name ILIKE '%plancha%' AND muscle_group IS NULL;
UPDATE exercises SET muscle_group = 'core' WHERE name ILIKE '%bicicleta%';
UPDATE exercises SET muscle_group = 'core' WHERE name ILIKE '%elevacion de piernas%' OR name ILIKE '%elevación de piernas%';
UPDATE exercises SET muscle_group = 'core' WHERE name ILIKE '%cat-cow%' OR name ILIKE '%gato-vaca%';
UPDATE exercises SET muscle_group = 'core' WHERE name ILIKE '%rotacion toracica%' OR name ILIKE '%rotación torácica%';

-- CARDIO
UPDATE exercises SET muscle_group = 'cardio' WHERE name ILIKE '%burpee%';
UPDATE exercises SET muscle_group = 'cardio' WHERE name ILIKE '%mountain climber%';
UPDATE exercises SET muscle_group = 'cardio' WHERE name ILIKE '%high knee%';
UPDATE exercises SET muscle_group = 'cardio' WHERE name ILIKE '%jumping jack%';
UPDATE exercises SET muscle_group = 'cardio' WHERE name ILIKE '%skipping%';
UPDATE exercises SET muscle_group = 'cardio' WHERE name ILIKE '%caminata%' OR name ILIKE '%trote%';
UPDATE exercises SET muscle_group = 'cardio' WHERE name ILIKE '%battle rope%';
UPDATE exercises SET muscle_group = 'cardio' WHERE name ILIKE '%thruster%';
UPDATE exercises SET muscle_group = 'cardio' WHERE name ILIKE '%cooldown%';

-- Catch-all: any remaining null exercises, set as general
UPDATE exercises SET muscle_group = 'chest' WHERE muscle_group IS NULL AND name ILIKE '%pecho%';
UPDATE exercises SET muscle_group = 'back' WHERE muscle_group IS NULL AND name ILIKE '%espalda%';

-- Verify
SELECT muscle_group, COUNT(*) as total FROM exercises GROUP BY muscle_group ORDER BY total DESC;
