import React from 'react';
import {
  TrendingUp,
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Share2,
  Clock,
  Eye,
  Activity } from
'lucide-react';
export const TrendingStoriesGrid = ({ stories, timePeriod }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-900 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-news-primary" />
          Trending Stories
        </h3>
      </div>
      <div className="divide-y divide-gray-100">
        {stories.map((story, index) =>
        <div
          key={story.id}
          className="p-4 hover:bg-gray-50 transition-colors">

            <div className="flex">
              {/* Ranking number */}
              <div className="mr-4 flex-shrink-0">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-700">
                    {index + 1}
                  </span>
                </div>
              </div>
              {/* Story content */}
              <div className="flex-1">
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium mr-2">
                    {story.category}
                  </span>
                  <span className="flex items-center mr-3">
                    <Clock className="h-3 w-3 mr-1" />
                    {story.timeOnList}
                  </span>
                  <span className="flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Peak: {story.peakTime}
                  </span>
                </div>
                <h4 className="font-medium text-gray-900 mb-1">
                  {story.title}
                </h4>
                <p className="text-sm text-gray-600 mb-3">{story.snippet}</p>
                {/* Engagement metrics */}
                <div className="flex flex-wrap items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center text-gray-500">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{formatNumber(story.views)}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      <span>{formatNumber(story.comments)}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Share2 className="h-4 w-4 mr-1" />
                      <span>{formatNumber(story.shares)}</span>
                    </div>
                  </div>
                  <div className="flex items-center mt-2 sm:mt-0">
                    <div className="flex items-center mr-3">
                      <div className="text-sm font-medium">
                        {story.viewsPerHour} views/hr
                      </div>
                    </div>
                    <div
                    className={`flex items-center ${story.direction === 'up' ? 'text-green-600' : 'text-red-600'} bg-gray-100 px-2 py-1 rounded-full text-xs font-medium`}>

                      {story.direction === 'up' ?
                    <ArrowUp className="h-3 w-3 mr-1" /> :

                    <ArrowDown className="h-3 w-3 mr-1" />
                    }
                      <span>{story.percentChange}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>);

};
// Helper function to format numbers
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  } else {
    return num;
  }
};