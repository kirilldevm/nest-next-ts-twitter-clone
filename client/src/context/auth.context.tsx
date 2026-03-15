'use client';

import { ENDPOINTS } from '@/config/endpoints.config';
import { auth } from '@/config/firebase.config';
import { type User } from '@/types';
import api from '@/lib/api';
import { signOut } from 'firebase/auth';
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signin: (data: { user: User; token: string }) => Promise<void>;
  updateUser: (user: User) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signin: async () => {},
  updateUser: () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signin = async (data: { user: User; token: string }) => {
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const updateUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);

      const userInfo = localStorage.getItem('user');
      const token = localStorage.getItem('token');

      if (userInfo && token) {
        try {
          const user = JSON.parse(userInfo) as User;
          await api.get(ENDPOINTS.USER.BY_ID(user.id));
          setUser(user);
        } catch {
          await signOut(auth);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        if (userInfo || token) {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
        setUser(null);
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  // Force logout if token is not present
  useEffect(() => {
    const handleLogout = () => {
      logout();
    };

    window.addEventListener('force-logout', handleLogout);

    return () => {
      window.removeEventListener('force-logout', handleLogout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signin, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
