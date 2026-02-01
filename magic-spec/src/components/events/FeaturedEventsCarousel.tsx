import React, { useEffect, useState, useRef } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Users,
  ExternalLink } from
'lucide-react';
export const FeaturedEventsCarousel = ({ events }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const autoPlayRef = useRef(null);
  // Auto-advance slides
  useEffect(() => {
    if (events.length <= 1) return;
    const play = () => {
      if (!isHovering) {
        setCurrentSlide((prev) => (prev + 1) % events.length);
      }
    };
    autoPlayRef.current = play;
  }, [events.length, isHovering]);
  useEffect(() => {
    const interval = setInterval(() => {
      if (autoPlayRef.current) {
        autoPlayRef.current();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % events.length);
  };
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + events.length) % events.length);
  };
  if (!events || events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center">
        <div className="text-5xl mb-4">🎭</div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">
          No featured events
        </h3>
        <p className="text-gray-500">
          Check back soon for exciting featured events!
        </p>
      </div>);

  }
  return (
    <div
      className="relative bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}>

      {/* Slide indicators */}
      <div className="absolute top-4 right-4 z-10 flex space-x-1">
        {events.map((_, index) =>
        <button
          key={index}
          onClick={() => setCurrentSlide(index)}
          className={`h-2 w-2 rounded-full ${currentSlide === index ? 'bg-white' : 'bg-white/50'}`} />

        )}
      </div>
      {/* Navigation arrows */}
      {events.length > 1 &&
      <>
          <button
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
          onClick={prevSlide}>

            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
          onClick={nextSlide}>

            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      }
      {/* Carousel track */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`
        }}>

        {events.map((event, index) =>
        <div key={index} className="w-full flex-shrink-0">
            <div className="relative h-96">
              <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover" />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              {/* Event content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="inline-block bg-news-primary px-3 py-1 rounded-full text-sm font-medium">
                    Featured Event
                  </div>
                  {/* Weather forecast */}
                  {event.weather &&
                <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                      <Cloud className="h-4 w-4 mr-1.5" />
                      <span className="text-sm">
                        {event.weather.temp}° • {event.weather.condition}
                      </span>
                    </div>
                }
                </div>
                <h2 className="text-3xl font-bold mb-2">{event.title}</h2>
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-1.5" />
                    <span>
                      {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-1.5" />
                    <span>
                      {new Date(event.time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}{' '}
                      -
                      {new Date(event.endTime).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-1.5" />
                    <span>{event.location}</span>
                  </div>
                </div>
                <p className="mb-4 line-clamp-2">{event.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-1.5" />
                    <span className="text-sm">
                      {event.attendees} neighbors attending
                    </span>
                  </div>
                  <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-md transition-colors">
                      Add to Calendar
                    </button>
                    <button className="px-4 py-2 bg-news-primary hover:bg-news-primary-dark rounded-md transition-colors flex items-center">
                      RSVP Now
                      <ExternalLink className="h-4 w-4 ml-1.5" />
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