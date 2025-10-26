import { createContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import type { User } from '@/types';

import { getIsAuth, signInUser } from '../api/auth';
import { useNotification } from '../hooks';

const defaultAuthInfo = {
  profile: null as User | null,
  isLoggedIn: false,
  isPending: false,
  error: '',
};

interface AuthContext {
  authInfo: {
    profile: User | null;
    isLoggedIn: boolean;
    isPending: boolean;
    error: string;
  };
  handleLogin: (email: string, password: string) => Promise<void>;
  handleLogout: () => void;
  isAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContext | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [authInfo, setAuthInfo] = useState({ ...defaultAuthInfo });
  const { updateNotification } = useNotification();

  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    setAuthInfo({ ...authInfo, isPending: true });
    const { data, error } = await signInUser({ email, password });
    if (error || !data) {
      updateNotification('error', error || 'Error');
      return setAuthInfo({
        ...authInfo,
        isPending: false,
        error: error || 'Error',
      });
    }

    navigate('/', { replace: true });
    setAuthInfo({
      profile: { ...data },
      isPending: false,
      isLoggedIn: true,
      error: '',
    });

    localStorage.setItem('auth-token', data.token);
  };

  const isAuth = async () => {
    const token = localStorage.getItem('auth-token');
    if (!token) return;

    setAuthInfo({ ...authInfo, isPending: true });
    const { data, error } = await getIsAuth(token);
    if (error || !data) {
      updateNotification('error', error || 'Error');
      return setAuthInfo({
        ...authInfo,
        isPending: false,
        error: error || 'Error',
      });
    }

    setAuthInfo({
      profile: { ...data },
      isLoggedIn: true,
      isPending: false,
      error: '',
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('auth-token');
    setAuthInfo({ ...defaultAuthInfo });
  };

  useEffect(() => {
    isAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ authInfo, handleLogin, handleLogout, isAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}
