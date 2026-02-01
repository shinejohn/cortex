import React, { cloneElement } from 'react';
import {
  Music,
  Utensils,
  Trophy,
  Palette,
  Users,
  GraduationCap,
  Briefcase,
  Heart,
  CalendarDays } from
'lucide-react';
export type EventType =
'all' |
'music' |
'food' |
'sports' |
'arts' |
'family' |
'education' |
'business' |
'community';
interface EventTypeFiltersProps {
  activeType: EventType;
  onTypeChange: (type: EventType) => void;
}
export const EventTypeFilters: React.FC<EventTypeFiltersProps> = ({
  activeType,
  onTypeChange
}) => {
  const eventTypes = [
  {
    id: 'all',
    label: 'All Events',
    icon: <CalendarDays />,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'music',
    label: 'Music & Concerts',
    icon: <Music />,
    color: 'bg-purple-100 text-purple-600'
  },
  {
    id: 'food',
    label: 'Food & Drink',
    icon: <Utensils />,
    color: 'bg-orange-100 text-orange-600'
  },
  {
    id: 'sports',
    label: 'Sports & Fitness',
    icon: <Trophy />,
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'arts',
    label: 'Arts & Culture',
    icon: <Palette />,
    color: 'bg-pink-100 text-pink-600'
  },
  {
    id: 'family',
    label: 'Family & Kids',
    icon: <Users />,
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    id: 'education',
    label: 'Education & Learning',
    icon: <GraduationCap />,
    color: 'bg-indigo-100 text-indigo-600'
  },
  {
    id: 'business',
    label: 'Business & Networking',
    icon: <Briefcase />,
    color: 'bg-gray-100 text-gray-600'
  },
  {
    id: 'community',
    label: 'Community & Volunteer',
    icon: <Heart />,
    color: 'bg-red-100 text-red-600'
  }];

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        Browse by Event Type
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
        {eventTypes.map((type) =>
        <button
          key={type.id}
          onClick={() => onTypeChange(type.id as EventType)}
          className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${activeType === type.id ? `${type.color} shadow-md border-2 border-opacity-50 border-current` : 'bg-white text-gray-600 border border-gray-200 hover:border-current hover:shadow-sm'}`}
          aria-pressed={activeType === type.id}>

            <div
            className={`p-2 rounded-full mb-2 ${activeType === type.id ? type.color : 'bg-gray-100'}`}>

              {cloneElement(type.icon, {
              size: 20,
              className: activeType === type.id ? '' : 'text-gray-500'
            })}
            </div>
            <span className="text-xs font-medium text-center">
              {type.label}
            </span>
          </button>
        )}
      </div>
    </div>);

};