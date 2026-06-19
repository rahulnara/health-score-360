import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { calculateHealth, simulateFuture } from './healthCalculator';
import {
  resetProfile,
  saveSnapshot,
  setCoachPrompt,
  setFrequency,
  setGender,
  setHabit,
  setNumericInput,
  setSimulatorValue,
} from './healthSlice';
import type { Frequency, Gender, Habit, HealthInputs } from './types';
import type { AppDispatch, RootState } from './store';

const scoreLabels = [
  ['Fitness', 'fitness'],
  ['Nutrition', 'nutrition'],
  ['Recovery', 'recovery'],
  ['Cardio', 'cardiovascular'],
  ['Longevity', 'longevity'],
] as const;

const riskLabels = [
  ['Obesity', 'obesity'],
  ['Diabetes', 'diabetes'],
  ['Heart disease', 'heartDisease'],
  ['Hypertension', 'hypertension'],
] as const;

const frequencyOptions: { label: string; value: Frequency }[] = [
  { label: 'Sedentary', value: 'sedentary' },
  { label: 'Light', value: 'light' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'Active', value: 'active' },
  { label: 'Athlete', value: 'athlete' },
];

const habitOptions: { label: string; value: Habit }[] = [
  { label: 'None', value: 'none' },
  { label: 'Light', value: 'light' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'High', value: 'high' },
];

function NumberField({
  label,
  field,
  min,
  max,
  step = 1,
  suffix,
}: {
  label: string;
  field: keyof HealthInputs;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const value = useSelector((state: RootState) => state.health.inputs[field]) as number | null;

  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-unit">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value ?? ''}
          placeholder="Optional"
          onChange={(event) =>
            dispatch(setNumericInput({ field: field as never, value: event.target.value === '' ? null : Number(event.target.value) }))
          }
        />
        {suffix ? <small>{suffix}</small> : null}
      </div>
    </label>
  );
}

