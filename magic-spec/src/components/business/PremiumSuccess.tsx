import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Crown, ArrowRight } from 'lucide-react';
const PremiumSuccess = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Premium!
            </h1>
            <p className="text-gray-600">
              Your premium business listing is now active and ready to attract
              more customers.
            </p>
          </div>
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-6 text-white mb-6">
            <div className="flex items-center justify-center mb-3">
              <Crown className="w-6 h-6 mr-2" />
              <span className="font-semibold">Premium Business Listing</span>
            </div>
            <p className="text-yellow-100 text-sm">
              Your business now appears at the top of search results with
              enhanced features
            </p>
          </div>
          <div className="space-y-4 mb-8">
            <div className="text-left">
              <h3 className="font-medium text-gray-900 mb-2">
                What happens next?
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Your business listing is now live with premium features
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  You can upload up to 10 photos and manage your listing
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Access your analytics dashboard to track performance
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Start receiving customer inquiries and reviews
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/business-dashboard')}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">

              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">

              Back to Home
            </button>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
            <p>
              Questions? Contact our support team at{' '}
              <a
                href="mailto:support@example.com"
                className="text-blue-600 hover:underline">

                support@example.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>);

};
export default PremiumSuccess;