import React, { useEffect, useState } from 'react';
import { Search, MapPin, X } from 'lucide-react';
export const CitySearch = ({ onCitySelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  // Simulate search API call
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    // Simulate API delay
    const timer = setTimeout(() => {
      // Mock search results
      const mockResults = [
      {
        id: 'clearwater-fl',
        name: 'Clearwater',
        state: 'FL',
        population: 115,
        '975': '',
        activeStories: 143,
        coordinates: '{ lat: 27.9659',
        lng: '-82.8001 }'
      },
      {
        id: 'clearwater-beach-fl',
        name: 'Clearwater Beach',
        state: 'FL',
        population: 2,
        '321': '',
        activeStories: 87,
        coordinates: '{ lat: 27.9775',
        lng: '-82.8328 }'
      },
      {
        id: 'clearwater-ks',
        name: 'Clearwater',
        state: 'KS',
        population: 2,
        '481': '',
        activeStories: 14,
        coordinates: '{ lat: 37.5042',
        lng: '-97.5045 }'
      },
      {
        id: 'clearfield-pa',
        name: 'Clearfield',
        state: 'PA',
        population: 5,
        '962': '',
        activeStories: 32,
        coordinates: '{ lat: 41.0292',
        lng: '-78.4408 }'
      },
      {
        id: 'clear-lake-ia',
        name: 'Clear Lake',
        state: 'IA',
        population: 7,
        '687': '',
        activeStories: 28,
        coordinates: '{ lat: 43.1366',
        lng: '-93.3652 }'
      }].
      filter(
        (city) =>
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        city.state.toLowerCase().includes(query.toLowerCase())
      );
      setResults(mockResults);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Find Any Community
      </h2>
      <div className="relative">
        <input
          type="text"
          placeholder="Enter city name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary" />

        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        {query &&
        <button
          onClick={() => setQuery('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2">

            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        }
        {/* Search results */}
        {query.length >= 2 &&
        <div className="absolute left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 z-10 max-h-60 overflow-y-auto">
            {loading ?
          <div className="p-4 text-center text-gray-500">
                <div className="animate-spin h-5 w-5 border-2 border-news-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <span>Searching communities...</span>
              </div> :
          results.length > 0 ?
          <div>
                {results.map((city) =>
            <button
              key={city.id}
              className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              onClick={() => {
                onCitySelect(city);
                setQuery('');
              }}>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {city.name}, {city.state}
                        </div>
                        <div className="text-sm text-gray-500">
                          Pop: {city.population.toLocaleString()} •{' '}
                          {city.activeStories} stories
                        </div>
                      </div>
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                  </button>
            )}
              </div> :

          <div className="p-4 text-center text-gray-500">
                No communities found matching "{query}"
              </div>
          }
          </div>
        }
      </div>
    </div>);

};