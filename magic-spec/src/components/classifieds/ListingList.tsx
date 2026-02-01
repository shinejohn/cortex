import React from 'react';
import {
  MapPin,
  Clock,
  Star,
  MessageCircle,
  Shield,
  Flag,
  ExternalLink } from
'lucide-react';
export const ListingList = ({ listings }) => {
  return (
    <div className="space-y-4">
      {listings.map((listing) =>
      <div
        key={listing.id}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">

          <div className="flex flex-col md:flex-row">
            {/* Image */}
            <div className="relative w-full md:w-1/4 h-48 md:h-auto">
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
            <div className="p-4 flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900">
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
                <span className="mx-2">•</span>
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>{listing.postedTime}</span>
                {/* Seller verification */}
                {listing.seller.verified &&
              <>
                    <span className="mx-2">•</span>
                    <div className="flex items-center text-xs text-green-600 font-medium">
                      <Shield className="h-3.5 w-3.5 mr-1" />
                      <span>Verified Seller</span>
                    </div>
                  </>
              }
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {listing.description}
              </p>
              {/* Condition info */}
              <div className="flex flex-wrap gap-2 mb-4">
                <ConditionBadge condition={listing.condition} />
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
                  <button className="px-3 py-1.5 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium flex items-center">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                    View Details
                  </button>
                  <button className="px-3 py-1.5 rounded bg-news-primary text-white text-xs font-medium flex items-center">
                    <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                    Message
                  </button>
                </div>
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
// Helper component for condition badges
const ConditionBadge = ({ condition }) => {
  const styles = {
    new: 'bg-green-100 text-green-700 border-green-200',
    likeNew: 'bg-blue-100 text-blue-700 border-blue-200',
    good: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    fair: 'bg-orange-100 text-orange-700 border-orange-200',
    salvage: 'bg-red-100 text-red-700 border-red-200'
  };
  const labels = {
    new: 'New',
    likeNew: 'Like New',
    good: 'Good',
    fair: 'Fair',
    salvage: 'Salvage'
  };
  return (
    <div
      className={`px-2 py-0.5 rounded text-xs font-medium border ${styles[condition] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>

      Condition: {labels[condition] || 'Unknown'}
    </div>);

};