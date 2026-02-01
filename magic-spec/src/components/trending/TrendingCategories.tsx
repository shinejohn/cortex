import React from 'react';
import { ArrowUp, ArrowDown, Hash } from 'lucide-react';
export const TrendingCategories = ({ categories, timePeriod }) => {
  // Function to get color class based on category color
  const getCategoryColorClass = (color) => {
    const colorMap = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      teal: 'bg-teal-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500'
    };
    return colorMap[color] || 'bg-gray-500';
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-900 flex items-center">
          <Hash className="h-5 w-5 mr-2 text-news-primary" />
          Trending Categories
        </h3>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {categories.map((category) =>
          <div key={category.id} className="flex items-center">
              {/* Category color indicator */}
              <div
              className={`w-1 h-10 ${getCategoryColorClass(category.color)} rounded-full mr-3`}>
            </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <div className="font-medium text-gray-900">
                    {category.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {category.percentage}%
                  </div>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full">
                  <div
                  className={`absolute top-0 left-0 h-full ${getCategoryColorClass(category.color)} rounded-full`}
                  style={{
                    width: `${category.percentage}%`
                  }}>
                </div>
                </div>
              </div>
              {/* Trend indicator */}
              <div
              className={`ml-3 flex items-center ${category.direction === 'up' ? 'text-green-600' : 'text-red-600'} text-xs`}>

                {category.direction === 'up' ?
              <ArrowUp className="h-3 w-3 mr-1" /> :

              <ArrowDown className="h-3 w-3 mr-1" />
              }
                <span>{category.percentChange}%</span>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">
          {getTimeLabel(timePeriod)}
        </div>
      </div>
    </div>);

};
// Helper function to get time label
const getTimeLabel = (timePeriod) => {
  switch (timePeriod) {
    case 'now':
      return 'Based on current activity';
    case 'today':
      return "Based on today's activity";
    case 'week':
      return "Based on this week's activity";
    case 'month':
      return "Based on this month's activity";
    default:
      return 'Based on current activity';
  }
};