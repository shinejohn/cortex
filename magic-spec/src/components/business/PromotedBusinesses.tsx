import React from 'react';
import { Star, MapPin, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export const PromotedBusinesses = () => {
  const navigate = useNavigate();
  // Mock promoted businesses
  const promotedBusinesses = [
  {
    id: 101,
    name: 'Seaside Grill & Bar',
    category: 'Restaurant',
    rating: 4.8,
    reviewCount: 243,
    distance: 0.3,
    image:
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description: 'Waterfront dining with fresh seafood and craft cocktails.',
    specialOffer: 'Happy Hour: 4-6pm daily - 50% off appetizers'
  },
  {
    id: 102,
    name: 'Oceanview Spa & Wellness',
    category: 'Spa',
    rating: 4.9,
    reviewCount: 187,
    distance: 1.1,
    image:
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description:
    'Luxury spa treatments with ocean views and premium amenities.',
    specialOffer: 'New Client Special: 20% off first visit'
  },
  {
    id: 103,
    name: 'Gulf Coast Fitness Center',
    category: 'Gym',
    rating: 4.7,
    reviewCount: 156,
    distance: 0.8,
    image:
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    description:
    'State-of-the-art fitness facility with personal training and group classes.',
    specialOffer: 'Summer Special: No enrollment fee + first month free'
  }];

  const handleViewDetails = (businessId) => {
    // Navigate to the business profile page
    navigate(`/business/${businessId}`);
  };
  const handleContact = (businessId) => {
    // Navigate to the business profile page with contact section focus
    navigate(`/business/${businessId}?section=contact`);
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">
          Featured Businesses
        </h2>
        <span className="text-xs text-gray-500">Sponsored</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {promotedBusinesses.map((business) =>
        <div
          key={business.id}
          className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow relative cursor-pointer"
          onClick={() => handleViewDetails(business.id)}>

            {/* Ad label */}
            <div className="absolute top-2 right-2 bg-white/80 text-xs text-gray-500 px-1.5 py-0.5 rounded">
              Ad
            </div>
            <div className="h-40 relative">
              <img
              src={business.image}
              alt={business.name}
              className="w-full h-full object-cover" />

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                <h3 className="text-white font-bold truncate">
                  {business.name}
                </h3>
                <div className="flex items-center text-white/90 text-xs">
                  <span className="bg-white/20 px-1.5 py-0.5 rounded mr-2">
                    {business.category}
                  </span>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 fill-current text-yellow-400 mr-1" />
                    <span>{business.rating}</span>
                    <span className="mx-1">•</span>
                    <span>{business.reviewCount} reviews</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                <span>{business.distance} miles away</span>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {business.description}
              </p>
              {business.specialOffer &&
            <div className="bg-yellow-50 p-2 rounded-md text-xs text-yellow-800 mb-3">
                  <span className="font-medium">Special Offer:</span>{' '}
                  {business.specialOffer}
                </div>
            }
              <div className="flex justify-between items-center">
                <button
                className="text-news-primary text-sm font-medium hover:underline flex items-center"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(business.id);
                }}>

                  View Details
                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </button>
                <button
                className="bg-news-primary text-white text-xs font-medium px-2.5 py-1.5 rounded hover:bg-news-primary-dark"
                onClick={(e) => {
                  e.stopPropagation();
                  handleContact(business.id);
                }}>

                  Contact
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>);

};