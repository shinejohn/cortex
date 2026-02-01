import React from 'react';
import {
  Calendar,
  MapPin,
  Clock,
  ChevronRight,
  ExternalLink } from
'lucide-react';
export const EventsPreview = ({ onViewAll }) => {
  // Featured event
  const featuredEvent = {
    id: 1,
    title: 'Clearwater Jazz Holiday',
    date: 'October 15-18, 2025',
    time: '6:00 PM - 11:00 PM',
    location: 'Coachman Park, Clearwater',
    description:
    'The Clearwater Jazz Holiday is a world-class music festival featuring jazz, blues, and rock performances. Join us for four days of amazing music, food, and fun in beautiful Coachman Park.',
    image:
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  };
  // Upcoming events
  const upcomingEvents = [
  {
    id: 2,
    title: 'Farmers Market',
    date: 'Every Saturday',
    time: '9:00 AM - 2:00 PM',
    location: 'Downtown Clearwater',
    category: 'Community',
    image:
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    title: 'Beach Cleanup Day',
    date: 'August 20, 2025',
    time: '8:00 AM - 12:00 PM',
    location: 'Clearwater Beach',
    category: 'Environment',
    image:
    'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4,
    title: 'Art Walk',
    date: 'First Friday Monthly',
    time: '6:00 PM - 9:00 PM',
    location: 'Cleveland Street District',
    category: 'Arts',
    image:
    'https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 5,
    title: 'Summer Concert Series',
    date: 'August 15, 2025',
    time: '7:00 PM - 10:00 PM',
    location: 'Pier 60',
    category: 'Music',
    image:
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Featured Event - Takes up 1/3 of the width */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-news-primary" />
              Featured Event
            </h3>
          </div>
          <div className="relative h-48">
            <img
              src={featuredEvent.image}
              alt={featuredEvent.title}
              className="w-full h-full object-cover" />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-white font-bold text-lg">
                {featuredEvent.title}
              </h3>
              <div className="flex items-center text-white text-xs mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{featuredEvent.date}</span>
              </div>
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex items-center text-gray-500 text-sm mb-2">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>{featuredEvent.time}</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm mb-3">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>{featuredEvent.location}</span>
            </div>
            <p className="text-sm text-gray-600 mb-4 flex-1">
              {featuredEvent.description}
            </p>
            <button className="w-full bg-news-primary text-white py-2 rounded-md hover:bg-news-primary-dark transition-colors">
              Get Tickets
            </button>
          </div>
        </div>
      </div>
      {/* Upcoming Events - Takes up 2/3 of the width */}
      <div className="lg:col-span-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {upcomingEvents.map((event) =>
          <div
            key={event.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex">

              <div className="w-1/3">
                <div className="h-full">
                  <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover" />

                </div>
              </div>
              <div className="w-2/3 p-3 flex flex-col">
                <div className="mb-1">
                  <span className="inline-block text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {event.category}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 mb-1 text-sm">
                  {event.title}
                </h3>
                <div className="flex items-center text-gray-500 text-xs mb-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center text-gray-500 text-xs mb-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center text-gray-500 text-xs">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{event.location}</span>
                </div>
                <div className="mt-auto pt-2 flex justify-between items-center">
                  <a
                  href="#"
                  className="text-xs text-news-primary font-medium flex items-center">

                    Details
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                  <button className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    Add to Calendar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={onViewAll}
            className="inline-flex items-center px-4 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark transition-colors">

            View All Events
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>);

};