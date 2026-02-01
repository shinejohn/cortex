import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Users,
  Star,
  DollarSign,
  Calendar,
  Edit,
  Settings,
  Bell,
  Plus,
  CreditCard,
  Clock,
  Tag,
  ExternalLink,
  Eye,
  MessageSquare,
  Phone,
  Mail } from
'lucide-react';
const BusinessDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  // Mock data for a business owner
  const businessData = {
    name: 'Urban Bites Café',
    isPremium: true,
    subscriptionRenewal: '2023-12-15',
    stats: {
      views: 1243,
      leads: 56,
      reviews: 28,
      averageRating: 4.7
    },
    recentReviews: [
    {
      id: 1,
      author: 'Sarah J.',
      rating: 5,
      date: '2023-11-10',
      content:
      'Absolutely love this place! The coffee is amazing and the avocado toast is to die for.',
      replied: true
    },
    {
      id: 2,
      author: 'Michael T.',
      rating: 4,
      date: '2023-11-05',
      content:
      'Great little spot for breakfast. The acai bowl was fresh and delicious.',
      replied: false
    }],

    recentLeads: [
    {
      id: 1,
      type: 'Call',
      date: '2023-11-12',
      customer: 'John D.',
      details: 'Inquired about catering options for office event'
    },
    {
      id: 2,
      type: 'Message',
      date: '2023-11-11',
      customer: 'Emily R.',
      details: 'Asked about vegetarian menu options'
    },
    {
      id: 3,
      type: 'Website',
      date: '2023-11-10',
      customer: 'Anonymous',
      details: 'Clicked through to website from directory listing'
    }],

    specialOffers: [
    {
      id: 1,
      title: 'Happy Hour: 50% off espresso drinks',
      description: 'Every weekday from 3-5pm',
      startDate: '2023-11-01',
      endDate: '2023-12-31',
      status: 'active'
    }]

  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const daysUntilRenewal = () => {
    const today = new Date();
    const renewal = new Date(businessData.subscriptionRenewal);
    const diffTime = Math.abs(renewal - today);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="mr-4">
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                  {businessData.name.charAt(0)}
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {businessData.name}
                </h1>
                <div className="flex items-center">
                  {businessData.isPremium &&
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded mr-2">
                      Premium
                    </span>
                  }
                  <span className="text-sm text-gray-500">
                    Renews in {daysUntilRenewal()} days
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link
                to="/business/1"
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">

                <Eye className="h-4 w-4 mr-1" />
                View Listing
              </Link>
              <Link
                to="/business/edit/1"
                className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">

                <Edit className="h-4 w-4 mr-1" />
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>

              Overview
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'analytics' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>

              Analytics
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'reviews' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>

              Reviews
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`py-4 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'leads' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>

              Leads
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`py-4 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'offers' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>

              Special Offers
            </button>
            <button
              onClick={() => setActiveTab('subscription')}
              className={`py-4 px-1 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === 'subscription' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>

              Subscription
            </button>
          </nav>
        </div>
        {/* Overview Tab */}
        {activeTab === 'overview' &&
        <div>
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-md mr-4">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Profile Views
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {businessData.stats.views}
                    </h3>
                    <p className="text-xs text-green-600">
                      +12% from last month
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-md mr-4">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Leads Generated
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {businessData.stats.leads}
                    </h3>
                    <p className="text-xs text-green-600">
                      +5% from last month
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-md mr-4">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Average Rating
                    </p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {businessData.stats.averageRating}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Based on {businessData.stats.reviews} reviews
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-md mr-4">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Subscription
                    </p>
                    <h3 className="text-lg font-bold text-gray-900">Premium</h3>
                    <p className="text-xs text-gray-500">
                      Renews {formatDate(businessData.subscriptionRenewal)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Reviews */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Reviews
                  </h2>
                  <button
                  onClick={() => setActiveTab('reviews')}
                  className="text-sm text-blue-600 hover:text-blue-800">

                    View All
                  </button>
                </div>
                <div className="divide-y divide-gray-200">
                  {businessData.recentReviews.map((review) =>
                <div key={review.id} className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <div className="mr-3 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-medium">
                            {review.author.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {review.author}
                            </h3>
                            <div className="flex items-center">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) =>
                            <Star
                              key={star}
                              className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />

                            )}
                              </div>
                              <span className="ml-2 text-xs text-gray-500">
                                {formatDate(review.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {review.content}
                      </p>
                      {review.replied ?
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Replied
                        </span> :

                  <button className="text-sm text-blue-600 hover:text-blue-800">
                          Reply to Review
                        </button>
                  }
                    </div>
                )}
                </div>
              </div>
              {/* Recent Leads */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Leads
                  </h2>
                  <button
                  onClick={() => setActiveTab('leads')}
                  className="text-sm text-blue-600 hover:text-blue-800">

                    View All
                  </button>
                </div>
                <div className="divide-y divide-gray-200">
                  {businessData.recentLeads.map((lead) =>
                <div key={lead.id} className="p-6">
                      <div className="flex items-start">
                        <div className="mr-4 p-2 rounded-md bg-gray-100">
                          {lead.type === 'Call' &&
                      <Phone className="h-5 w-5 text-blue-600" />
                      }
                          {lead.type === 'Message' &&
                      <MessageSquare className="h-5 w-5 text-green-600" />
                      }
                          {lead.type === 'Website' &&
                      <ExternalLink className="h-5 w-5 text-purple-600" />
                      }
                          {lead.type === 'Email' &&
                      <Mail className="h-5 w-5 text-red-600" />
                      }
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <h3 className="font-medium text-gray-900">
                              {lead.type} from {lead.customer}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {formatDate(lead.date)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {lead.details}
                          </p>
                        </div>
                      </div>
                    </div>
                )}
                </div>
              </div>
            </div>
            {/* Special Offers Section */}
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">
                  Active Special Offers
                </h2>
                <button
                onClick={() => setActiveTab('offers')}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800">

                  <Plus className="h-4 w-4 mr-1" />
                  Create New Offer
                </button>
              </div>
              {businessData.specialOffers.length > 0 ?
            <div className="divide-y divide-gray-200">
                  {businessData.specialOffers.map((offer) =>
              <div key={offer.id} className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {offer.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {offer.description}
                          </p>
                          <div className="flex items-center mt-2">
                            <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">
                              {formatDate(offer.startDate)} -{' '}
                              {formatDate(offer.endDate)}
                            </span>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                    </div>
              )}
                </div> :

            <div className="p-6 text-center">
                  <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No Active Offers
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Create special offers to attract more customers to your
                    business.
                  </p>
                  <button
                onClick={() => setActiveTab('offers')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">

                    <Plus className="h-4 w-4 mr-1" />
                    Create Your First Offer
                  </button>
                </div>
            }
            </div>
          </div>
        }
        {/* Subscription Tab */}
        {activeTab === 'subscription' &&
        <div>
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Subscription Details
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <CreditCard className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Premium Business Listing
                    </h3>
                    <p className="text-gray-600">$20.00 billed monthly</p>
                  </div>
                  <div className="ml-auto">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Next Billing Date
                    </h4>
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="font-medium">
                        {formatDate(businessData.subscriptionRenewal)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Payment Method
                    </h4>
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="font-medium">•••• •••• •••• 4242</span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <Clock className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800 mb-1">
                        Auto-renewal is enabled
                      </h4>
                      <p className="text-sm text-blue-700">
                        Your subscription will automatically renew on{' '}
                        {formatDate(businessData.subscriptionRenewal)}. You can
                        cancel or change your subscription at any time.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <button className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                    Update Payment Method
                  </button>
                  <button className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                    View Billing History
                  </button>
                  <button className="w-full sm:w-auto px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50">
                    Cancel Subscription
                  </button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Premium Benefits
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mr-3">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Priority Placement
                      </h3>
                      <p className="text-sm text-gray-600">
                        Your business appears at the top of search results
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mr-3">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Enhanced Photos
                      </h3>
                      <p className="text-sm text-gray-600">
                        Upload up to 10 high-quality photos
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mr-3">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Special Offers
                      </h3>
                      <p className="text-sm text-gray-600">
                        Create and display special offers to attract customers
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mr-3">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Detailed Analytics
                      </h3>
                      <p className="text-sm text-gray-600">
                        Access comprehensive performance metrics
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mr-3">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Featured Listing
                      </h3>
                      <p className="text-sm text-gray-600">
                        Appear in the "Promoted Businesses" section
                      </p>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 bg-green-100 rounded-full mr-3">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Lead Tracking
                      </h3>
                      <p className="text-sm text-gray-600">
                        Monitor and manage customer inquiries
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        {/* Placeholder for other tabs */}
        {activeTab === 'analytics' &&
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <BarChart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Analytics Dashboard
            </h2>
            <p className="text-gray-600 mb-4">
              Track views, engagement, and conversion metrics for your business
              listing.
            </p>
          </div>
        }
        {activeTab === 'reviews' &&
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Reviews Management
            </h2>
            <p className="text-gray-600 mb-4">
              View and respond to customer reviews of your business.
            </p>
          </div>
        }
        {activeTab === 'leads' &&
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Lead Management
            </h2>
            <p className="text-gray-600 mb-4">
              Track and manage customer inquiries and leads from your business
              listing.
            </p>
          </div>
        }
        {activeTab === 'offers' &&
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Special Offers
            </h2>
            <p className="text-gray-600 mb-4">
              Create and manage special offers to attract more customers.
            </p>
          </div>
        }
      </div>
    </div>);

};
export default BusinessDashboard;