function Meter({ value, tone = 'green' }: { value: number; tone?: 'green' | 'amber' | 'red' }) {
  return (
    <div className={`meter ${tone}`}>
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { inputs, trendEntries, simulator } = useSelector((state: RootState) => state.health);
  const result = useMemo(() => calculateHealth(inputs), [inputs]);
  const simulation = useMemo(
    () =>
      simulateFuture(inputs, {
        sleepHours: simulator.sleepHours,
        dailySteps: simulator.dailySteps,
        weightKg: simulator.weightKg,
      }),
    [inputs, simulator],
  );

  const scoreChart = scoreLabels.map(([label, key]) => ({ label, score: result.breakdown[key] }));
  const calorieChart = trendEntries.map((entry) => ({
    date: entry.date,
    burn: Math.round(result.nutrition.tdee + (entry.score - result.overallScore) * 18),
  }));
  const riskTone = (value: number) => (value > 60 ? 'red' : value > 32 ? 'amber' : 'green');

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Health Score 360</p>
          <h1>Whole-body health calculator with trends and future simulation.</h1>
        </div>
        <div className="auth-actions" aria-label="Authentication options">
          <button type="button">Email Login</button>
          <button type="button">Google Login</button>
        </div>
      </header>

      <section className="workspace">
        <aside className="input-panel" aria-label="Health profile inputs">
          <div className="panel-title">
            <h2>Your profile</h2>
            <button type="button" onClick={() => dispatch(resetProfile())}>
              Reset
            </button>
          </div>

          <div className="field-grid">
            <NumberField label="Age" field="age" min={18} max={95} suffix="yrs" />
            <label className="field">
              <span>Gender</span>
              <select value={inputs.gender} onChange={(event) => dispatch(setGender(event.target.value as Gender))}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </label>
            <NumberField label="Height" field="heightCm" min={120} max={230} suffix="cm" />
            <NumberField label="Weight" field="weightKg" min={35} max={220} step={0.1} suffix="kg" />
            <NumberField label="Waist" field="waistCm" min={45} max={180} suffix="cm" />
            <NumberField label="Daily steps" field="dailySteps" min={0} max={40000} suffix="steps" />
            <label className="field wide">
              <span>Exercise frequency</span>
              <select value={inputs.exerciseFrequency} onChange={(event) => dispatch(setFrequency(event.target.value as Frequency))}>
                {frequencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <NumberField label="Sleep" field="sleepHours" min={0} max={14} step={0.5} suffix="hrs" />
            <NumberField label="Water intake" field="waterLiters" min={0} max={8} step={0.1} suffix="L" />
            <NumberField label="Resting heart rate" field="restingHeartRate" min={35} max={140} suffix="bpm" />
            <NumberField label="Systolic BP" field="systolic" min={80} max={220} suffix="mmHg" />
            <NumberField label="Diastolic BP" field="diastolic" min={45} max={140} suffix="mmHg" />
            <NumberField label="Blood sugar" field="bloodSugarMgDl" min={50} max={300} suffix="mg/dL" />
            <label className="field">
              <span>Smoking</span>
              <select value={inputs.smoking} onChange={(event) => dispatch(setHabit({ field: 'smoking', value: event.target.value as Habit }))}>
                {habitOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Alcohol</span>
              <select value={inputs.alcohol} onChange={(event) => dispatch(setHabit({ field: 'alcohol', value: event.target.value as Habit }))}>
                {habitOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field wide">
              <span>Stress level: {inputs.stressLevel}/10</span>
              <input
                type="range"
                min={1}
                max={10}
                value={inputs.stressLevel}
                onChange={(event) => dispatch(setNumericInput({ field: 'stressLevel', value: Number(event.target.value) }))}
              />
            </label>
          </div>

          <button className="primary-action" type="button" onClick={() => dispatch(saveSnapshot())}>
            Save trend snapshot
          </button>
        </aside>

        <section className="dashboard" aria-label="Health results">
          <section className="score-hero">
            <div>
              <p className="eyebrow">Final health score</p>
              <strong>{result.overallScore}/100</strong>
              <span>Estimated health age: {result.biologicalAge} vs actual age {inputs.age}</span>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={scoreChart}>
                <CartesianGrid vertical={false} stroke="#d8e1dc" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} hide />
                <Tooltip cursor={{ fill: '#eef6f3' }} />
                <Bar dataKey="score" fill="#25776b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>

          <section className="metric-grid">
            {scoreLabels.map(([label, key]) => (
              <article className="metric-card" key={key}>
                <span>{label}</span>
                <strong>{result.breakdown[key]}/100</strong>
                <Meter value={result.breakdown[key]} />
              </article>
            ))}
          </section>

          <section className="two-column">
            <article className="panel">
              <h2>Disease risk indicators</h2>
              <p className="helper">Risk estimates are educational and are not a medical diagnosis.</p>
              <div className="risk-list">
                {riskLabels.map(([label, key]) => (
                  <div className="risk-row" key={key}>
                    <span>{label}</span>
                    <strong>{result.risks[key]}%</strong>
                    <Meter value={result.risks[key]} tone={riskTone(result.risks[key])} />
                  </div>
                ))}
              </div>
            </article>

            <article className="panel">
              <h2>Personalized recommendations</h2>
              <ul className="recommendations">
                {result.recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="two-column">
            <article className="panel">
              <h2>Nutrition calculator</h2>
              <div className="nutrition-grid">
                <span>BMR <strong>{result.nutrition.bmr}</strong></span>
                <span>TDEE <strong>{result.nutrition.tdee}</strong></span>
                <span>Loss <strong>{result.nutrition.caloriesForLoss}</strong></span>
                <span>Maintain <strong>{result.nutrition.caloriesForMaintenance}</strong></span>
                <span>Protein <strong>{result.nutrition.proteinG}g</strong></span>
                <span>Fat <strong>{result.nutrition.fatG}g</strong></span>
                <span>Carbs <strong>{result.nutrition.carbsG}g</strong></span>
              </div>
            </article>

            <article className="panel">
              <h2>Body composition</h2>
              <div className="nutrition-grid">
                <span>BMI <strong>{result.bodyComposition.bmi}</strong></span>
                <span>Body fat <strong>{result.bodyComposition.bodyFatPercent}%</strong></span>
                <span>Lean mass <strong>{result.bodyComposition.leanMassKg}kg</strong></span>
                <span>Ideal weight <strong>{result.bodyComposition.idealWeightLow}-{result.bodyComposition.idealWeightHigh}kg</strong></span>
              </div>
            </article>
          </section>

          <section className="panel">
            <h2>AI health coach</h2>
            <textarea
              value={inputs.coachPrompt}
              onChange={(event) => dispatch(setCoachPrompt(event.target.value))}
              aria-label="Tell the health coach how you feel"
            />
            <div className="coach-list">
              {result.coachInsights.map((insight) => (
                <p key={insight}>{insight}</p>
              ))}
            </div>
          </section>

          <section className="panel simulator">
            <div>
              <h2>Future health simulator</h2>
              <p className="helper">Move habits and see estimated score, age, and risk changes.</p>
            </div>
            <div className="slider-grid">
              <label>
                Sleep: {simulator.sleepHours}h
                <input
                  type="range"
                  min={4}
                  max={10}
                  step={0.5}
                  value={simulator.sleepHours}
                  onChange={(event) => dispatch(setSimulatorValue({ field: 'sleepHours', value: Number(event.target.value) }))}
                />
              </label>
              <label>
                Steps: {simulator.dailySteps.toLocaleString()}
                <input
                  type="range"
                  min={1000}
                  max={18000}
                  step={500}
                  value={simulator.dailySteps}
                  onChange={(event) => dispatch(setSimulatorValue({ field: 'dailySteps', value: Number(event.target.value) }))}
                />
              </label>
              <label>
                Weight: {simulator.weightKg}kg
                <input
                  type="range"
                  min={45}
                  max={140}
                  step={1}
                  value={simulator.weightKg}
                  onChange={(event) => dispatch(setSimulatorValue({ field: 'weightKg', value: Number(event.target.value) }))}
                />
              </label>
            </div>
            <div className="simulation-results">
              <span>Score change <strong>{simulation.scoreDelta >= 0 ? '+' : ''}{simulation.scoreDelta}</strong></span>
              <span>Biological age improvement <strong>{simulation.ageDelta >= 0 ? '+' : ''}{simulation.ageDelta}</strong></span>
              <span>Heart risk reduction <strong>{simulation.riskDelta.heartDisease}%</strong></span>
              <span>Diabetes risk reduction <strong>{simulation.riskDelta.diabetes}%</strong></span>
            </div>
          </section>

          <section className="charts">
            <article className="panel chart-panel">
              <h2>Health score trend</h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendEntries}>
                  <CartesianGrid vertical={false} stroke="#d8e1dc" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="score" stroke="#25776b" fill="#b8ddd5" />
                </AreaChart>
              </ResponsiveContainer>
            </article>
            <article className="panel chart-panel">
              <h2>Weight and BMI trend</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendEntries}>
                  <CartesianGrid vertical={false} stroke="#d8e1dc" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="weightKg" stroke="#315b7d" strokeWidth={3} />
                  <Line type="monotone" dataKey="bmi" stroke="#c06b3e" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </article>
            <article className="panel chart-panel">
              <h2>Calorie burn trend</h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={calorieChart}>
                  <CartesianGrid vertical={false} stroke="#d8e1dc" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="burn" stroke="#8a5a20" fill="#ead2a6" />
                </AreaChart>
              </ResponsiveContainer>
            </article>
          </section>

          <section className="badges" aria-label="Gamification badges">
            <span className={inputs.dailySteps >= 10000 ? 'earned' : ''}>10k Steps Champion</span>
            <span className={inputs.sleepHours >= 7.5 ? 'earned' : ''}>Sleep Master</span>
            <span className={inputs.waterLiters >= 2.5 ? 'earned' : ''}>Hydration Hero</span>
            <span className={result.breakdown.longevity >= 82 ? 'earned' : ''}>Longevity Builder</span>
          </section>
        </section>
      </section>
    </main>
  );
}

export default App;
