import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Newspaper,
  ShoppingBag,
  Megaphone,
  Ticket,
  ArrowRight,
  ChevronRight,
  Calendar,
  Gavel,
  Store,
  Target } from
'lucide-react';
export const PublishPromotePage = () => {
  const [selectedOption, setSelectedOption] = useState('');
  const navigate = useNavigate();
  const options = [
  {
    id: 'article',
    title: 'Write an Article',
    description: 'Share news, stories, or information with your community',
    icon: <Newspaper className="h-8 w-8 text-news-primary" />,
    color: 'bg-blue-100',
    textColor: 'text-news-primary',
    route: '/create-article'
  },
  {
    id: 'product',
    title: 'Sell a Product or Service',
    description: 'List items for sale or promote your business services',
    icon: <ShoppingBag className="h-8 w-8 text-green-600" />,
    color: 'bg-green-100',
    textColor: 'text-green-600',
    route: '/postListing'
  },
  {
    id: 'business',
    title: 'List Your Business Profile',
    description: 'Create and promote your business in the local directory',
    icon: <Store className="h-8 w-8 text-cyan-600" />,
    color: 'bg-cyan-100',
    textColor: 'text-cyan-600',
    route: '/business/create'
  },
  {
    id: 'advertise',
    title: 'Advertise in the Community',
    description: 'Create targeted ad campaigns to reach local audiences',
    icon: <Target className="h-8 w-8 text-pink-600" />,
    color: 'bg-pink-100',
    textColor: 'text-pink-600',
    route: '/community-ads'
  },
  {
    id: 'announcement',
    title: 'Make an Announcement',
    description: 'Share important information with your community',
    icon: <Megaphone className="h-8 w-8 text-purple-600" />,
    color: 'bg-purple-100',
    textColor: 'text-purple-600',
    route: '/announcementCreator'
  },
  {
    id: 'coupon',
    title: 'Offer a Coupon',
    description: 'Create special deals or discounts for your business',
    icon: <Ticket className="h-8 w-8 text-orange-600" />,
    color: 'bg-orange-100',
    textColor: 'text-orange-600',
    route: '/couponCreator'
  },
  {
    id: 'event',
    title: 'Schedule an Event',
    description: 'Create and promote community events',
    icon: <Calendar className="h-8 w-8 text-indigo-600" />,
    color: 'bg-indigo-100',
    textColor: 'text-indigo-600',
    route: '/eventCreator'
  },
  {
    id: 'legal',
    title: 'Post a Legal Notice',
    description: 'Publish official legal notices and announcements',
    icon: <Gavel className="h-8 w-8 text-red-600" />,
    color: 'bg-red-100',
    textColor: 'text-red-600',
    route: '/legalNoticeCreator'
  }];

  const handleOptionSelect = (optionId) => {
    setSelectedOption(optionId);
  };
  const handleContinue = () => {
    if (selectedOption) {
      const selectedOptionData = options.find(
        (option) => option.id === selectedOption
      );
      if (selectedOptionData) {
        navigate(selectedOptionData.route);
      }
    }
  };
  const handleDirectNavigation = (optionId) => {
    const selectedOptionData = options.find((option) => option.id === optionId);
    if (selectedOptionData) {
      navigate(selectedOptionData.route);
    }
  };
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Share, Sell and Announce
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Choose what you'd like to publish in your community
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {options.map((option) =>
          <div
            key={option.id}
            className={`border rounded-xl p-6 cursor-pointer transition-all ${selectedOption === option.id ? `border-2 ${option.textColor} ${option.color} shadow-md` : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
            onClick={() => {
              handleOptionSelect(option.id);
              // Allow for direct click-through navigation as well
              handleDirectNavigation(option.id);
            }}
            role="button"
            aria-pressed={selectedOption === option.id}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleOptionSelect(option.id);
                handleDirectNavigation(option.id);
              }
            }}>

              <div className="flex items-start">
                <div className={`p-3 rounded-lg ${option.color} mr-4`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {option.title}
                  </h3>
                  <p className="text-gray-600">{option.description}</p>
                </div>
                <div className="ml-4 flex items-center justify-center h-6 w-6 rounded-full border border-gray-300">
                  {selectedOption === option.id &&
                <div
                  className={`h-3 w-3 rounded-full ${option.textColor.replace('text', 'bg')}`}>
                </div>
                }
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                className={`text-sm font-medium flex items-center ${option.textColor} hover:underline`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDirectNavigation(option.id);
                }}
                aria-label={`Get started with ${option.title}`}>

                  Get Started <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            disabled={!selectedOption}
            className={`flex items-center px-6 py-3 rounded-lg font-medium ${selectedOption ? 'bg-news-primary text-white hover:bg-news-primary-dark' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            aria-label="Continue with selected option"
            aria-disabled={!selectedOption}>

            <span>Continue</span>
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>);

};