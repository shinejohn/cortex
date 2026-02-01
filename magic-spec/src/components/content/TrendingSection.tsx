import React from 'react';
import { Clock, MapPin, Bookmark, TrendingUp } from 'lucide-react';
export const TrendingSection = ({
  category = null,
  onArticleClick,
  isNational = false
}) => {
  const allLocalTrendingArticles = [
  {
    id: 1,
    title: 'New Waterfront Park Project Approved by City Council',
    category: 'GOVERNMENT',
    categoryType: 'Government',
    image:
    'https://images.unsplash.com/photo-1534237710431-e2fc698436d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Clearwater Beach',
    readTime: '3 min',
    views: 1243
  },
  {
    id: 2,
    title: 'Local Restaurant Named in "Top 50 Places to Eat" National List',
    category: 'BUSINESS',
    categoryType: 'Economy & Business News',
    image:
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Downtown',
    readTime: '2 min',
    views: 982
  },
  {
    id: 3,
    title: 'Hurricane Preparedness: What Residents Need to Know',
    category: 'WEATHER',
    categoryType: 'Weather & Environment',
    image:
    'https://images.unsplash.com/photo-1504624720567-64a41aa25d70?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Countywide',
    readTime: '4 min',
    views: 876
  },
  {
    id: 4,
    title: 'Police Arrest Suspect in String of Vehicle Break-ins',
    category: 'SAFETY',
    categoryType: 'Crime & Public Safety',
    image:
    'https://images.unsplash.com/photo-1603899968034-60a1ae6e9994?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'North District',
    readTime: '3 min',
    views: 754
  },
  {
    id: 5,
    title:
    'High School Quarterback Receives Full Scholarship to Florida State',
    category: 'SPORTS',
    categoryType: 'Sports',
    image:
    'https://images.unsplash.com/photo-1587329310686-91414b8e3cb7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Clearwater High',
    readTime: '3 min',
    views: 689
  }];

  const allNationalTrendingArticles = [
  {
    id: 1,
    title: 'Congress Passes Historic Climate Legislation',
    category: 'POLITICS',
    categoryType: 'Politics',
    image:
    'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Washington, D.C.',
    readTime: '5 min',
    views: 8721
  },
  {
    id: 2,
    title: 'Federal Reserve Signals Potential Interest Rate Cut',
    category: 'ECONOMY',
    categoryType: 'Economy',
    image:
    'https://images.unsplash.com/photo-1611324806098-b3b1af4e9f2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'New York',
    readTime: '4 min',
    views: 7439
  },
  {
    id: 3,
    title: 'Tech Giants Announce Collaboration on AI Safety Standards',
    category: 'TECHNOLOGY',
    categoryType: 'Technology',
    image:
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Silicon Valley',
    readTime: '3 min',
    views: 6253
  },
  {
    id: 4,
    title: 'Breakthrough Cancer Treatment Shows Promising Results in Trials',
    category: 'HEALTH',
    categoryType: 'Health',
    image:
    'https://images.unsplash.com/photo-1579165466741-7f35e4755183?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Boston',
    readTime: '6 min',
    views: 5892
  },
  {
    id: 5,
    title: 'Scientists Report Alarming Rate of Arctic Ice Melt',
    category: 'ENVIRONMENT',
    categoryType: 'Environment',
    image:
    'https://images.unsplash.com/photo-1582550740000-be10b6492eb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Arctic Circle',
    readTime: '4 min',
    views: 4987
  }];

  // Select the appropriate trending articles based on isNational flag
  const allTrendingArticles = isNational ?
  allNationalTrendingArticles :
  allLocalTrendingArticles;
  // Filter articles based on selected category
  const trendingArticles = category ?
  allTrendingArticles.filter((article) => article.categoryType === category) :
  allTrendingArticles.slice(0, 3);
  return (
    <div className="space-y-4">
      {trendingArticles.length > 0 ?
      trendingArticles.map((article) =>
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
                  <span className="inline-flex items-center bg-white text-xs font-medium text-news-primary px-2 py-0.5 rounded-sm border border-gray-200">
                    <TrendingUp className="h-3 w-3 mr-1 text-red-500" />
                    {article.views}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-2/3 p-3">
              <div className="inline-block bg-red-100 text-xs font-medium text-red-600 px-2 py-0.5 rounded-sm mb-1">
                {article.category}
              </div>
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
                      {isNational ? 'NR' : 'AM'}
                    </span>
                  </div>
                  <span className="ml-1 text-xs text-gray-600">
                    <span className="font-medium">
                      {isNational ? 'National Reporter' : 'Alex Morgan'}
                    </span>
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
          <p className="text-gray-500">
            No trending articles in this category.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Check back later for updates.
          </p>
        </div>
      }
    </div>);

};