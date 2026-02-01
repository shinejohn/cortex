import React from 'react';
import { MapPin, Info } from 'lucide-react';
export const EventMapView = ({ events }) => {
  return (
    <div className="relative">
      <div className="h-[600px] w-full relative bg-gray-100">
        {/* Static map background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
            "url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-82.8001,27.9659,13,0/1200x600?access_token=pk.placeholder')"
          }} />

        {/* Event markers */}
        {events.map((event, index) => {
          // Calculate pseudo-random positions for demo
          const left = `${(index * 17 + 20) % 80}%`;
          const top = `${(index * 23 + 15) % 80}%`;
          return (
            <div
              key={index}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{
                left,
                top
              }}>

              <div className="relative group">
                <div className="flex items-center justify-center h-10 w-10 bg-news-primary text-white rounded-full shadow-md hover:bg-news-primary-dark">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 hidden group-hover:block z-10">
                  <div className="bg-white rounded-md shadow-lg p-3 border border-gray-200">
                    <div className="text-sm font-medium text-gray-900 mb-1">
                      {event.title}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>
                        {new Date(event.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>
                        {new Date(event.time).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <button className="w-full bg-news-primary text-white text-xs py-1.5 rounded">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>);

        })}
        {/* Map controls */}
        <div className="absolute top-4 right-4 bg-white rounded-md shadow-md border border-gray-200">
          <button className="p-2 text-gray-700 hover:bg-gray-100 rounded-t-md border-b border-gray-200">
            <MapPin className="h-5 w-5" />
          </button>
          <button className="p-2 text-gray-700 hover:bg-gray-100 rounded-b-md">
            <MapPin className="h-5 w-5" />
          </button>
        </div>
        {/* Map legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-md shadow-md border border-gray-200 p-3">
          <div className="text-xs font-medium text-gray-700 mb-2">
            Map Legend
          </div>
          <div className="flex items-center mb-1">
            <div className="h-3 w-3 bg-news-primary rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Event Location</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-xs text-gray-600">Featured Event</span>
          </div>
        </div>
        {/* Info box */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-md shadow-md border border-gray-200 p-3 max-w-xs">
          <div className="flex items-start">
            <Info className="h-4 w-4 text-news-primary mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-gray-600">
              <p className="font-medium text-gray-700 mb-1">
                Viewing {events.length} events on the map
              </p>
              <p>
                Click on any marker to see event details and get directions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>);

};