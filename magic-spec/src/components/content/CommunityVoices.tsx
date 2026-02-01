import React from 'react';
import { MapPin, Clock, Bookmark } from 'lucide-react';
export const CommunityVoices = ({ category = null, onArticleClick }) => {
  const allArticles = [
  {
    id: 1,
    title: "Why Our City's Parks Need More Investment",
    category: 'OPINION',
    categoryType: 'Opinion',
    author: 'James Wilson',
    authorRole: 'Resident',
    image:
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Downtown',
    readTime: '4 min'
  },
  {
    id: 2,
    title: 'Local Business Owner: "Shop Local" Movement Changed My Life',
    category: 'BUSINESS',
    categoryType: 'Economy & Business News',
    author: 'Maria Sanchez',
    authorRole: 'Business Owner',
    image:
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Downtown',
    readTime: '3 min'
  },
  {
    id: 3,
    title: 'How Our School System Can Better Prepare Students for the Future',
    category: 'EDUCATION',
    categoryType: 'Education',
    author: 'Dr. Robert Chen',
    authorRole: 'Educator',
    image:
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    location: 'Clearwater High',
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
        className="bg-white rounded-md overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        onClick={onArticleClick}>

            <div className="p-4">
              <div className="inline-block bg-orange-100 text-xs font-medium text-orange-600 px-2 py-0.5 rounded-sm mb-2">
                {article.category}
              </div>
              <h3 className="font-display font-bold text-md mb-2 text-news-primary">
                {article.title}
              </h3>
              <div className="flex items-center text-xs text-text-tertiary mb-3">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{article.location}</span>
                <span className="mx-2">•</span>
                <Clock className="h-3 w-3 mr-1" />
                <span>{article.readTime}</span>
              </div>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                  <span className="text-xs font-medium text-gray-600">
                    {article.author.
                split(' ').
                map((n) => n[0]).
                join('')}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {article.author}
                  </div>
                  <div className="text-xs text-gray-500">
                    {article.authorRole}
                  </div>
                </div>
                <button className="p-1 rounded-full hover:bg-gray-100 ml-auto">
                  <Bookmark className="h-4 w-4 text-news-primary" />
                </button>
              </div>
            </div>
          </div>
      ) :

      <div className="text-center py-8 bg-white rounded-md border border-gray-200">
          <p className="text-gray-500">No community voices in this category.</p>
          <p className="text-sm text-gray-400 mt-1">
            Check back later for updates.
          </p>
        </div>
      }
    </div>);

};