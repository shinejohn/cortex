import React from 'react';
import { Users, Newspaper, TrendingUp, Bell, BellOff } from 'lucide-react';
export const PopularCities = ({ cities, onCitySelect, onToggleFollow }) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Popular Communities
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities.map((city) =>
        <div
          key={city.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">

            <div className="relative h-36">
              <img
              src={city.image}
              alt={city.name}
              className="w-full h-full object-cover" />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-lg font-bold mb-1">
                  {city.name}, {city.state}
                </h3>
                {city.trending &&
              <div className="flex items-center text-sm text-white/90">
                    <TrendingUp className="h-3.5 w-3.5 mr-1 text-red-400" />
                    <span>Trending now</span>
                  </div>
              }
              </div>
              {city.trending &&
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  HOT
                </div>
            }
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{city.population.toLocaleString()}</span>
                </div>
                <div className="flex items-center">
                  <Newspaper className="h-4 w-4 mr-1" />
                  <span>{city.activeStories} active stories</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                onClick={() => onCitySelect(city)}
                className="flex-1 bg-news-primary text-white font-medium py-2 rounded hover:bg-news-primary-dark transition-colors">

                  View News
                </button>
                <button
                onClick={() => onToggleFollow(city.id)}
                className={`p-2 rounded ${city.isFollowed ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>

                  {city.isFollowed ?
                <BellOff className="h-5 w-5" /> :

                <Bell className="h-5 w-5" />
                }
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>);

};