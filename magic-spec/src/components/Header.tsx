import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, Menu, X, ChevronDown } from 'lucide-react';
export const Header = () => {
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/search');
    }
  };
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Home link */}
          <div className="w-40">
            <button onClick={() => navigate('/')} className="flex items-center">
              <img
                src="/image.png"
                alt="Logo"
                className="h-8 w-8 rounded-full" />

              <h1 className="ml-2 font-display text-xl font-bold text-news-primary">
                Day.news
              </h1>
            </button>
          </div>
          {/* Right side items */}
          <div className="flex items-center space-x-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 bg-gray-100 border border-gray-200 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-news-primary" />

              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">

                <Search className="h-4 w-4" />
              </button>
            </form>
            <button
              onClick={() => navigate('/announcements')}
              className="text-gray-500 hover:text-gray-700 relative">

              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            {/* User dropdown */}
            <div className="relative">
              <button
                className="flex items-center text-black font-medium"
                onClick={() => setShowUserDropdown(!showUserDropdown)}>

                <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                  <User className="h-5 w-5 text-gray-500" />
                </span>
                <span>John</span>
                <ChevronDown className="h-4 w-4 ml-1" />
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
                    navigate('/settings');
                    setShowUserDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">

                    Settings
                  </button>
                  <button
                  onClick={() => {
                    // In a real app, this would log the user out
                    navigate('/');
                    setShowUserDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">

                    Sign out
                  </button>
                </div>
              }
            </div>
            {/* Mobile menu button */}
            <button
              className="md:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setShowMobileMenu(!showMobileMenu)}>

              {showMobileMenu ?
              <X className="h-6 w-6" /> :

              <Menu className="h-6 w-6" />
              }
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {showMobileMenu &&
      <div className="md:hidden bg-white border-t border-gray-200">
          <div className="w-full max-w-[1400px] mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-2">
              <button
              onClick={() => {
                navigate('/');
                setShowMobileMenu(false);
              }}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-news-primary rounded-md hover:bg-gray-50 text-left">

                Home
              </button>
              <button
              onClick={() => {
                navigate('/profile');
                setShowMobileMenu(false);
              }}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-news-primary rounded-md hover:bg-gray-50 text-left">

                Profile
              </button>
              <button
              onClick={() => {
                navigate('/search');
                setShowMobileMenu(false);
              }}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-news-primary rounded-md hover:bg-gray-50 text-left">

                Search
              </button>
              <button
              onClick={() => {
                navigate('/announcements');
                setShowMobileMenu(false);
              }}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-news-primary rounded-md hover:bg-gray-50 text-left">

                Announcements
              </button>
              <button
              onClick={() => {
                navigate('/create-article');
                setShowMobileMenu(false);
              }}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-news-primary rounded-md hover:bg-gray-50 text-left">

                Write Article
              </button>
            </nav>
          </div>
        </div>
      }
    </header>);

};