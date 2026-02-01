import React from 'react';
import {
  MapPin,
  Users,
  Newspaper,
  BellOff,
  Bell,
  List,
  Map as MapIcon } from
'lucide-react';
export const NearbyCitiesGrid = ({
  cities,
  onCitySelect,
  onToggleFollow,
  mapView,
  onToggleMapView
}) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Nearby Communities</h2>
        <div className="flex items-center">
          <div className="flex border border-gray-300 rounded-md overflow-hidden">
            <button
              onClick={() => onToggleMapView()}
              className={`flex items-center px-3 py-1.5 text-sm ${!mapView ? 'bg-news-primary text-white' : 'bg-white text-gray-700'}`}>

              <List className="h-4 w-4 mr-1.5" />
              <span>List</span>
            </button>
            <button
              onClick={() => onToggleMapView()}
              className={`flex items-center px-3 py-1.5 text-sm ${mapView ? 'bg-news-primary text-white' : 'bg-white text-gray-700'}`}>

              <MapIcon className="h-4 w-4 mr-1.5" />
              <span>Map</span>
            </button>
          </div>
        </div>
      </div>
      {mapView ?
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="relative h-[500px]">
            {/* Map background - in a real app, this would be an actual map component */}
            <div
            className="w-full h-full bg-blue-50"
            style={{
              backgroundImage:
              "url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-82.8001,27.9659,9,0/1200x600?access_token=pk.placeholder')",
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>

              {/* City markers */}
              {cities.map((city) =>
            <div
              key={city.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                // These would be calculated based on actual coordinates in a real app
                left: `${50 + (Math.random() * 40 - 20)}%`,
                top: `${50 + (Math.random() * 40 - 20)}%`
              }}>

                  <div className="relative group">
                    <div
                  className={`flex items-center justify-center h-10 w-10 rounded-full shadow-md ${city.distance === 0 ? 'bg-news-primary text-white' : 'bg-white text-news-primary hover:bg-gray-100'}`}>

                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 hidden group-hover:block">
                      <div className="bg-white rounded-md shadow-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">
                            {city.name}, {city.state}
                          </div>
                          {city.distance > 0 &&
                      <div className="text-xs text-gray-500">
                              {city.distance} mi
                            </div>
                      }
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <div className="flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            <span>{city.population.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center">
                            <Newspaper className="h-3 w-3 mr-1" />
                            <span>{city.activeStories} stories</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                        onClick={() => onCitySelect(city)}
                        className="flex-1 bg-news-primary text-white text-xs font-medium py-1.5 rounded">

                            View
                          </button>
                          <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFollow(city.id);
                        }}
                        className={`p-1.5 rounded ${city.isFollowed ? 'bg-gray-100 text-gray-700' : 'bg-gray-100 text-gray-700'}`}>

                            {city.isFollowed ?
                        <BellOff className="h-4 w-4" /> :

                        <Bell className="h-4 w-4" />
                        }
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            )}
            </div>
          </div>
        </div> :

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
                  <div className="flex items-center text-sm text-white/90">
                    {city.distance === 0 ?
                <div className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        <span>Current location</span>
                      </div> :

                <div className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        <span>{city.distance} miles away</span>
                      </div>
                }
                  </div>
                </div>
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
      }
    </div>);

};