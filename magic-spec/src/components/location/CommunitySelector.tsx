import React, { useEffect, useState, useRef } from 'react';
import { MapPin, Search, ChevronDown, X, Globe } from 'lucide-react';
import { useLocationDetection } from './LocationDetector';
// Mock data for communities - in production this would come from an API
const popularCommunities = [
{
  id: 'clearwater-fl-us',
  name: 'Clearwater',
  state: 'FL',
  country: 'US'
},
{
  id: 'dunedin-fl-us',
  name: 'Dunedin',
  state: 'FL',
  country: 'US'
},
{
  id: 'tampa-fl-us',
  name: 'Tampa',
  state: 'FL',
  country: 'US'
},
{
  id: 'st-petersburg-fl-us',
  name: 'St. Petersburg',
  state: 'FL',
  country: 'US'
},
{
  id: 'sarasota-fl-us',
  name: 'Sarasota',
  state: 'FL',
  country: 'US'
}];

// Search communities - in production this would be an API call
const searchCommunities = (query) => {
  if (!query) return [];
  const lowercaseQuery = query.toLowerCase();
  return [
  ...popularCommunities,
  {
    id: 'orlando-fl-us',
    name: 'Orlando',
    state: 'FL',
    country: 'US'
  },
  {
    id: 'miami-fl-us',
    name: 'Miami',
    state: 'FL',
    country: 'US'
  },
  {
    id: 'jacksonville-fl-us',
    name: 'Jacksonville',
    state: 'FL',
    country: 'US'
  },
  {
    id: 'gainesville-fl-us',
    name: 'Gainesville',
    state: 'FL',
    country: 'US'
  },
  {
    id: 'tallahassee-fl-us',
    name: 'Tallahassee',
    state: 'FL',
    country: 'US'
  }].
  filter(
    (community) =>
    community.name.toLowerCase().includes(lowercaseQuery) ||
    community.state.toLowerCase().includes(lowercaseQuery)
  );
};
export const CommunitySelector = () => {
  const { locationData, updateLocation } = useLocationDetection();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const dropdownRef = useRef(null);
  const currentCommunity = locationData ?
  {
    name: locationData.city,
    state: locationData.state,
    country: locationData.country
  } :
  null;
  useEffect(() => {
    const results = searchCommunities(searchQuery);
    setSearchResults(results);
  }, [searchQuery]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const handleCommunitySelect = (community) => {
    updateLocation({
      city: community.name,
      state: community.state,
      country: community.country,
      communityId: community.id,
      coordinates: locationData?.coordinates || {
        latitude: 0,
        longitude: 0
      }
    });
    setIsOpen(false);
    setSearchQuery('');
  };
  if (!currentCommunity) return null;
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm text-gray-700 hover:text-news-primary">

        <MapPin className="h-4 w-4 mr-1 text-news-primary" />
        <span>
          {currentCommunity.name}, {currentCommunity.state}
        </span>
        <ChevronDown className="h-3 w-3 ml-1" />
      </button>
      {isOpen &&
      <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 w-72 z-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Your Community
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-news-primary" />
                <span className="text-sm font-medium">
                  {currentCommunity.name}, {currentCommunity.state}
                </span>
              </div>
              <div className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                Current
              </div>
            </div>
          </div>
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-news-primary" />

              {searchQuery &&
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2">

                  <X className="h-4 w-4 text-gray-400" />
                </button>
            }
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto p-3">
            {searchQuery ?
          <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2">
                  SEARCH RESULTS
                </h4>
                {searchResults.length > 0 ?
            <div className="space-y-2">
                    {searchResults.map((community) =>
              <button
                key={community.id}
                onClick={() => handleCommunitySelect(community)}
                className="flex items-center w-full text-left p-2 hover:bg-gray-100 rounded-md">

                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">
                          {community.name}, {community.state}
                        </span>
                      </button>
              )}
                  </div> :

            <div className="text-center py-4">
                    <p className="text-sm text-gray-500">
                      No communities found
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try a different search term
                    </p>
                  </div>
            }
              </div> :

          <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2">
                  POPULAR COMMUNITIES
                </h4>
                <div className="space-y-2">
                  {popularCommunities.map((community) =>
              <button
                key={community.id}
                onClick={() => handleCommunitySelect(community)}
                className="flex items-center w-full text-left p-2 hover:bg-gray-100 rounded-md">

                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="text-sm">
                        {community.name}, {community.state}
                      </span>
                    </button>
              )}
                </div>
              </div>
          }
          </div>
          <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <button
            className="flex items-center justify-center w-full text-sm text-news-primary hover:text-news-primary-dark"
            onClick={() => setIsOpen(false)}>

              <Globe className="h-4 w-4 mr-1" />
              <span>View National News</span>
            </button>
          </div>
        </div>
      }
    </div>);

};