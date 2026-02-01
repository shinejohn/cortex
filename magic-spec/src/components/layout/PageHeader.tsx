import React from 'react';
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}
export const PageHeader = ({
  title,
  subtitle,
  actions,
  className = ''
}: PageHeaderProps) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {actions &&
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
            {actions}
          </div>
        }
      </div>
    </div>);

};