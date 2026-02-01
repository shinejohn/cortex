import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Settings,
  Mic,
  Briefcase,
  CreditCard,
  Bell,
  LogOut,
  ChevronDown,
  ChevronRight } from
'lucide-react';
interface UserProfileMenuProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    hasLocalVoicesSubscription: boolean;
    hasBusinessProfile: boolean;
    unreadNotifications: number;
  };
}
const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true">

        <img
          src={user.avatar}
          alt="User profile"
          className="h-8 w-8 rounded-full object-cover" />

        <ChevronDown
          className={`h-4 w-4 ml-1 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />

      </button>
      {isOpen &&
      <div
        className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200"
        onMouseLeave={() => setIsOpen(false)}>

          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          {/* Main Menu Items */}
          <div className="py-1">
            <Link
            to="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => setIsOpen(false)}>

              <User className="h-4 w-4 mr-3 text-gray-500" />
              Your Profile
            </Link>
            <Link
            to="/settings"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => setIsOpen(false)}>

              <Settings className="h-4 w-4 mr-3 text-gray-500" />
              Account Settings
            </Link>
            <Link
            to="/notifications"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
            onClick={() => setIsOpen(false)}>

              <div className="flex items-center">
                <Bell className="h-4 w-4 mr-3 text-gray-500" />
                Notifications
              </div>
              {user.unreadNotifications > 0 &&
            <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {user.unreadNotifications}
                </span>
            }
            </Link>
          </div>
          {/* Creator Features Section */}
          {user.hasLocalVoicesSubscription &&
        <div className="py-1 border-t border-gray-100">
              <div className="px-4 py-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Creator Features
                </p>
              </div>
              <Link
            to="/local-voices/dashboard"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
            onClick={() => setIsOpen(false)}>

                <div className="flex items-center">
                  <Mic className="h-4 w-4 mr-3 text-news-primary" />
                  Creator Dashboard
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
              <Link
            to="/local-voices/dashboard/edit-profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => setIsOpen(false)}>

                <div className="ml-7">Creator Profile</div>
              </Link>
              <Link
            to="/local-voices/upload"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => setIsOpen(false)}>

                <div className="ml-7">Upload Episode</div>
              </Link>
              <Link
            to="/local-voices/dashboard/subscription"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => setIsOpen(false)}>

                <div className="ml-7">Manage Subscription</div>
              </Link>
            </div>
        }
          {/* Business Features Section */}
          {user.hasBusinessProfile &&
        <div className="py-1 border-t border-gray-100">
              <div className="px-4 py-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Business Features
                </p>
              </div>
              <Link
            to="/business-dashboard"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center justify-between"
            onClick={() => setIsOpen(false)}>

                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-3 text-indigo-500" />
                  Business Dashboard
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
              <Link
            to="/business-dashboard/edit-profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => setIsOpen(false)}>

                <div className="ml-7">Business Profile</div>
              </Link>
            </div>
        }
          {/* Get Started Section (if user doesn't have subscriptions) */}
          {!user.hasLocalVoicesSubscription && !user.hasBusinessProfile &&
        <div className="py-1 border-t border-gray-100">
              <div className="px-4 py-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Get Started
                </p>
              </div>
              <Link
            to="/local-voices/pricing"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => setIsOpen(false)}>

                <Mic className="h-4 w-4 mr-3 text-news-primary" />
                Become a Creator
              </Link>
              <Link
            to="/business/create"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => setIsOpen(false)}>

                <Briefcase className="h-4 w-4 mr-3 text-indigo-500" />
                Add Business Profile
              </Link>
            </div>
        }
          {/* Logout Section */}
          <div className="py-1 border-t border-gray-100">
            <Link
            to="/logout"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
            onClick={() => setIsOpen(false)}>

              <LogOut className="h-4 w-4 mr-3 text-gray-500" />
              Sign out
            </Link>
          </div>
        </div>
      }
    </div>);

};
export default UserProfileMenu;