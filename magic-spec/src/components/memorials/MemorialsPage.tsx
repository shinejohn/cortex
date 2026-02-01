import React, { useEffect, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Share2,
  Heart,
  MessageCircle,
  Calendar,
  PlusCircle,
  Flower,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ExternalLink } from
'lucide-react';
import { NewspaperMasthead } from '../navigation/NewspaperMasthead';
export const MemorialsPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Memorials');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  // Handle scroll for nav transparency
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // Memorial data
  const memorials = [
  {
    id: 1,
    name: 'Margaret Lee Wilson',
    years: '1932 - 2023',
    location: 'Clearwater, FL',
    date: 'July 25, 2023',
    image:
    'https://images.unsplash.com/photo-1551837818-f52fc6991b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    featured: true,
    obituary:
    'Margaret Lee Wilson, 91, of Clearwater, passed away peacefully on July 25, 2023, surrounded by her loving family...',
    serviceDate: 'August 5, 2023',
    serviceLocation: 'First Baptist Church, Clearwater',
    reactions: {
      likes: 58,
      comments: 42
    }
  },
  {
    id: 2,
    name: 'Robert James Thompson',
    years: '1945 - 2023',
    location: 'Dunedin, FL',
    date: 'July 18, 2023',
    image:
    'https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    featured: false,
    obituary:
    'Robert James Thompson, 78, of Dunedin, passed away on July 18, 2023, after a courageous battle with cancer...',
    serviceDate: 'July 28, 2023',
    serviceLocation: 'Dunedin Memorial Gardens',
    reactions: {
      likes: 42,
      comments: 31
    }
  },
  {
    id: 3,
    name: 'Elizabeth Anne Parker',
    years: '1958 - 2023',
    location: 'Palm Harbor, FL',
    date: 'July 10, 2023',
    image:
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    featured: false,
    obituary:
    'Elizabeth Anne Parker, 65, of Palm Harbor, passed away suddenly on July 10, 2023...',
    serviceDate: 'July 20, 2023',
    serviceLocation: 'Palm Harbor United Methodist Church',
    reactions: {
      likes: 37,
      comments: 28
    }
  },
  {
    id: 4,
    name: 'Thomas William Brown',
    years: '1940 - 2023',
    location: 'Clearwater, FL',
    date: 'July 5, 2023',
    image:
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    featured: false,
    obituary:
    'Thomas William Brown, 83, of Clearwater, passed away peacefully on July 5, 2023...',
    serviceDate: 'July 15, 2023',
    serviceLocation: 'Clearwater Community Center',
    reactions: {
      likes: 29,
      comments: 19
    }
  },
  {
    id: 5,
    name: 'Patricia Ann Miller',
    years: '1950 - 2023',
    location: 'Safety Harbor, FL',
    date: 'June 28, 2023',
    image:
    'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    featured: false,
    obituary:
    'Patricia Ann Miller, 73, of Safety Harbor, passed away on June 28, 2023...',
    serviceDate: 'July 8, 2023',
    serviceLocation: 'Safety Harbor Funeral Home',
    reactions: {
      likes: 45,
      comments: 33
    }
  }];

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };
  const handleMainSectionChange = (section) => {
    navigate(`/${section}`);
  };
  const handleMemorialClick = (id) => {
    navigate(`/memorialDetail?id=${id}`);
  };
  const handleCreateMemorial = () => {
    // Navigate to memorial creation page
    navigate('/createMemorial');
  };
  const navigateToAdvertisingDetail = () => {
    navigate('/advertisingDetail');
  };
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <StickyNav
        scrolled={scrolled}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onMainSectionChange={handleMainSectionChange} />

      <div className="container mx-auto px-4 py-6 mt-28">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">In Memoriam</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search memorials..."
              className="w-64 rounded-full border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-news-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} />

            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        {/* Filters */}
        <div className="mb-6">
          <button
            className="flex items-center text-gray-700 hover:text-news-primary mb-2"
            onClick={() => setShowFilters(!showFilters)}>

            <Filter className="h-4 w-4 mr-2" />
            <span>Filter Memorials</span>
            <ChevronDown
              className={`h-4 w-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />

          </button>
          {showFilters &&
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <select
                className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}>

                  <option value="all">All Dates</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                  <option value="year">Past Year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <select
                className="w-full rounded-md border border-gray-300 py-2 px-3 text-sm"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}>

                  <option value="all">All Locations</option>
                  <option value="clearwater">Clearwater</option>
                  <option value="dunedin">Dunedin</option>
                  <option value="palm-harbor">Palm Harbor</option>
                  <option value="safety-harbor">Safety Harbor</option>
                </select>
              </div>
            </div>
          }
        </div>
        {/* Create Memorial CTA */}
        <div className="bg-gray-100 rounded-lg p-6 mb-8 border border-gray-200">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 md:mr-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Create a Memorial Tribute
              </h2>
              <p className="text-gray-600">
                Honor and remember your loved ones with a lasting online
                memorial.
              </p>
            </div>
            <button
              onClick={handleCreateMemorial}
              className="bg-news-primary text-white px-6 py-3 rounded-md hover:bg-news-primary-dark transition-colors flex items-center">

              <PlusCircle className="h-5 w-5 mr-2" />
              Create Memorial
            </button>
          </div>
        </div>
        {/* First Ad */}
        <div
          className="bg-gray-100 rounded-lg p-4 text-center border border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors mb-8"
          onClick={navigateToAdvertisingDetail}>

          <p className="text-xs text-gray-500 mb-2">ADVERTISEMENT</p>
          <div className="h-24 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-400">
              Funeral Services and Memorial Products
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Recent Memorials
            </h2>
            {/* Featured Memorial */}
            {memorials.
            filter((m) => m.featured).
            map((memorial) =>
            <div
              key={memorial.id}
              className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleMemorialClick(memorial.id)}>

                  <div className="px-4 py-3 flex items-center bg-gray-50 border-l-4 border-gray-400">
                    <Flower className="h-5 w-5 text-gray-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Featured Memorial Tribute
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-1/3">
                        <img
                      src={memorial.image}
                      alt={memorial.name}
                      className="w-full h-auto rounded-lg shadow-sm grayscale" />

                      </div>
                      <div className="w-full md:w-2/3">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {memorial.name}
                        </h3>
                        <p className="text-gray-600 mb-3">{memorial.years}</p>
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{memorial.location}</span>
                          <span className="mx-2">•</span>
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{memorial.date}</span>
                        </div>
                        <p className="text-gray-700 mb-4 line-clamp-3">
                          {memorial.obituary}
                        </p>
                        <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-1 text-gray-500" />
                            <span className="font-medium">Service:</span>
                            <span className="ml-1 text-gray-600">
                              {memorial.serviceDate} at{' '}
                              {memorial.serviceLocation}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <button className="flex items-center text-gray-500">
                              <Heart className="h-5 w-5 mr-1" />
                              <span>{memorial.reactions.likes}</span>
                            </button>
                            <button className="flex items-center text-gray-500">
                              <MessageCircle className="h-5 w-5 mr-1" />
                              <span>{memorial.reactions.comments}</span>
                            </button>
                          </div>
                          <button className="text-news-primary text-sm font-medium hover:underline">
                            View Memorial
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
            )}
            {/* Second Ad - In-feed placement */}
            <div
              className="bg-gray-100 rounded-lg p-4 text-center border border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={navigateToAdvertisingDetail}>

              <p className="text-xs text-gray-500 mb-2">ADVERTISEMENT</p>
              <div className="h-32 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-400">
                  Memorial Flowers and Gifts
                </span>
              </div>
            </div>
            {/* Regular Memorials */}
            <div className="space-y-4">
              {memorials.
              filter((m) => !m.featured).
              map((memorial) =>
              <div
                key={memorial.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleMemorialClick(memorial.id)}>

                    <div className="p-4">
                      <div className="flex">
                        <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                          <img
                        src={memorial.image}
                        alt={memorial.name}
                        className="w-full h-full object-cover grayscale" />

                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {memorial.name}
                          </h3>
                          <p className="text-gray-600 text-sm mb-1">
                            {memorial.years}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{memorial.location}</span>
                            <span className="mx-2">•</span>
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{memorial.date}</span>
                          </div>
                          <p className="text-gray-700 text-sm line-clamp-2">
                            {memorial.obituary}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-3">
                              <button className="flex items-center text-gray-500 text-xs">
                                <Heart className="h-4 w-4 mr-1" />
                                <span>{memorial.reactions.likes}</span>
                              </button>
                              <button className="flex items-center text-gray-500 text-xs">
                                <MessageCircle className="h-4 w-4 mr-1" />
                                <span>{memorial.reactions.comments}</span>
                              </button>
                            </div>
                            <button className="text-news-primary text-xs font-medium hover:underline">
                              View Memorial
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
              )}
            </div>
            {/* Load More Button */}
            <div className="flex justify-center mt-8">
              <button className="px-6 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark transition-colors">
                Load More
              </button>
            </div>
          </div>
          {/* Sidebar - 1 column */}
          <div className="space-y-8">
            {/* Third Ad - Sidebar */}
            <div
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              onClick={navigateToAdvertisingDetail}>

              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Support Services
              </h3>
              <div className="bg-gray-100 rounded-lg p-3 text-center border border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors">
                <p className="text-xs text-gray-500 mb-2">ADVERTISEMENT</p>
                <div className="h-40 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-400">
                    Grief Counseling Services
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Find support during difficult times with professional grief
                counseling services.
              </p>
              <button className="w-full mt-3 bg-news-primary text-white py-2 rounded-md hover:bg-news-primary-dark transition-colors text-sm">
                Learn More
              </button>
            </div>
            {/* Resources */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Helpful Resources
              </h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-news-primary mr-2">•</span>
                  <a href="#" className="hover:underline">
                    Guide to Planning a Memorial Service
                  </a>
                </li>
                <li className="flex items-start">
                  <span className="text-news-primary mr-2">•</span>
                  <a href="#" className="hover:underline">
                    Understanding Grief and Loss
                  </a>
                </li>
                <li className="flex items-start">
                  <span className="text-news-primary mr-2">•</span>
                  <a href="#" className="hover:underline">
                    Local Support Groups
                  </a>
                </li>
                <li className="flex items-start">
                  <span className="text-news-primary mr-2">•</span>
                  <a href="#" className="hover:underline">
                    Legal Matters After Loss
                  </a>
                </li>
                <li className="flex items-start">
                  <span className="text-news-primary mr-2">•</span>
                  <a href="#" className="hover:underline">
                    Creating Lasting Tributes
                  </a>
                </li>
              </ul>
            </div>
            {/* Upcoming Memorial Services */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Upcoming Services
                </h3>
                <Calendar className="h-5 w-5 text-news-primary" />
              </div>
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>Clearwater</span>
                    <span className="mx-1">•</span>
                    <span>Aug 5</span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Margaret Lee Wilson Memorial Service
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    First Baptist Church, 10:00 AM
                  </p>
                </div>
                <div className="border-b border-gray-100 pb-3">
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>Palm Harbor</span>
                    <span className="mx-1">•</span>
                    <span>Aug 8</span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900">
                    James Edward Davis Celebration of Life
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Palm Harbor Community Center, 2:00 PM
                  </p>
                </div>
                <div>
                  <div className="flex items-center text-xs text-gray-500 mb-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>Dunedin</span>
                    <span className="mx-1">•</span>
                    <span>Aug 12</span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Sarah Jane Miller Memorial
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Dunedin Cemetery, 11:00 AM
                  </p>
                </div>
              </div>
            </div>
            {/* Fourth Ad */}
            <div
              className="bg-gray-100 rounded-lg p-4 text-center border border-dashed border-gray-300 cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={navigateToAdvertisingDetail}>

              <p className="text-xs text-gray-500 mb-2">ADVERTISEMENT</p>
              <div className="h-48 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-400">Memorial Foundations</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};