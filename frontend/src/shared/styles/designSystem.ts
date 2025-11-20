// Tailwind CSS Design System - Confiatrade Platform

export const colors = {
  // Primary - Blue gradient
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  // Success - Green
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  // Warning - Amber
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
  },
  // Error - Red
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
  },
  // Neutral
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
};

export const shadows = {
  sm: 'shadow-sm', // 0 1px 2px 0 rgb(0 0 0 / 0.05)
  DEFAULT: 'shadow', // 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
  md: 'shadow-md', // 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
  lg: 'shadow-lg', // 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
  xl: 'shadow-xl', // 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)
  '2xl': 'shadow-2xl', // 0 25px 50px -12px rgb(0 0 0 / 0.25)
};

export const borders = {
  DEFAULT: 'border border-gray-200',
  thick: 'border-2 border-gray-200',
  primary: 'border border-blue-200',
  success: 'border border-green-200',
  warning: 'border border-amber-200',
  error: 'border border-red-200',
};

export const spacing = {
  card: 'p-6',
  cardCompact: 'p-4',
  section: 'space-y-6',
  stack: 'space-y-4',
  row: 'space-x-4',
};

export const typography = {
  h1: 'text-3xl font-bold text-gray-900',
  h2: 'text-2xl font-bold text-gray-900',
  h3: 'text-xl font-semibold text-gray-900',
  body: 'text-base text-gray-700',
  small: 'text-sm text-gray-600',
  tiny: 'text-xs text-gray-500',
  label: 'text-sm font-medium text-gray-700',
};

export const components = {
  card: 'bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200',
  cardInteractive: 'bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200',
  badge: {
    success: 'px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-medium rounded-full',
    warning: 'px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium rounded-full',
    error: 'px-3 py-1 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-full',
    info: 'px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium rounded-full',
    neutral: 'px-3 py-1 bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium rounded-full',
  },
  button: {
    primary: 'px-4 py-2 bg-blue-600 border border-blue-700 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors duration-150 shadow-sm',
    secondary: 'px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors duration-150',
    success: 'px-4 py-2 bg-green-600 border border-green-700 text-white rounded-lg hover:bg-green-700 transition-colors duration-150 shadow-sm',
    danger: 'px-4 py-2 bg-red-600 border border-red-700 text-white rounded-lg hover:bg-red-700 transition-colors duration-150 shadow-sm',
    ghost: 'px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-150',
  },
  input: 'w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150',
  statCard: 'bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200',
};

export const iconColors = {
  primary: 'text-blue-600',
  success: 'text-green-600',
  warning: 'text-amber-600',
  error: 'text-red-600',
  neutral: 'text-gray-600',
};

export const iconBackgrounds = {
  primary: 'bg-blue-100 border border-blue-200',
  success: 'bg-green-100 border border-green-200',
  warning: 'bg-amber-100 border border-amber-200',
  error: 'bg-red-100 border border-red-200',
  neutral: 'bg-gray-100 border border-gray-200',
};
