import React, { useEffect, useState } from 'react';
import {
  Search,
  X,
  Clock,
  Filter,
  ArrowUp,
  ArrowDown,
  Calendar,
  User,
  Tag,
  MapPin } from
'lucide-react';
import { PageHeader } from '../PageHeader';
import { SearchFilters } from './SearchFilters';
import { SearchResultCard } from './SearchResultCard';
import { SearchSuggestions } from './SearchSuggestions';
import { useLocationDetection } from '../location/LocationDetector';
export const SearchResultsPage = () => {
  const { locationData } = useLocationDetection();
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('any');
  const [sortBy, setSortBy] = useState('relevance');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [spellCheck, setSpellCheck] = useState(null);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [trendingSearches, setTrendingSearches] = useState([
  'farmers market',
  'school board meeting',
  'road construction',
  'local elections',
  'community events']
  );
  // Simulate fetching search results
  useEffect(() => {
    if (!query) return;
    setLoading(true);
    // Simulate API delay
    const timer = setTimeout(() => {
      const mockResults = generateMockResults(
        query,
        activeFilter,
        timeFilter,
        sortBy,
        page
      );
      setResults((prev) =>
      page > 1 ? [...prev, ...mockResults.results] : mockResults.results
      );
      setTotalResults(mockResults.total);
      // Simulate spell check
      if (query === 'farmes market') {
        setSpellCheck('farmers market');
      } else {
        setSpellCheck(null);
      }
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [query, activeFilter, timeFilter, sortBy, page]);
  // Add to search history when searching
  useEffect(() => {
    if (query && !searchHistory.includes(query)) {
      setSearchHistory((prev) => [query, ...prev].slice(0, 5));
    }
  }, [query]);
  const handleSearch = (e) => {
    e.preventDefault();
    const searchInput = e.target.elements.search.value;
    if (searchInput.trim()) {
      setQuery(searchInput.trim());
      setPage(1);
      setShowHistory(false);
    }
  };
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    setPage(1);
  };
  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
    setPage(1);
  };
  const handleSortChange = (sort) => {
    setSortBy(sort);
    setPage(1);
  };
  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };
  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
  };
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setPage(1);
  };
  const handleHistoryItemClick = (item) => {
    setQuery(item);
    setPage(1);
    setShowHistory(false);
  };
  const handleSpellCheckClick = () => {
    if (spellCheck) {
      setQuery(spellCheck);
      setPage(1);
    }
  };
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <PageHeader />
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Persistent Search Bar */}
        <div className="sticky top-0 z-10 bg-white rounded-lg shadow-md p-4 mb-6">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <input
                type="text"
                name="search"
                placeholder="Search for anything in your community..."
                defaultValue={query}
                className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-news-primary"
                onFocus={() => setShowHistory(true)} />

              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              {query &&
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600">

                  <X className="h-5 w-5" />
                </button>
              }
            </div>
            {/* Search History Dropdown */}
            {showHistory && searchHistory.length > 0 &&
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                <div className="p-2">
                  <div className="flex items-center justify-between px-3 py-2">
                    <h4 className="text-xs font-medium text-gray-500">
                      RECENT SEARCHES
                    </h4>
                    <button
                    className="text-xs text-news-primary hover:underline"
                    onClick={() => setSearchHistory([])}>

                      Clear All
                    </button>
                  </div>
                  <div className="space-y-1">
                    {searchHistory.map((item, index) =>
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-gray-700 flex items-center"
                    onClick={() => handleHistoryItemClick(item)}>

                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {item}
                      </button>
                  )}
                  </div>
                </div>
                <div className="border-t border-gray-100 p-2">
                  <div className="px-3 py-2">
                    <h4 className="text-xs font-medium text-gray-500">
                      TRENDING SEARCHES
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-2 px-3 pb-2">
                    {trendingSearches.map((trend, index) =>
                  <button
                    key={index}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full"
                    onClick={() => handleHistoryItemClick(trend)}>

                        {trend}
                      </button>
                  )}
                  </div>
                </div>
              </div>
            }
          </form>
        </div>
        {/* Spell Check Suggestion */}
        {spellCheck &&
        <div className="mb-4 text-sm">
            <span className="text-gray-600">Did you mean: </span>
            <button
            className="text-news-primary hover:underline font-medium"
            onClick={handleSpellCheckClick}>

              {spellCheck}
            </button>
          </div>
        }
        {/* Filter Pills */}
        <SearchFilters
          activeFilter={activeFilter}
          timeFilter={timeFilter}
          onFilterChange={handleFilterChange}
          onTimeFilterChange={handleTimeFilterChange} />

        {query ?
        <>
            {/* Results Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center my-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2 sm:mb-0">
                {loading && page === 1 ?
              <div className="h-7 w-48 bg-gray-200 animate-pulse rounded"></div> :

              <>
                    <span className="text-news-primary">{totalResults}</span>{' '}
                    results for "{query}"
                  </>
              }
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Sort:</span>
                <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1">

                  <option value="relevance">Relevance</option>
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>
            {/* Search Results */}
            <div className="space-y-6">
              {loading && page === 1 ?
            // Loading skeletons
            Array.from({
              length: 5
            }).map((_, i) =>
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">

                    <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-2"></div>
                    <div className="h-6 w-3/4 bg-gray-200 animate-pulse rounded mb-3"></div>
                    <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-2"></div>
                    <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded"></div>
                  </div>
            ) :
            results.length > 0 ?
            results.map((result, index) =>
            <SearchResultCard
              key={`${result.id}-${index}`}
              result={result}
              query={query} />

            ) :

            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="text-gray-400 mb-3">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    We couldn't find any matches for "{query}". Try different
                    keywords or filters.
                  </p>
                </div>
            }
            </div>
            {/* Load More */}
            {results.length > 0 && results.length < totalResults &&
          <div className="mt-8 text-center">
                <button
              onClick={handleLoadMore}
              className="bg-white hover:bg-gray-50 text-news-primary font-medium px-6 py-3 rounded-md border border-gray-300 shadow-sm"
              disabled={loading}>

                  {loading ?
              <span className="flex items-center justify-center">
                      <div className="animate-spin h-5 w-5 border-2 border-news-primary border-t-transparent rounded-full mr-2"></div>
                      Loading more...
                    </span> :

              `Load More (Showing ${results.length} of ${totalResults})`
              }
                </button>
              </div>
          }
          </> :

        <SearchSuggestions onSuggestionClick={handleSuggestionClick} />
        }
      </div>
    </div>);

};
// Helper function to generate mock search results
const generateMockResults = (query, filter, timeFilter, sortBy, page) => {
  const itemsPerPage = 10;
  const newsResults = [
  {
    id: 'news-1',
    type: 'news',
    title: 'Local Farmers Market Expands to New Location',
    snippet:
    'The popular weekend farmers market is moving to a larger venue to accommodate more vendors and visitors.',
    source: 'Clearwater Daily News',
    date: '2 hours ago',
    image:
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    engagement: {
      views: 1245,
      comments: 32,
      shares: 18
    },
    url: '#',
    author: 'Sarah Johnson',
    tags: ['farmers market', 'local business', 'community']
  },
  {
    id: 'news-2',
    type: 'news',
    title:
    'City Council Approves Funding for Downtown Farmers Market Pavilion',
    snippet:
    'The new structure will provide shelter for year-round farmers market operations and other community events.',
    source: 'Clearwater Daily News',
    date: '1 day ago',
    image:
    'https://images.unsplash.com/photo-1595228702670-3bef2b60a82f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    engagement: {
      views: 982,
      comments: 47,
      shares: 23
    },
    url: '#',
    author: 'Michael Reynolds',
    tags: ['city council', 'farmers market', 'downtown']
  },
  {
    id: 'news-3',
    type: 'news',
    title: 'Local Farmers Report Record Sales at Weekend Market',
    snippet:
    'Vendors at the Clearwater Farmers Market reported their highest sales day of the year as residents shopped for fresh produce.',
    source: 'Clearwater Business Journal',
    date: '3 days ago',
    image:
    'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    engagement: {
      views: 764,
      comments: 12,
      shares: 8
    },
    url: '#',
    author: 'Jessica Parker',
    tags: ['farmers market', 'local economy', 'agriculture']
  }];

  const eventResults = [
  {
    id: 'event-1',
    type: 'event',
    title: 'Weekly Farmers Market',
    snippet:
    'Join us every Saturday for fresh produce, artisanal foods, and handcrafted goods from local vendors.',
    location: 'Coachman Park, Clearwater',
    date: 'Every Saturday, 8am-1pm',
    image:
    'https://images.unsplash.com/photo-1526399232581-2ab5608b6336?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    url: '#',
    organizer: 'Clearwater Community Association',
    tags: ['farmers market', 'weekly event', 'food']
  },
  {
    id: 'event-2',
    type: 'event',
    title: 'Farm to Table Dinner at the Market',
    snippet:
    'A special evening event featuring a multi-course dinner prepared with ingredients from market vendors.',
    location: 'Clearwater Farmers Market Pavilion',
    date: 'July 15, 6pm-9pm',
    image:
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    url: '#',
    organizer: 'Clearwater Culinary Association',
    tags: ['farmers market', 'dinner', 'food event']
  }];

  const businessResults = [
  {
    id: 'business-1',
    type: 'business',
    title: 'Green Acres Organic Farm',
    snippet:
    'Family-owned organic farm with regular booth at the Clearwater Farmers Market. Specializing in heirloom vegetables.',
    location: 'Dunedin, FL (4.2 mi)',
    rating: 4.8,
    reviewCount: 36,
    image:
    'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    url: '#',
    hours: 'Market days: Sat 8am-1pm',
    tags: ['farm', 'farmers market', 'organic']
  },
  {
    id: 'business-2',
    type: 'business',
    title: 'Sunshine Bakery',
    snippet:
    'Artisanal bakery featuring sourdough breads, pastries, and seasonal specialties. Find us at the farmers market!',
    location: 'Clearwater, FL (1.8 mi)',
    rating: 4.9,
    reviewCount: 52,
    image:
    'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    url: '#',
    hours: 'Tue-Fri 7am-3pm, Sat at Market',
    tags: ['bakery', 'farmers market', 'food']
  }];

  const peopleResults = [
  {
    id: 'people-1',
    type: 'people',
    title: 'Maria Rodriguez',
    snippet:
    'Farmers Market Coordinator for the City of Clearwater. Contact for vendor applications and market information.',
    position: 'Market Coordinator',
    organization: 'City of Clearwater',
    image:
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    url: '#',
    contact: {
      email: 'markets@clearwater.gov',
      phone: '(727) 555-0123'
    },
    tags: ['farmers market', 'city staff', 'coordinator']
  }];

  const dealResults = [
  {
    id: 'deal-1',
    type: 'deal',
    title: 'Buy One Get One Free - Market Day Special',
    snippet:
    'Visit our booth at the farmers market this Saturday for a special BOGO offer on all jams and preserves.',
    business: 'Clearwater Canning Co.',
    validUntil: 'This Saturday only',
    discount: 'BOGO',
    image:
    'https://images.unsplash.com/photo-1563522255361-f803aac378fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    url: '#',
    redemption: 'Just mention this offer at our market booth',
    tags: ['farmers market', 'food', 'discount']
  }];

  // Combine all results
  let allResults = [
  ...newsResults,
  ...eventResults,
  ...businessResults,
  ...peopleResults,
  ...dealResults];

  // Filter by type if needed
  if (filter !== 'all') {
    const filterMap = {
      news: 'news',
      events: 'event',
      businesses: 'business',
      people: 'people',
      deals: 'deal'
    };
    allResults = allResults.filter((item) => item.type === filterMap[filter]);
  }
  // Filter by time if needed
  if (timeFilter !== 'any') {
    // This would be more sophisticated in a real app
    const today = new Date();
    if (timeFilter === 'today') {
      allResults = allResults.filter(
        (item) => item.date?.includes('hour') || item.date?.includes('today')
      );
    } else if (timeFilter === 'week') {
      allResults = allResults.filter((item) => !item.date?.includes('month'));
    }
  }
  // Sort results
  if (sortBy === 'recent') {
    // Simple mock sorting - would be more sophisticated in a real app
    allResults.sort((a, b) => {
      if (a.date?.includes('hour') && !b.date?.includes('hour')) return -1;
      if (!a.date?.includes('hour') && b.date?.includes('hour')) return 1;
      if (a.date?.includes('day') && b.date?.includes('week')) return -1;
      if (a.date?.includes('week') && b.date?.includes('day')) return 1;
      return 0;
    });
  } else if (sortBy === 'popular') {
    // Sort by engagement if available
    allResults.sort((a, b) => {
      const aEngagement = a.engagement?.views || 0;
      const bEngagement = b.engagement?.views || 0;
      return bEngagement - aEngagement;
    });
  }
  // Paginate results
  const start = (page - 1) * itemsPerPage;
  const paginatedResults = allResults.slice(start, start + itemsPerPage);
  return {
    results: paginatedResults,
    total: allResults.length
  };
};