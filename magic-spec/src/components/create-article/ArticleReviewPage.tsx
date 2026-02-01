import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
const ArticleReviewPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Article Review</h1>
            <button
              onClick={() => navigate('/create-article')}
              className="flex items-center text-gray-600 hover:text-gray-900">

              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </button>
          </div>
          <div className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Article Under Review
            </h2>
            <p className="text-gray-600 mb-6">
              Your article has been submitted for review and will be published
              once approved.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/create-article')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">

                Create New Article
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">

                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>);

};
export default ArticleReviewPage;