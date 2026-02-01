import React from 'react';
import { TrendingUp, Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';
export const TagAnalytics = ({ analytics }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-bold text-gray-800">Tag Analytics</h3>
        <TrendingUp className="h-5 w-5 text-news-primary" />
      </div>
      <div className="p-4">
        {/* Trend graph */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700">
              Activity Trend
            </div>
            <div className="text-xs text-gray-500">Last 6 months</div>
          </div>
          <div className="h-32 relative">
            {/* Simple bar chart representation */}
            <div className="absolute inset-0 flex items-end justify-between">
              {analytics.views.map((view, index) => {
                const height = view / Math.max(...analytics.views) * 100;
                return (
                  <div key={index} className="flex flex-col items-center w-1/7">
                    <div
                      className="w-full bg-news-primary-light rounded-t"
                      style={{
                        height: `${height}%`
                      }}>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {analytics.periods[index]}
                    </div>
                  </div>);

              })}
            </div>
          </div>
        </div>
        {/* Peak activity times */}
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-700 mb-3">
            Peak Activity Times
          </div>
          <div className="space-y-2">
            {analytics.peakTimes.map((peak, index) =>
            <div key={index} className="flex items-center">
                <div className="w-1/3 text-xs text-gray-500">{peak.day}</div>
                <div className="w-1/3 text-xs text-gray-500">{peak.time}</div>
                <div className="w-1/3 h-2 bg-gray-100 rounded-full">
                  <div
                  className="h-full bg-news-primary rounded-full"
                  style={{
                    width: `${peak.score}%`
                  }}>
                </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Related events */}
        <div>
          <div className="text-sm font-medium text-gray-700 mb-3">
            Related Events
          </div>
          <div className="space-y-3">
            {analytics.relatedEvents.map((event) =>
            <div key={event.id} className="bg-gray-50 rounded-md p-3">
                <div className="text-sm font-medium text-gray-800 mb-1">
                  {event.name}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{event.location}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4">
            <button className="w-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-md text-sm font-medium">
              <span>View All Related Events</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>);

};