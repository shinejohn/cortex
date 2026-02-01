import React from 'react';
import { ArrowUp, List, MessageSquare } from 'lucide-react';
export const ArticleNavigation = ({ commentCount }) => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  const scrollToComments = () => {
    document.getElementById('comments').scrollIntoView({
      behavior: 'smooth'
    });
  };
  return (
    <div className="sticky top-32">
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-3">In This Article</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <a href="#" className="text-news-primary hover:underline">
              Property Tax Rate Remains Stable
            </a>
          </li>
          <li>
            <a href="#" className="text-news-primary hover:underline">
              Infrastructure Investment Takes Priority
            </a>
          </li>
          <li>
            <a href="#" className="text-news-primary hover:underline">
              Community Response
            </a>
          </li>
          <li>
            <a href="#" className="text-news-primary hover:underline">
              Looking Ahead
            </a>
          </li>
        </ul>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Related Stories</h3>
        <ul className="space-y-3 text-sm">
          <li>
            <a href="#" className="text-news-primary hover:underline">
              Pinellas County Property Values Increase by 8.2%
            </a>
          </li>
          <li>
            <a href="#" className="text-news-primary hover:underline">
              Clearwater Launches New Infrastructure Dashboard
            </a>
          </li>
          <li>
            <a href="#" className="text-news-primary hover:underline">
              City Council Elections: Meet the Candidates
            </a>
          </li>
        </ul>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-medium text-gray-900 mb-3">Quick Jump</h3>
        <div className="space-y-2">
          <button
            onClick={scrollToTop}
            className="w-full flex items-center justify-between text-sm p-2 rounded hover:bg-gray-100">

            <span className="flex items-center">
              <ArrowUp className="h-4 w-4 mr-2" />
              Top of Article
            </span>
          </button>
          <button className="w-full flex items-center justify-between text-sm p-2 rounded hover:bg-gray-100">
            <span className="flex items-center">
              <List className="h-4 w-4 mr-2" />
              Key Points
            </span>
          </button>
          <button
            onClick={scrollToComments}
            className="w-full flex items-center justify-between text-sm p-2 rounded hover:bg-gray-100">

            <span className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Comments
            </span>
            <span className="bg-gray-200 text-gray-800 rounded-full px-2 py-0.5 text-xs">
              {commentCount}
            </span>
          </button>
        </div>
      </div>
    </div>);

};