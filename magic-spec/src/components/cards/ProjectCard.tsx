import React from 'react';
import { ExternalLink } from 'lucide-react';
interface ProjectCardProps {
  title: string;
  description: string;
  image: string;
  status: 'Active' | 'Planning' | 'Completed' | string;
  lastUpdated: string;
  type: string;
  icon: ReactNode;
  onViewClick?: () => void;
  onEditClick?: () => void;
  className?: string;
}
export const ProjectCard = ({
  title,
  description,
  image,
  status,
  lastUpdated,
  type,
  icon,
  onViewClick,
  onEditClick,
  className = ''
}: ProjectCardProps) => {
  const getStatusClasses = () => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Planning':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };
  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden ${className}`}>

      <div className="h-36 overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center mb-2">
            <div className="bg-indigo-50 p-1.5 rounded-md mr-2">{icon}</div>
            <h3 className="font-medium text-gray-900">{title}</h3>
          </div>
          <div
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClasses()}`}>

            {status}
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>Updated: {lastUpdated}</span>
          <span className="bg-gray-100 px-2 py-1 rounded-md">{type}</span>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between">
          <button
            className="text-xs text-indigo-600 font-medium flex items-center"
            onClick={onViewClick}>

            View Project <ExternalLink className="h-3 w-3 ml-1" />
          </button>
          <button
            className="text-xs text-gray-600 font-medium"
            onClick={onEditClick}>

            Edit
          </button>
        </div>
      </div>
    </div>);

};