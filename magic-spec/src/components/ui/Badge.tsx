import React from 'react';
type BadgeVariant =
'default' |
'primary' |
'secondary' |
'success' |
'warning' |
'danger' |
'info' |
'category' |
'condition' |
'status';
interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}
export const Badge = ({
  children,
  variant = 'default',
  className = ''
}: BadgeProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-news-primary text-white';
      case 'secondary':
        return 'bg-gray-200 text-gray-700';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'danger':
        return 'bg-red-100 text-red-700';
      case 'info':
        return 'bg-blue-100 text-blue-700';
      case 'category':
        return 'bg-blue-100 text-blue-700';
      case 'condition':
        return 'bg-gray-100 text-gray-700';
      case 'status':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getVariantClasses()} ${className}`}>

      {children}
    </span>);

};