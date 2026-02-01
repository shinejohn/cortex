import React from 'react';
import { Calendar, Filter } from 'lucide-react';
export const SearchFilters = ({
  activeFilter,
  timeFilter,
  onFilterChange,
  onTimeFilterChange
}) => {
  const contentFilters = [
  {
    id: 'all',
    label: 'All'
  },
  {
    id: 'news',
    label: 'News'
  },
  {
    id: 'events',
    label: 'Events'
  },
  {
    id: 'businesses',
    label: 'Businesses'
  },
  {
    id: 'people',
    label: 'People'
  },
  {
    id: 'deals',
    label: 'Deals'
  }];

  const timeFilters = [
  {
    id: 'any',
    label: 'Any Time'
  },
  {
    id: 'today',
    label: 'Today'
  },
  {
    id: 'week',
    label: 'This Week'
  },
  {
    id: 'month',
    label: 'This Month'
  },
  {
    id: 'year',
    label: 'This Year'
  }];

  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Content Type Filters */}
        <div className="flex items-center overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          <div className="flex items-center bg-white rounded-full shadow-sm border border-gray-200 p-1">
            {contentFilters.map((filter) =>
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap ${activeFilter === filter.id ? 'bg-news-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>

                {filter.label}
              </button>
            )}
          </div>
        </div>
        {/* Time Filters */}
        <div className="flex items-center overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          <div className="flex items-center bg-white rounded-full shadow-sm border border-gray-200 p-1">
            <div className="px-3 py-1.5 text-sm text-gray-500 flex items-center border-r border-gray-200">
              <Calendar className="h-4 w-4 mr-1.5" />
              <span>Time:</span>
            </div>
            {timeFilters.map((filter) =>
            <button
              key={filter.id}
              onClick={() => onTimeFilterChange(filter.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap ${timeFilter === filter.id ? 'bg-news-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>

                {filter.label}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>);

};