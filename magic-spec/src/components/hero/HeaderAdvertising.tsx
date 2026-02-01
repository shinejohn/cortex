import React from 'react';
import { ExternalLink } from 'lucide-react';
export const HeaderAdvertising = ({ position }) => {
  return (
    <div className="h-full flex items-center justify-center py-2">
      <div className="bg-white border border-gray-200 rounded-sm overflow-hidden shadow-sm w-full">
        <div className="p-1 bg-gray-50 text-xs text-gray-500 flex items-center justify-between">
          <span>SPONSORED</span>
          <ExternalLink className="h-3 w-3" />
        </div>
        <div className="p-2">
          <img
            src={
            position === 'left' ?
            'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' :
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
            }
            alt="Advertisement"
            className="w-full h-24 object-cover mb-1 rounded-sm" />

          <h3 className="text-xs font-bold mb-1 line-clamp-1">
            {position === 'left' ? 'Local Dining Guide' : 'Weekend Events'}
          </h3>
        </div>
      </div>
    </div>);

};