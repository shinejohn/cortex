import React from 'react';
export const SimpleHeroSection = ({ title, subtitle }) => {
  return (
    <div className="bg-news-primary py-8">
      <div className="container mx-auto px-4 text-center">
        {title &&
        <h1 className="text-3xl font-bold text-black font-display">
            {title}
          </h1>
        }
        {subtitle && <p className="text-lg mt-2 text-gray-800">{subtitle}</p>}
      </div>
    </div>);

};