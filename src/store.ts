import { configureStore } from '@reduxjs/toolkit';
import healthReducer, { persistState } from './healthSlice';

export const store = configureStore({
  reducer: {
    health: healthReducer,
  },
});

store.subscribe(() => {
  persistState(store.getState().health);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
