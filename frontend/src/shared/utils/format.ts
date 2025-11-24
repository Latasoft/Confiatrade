import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | undefined | null): string {
  if (!date) return 'Fecha no disponible';
  
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return 'Fecha inválida';
  
  return parsedDate.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
