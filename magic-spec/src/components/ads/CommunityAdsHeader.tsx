import React, { useState } from 'react';
import {
  User,
  ChevronDown,
  Plus,
  BarChart2,
  Globe,
  CreditCard } from
'lucide-react';
export const CommunityAdsHeader = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-blue-600 font-bold text-xl">
                CommunityAds
              </span>
            </div>
          </div>
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a
              href="#"
              className="flex items-center text-blue-600 px-3 py-2 text-sm font-medium border-b-2 border-blue-600">

              <Plus className="h-4 w-4 mr-1" />
              Create Ad
            </a>
            <a
              href="#"
              className="flex items-center text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">

              <BarChart2 className="h-4 w-4 mr-1" />
              My Campaigns
            </a>
            <a
              href="#"
              className="flex items-center text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">

              <BarChart2 className="h-4 w-4 mr-1" />
              Analytics
            </a>
            <a
              href="#"
              className="flex items-center text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium">

              <Globe className="h-4 w-4 mr-1" />
              Communities
            </a>
          </nav>
          {/* User menu */}
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
              Credits: $250
            </div>
            <button className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-green-200 transition-colors flex items-center">
              <CreditCard className="h-4 w-4 mr-1" />
              Buy Credits
            </button>
            <div className="relative">
              <button
                className="flex items-center text-gray-700"
                onClick={() => setShowUserMenu(!showUserMenu)}>

                <span className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-1">
                  <User className="h-5 w-5 text-gray-500" />
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {showUserMenu &&
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">

                    Your Profile
                  </a>
                  <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">

                    Settings
                  </a>
                  <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">

                    Billing
                  </a>
                  <div className="border-t border-gray-100 my-1"></div>
                  <a
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">

                    Sign out
                  </a>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </header>);

};