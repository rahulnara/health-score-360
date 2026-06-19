import type { BodyComposition, Frequency, Habit, HealthInputs, HealthResult, NutritionTargets } from './types';

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const round = (value: number, digits = 0) => Number(value.toFixed(digits));

const activityFactor: Record<Frequency, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

const exerciseScore: Record<Frequency, number> = {
  sedentary: 35,
  light: 58,
  moderate: 78,
  active: 92,
  athlete: 96,
};

const habitPenalty: Record<Habit, number> = {
  none: 0,
  light: 8,
  moderate: 18,
  high: 32,
};

const scoreRange = (value: number, idealLow: number, idealHigh: number, penaltyPerUnit: number) => {
  if (value >= idealLow && value <= idealHigh) return 100;
  const distance = value < idealLow ? idealLow - value : value - idealHigh;
  return clamp(100 - distance * penaltyPerUnit);
};

export const defaultInputs: HealthInputs = {
  age: 35,
  gender: 'male',
  heightCm: 175,
  weightKg: 78,
  waistCm: 88,
  dailySteps: 6500,
  exerciseFrequency: 'moderate',
  sleepHours: 6.5,
  waterLiters: 2.1,
  restingHeartRate: 68,
  systolic: 122,
  diastolic: 78,
  bloodSugarMgDl: null,
  smoking: 'none',
  alcohol: 'light',
  stressLevel: 5,
  coachPrompt: 'I feel tired all day',
};

export const calculateBmi = (heightCm: number, weightKg: number) => weightKg / (heightCm / 100) ** 2;

const calculateBodyComposition = (input: HealthInputs): BodyComposition => {
  const bmi = calculateBmi(input.heightCm, input.weightKg);
  const genderAdjust = input.gender === 'male' ? 16.2 : input.gender === 'female' ? 5.4 : 10.8;
  const bodyFatPercent = clamp(1.2 * bmi + 0.23 * input.age - genderAdjust, 5, 55);
  const leanMassKg = input.weightKg * (1 - bodyFatPercent / 100);
  const heightM2 = (input.heightCm / 100) ** 2;

  return {
    bmi: round(bmi, 1),
    bodyFatPercent: round(bodyFatPercent, 1),
    leanMassKg: round(leanMassKg, 1),
    idealWeightLow: round(18.5 * heightM2, 1),
    idealWeightHigh: round(24.9 * heightM2, 1),
  };
};

const calculateNutrition = (input: HealthInputs): NutritionTargets => {
  const genderOffset = input.gender === 'female' ? -161 : input.gender === 'male' ? 5 : -78;
  const bmr = 10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age + genderOffset;
  const tdee = bmr * activityFactor[input.exerciseFrequency];
  const proteinG = input.weightKg * (input.exerciseFrequency === 'sedentary' ? 1.2 : 1.7);
  const fatG = (tdee * 0.28) / 9;
  const carbsG = (tdee - proteinG * 4 - fatG * 9) / 4;

  return {
    bmr: round(bmr),
    tdee: round(tdee),
    caloriesForLoss: round(tdee - 450),
    caloriesForMaintenance: round(tdee),
    caloriesForGain: round(tdee + 300),
    proteinG: round(proteinG),
    fatG: round(fatG),
    carbsG: round(carbsG),
  };
};

const buildRecommendations = (input: HealthInputs, resultBits: { bmi: number; score: number }) => {
  const items = [];

  if (input.sleepHours < 7) items.push(`Increase sleep by ${round(7.5 - input.sleepHours, 1)} hour${7.5 - input.sleepHours > 1 ? 's' : ''}.`);
  if (input.dailySteps < 9000) items.push(`Walk ${Math.ceil((9000 - input.dailySteps) / 500) * 500} more steps daily.`);
  if (input.waterLiters < 2.5) items.push(`Drink ${round(2.5 - input.waterLiters, 1)} L more water each day.`);
  if (input.stressLevel > 6) items.push('Add a 10 minute breathing, mobility, or outdoor break to lower stress load.');
  if (input.systolic >= 130 || input.diastolic >= 85) items.push('Monitor blood pressure and reduce sodium, alcohol, and missed workouts.');
  if (input.restingHeartRate > 75) items.push('Build more zone 2 cardio to improve resting heart rate.');
  if (resultBits.bmi >= 25) items.push('Target gradual weight loss with a 300-500 calorie deficit and higher protein meals.');
  if (input.bloodSugarMgDl && input.bloodSugarMgDl >= 100) items.push('Reduce added sugar and pair carbs with protein or fiber.');
  if (input.smoking !== 'none') items.push('Create a smoking reduction plan with professional support.');
  if (input.alcohol === 'high' || input.alcohol === 'moderate') items.push('Limit alcohol frequency to improve sleep, blood pressure, and recovery.');

  if (!items.length) items.push('Maintain your current habits and retest monthly to catch trend changes early.');
  if (resultBits.score >= 85) items.push('You are in a strong range; focus on consistency over aggressive changes.');

  return items.slice(0, 6);
};

