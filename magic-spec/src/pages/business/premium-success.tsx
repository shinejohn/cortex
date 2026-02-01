import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Building, ChevronLeft } from 'lucide-react';
const PremiumSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { businessName, subscriptionDate } = location.state || {};
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const nextBillingDate = () => {
    if (!subscriptionDate) return 'Unknown date';
    const date = new Date(subscriptionDate);
    date.setMonth(date.getMonth() + 1);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/business-dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6">

          <ChevronLeft className="w-5 h-5 mr-1" />
          Go to Business Dashboard
        </button>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Premium Subscription Activated!
            </h1>
            <p className="text-gray-600">
              Thank you for subscribing to our Premium Business Listing service.
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-blue-600" />
              Subscription Details
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Business Name:</span>
                <span className="font-medium">
                  {businessName || 'Your Business'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subscription Plan:</span>
                <span className="font-medium">Premium Business Listing</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Fee:</span>
                <span className="font-medium">$20.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subscription Date:</span>
                <span className="font-medium">
                  {formatDate(subscriptionDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Next Billing Date:</span>
                <span className="font-medium">{nextBillingDate()}</span>
              </div>
            </div>
          </div>
          <div className="space-y-4 mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              What's Next?
            </h2>
            <div className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 font-bold mr-3">
                1
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Complete your business profile
                </h3>
                <p className="text-sm text-gray-600">
                  Add more photos, special offers, and detailed information to
                  make your listing stand out.
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 font-bold mr-3">
                2
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Check your analytics
                </h3>
                <p className="text-sm text-gray-600">
                  Monitor how many people view your business listing and track
                  engagement metrics.
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 font-bold mr-3">
                3
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Create special offers
                </h3>
                <p className="text-sm text-gray-600">
                  Attract more customers by creating special offers that will be
                  highlighted in your listing.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <Link
              to="/business-dashboard"
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">

              Go to Business Dashboard
              <ArrowRight className="ml-1.5 w-4 h-4" />
            </Link>
            <Link
              to="/business/1"
              className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">

              View Your Business Listing
            </Link>
          </div>
        </div>
      </div>
    </div>);

};
export default PremiumSuccess;