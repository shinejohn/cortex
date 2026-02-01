import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CheckCircle,
  Calendar,
  Users,
  Clock,
  ArrowRight,
  Printer,
  Download,
  Mail,
  ExternalLink } from
'lucide-react';
export const ConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    formData,
    selectedCommunities,
    duration,
    startDate,
    endDate,
    totalPrice,
    orderId,
    paymentMethod,
    isRerun
  } = location.state || {};
  useEffect(() => {
    // If no data was passed, redirect back
    if (!formData || !selectedCommunities) {
      navigate('/postListing');
      return;
    }
  }, [formData, selectedCommunities, navigate]);
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const formatCurrency = (amount) => {
    return amount?.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  const handleViewAd = () => {
    navigate('/classifieds', {
      state: {
        listingCreated: true
      }
    });
  };
  const handleViewProfile = () => {
    navigate('/profile');
  };
  const handleRunAgain = () => {
    navigate('/classifieds/rerun', {
      state: {
        adId: orderId,
        formData,
        selectedCommunities
      }
    });
  };
  const handlePrintReceipt = () => {
    window.print();
  };
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Payment Successful!
            </h1>
            <p className="text-gray-600">
              Your classified ad has been successfully published.
            </p>
          </div>
          {/* Order details */}
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Order Details
              </h2>
              <span className="text-sm text-gray-500">Order #{orderId}</span>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Ad Title
                  </h3>
                  <p className="text-gray-900">{formData?.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Payment Method
                  </h3>
                  <p className="text-gray-900">
                    {paymentMethod === 'creditCard' ? 'Credit Card' : 'PayPal'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Communities
                  </h3>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-1" />
                    <p className="text-gray-900">
                      {selectedCommunities.length} selected
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Duration
                  </h3>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-1" />
                    <p className="text-gray-900">
                      {duration} month{duration > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    Total Paid
                  </h3>
                  <p className="text-news-primary font-medium">
                    {formatCurrency(totalPrice)}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Ad Run Period
                </h3>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                  <p className="text-gray-900">
                    {formatDate(startDate)} to {formatDate(endDate)}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Selected Communities
                </h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedCommunities.map((community) =>
                  <div
                    key={community.id}
                    className="bg-gray-100 rounded-full px-3 py-1 text-sm text-gray-800">

                      {community.name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Receipt actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              className="flex items-center text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md px-4 py-2 text-sm"
              onClick={handlePrintReceipt}
              aria-label="Print receipt">

              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </button>
            <button
              className="flex items-center text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md px-4 py-2 text-sm"
              aria-label="Download receipt as PDF">

              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </button>
            <button
              className="flex items-center text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md px-4 py-2 text-sm"
              aria-label="Email receipt">

              <Mail className="h-4 w-4 mr-2" />
              Email Receipt
            </button>
          </div>
          {/* What's next */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="font-medium text-blue-800 mb-2">What's Next?</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Your ad is now live in the selected communities</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>
                  You can view and manage your ad from your profile page
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>
                  You'll receive email notifications when users contact you
                  about your ad
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>
                  Your ad will automatically expire on {formatDate(endDate)}
                </span>
              </li>
            </ul>
          </div>
          {/* Action buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleViewAd}
              className="flex items-center justify-center bg-news-primary text-white rounded-md px-4 py-3 hover:bg-news-primary-dark"
              aria-label="View your ad">

              View Your Ad
              <ExternalLink className="ml-2 h-4 w-4" />
            </button>
            <button
              onClick={handleViewProfile}
              className="flex items-center justify-center border border-gray-300 text-gray-700 rounded-md px-4 py-3 hover:bg-gray-50"
              aria-label="Go to your profile">

              Go to Your Profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            <button
              onClick={handleRunAgain}
              className="flex items-center justify-center border border-gray-300 text-gray-700 rounded-md px-4 py-3 hover:bg-gray-50"
              aria-label="Run this ad again">

              Run Ad Again
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>);

};