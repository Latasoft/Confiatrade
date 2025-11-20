import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`text-center py-16 px-4 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl border-2 border-dashed border-gray-400 ${className}`}
    >
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-white rounded-full border-2 border-gray-300">
          <Icon className="text-gray-500" size={48} />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-700 mb-6 max-w-md mx-auto">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
