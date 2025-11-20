import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Usuario } from '../api/authApi';

interface AuthState {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isEmpresa: boolean;
  
  setAuth: (user: Usuario, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Usuario) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isEmpresa: false,

      setAuth: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          isAdmin: user.rol === 'admin',
          isEmpresa: user.rol === 'empresa',
        }),

      clearAuth: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
          isEmpresa: false,
        }),

      updateUser: (user) =>
        set({
          user,
          isAdmin: user.rol === 'admin',
          isEmpresa: user.rol === 'empresa',
        }),
    }),
    {
      name: 'confiatrade-auth',
    }
  )
);
