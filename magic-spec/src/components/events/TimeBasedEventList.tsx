import React, { useState } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  ExternalLink,
  ChevronRight,
  Navigation,
  Car,
  Bus } from
'lucide-react';
export const TimeBasedEventList = ({ title, icon, events }) => {
  const [hoveredEvent, setHoveredEvent] = useState(null);
  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  const formatDuration = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end - start;
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor(
      durationMs % (1000 * 60 * 60) / (1000 * 60)
    );
    if (durationHours === 0) {
      return `${durationMinutes}m`;
    } else if (durationMinutes === 0) {
      return `${durationHours}h`;
    } else {
      return `${durationHours}h ${durationMinutes}m`;
    }
  };
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
        <span className="mr-2">{icon}</span>
        {title} Events
      </h3>
      <div className="space-y-4">
        {events.map((event) =>
        <div
          key={event.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          onMouseEnter={() => setHoveredEvent(event.id)}
          onMouseLeave={() => setHoveredEvent(null)}>

            <div className="flex flex-col sm:flex-row">
              {/* Event image */}
              <div className="sm:w-1/4 h-40 sm:h-auto relative">
                <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover" />

                {/* Price badge */}
                <div className="absolute top-2 left-2">
                  {event.price === 0 ?
                <div className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded">
                      FREE
                    </div> :

                <div className="bg-white text-gray-800 text-xs font-bold px-2 py-1 rounded flex items-center">
                      <DollarSign className="h-3 w-3 mr-0.5" />
                      {event.price}
                    </div>
                }
                </div>
              </div>
              {/* Event details */}
              <div className="p-4 sm:w-3/4 flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">
                      {event.title}
                    </h4>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-0 flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{formatTime(event.time)}</span>
                    <span className="mx-1">•</span>
                    <span>{formatDuration(event.time, event.endTime)}</span>
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{event.location}</span>
                  <button className="ml-2 text-news-primary hover:underline text-xs font-medium flex items-center">
                    Directions
                    <Navigation className="h-3 w-3 ml-0.5" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {event.description}
                </p>
                {/* Transportation info */}
                {hoveredEvent === event.id &&
              <div className="bg-gray-50 p-2 rounded-md mb-3 text-xs text-gray-600 flex items-start space-x-4">
                    {event.transportation.parking &&
                <div className="flex items-center">
                        <Car className="h-3.5 w-3.5 mr-1 text-gray-500" />
                        <span>Parking available</span>
                      </div>
                }
                    {event.transportation.publicTransit &&
                <div className="flex items-center">
                        <Bus className="h-3.5 w-3.5 mr-1 text-gray-500" />
                        <span>Public transit nearby</span>
                      </div>
                }
                  </div>
              }
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-1.5" />
                    <span>{event.attendees} attending</span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                      Add to Calendar
                    </button>
                    <button className="px-3 py-1.5 text-xs bg-news-primary text-white rounded hover:bg-news-primary-dark transition-colors flex items-center">
                      View Details
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>);

};