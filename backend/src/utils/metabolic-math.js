/**
 * Metabolic calculation engine — ported from TypeScript
 * Original: metabolic-math.ts
 */

function getActivityMultiplier(level) {
  switch (level) {
    case 1: return 1.2;    // Sedentary
    case 2: return 1.375;  // Light
    case 3: return 1.55;   // Moderate
    case 4: return 1.725;  // Very Active
    case 5: return 1.9;    // Extra Active
    case 6: return 2.2;    // Professional Athlete
    default: return 1.2;
  }
}

export function calculateBMI(weight, height) {
  const hM = height / 100;
  return weight / (hM * hM);
}

function calcNavyBF(data) {
  const { sex, waist, neck, height, hip } = data;
  const waistIn = waist / 2.54;
  const neckIn = neck / 2.54;
  const heightIn = height / 2.54;
  const hipIn = (hip || waist) / 2.54;

  if (sex === 'M') {
    return 86.010 * Math.log10(waistIn - neckIn) - 70.041 * Math.log10(heightIn) + 36.76;
  } else {
    return 163.205 * Math.log10(waistIn + hipIn - neckIn) - 97.684 * Math.log10(heightIn) - 78.387;
  }
}

function calcDuerenbergBF(bmi, age, sex) {
  const s = sex === 'M' ? 1 : 0;
  return (1.20 * bmi) + (0.23 * age) - (10.8 * s) - 5.4;
}

function calcHumeLBM(weight, height, sex) {
  if (sex === 'M') {
    return (0.32810 * weight) + (0.33929 * height) - 29.5336;
  } else {
    return (0.29569 * weight) + (0.41813 * height) - 43.2933;
  }
}

function calculateBoneMass(lbm) {
  return lbm * 0.15;
}

function calculateMuscleMass(lbm) {
  const residualMass = lbm * 0.241;
  const boneMass = calculateBoneMass(lbm);
  return lbm - boneMass - residualMass;
}

function calcMifflin(weight, height, age, sex) {
  const base = (10 * weight) + (6.25 * height) - (5 * age);
  return sex === 'M' ? base + 5 : base - 161;
}

function calcCunningham(ffm) {
  return 500 + (22 * ffm);
}

function calcTinsleyFFM(ffm) {
  return (25.9 * ffm) + 284;
}

function calcTinsleyWeight(weight) {
  return (24.8 * weight) + 10;
}

export function calculateMetabolicData(data) {
  const { weight, height, age, sex, activityLevel } = data;

  if (!weight || !height || !age) {
    return createEmptyResults();
  }

  const bmi = calculateBMI(weight, height);
  const af = getActivityMultiplier(activityLevel);

  // Body Composition
  const navyBF = calcNavyBF(data);
  const navyFM = weight * (navyBF / 100);
  const navyLBM = weight - navyFM;

  const duerBF = calcDuerenbergBF(bmi, age, sex);
  const duerFM = weight * (duerBF / 100);
  const duerLBM = weight - duerFM;

  const humeLBM = calcHumeLBM(weight, height, sex);
  const humeFM = weight - humeLBM;
  const humeBF = (humeFM / weight) * 100;

  const methods = [navyBF, duerBF, humeBF].filter(v => !isNaN(v) && isFinite(v));
  const avgBF = methods.length > 0 ? methods.reduce((a, b) => a + b, 0) / methods.length : 0;
  const avgLBM = weight * (1 - avgBF / 100);

  const boneMass = calculateBoneMass(avgLBM);
  const muscleMass = calculateMuscleMass(avgLBM);

  // Energy
  const mifflinRMR = calcMifflin(weight, height, age, sex);
  const cunninghamRMR = calcCunningham(avgLBM);
  const tinsleyFFMRMR = calcTinsleyFFM(avgLBM);
  const tinsleyWeightRMR = calcTinsleyWeight(weight);

  const rmrList = [mifflinRMR, cunninghamRMR, tinsleyFFMRMR, tinsleyWeightRMR].filter(v => !isNaN(v));
  const avgRMR = rmrList.length > 0 ? rmrList.reduce((a, b) => a + b, 0) / rmrList.length : 0;
  const tdee = avgRMR * af;
  const eta = tdee * 0.10;

  return {
    energyMethods: {
      mifflin: { method: 'Mifflin-St Jeor', rmr: mifflinRMR, tdee: mifflinRMR * af },
      cunningham: { method: 'Cunningham', rmr: cunninghamRMR, tdee: cunninghamRMR * af },
      tinsleyFFM: { method: 'Tinsley (FFM)', rmr: tinsleyFFMRMR, tdee: tinsleyFFMRMR * af },
      tinsleyWeight: { method: 'Tinsley (Peso)', rmr: tinsleyWeightRMR, tdee: tinsleyWeightRMR * af },
    },
    averageRMR: avgRMR,
    averageTDEE: tdee,
    eta,
    bmi,
    compositionMethods: {
      navy: { method: 'US Navy', percentage: navyBF, fatMassKg: navyFM, leanMassKg: navyLBM },
      duerenberg: { method: 'Duerenberg', percentage: duerBF, fatMassKg: duerFM, leanMassKg: duerLBM },
      hume: { method: 'Hume & Weyers', percentage: humeBF, fatMassKg: humeFM, leanMassKg: humeLBM },
      rfm: { method: 'Promedio', percentage: avgBF, fatMassKg: weight * (avgBF / 100), leanMassKg: avgLBM },
    },
    humeLBM,
    averageBodyFatPercentage: avgBF,
    averageFatMassKg: weight * (avgBF / 100),
    averageLeanMassKg: avgLBM,
    boneMassKg: boneMass,
    muscleMassKg: muscleMass,
  };
}

function createEmptyResults() {
  const emptyEnergy = { method: '-', rmr: 0, tdee: 0 };
  const emptyComp = { method: '-', percentage: 0, fatMassKg: 0, leanMassKg: 0 };
  return {
    energyMethods: { mifflin: emptyEnergy, cunningham: emptyEnergy, tinsleyFFM: emptyEnergy, tinsleyWeight: emptyEnergy },
    averageRMR: 0, averageTDEE: 0, eta: 0, bmi: 0,
    compositionMethods: { navy: emptyComp, duerenberg: emptyComp, hume: emptyComp, rfm: emptyComp },
    humeLBM: 0, averageBodyFatPercentage: 0, averageFatMassKg: 0, averageLeanMassKg: 0,
    boneMassKg: 0, muscleMassKg: 0,
  };
}
