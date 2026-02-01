import React from 'react';
interface SimpleHeroSectionProps {
  title?: string;
  subtitle?: string;
  className?: string;
  bgColor?: string;
  textColor?: string;
}
export const SimpleHeroSection = ({
  title,
  subtitle,
  className = '',
  bgColor = 'bg-news-primary',
  textColor = 'text-black'
}: SimpleHeroSectionProps) => {
  return (
    <div className={`${bgColor} py-8 ${className}`}>
      <div className="container mx-auto px-4 text-center">
        {title &&
        <h1 className={`text-3xl font-bold ${textColor} font-display`}>
            {title}
          </h1>
        }
        {subtitle && <p className="text-lg mt-2 text-gray-800">{subtitle}</p>}
      </div>
    </div>);

};