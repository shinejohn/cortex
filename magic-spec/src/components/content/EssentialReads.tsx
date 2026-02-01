import React from 'react';
import { Clock, MapPin, Bookmark } from 'lucide-react';
export const EssentialReads = ({ category = null, onArticleClick }) => {
  const allArticles = [
  {
    id: 1,
    title: 'City Council Approves New Budget with Focus on Infrastructure',
    category: 'GOVERNMENT',
    categoryType: 'Government',
    image:
    'https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'City Hall',
    readTime: '4 min',
    aiGenerated: false
  },
  {
    id: 2,
    title: 'Local Business Spotlight: Seaside Bakery Celebrates 25 Years',
    category: 'BUSINESS',
    categoryType: 'Economy & Business News',
    image:
    'https://images.unsplash.com/photo-1517433367423-c7e5b0f35086?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Downtown',
    readTime: '3 min',
    aiGenerated: false
  },
  {
    id: 3,
    title: 'School District Announces New STEM Program for Fall Semester',
    category: 'EDUCATION',
    categoryType: 'Education',
    image:
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Clearwater High',
    readTime: '5 min',
    aiGenerated: true
  },
  {
    id: 4,
    title: 'Local Crime Rate Drops by 15% According to New Police Report',
    category: 'SAFETY',
    categoryType: 'Crime & Public Safety',
    image:
    'https://images.unsplash.com/photo-1453873623425-04e3561289aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Police HQ',
    readTime: '3 min',
    aiGenerated: false
  },
  {
    id: 5,
    title: 'High School Football Team Advances to State Championship',
    category: 'SPORTS',
    categoryType: 'Sports',
    image:
    'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Memorial Stadium',
    readTime: '4 min',
    aiGenerated: false
  },
  {
    id: 6,
    title: 'Tropical Storm Warning Issued for Coastal Areas This Weekend',
    category: 'WEATHER',
    categoryType: 'Weather & Environment',
    image:
    'https://images.unsplash.com/photo-1514632595-4944383f2737?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Coastal Region',
    readTime: '2 min',
    aiGenerated: true
  }];

  // Filter articles based on selected category
  const articles = category ?
  allArticles.filter((article) => article.categoryType === category) :
  allArticles.slice(0, 3);
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
                      JD
                    </span>
                  </div>
                  <span className="ml-1 text-xs text-gray-600">
                    <span className="font-medium">John Doe</span>
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
          <p className="text-gray-500">No articles found in this category.</p>
          <p className="text-sm text-gray-400 mt-1">
            Check back later for updates.
          </p>
        </div>
      }
    </div>);

};