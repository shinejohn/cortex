import React, { useState } from 'react';
import {
  Calendar,
  Filter,
  Music,
  Users,
  DollarSign,
  Ticket,
  Utensils } from
'lucide-react';
export const EventFiltersBar = ({ activeFilter, setActiveFilter }) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const filters = [
  {
    id: 'today',
    label: 'Today',
    icon: <Calendar className="h-4 w-4" />
  },
  {
    id: 'weekend',
    label: 'This Weekend',
    icon: <Calendar className="h-4 w-4" />
  },
  {
    id: 'free',
    label: 'Free',
    icon: <DollarSign className="h-4 w-4" />
  },
  {
    id: 'family',
    label: 'Family',
    icon: <Users className="h-4 w-4" />
  },
  {
    id: 'music',
    label: 'Music',
    icon: <Music className="h-4 w-4" />
  },
  {
    id: 'sports',
    label: 'Sports',
    icon: <Ticket className="h-4 w-4" />
  },
  {
    id: 'food',
    label: 'Food',
    icon: <Utensils className="h-4 w-4" />
  }];

  const handleFilterClick = (filterId) => {
    setActiveFilter(activeFilter === filterId ? 'all' : filterId);
  };
  const toggleAdvancedFilters = () => {
    setShowAdvancedFilters(!showAdvancedFilters);
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {filters.map((filter) =>
        <button
          key={filter.id}
          onClick={() => handleFilterClick(filter.id)}
          className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${activeFilter === filter.id ? 'bg-news-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>

            <span className="mr-1.5">{filter.icon}</span>
            {filter.label}
          </button>
        )}
        <button
          onClick={toggleAdvancedFilters}
          className="flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 whitespace-nowrap">

          <Filter className="h-4 w-4 mr-1.5" />
          Advanced Filters
        </button>
      </div>
      {/* Advanced filters panel */}
      {showAdvancedFilters &&
      <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Price range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Range
            </label>
            <select className="w-full rounded-md border border-gray-300 py-1.5 px-3 text-sm">
              <option value="any">Any Price</option>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
              <option value="under-10">Under $10</option>
              <option value="10-25">$10 - $25</option>
              <option value="25-50">$25 - $50</option>
              <option value="over-50">Over $50</option>
            </select>
          </div>
          {/* Date range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select className="w-full rounded-md border border-gray-300 py-1.5 px-3 text-sm">
              <option value="any">Any Date</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="this-week">This Week</option>
              <option value="this-weekend">This Weekend</option>
              <option value="next-week">Next Week</option>
              <option value="next-month">Next Month</option>
            </select>
          </div>
          {/* Event type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select className="w-full rounded-md border border-gray-300 py-1.5 px-3 text-sm">
              <option value="any">All Types</option>
              <option value="music">Music</option>
              <option value="arts">Arts & Culture</option>
              <option value="sports">Sports</option>
              <option value="food">Food & Drink</option>
              <option value="family">Family</option>
              <option value="education">Education</option>
              <option value="charity">Charity & Causes</option>
            </select>
          </div>
        </div>
      }
    </div>);

};