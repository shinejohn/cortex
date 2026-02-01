import React from 'react';
export const CategoryGrid = ({ selectedCategory, setSelectedCategory }) => {
  const categories = [
  {
    id: 'Food',
    name: 'Food',
    icon: '🍔'
  },
  {
    id: 'Shopping',
    name: 'Shopping',
    icon: '🛒'
  },
  {
    id: 'Health',
    name: 'Health',
    icon: '🏥'
  },
  {
    id: 'Home Services',
    name: 'Home Services',
    icon: '🏠'
  },
  {
    id: 'Auto',
    name: 'Auto',
    icon: '🚗'
  },
  {
    id: 'Finance',
    name: 'Finance',
    icon: '💰'
  },
  {
    id: 'Fashion',
    name: 'Fashion',
    icon: '👗'
  },
  {
    id: 'Arts',
    name: 'Arts',
    icon: '🎨'
  }];

  const handleCategoryClick = (categoryId) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null); // Deselect if already selected
    } else {
      setSelectedCategory(categoryId);
    }
  };
  return (
    <div className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-4">
      {categories.map((category) =>
      <button
        key={category.id}
        onClick={() => handleCategoryClick(category.id)}
        className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all ${selectedCategory === category.id ? 'bg-news-primary text-white shadow-md' : 'bg-white text-gray-700 border border-gray-200 hover:border-news-primary hover:shadow-sm'}`}>

          <span className="text-2xl mb-1">{category.icon}</span>
          <span className="text-xs font-medium">{category.name}</span>
        </button>
      )}
    </div>);

};