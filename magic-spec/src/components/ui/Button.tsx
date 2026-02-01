import React from 'react';
type ButtonVariant =
'primary' |
'secondary' |
'outline' |
'ghost' |
'link' |
'danger';
type ButtonSize = 'sm' | 'md' | 'lg';
interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
  fullWidth = false
}: ButtonProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-news-primary text-white hover:bg-news-primary-dark';
      case 'secondary':
        return 'bg-gray-200 text-gray-800 hover:bg-gray-300';
      case 'outline':
        return 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50';
      case 'ghost':
        return 'bg-transparent text-gray-700 hover:bg-gray-100';
      case 'link':
        return 'bg-transparent text-news-primary hover:underline p-0';
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700';
      default:
        return 'bg-news-primary text-white hover:bg-news-primary-dark';
    }
  };
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };
  const getIconSpacing = () => {
    return iconPosition === 'left' ? 'mr-1.5' : 'ml-1.5';
  };
  return (
    <button
      type={type}
      className={`
        ${getVariantClasses()} 
        ${getSizeClasses()} 
        ${fullWidth ? 'w-full' : ''} 
        ${variant !== 'link' ? 'rounded-md' : ''} 
        font-medium 
        transition-colors 
        flex 
        items-center 
        justify-center
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      onClick={onClick}
      disabled={disabled}>

      {icon && iconPosition === 'left' &&
      <span className={getIconSpacing()}>{icon}</span>
      }
      {children}
      {icon && iconPosition === 'right' &&
      <span className={getIconSpacing()}>{icon}</span>
      }
    </button>);

};