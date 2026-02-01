import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Clock, Check, ExternalLink } from 'lucide-react';
export const BusinessCard = ({ business }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* Business Image */}
        <div className="md:w-1/3 h-48 md:h-auto relative">
          <img
            src={business.images[0]}
            alt={business.name}
            className="w-full h-full object-cover" />

          {business.hasSpecialOffer &&
          <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
              Special Offer
            </div>
          }
        </div>
        {/* Business Info */}
        <div className="p-4 md:p-6 flex-1 flex flex-col">
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {business.name}
              </h3>
              <div className="flex items-center bg-gray-100 px-2 py-1 rounded-full">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="ml-1 text-sm font-medium">
                  {business.rating}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  ({business.reviewCount})
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {business.category} • {business.subcategory}
            </div>
            <div className="flex flex-wrap gap-y-2 mb-3">
              <div className="flex items-center text-sm text-gray-600 mr-4">
                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                <span>{business.distance} miles away</span>
              </div>
              <div className="flex items-center text-sm mr-4">
                <Clock className="h-4 w-4 mr-1 text-gray-400" />
                <span
                  className={
                  business.isOpen ? 'text-green-600' : 'text-red-600'
                  }>

                  {business.isOpen ? 'Open Now' : 'Closed'}
                </span>
                {business.isOpen && business.isBusy &&
                <span className="ml-1 text-gray-600">
                    • {business.isBusy} busy
                  </span>
                }
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <span>{business.priceRange}</span>
              </div>
            </div>
            {business.featuredReview &&
            <div className="bg-blue-50 p-3 rounded-md mb-3 text-sm italic text-gray-700">
                "{business.featuredReview}"
              </div>
            }
            {business.hasSpecialOffer && business.specialOffer &&
            <div className="flex items-center text-sm text-green-700 mb-3">
                <Check className="h-4 w-4 mr-1" />
                <span>{business.specialOffer}</span>
              </div>
            }
          </div>
          {/* Action buttons */}
          <div className="flex mt-4 pt-4 border-t border-gray-200">
            <Link
              to={`/business/${business.id}`}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">

              View Details
              <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
            </Link>
            <a
              href={`tel:${business.phone}`}
              className="ml-3 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors">

              Call
            </a>
            <a
              href={`https://maps.google.com/?q=${business.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors">

              Directions
            </a>
          </div>
        </div>
      </div>
    </div>);

};