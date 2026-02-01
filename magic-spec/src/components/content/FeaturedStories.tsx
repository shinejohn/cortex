import React from 'react';
import { MapPin, Clock, Bookmark } from 'lucide-react';
export const FeaturedStories = ({ category = null, onArticleClick }) => {
  const allArticles = [
  {
    id: 1,
    title:
    'New Community Center to Open Next Month with State-of-the-Art Facilities',
    category: 'COMMUNITY',
    categoryType: 'Community',
    image:
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Downtown',
    readTime: '4 min'
  },
  {
    id: 2,
    title:
    'Local Tech Startup Secures $5M Investment, Plans to Double Workforce',
    category: 'BUSINESS',
    categoryType: 'Economy & Business News',
    image:
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Tech District',
    readTime: '3 min'
  },
  {
    id: 3,
    title:
    'Historic Preservation Committee Approves Restoration of Century-Old Building',
    category: 'HISTORY',
    categoryType: 'Life',
    image:
    'https://images.unsplash.com/photo-1493397212122-2b85dda8106b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Old Town',
    readTime: '5 min'
  }];

  // Filter articles based on selected category
  const articles = category ?
  allArticles.filter((article) => article.categoryType === category) :
  allArticles;
  return (
    <div className="space-y-4">
      {articles.length > 0 ?
      articles.map((article) =>
      <div
        key={article.id}
        className="bg-white rounded-md overflow-hidden shadow-sm border border-gray-200 flex hover:shadow-md transition-shadow cursor-pointer"
        onClick={onArticleClick}>

            <div className="w-1/3">
              <div className="relative h-full">
                <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover" />

                <div className="absolute top-2 left-2">
                  <span className="inline-block bg-white text-xs font-medium text-news-primary px-2 py-0.5 rounded-sm border border-gray-200">
                    {article.category}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-2/3 p-3">
              <h3 className="font-display font-bold text-md mb-2 line-clamp-2 text-news-primary">
                {article.title}
              </h3>
              <div className="flex items-center text-xs text-text-tertiary mb-2">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{article.location}</span>
                <span className="mx-2">•</span>
                <Clock className="h-3 w-3 mr-1" />
                <span>{article.readTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-600">
                      RP
                    </span>
                  </div>
                  <span className="ml-1 text-xs text-gray-600">
                    <span className="font-medium">Rachel Patel</span>
                  </span>
                </div>
                <button className="p-1 rounded-full hover:bg-gray-100">
                  <Bookmark className="h-3 w-3 text-news-primary" />
                </button>
              </div>
            </div>
          </div>
      ) :

      <div className="text-center py-8 bg-white rounded-md border border-gray-200">
          <p className="text-gray-500">No featured stories in this category.</p>
          <p className="text-sm text-gray-400 mt-1">
            Check back later for updates.
          </p>
        </div>
      }
    </div>);

};