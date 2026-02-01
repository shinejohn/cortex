import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
interface SectionCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  count?: number | null;
  className?: string;
}
export const SectionCard = ({
  title,
  icon,
  children,
  isOpen,
  onToggle,
  count = null,
  className = ''
}: SectionCardProps) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm mb-6 overflow-hidden ${className}`}>

      <div
        className="flex items-center justify-between p-5 cursor-pointer border-b border-gray-100"
        onClick={onToggle}>

        <div className="flex items-center">
          {icon && <div className="mr-3">{icon}</div>}
          <h2 className="font-semibold text-gray-800">{title}</h2>
          {count !== null &&
          <div className="ml-2 bg-gray-100 text-gray-600 text-xs font-medium rounded-full px-2 py-0.5">
              {count}
            </div>
          }
        </div>
        <div className="flex items-center">
          <button className="text-gray-400 hover:text-gray-600 p-1">
            {isOpen ?
            <ChevronUp className="h-5 w-5" /> :

            <ChevronDown className="h-5 w-5" />
            }
          </button>
        </div>
      </div>
      {isOpen && <div className="p-5">{children}</div>}
    </div>);

};