const buildCoachInsights = (input: HealthInputs) => {
  const prompt = input.coachPrompt.toLowerCase();
  const insights = [];

  if (prompt.includes('tired') || prompt.includes('fatigue') || prompt.includes('sleepy')) {
    if (input.sleepHours < 7) insights.push('Your tiredness may be linked to short sleep. Try moving bedtime 30 minutes earlier this week.');
    if (input.waterLiters < 2.3) insights.push('Hydration is below target, which can amplify low energy and headaches.');
    if (input.dailySteps < 6000) insights.push('A short morning walk can improve alertness without needing a hard workout.');
    if (input.stressLevel > 6) insights.push('High stress can make normal sleep feel less restorative. Add a wind-down routine before bed.');
  }

  if (prompt.includes('weight') || prompt.includes('fat')) {
    insights.push('Use the calorie target and protein goal below as the starting point for body composition changes.');
  }

  if (prompt.includes('stress') || prompt.includes('anxious')) {
    insights.push('Your stress slider is part of the recovery score. Lowering it by two points meaningfully improves the simulation.');
  }

  if (!insights.length) {
    insights.push('Based on your profile, start with the lowest scoring category and change one habit for 14 days.');
  }

  return insights.slice(0, 4);
};

export const calculateHealth = (input: HealthInputs): HealthResult => {
  const bodyComposition = calculateBodyComposition(input);
  const nutrition = calculateNutrition(input);
  const waistLimit = input.gender === 'female' ? 80 : 94;
  const waistScore = scoreRange(input.waistCm, 0, waistLimit, 2.1);
  const bmiScore = scoreRange(bodyComposition.bmi, 18.5, 24.9, 7);
  const stepScore = clamp((input.dailySteps / 10000) * 100);
  const hydrationScore = scoreRange(input.waterLiters, 2.2, 3.4, 28);
  const sleepScore = scoreRange(input.sleepHours, 7, 8.5, 20);
  const stressScore = clamp(105 - input.stressLevel * 10);
  const heartRateScore = scoreRange(input.restingHeartRate, 50, 68, 2.8);
  const bpScore = Math.min(scoreRange(input.systolic, 95, 120, 2.3), scoreRange(input.diastolic, 60, 80, 3));
  const sugarScore = input.bloodSugarMgDl ? scoreRange(input.bloodSugarMgDl, 70, 99, 2.5) : 78;
  const habitScore = clamp(100 - habitPenalty[input.smoking] - habitPenalty[input.alcohol] * 0.7);

  const breakdown = {
    fitness: round(stepScore * 0.42 + exerciseScore[input.exerciseFrequency] * 0.38 + heartRateScore * 0.2),
    nutrition: round(bmiScore * 0.35 + waistScore * 0.28 + hydrationScore * 0.18 + sugarScore * 0.19),
    recovery: round(sleepScore * 0.58 + stressScore * 0.3 + habitScore * 0.12),
    cardiovascular: round(bpScore * 0.45 + heartRateScore * 0.25 + stepScore * 0.18 + habitScore * 0.12),
    longevity: round(exerciseScore[input.exerciseFrequency] * 0.25 + sleepScore * 0.2 + habitScore * 0.25 + bmiScore * 0.15 + bpScore * 0.15),
  };

  const overallScore = round(
    breakdown.fitness * 0.24 +
      breakdown.nutrition * 0.22 +
      breakdown.recovery * 0.2 +
      breakdown.cardiovascular * 0.22 +
      breakdown.longevity * 0.12,
  );

  const riskBase = {
    obesity: clamp(100 - (bmiScore * 0.55 + waistScore * 0.45)),
    diabetes: clamp(100 - (sugarScore * 0.42 + bmiScore * 0.25 + stepScore * 0.18 + waistScore * 0.15)),
    heartDisease: clamp(100 - (bpScore * 0.36 + heartRateScore * 0.22 + habitScore * 0.22 + stepScore * 0.2)),
    hypertension: clamp(100 - (bpScore * 0.7 + habitScore * 0.15 + stressScore * 0.15)),
  };

  const ageDelta = (72 - overallScore) * 0.12 + (input.smoking === 'high' ? 4 : 0) + (input.sleepHours >= 7.5 ? -1.8 : 0);

  return {
    overallScore,
    biologicalAge: Math.max(18, round(input.age + ageDelta)),
    breakdown,
    risks: {
      obesity: round(riskBase.obesity),
      diabetes: round(riskBase.diabetes),
      heartDisease: round(riskBase.heartDisease),
      hypertension: round(riskBase.hypertension),
    },
    recommendations: buildRecommendations(input, { bmi: bodyComposition.bmi, score: overallScore }),
    coachInsights: buildCoachInsights(input),
    nutrition,
    bodyComposition,
  };
};

export const simulateFuture = (base: HealthInputs, overrides: Partial<HealthInputs>) => {
  const future = calculateHealth({ ...base, ...overrides });
  const current = calculateHealth(base);

  return {
    future,
    scoreDelta: future.overallScore - current.overallScore,
    ageDelta: current.biologicalAge - future.biologicalAge,
    riskDelta: {
      obesity: current.risks.obesity - future.risks.obesity,
      diabetes: current.risks.diabetes - future.risks.diabetes,
      heartDisease: current.risks.heartDisease - future.risks.heartDisease,
      hypertension: current.risks.hypertension - future.risks.hypertension,
    },
  };
};
