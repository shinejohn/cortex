import React from 'react';
import {
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  MessageSquare } from
'lucide-react';
export const ArticleSidebar = () => {
  return (
    <div className="space-y-8">
      {/* Premium ad space */}
      <div className="sticky top-32">
        <div className="text-xs text-gray-400 text-center mb-1">
          ADVERTISEMENT
        </div>
        <div className="bg-gray-200 h-[600px] rounded flex items-center justify-center text-gray-400">
          300x600 Ad Unit
        </div>
      </div>
      {/* Trending Now */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-news-primary text-white px-4 py-3 flex items-center">
          <TrendingUp className="h-4 w-4 mr-2" />
          <h3 className="font-medium">Trending Now</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((item) =>
          <a key={item} href="#" className="block p-4 hover:bg-gray-50">
              <div className="flex items-start">
                <div className="text-xl font-bold text-gray-300 mr-3">
                  0{item}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                    {item === 1 &&
                  'Clearwater Marine Aquarium Announces Expansion Plans'}
                    {item === 2 &&
                  'Local Restaurant Week Returns With 45 Participating Venues'}
                    {item === 3 &&
                  'School Board Approves New Start Times for 2025'}
                    {item === 4 &&
                  'Tropical Storm Debby Forms in Gulf, Monitoring Continues'}
                    {item === 5 &&
                  'Downtown Art Festival Expects Record Attendance'}
                  </h4>
                  <div className="text-xs text-gray-500">
                    {Math.floor(Math.random() * 10) + 1}h ago •{' '}
                    {Math.floor(Math.random() * 100) + 50} readers
                  </div>
                </div>
              </div>
            </a>
          )}
        </div>
      </div>
      {/* Local Events */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-yellow-100 text-yellow-800 px-4 py-3 flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          <h3 className="font-medium">Local Events</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3].map((item) =>
          <a key={item} href="#" className="block p-4 hover:bg-gray-50">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  {item === 1 && 'Farmers Market at Coachman Park'}
                  {item === 2 && 'Summer Concert Series: Jazz on the Bay'}
                  {item === 3 && 'Clearwater Library Book Sale'}
                </h4>
                <div className="flex items-center text-xs text-gray-500 mb-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    {item === 1 && 'Saturday, Aug 3 • 8am-1pm'}
                    {item === 2 && 'Sunday, Aug 4 • 6pm-9pm'}
                    {item === 3 && 'Aug 5-7 • 10am-7pm'}
                  </span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>
                    {item === 1 && 'Coachman Park'}
                    {item === 2 && 'Pier 60'}
                    {item === 3 && 'Clearwater Main Library'}
                  </span>
                </div>
              </div>
            </a>
          )}
        </div>
      </div>
      {/* Second ad unit */}
      <div>
        <div className="text-xs text-gray-400 text-center mb-1">
          ADVERTISEMENT
        </div>
        <div className="bg-gray-200 h-[250px] rounded flex items-center justify-center text-gray-400">
          300x250 Ad Unit
        </div>
      </div>
      {/* Engagement Widget */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-news-primary-light text-white px-4 py-3 flex items-center">
          <MessageSquare className="h-4 w-4 mr-2" />
          <h3 className="font-medium">Join the Discussion</h3>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1 text-gray-500" />
              <span className="text-gray-700 font-medium">47 comments</span>
            </div>
            <div className="text-sm text-news-primary hover:underline cursor-pointer">
              View All
            </div>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <svg
                className="h-4 w-4 mr-1 text-gray-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2">

                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"></path>
                <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
              </svg>
              <span className="text-gray-700 font-medium">234 reactions</span>
            </div>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-gray-700 font-medium">89 shares</span>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button className="w-full bg-news-primary text-white py-2 rounded-md font-medium hover:bg-news-primary-dark transition-colors">
              Join the Conversation
            </button>
          </div>
        </div>
      </div>
    </div>);

};