import React from 'react';
import { FileText } from 'lucide-react';
interface EmptyStateProps {
  message: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}
export const EmptyState = ({
  message,
  description,
  icon = <FileText className="h-8 w-8 text-gray-400" />,
  className = ''
}: EmptyStateProps) => {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-gray-700 font-medium mb-1">{message}</h3>
      {description &&
      <p className="text-sm text-gray-500 max-w-md mx-auto">{description}</p>
      }
    </div>);

};