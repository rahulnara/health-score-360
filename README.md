# Health Score 360

A React + TypeScript web app that calculates a whole-body health score from lifestyle and biometric inputs. It includes disease risk indicators, nutrition targets, trend tracking, a future health simulator, and an AI-style health coach.

**Repository:** https://github.com/rahulnara/health-score-360

**URL:** https://health-score-360.vercel.app/

## Features

- Overall health score (0–100) with category breakdown: fitness, nutrition, recovery, cardiovascular, longevity
- Biological age estimate vs actual age
- Disease risk indicators (obesity, diabetes, heart disease, hypertension)
- Personalized recommendations and coach insights
- Nutrition calculator (BMR, TDEE, macros)
- Body composition (BMI, body fat %, lean mass, ideal weight range)
- Future health simulator (sleep, steps, weight sliders)
- Trend charts for score, weight/BMI, and calorie burn
- Gamification badges
- Profile persistence via `localStorage.`

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | React 19 |
| State | Redux Toolkit |
| Charts | Recharts |
| Build | Vite 6 |
| Language | TypeScript |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173) after running `npm run dev`.

## Code Structure

```
health-score-360/
├── index.html              # App entry HTML
├── package.json            # Dependencies and npm scripts
├── vite.config.ts          # Vite dev/preview server config (host: 127.0.0.1)
├── tsconfig.json           # TypeScript config
├── tsconfig.node.json      # TypeScript config for Vite/Node
├── dist/                   # Production build output (after npm run build)
└── src/
    ├── main.tsx            # React root mount + Redux Provider
    ├── App.tsx             # Main UI: inputs, dashboard, charts, simulator
    ├── healthCalculator.ts # Health score, nutrition, risk, and simulation logic
    ├── healthSlice.ts      # Redux slice: inputs, trends, localStorage persistence
    ├── store.ts            # Redux store setup and state subscription
    ├── types.ts            # Shared TypeScript interfaces and enums
    └── styles.css          # Global layout and component styles
```

## Module Overview

### `src/main.tsx`
Bootstraps the app with `ReactDOM.createRoot`, wraps `App` in the Redux `Provider`, and loads global styles.

### `src/App.tsx`
Single-page dashboard with two main areas:

- **Input panel** — profile fields (age, gender, vitals, habits, stress)
- **Dashboard** — score hero, metric cards, risk list, recommendations, nutrition/body composition, AI coach, future simulator, trend charts, badges

Uses `useMemo` to derive `calculateHealth` and `simulateFuture` results from Redux state.

### `src/healthCalculator.ts`
Core business logic:

- `defaultInputs` — initial profile values
- `calculateHealth()` — overall score, breakdown, risks, recommendations, coach insights, nutrition, body composition
- `simulateFuture()` — compares current vs projected health after habit changes
- `calculateBmi()` — exported BMI helper

### `src/healthSlice.ts`
Redux state for:

- `inputs` — `HealthInputs` profile data
- `trendEntries` — saved snapshots for charts
- `simulator` — sleep, steps, and weight slider values

Actions: `setNumericInput`, `setGender`, `setFrequency`, `setHabit`, `setCoachPrompt`, `setSimulatorValue`, `saveSnapshot`, `resetProfile`.

Persists to `localStorage` under key `health-score-360-state`.

### `src/store.ts`
Configures the Redux store with the `health` reducer and auto-persists state on every change.

### `src/types.ts`
Type definitions:

- Enums: `Gender`, `Frequency`, `Habit`
- Interfaces: `HealthInputs`, `HealthResult`, `ScoreBreakdown`, `RiskIndicators`, `NutritionTargets`, `BodyComposition`, `TrendEntry`

## Data Flow

```
User input (App.tsx)
    ↓ dispatch
healthSlice (Redux)
    ↓ useSelector
App.tsx → calculateHealth() / simulateFuture()
    ↓
Dashboard UI + Recharts
    ↓
store.subscribe → persistState() → localStorage
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server at `http://127.0.0.1:5173` |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve production build locally |

## Disclaimer

Risk estimates and recommendations are educational only and are not a medical diagnosis. Consult a healthcare professional for medical advice.
