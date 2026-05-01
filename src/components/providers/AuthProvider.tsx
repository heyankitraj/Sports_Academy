'use client';

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { loginSuccess, setLoading } from '@/store/slices/authSlice';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    // On app mount, check if there's a saved user in localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch(loginSuccess(user));
      } catch (err) {
        localStorage.removeItem('user');
        dispatch(setLoading(false));
      }
    } else {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  return <>{children}</>;
}
