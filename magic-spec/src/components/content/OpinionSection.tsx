import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
export const OpinionSection = ({ onArticleClick }) => {
  const navigate = useNavigate();
  const handleViewAllOpinions = () => {
    navigate('/trending?category=opinion');
  };
  return (
    <div className="space-y-4">
      <div
        className="bg-white rounded-md overflow-hidden shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
        onClick={onArticleClick}>

        <div className="p-3">
          <div className="text-xs text-gray-500 mb-1">EDITORIAL</div>
          <h3 className="font-medium text-gray-900 text-sm">
            The Future of Downtown Clearwater Development
          </h3>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            Our editorial board examines the pros and cons of the proposed
            downtown revitalization plan.
          </p>
        </div>
      </div>
      <div
        className="bg-white rounded-md overflow-hidden shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
        onClick={onArticleClick}>

        <div className="p-3">
          <div className="text-xs text-gray-500 mb-1">COLUMNIST</div>
          <h3 className="font-medium text-gray-900 text-sm">
            Why Beach Parking Should Be Free for Residents
          </h3>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            Local columnist Jane Smith argues for resident parking passes at
            Clearwater Beach.
          </p>
        </div>
      </div>
      <div
        className="bg-white rounded-md overflow-hidden shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
        onClick={onArticleClick}>

        <div className="p-3">
          <div className="text-xs text-gray-500 mb-1">LETTERS</div>
          <h3 className="font-medium text-gray-900 text-sm">
            Readers Respond: School Start Times
          </h3>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            Local parents and teachers share their thoughts on the proposed
            changes to school schedules.
          </p>
        </div>
      </div>
      <div className="text-center pt-2">
        <button
          className="inline-flex items-center px-4 py-2 bg-news-primary text-white rounded-md text-sm font-medium hover:bg-news-primary-dark transition-colors"
          onClick={handleViewAllOpinions}>

          View All Opinions
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>);

};