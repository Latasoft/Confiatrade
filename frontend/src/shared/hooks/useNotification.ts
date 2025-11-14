import { useNotificationStore, type NotificationType } from '../store/notificationStore';

interface NotificationOptions {
  title?: string;
  duration?: number;
}

export const useNotification = () => {
  const add = useNotificationStore((state) => state.add);
  
  const notify = (message: string, type: NotificationType = 'info', options?: NotificationOptions) => {
    add({
      message,
      type,
      ...options,
    });
  };
  
  const success = (message: string, options?: NotificationOptions) => {
    notify(message, 'success', options);
  };
  
  const error = (message: string, options?: NotificationOptions) => {
    notify(message, 'error', options);
  };
  
  const warning = (message: string, options?: NotificationOptions) => {
    notify(message, 'warning', options);
  };
  
  const info = (message: string, options?: NotificationOptions) => {
    notify(message, 'info', options);
  };
  
  return {
    notify,
    success,
    error,
    warning,
    info,
  };
};
