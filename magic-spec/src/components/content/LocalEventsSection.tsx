import React from 'react';
import { MapPin, Calendar, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export const LocalEventsSection = () => {
  const navigate = useNavigate();
  const localEvents = [
  {
    id: 1,
    title: 'Clearwater Jazz Holiday',
    date: 'Oct 15-18, 2025',
    location: 'Coachman Park',
    image:
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    title: 'Farmers Market',
    date: 'Every Saturday',
    location: 'Downtown',
    image:
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    title: 'Art Walk',
    date: 'First Friday Monthly',
    location: 'Cleveland Street District',
    image:
    'https://images.unsplash.com/photo-1563784462041-5f97ac9523dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
  }];

  const handleEventClick = (eventId) => {
    navigate(`/eventDetail?id=${eventId}`);
  };
  const handleViewAllEvents = () => {
    navigate('/eventsCalendar');
  };
  return (
    <div className="space-y-3">
      {localEvents.map((event) =>
      <div
        key={event.id}
        className="bg-white rounded-md overflow-hidden shadow-sm border border-gray-200 flex cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => handleEventClick(event.id)}>

          <div className="w-1/4">
            <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover" />

          </div>
          <div className="w-3/4 p-3 flex justify-between items-center">
            <div>
              <h3 className="font-medium text-news-primary text-sm">
                {event.title}
              </h3>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{event.location}</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      )}
      <div className="text-center pt-2">
        <button
          className="inline-flex items-center px-4 py-2 bg-news-primary text-white rounded-md text-sm font-medium hover:bg-news-primary-dark transition-colors"
          onClick={handleViewAllEvents}>

          View All Events
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>);

};