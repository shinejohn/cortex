import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Tag,
  Eye,
  Printer,
  Download,
  Share2,
  BookmarkPlus,
  Info,
  AlertCircle } from
'lucide-react';
export const ArchiveResults = ({
  results,
  isLoading,
  selectedDate,
  sepiaMode,
  showHistoricalContext,
  activeCollection,
  searchParams
}) => {
  const [viewMode, setViewMode] = useState('list'); // 'list', 'newspaper', 'original'
  // Format the selected date for display
  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  // Get the title for the results section
  const getResultsTitle = () => {
    if (activeCollection) {
      switch (activeCollection) {
        case 'thisDay':
          return `This Day in History: ${selectedDate.toLocaleDateString(
            'en-US',
            {
              month: 'long',
              day: 'numeric'
            }
          )}`;
        case 'yearReview1950':
          return '1950: Year in Review';
        case 'downtown':
          return 'Downtown Development Through the Years';
        case 'hurricane':
          return 'Hurricane History: Major Storms of the Past Century';
        default:
          return `Archive Results: ${formattedDate}`;
      }
    } else if (searchParams.keywords) {
      return `Search Results for "${searchParams.keywords}"`;
    } else {
      return `Archive Results: ${formattedDate}`;
    }
  };
  // Get the description for the results section
  const getResultsDescription = () => {
    if (activeCollection) {
      switch (activeCollection) {
        case 'thisDay':
          return `Exploring historical events that occurred on ${selectedDate.toLocaleDateString(
            'en-US',
            {
              month: 'long',
              day: 'numeric'
            }
          )} throughout the years.`;
        case 'yearReview1950':
          return 'A look back at the major events and stories that shaped our community and the world in 1950.';
        case 'downtown':
          return 'Chronicling the evolution of our downtown area from its early days to the present.';
        case 'hurricane':
          return 'Documenting the major hurricanes that have affected our region and their lasting impact.';
        default:
          return '';
      }
    } else if (searchParams.keywords) {
      return `Found ${results.length} results matching your search criteria.`;
    } else {
      return `Showing archived content from ${formattedDate}.`;
    }
  };
  // Render loading state
  if (isLoading) {
    return (
      <div
        className={`rounded-lg shadow-md p-6 ${sepiaMode ? 'bg-amber-100 border border-amber-200' : 'bg-white border border-gray-200'}`}>

        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-news-primary"></div>
        </div>
      </div>);

  }
  // Render empty state
  if (results.length === 0) {
    return (
      <div
        className={`rounded-lg shadow-md p-6 ${sepiaMode ? 'bg-amber-100 border border-amber-200' : 'bg-white border border-gray-200'}`}>

        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            No Archives Found
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            We couldn't find any archived content for the selected date or
            search criteria. Try selecting a different date or adjusting your
            search.
          </p>
        </div>
      </div>);

  }
  // Render newspaper view
  if (viewMode === 'newspaper') {
    return (
      <div
        className={
        sepiaMode ?
        'bg-amber-50 border border-amber-200 shadow-md' :
        'bg-white border border-gray-200 shadow-md'
        }>

        {/* Newspaper header */}
        <div
          className={`p-6 border-b ${sepiaMode ? 'border-amber-200' : 'border-gray-200'}`}>

          <div className="text-center">
            <h1 className="font-display text-4xl font-black uppercase tracking-tight mb-2">
              THE CLEARWATER DAILY NEWS
            </h1>
            <div className="text-sm text-gray-600 mb-4">
              {formattedDate} • Vol. {Math.floor(Math.random() * 100)} • No.{' '}
              {Math.floor(Math.random() * 1000)}
            </div>
            <div className="flex justify-between items-center text-xs text-gray-500 border-t border-b py-2 px-4 mx-auto max-w-2xl">
              <span>MORNING EDITION</span>
              <span>PRICE: 5 CENTS</span>
              <span>WEATHER: FAIR, 72°</span>
            </div>
          </div>
        </div>
        {/* Newspaper content */}
        <div className="p-6 grid grid-cols-6 gap-4">
          {/* Main headline */}
          <div className="col-span-4 border-r pr-4">
            <h2 className="font-display text-3xl font-bold mb-3">
              {results[0].title}
            </h2>
            <div className="text-sm italic mb-3">By {results[0].source}</div>
            {results[0].image &&
            <div className="mb-4">
                <img
                src={results[0].image}
                alt={results[0].title}
                className="w-full h-auto" />

                <div className="text-xs text-gray-600 mt-1 italic">
                  Photograph from the Clearwater Historical Archives
                </div>
              </div>
            }
            <div className="text-base leading-relaxed space-y-4 mt-4">
              <p>{results[0].excerpt}</p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat.
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt
                mollit anim id est laborum.
              </p>
            </div>
          </div>
          {/* Secondary stories */}
          <div className="col-span-2">
            {results.slice(1, 4).map((result, index) =>
            <div
              key={result.id}
              className={`mb-6 ${index > 0 ? 'pt-4 border-t' : ''}`}>

                <h3 className="font-display text-xl font-bold mb-2">
                  {result.title}
                </h3>
                <div className="text-xs text-gray-600 mb-2">
                  {result.source}
                </div>
                {result.image &&
              <img
                src={result.image}
                alt={result.title}
                className="w-full h-auto mb-2" />

              }
                <p className="text-sm">{result.excerpt}</p>
              </div>
            )}
          </div>
        </div>
        {/* Newspaper actions */}
        <div
          className={`p-4 border-t flex justify-between items-center ${sepiaMode ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}>

          <div className="text-sm text-gray-600">
            From the Clearwater News Archives
          </div>
          <div className="flex space-x-2">
            <button
              className={`p-2 rounded-md ${sepiaMode ? 'hover:bg-amber-200' : 'hover:bg-gray-200'}`}>

              <Printer className="h-5 w-5 text-gray-600" />
            </button>
            <button
              className={`p-2 rounded-md ${sepiaMode ? 'hover:bg-amber-200' : 'hover:bg-gray-200'}`}>

              <Download className="h-5 w-5 text-gray-600" />
            </button>
            <button
              className={`p-2 rounded-md ${sepiaMode ? 'hover:bg-amber-200' : 'hover:bg-gray-200'}`}>

              <Share2 className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>);

  }
  // Render list view (default)
  return (
    <div>
      {/* Results header */}
      <div
        className={`rounded-lg shadow-md p-6 mb-6 ${sepiaMode ? 'bg-amber-100 border border-amber-200' : 'bg-white border border-gray-200'}`}>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {getResultsTitle()}
        </h2>
        <p className="text-gray-600 mb-4">{getResultsDescription()}</p>
        {/* View mode toggle */}
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-sm rounded-md ${viewMode === 'list' ? sepiaMode ? 'bg-amber-200 text-amber-800' : 'bg-blue-100 text-blue-700' : sepiaMode ? 'bg-amber-50 text-gray-700' : 'bg-gray-100 text-gray-700'}`}>

            List View
          </button>
          <button
            onClick={() => setViewMode('newspaper')}
            className={`px-3 py-1.5 text-sm rounded-md ${viewMode === 'newspaper' ? sepiaMode ? 'bg-amber-200 text-amber-800' : 'bg-blue-100 text-blue-700' : sepiaMode ? 'bg-amber-50 text-gray-700' : 'bg-gray-100 text-gray-700'}`}>

            Newspaper View
          </button>
        </div>
      </div>
      {/* Results list */}
      <div className="space-y-6">
        {results.map((result) =>
        <ArchiveResultCard
          key={result.id}
          result={result}
          sepiaMode={sepiaMode}
          showHistoricalContext={showHistoricalContext} />

        )}
      </div>
    </div>);

};
const ArchiveResultCard = ({ result, sepiaMode, showHistoricalContext }) => {
  // Format the date for display
  const formattedDate = result.date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return (
    <div
      className={`rounded-lg shadow-md overflow-hidden ${sepiaMode ? 'bg-amber-50 border border-amber-200' : 'bg-white border border-gray-200'}`}>

      <div className="flex flex-col md:flex-row">
        {/* Image */}
        {result.image &&
        <div className="md:w-1/3 h-48 md:h-auto">
            <img
            src={result.image}
            alt={result.title}
            className={`w-full h-full object-cover ${sepiaMode ? 'filter sepia' : ''}`} />

          </div>
        }
        {/* Content */}
        <div className="flex-1 p-4">
          {/* Article metadata */}
          <div className="flex items-center text-xs text-gray-500 mb-1">
            <span
              className={`${getCategoryBadgeColor(result.type, sepiaMode)} px-2 py-0.5 rounded-full font-medium mr-2`}>

              {formatArticleType(result.type)}
            </span>
            <span>{result.source}</span>
            <span className="mx-1">•</span>
            <span>{formattedDate}</span>
          </div>
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {result.title}
          </h3>
          {/* Excerpt */}
          <p className={`text-gray-600 mb-3 ${sepiaMode ? 'font-serif' : ''}`}>
            {result.excerpt}
          </p>
          {/* Historical context */}
          {showHistoricalContext && result.historicalContext &&
          <div
            className={`text-sm p-3 mb-3 rounded-md ${sepiaMode ? 'bg-amber-100' : 'bg-blue-50'} flex`}>

              <Info
              className={`h-4 w-4 mr-2 flex-shrink-0 mt-0.5 ${sepiaMode ? 'text-amber-800' : 'text-blue-500'}`} />

              <div>
                <span className="font-medium">Historical Context: </span>
                {result.historicalContext}
              </div>
            </div>
          }
          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between">
            <div className="flex items-center space-x-3 text-xs text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                <span>{formattedDate}</span>
              </div>
              <div className="flex items-center">
                <Tag className="h-3.5 w-3.5 mr-1" />
                <span>{formatArticleType(result.type)}</span>
              </div>
              <div className="flex items-center">
                <Eye className="h-3.5 w-3.5 mr-1" />
                <span>{Math.floor(Math.random() * 1000)} views</span>
              </div>
            </div>
            <div className="flex mt-2 md:mt-0 space-x-2">
              <button
                className={`p-1.5 rounded-md ${sepiaMode ? 'hover:bg-amber-200' : 'hover:bg-gray-100'}`}>

                <Printer className="h-4 w-4 text-gray-500" />
              </button>
              <button
                className={`p-1.5 rounded-md ${sepiaMode ? 'hover:bg-amber-200' : 'hover:bg-gray-100'}`}>

                <Download className="h-4 w-4 text-gray-500" />
              </button>
              <button
                className={`p-1.5 rounded-md ${sepiaMode ? 'hover:bg-amber-200' : 'hover:bg-gray-100'}`}>

                <Share2 className="h-4 w-4 text-gray-500" />
              </button>
              <button
                className={`p-1.5 rounded-md ${sepiaMode ? 'hover:bg-amber-200' : 'hover:bg-gray-100'}`}>

                <BookmarkPlus className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>);

};
// Helper function to get badge color based on article type
const getCategoryBadgeColor = (type, sepiaMode) => {
  if (sepiaMode) {
    switch (type) {
      case 'frontPage':
        return 'bg-red-100 text-red-800';
      case 'local':
        return 'bg-amber-100 text-amber-800';
      case 'sports':
        return 'bg-green-100 text-green-800';
      case 'business':
        return 'bg-blue-100 text-blue-800';
      case 'entertainment':
        return 'bg-purple-100 text-purple-800';
      case 'politics':
        return 'bg-orange-100 text-orange-800';
      case 'feature':
        return 'bg-teal-100 text-teal-800';
      case 'national':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  } else {
    switch (type) {
      case 'frontPage':
        return 'bg-red-100 text-red-700';
      case 'local':
        return 'bg-yellow-100 text-yellow-700';
      case 'sports':
        return 'bg-green-100 text-green-700';
      case 'business':
        return 'bg-blue-100 text-blue-700';
      case 'entertainment':
        return 'bg-purple-100 text-purple-700';
      case 'politics':
        return 'bg-orange-100 text-orange-700';
      case 'feature':
        return 'bg-teal-100 text-teal-700';
      case 'national':
        return 'bg-indigo-100 text-indigo-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }
};
// Helper function to format article type for display
const formatArticleType = (type) => {
  switch (type) {
    case 'frontPage':
      return 'Front Page';
    case 'local':
      return 'Local News';
    case 'sports':
      return 'Sports';
    case 'business':
      return 'Business';
    case 'entertainment':
      return 'Entertainment';
    case 'politics':
      return 'Politics';
    case 'feature':
      return 'Feature';
    case 'national':
      return 'National';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};