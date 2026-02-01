import React, { useState } from 'react';
import { MapPin, ChevronDown, ArrowRight } from 'lucide-react';
export const CurrentCityHeader = ({ currentCity, followedCities }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Currently viewing
          </h2>
          <button
            className="flex items-center text-news-primary font-medium hover:underline"
            onClick={() => setShowDropdown(!showDropdown)}>

            <MapPin className="h-5 w-5 mr-1.5" />
            <span className="text-lg">
              {currentCity?.city}, {currentCity?.state}
            </span>
            <ChevronDown className="h-4 w-4 ml-1.5" />
          </button>
        </div>
        <div className="mt-4 md:mt-0">
          {followedCities.length > 1 ?
          <div className="flex items-center">
              <div className="flex -space-x-2 mr-3">
                {followedCities.slice(0, 3).map((city, index) =>
              <div
                key={index}
                className="h-8 w-8 rounded-full border-2 border-white overflow-hidden bg-gray-200 flex items-center justify-center text-xs font-medium">

                    {city.image ?
                <img
                  src={city.image}
                  alt={city.name}
                  className="h-full w-full object-cover" /> :


                city.name.charAt(0)
                }
                  </div>
              )}
                {followedCities.length > 3 &&
              <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                    +{followedCities.length - 3}
                  </div>
              }
              </div>
              <span className="text-sm text-gray-600">
                Following {followedCities.length} communities
              </span>
            </div> :

          <button className="bg-news-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-news-primary-dark transition-colors">
              Manage Followed Communities
            </button>
          }
        </div>
      </div>
      {/* Quick city switch dropdown */}
      {showDropdown &&
      <div className="absolute top-full left-0 mt-2 w-full md:w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700">
              Your Communities
            </h3>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {followedCities.map((city) =>
          <button
            key={city.id}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 text-left">

                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 mr-2">
                    {city.image ?
                <img
                  src={city.image}
                  alt={city.name}
                  className="h-full w-full object-cover" /> :


                <div className="h-full w-full flex items-center justify-center text-xs font-medium">
                        {city.name.charAt(0)}
                      </div>
                }
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {city.name}, {city.state}
                    </div>
                    <div className="text-xs text-gray-500">
                      {city.activeStories} active stories
                    </div>
                  </div>
                </div>
                {city.id === currentCity?.communityId &&
            <div className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                    Current
                  </div>
            }
              </button>
          )}
          </div>
          <div className="p-3 border-t border-gray-100">
            <button
            className="w-full flex items-center justify-center text-news-primary hover:text-news-primary-dark text-sm font-medium"
            onClick={() => setShowDropdown(false)}>

              <span>Manage Communities</span>
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </button>
          </div>
        </div>
      }
    </div>);

};