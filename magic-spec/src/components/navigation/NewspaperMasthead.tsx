import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  User,
  Bell,
  ChevronDown,
  Edit,
  FileText,
  ShoppingBag,
  Megaphone,
  Gavel,
  Calendar,
  Menu as MenuIcon,
  X } from
'lucide-react';
import { HeaderAdvertising } from '../hero/HeaderAdvertising';
import { useLocationDetection } from '../location/LocationDetector';
export const NewspaperMasthead = ({
  scrolled = false,
  activeCategory = 'News',
  onCategoryChange,
  onMainSectionChange,
  isFixed = false
}) => {
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { locationData } = useLocationDetection();
  const location = locationData?.city || 'Clearwater';
  const handleCategoryClick = (category) => {
    onCategoryChange(category);
  };
  const handleSectionClick = (section) => {
    if (section === 'home') {
      navigate('/');
    } else {
      navigate(`/${section}`);
    }
    setMobileMenuOpen(false);
  };
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/search');
    }
  };
  // New function to handle action menu clicks
  const handleActionClick = (action) => {
    switch (action) {
      case 'write':
        navigate('/create-article');
        break;
      case 'advertise':
        // We don't have a dedicated advertising page, so redirect to publish
        navigate('/publish');
        break;
      case 'sell':
        navigate('/postListing');
        break;
      case 'announce':
        navigate('/announcementCreator');
        break;
      case 'notice':
        navigate('/legalNoticeCreator');
        break;
      case 'schedule':
        navigate('/eventCreator');
        break;
      default:
        navigate('/publish');
    }
    setMobileMenuOpen(false);
  };
  return (
    <div
      className={`${isFixed ? 'fixed' : 'relative'} top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-transparent'}`}>

      <div className="container mx-auto px-4">
        {/* Top navigation bar - User profile, search and notifications */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center">
            <div
              className="flex items-center cursor-pointer"
              onClick={() => navigate('/')}>

              <img
                src="/image.png"
                alt="Logo"
                className="h-8 w-8 rounded-full" />

              <h1 className="ml-2 font-display text-xl font-bold text-news-primary">
                Day.news
              </h1>
            </div>
          </div>
          {/* Search and user actions */}
          <div className="flex items-center space-x-4">
            {/* Hamburger menu button for mobile */}
            <button
              className="md:hidden text-gray-700 hover:text-news-primary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}>

              {mobileMenuOpen ?
              <X className="h-6 w-6" /> :

              <MenuIcon className="h-6 w-6" />
              }
            </button>
            {/* Search form */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center relative">

              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 lg:w-64 bg-gray-100 border border-gray-200 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-news-primary" />

              <button type="submit" className="absolute right-3 text-gray-500">
                <Search className="h-4 w-4" />
              </button>
            </form>
            {/* Notifications */}
            <button
              onClick={() => navigate('/announcements')}
              className="text-gray-700 hover:text-news-primary relative">

              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-1">

                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
              </button>
              {showUserDropdown &&
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <button
                  onClick={() => {
                    navigate('/profile');
                    setShowUserDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">

                    Your Profile
                  </button>
                  <button
                  onClick={() => {
                    navigate('/publish');
                    setShowUserDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">

                    Publish Content
                  </button>
                  <button
                  onClick={() => {
                    navigate('/settings');
                    setShowUserDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">

                    Settings
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                  onClick={() => {
                    navigate('/');
                    setShowUserDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">

                    Sign out
                  </button>
                </div>
              }
            </div>
            {/* Write button */}
            <button
              onClick={() => navigate('/create-article')}
              className="hidden md:block bg-news-primary hover:bg-news-primary-dark text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">

              Write
            </button>
          </div>
        </div>
        {/* Mobile menu overlay */}
        {mobileMenuOpen &&
        <div
          className="md:hidden fixed inset-0 z-50 bg-gray-900 bg-opacity-50"
          onClick={() => setMobileMenuOpen(false)}>

            <div
            className="absolute top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}>

              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="font-bold text-lg text-news-primary">Menu</h2>
                <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-500 hover:text-gray-700">

                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="overflow-y-auto h-full pb-20">
                {/* Mobile Search */}
                <div className="p-4 border-b border-gray-200">
                  <form onSubmit={handleSearch} className="relative">
                    <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-100 border border-gray-200 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-news-primary" />

                    <button
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">

                      <Search className="h-4 w-4" />
                    </button>
                  </form>
                </div>
                {/* Main Navigation */}
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-xs uppercase text-gray-500 font-semibold mb-2">
                    Navigation
                  </h3>
                  <nav className="space-y-1">
                    <button
                    onClick={() => handleSectionClick('home')}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${activeCategory === 'News' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-700 hover:bg-gray-100'}`}>

                      News
                    </button>
                    <button
                    onClick={() => handleSectionClick('announcements')}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${activeCategory === 'Announcements' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-700 hover:bg-gray-100'}`}>

                      Announcements
                    </button>
                    <button
                    onClick={() => handleSectionClick('eventsCalendar')}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${activeCategory === 'Events' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-700 hover:bg-gray-100'}`}>

                      Events
                    </button>
                    <button
                    onClick={() => handleSectionClick('legalNoticesList')}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${activeCategory === 'LegalNotices' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-700 hover:bg-gray-100'}`}>

                      Legal Notices
                    </button>
                    <button
                    onClick={() => handleSectionClick('businessDirectory')}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${activeCategory === 'Business' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-700 hover:bg-gray-100'}`}>

                      Business
                    </button>
                    <button
                    onClick={() => handleSectionClick('classifieds')}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${activeCategory === 'Classifieds' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-700 hover:bg-gray-100'}`}>

                      Classifieds
                    </button>
                    <button
                    onClick={() => handleSectionClick('local-voices')}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${activeCategory === 'LocalVoices' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-700 hover:bg-gray-100'}`}>

                      Local Voices
                    </button>
                    <button
                    onClick={() => handleSectionClick('coupons')}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${activeCategory === 'Coupons' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-700 hover:bg-gray-100'}`}>

                      Coupons
                    </button>
                    <button
                    onClick={() => handleSectionClick('photos')}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md ${activeCategory === 'Photos' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-700 hover:bg-gray-100'}`}>

                      Photos
                    </button>
                  </nav>
                </div>
                {/* Action Menu */}
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-xs uppercase text-gray-500 font-semibold mb-2">
                    Actions
                  </h3>
                  <div className="space-y-1">
                    <button
                    onClick={() => handleActionClick('write')}
                    className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 flex items-center">

                      <Edit className="h-4 w-4 mr-2" />
                      Write
                    </button>
                    <button
                    onClick={() => handleActionClick('advertise')}
                    className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 flex items-center">

                      <FileText className="h-4 w-4 mr-2" />
                      Advertise
                    </button>
                    <button
                    onClick={() => handleActionClick('sell')}
                    className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 flex items-center">

                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Sell
                    </button>
                    <button
                    onClick={() => handleActionClick('announce')}
                    className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 flex items-center">

                      <Megaphone className="h-4 w-4 mr-2" />
                      Announce
                    </button>
                    <button
                    onClick={() => handleActionClick('notice')}
                    className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 flex items-center">

                      <Gavel className="h-4 w-4 mr-2" />
                      Notice
                    </button>
                    <button
                    onClick={() => handleActionClick('schedule')}
                    className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100 flex items-center">

                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule
                    </button>
                  </div>
                </div>
                {/* User Actions */}
                <div className="p-4">
                  <h3 className="text-xs uppercase text-gray-500 font-semibold mb-2">
                    Account
                  </h3>
                  <div className="space-y-1">
                    <button
                    onClick={() => {
                      navigate('/profile');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">

                      Your Profile
                    </button>
                    <button
                    onClick={() => {
                      navigate('/settings');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">

                      Settings
                    </button>
                    <button
                    onClick={() => {
                      // In a real app, this would log the user out
                      navigate('/');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">

                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        {/* Primary navigation - desktop */}
        <div className="hidden md:block border-t border-gray-100 pt-2 pb-3">
          <nav className="flex items-center justify-center space-x-1 overflow-x-auto">
            <button
              onClick={() => navigate('/')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${activeCategory === 'News' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-700 hover:bg-gray-100'}`}>

              News
            </button>
            <button
              onClick={() => handleSectionClick('announcements')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${activeCategory === 'Announcements' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-700 hover:bg-gray-100'}`}>

              Announcements
            </button>
            <button
              onClick={() => handleSectionClick('eventsCalendar')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${activeCategory === 'Events' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-700 hover:bg-gray-100'}`}>

              Events
            </button>
            <button
              onClick={() => handleSectionClick('legalNoticesList')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${activeCategory === 'LegalNotices' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-700 hover:bg-gray-100'}`}>

              Legal Notices
            </button>
            <button
              onClick={() => handleSectionClick('businessDirectory')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${activeCategory === 'Business' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-700 hover:bg-gray-100'}`}>

              Business
            </button>
            <button
              onClick={() => handleSectionClick('classifieds')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${activeCategory === 'Classifieds' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-700 hover:bg-gray-100'}`}>

              Classifieds
            </button>
            <button
              onClick={() => handleSectionClick('local-voices')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${activeCategory === 'LocalVoices' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-700 hover:bg-gray-100'}`}>

              Local Voices
            </button>
            <button
              onClick={() => handleSectionClick('coupons')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${activeCategory === 'Coupons' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-700 hover:bg-gray-100'}`}>

              Coupons
            </button>
            <button
              onClick={() => handleSectionClick('photos')}
              className={`px-3 py-2 text-sm font-medium rounded-md ${activeCategory === 'Photos' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-700 hover:bg-gray-100'}`}>

              Photos
            </button>
          </nav>
        </div>
        {/* Action menu - new section */}
        <div className="hidden md:flex border-t border-gray-100 pt-2 pb-3 justify-center space-x-4">
          <button
            onClick={() => handleActionClick('write')}
            className="flex items-center text-gray-700 hover:text-news-primary text-sm font-medium">

            <Edit className="h-4 w-4 mr-1.5" />
            Write
          </button>
          <button
            onClick={() => handleActionClick('advertise')}
            className="flex items-center text-gray-700 hover:text-news-primary text-sm font-medium">

            <FileText className="h-4 w-4 mr-1.5" />
            Advertise
          </button>
          <button
            onClick={() => handleActionClick('sell')}
            className="flex items-center text-gray-700 hover:text-news-primary text-sm font-medium">

            <ShoppingBag className="h-4 w-4 mr-1.5" />
            Sell
          </button>
          <button
            onClick={() => handleActionClick('announce')}
            className="flex items-center text-gray-700 hover:text-news-primary text-sm font-medium">

            <Megaphone className="h-4 w-4 mr-1.5" />
            Announce
          </button>
          <button
            onClick={() => handleActionClick('notice')}
            className="flex items-center text-gray-700 hover:text-news-primary text-sm font-medium">

            <Gavel className="h-4 w-4 mr-1.5" />
            Notice
          </button>
          <button
            onClick={() => handleActionClick('schedule')}
            className="flex items-center text-gray-700 hover:text-news-primary text-sm font-medium">

            <Calendar className="h-4 w-4 mr-1.5" />
            Schedule
          </button>
        </div>
      </div>
      {/* Newspaper title header with ads */}
      <div className="bg-news-primary border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-12 gap-4">
            {/* Left ad space */}
            <div className="hidden md:block col-span-2">
              <HeaderAdvertising position="left" />
            </div>
            {/* Center newspaper title */}
            <div className="col-span-12 md:col-span-8 py-4 text-center">
              <h1 className="font-display text-5xl font-black text-black tracking-tight mb-1 uppercase">
                {location} DAY NEWS
              </h1>
              <div className="text-black text-sm border-t border-b border-black/40 py-1 px-4 mx-auto inline-block">
                <span>
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span className="mx-2">|</span>
                <span>America's Trusted Local News Source Since 2025</span>
              </div>
            </div>
            {/* Right ad space */}
            <div className="hidden md:block col-span-2">
              <HeaderAdvertising position="right" />
            </div>
          </div>
        </div>
      </div>
    </div>);

};