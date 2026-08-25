import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { tokenStorage } from '../api/client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (loginInput: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, phone: string, password: string, relationship?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfileState: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const storedToken = await tokenStorage.getToken();
      if (storedToken) {
        setToken(storedToken);
        const res = await api.get('/me');
        if (res.data?.user) {
          setUser(res.data.user);
        }
      }
    } catch (err) {
      console.warn('Auth check error:', err);
      await tokenStorage.removeToken();
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (loginInput: string, password: string) => {
    try {
      const res = await api.post('/login', {
        login: loginInput,
        password: password,
        device_name: 'react-native-mobile',
      });

      if (res.data?.token && res.data?.user) {
        await tokenStorage.setToken(res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, message: res.data.message };
      }

      return { success: false, message: 'લૉગિન નિષ્ફળ રહ્યું.' };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.login?.[0] || 'લૉગિન કરવામાં ભૂલ આવી.';
      return { success: false, message: msg };
    }
  };

  const register = async (name: string, phone: string, password: string, relationship?: string) => {
    try {
      const res = await api.post('/register', {
        name,
        phone,
        password,
        relationship: relationship || 'સભ્ય',
        device_name: 'react-native-mobile',
      });

      if (res.data?.token && res.data?.user) {
        await tokenStorage.setToken(res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, message: res.data.message };
      }

      return { success: false, message: 'રજિસ્ટ્રેશન નિષ્ફળ રહ્યું.' };
    } catch (err: any) {
      const msg = err.response?.data?.message ||
        err.response?.data?.errors?.phone?.[0] ||
        err.response?.data?.errors?.name?.[0] ||
        err.response?.data?.errors?.password?.[0] ||
        'રજિસ્ટ્રેશન કરવામાં ભૂલ આવી.';
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      // ignore
    } finally {
      await tokenStorage.removeToken();
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/me');
      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch (e) {
      console.warn('Error refreshing user:', e);
    }
  };

  const updateProfileState = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
