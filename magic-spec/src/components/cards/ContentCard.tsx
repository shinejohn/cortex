import React from 'react';
interface ContentCardProps {
  title: string;
  type?: string;
  icon?: ReactNode;
  date: string;
  author?: string;
  className?: string;
  onClick?: () => void;
}
export const ContentCard = ({
  title,
  type,
  icon,
  date,
  author,
  className = '',
  onClick
}: ContentCardProps) => {
  return (
    <div
      className={`flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}>

      {icon &&
      <div className="bg-white p-2 rounded-md shadow-sm mr-3">{icon}</div>
      }
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-800 text-sm truncate">{title}</h3>
        <div className="flex items-center mt-1">
          <span className="text-xs text-gray-500">{date}</span>
          {author &&
          <>
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-xs text-gray-500">By {author}</span>
            </>
          }
        </div>
      </div>
      {type &&
      <div className="flex items-center">
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full capitalize">
            {type}
          </span>
        </div>
      }
    </div>);

};