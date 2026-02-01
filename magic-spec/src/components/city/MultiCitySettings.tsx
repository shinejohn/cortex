import React from 'react';
import { Check, X, Globe, Info } from 'lucide-react';
export const MultiCitySettings = ({ isEnabled, onToggle, followedCities }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Globe className="h-5 w-5 text-news-primary mr-2" />
          <div>
            <h3 className="font-medium text-gray-900">Multi-City Mode</h3>
            <p className="text-sm text-gray-500">
              Follow and get updates from multiple communities
            </p>
          </div>
        </div>
        <div className="flex items-center">
          <button
            onClick={onToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isEnabled ? 'bg-news-primary' : 'bg-gray-200'}`}>

            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />

          </button>
        </div>
      </div>
      {isEnabled &&
      <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-start mb-3">
            <Info className="h-4 w-4 text-news-primary mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-xs text-gray-600">
              With Multi-City Mode enabled, you'll see news from all your
              followed communities in your feed. You can filter by community
              using the dropdown in the navigation bar.
            </p>
          </div>
          <div className="bg-gray-50 rounded-md p-3">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Your Followed Communities ({followedCities.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {followedCities.map((city) =>
            <div
              key={city.id}
              className="flex items-center bg-white rounded-full pl-2 pr-3 py-1 border border-gray-200 text-sm">

                  <div className="h-5 w-5 rounded-full overflow-hidden mr-1.5 bg-gray-100">
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
                  <span className="text-gray-700">
                    {city.name}, {city.state}
                  </span>
                </div>
            )}
              <button className="flex items-center bg-news-primary bg-opacity-10 rounded-full px-3 py-1 text-sm text-news-primary font-medium">
                <span className="mr-1">+</span>
                <span>Add More</span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

};