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
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
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
