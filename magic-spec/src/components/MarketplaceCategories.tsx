import React from 'react';
import { Wrench, ShoppingBag, Briefcase, FileText, Home } from 'lucide-react';
export const MarketplaceCategories = ({
  selectedCategory,
  onCategorySelect
}) => {
  const categories = [
  {
    id: 'all',
    title: 'All Categories',
    icon: <ShoppingBag className="h-6 w-6" />
  },
  {
    id: 'services',
    title: 'Services',
    icon: <Wrench className="h-6 w-6" />
  },
  {
    id: 'products',
    title: 'Products for sale',
    icon: <ShoppingBag className="h-6 w-6" />
  },
  {
    id: 'jobs',
    title: 'Job offers',
    icon: <Briefcase className="h-6 w-6" />
  },
  {
    id: 'classifieds',
    title: 'General Classifieds',
    icon: <FileText className="h-6 w-6" />
  },
  {
    id: 'rentals',
    title: 'Rentals',
    icon: <Home className="h-6 w-6" />
  }];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
      {categories.map((category) =>
      <CategoryCard
        key={category.id}
        icon={category.icon}
        title={category.title}
        isSelected={selectedCategory === category.id}
        onClick={() => onCategorySelect(category.id)} />

      )}
    </div>);

};
const CategoryCard = ({ icon, title, isSelected, onClick }) => {
  return (
    <div
      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border ${isSelected ? 'border-news-primary bg-news-primary bg-opacity-10' : 'border-gray-200 bg-white'} p-4 shadow-sm transition hover:shadow-md`}
      onClick={onClick}>

      <div
        className={`mb-2 ${isSelected ? 'text-news-primary' : 'text-gray-600'}`}>

        {icon}
      </div>
      <div
        className={`text-center text-sm font-medium ${isSelected ? 'text-news-primary' : 'text-gray-800'}`}>

        {title}
      </div>
    </div>);

};