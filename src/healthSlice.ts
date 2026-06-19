import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { calculateHealth, defaultInputs } from './healthCalculator';
import type { Frequency, Gender, Habit, HealthInputs, TrendEntry } from './types';

const storageKey = 'health-score-360-state';

type NumericField = {
  [K in keyof HealthInputs]: HealthInputs[K] extends number | null ? K : never;
}[keyof HealthInputs];

interface SimulatorState {
  sleepHours: number;
  dailySteps: number;
  weightKg: number;
}

interface HealthState {
  inputs: HealthInputs;
  trendEntries: TrendEntry[];
  simulator: SimulatorState;
}

const makeTrendEntry = (inputs: HealthInputs): TrendEntry => {
  const result = calculateHealth(inputs);
  return {
    id: new Date().toISOString(),
    date: new Date().toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    weightKg: inputs.weightKg,
    bmi: result.bodyComposition.bmi,
    score: result.overallScore,
    systolic: inputs.systolic,
    diastolic: inputs.diastolic,
  };
};

const demoTrendEntries: TrendEntry[] = [
  { id: 'demo-1', date: 'Jan', weightKg: 84, bmi: 27.4, score: 62, systolic: 132, diastolic: 86 },
  { id: 'demo-2', date: 'Feb', weightKg: 82, bmi: 26.8, score: 66, systolic: 129, diastolic: 84 },
  { id: 'demo-3', date: 'Mar', weightKg: 80, bmi: 26.1, score: 70, systolic: 126, diastolic: 82 },
  { id: 'demo-4', date: 'Apr', weightKg: 79, bmi: 25.8, score: 73, systolic: 124, diastolic: 80 },
];

const loadInitialState = (): HealthState => {
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) return JSON.parse(saved) as HealthState;
  } catch {
    // Ignore invalid browser storage and continue with defaults.
  }

  return {
    inputs: defaultInputs,
    trendEntries: demoTrendEntries,
    simulator: {
      sleepHours: 8,
      dailySteps: 10000,
      weightKg: 75,
    },
  };
};

const slice = createSlice({
  name: 'health',
  initialState: loadInitialState,
  reducers: {
    setNumericInput(state, action: PayloadAction<{ field: NumericField; value: number | null }>) {
      (state.inputs[action.payload.field] as number | null) = action.payload.value;
    },
    setGender(state, action: PayloadAction<Gender>) {
      state.inputs.gender = action.payload;
    },
    setFrequency(state, action: PayloadAction<Frequency>) {
      state.inputs.exerciseFrequency = action.payload;
    },
    setHabit(state, action: PayloadAction<{ field: 'smoking' | 'alcohol'; value: Habit }>) {
      state.inputs[action.payload.field] = action.payload.value;
    },
    setCoachPrompt(state, action: PayloadAction<string>) {
      state.inputs.coachPrompt = action.payload;
    },
    saveSnapshot(state) {
      state.trendEntries = [...state.trendEntries, makeTrendEntry(state.inputs)].slice(-12);
    },
    resetProfile(state) {
      state.inputs = defaultInputs;
    },
    setSimulatorValue(state, action: PayloadAction<{ field: keyof SimulatorState; value: number }>) {
      state.simulator[action.payload.field] = action.payload.value;
    },
  },
});

export const {
  resetProfile,
  saveSnapshot,
  setCoachPrompt,
  setFrequency,
  setGender,
  setHabit,
  setNumericInput,
  setSimulatorValue,
} = slice.actions;

export const persistState = (state: HealthState) => {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Local storage may be disabled; calculations still work without persistence.
  }
};

export default slice.reducer;
