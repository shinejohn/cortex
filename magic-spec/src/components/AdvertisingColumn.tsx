import React from 'react';
import { ExternalLink } from 'lucide-react';
export const AdvertisingColumn = ({ onAdClick }) => {
  return (
    <div className="space-y-4">
      <div className="border-b-2 border-news-primary pb-2 mb-2">
        <h2 className="font-display text-lg font-bold text-news-primary">
          Advertisements
        </h2>
      </div>
      {/* Ad 1 */}
      <div
        className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-all"
        onClick={() => onAdClick && onAdClick('advertisingDetail')}>

        <div className="p-2 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
          <span>SPONSORED</span>
          <ExternalLink className="h-3 w-3" />
        </div>
        <div className="p-2">
          <img
            src="https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
            alt="Advertisement"
            className="w-full h-48 object-cover mb-2 rounded-sm" />

          <h3 className="text-sm font-bold mb-1">Local Business Directory</h3>
          <p className="text-xs text-gray-600 mb-2">
            Discover the best local businesses in Clearwater
          </p>
          <button className="w-full bg-news-primary text-white text-xs py-1 rounded-sm">
            Learn More
          </button>
        </div>
      </div>
      {/* Ad 2 */}
      <div
        className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-all"
        onClick={() => onAdClick && onAdClick('advertisingDetail')}>

        <div className="p-2 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
          <span>SPONSORED</span>
          <ExternalLink className="h-3 w-3" />
        </div>
        <div className="p-2">
          <img
            src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
            alt="Advertisement"
            className="w-full h-48 object-cover mb-2 rounded-sm" />

          <h3 className="text-sm font-bold mb-1">Summer Events Calendar</h3>
          <p className="text-xs text-gray-600 mb-2">
            Don't miss the hottest events this summer in Clearwater
          </p>
          <button className="w-full bg-news-primary text-white text-xs py-1 rounded-sm">
            View Calendar
          </button>
        </div>
      </div>
    </div>);

};