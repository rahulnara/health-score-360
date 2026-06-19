export type Gender = 'female' | 'male' | 'other';
export type Frequency = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
export type Habit = 'none' | 'light' | 'moderate' | 'high';

export interface HealthInputs {
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number;
  waistCm: number;
  dailySteps: number;
  exerciseFrequency: Frequency;
  sleepHours: number;
  waterLiters: number;
  restingHeartRate: number;
  systolic: number;
  diastolic: number;
  bloodSugarMgDl: number | null;
  smoking: Habit;
  alcohol: Habit;
  stressLevel: number;
  coachPrompt: string;
}

export interface ScoreBreakdown {
  fitness: number;
  nutrition: number;
  recovery: number;
  cardiovascular: number;
  longevity: number;
}

export interface RiskIndicators {
  obesity: number;
  diabetes: number;
  heartDisease: number;
  hypertension: number;
}

export interface NutritionTargets {
  bmr: number;
  tdee: number;
  caloriesForLoss: number;
  caloriesForMaintenance: number;
  caloriesForGain: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
}

export interface BodyComposition {
  bmi: number;
  bodyFatPercent: number;
  leanMassKg: number;
  idealWeightLow: number;
  idealWeightHigh: number;
}

export interface HealthResult {
  overallScore: number;
  biologicalAge: number;
  breakdown: ScoreBreakdown;
  risks: RiskIndicators;
  recommendations: string[];
  coachInsights: string[];
  nutrition: NutritionTargets;
  bodyComposition: BodyComposition;
}

export interface TrendEntry {
  id: string;
  date: string;
  weightKg: number;
  bmi: number;
  score: number;
  systolic: number;
  diastolic: number;
}
