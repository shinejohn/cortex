import React from 'react';
import { MapPin, Star, Shield, ChevronRight, ChevronLeft } from 'lucide-react';
export const FeaturedListings = () => {
  const featuredListings = [
  {
    id: 1,
    title: '2022 Tesla Model 3 - Like New',
    price: '$39,995',
    image:
    'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    category: 'forSale',
    location: 'Clearwater',
    distance: '2.3 mi',
    seller: {
      name: 'ElectricDrive',
      rating: '4.9',
      verified: true
    }
  },
  {
    id: 2,
    title: 'Luxury Waterfront Condo - 2BR/2BA',
    price: '$2,400/mo',
    image:
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    category: 'housing',
    location: 'Clearwater Beach',
    distance: '4.1 mi',
    seller: {
      name: 'BeachProperties',
      rating: '4.7',
      verified: true
    }
  },
  {
    id: 3,
    title: 'Senior Software Engineer - Remote',
    price: '$120-150k',
    image:
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    category: 'jobs',
    location: 'Remote',
    distance: '0 mi',
    seller: {
      name: 'TechInnovators',
      rating: '4.8',
      verified: true
    }
  },
  {
    id: 4,
    title: 'Professional Photography Services',
    price: 'From $150',
    image:
    'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    category: 'services',
    location: 'Dunedin',
    distance: '3.7 mi',
    seller: {
      name: 'VisualArtistry',
      rating: '5.0',
      verified: true
    }
  }];

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-bold text-gray-800">Featured Listings</h3>
        <div className="flex space-x-2">
          <button className="p-1 rounded-full hover:bg-gray-100">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <button className="p-1 rounded-full hover:bg-gray-100">
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {featuredListings.map((listing) =>
          <div
            key={listing.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">

              {/* Image */}
              <div className="relative h-36">
                <img
                src={listing.image}
                alt={listing.title}
                className="w-full h-full object-cover" />

                <div className="absolute top-2 left-2">
                  <CategoryBadge category={listing.category} />
                </div>
                <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-800 text-xs font-bold px-2 py-1 transform rotate-45 translate-x-4 -translate-y-1">
                  FEATURED
                </div>
              </div>
              {/* Content */}
              <div className="p-3">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
                    {listing.title}
                  </h3>
                </div>
                <div className="text-sm font-bold text-news-primary mb-1">
                  {listing.price}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                  <span className="mr-1">{listing.location}</span>
                  <span className="text-gray-400">({listing.distance})</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <div className="flex items-center text-xs">
                    <span className="font-medium">{listing.seller.name}</span>
                    <div className="flex items-center ml-1 text-yellow-500">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="ml-0.5 text-gray-700">
                        {listing.seller.rating}
                      </span>
                    </div>
                  </div>
                  {listing.seller.verified &&
                <div className="flex items-center text-xs text-green-600">
                      <Shield className="h-3 w-3 mr-0.5" />
                      <span>Verified</span>
                    </div>
                }
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
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