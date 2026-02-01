import React from 'react';
import { Edit } from 'lucide-react';
interface InfoFieldProps {
  icon: ReactNode;
  label: string;
  value: string;
  privacy?: string;
  onEdit?: () => void;
  onChange?: (value: string) => void;
  className?: string;
}
export const InfoField = ({
  icon,
  label,
  value,
  privacy,
  onEdit,
  onChange,
  className = ''
}: InfoFieldProps) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center flex-1">
        <div className="mr-3">{icon}</div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">{label}</label>
          <input
            type="text"
            value={value}
            placeholder={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            className="w-full text-sm text-gray-700 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none py-1" />

        </div>
      </div>
      <div className="flex items-center ml-4">
        {privacy && <div className="text-xs text-gray-500">{privacy}</div>}
        <button
          className="ml-2 text-blue-500 hover:text-blue-600"
          onClick={onEdit}>

          <Edit className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>);

};