import React from 'react';
import { ShoppingBag, Home, Briefcase, Wrench, Users } from 'lucide-react';
export const CategoryBrowser = ({ selectedCategory, setSelectedCategory }) => {
  const categories = [
  {
    id: 'all',
    name: 'All Listings',
    icon: <ShoppingBag className="h-6 w-6" />,
    count: 1248,
    color: 'bg-gray-100 text-gray-700',
    activeColor: 'bg-gray-700 text-white'
  },
  {
    id: 'forSale',
    name: 'For Sale',
    icon: <ShoppingBag className="h-6 w-6" />,
    count: 743,
    color: 'bg-blue-100 text-blue-700',
    activeColor: 'bg-blue-600 text-white'
  },
  {
    id: 'housing',
    name: 'Housing',
    icon: <Home className="h-6 w-6" />,
    count: 156,
    color: 'bg-green-100 text-green-700',
    activeColor: 'bg-green-600 text-white'
  },
  {
    id: 'jobs',
    name: 'Jobs',
    icon: <Briefcase className="h-6 w-6" />,
    count: 89,
    color: 'bg-purple-100 text-purple-700',
    activeColor: 'bg-purple-600 text-white'
  },
  {
    id: 'services',
    name: 'Services',
    icon: <Wrench className="h-6 w-6" />,
    count: 172,
    color: 'bg-orange-100 text-orange-700',
    activeColor: 'bg-orange-600 text-white'
  },
  {
    id: 'community',
    name: 'Community',
    icon: <Users className="h-6 w-6" />,
    count: 88,
    color: 'bg-pink-100 text-pink-700',
    activeColor: 'bg-pink-600 text-white'
  }];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
      {categories.map((category) =>
      <button
        key={category.id}
        onClick={() => setSelectedCategory(category.id)}
        className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${selectedCategory === category.id ? `${category.activeColor} border-transparent shadow-md` : `${category.color} border-gray-200 hover:shadow-sm`}`}>

          <div className="mb-2">{category.icon}</div>
          <div className="font-medium text-sm mb-1">{category.name}</div>
          <div
          className={`text-xs ${selectedCategory === category.id ? 'text-white text-opacity-80' : 'text-gray-500'}`}>

            {category.count} listings
          </div>
        </button>
      )}
    </div>);

};