import React from 'react';
import { MapPin } from 'lucide-react';
export const PromotionCard = ({ image, location, dealerIcon, title, date }) => {
  return (
    <div className="min-w-[260px] max-w-[260px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="relative h-32">
        <img src={image} alt={title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="absolute bottom-2 left-2 rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
          Promotions / Campaigns
        </div>
      </div>
      <div className="p-3">
        <div className="mb-1 flex items-center text-xs text-gray-500">
          <MapPin className="mr-1 h-3 w-3" />
          <span>{location}</span>
        </div>
        <div className="mb-2 flex items-center">
          <span className="mr-1 text-lg">{dealerIcon}</span>
          <h3 className="line-clamp-2 text-sm font-medium text-gray-900">
            {title}
          </h3>
        </div>
        <div className="text-xs text-gray-500">{date}</div>
      </div>
    </div>);

};