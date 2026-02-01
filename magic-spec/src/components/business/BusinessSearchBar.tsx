import React, { useState } from 'react';
import { Search } from 'lucide-react';
export const BusinessSearchBar = ({ searchQuery, setSearchQuery }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  // Popular searches - would come from backend in a real app
  const popularSearches = [
  'Restaurants',
  'Coffee shops',
  'Hair salons',
  'Dentists',
  'Plumbers',
  'Auto repair',
  'Gyms',
  'Boutiques'];

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.length > 1) {
      // Filter suggestions based on input
      const filtered = popularSearches.filter((item) =>
      item.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
  };
  return (
    <div className="relative max-w-3xl mx-auto">
      <div className="relative">
        <input
          type="text"
          placeholder="Find businesses, services, or products in Clearwater"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-white/30 bg-white/10 backdrop-blur-sm text-black font-medium placeholder-gray-600 focus:outline-none focus:border-white/50 shadow-lg" />

        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-700" />
      </div>
      {/* Suggestions dropdown */}
      {isFocused && (suggestions.length > 0 || searchQuery.length === 0) &&
      <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-2">
            <h4 className="text-xs font-medium text-gray-500 px-3 py-2">
              {searchQuery.length === 0 ? 'POPULAR SEARCHES' : 'SUGGESTIONS'}
            </h4>
            <div className="space-y-1">
              {(searchQuery.length === 0 ? popularSearches : suggestions).map(
              (item, index) =>
              <button
                key={index}
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-gray-700 flex items-center"
                onClick={() => handleSuggestionClick(item)}>

                    <Search className="h-4 w-4 mr-2 text-gray-400" />
                    {item}
                  </button>

            )}
            </div>
          </div>
        </div>
      }
    </div>);

};