import React from 'react';
import {
  MapPin,
  ChevronRight,
  ExternalLink,
  Tag,
  ShoppingBag,
  Briefcase,
  Home,
  Wrench } from
'lucide-react';
export const MarketplacePreview = ({ onViewAll, onAdClick }) => {
  const featuredListings = [
  {
    id: 1,
    title: '2023 Honda Accord - Excellent Condition',
    category: 'Vehicles',
    price: '$18,500',
    location: 'Clearwater',
    image:
    'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    icon: <ShoppingBag className="h-4 w-4" />
  },
  {
    id: 2,
    title: 'Professional Lawn Care Services',
    category: 'Services',
    price: '$25/hr',
    location: 'Dunedin',
    image:
    'https://images.unsplash.com/photo-1589923188900-85dae523342b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    icon: <Wrench className="h-4 w-4" />
  },
  {
    id: 3,
    title: 'Vintage Bicycle - Restored Classic',
    category: 'For Sale',
    price: '$350',
    location: 'Palm Harbor',
    image:
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    icon: <ShoppingBag className="h-4 w-4" />
  },
  {
    id: 4,
    title: 'Part-time Administrative Assistant',
    category: 'Jobs',
    price: '$18/hr',
    location: 'Clearwater',
    image:
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    icon: <Briefcase className="h-4 w-4" />
  }];

  const categories = [
  {
    name: 'For Sale',
    icon: <ShoppingBag className="h-5 w-5 text-blue-600" />,
    count: 182
  },
  {
    name: 'Services',
    icon: <Wrench className="h-5 w-5 text-green-600" />,
    count: 97
  },
  {
    name: 'Jobs',
    icon: <Briefcase className="h-5 w-5 text-purple-600" />,
    count: 43
  },
  {
    name: 'Housing',
    icon: <Home className="h-5 w-5 text-orange-600" />,
    count: 65
  }];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Categories */}
      <div className="lg:col-span-1 order-2 lg:order-1">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">Categories</h3>
          </div>
          <div className="p-4">
            <ul className="space-y-3">
              {categories.map((category, index) =>
              <li key={index}>
                  <a
                  href="#"
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    onAdClick && onAdClick('classifieds');
                  }}>

                    <div className="flex items-center">
                      <div className="mr-3 bg-gray-100 p-1.5 rounded-md">
                        {category.icon}
                      </div>
                      <span className="font-medium text-gray-700">
                        {category.name}
                      </span>
                    </div>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      {category.count}
                    </span>
                  </a>
                </li>
              )}
            </ul>
            <button
              onClick={onViewAll}
              className="w-full mt-4 text-center text-sm text-news-primary font-medium py-2 border border-news-primary rounded-md hover:bg-news-primary hover:text-white transition-colors">

              Browse All Categories
            </button>
          </div>
        </div>
      </div>
      {/* Featured Listings */}
      <div className="lg:col-span-3 order-1 lg:order-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredListings.map((listing) =>
          <div
            key={listing.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col cursor-pointer hover:shadow-md transition-all"
            onClick={() => onAdClick && onAdClick('classifiedDetail')}>

              <div className="relative h-48">
                <img
                src={listing.image}
                alt={listing.title}
                className="w-full h-full object-cover" />

                <div className="absolute top-3 left-3">
                  <div className="bg-white text-xs font-medium px-2 py-1 rounded-md shadow-sm flex items-center">
                    <div className="mr-1 text-news-primary">{listing.icon}</div>
                    {listing.category}
                  </div>
                </div>
                <div className="absolute top-3 right-3">
                  <div className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                    {listing.price}
                  </div>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-gray-800 mb-2">
                  {listing.title}
                </h3>
                <div className="flex items-center text-gray-500 text-sm mt-auto">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  <span>{listing.location}</span>
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                  <a
                  href="#"
                  className="text-xs text-news-primary font-medium flex items-center"
                  onClick={(e) => {
                    e.preventDefault();
                    onAdClick && onAdClick('classifiedDetail');
                  }}>

                    View Details
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                  <button
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Keep the save functionality separate
                  }}>

                    <Tag className="h-3 w-3 mr-1" />
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 text-center">
          <button
            onClick={onViewAll}
            className="inline-flex items-center px-4 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark transition-colors">

            View All Listings
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>
    </div>);

};