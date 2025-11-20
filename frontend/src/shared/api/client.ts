import axios, { AxiosError } from 'axios';
import { useNotificationStore } from '../store/notificationStore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  console.log('[API Request]', config.method?.toUpperCase(), config.url, config.params);
  
  // Obtener token del localStorage (donde zustand persist lo guarda)
  try {
    const authStorage = localStorage.getItem('confiatrade-auth');
    if (authStorage) {
      const { state } = JSON.parse(authStorage);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
  } catch (error) {
    console.error('[Auth] Error reading token:', error);
  }
  
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.log('[API Response]', response.status, response.config.url, 'Data keys:', Object.keys(response.data || {}));
    return response;
  },
  (error: AxiosError<any>) => {
    console.error('[API Error]', error.config?.url, error.response?.status, error.message);
    const notify = useNotificationStore.getState().add;
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      let message = data?.message || 'Ha ocurrido un error';
      
      if (status === 401) {
        message = 'Sesión expirada';
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (status === 403) {
        message = 'No tienes permisos';
      } else if (status === 404) {
        message = 'Recurso no encontrado';
      } else if (status === 422) {
        message = data?.details?.validation_errors?.[0]?.message || 'Error de validación';
      } else if (status === 409) {
        message = data?.message || 'El registro ya existe';
      } else if (status >= 500) {
        message = 'Error del servidor';
      }
      
      notify({
        type: 'error',
        message,
        title: `Error ${status}`,
      });
    } else if (error.request) {
      notify({
        type: 'error',
        message: 'No se pudo conectar con el servidor',
        title: 'Error de conexión',
      });
    }
    
    return Promise.reject(error);
  }
);
