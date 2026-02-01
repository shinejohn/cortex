import React from 'react';
import {
  Calendar,
  MapPin,
  User,
  Clock,
  Heart,
  MessageCircle,
  Tag,
  ArrowRight,
  Star,
  Store } from
'lucide-react';
export const ContentStream = ({ content }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Recent Content</h2>
        <div className="flex items-center text-sm text-news-primary">
          <span>View all</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </div>
      </div>
      {content.map((item) =>
      <ContentCard key={item.id} item={item} />
      )}
      <div className="flex justify-center">
        <button className="bg-white hover:bg-gray-50 text-news-primary font-medium px-6 py-3 rounded-md border border-gray-300 shadow-sm">
          Load More
        </button>
      </div>
    </div>);

};
const ContentCard = ({ item }) => {
  switch (item.type) {
    case 'article':
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row">
            {item.image &&
            <div className="md:w-1/3 h-48 md:h-auto">
                <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover" />

              </div>
            }
            <div className="flex-1 p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 mb-3">{item.excerpt}</p>
              <div className="flex items-center mb-3">
                <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
                  <img
                    src={item.author.avatar}
                    alt={item.author.name}
                    className="w-full h-full object-cover" />

                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {item.author.name}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{item.publishedAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" />
                    <span>{item.engagement.likes}</span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    <span>{item.engagement.comments}</span>
                  </div>
                </div>
                <div className="flex flex-wrap">
                  {item.tags?.slice(0, 2).map((tag, index) =>
                  <span
                    key={index}
                    className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full mr-1 mb-1">

                      <Tag className="h-3 w-3 mr-1" />
                      {tag.split('-').join(' ')}
                    </span>
                  )}
                  {item.tags?.length > 2 &&
                  <span className="text-xs text-gray-500 px-1">
                      +{item.tags.length - 2} more
                    </span>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>);

    case 'event':
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row">
            {item.image &&
            <div className="md:w-1/3 h-48 md:h-auto">
                <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover" />

              </div>
            }
            <div className="flex-1 p-4">
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  Event
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600 mb-3">{item.description}</p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-3">
                <div className="flex items-center text-sm text-gray-700">
                  <Calendar className="h-4 w-4 mr-1.5 text-green-600" />
                  <span>{item.date}</span>
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <MapPin className="h-4 w-4 mr-1.5 text-green-600" />
                  <span>{item.location}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Organized by: {item.organizer}
                </div>
                <div className="flex flex-wrap">
                  {item.tags?.slice(0, 2).map((tag, index) =>
                  <span
                    key={index}
                    className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full mr-1 mb-1">

                      <Tag className="h-3 w-3 mr-1" />
                      {tag.split('-').join(' ')}
                    </span>
                  )}
                  {item.tags?.length > 2 &&
                  <span className="text-xs text-gray-500 px-1">
                      +{item.tags.length - 2} more
                    </span>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>);

    case 'business':
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row">
            {item.image &&
            <div className="md:w-1/3 h-48 md:h-auto">
                <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover" />

              </div>
            }
            <div className="flex-1 p-4">
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                  Business
                </span>
              </div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-900">
                  {item.title}
                </h3>
                <div className="flex items-center">
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-sm font-medium">
                      {item.rating}
                    </span>
                  </div>
                  <span className="mx-1 text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {item.reviewCount} reviews
                  </span>
                </div>
              </div>
              <p className="text-gray-600 mb-3">{item.description}</p>
              <div className="flex items-center text-sm text-gray-700 mb-3">
                <MapPin className="h-4 w-4 mr-1.5 text-purple-600" />
                <span>{item.location}</span>
              </div>
              <div className="flex justify-end">
                <div className="flex flex-wrap">
                  {item.tags?.slice(0, 3).map((tag, index) =>
                  <span
                    key={index}
                    className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full mr-1 mb-1">

                      <Tag className="h-3 w-3 mr-1" />
                      {tag.split('-').join(' ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>);

    default:
      return null;
  }
};