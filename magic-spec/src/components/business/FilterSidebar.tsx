import React from 'react';
import { Star } from 'lucide-react';
export const FilterSidebar = ({ filters, setFilters }) => {
  const handleCheckboxChange = (filterName) => {
    setFilters({
      ...filters,
      [filterName]: !filters[filterName]
    });
  };
  const handleDistanceChange = (e) => {
    setFilters({
      ...filters,
      distance: parseInt(e.target.value)
    });
  };
  const handlePriceRangeChange = (priceLevel) => {
    const currentPriceRange = [...filters.priceRange];
    if (currentPriceRange.includes(priceLevel)) {
      // Remove price level if already selected
      setFilters({
        ...filters,
        priceRange: currentPriceRange.filter((level) => level !== priceLevel)
      });
    } else {
      // Add price level
      setFilters({
        ...filters,
        priceRange: [...currentPriceRange, priceLevel]
      });
    }
  };
  const handleRatingChange = (rating) => {
    setFilters({
      ...filters,
      minRating: rating === filters.minRating ? 0 : rating
    });
  };
  const resetFilters = () => {
    setFilters({
      openNow: false,
      deliveryAvailable: false,
      newBusinesses: false,
      distance: 10,
      priceRange: [],
      minRating: 0
    });
  };
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 sticky top-4">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-800">Filters</h3>
      </div>
      <div className="p-4 space-y-6">
        {/* Quick filters */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.openNow}
              onChange={() => handleCheckboxChange('openNow')}
              className="rounded text-news-primary focus:ring-news-primary" />

            <span className="text-sm text-gray-700">Open Now</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.deliveryAvailable}
              onChange={() => handleCheckboxChange('deliveryAvailable')}
              className="rounded text-news-primary focus:ring-news-primary" />

            <span className="text-sm text-gray-700">Delivery Available</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.newBusinesses}
              onChange={() => handleCheckboxChange('newBusinesses')}
              className="rounded text-news-primary focus:ring-news-primary" />

            <span className="text-sm text-gray-700">New Businesses</span>
          </label>
        </div>
        {/* Distance slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Distance: {filters.distance} miles
          </label>
          <input
            type="range"
            min="1"
            max="25"
            value={filters.distance}
            onChange={handleDistanceChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 mi</span>
            <span>25 mi</span>
          </div>
        </div>
        {/* Price range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range
          </label>
          <div className="flex space-x-2">
            {['$', '$$', '$$$', '$$$$'].map((price) =>
            <button
              key={price}
              onClick={() => handlePriceRangeChange(price)}
              className={`flex-1 py-1.5 rounded text-sm font-medium ${filters.priceRange.includes(price) ? 'bg-news-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>

                {price}
              </button>
            )}
          </div>
        </div>
        {/* Ratings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ratings
          </label>
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) =>
            <button
              key={rating}
              onClick={() => handleRatingChange(rating)}
              className={`flex items-center w-full px-3 py-1.5 rounded text-sm ${filters.minRating === rating ? 'bg-news-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>

                <div className="flex">
                  {[...Array(5)].map((_, i) =>
                <Star
                  key={i}
                  fill={i < rating ? 'currentColor' : 'none'}
                  className={`h-3.5 w-3.5 ${filters.minRating === rating ? 'text-white' : i < rating ? 'text-yellow-400' : 'text-gray-300'}`} />

                )}
                </div>
                <span className="ml-1.5">& Up</span>
              </button>
            )}
          </div>
        </div>
        {/* Reset filters */}
        <button
          onClick={resetFilters}
          className="w-full py-2 text-sm text-news-primary font-medium hover:underline">

          Reset All Filters
        </button>
      </div>
    </div>);

};