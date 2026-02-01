import React from 'react';
import {
  Clock,
  Calendar,
  Building,
  CloudLightning,
  Award,
  BookOpen,
  MapPin,
  ArrowRight } from
'lucide-react';
export const CollectionThemes = ({
  activeCollection,
  onCollectionSelect,
  sepiaMode
}) => {
  // Featured collection data
  const featuredCollections = [
  {
    id: 'thisDay',
    title: 'This Day in History',
    description:
    'Explore events that happened on this day throughout history',
    icon: <Clock className="h-5 w-5" />,
    color: sepiaMode ?
    'bg-amber-200 text-amber-800' :
    'bg-blue-100 text-blue-700',
    featured: true
  },
  {
    id: 'yearReview1950',
    title: '1950: Year in Review',
    description: "Looking back at a pivotal year in our community's history",
    icon: <Calendar className="h-5 w-5" />,
    color: sepiaMode ?
    'bg-amber-200 text-amber-800' :
    'bg-green-100 text-green-700'
  },
  {
    id: 'downtown',
    title: 'Downtown Development',
    description: 'The evolution of our city center over the decades',
    icon: <Building className="h-5 w-5" />,
    color: sepiaMode ?
    'bg-amber-200 text-amber-800' :
    'bg-purple-100 text-purple-700'
  },
  {
    id: 'hurricane',
    title: 'Hurricane History',
    description: 'Major storms that have shaped our community',
    icon: <CloudLightning className="h-5 w-5" />,
    color: sepiaMode ?
    'bg-amber-200 text-amber-800' :
    'bg-red-100 text-red-700'
  }];

  // Anniversary collections
  const anniversaryCollections = [
  {
    id: 'centennial',
    title: 'City Centennial',
    year: '1925-2025',
    description: '100 years of Clearwater history',
    icon: <Award className="h-5 w-5" />
  },
  {
    id: 'newspaper75',
    title: 'Newspaper 75th Anniversary',
    year: '1925-2000',
    description: '75 years of local journalism',
    icon: <BookOpen className="h-5 w-5" />
  },
  {
    id: 'bridge50',
    title: 'Causeway 50th Anniversary',
    year: '1963-2013',
    description: 'Connecting our community for 50 years',
    icon: <MapPin className="h-5 w-5" />
  }];

  return (
    <div
      className={`rounded-lg shadow-md p-4 ${sepiaMode ? 'bg-amber-100 border border-amber-200' : 'bg-white border border-gray-200'}`}>

      <h3 className="font-bold text-gray-900 mb-4">Collection Themes</h3>
      {/* Featured Collections */}
      <div className="space-y-3 mb-4">
        {featuredCollections.map((collection) =>
        <button
          key={collection.id}
          onClick={() => onCollectionSelect(collection.id)}
          className={`w-full flex items-center p-3 rounded-md transition-colors ${activeCollection === collection.id ? collection.color : sepiaMode ? 'bg-amber-50 hover:bg-amber-100' : 'bg-gray-50 hover:bg-gray-100'}`}>

            <div
            className={`p-2 rounded-full mr-3 ${sepiaMode ? 'bg-amber-200 text-amber-800' : activeCollection === collection.id ? 'bg-white bg-opacity-30' : 'bg-gray-200 text-gray-700'}`}>

              {collection.icon}
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">
                {collection.title}
              </div>
              <div className="text-xs text-gray-600">
                {collection.description}
              </div>
            </div>
          </button>
        )}
      </div>
      {/* Anniversary Collections */}
      <div className="pt-3 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Anniversary Collections
        </h4>
        <div className="space-y-2">
          {anniversaryCollections.map((collection) =>
          <button
            key={collection.id}
            onClick={() => onCollectionSelect(collection.id)}
            className={`w-full flex items-center p-2 rounded-md text-sm ${activeCollection === collection.id ? sepiaMode ? 'bg-amber-200' : 'bg-blue-50' : sepiaMode ? 'hover:bg-amber-50' : 'hover:bg-gray-50'}`}>

              <div
              className={`p-1 rounded-full mr-2 ${sepiaMode ? 'bg-amber-200 text-amber-800' : 'bg-gray-200 text-gray-700'}`}>

                {collection.icon}
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-900">
                  {collection.title}
                </div>
                <div className="text-xs text-gray-600">{collection.year}</div>
              </div>
            </button>
          )}
        </div>
      </div>
      {/* View All Collections */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <button
          className={`w-full flex items-center justify-center p-2 text-sm font-medium rounded-md ${sepiaMode ? 'text-amber-800 hover:bg-amber-200' : 'text-news-primary hover:bg-gray-100'}`}>

          <span>View All Collections</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>);

};