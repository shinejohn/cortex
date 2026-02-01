import React from 'react';
import {
  Search,
  Newspaper,
  Calendar,
  Store,
  User,
  Tag,
  TrendingUp } from
'lucide-react';
export const SearchSuggestions = ({ onSuggestionClick }) => {
  const popularSearches = [
  'farmers market',
  'school board meeting',
  'road construction',
  'local elections',
  'community events',
  'property taxes',
  'high school sports'];

  const categories = [
  {
    icon: <Newspaper className="h-5 w-5" />,
    name: 'Local News',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    name: 'Upcoming Events',
    color: 'bg-green-50 text-green-600'
  },
  {
    icon: <Store className="h-5 w-5" />,
    name: 'Businesses',
    color: 'bg-purple-50 text-purple-600'
  },
  {
    icon: <User className="h-5 w-5" />,
    name: 'People',
    color: 'bg-indigo-50 text-indigo-600'
  },
  {
    icon: <Tag className="h-5 w-5" />,
    name: 'Topics',
    color: 'bg-yellow-50 text-yellow-600'
  }];

  const trendingTopics = [
  {
    name: 'Downtown Development',
    count: 27
  },
  {
    name: 'School District',
    count: 19
  },
  {
    name: 'Local Elections',
    count: 14
  },
  {
    name: 'Beach Cleanup',
    count: 11
  },
  {
    name: 'Road Construction',
    count: 8
  }];

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Popular Searches
        </h2>
        <div className="flex flex-wrap gap-2">
          {popularSearches.map((search, index) =>
          <button
            key={index}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-full"
            onClick={() => onSuggestionClick(search)}>

              {search}
            </button>
          )}
        </div>
      </div>
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category, index) =>
          <button
            key={index}
            className={`flex flex-col items-center justify-center p-4 rounded-lg ${category.color} hover:shadow-sm transition-shadow`}
            onClick={() => onSuggestionClick(category.name)}>

              <div className="mb-2">{category.icon}</div>
              <span className="font-medium text-sm">{category.name}</span>
            </button>
          )}
        </div>
      </div>
      <div>
        <div className="flex items-center mb-4">
          <TrendingUp className="h-5 w-5 text-news-primary mr-2" />
          <h2 className="text-lg font-bold text-gray-900">
            Trending in Your Community
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {trendingTopics.map((topic, index) =>
          <button
            key={index}
            className="flex justify-between items-center bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-3"
            onClick={() => onSuggestionClick(topic.name)}>

              <span className="font-medium text-gray-800">{topic.name}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {topic.count} new
              </span>
            </button>
          )}
        </div>
      </div>
    </div>);

};