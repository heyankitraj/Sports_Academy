import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

// Make sure to export a function instead of a single store instance for SSR compatibility (if applicable)
// But since we're using Context, we can just export a singleton store.
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;