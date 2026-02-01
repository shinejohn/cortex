import React from 'react';
interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionClick?: () => void;
  className?: string;
  underlined?: boolean;
}
export const SectionHeader = ({
  title,
  actionLabel,
  onActionClick,
  className = '',
  underlined = true
}: SectionHeaderProps) => {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <h2
        className={`font-display text-xl font-bold text-news-primary ${underlined ? 'border-b-2 border-news-primary inline-block' : ''}`}>

        {title}
      </h2>
      {actionLabel &&
      <button
        onClick={onActionClick}
        className="text-sm text-news-primary font-medium hover:underline">

          {actionLabel}
        </button>
      }
    </div>);

};