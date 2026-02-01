import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
  showClearButton?: boolean;
  rounded?: 'full' | 'md' | 'lg';
  size?: 'sm' | 'md' | 'lg';
}
export const SearchInput = ({
  placeholder = 'Search...',
  value,
  onChange,
  onSubmit,
  className = '',
  showClearButton = true,
  rounded = 'full',
  size = 'md'
}: SearchInputProps) => {
  const getRoundedClass = () => {
    switch (rounded) {
      case 'full':
        return 'rounded-full';
      case 'md':
        return 'rounded-md';
      case 'lg':
        return 'rounded-lg';
      default:
        return 'rounded-full';
    }
  };
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'py-1.5 pl-8 pr-8 text-sm';
      case 'md':
        return 'py-2 pl-10 pr-10 text-sm';
      case 'lg':
        return 'py-3 pl-12 pr-12 text-base';
      default:
        return 'py-2 pl-10 pr-10 text-sm';
    }
  };
  const getIconSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4 left-3';
      case 'md':
        return 'h-5 w-5 left-4';
      case 'lg':
        return 'h-5 w-5 left-4';
      default:
        return 'h-5 w-5 left-4';
    }
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e);
    }
  };
  const handleClear = () => {
    onChange('');
  };
  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${getRoundedClass()} ${getSizeClass()} border border-gray-300 focus:outline-none focus:ring-2 focus:ring-news-primary`} />

      <Search
        className={`absolute ${getIconSizeClass()} top-1/2 transform -translate-y-1/2 text-gray-400`} />

      {showClearButton && value &&
      <button
        type="button"
        onClick={handleClear}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">

          <X className="h-4 w-4" />
        </button>
      }
    </form>);

};