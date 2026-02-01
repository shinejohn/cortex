import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Star, MessageCircle, Shield, Flag } from 'lucide-react';
interface Seller {
  name: string;
  rating: number;
  memberSince: string;
  responseRate: number;
  responseTime: string;
}
interface Classified {
  id: number;
  title: string;
  category: string;
  subcategory: string;
  price: number;
  priceType?: string;
  location: string;
  postedDate: string;
  description: string;
  images: string[];
  featured: boolean;
  condition?: string;
  seller: Seller;
}
interface ClassifiedCardProps {
  classified: Classified;
}
export const ClassifiedCard: React.FC<ClassifiedCardProps> = ({
  classified
}) => {
  const navigate = useNavigate();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  const formatPrice = (price: number, priceType?: string) => {
    if (priceType === 'Contact for pricing') return priceType;
    if (price === 0) return 'Free';
    return `$${price.toLocaleString()}`;
  };
  const handleCardClick = () => {
    navigate(`/classifiedDetail?id=${classified.id}`);
  };
  return (
    <div
      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}>

      {/* Image */}
      <div className="relative h-48">
        <img
          src={classified.images[0]}
          alt={classified.title}
          className="w-full h-full object-cover" />

        {classified.featured &&
        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-800 text-xs font-bold px-2 py-1 transform rotate-45 translate-x-4 -translate-y-1">
            FEATURED
          </div>
        }
        <div className="absolute top-2 left-2">
          <div
            className={`px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700`}>

            {classified.subcategory}
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
            {classified.title}
          </h3>
          <div className="text-lg font-bold text-news-primary whitespace-nowrap ml-2">
            {formatPrice(classified.price, classified.priceType)}
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
          <span>{classified.location}</span>
        </div>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {classified.description}
        </p>
        {/* Seller info and actions */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 font-medium text-sm">
              {classified.seller.name.substring(0, 2)}
            </div>
            <div className="ml-2">
              <div className="text-xs font-medium flex items-center">
                {classified.seller.name}
                <div className="flex items-center ml-1 text-yellow-500">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="ml-0.5 text-gray-700">
                    {classified.seller.rating}
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Posted {formatDate(classified.postedDate)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                alert('Listing reported. Our team will review it.');
              }}>

              <Flag className="h-4 w-4" />
            </button>
            <button
              className="p-1.5 rounded-full bg-news-primary text-white"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/classifiedDetail?id=${classified.id}`);
              }}>

              <MessageCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>);

};