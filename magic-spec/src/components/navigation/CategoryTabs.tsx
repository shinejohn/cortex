import React from 'react';
interface CategoryTabsProps {
  activeCategory: string | null;
  onCategorySelect: (category: string) => void;
  showAllCategories?: boolean;
  toggleAllCategories?: () => void;
  categories?: string[];
  additionalCategories?: string[];
  className?: string;
}
export const CategoryTabs = ({
  activeCategory,
  onCategorySelect,
  showAllCategories = false,
  toggleAllCategories,
  categories = [
  'Economy & Business News',
  'Crime & Public Safety',
  'Sports',
  'Weather & Environment'],

  additionalCategories = [
  'Politics',
  'Education',
  'Health',
  'Technology',
  'Arts & Entertainment',
  'Real Estate',
  'Opinion',
  'Food & Dining'],

  className = ''
}: CategoryTabsProps) => {
  // All categories to display based on toggle state
  const allCategories = showAllCategories ?
  [...categories, ...additionalCategories] :
  categories;
  return (
    <div className={`py-2 ${className}`}>
      <div className="flex flex-wrap justify-between border-b border-gray-200 pb-2">
        <div className="flex flex-wrap">
          {allCategories.map((category) =>
          <div
            key={category}
            onClick={() => onCategorySelect(category)}
            className={`mr-6 flex cursor-pointer items-center pb-2 text-sm 
                ${activeCategory === category ? 'text-news-primary font-medium border-b-2 border-news-primary' : 'text-gray-600 hover:text-blue-600'}`}>

              <CategoryIcon category={category} />
              <span>{category}</span>
            </div>
          )}
        </div>
        {toggleAllCategories &&
        <div className="flex items-center">
            <button
            onClick={toggleAllCategories}
            className="text-xs text-blue-600 mr-4 hover:underline">

              {showAllCategories ?
            'Show less categories' :
            'See all categories'}
            </button>
            <div className="flex items-center">
              <span className="text-xs font-medium mr-2">Local</span>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                type="checkbox"
                name="toggle"
                id="toggle"
                defaultChecked
                className="sr-only" />

                <div className="w-10 h-5 bg-gray-300 rounded-full shadow-inner"></div>
                <div className="absolute w-5 h-5 bg-white rounded-full shadow inset-y-0 left-0 transition-transform transform translate-x-full"></div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>);

};
// Helper component to render category icons
const CategoryIcon = ({ category }: {category: string;}) => {
  // This is a simplified version - in a real app, you'd want to use proper icons
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 mr-1"
      viewBox="0 0 20 20"
      fill="currentColor">

      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
        clipRule="evenodd" />

    </svg>);

};