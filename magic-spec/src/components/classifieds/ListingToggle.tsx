import React from 'react';
import { Grid, List, SlidersHorizontal } from 'lucide-react';
export const ListingToggle = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex items-center">
      <div className="flex border border-gray-200 rounded-md overflow-hidden">
        <button
          onClick={() => setViewMode('grid')}
          className={`flex items-center px-3 py-2 ${viewMode === 'grid' ? 'bg-news-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>

          <Grid className="h-4 w-4 mr-1.5" />
          <span className="text-sm font-medium">Grid</span>
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`flex items-center px-3 py-2 ${viewMode === 'list' ? 'bg-news-primary text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>

          <List className="h-4 w-4 mr-1.5" />
          <span className="text-sm font-medium">List</span>
        </button>
      </div>
      <div className="ml-2 relative">
        <button className="flex items-center px-3 py-2 bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 rounded-md">
          <SlidersHorizontal className="h-4 w-4 mr-1.5" />
          <span className="text-sm font-medium">Sort</span>
        </button>
      </div>
    </div>);

};