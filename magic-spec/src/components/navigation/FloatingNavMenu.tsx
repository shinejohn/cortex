import React, { useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  MessageSquare,
  Calendar,
  Search,
  Menu,
  X,
  User,
  Newspaper,
  Building2,
  Tag,
  Archive,
  Megaphone,
  Heart,
  Scissors,
  FileText,
  Briefcase,
  Phone,
  Gavel,
  ChevronLeft,
  ChevronRight,
  Headphones } from
'lucide-react';
export const FloatingNavMenu = ({ currentPage }) => {
  const navigate = useNavigate();
  const [showFullMenu, setShowFullMenu] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const handleNavigation = (path) => {
    navigate(path);
    setShowFullMenu(false);
  };
  const menuItems = [
  {
    label: 'Home',
    icon: <Home className="h-5 w-5" />,
    path: '/',
    show: currentPage === 'home'
  },
  {
    label: 'Announcements',
    icon: <MessageSquare className="h-5 w-5" />,
    path: '/announcements',
    show: currentPage === 'announcements'
  },
  {
    label: 'Events Calendar',
    icon: <Calendar className="h-5 w-5" />,
    path: '/eventsCalendar',
    show: currentPage === 'eventsCalendar'
  },
  {
    label: 'Search',
    icon: <Search className="h-5 w-5" />,
    path: '/search',
    show: currentPage === 'search'
  },
  {
    label: 'Expand Menu',
    icon: <Menu className="h-5 w-5" />,
    path: '',
    show: true
  },
  {
    label: 'Episode Marketplace',
    icon: <Headphones className="h-5 w-5" />,
    path: '/local-voices/episodes',
    show: currentPage.startsWith('local-voices')
  },
  {
    label: 'Classifieds',
    icon: <Tag className="h-5 w-5" />,
    path: '/classifieds',
    show: currentPage === 'classifieds'
  },
  {
    label: 'Business',
    icon: <Building2 className="h-5 w-5" />,
    path: '/businessDirectory',
    show: currentPage === 'businessDirectory'
  },
  {
    label: 'Coupons',
    icon: <Scissors className="h-5 w-5" />,
    path: '/coupons',
    show: currentPage === 'coupons'
  },
  {
    label: 'Legal',
    icon: <Gavel className="h-5 w-5" />,
    path: '/legalNoticesList',
    show:
    currentPage === 'legalNoticesList' ||
    currentPage === 'legalNoticeDetail' ||
    currentPage === 'legalNoticeCreator'
  },
  {
    label: 'Memorials',
    icon: <Heart className="h-5 w-5" />,
    path: '/memorials',
    show: currentPage === 'memorials' || currentPage === 'memorialDetail'
  },
  {
    label: 'Archive',
    icon: <Archive className="h-5 w-5" />,
    path: '/archive',
    show: currentPage === 'archive'
  },
  {
    label: 'Search',
    icon: <Search className="h-5 w-5" />,
    path: '/search',
    show: currentPage === 'search'
  },
  {
    label: 'Trending',
    icon: <Newspaper className="h-5 w-5" />,
    path: '/trending',
    show: currentPage === 'trending'
  },
  {
    label: 'About',
    icon: <FileText className="h-5 w-5" />,
    path: '/about',
    show: currentPage === 'about'
  },
  {
    label: 'Contact',
    icon: <Phone className="h-5 w-5" />,
    path: '/contact',
    show: currentPage === 'contact'
  },
  {
    label: 'Profile',
    icon: <User className="h-5 w-5" />,
    path: '/profile',
    show: currentPage === 'profile'
  }];

  return (
    <>
      {/* Bottom navigation for mobile - keep this for mobile devices */}
      <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center pointer-events-none md:hidden">
        <div
          className={`bg-white rounded-full shadow-lg flex items-center justify-between pointer-events-auto transition-all duration-300 ${showFullMenu ? 'w-11/12 max-w-4xl px-4 py-3' : 'w-auto max-w-xs px-2 py-2'}`}>

          {/* Compact menu - always visible */}
          {!showFullMenu &&
          <>
              {menuItems.map((item) =>
            <button
              key={item.label}
              onClick={() => handleNavigation(item.path)}
              className={`p-3 rounded-full ${item.show ? 'bg-news-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              aria-label={item.label}>

                  {item.icon}
                </button>
            )}
            </>
          }
          {/* Expanded menu */}
          {showFullMenu &&
          <div className="grid grid-cols-6 md:grid-cols-10 gap-2 w-full">
              {menuItems.map((item) =>
            <button
              key={item.label}
              onClick={() => handleNavigation(item.path)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg ${item.show ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-500 hover:bg-gray-100'}`}>

                  {item.icon}
                  <span className="text-xs">{item.label}</span>
                </button>
            )}
              {/* Second row for larger screens */}
              <div className="hidden md:flex col-span-10 justify-center space-x-2 mt-2 w-full">
                <button
                onClick={() => handleNavigation('/search')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg ${currentPage === 'search' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-500 hover:bg-gray-100'}`}>

                  <Search className="h-5 w-5 mb-1" />
                  <span className="text-xs">Search</span>
                </button>
                <button
                onClick={() => handleNavigation('/trending')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg ${currentPage === 'trending' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-500 hover:bg-gray-100'}`}>

                  <Newspaper className="h-5 w-5 mb-1" />
                  <span className="text-xs">Trending</span>
                </button>
                <button
                onClick={() => handleNavigation('/about')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg ${currentPage === 'about' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-500 hover:bg-gray-100'}`}>

                  <FileText className="h-5 w-5 mb-1" />
                  <span className="text-xs">About</span>
                </button>
                <button
                onClick={() => handleNavigation('/contact')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg ${currentPage === 'contact' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-500 hover:bg-gray-100'}`}>

                  <Phone className="h-5 w-5 mb-1" />
                  <span className="text-xs">Contact</span>
                </button>
                <button
                onClick={() => handleNavigation('/profile')}
                className={`flex flex-col items-center justify-center p-2 rounded-lg ${currentPage === 'profile' ? 'bg-news-primary bg-opacity-10 text-news-primary' : 'text-gray-500 hover:bg-gray-100'}`}>

                  <User className="h-5 w-5 mb-1" />
                  <span className="text-xs">Profile</span>
                </button>
              </div>
              <button
              onClick={() => setShowFullMenu(false)}
              className="absolute top-3 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close Menu">

                <X className="h-5 w-5" />
              </button>
            </div>
          }
        </div>
      </div>
      {/* Right-side floating menu for all devices */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          {isCollapsed ?
          <button
            onClick={() => setIsCollapsed(false)}
            className="bg-white rounded-full shadow-lg p-3 text-gray-500 hover:text-news-primary hover:bg-gray-50 transition-colors"
            aria-label="Expand Menu">

              <ChevronLeft className="h-6 w-6" />
            </button> :

          <div className="bg-white rounded-lg shadow-lg p-3 flex flex-col items-center space-y-4">
              <button
              onClick={() => setIsCollapsed(true)}
              className="text-gray-500 hover:text-news-primary self-end mb-2"
              aria-label="Collapse Menu">

                <ChevronRight className="h-6 w-6" />
              </button>
              {menuItems.map((item) =>
            <button
              key={item.label}
              onClick={() => handleNavigation(item.path)}
              className={`p-3 rounded-full ${item.show ? 'bg-news-primary text-white' : 'text-gray-500 hover:bg-gray-100'}`}
              title={item.label}
              aria-label={item.label}>

                  {item.icon}
                </button>
            )}
            </div>
          }
        </div>
      </div>
    </>);

};