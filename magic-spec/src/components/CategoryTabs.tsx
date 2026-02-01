import React from 'react';
export const CategoryTabs = ({
  activeCategory,
  onCategorySelect,
  showAllCategories,
  toggleAllCategories
}) => {
  // Main categories that are always visible
  const mainCategories = [
  'Economy & Business News',
  'Crime & Public Safety',
  'Sports',
  'Weather & Environment'];

  // Additional categories shown when "See all categories" is clicked
  const additionalCategories = [
  'Politics',
  'Education',
  'Health',
  'Technology',
  'Arts & Entertainment',
  'Real Estate',
  'Opinion',
  'Food & Dining'];

  // All categories to display when "See all categories" is toggled
  const allCategories = showAllCategories ?
  [...mainCategories, ...additionalCategories] :
  mainCategories;
  return (
    <div className="py-2">
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
        <div className="flex items-center">
          <button
            onClick={toggleAllCategories}
            className="text-xs text-blue-600 mr-4 hover:underline">

            {showAllCategories ? 'Show less categories' : 'See all categories'}
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
      </div>
    </div>);

};
// Helper component to render category icons
const CategoryIcon = ({ category }) => {
  switch (category) {
    case 'Economy & Business News':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor">

          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h6v4H7V5zm8 8v-4H5v4h10z"
            clipRule="evenodd" />

        </svg>);

    case 'Crime & Public Safety':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor">

          <path
            fillRule="evenodd"
            d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z"
            clipRule="evenodd" />

        </svg>);

    case 'Sports':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor">

          <path
            fillRule="evenodd"
            d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
            clipRule="evenodd" />

        </svg>);

    case 'Weather & Environment':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor">

          <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
        </svg>);

    case 'Politics':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor">

          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
            clipRule="evenodd" />

        </svg>);

    case 'Education':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor">

          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>);

    default:
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor">

          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
            clipRule="evenodd" />

        </svg>);

  }
};