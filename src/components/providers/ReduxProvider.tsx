'use client';

import { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import AuthProvider from './AuthProvider';

import Navbar from '../Navbar';

export default function ReduxProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <Navbar />
        {children}
      </AuthProvider>
    </Provider>
  );
}
