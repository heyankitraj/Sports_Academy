'use client';

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import AuthProvider from './AuthProvider';

export default function ReduxProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </Provider>
  );
}
