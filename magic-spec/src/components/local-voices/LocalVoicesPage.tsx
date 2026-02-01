import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  ChevronDown,
  Bell,
  Mic,
  Video,
  Newspaper,
  Music,
  X,
  ChevronRight,
  Loader,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Share,
  Bookmark,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Filter,
  SlidersHorizontal,
  Star,
  Verified } from
'lucide-react';
import { SocialShare, ShareButton } from '../common/SocialShare';
export const LocalVoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>('trending');
  const [activeFilterTab, setActiveFilterTab] = useState<string>('all');
  const [location_, setLocation] = useState<string>('Clearwater, FL');
  const [showLocationDropdown, setShowLocationDropdown] =
  useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [isFollowing, setIsFollowing] = useState<{
    [key: string]: boolean;
  }>({});
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('trending');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showShareOptions, setShowShareOptions] = useState<{
    [key: string]: boolean;
  }>({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState<{
    [key: string]: boolean;
  }>({});
  const [isPlaying, setIsPlaying] = useState<{
    [key: string]: boolean;
  }>({});
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [audioVolume, setAudioVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState<boolean>(false);
  const [currentAudioInfo, setCurrentAudioInfo] = useState<any>(null);
  const [notificationCount, setNotificationCount] = useState<number>(3);
  // Refs for dropdowns and audio
  const audioRef = useRef<HTMLAudioElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const shareOptionsRefs = useRef<{
    [key: string]: HTMLDivElement | null;
  }>({});
  const audioPlayerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Mock data for category counts
  const categoryCounts = {
    audio: 128,
    video: 73,
    news: 96,
    community: 105
  };
  // Filter options
  const categoryOptions = [
  {
    id: 'all',
    name: 'All Categories'
  },
  {
    id: 'news',
    name: 'News & Politics'
  },
  {
    id: 'business',
    name: 'Business'
  },
  {
    id: 'culture',
    name: 'Culture & Arts'
  },
  {
    id: 'sports',
    name: 'Sports'
  },
  {
    id: 'education',
    name: 'Education'
  },
  {
    id: 'entertainment',
    name: 'Entertainment'
  },
  {
    id: 'technology',
    name: 'Technology'
  },
  {
    id: 'health',
    name: 'Health & Wellness'
  },
  {
    id: 'family',
    name: 'Family & Parenting'
  }];

  const sortOptions = [
  {
    id: 'trending',
    name: 'Trending'
  },
  {
    id: 'newest',
    name: 'Newest'
  },
  {
    id: 'popular',
    name: 'Most Popular'
  },
  {
    id: 'followers',
    name: 'Most Followers'
  }];

  // Mock featured creators data
  const featuredCreators = [
  {
    id: '1',
    name: 'Sarah Martinez',
    slug: 'sarah-martinez',
    category: 'News & Politics',
    description: 'Local government coverage and community issues',
    followers: 2847,
    episodes: 45,
    avatar:
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    verified: true,
    latest_episode: {
      title: 'City Council Budget Breakdown',
      duration: '32:15',
      published_at: '2024-01-15T10:00:00Z',
      audio_url: 'https://example.com/audio1.mp3'
    }
  },
  {
    id: '2',
    name: 'Mike Thompson',
    slug: 'mike-thompson',
    category: 'Sports',
    description: 'High school and local sports coverage',
    followers: 1923,
    episodes: 78,
    avatar:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    verified: false,
    latest_episode: {
      title: 'Friday Night Lights Recap',
      duration: '28:45',
      published_at: '2024-01-14T18:00:00Z',
      audio_url: 'https://example.com/audio2.mp3'
    }
  },
  {
    id: '3',
    name: 'Emma Chen',
    slug: 'emma-chen',
    category: 'Culture & Arts',
    description: 'Local arts scene and cultural events',
    followers: 3156,
    episodes: 62,
    avatar:
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    verified: true,
    latest_episode: {
      title: 'Gallery Walk Downtown',
      duration: '41:20',
      published_at: '2024-01-13T14:00:00Z',
      audio_url: 'https://example.com/audio3.mp3'
    }
  }];

  // Handle browse category - MODIFIED to filter content instead of navigating
  const handleBrowseCategory = (category: string) => {
    console.log(`Filtering by type: ${category}`);
    setTypeFilter(category);
    // Scroll to the featured creators section
    const featuredSection = document.getElementById('featured-creators');
    if (featuredSection) {
      featuredSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  };
  // Get filtered creators based on type and category
  const getFilteredCreators = (creators: any[]) => {
    // Filter first by type if it's not 'all'
    let filtered = creators;
    if (typeFilter !== 'all') {
      filtered = creators.filter((creator) => {
        // Match creator type (audio, video, news, community)
        if (typeFilter === 'audio' && creator.latest_episode?.audio_url) {
          return true;
        }
        if (
        typeFilter === 'video' &&
        creator.category.toLowerCase().includes('video'))
        {
          return true;
        }
        if (
        typeFilter === 'news' && (
        creator.category.toLowerCase().includes('news') ||
        creator.category.toLowerCase().includes('politics')))
        {
          return true;
        }
        if (
        typeFilter === 'community' && (
        creator.category.toLowerCase().includes('culture') ||
        creator.category.toLowerCase().includes('arts') ||
        creator.category.toLowerCase().includes('music')))
        {
          return true;
        }
        return false;
      });
    }
    // Then filter by category if it's not 'all'
    if (categoryFilter === 'all') return filtered;
    return filtered.filter((creator) => {
      // Case-insensitive comparison for better matching
      const creatorCategory = creator.category.toLowerCase();
      const filterCategory = categoryFilter.toLowerCase();
      // Match either exact category or partial match for subcategories
      return (
        creatorCategory === filterCategory ||
        creatorCategory.includes(filterCategory) ||
        filterCategory.includes(creatorCategory));

    });
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };
  const handleFilterChange = (type: string, value: string) => {
    if (type === 'category') {
      setCategoryFilter(value);
    } else if (type === 'sort') {
      setSortBy(value);
    }
  };
  const handleViewAllCreators = () => {
    console.log('View all creators');
  };
  const handleViewMoreCreators = () => {
    console.log('View more creators');
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hidden audio element for playing episodes */}
      <audio ref={audioRef} className="hidden" />
      {/* Simple Line Menu Masthead */}
      <header className="bg-white border-b border-gray-200 py-2">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link
                to="/"
                className="font-display text-2xl font-bold text-news-primary"
                aria-label="Day.News Home">

                Day.News
              </Link>
            </div>
            <nav
              className="flex items-center space-x-6"
              aria-label="Main Navigation">

              <Link
                to="/"
                className="text-gray-600 hover:text-news-primary font-medium transition-colors">

                Home
              </Link>
              <Link
                to="/news"
                className="text-gray-600 hover:text-news-primary font-medium transition-colors">

                News
              </Link>
              <Link
                to="/business"
                className="text-gray-600 hover:text-news-primary font-medium transition-colors">

                Business
              </Link>
              <Link
                to="/events"
                className="text-gray-600 hover:text-news-primary font-medium transition-colors">

                Events
              </Link>
              <Link
                to="/local-voices"
                className="text-news-primary font-semibold"
                aria-current="page">

                Local Voices
              </Link>
              <Link
                to="/government"
                className="text-gray-600 hover:text-news-primary font-medium transition-colors">

                Government
              </Link>
              <Link
                to="/sports"
                className="text-gray-600 hover:text-news-primary font-medium transition-colors">

                Sports
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <div className="relative" ref={notificationRef}>
                <button
                  className="text-gray-600 hover:text-news-primary relative p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-news-primary"
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label={`Notifications (${notificationCount} unread)`}
                  aria-expanded={showNotifications}
                  aria-haspopup="true">

                  <Bell className="h-5 w-5" />
                  {notificationCount > 0 &&
                  <span
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
                    aria-hidden="true">

                      {notificationCount}
                    </span>
                  }
                </button>
              </div>
              <div className="relative user-menu" ref={userMenuRef}>
                <button
                  className="flex items-center hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-news-primary rounded-md"
                  onClick={toggleUserMenu}
                  aria-label="User menu"
                  aria-expanded={showUserMenu}
                  aria-haspopup="true">

                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt="User profile"
                    className="h-8 w-8 rounded-full object-cover" />

                  <ChevronDown
                    className="h-4 w-4 ml-1 text-gray-500"
                    aria-hidden="true" />

                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Reduced Height Hero Search Section */}
      <section className="bg-gradient-to-r from-news-primary to-news-primary-dark py-3 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true">

            <defs>
              <pattern
                id="wave"
                width="100"
                height="20"
                patternUnits="userSpaceOnUse">

                <path
                  d="M0 10 Q 25 20, 50 10 T 100 10 V 0 H 0 Z"
                  fill="white" />

              </pattern>
              <pattern
                id="wave2"
                width="100"
                height="15"
                patternUnits="userSpaceOnUse">

                <path
                  d="M0 15 Q 20 5, 40 15 T 80 15 T 100 15 V 0 H 0 Z"
                  fill="white" />

              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#wave)" />
            <rect x="0" y="50" width="100%" height="100%" fill="url(#wave2)" />
          </svg>
        </div>
        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="text-center mb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-black">
              Discover Local Voices
            </h1>
            <p className="text-base text-black max-w-3xl mx-auto">
              Podcasts and multimedia content from your community
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-3">
            <form onSubmit={handleSearch} className="space-y-2">
              <div className="flex flex-col md:flex-row gap-2">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <label htmlFor="search-input" className="sr-only">
                    Search creators, shows, or topics
                  </label>
                  <input
                    id="search-input"
                    type="text"
                    placeholder="Search creators, shows, or topics"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    ref={searchInputRef}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pl-9 focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-news-primary transition-colors"
                    aria-label="Search creators, shows, or topics" />

                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"
                    aria-hidden="true" />

                </div>
                {/* Location Selector */}
                <div className="relative w-full md:w-64 location-dropdown">
                  <label htmlFor="location-selector" className="sr-only">
                    Select location
                  </label>
                  <button
                    id="location-selector"
                    type="button"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-news-primary transition-colors"
                    onClick={() =>
                    setShowLocationDropdown(!showLocationDropdown)
                    }
                    aria-haspopup="listbox"
                    aria-expanded={showLocationDropdown}
                    aria-label="Select location">

                    <div className="flex items-center">
                      <MapPin
                        className="h-4 w-4 mr-2 text-gray-500"
                        aria-hidden="true" />

                      <span className="text-gray-800">{location_}</span>
                    </div>
                    <ChevronDown
                      className="h-4 w-4 text-gray-500"
                      aria-hidden="true" />

                  </button>
                </div>
                {/* Search Button */}
                <button
                  type="submit"
                  className="bg-news-primary hover:bg-news-primary-dark text-white font-medium rounded-lg px-6 py-2 md:w-auto w-full flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-news-primary"
                  aria-label="Search"
                  disabled={isLoading}>

                  {isLoading ?
                  <>
                      <Loader
                      className="animate-spin h-4 w-4 mr-2"
                      aria-hidden="true" />

                      Searching...
                    </> :

                  'Search'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
      {/* Loading State */}
      {isLoading && <div>{/* Placeholder for loading state content */}</div>}
      {/* Error State */}
      {hasError && !isLoading &&
      <div>{/* Placeholder for error state content */}</div>
      }
      {/* Main Content - Only show when not loading and no error */}
      {!isLoading && !hasError &&
      <>
          {/* Browse by Type Section - Reduced padding and properly filtering content */}
          <section className="py-3 bg-white">
            <div className="container mx-auto px-4 max-w-7xl">
              <h2
              className="text-xl font-bold text-gray-900 mb-2"
              id="browse-by-type">

                Browse by Type
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Audio Creators Card */}
                <div
                className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer focus-within:ring-2 focus-within:ring-news-primary ${typeFilter === 'audio' ? 'ring-2 ring-news-primary' : ''}`}
                onClick={() =>
                handleBrowseCategory(
                  typeFilter === 'audio' ? 'all' : 'audio'
                )
                }
                tabIndex="0"
                role="button"
                aria-label="Filter by Audio Creators"
                aria-pressed={typeFilter === 'audio'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleBrowseCategory(
                      typeFilter === 'audio' ? 'all' : 'audio'
                    );
                  }
                }}>

                  <div className="h-16 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Mic className="h-8 w-8 text-white" aria-hidden="true" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      Audio Creators
                    </h3>
                    <p className="text-xs text-gray-600 mb-1">
                      Local podcasts and audio shows
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="font-medium text-news-primary">
                        {categoryCounts.audio}
                      </span>
                      <span className="ml-1">creators</span>
                    </div>
                  </div>
                </div>
                {/* Video Creators Card */}
                <div
                className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer focus-within:ring-2 focus-within:ring-news-primary ${typeFilter === 'video' ? 'ring-2 ring-news-primary' : ''}`}
                onClick={() =>
                handleBrowseCategory(
                  typeFilter === 'video' ? 'all' : 'video'
                )
                }
                tabIndex="0"
                role="button"
                aria-label="Filter by Video Shows"
                aria-pressed={typeFilter === 'video'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleBrowseCategory(
                      typeFilter === 'video' ? 'all' : 'video'
                    );
                  }
                }}>

                  <div className="h-16 bg-gradient-to-r from-red-500 to-pink-600 flex items-center justify-center">
                    <Video className="h-8 w-8 text-white" aria-hidden="true" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      Video Shows
                    </h3>
                    <p className="text-xs text-gray-600 mb-1">
                      Video podcasts and vodcasts
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="font-medium text-news-primary">
                        {categoryCounts.video}
                      </span>
                      <span className="ml-1">creators</span>
                    </div>
                  </div>
                </div>
                {/* News Shows Card */}
                <div
                className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer focus-within:ring-2 focus-within:ring-news-primary ${typeFilter === 'news' ? 'ring-2 ring-news-primary' : ''}`}
                onClick={() =>
                handleBrowseCategory(typeFilter === 'news' ? 'all' : 'news')
                }
                tabIndex="0"
                role="button"
                aria-label="Filter by News & Politics"
                aria-pressed={typeFilter === 'news'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleBrowseCategory(
                      typeFilter === 'news' ? 'all' : 'news'
                    );
                  }
                }}>

                  <div className="h-16 bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
                    <Newspaper
                    className="h-8 w-8 text-white"
                    aria-hidden="true" />

                  </div>
                  <div className="p-3">
                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      News & Politics
                    </h3>
                    <p className="text-xs text-gray-600 mb-1">
                      Stay informed on local issues
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="font-medium text-news-primary">
                        {categoryCounts.news}
                      </span>
                      <span className="ml-1">creators</span>
                    </div>
                  </div>
                </div>
                {/* Community Voices Card */}
                <div
                className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer focus-within:ring-2 focus-within:ring-news-primary ${typeFilter === 'community' ? 'ring-2 ring-news-primary' : ''}`}
                onClick={() =>
                handleBrowseCategory(
                  typeFilter === 'community' ? 'all' : 'community'
                )
                }
                tabIndex="0"
                role="button"
                aria-label="Filter by Culture & Events"
                aria-pressed={typeFilter === 'community'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleBrowseCategory(
                      typeFilter === 'community' ? 'all' : 'community'
                    );
                  }
                }}>

                  <div className="h-16 bg-gradient-to-r from-purple-500 to-violet-600 flex items-center justify-center">
                    <Music className="h-8 w-8 text-white" aria-hidden="true" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      Culture & Events
                    </h3>
                    <p className="text-xs text-gray-600 mb-1">
                      Arts, music, and local culture
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="font-medium text-news-primary">
                        {categoryCounts.community}
                      </span>
                      <span className="ml-1">creators</span>
                    </div>
                  </div>
                </div>
              </div>
              {typeFilter !== 'all' &&
            <div className="mt-2 flex justify-center">
                  <button
                onClick={() => setTypeFilter('all')}
                className="text-news-primary hover:text-news-primary-dark text-sm font-medium flex items-center">

                    <X className="h-4 w-4 mr-1" />
                    Clear filter
                  </button>
                </div>
            }
            </div>
          </section>
          {/* Featured Creators Grid */}
          <section className="py-4 bg-gray-50">
            <div className="container mx-auto px-4 max-w-7xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-2">
                <h2
                className="text-xl font-bold text-gray-900"
                id="featured-creators">

                  Featured Creators
                  {typeFilter !== 'all' &&
                <span className="ml-2 text-sm font-normal text-gray-600">
                      Filtered by:{' '}
                      {typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                    </span>
                }
                </h2>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  {/* Category Filter */}
                  <div className="relative w-full sm:w-48">
                    <label htmlFor="category-filter" className="sr-only">
                      Filter by category
                    </label>
                    <select
                    id="category-filter"
                    className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-1.5 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-news-primary transition-colors"
                    value={categoryFilter}
                    onChange={(e) =>
                    handleFilterChange('category', e.target.value)
                    }
                    aria-label="Filter by category">

                      {categoryOptions.map((option) =>
                    <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                    )}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDown
                      className="h-4 w-4 text-gray-500"
                      aria-hidden="true" />

                    </div>
                  </div>
                  <button
                  onClick={handleViewAllCreators}
                  className="text-news-primary hover:text-news-primary-dark font-medium flex items-center justify-center sm:justify-start focus:outline-none focus:underline"
                  aria-label="View all creators">

                    View all creators
                    <ChevronRight className="h-5 w-5 ml-1" aria-hidden="true" />
                  </button>
                </div>
              </div>
              {/* Featured Creators Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredCreators(featuredCreators).length > 0 ?
              getFilteredCreators(featuredCreators).map((creator) =>
              <div
                key={creator.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">

                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center">
                            <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="h-12 w-12 rounded-full object-cover mr-3" />

                            <div>
                              <div className="flex items-center">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {creator.name}
                                </h3>
                                {creator.verified &&
                          <Verified className="h-4 w-4 text-blue-500 ml-1" />
                          }
                              </div>
                              <p className="text-sm text-gray-600">
                                {creator.category}
                              </p>
                            </div>
                          </div>
                          <ShareButton
                      onClick={() => setShowShareModal(true)}
                      className="text-gray-400 hover:text-gray-600" />

                        </div>
                        <p className="text-gray-700 mb-3 text-sm">
                          {creator.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                          <span>
                            {creator.followers.toLocaleString()} followers
                          </span>
                          <span>{creator.episodes} episodes</span>
                        </div>
                        {creator.latest_episode &&
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <h4 className="font-medium text-gray-900 mb-1 text-sm">
                              Latest Episode
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {creator.latest_episode.title}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {creator.latest_episode.duration}
                              </span>
                              <button className="text-news-primary hover:text-news-primary-dark">
                                <Play className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                  }
                        <div className="flex items-center justify-between">
                          <Link
                      to={`/local-voices/creator/${creator.slug}`}
                      className="text-news-primary hover:text-news-primary-dark font-medium text-sm">

                            View Profile
                          </Link>
                          <button className="bg-news-primary text-white px-4 py-1.5 rounded-lg text-sm hover:bg-news-primary-dark transition-colors">
                            Follow
                          </button>
                        </div>
                      </div>
                    </div>
              ) :

              <div className="col-span-full py-6 text-center">
                    <p className="text-gray-500">
                      No creators found matching the current filters. Try
                      selecting different filters.
                    </p>
                    <button
                  onClick={() => {
                    setTypeFilter('all');
                    setCategoryFilter('all');
                  }}
                  className="mt-2 text-news-primary hover:text-news-primary-dark text-sm font-medium">

                      Clear all filters
                    </button>
                  </div>
              }
              </div>
            </div>
          </section>
          {/* Discover Section */}
          <section className="py-4 bg-white">
            <div className="container mx-auto px-4 max-w-7xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-3 gap-2">
                <h2 className="text-xl font-bold text-gray-900" id="discover">
                  Discover
                  {typeFilter !== 'all' &&
                <span className="ml-2 text-sm font-normal text-gray-600">
                      Filtered by:{' '}
                      {typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                    </span>
                }
                </h2>
                <div className="flex flex-wrap gap-2">
                  {/* Sort Dropdown */}
                  <div className="relative w-full sm:w-48">
                    <label htmlFor="sort-by" className="sr-only">
                      Sort by
                    </label>
                    <select
                    id="sort-by"
                    className="appearance-none w-full bg-white border border-gray-200 rounded-lg py-1.5 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-news-primary focus:border-news-primary transition-colors"
                    value={sortBy}
                    onChange={(e) =>
                    handleFilterChange('sort', e.target.value)
                    }
                    aria-label="Sort by">

                      {sortOptions.map((option) =>
                    <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                    )}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <ChevronDown
                      className="h-4 w-4 text-gray-500"
                      aria-hidden="true" />

                    </div>
                  </div>
                  <button
                  onClick={handleViewMoreCreators}
                  className="text-news-primary hover:text-news-primary-dark font-medium flex items-center justify-center sm:justify-start focus:outline-none focus:underline"
                  aria-label="View more creators">

                    View more creators
                    <ChevronRight className="h-5 w-5 ml-1" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredCreators(featuredCreators).map((creator) =>
              <div
                key={`discover-${creator.id}`}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">

                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <img
                        src={creator.avatar}
                        alt={creator.name}
                        className="h-12 w-12 rounded-full object-cover mr-3" />

                          <div>
                            <div className="flex items-center">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {creator.name}
                              </h3>
                              {creator.verified &&
                          <Verified className="h-4 w-4 text-blue-500 ml-1" />
                          }
                            </div>
                            <p className="text-sm text-gray-600">
                              {creator.category}
                            </p>
                          </div>
                        </div>
                        <ShareButton
                      onClick={() => setShowShareModal(true)}
                      className="text-gray-400 hover:text-gray-600" />

                      </div>
                      <p className="text-gray-700 mb-3 text-sm">
                        {creator.description}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>
                          {creator.followers.toLocaleString()} followers
                        </span>
                        <span>{creator.episodes} episodes</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Link
                      to={`/local-voices/creator/${creator.slug}`}
                      className="text-news-primary hover:text-news-primary-dark font-medium text-sm">

                          View Profile
                        </Link>
                        <button className="bg-news-primary text-white px-4 py-1.5 rounded-lg text-sm hover:bg-news-primary-dark transition-colors">
                          Follow
                        </button>
                      </div>
                    </div>
                  </div>
              )}
              </div>
            </div>
          </section>
        </>
      }
      {/* Share Modal */}
      {showShareModal &&
      <SocialShare
        title="Discover Local Voices"
        url={window.location.href}
        description="Explore podcasts and multimedia content from your local community"
        displayAsModal={true}
        onClose={() => setShowShareModal(false)} />

      }
    </div>);

};