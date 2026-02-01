import React from 'react';
import {
  Baby,
  Heart,
  Church,
  GraduationCap,
  PartyPopper,
  Users,
  Megaphone } from
'lucide-react';
export const AnnouncementTypesTabs = ({ activeType, onTypeChange }) => {
  const types = [
  {
    id: 'all',
    label: 'All',
    icon: <Users className="h-4 w-4" />,
    emoji: '🔍'
  },
  {
    id: 'birth',
    label: 'Births',
    icon: <Baby className="h-4 w-4" />,
    emoji: '🎂'
  },
  {
    id: 'engagement',
    label: 'Engagements',
    icon: <Heart className="h-4 w-4" />,
    emoji: '💑'
  },
  {
    id: 'wedding',
    label: 'Weddings',
    icon: <Church className="h-4 w-4" />,
    emoji: '💒'
  },
  {
    id: 'graduation',
    label: 'Graduations',
    icon: <GraduationCap className="h-4 w-4" />,
    emoji: '🎓'
  },
  {
    id: 'celebration',
    label: 'Celebrations',
    icon: <PartyPopper className="h-4 w-4" />,
    emoji: '🎉'
  },
  {
    id: 'obituary',
    label: 'Obituaries',
    icon: <span className="text-sm">🕊️</span>,
    emoji: '💔'
  },
  {
    id: 'general',
    label: 'General',
    icon: <Megaphone className="h-4 w-4" />,
    emoji: '📢'
  }];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 mb-8">
      <div className="flex flex-wrap">
        {types.map((type) =>
        <button
          key={type.id}
          onClick={() => onTypeChange(type.id)}
          className={`flex items-center px-4 py-2.5 rounded-md text-sm font-medium mr-2 mb-2 transition-colors ${activeType === type.id ? getActiveStyles(type.id) : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>

            <span className="mr-2 text-lg">{type.emoji}</span>
            {type.label}
          </button>
        )}
      </div>
    </div>);

};
// Helper function to get type-specific styles
const getActiveStyles = (type) => {
  switch (type) {
    case 'birth':
      return 'bg-blue-100 text-blue-700 border-l-4 border-blue-500';
    case 'engagement':
      return 'bg-pink-100 text-pink-700 border-l-4 border-pink-500';
    case 'wedding':
      return 'bg-purple-100 text-purple-700 border-l-4 border-purple-500';
    case 'graduation':
      return 'bg-green-100 text-green-700 border-l-4 border-green-500';
    case 'celebration':
      return 'bg-yellow-100 text-yellow-700 border-l-4 border-yellow-500';
    case 'obituary':
      return 'bg-gray-200 text-gray-700 border-l-4 border-gray-500';
    case 'general':
      return 'bg-orange-100 text-orange-700 border-l-4 border-orange-500';
    case 'all':
    default:
      return 'bg-news-primary text-white border-l-4 border-news-primary-dark';
  }
};