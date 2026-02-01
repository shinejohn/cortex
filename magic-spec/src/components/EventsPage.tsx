import React from 'react';
import { MapPin, Calendar, Search, Filter } from 'lucide-react';
import { PageHeader } from './PageHeader';
import { EventCard } from './EventCard';
export const EventsPage = () => {
  // Sample event data
  const upcomingEvents = [
  {
    id: 1,
    title: 'Summer Concert Series',
    location: 'Pier 60',
    customImage:
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    title: 'Farmers Market',
    location: 'Downtown Square',
    customImage:
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    title: 'Art Gallery Opening',
    location: 'Main Street Arts',
    customImage:
    'https://images.unsplash.com/photo-1501084817091-a4f3d1d19e07?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 4,
    title: 'Food Truck Festival',
    location: 'Waterfront Park',
    customImage:
    'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 5,
    title: 'Yoga in the Park',
    location: 'Central Park',
    customImage:
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 6,
    title: 'Local Theater Performance',
    location: 'Community Playhouse',
    customImage:
    'https://images.unsplash.com/photo-1507924538820-ede94a04019d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  }];

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Events</h1>
      {/* Search and Filters */}
      <div className="mb-6 flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
        <div className="flex items-center rounded-full border border-gray-300 bg-white px-4 py-2">
          <MapPin className="mr-2 h-4 w-4 text-gray-500" />
          <span className="text-sm">All Locations</span>
        </div>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search for events..."
            className="w-full rounded-full border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm focus:outline-none" />

          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
        <button className="flex items-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm">
          <Filter className="mr-2 h-4 w-4 text-gray-500" />
          Filters
        </button>
      </div>
      {/* Featured Event */}
      <div className="mb-8 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="relative h-64">
          <img
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
            alt="Clearwater Jazz Holiday"
            className="h-full w-full object-cover" />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="mb-2 inline-block rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
              FEATURED EVENT
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">
              Clearwater Jazz Holiday
            </h2>
            <div className="flex flex-wrap items-center text-sm text-white">
              <div className="mr-4 flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                <span>October 15-18, 2025</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                <span>Coachman Park, Clearwater</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <p className="mb-4 text-gray-600">
            The Clearwater Jazz Holiday is a world-class music festival
            featuring jazz, blues, and rock performances. Join us for four days
            of amazing music, food, and fun in beautiful Coachman Park.
          </p>
          <div className="flex justify-between">
            <button className="rounded-md bg-news-primary px-4 py-2 text-sm font-medium text-white">
              Get Tickets
            </button>
            <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700">
              Add to Calendar
            </button>
          </div>
        </div>
      </div>
      {/* Upcoming Events */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Upcoming Events
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event) =>
          <EventCard
            key={event.id}
            title={event.title}
            location={event.location}
            customImage={event.customImage} />

          )}
        </div>
      </div>
      {/* Monthly Calendar */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Calendar</h2>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <button className="rounded-md border border-gray-300 px-3 py-1 text-sm">
              Previous
            </button>
            <h3 className="text-lg font-medium">August 2025</h3>
            <button className="rounded-md border border-gray-300 px-3 py-1 text-sm">
              Next
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) =>
            <div key={day} className="p-2 text-center text-sm font-medium">
                {day}
              </div>
            )}
            {Array.from(
              {
                length: 31
              },
              (_, i) =>
              <div
                key={i}
                className={`rounded-md p-2 text-center text-sm ${i === 4 || i === 12 || i === 20 ? 'bg-blue-100 font-medium text-blue-800' : 'hover:bg-gray-100'}`}>

                  {i + 1}
                </div>

            )}
          </div>
        </div>
      </div>
    </div>);

};