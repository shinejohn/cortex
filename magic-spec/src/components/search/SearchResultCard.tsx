import React from 'react';
import {
  Calendar,
  MapPin,
  Star,
  Clock,
  Eye,
  MessageCircle,
  Share2,
  Tag,
  User,
  Ticket } from
'lucide-react';
export const SearchResultCard = ({ result, query }) => {
  // Function to highlight search terms in text
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ?
        <span key={i} className="bg-yellow-100 font-medium">
              {part}
            </span> :

        part

        )}
      </>);

  };
  // Render different card layouts based on result type
  switch (result.type) {
    case 'news':
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row">
            {result.image &&
            <div className="md:w-1/4 h-48 md:h-auto">
                <img
                src={result.image}
                alt={result.title}
                className="w-full h-full object-cover" />

              </div>
            }
            <div className="flex-1 p-4">
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium mr-2">
                  News
                </span>
                <span>{result.source}</span>
                <span className="mx-1">•</span>
                <span>{result.date}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {highlightText(result.title, query)}
              </h3>
              <p className="text-gray-600 mb-3 line-clamp-2">
                {highlightText(result.snippet, query)}
              </p>
              <div className="flex flex-wrap items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <User className="h-4 w-4 mr-1" />
                  <span>{result.author}</span>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    <span>{result.engagement.views}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="h-3.5 w-3.5 mr-1" />
                    <span>{result.engagement.comments}</span>
                  </div>
                  <div className="flex items-center">
                    <Share2 className="h-3.5 w-3.5 mr-1" />
                    <span>{result.engagement.shares}</span>
                  </div>
                </div>
              </div>
              {result.tags &&
              <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag, index) =>
                  <span
                    key={index}
                    className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">

                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                  )}
                  </div>
                </div>
              }
            </div>
          </div>
        </div>);

    case 'event':
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row">
            {result.image &&
            <div className="md:w-1/4 h-48 md:h-auto">
                <img
                src={result.image}
                alt={result.title}
                className="w-full h-full object-cover" />

              </div>
            }
            <div className="flex-1 p-4">
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium mr-2">
                  Event
                </span>
                <span>{result.organizer}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {highlightText(result.title, query)}
              </h3>
              <p className="text-gray-600 mb-3 line-clamp-2">
                {highlightText(result.snippet, query)}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-3">
                <div className="flex items-center text-sm text-gray-700">
                  <Calendar className="h-4 w-4 mr-1.5 text-green-600" />
                  <span className="font-medium">{result.date}</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <MapPin className="h-4 w-4 mr-1.5 text-green-600" />
                  <span>{result.location}</span>
                </div>
              </div>
              {result.tags &&
              <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag, index) =>
                  <span
                    key={index}
                    className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">

                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                  )}
                  </div>
                </div>
              }
            </div>
          </div>
        </div>);

    case 'business':
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row">
            {result.image &&
            <div className="md:w-1/4 h-48 md:h-auto">
                <img
                src={result.image}
                alt={result.title}
                className="w-full h-full object-cover" />

              </div>
            }
            <div className="flex-1 p-4">
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium mr-2">
                  Business
                </span>
              </div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900">
                  {highlightText(result.title, query)}
                </h3>
                <div className="flex items-center">
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-sm font-medium">
                      {result.rating}
                    </span>
                  </div>
                  <span className="mx-1 text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {result.reviewCount} reviews
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-3 line-clamp-2">
                {highlightText(result.snippet, query)}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-3">
                <div className="flex items-center text-sm text-gray-700">
                  <MapPin className="h-4 w-4 mr-1.5 text-purple-600" />
                  <span>{result.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Clock className="h-4 w-4 mr-1.5 text-purple-600" />
                  <span>{result.hours}</span>
                </div>
              </div>
              {result.tags &&
              <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag, index) =>
                  <span
                    key={index}
                    className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">

                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                  )}
                  </div>
                </div>
              }
            </div>
          </div>
        </div>);

    case 'people':
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row">
            {result.image &&
            <div className="md:w-1/6 h-48 md:h-auto">
                <img
                src={result.image}
                alt={result.title}
                className="w-full h-full object-cover" />

              </div>
            }
            <div className="flex-1 p-4">
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium mr-2">
                  Person
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {highlightText(result.title, query)}
              </h3>
              <div className="text-sm text-gray-700 mb-3">
                {result.position} at {result.organization}
              </div>
              <p className="text-gray-600 mb-3 line-clamp-2">
                {highlightText(result.snippet, query)}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-3">
                {result.contact?.email &&
                <div className="flex items-center text-sm text-gray-700">
                    <span className="font-medium mr-1">Email:</span>
                    <span>{result.contact.email}</span>
                  </div>
                }
                {result.contact?.phone &&
                <div className="flex items-center text-sm text-gray-700">
                    <span className="font-medium mr-1">Phone:</span>
                    <span>{result.contact.phone}</span>
                  </div>
                }
              </div>
              {result.tags &&
              <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag, index) =>
                  <span
                    key={index}
                    className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">

                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                  )}
                  </div>
                </div>
              }
            </div>
          </div>
        </div>);

    case 'deal':
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row">
            {result.image &&
            <div className="md:w-1/4 h-48 md:h-auto">
                <img
                src={result.image}
                alt={result.title}
                className="w-full h-full object-cover" />

              </div>
            }
            <div className="flex-1 p-4">
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium mr-2">
                  Deal
                </span>
                <span>{result.business}</span>
              </div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900">
                  {highlightText(result.title, query)}
                </h3>
                <div className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-sm font-bold">
                  {result.discount}
                </div>
              </div>
              <p className="text-gray-600 mb-3 line-clamp-2">
                {highlightText(result.snippet, query)}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-3">
                <div className="flex items-center text-sm text-gray-700">
                  <Clock className="h-4 w-4 mr-1.5 text-red-600" />
                  <span>Valid until: {result.validUntil}</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <Ticket className="h-4 w-4 mr-1.5 text-red-600" />
                  <span>{result.redemption}</span>
                </div>
              </div>
              {result.tags &&
              <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag, index) =>
                  <span
                    key={index}
                    className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">

                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                  )}
                  </div>
                </div>
              }
            </div>
          </div>
        </div>);

    default:
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            {highlightText(result.title, query)}
          </h3>
          <p className="text-gray-600">
            {highlightText(result.snippet, query)}
          </p>
        </div>);

  }
};