import React from 'react';
interface IconTextProps {
  icon: ReactNode;
  text: string;
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}
export const IconText = ({
  icon,
  text,
  className = '',
  iconClassName = 'h-4 w-4 mr-1.5',
  textClassName = ''
}: IconTextProps) => {
  return (
    <div className={`flex items-center ${className}`}>
      <span className={iconClassName}>{icon}</span>
      <span className={textClassName}>{text}</span>
    </div>);

};