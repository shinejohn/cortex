import React, { useState } from 'react';
import { Search, Calendar, ChevronDown, Tag, Filter, X } from 'lucide-react';
export const ArchiveSearch = ({ onSearch, sepiaMode }) => {
  const [keywords, setKeywords] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSources, setSelectedSources] = useState([]);
  // Available categories
  const categories = [
  'Local News',
  'Politics',
  'Business',
  'Sports',
  'Entertainment',
  'Opinion',
  'Education',
  'Crime',
  'Environment'];

  // Available sources
  const sources = [
  'Clearwater Daily News',
  'Clearwater Herald',
  'Clearwater Gazette',
  'Clearwater Business Journal',
  'Clearwater Sports Chronicle'];

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      keywords,
      dateRange: {
        start: dateRange.start ? new Date(dateRange.start) : null,
        end: dateRange.end ? new Date(dateRange.end) : null
      },
      categories: selectedCategories,
      sources: selectedSources
    });
  };
  // Toggle category selection
  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };
  // Toggle source selection
  const toggleSource = (source) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter((s) => s !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };
  // Reset all filters
  const resetFilters = () => {
    setKeywords('');
    setDateRange({
      start: '',
      end: ''
    });
    setSelectedCategories([]);
    setSelectedSources([]);
  };
  return (
    <div
      className={`rounded-lg shadow-md p-4 ${sepiaMode ? 'bg-amber-100 border border-amber-200' : 'bg-white border border-gray-200'}`}>

      <h3 className="font-bold text-gray-900 mb-4">Search Archives</h3>
      <form onSubmit={handleSubmit}>
        {/* Keyword search */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search the archives..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-md ${sepiaMode ? 'border-amber-300 bg-amber-50 focus:ring-amber-500 focus:border-amber-500' : 'border-gray-300 focus:ring-news-primary focus:border-news-primary'}`} />

            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>
        {/* Date range */}
        <div className="mb-4">
          <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Calendar className="h-4 w-4 mr-1.5" />
            <span>Date Range</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">From</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                setDateRange({
                  ...dateRange,
                  start: e.target.value
                })
                }
                className={`w-full px-3 py-1.5 border rounded-md text-sm ${sepiaMode ? 'border-amber-300 bg-amber-50' : 'border-gray-300'}`}
                max={new Date().toISOString().split('T')[0]} />

            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">To</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                setDateRange({
                  ...dateRange,
                  end: e.target.value
                })
                }
                className={`w-full px-3 py-1.5 border rounded-md text-sm ${sepiaMode ? 'border-amber-300 bg-amber-50' : 'border-gray-300'}`}
                max={new Date().toISOString().split('T')[0]} />

            </div>
          </div>
        </div>
        {/* Advanced search toggle */}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center text-sm font-medium mb-4 ${sepiaMode ? 'text-amber-800' : 'text-news-primary'}`}>

          <Filter className="h-4 w-4 mr-1.5" />
          <span>Advanced Filters</span>
          <ChevronDown
            className={`h-4 w-4 ml-1.5 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />

        </button>
        {/* Advanced search options */}
        {showAdvanced &&
        <div className="mb-4 space-y-4">
            {/* Categories */}
            <div>
              <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Tag className="h-4 w-4 mr-1.5" />
                <span>Categories</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) =>
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1.5 rounded-full text-xs ${selectedCategories.includes(category) ? sepiaMode ? 'bg-amber-200 text-amber-800' : 'bg-news-primary text-white' : sepiaMode ? 'bg-amber-50 text-gray-700 hover:bg-amber-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>

                    {category}
                  </button>
              )}
              </div>
            </div>
            {/* Sources */}
            <div>
              <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <BookOpen className="h-4 w-4 mr-1.5" />
                <span>Sources</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sources.map((source) =>
              <button
                key={source}
                type="button"
                onClick={() => toggleSource(source)}
                className={`px-3 py-1.5 rounded-full text-xs ${selectedSources.includes(source) ? sepiaMode ? 'bg-amber-200 text-amber-800' : 'bg-news-primary text-white' : sepiaMode ? 'bg-amber-50 text-gray-700 hover:bg-amber-100' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>

                    {source}
                  </button>
              )}
              </div>
            </div>
          </div>
        }
        {/* Active filters summary */}
        {(keywords ||
        dateRange.start ||
        dateRange.end ||
        selectedCategories.length > 0 ||
        selectedSources.length > 0) &&
        <div className="mb-4 p-3 rounded-md bg-gray-50 text-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">Active Filters</span>
              <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-gray-500 hover:text-gray-700">

                Reset All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {keywords &&
            <div
              className={`flex items-center px-2 py-1 rounded-full text-xs ${sepiaMode ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'}`}>

                  <span>Keywords: {keywords}</span>
                  <button
                type="button"
                onClick={() => setKeywords('')}
                className="ml-1 p-0.5 rounded-full hover:bg-white hover:bg-opacity-30">

                    <X className="h-3 w-3" />
                  </button>
                </div>
            }
              {dateRange.start &&
            <div
              className={`flex items-center px-2 py-1 rounded-full text-xs ${sepiaMode ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-700'}`}>

                  <span>
                    From: {new Date(dateRange.start).toLocaleDateString()}
                  </span>
                  <button
                type="button"
                onClick={() =>
                setDateRange({
                  ...dateRange,
                  start: ''
                })
                }
                className="ml-1 p-0.5 rounded-full hover:bg-white hover:bg-opacity-30">

                    <X className="h-3 w-3" />
                  </button>
                </div>
            }
              {dateRange.end &&
            <div
              className={`flex items-center px-2 py-1 rounded-full text-xs ${sepiaMode ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-700'}`}>

                  <span>
                    To: {new Date(dateRange.end).toLocaleDateString()}
                  </span>
                  <button
                type="button"
                onClick={() =>
                setDateRange({
                  ...dateRange,
                  end: ''
                })
                }
                className="ml-1 p-0.5 rounded-full hover:bg-white hover:bg-opacity-30">

                    <X className="h-3 w-3" />
                  </button>
                </div>
            }
              {selectedCategories.length > 0 &&
            <div
              className={`flex items-center px-2 py-1 rounded-full text-xs ${sepiaMode ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-700'}`}>

                  <span>Categories: {selectedCategories.length}</span>
                  <button
                type="button"
                onClick={() => setSelectedCategories([])}
                className="ml-1 p-0.5 rounded-full hover:bg-white hover:bg-opacity-30">

                    <X className="h-3 w-3" />
                  </button>
                </div>
            }
              {selectedSources.length > 0 &&
            <div
              className={`flex items-center px-2 py-1 rounded-full text-xs ${sepiaMode ? 'bg-amber-100 text-amber-800' : 'bg-orange-100 text-orange-700'}`}>

                  <span>Sources: {selectedSources.length}</span>
                  <button
                type="button"
                onClick={() => setSelectedSources([])}
                className="ml-1 p-0.5 rounded-full hover:bg-white hover:bg-opacity-30">

                    <X className="h-3 w-3" />
                  </button>
                </div>
            }
            </div>
          </div>
        }
        {/* Search button */}
        <button
          type="submit"
          className={`w-full py-2 rounded-md font-medium ${sepiaMode ? 'bg-amber-200 text-amber-800 hover:bg-amber-300' : 'bg-news-primary text-white hover:bg-news-primary-dark'}`}>

          Search Archives
        </button>
      </form>
    </div>);

};
// Helper function for BookOpen icon (not available in Lucide directly)
const BookOpen = ({ className }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}>

      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </svg>);

};