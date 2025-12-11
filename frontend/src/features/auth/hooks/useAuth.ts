import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { authApi, type LoginData, type RegistroEmpresaData, type CambiarPasswordData } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: (response) => {
      console.log('[LOGIN] Usuario:', response.user);
      console.log('[LOGIN] Rol:', response.user.rol);
      console.log('[LOGIN] Permisos:', response.user.permisos);
      
      setAuth(response.user, response.access_token);
      
      // Redirigir según el rol
      if (response.user.rol === 'admin') {
        navigate('/');
      } else if (response.user.rol === 'empresa') {
        navigate('/empresa/dashboard');
      } else {
        // Roles personalizados o organizador van al inicio
        navigate('/');
      }
    },
  });
}

export function useRegistroEmpresa() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegistroEmpresaData) => authApi.registroEmpresa(data),
    onSuccess: (response) => {
      setAuth(response.user, response.access_token);
      navigate('/empresa/dashboard');
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return () => {
    clearAuth();
    queryClient.clear();
    navigate('/login');
  };
}

export function usePerfil() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateUser = useAuthStore((state) => state.updateUser);

  const query = useQuery({
    queryKey: ['perfil'],
    queryFn: authApi.getPerfil,
    enabled: isAuthenticated,
  });

  // Actualizar usuario cuando hay datos (usar useEffect para evitar setState durante render)
  useEffect(() => {
    if (query.data) {
      updateUser({
        id: query.data.id,
        email: query.data.email,
        nombre_completo: query.data.nombre_completo,
        rol: query.data.rol,
        empresa_id: query.data.empresa?.id || null,
        activo: query.data.activo,
        created_at: query.data.created_at,
        permisos: query.data.permisos,
      });
    }
  }, [query.data, updateUser]);

  return query;
}

export function useCambiarPassword() {
  return useMutation({
    mutationFn: (data: CambiarPasswordData) => authApi.cambiarPassword(data),
  });
}

export function useVerificarToken() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const query = useQuery({
    queryKey: ['verificar-token'],
    queryFn: authApi.verificarToken,
    enabled: isAuthenticated && !!token,
    retry: false,
  });

  // Si hay error, limpiar auth (usar useEffect para evitar setState durante render)
  useEffect(() => {
    if (query.isError) {
      clearAuth();
    }
  }, [query.isError, clearAuth]);

  return query;
}
