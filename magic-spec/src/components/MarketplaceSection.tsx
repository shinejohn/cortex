import React from 'react';
import { Tag, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export const MarketplaceSection = () => {
  const navigate = useNavigate();
  const handleViewAllMarketplace = () => {
    navigate('/marketplace');
  };
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-800 flex items-center">
          <Tag className="h-4 w-4 mr-2 text-news-primary" />
          Marketplace
        </h2>
      </div>
      <div className="space-y-3">
        <div className="border-b border-gray-100 pb-3">
          <div className="text-xs text-gray-500 mb-1">FURNITURE</div>
          <h3 className="text-sm font-medium">Vintage Dining Table</h3>
          <p className="text-xs text-gray-600">$120 • Clearwater</p>
        </div>
        <div className="border-b border-gray-100 pb-3">
          <div className="text-xs text-gray-500 mb-1">ELECTRONICS</div>
          <h3 className="text-sm font-medium">55" Smart TV</h3>
          <p className="text-xs text-gray-600">$350 • Dunedin</p>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">SPORTS</div>
          <h3 className="text-sm font-medium">Kayak with Paddle</h3>
          <p className="text-xs text-gray-600">$275 • Safety Harbor</p>
        </div>
      </div>
      <div className="text-center mt-4">
        <button
          className="inline-flex items-center px-4 py-2 bg-news-primary text-white rounded-md text-sm font-medium hover:bg-news-primary-dark transition-colors w-full justify-center"
          onClick={handleViewAllMarketplace}>

          View All Listings
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>);

};