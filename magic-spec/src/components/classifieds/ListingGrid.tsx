import React from 'react';
import { MapPin, Clock, Star, MessageCircle, Shield, Flag } from 'lucide-react';
export const ListingGrid = ({ listings }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {listings.map((listing) =>
      <div
        key={listing.id}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">

          {/* Image */}
          <div className="relative h-48">
            {listing.photos.length > 0 ?
          <img
            src={listing.photos[0].url}
            alt={listing.title}
            className="w-full h-full object-cover" /> :


          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
          }
            {/* Photo count */}
            {listing.photos.length > 1 &&
          <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs font-medium px-2 py-1 rounded">
                {listing.photos.length} photos
              </div>
          }
            {/* Category tag */}
            <div className="absolute top-2 left-2">
              <CategoryBadge category={listing.category} />
            </div>
          </div>
          {/* Content */}
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                {listing.title}
              </h3>
              <div className="text-lg font-bold text-news-primary whitespace-nowrap ml-2">
                {listing.priceDisplay}
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
              <span className="mr-2">{listing.location}</span>
              <span className="text-xs text-gray-400">
                ({listing.distance} mi)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-500">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>{listing.postedTime}</span>
              </div>
              {/* Seller verification */}
              {listing.seller.verified &&
            <div className="flex items-center text-xs text-green-600 font-medium">
                  <Shield className="h-3.5 w-3.5 mr-1" />
                  <span>Verified</span>
                </div>
            }
            </div>
            {/* Seller info and actions */}
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-medium text-sm">
                  {listing.seller.name.substring(0, 2)}
                </div>
                <div className="ml-2">
                  <div className="text-xs font-medium flex items-center">
                    {listing.seller.name}
                    <div className="flex items-center ml-1 text-yellow-500">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="ml-0.5 text-gray-700">
                        {listing.seller.rating}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Member since {listing.seller.joinedDate}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                  <Flag className="h-4 w-4" />
                </button>
                <button className="p-1.5 rounded-full bg-news-primary text-white">
                  <MessageCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>);

};
// Helper component for category badges
const CategoryBadge = ({ category }) => {
  const styles = {
    forSale: 'bg-blue-100 text-blue-700',
    housing: 'bg-green-100 text-green-700',
    jobs: 'bg-purple-100 text-purple-700',
    services: 'bg-orange-100 text-orange-700',
    community: 'bg-pink-100 text-pink-700'
  };
  const labels = {
    forSale: 'For Sale',
    housing: 'Housing',
    jobs: 'Jobs',
    services: 'Services',
    community: 'Community'
  };
  return (
    <div
      className={`px-2 py-1 rounded text-xs font-medium ${styles[category] || 'bg-gray-100 text-gray-700'}`}>

      {labels[category] || 'General'}
    </div>);

};