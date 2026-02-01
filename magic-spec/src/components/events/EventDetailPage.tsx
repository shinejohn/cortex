import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Share2,
  Bookmark,
  ExternalLink,
  ChevronLeft,
  Heart,
  Mail,
  Phone,
  Globe,
  MessageSquare,
  AlertCircle,
  Tag,
  ThumbsUp,
  ChevronRight,
  X,
  Copy,
  Home } from
'lucide-react';
import { useLocationDetection } from '../location/LocationDetector';
import { mockEvents } from './EventsCalendarPage';
import { SaveModal } from '../modals/SaveModal';
import { ShareModal } from '../modals/ShareModal';
export const EventDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [readingProgress, setReadingProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [interested, setInterested] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showNextEvent, setShowNextEvent] = useState(false);
  const [activeSection, setActiveSection] = useState('details');
  const [reactions, setReactions] = useState({
    helpful: 42,
    love: 27,
    attending: 68
  });
  const eventRef = useRef(null);
  const detailsRef = useRef(null);
  const descriptionRef = useRef(null);
  const locationRef = useRef(null);
  const organizerRef = useRef(null);
  const { locationData } = useLocationDetection();
  const city = locationData?.city || 'Clearwater';
  // Get event ID from URL query params
  const searchParams = new URLSearchParams(location.search);
  const eventId = parseInt(searchParams.get('id') || '1');
  // Find the event in mock data
  const event = mockEvents.find((e) => e.id === eventId) || mockEvents[0];
  // Related events - just get 3 other events
  const relatedEvents = mockEvents.
  filter((e) => e.id !== eventId && e.category === event.category).
  slice(0, 3);
  // Next event - for the bottom preview
  const nextEvent = mockEvents.find((e) => e.id !== eventId) || mockEvents[0];
  // Scroll to section handler
  const scrollToSection = (sectionId) => {
    const sectionRef = {
      details: detailsRef,
      description: descriptionRef,
      location: locationRef,
      organizer: organizerRef
    }[sectionId];
    if (sectionRef && sectionRef.current) {
      sectionRef.current.scrollIntoView({
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };
  // Handle scroll for reading progress and active section detection
  useEffect(() => {
    const handleScroll = () => {
      // Calculate reading progress
      if (eventRef.current) {
        const totalHeight = eventRef.current.clientHeight;
        const windowHeight = window.innerHeight;
        const scrolled = window.scrollY;
        const scrollableHeight = totalHeight - windowHeight;
        const progress = Math.min(scrolled / scrollableHeight, 1);
        setReadingProgress(progress);
        // Show next event preview when near bottom
        if (progress > 0.85) {
          setShowNextEvent(true);
        } else {
          setShowNextEvent(false);
        }
        // Update active section based on scroll position
        const sections = [
        {
          id: 'details',
          ref: detailsRef
        },
        {
          id: 'description',
          ref: descriptionRef
        },
        {
          id: 'location',
          ref: locationRef
        },
        {
          id: 'organizer',
          ref: organizerRef
        }];

        // Find the section that is currently in view
        for (let i = sections.length - 1; i >= 0; i--) {
          const section = sections[i];
          if (section.ref.current) {
            const rect = section.ref.current.getBoundingClientRect();
            if (rect.top <= 150) {
              setActiveSection(section.id);
              break;
            }
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // Handle save/bookmark
  const handleSave = () => {
    setSaved(!saved);
    setShowSaveModal(true);
  };
  // Handle interested/going
  const handleInterested = () => {
    setInterested(!interested);
    setReactions((prev) => ({
      ...prev,
      attending: interested ? prev.attending - 1 : prev.attending + 1
    }));
  };
  // Handle share
  const handleShare = () => {
    setShowShareModal(true);
  };
  // Toggle description
  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };
  // Handle reaction
  const handleReaction = (type) => {
    setReactions((prev) => ({
      ...prev,
      [type]: prev[type] + 1
    }));
  };
  // Handle ad click
  const handleAdClick = () => {
    navigate('/advertisingDetail');
  };
  // Dismiss next event preview
  const dismissNextEvent = () => {
    setShowNextEvent(false);
  };
  // Navigate to another event
  const goToEvent = (id) => {
    navigate(`/eventDetail?id=${id}`);
    window.scrollTo(0, 0);
  };
  // Format date for display
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  // Format time for display
  const formatEventTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Reading progress indicator */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200">
        <div
          className="h-full bg-news-primary transition-all duration-300"
          style={{
            width: `${readingProgress * 100}%`
          }}>
        </div>
      </div>
      <main className="overflow-auto w-full">
        {/* Hero Section */}
        <div className="relative h-72 md:h-96">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover" />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
            <div className="container mx-auto">
              <div className="flex items-center mb-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">
                  {event.category.toUpperCase()}
                </span>
                {event.featured &&
                <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-medium">
                    FEATURED EVENT
                  </span>
                }
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center text-white text-sm md:text-base gap-x-4 gap-y-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatEventDate(event.date)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>
                    {formatEventTime(event.time)} -{' '}
                    {formatEventTime(event.endTime)}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {event.location}, {city}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-gray-500 mb-6">
            <a
              href="#"
              className="hover:underline flex items-center"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}>

              <Home className="h-3 w-3 mr-1" />
              <span>Home</span>
            </a>
            <ChevronRight className="h-3 w-3 mx-1" />
            <a
              href="#"
              className="hover:underline"
              onClick={(e) => {
                e.preventDefault();
                navigate('/eventsCalendar');
              }}>

              Events
            </a>
            <ChevronRight className="h-3 w-3 mx-1" />
            <span className="text-gray-700">{event.title}</span>
          </div>
          <div
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            ref={eventRef}>

            {/* Left rail - Navigation helpers */}
            <aside className="hidden lg:block lg:col-span-2">
              <div className="sticky top-24">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-4">
                      On this page
                    </h4>
                    <nav className="space-y-3">
                      <a
                        href="#details"
                        className={`flex items-center text-sm ${activeSection === 'details' ? 'text-news-primary font-medium' : 'text-gray-600 hover:text-news-primary'}`}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection('details');
                        }}>

                        <div
                          className={`w-1 h-5 ${activeSection === 'details' ? 'bg-news-primary' : 'bg-transparent'} rounded-full mr-2`}>
                        </div>
                        Event Details
                      </a>
                      <a
                        href="#description"
                        className={`flex items-center text-sm ${activeSection === 'description' ? 'text-news-primary font-medium' : 'text-gray-600 hover:text-news-primary'}`}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection('description');
                        }}>

                        <div
                          className={`w-1 h-5 ${activeSection === 'description' ? 'bg-news-primary' : 'bg-transparent'} rounded-full mr-2`}>
                        </div>
                        Description
                      </a>
                      <a
                        href="#location"
                        className={`flex items-center text-sm ${activeSection === 'location' ? 'text-news-primary font-medium' : 'text-gray-600 hover:text-news-primary'}`}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection('location');
                        }}>

                        <div
                          className={`w-1 h-5 ${activeSection === 'location' ? 'bg-news-primary' : 'bg-transparent'} rounded-full mr-2`}>
                        </div>
                        Location
                      </a>
                      <a
                        href="#organizer"
                        className={`flex items-center text-sm ${activeSection === 'organizer' ? 'text-news-primary font-medium' : 'text-gray-600 hover:text-news-primary'}`}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToSection('organizer');
                        }}>

                        <div
                          className={`w-1 h-5 ${activeSection === 'organizer' ? 'bg-news-primary' : 'bg-transparent'} rounded-full mr-2`}>
                        </div>
                        Organizer
                      </a>
                    </nav>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-4">
                      Actions
                    </h4>
                    <div className="space-y-3">
                      <button
                        onClick={handleSave}
                        className="flex items-center text-sm text-gray-600 hover:text-news-primary">

                        <Bookmark
                          className={`h-4 w-4 mr-2 ${saved ? 'fill-current text-news-primary' : ''}`} />

                        {saved ? 'Saved' : 'Save Event'}
                      </button>
                      <button
                        onClick={handleShare}
                        className="flex items-center text-sm text-gray-600 hover:text-news-primary">

                        <Share2 className="h-4 w-4 mr-2" />
                        Share Event
                      </button>
                      <button
                        onClick={handleInterested}
                        className="flex items-center text-sm text-gray-600 hover:text-news-primary">

                        <Heart
                          className={`h-4 w-4 mr-2 ${interested ? 'fill-current text-news-primary' : ''}`} />

                        {interested ? 'Interested' : 'Mark Interested'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
            {/* Main content */}
            <div className="lg:col-span-7">
              {/* Action Buttons */}
              <div className="mb-6 flex flex-wrap gap-3">
                <button className="flex-1 bg-news-primary text-white py-3 px-4 rounded-md font-medium hover:bg-news-primary-dark transition-colors">
                  Get Tickets
                </button>
                <button
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-colors ${interested ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={handleInterested}>

                  <Heart
                    className="h-5 w-5"
                    fill={interested ? 'currentColor' : 'none'} />

                  <span>{interested ? 'Interested' : "I'm Interested"}</span>
                </button>
                <button
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-colors ${saved ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={handleSave}>

                  <Bookmark
                    className="h-5 w-5"
                    fill={saved ? 'currentColor' : 'none'} />

                  <span>{saved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
              {/* Native ad with click handler */}
              <div
                className="my-8 border border-gray-200 rounded-lg p-4 bg-gray-50 cursor-pointer"
                onClick={handleAdClick}>

                <div className="text-xs text-gray-500 mb-2">
                  SPONSORED CONTENT BY CLEARWATER BUSINESS ALLIANCE
                </div>
                <div className="flex">
                  <div className="w-1/4 mr-4">
                    <img
                      src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                      alt="Office building"
                      className="w-full h-auto rounded" />

                  </div>
                  <div className="w-3/4">
                    <h4 className="font-display text-lg font-bold mb-1">
                      Promote Your Event to Clearwater Residents
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Reach thousands of local readers and drive attendance to
                      your next event...
                    </p>
                    <a
                      href="#"
                      className="text-news-primary font-medium text-sm hover:underline"
                      onClick={(e) => {
                        e.preventDefault();
                        handleAdClick();
                      }}>

                      Learn More
                    </a>
                  </div>
                </div>
              </div>
              {/* Event Details */}
              <div
                id="details"
                ref={detailsRef}
                className="bg-white rounded-lg border border-gray-200 p-6 mb-6 scroll-mt-24">

                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Event Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">
                          Date & Time
                        </div>
                        <div className="text-gray-600 text-sm">
                          {formatEventDate(event.date)}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {formatEventTime(event.time)} -{' '}
                          {formatEventTime(event.endTime)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Tag className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">Price</div>
                        <div className="text-gray-600 text-sm">
                          {event.price === 0 ? 'Free' : `$${event.price}`}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">
                          Location
                        </div>
                        <div className="text-gray-600 text-sm">
                          {event.location}
                        </div>
                        <div className="text-gray-600 text-sm">
                          {event.address}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Users className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">
                          Attendees
                        </div>
                        <div className="text-gray-600 text-sm">
                          {reactions.attending} people interested
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Event Description */}
              <div
                id="description"
                ref={descriptionRef}
                className="bg-white rounded-lg border border-gray-200 p-6 mb-6 scroll-mt-24">

                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  About This Event
                </h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700">{event.description}</p>
                  <p className="text-gray-700 mt-4">
                    Join us for this amazing event in {city}! There will be
                    something for everyone to enjoy. Don't miss out on what
                    promises to be one of the highlight events of the year.
                  </p>
                  <p className="text-gray-700 mt-4">
                    Tickets are {event.price === 0 ? 'free' : `$${event.price}`}{' '}
                    and can be purchased online or at the door. Early
                    registration is recommended as space may be limited.
                  </p>
                </div>
              </div>
              {/* Location Map Placeholder */}
              <div
                id="location"
                ref={locationRef}
                className="bg-white rounded-lg border border-gray-200 p-6 mb-6 scroll-mt-24">

                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Location
                </h2>
                <div className="h-64 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-gray-500">
                    Interactive Map Would Appear Here
                  </span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">
                      {event.location}
                    </div>
                    <div className="text-gray-600 text-sm">{event.address}</div>
                    <a
                      href="#"
                      className="text-news-primary text-sm font-medium hover:underline mt-1 inline-block">

                      Get Directions
                    </a>
                  </div>
                </div>
              </div>
              {/* Organizer Info */}
              <div
                id="organizer"
                ref={organizerRef}
                className="bg-white rounded-lg border border-gray-200 p-6 mb-6 scroll-mt-24">

                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Organizer
                </h2>
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full overflow-hidden mr-3">
                    <img
                      src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                      alt={event.organizer}
                      className="h-full w-full object-cover" />

                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {event.organizer}
                    </div>
                    <div className="text-gray-500 text-sm">Event Organizer</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <a
                    href="#"
                    className="flex items-center text-gray-700 hover:text-news-primary">

                    <Globe className="h-4 w-4 mr-2" />
                    <span>Visit Website</span>
                  </a>
                  <a
                    href="#"
                    className="flex items-center text-gray-700 hover:text-news-primary">

                    <Mail className="h-4 w-4 mr-2" />
                    <span>Contact Organizer</span>
                  </a>
                  <a
                    href="#"
                    className="flex items-center text-gray-700 hover:text-news-primary">

                    <Phone className="h-4 w-4 mr-2" />
                    <span>(727) 555-1234</span>
                  </a>
                </div>
              </div>
              {/* Reaction bar */}
              <div className="mt-8 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-3">
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200"
                    onClick={() => handleReaction('helpful')}>

                    <ThumbsUp className="h-4 w-4" />
                    <span>Helpful</span>
                    <span className="text-gray-500">{reactions.helpful}</span>
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200"
                    onClick={() => handleReaction('love')}>

                    <Heart className="h-4 w-4" />
                    <span>Love</span>
                    <span className="text-gray-500">{reactions.love}</span>
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 ml-auto"
                    onClick={handleShare}>

                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-200 ${saved ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'}`}
                    onClick={handleSave}>

                    <Bookmark
                      className="h-4 w-4"
                      fill={saved ? 'currentColor' : 'none'} />

                    <span>Save</span>
                  </button>
                </div>
              </div>
            </div>
            {/* Right rail - Sidebar */}
            <aside className="lg:col-span-3">
              {/* Advertisement */}
              <div className="mb-6">
                <div className="text-xs text-gray-400 text-center mb-1">
                  ADVERTISEMENT
                </div>
                <div
                  className="bg-gray-100 rounded-lg p-4 border border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={handleAdClick}>

                  <div className="h-64 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-500 text-center px-4">
                      Promote your business to attendees of local events
                    </span>
                  </div>
                </div>
              </div>
              {/* Related Events */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Similar Events
                </h2>
                <div className="space-y-4">
                  {relatedEvents.map((relatedEvent) =>
                  <div
                    key={relatedEvent.id}
                    className="flex border-b border-gray-100 pb-4 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50 transition-colors rounded p-2"
                    onClick={() => goToEvent(relatedEvent.id)}>

                      <div className="w-16 h-16 rounded overflow-hidden mr-3">
                        <img
                        src={relatedEvent.image}
                        alt={relatedEvent.title}
                        className="w-full h-full object-cover" />

                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">
                          {relatedEvent.title}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatEventDate(relatedEvent.date)}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{relatedEvent.location}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  className="text-news-primary text-sm font-medium mt-4 hover:underline w-full text-center"
                  onClick={() => navigate('/eventsCalendar')}>

                  View All Events
                </button>
              </div>
              {/* Weather Widget Placeholder */}
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    Weather Forecast
                  </h2>
                  <div className="text-sm text-gray-500">For Event Day</div>
                </div>
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      78°
                    </div>
                    <div className="text-sm text-gray-600">Partly Cloudy</div>
                    <div className="text-xs text-gray-500 mt-1">
                      10% chance of rain
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
          {/* Event Report Section */}
          <div className="mt-8 text-center">
            <button className="flex items-center justify-center mx-auto text-gray-500 hover:text-gray-700">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Report this event</span>
            </button>
          </div>
        </div>
      </main>
      {/* Next event preview - shows at 85% scroll */}
      {showNextEvent &&
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 transition-all duration-300 transform translate-y-0 z-20">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden mr-3">
                <img
                src={nextEvent.image}
                alt="Next event thumbnail"
                className="w-full h-full object-cover" />

              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">UP NEXT</div>
                <h3 className="font-display font-bold text-gray-900">
                  {nextEvent.title}
                </h3>
              </div>
            </div>
            <div className="flex items-center">
              <button
              className="bg-news-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-news-primary-dark mr-2"
              onClick={() => goToEvent(nextEvent.id)}>

                View Event
              </button>
              <button
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={dismissNextEvent}>

                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      }
      {/* Save Modal */}
      {showSaveModal &&
      <SaveModal
        onClose={() => setShowSaveModal(false)}
        article={{
          title: event.title,
          category: event.category.toUpperCase(),
          image: event.image
        }} />

      }
      {/* Share Modal */}
      {showShareModal &&
      <ShareModal
        onClose={() => setShowShareModal(false)}
        article={{
          title: event.title
        }} />

      }
    </div>);

};