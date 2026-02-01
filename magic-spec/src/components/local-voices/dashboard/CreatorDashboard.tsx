import React, { useState, Component } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart2,
  Users,
  Mic,
  Video,
  Settings,
  CreditCard,
  Plus,
  ChevronRight,
  DollarSign,
  Calendar,
  MessageSquare,
  Clock,
  FileText,
  HelpCircle,
  Upload,
  ExternalLink,
  TrendingUp,
  Edit,
  Briefcase,
  X } from
'lucide-react';
// Mock data - In a real app, this would come from an API
const mockUserData = {
  id: 'user123',
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar:
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  subscription: {
    tier: 'professional_broadcaster',
    status: 'active',
    renewalDate: '2023-12-15',
    paymentMethod: 'Visa ending in 4242'
  },
  podcasts: [
  {
    id: 'podcast1',
    title: 'The Clearwater Report',
    description: 'Local news and insights from Clearwater, Florida',
    image:
    'https://images.unsplash.com/photo-1557053910-d9eadeed1c58?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
    episodeCount: 24,
    totalListens: 45600,
    recentListens: 2300,
    lastEpisodeDate: '2023-11-10'
  },
  {
    id: 'podcast2',
    title: 'Tech Talk Tampa Bay',
    description: 'Technology news and interviews from Tampa Bay',
    image:
    'https://images.unsplash.com/photo-1559526324-593bc073d938?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&h=200&q=80',
    episodeCount: 18,
    totalListens: 28900,
    recentListens: 1800,
    lastEpisodeDate: '2023-11-05'
  }],

  recentTips: [
  {
    id: 'tip1',
    amount: 10.0,
    from: 'Sarah M.',
    date: '2023-11-12',
    podcast: 'The Clearwater Report',
    episode: 'City Council Meeting Recap'
  },
  {
    id: 'tip2',
    amount: 5.0,
    from: 'Anonymous',
    date: '2023-11-10',
    podcast: 'Tech Talk Tampa Bay',
    episode: 'Interview with Local Startup Founder'
  },
  {
    id: 'tip3',
    amount: 20.0,
    from: 'Mike J.',
    date: '2023-11-08',
    podcast: 'The Clearwater Report',
    episode: 'Downtown Redevelopment Special'
  }],

  analytics: {
    totalListeners: 3200,
    totalEpisodes: 42,
    totalTips: 850.0,
    listenerGrowth: 12.5,
    topCommunities: [
    {
      name: 'Clearwater',
      listeners: 1200
    },
    {
      name: 'St. Petersburg',
      listeners: 800
    },
    {
      name: 'Tampa',
      listeners: 650
    },
    {
      name: 'Dunedin',
      listeners: 300
    },
    {
      name: 'Palm Harbor',
      listeners: 250
    }]

  },
  hasBusinessProfile: true
};
const CreatorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showTipModal, setShowTipModal] = useState(false);
  const [activePodcastId, setActivePodcastId] = useState<string | null>(null);
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simplified Dashboard Header */}
      <header className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-xl font-bold text-gray-800 mb-4">
            Creator Dashboard
          </h1>
          {/* Navigation moved below masthead */}
          <nav className="flex items-center space-x-6 border-t border-gray-200 pt-4">
            <Link
              to="/local-voices/dashboard"
              className="text-news-primary font-semibold">

              Overview
            </Link>
            <Link
              to="/local-voices/dashboard/content"
              className="text-gray-600 hover:text-news-primary font-medium">

              Content
            </Link>
            <Link
              to="/local-voices/dashboard/analytics"
              className="text-gray-600 hover:text-news-primary font-medium">

              Analytics
            </Link>
            <Link
              to="/local-voices/dashboard/subscription"
              className="text-gray-600 hover:text-news-primary font-medium">

              Subscription
            </Link>
            <Link
              to="/local-voices/dashboard/settings"
              className="text-gray-600 hover:text-news-primary font-medium">

              Settings
            </Link>
          </nav>
        </div>
      </header>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Dashboard Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Listeners */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Listeners
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {mockUserData.analytics.totalListeners.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-md">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500 font-medium">
                {mockUserData.analytics.listenerGrowth}%
              </span>
              <span className="text-gray-500 ml-1">from last month</span>
            </div>
          </div>
          {/* Total Episodes */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Episodes
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {mockUserData.analytics.totalEpisodes}
                </p>
              </div>
              <div className="p-2 bg-purple-50 rounded-md">
                <Mic className="h-6 w-6 text-purple-500" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <Calendar className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-gray-500">
                Last published{' '}
                {new Date(
                  mockUserData.podcasts[0].lastEpisodeDate
                ).toLocaleDateString()}
              </span>
            </div>
          </div>
          {/* Podcast/Shows */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Active Shows
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {mockUserData.podcasts.length}
                </p>
              </div>
              <div className="p-2 bg-indigo-50 rounded-md">
                <Video className="h-6 w-6 text-indigo-500" />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate('/local-voices/dashboard/podcast')}
                className="text-news-primary hover:text-news-primary-dark text-sm font-medium flex items-center">

                <Plus className="h-4 w-4 mr-1" />
                Add a new show
              </button>
            </div>
          </div>
          {/* Total Tips */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Tips</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${mockUserData.analytics.totalTips.toLocaleString()}
                </p>
              </div>
              <div className="p-2 bg-green-50 rounded-md">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowTipModal(true)}
                className="text-news-primary hover:text-news-primary-dark text-sm font-medium flex items-center">

                <Settings className="h-4 w-4 mr-1" />
                Configure tip settings
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Podcasts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Your Shows</h2>
                <Link
                  to="/local-voices/upload"
                  className="bg-news-primary hover:bg-news-primary-dark text-white text-sm font-medium py-2 px-4 rounded-md flex items-center">

                  <Plus className="h-4 w-4 mr-1" />
                  Upload New Episode
                </Link>
              </div>
              <div className="space-y-4">
                {mockUserData.podcasts.map((podcast) =>
                <div
                  key={podcast.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-news-primary transition-colors">

                    <div className="flex items-start">
                      <img
                      src={podcast.image}
                      alt={podcast.title}
                      className="h-16 w-16 rounded-md object-cover mr-4 flex-shrink-0" />

                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">
                          {podcast.title}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          {podcast.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Mic className="h-3.5 w-3.5 mr-1" />
                            {podcast.episodeCount} episodes
                          </span>
                          <span className="flex items-center">
                            <Users className="h-3.5 w-3.5 mr-1" />
                            {podcast.totalListens.toLocaleString()} total
                            listens
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            Last published:{' '}
                            {new Date(
                            podcast.lastEpisodeDate
                          ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button
                        onClick={() =>
                        navigate(`/local-voices/dashboard/podcast`)
                        }
                        className="text-news-primary hover:text-news-primary-dark text-sm font-medium flex items-center">

                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Add New Podcast Card */}
                <div
                  className="border border-dashed border-gray-300 rounded-lg p-4 hover:border-news-primary transition-colors cursor-pointer flex items-center justify-center"
                  onClick={() => navigate('/local-voices/dashboard/podcast')}>

                  <div className="text-center py-6">
                    <div className="mx-auto bg-gray-100 rounded-full h-12 w-12 flex items-center justify-center mb-3">
                      <Plus className="h-6 w-6 text-gray-500" />
                    </div>
                    <h3 className="font-medium text-gray-900">
                      Add a New Show
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Create a new podcast or video series
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Recent Activity
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-2 mr-3">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-gray-900">
                      <span className="font-medium">250 new listeners</span>{' '}
                      tuned in to your podcasts this week
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-green-100 rounded-full p-2 mr-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-gray-900">
                      <span className="font-medium">
                        You received a $20.00 tip
                      </span>{' '}
                      from Mike J. for "Downtown Redevelopment Special"
                    </p>
                    <p className="text-xs text-gray-500 mt-1">4 days ago</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-purple-100 rounded-full p-2 mr-3">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-900">
                      <span className="font-medium">15 new comments</span> on
                      your episodes this week
                    </p>
                    <p className="text-xs text-gray-500 mt-1">5 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Right Column - Tips, Profiles, Quick Links */}
          <div className="space-y-6">
            {/* Recent Tips */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Recent Tips</h2>
                <button
                  onClick={() => setShowTipModal(true)}
                  className="text-news-primary hover:text-news-primary-dark text-sm font-medium">

                  Configure
                </button>
              </div>
              {mockUserData.recentTips.length > 0 ?
              <div className="space-y-4">
                  {mockUserData.recentTips.map((tip) =>
                <div
                  key={tip.id}
                  className="flex items-center justify-between">

                      <div className="flex items-center">
                        <div className="bg-green-100 rounded-full p-2 mr-3">
                          <DollarSign className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            ${tip.amount.toFixed(2)} from {tip.from}
                          </p>
                          <p className="text-xs text-gray-500">
                            {tip.podcast} • {tip.episode}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(tip.date).toLocaleDateString()}
                      </span>
                    </div>
                )}
                </div> :

              <div className="text-center py-6">
                  <DollarSign className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No tips received yet</p>
                </div>
              }
              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link
                  to="/local-voices/dashboard/tips"
                  className="text-news-primary hover:text-news-primary-dark text-sm font-medium flex items-center justify-center">

                  View all tips
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
            {/* Profiles */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Your Profiles
              </h2>
              {/* Creator Profile */}
              <div className="mb-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Mic className="h-5 w-5 text-news-primary mr-2" />
                    <h3 className="font-medium text-gray-900">
                      Creator Profile
                    </h3>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-3">
                  Your public creator profile on Local Voices
                </p>
                <div className="flex items-center justify-between">
                  <Link
                    to="/local-voices/dashboard/edit-profile"
                    className="text-news-primary hover:text-news-primary-dark text-sm font-medium flex items-center">

                    <Edit className="h-4 w-4 mr-1" />
                    Edit Profile
                  </Link>
                  <Link
                    to="/local-voices/creator/john-doe"
                    className="text-gray-500 hover:text-gray-700 text-sm flex items-center"
                    target="_blank"
                    rel="noopener noreferrer">

                    View
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </div>
              {/* Business Profile (if available) */}
              {mockUserData.hasBusinessProfile &&
              <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Briefcase className="h-5 w-5 text-indigo-500 mr-2" />
                      <h3 className="font-medium text-gray-900">
                        Business Profile
                      </h3>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                      Active
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">
                    Your business listing in the Day.News directory
                  </p>
                  <div className="flex items-center justify-between">
                    <Link
                    to="/business-dashboard/edit-profile"
                    className="text-news-primary hover:text-news-primary-dark text-sm font-medium flex items-center">

                      <Edit className="h-4 w-4 mr-1" />
                      Edit Business
                    </Link>
                    <Link
                    to="/business/john-doe-business"
                    className="text-gray-500 hover:text-gray-700 text-sm flex items-center"
                    target="_blank"
                    rel="noopener noreferrer">

                      View
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </div>
              }
              {/* Add Business Profile (if not available) */}
              {!mockUserData.hasBusinessProfile &&
              <div
                className="p-4 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-news-primary transition-colors"
                onClick={() => navigate('/business/create')}>

                  <div className="text-center py-3">
                    <Briefcase className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <h3 className="font-medium text-gray-900">
                      Add Business Profile
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Create a business listing in our directory
                    </p>
                  </div>
                </div>
              }
            </div>
            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Quick Links
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/local-voices/upload"
                    className="flex items-center text-gray-700 hover:text-news-primary">

                    <Plus className="h-4 w-4 mr-2" />
                    <span>Upload New Episode</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/local-voices/dashboard/analytics"
                    className="flex items-center text-gray-700 hover:text-news-primary">

                    <BarChart2 className="h-4 w-4 mr-2" />
                    <span>View Analytics</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/local-voices/dashboard/subscription"
                    className="flex items-center text-gray-700 hover:text-news-primary">

                    <CreditCard className="h-4 w-4 mr-2" />
                    <span>Manage Subscription</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/local-voices/dashboard/scheduled"
                    className="flex items-center text-gray-700 hover:text-news-primary">

                    <Clock className="h-4 w-4 mr-2" />
                    <span>Scheduled Episodes</span>
                  </Link>
                </li>
              </ul>
            </div>
            {/* Help & Resources */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Help & Resources
              </h2>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/local-voices/guidelines"
                    className="flex items-center text-gray-700 hover:text-news-primary">

                    <FileText className="h-4 w-4 mr-2" />
                    <span>Creator Guidelines</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/local-voices/faq"
                    className="flex items-center text-gray-700 hover:text-news-primary">

                    <HelpCircle className="h-4 w-4 mr-2" />
                    <span>FAQs</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/local-voices/support"
                    className="flex items-center text-gray-700 hover:text-news-primary">

                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span>Contact Support</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Tip Donation Modal */}
      {showTipModal &&
      <TipDonationSettings onClose={() => setShowTipModal(false)} />
      }
    </div>);

};
// Tip Donation Settings Component
const TipDonationSettings: React.FC<{
  onClose: () => void;
}> = ({ onClose }) => {
  const [tipSettings, setTipSettings] = useState({
    enableTips: true,
    suggestedAmounts: [2, 5, 10, 20],
    customAmount: true,
    minimumAmount: 1,
    paymentMethods: {
      venmo: true,
      cashapp: true,
      paypal: true,
      creditCard: true
    },
    venmoHandle: '@johndoe',
    cashappHandle: '$johndoe',
    paypalEmail: 'john.doe@example.com',
    showTipButton: true,
    tipButtonText: 'Support This Creator',
    thankYouMessage:
    'Thank you for your support! Your tip helps me create more content.'
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setTipSettings({
          ...tipSettings,
          [parent]: {
            ...tipSettings[parent as keyof typeof tipSettings],
            [child]: checked
          }
        });
      } else {
        setTipSettings({
          ...tipSettings,
          [name]: checked
        });
      }
    } else {
      setTipSettings({
        ...tipSettings,
        [name]: value
      });
    }
  };
  const handleSuggestedAmountChange = (index: number, value: string) => {
    const newAmounts = [...tipSettings.suggestedAmounts];
    newAmounts[index] = parseInt(value) || 0;
    setTipSettings({
      ...tipSettings,
      suggestedAmounts: newAmounts
    });
  };
  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log('Saving tip settings:', tipSettings);
    onClose();
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Tip Donation Settings
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500">

              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {/* Enable Tips */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="enableTips"
                name="enableTips"
                type="checkbox"
                checked={tipSettings.enableTips}
                onChange={handleChange}
                className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary" />

            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="enableTips" className="font-medium text-gray-700">
                Enable tip donations
              </label>
              <p className="text-gray-500">
                Allow your audience to support you with tips
              </p>
            </div>
          </div>
          {tipSettings.enableTips &&
          <>
              {/* Suggested Amounts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Suggested Tip Amounts ($)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {tipSettings.suggestedAmounts.map((amount, index) =>
                <input
                  key={index}
                  type="number"
                  value={amount}
                  onChange={(e) =>
                  handleSuggestedAmountChange(index, e.target.value)
                  }
                  min="1"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-news-primary focus:ring-news-primary" />

                )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  These amounts will be shown as quick options to your audience
                </p>
              </div>
              {/* Custom Amount */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                  id="customAmount"
                  name="customAmount"
                  type="checkbox"
                  checked={tipSettings.customAmount}
                  onChange={handleChange}
                  className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary" />

                </div>
                <div className="ml-3 text-sm">
                  <label
                  htmlFor="customAmount"
                  className="font-medium text-gray-700">

                    Allow custom amounts
                  </label>
                  <p className="text-gray-500">
                    Let your audience enter their own tip amount
                  </p>
                </div>
              </div>
              {/* Minimum Amount */}
              {tipSettings.customAmount &&
            <div>
                  <label
                htmlFor="minimumAmount"
                className="block text-sm font-medium text-gray-700 mb-1">

                    Minimum Tip Amount ($)
                  </label>
                  <input
                type="number"
                id="minimumAmount"
                name="minimumAmount"
                value={tipSettings.minimumAmount}
                onChange={handleChange}
                min="1"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-news-primary focus:ring-news-primary" />

                </div>
            }
              {/* Payment Methods */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Methods
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                    id="paymentMethods.venmo"
                    name="paymentMethods.venmo"
                    type="checkbox"
                    checked={tipSettings.paymentMethods.venmo}
                    onChange={handleChange}
                    className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary" />

                    <label
                    htmlFor="paymentMethods.venmo"
                    className="ml-2 text-sm text-gray-700">

                      Venmo
                    </label>
                  </div>
                  {tipSettings.paymentMethods.venmo &&
                <div className="ml-6 mt-2">
                      <label
                    htmlFor="venmoHandle"
                    className="block text-xs font-medium text-gray-700 mb-1">

                        Your Venmo Handle
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          @
                        </span>
                        <input
                      type="text"
                      id="venmoHandle"
                      name="venmoHandle"
                      value={tipSettings.venmoHandle.replace('@', '')}
                      onChange={handleChange}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-news-primary focus:border-news-primary sm:text-sm" />

                      </div>
                    </div>
                }
                  <div className="flex items-center">
                    <input
                    id="paymentMethods.cashapp"
                    name="paymentMethods.cashapp"
                    type="checkbox"
                    checked={tipSettings.paymentMethods.cashapp}
                    onChange={handleChange}
                    className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary" />

                    <label
                    htmlFor="paymentMethods.cashapp"
                    className="ml-2 text-sm text-gray-700">

                      Cash App
                    </label>
                  </div>
                  {tipSettings.paymentMethods.cashapp &&
                <div className="ml-6 mt-2">
                      <label
                    htmlFor="cashappHandle"
                    className="block text-xs font-medium text-gray-700 mb-1">

                        Your Cash App Handle
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          $
                        </span>
                        <input
                      type="text"
                      id="cashappHandle"
                      name="cashappHandle"
                      value={tipSettings.cashappHandle.replace('$', '')}
                      onChange={handleChange}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-news-primary focus:border-news-primary sm:text-sm" />

                      </div>
                    </div>
                }
                  <div className="flex items-center">
                    <input
                    id="paymentMethods.paypal"
                    name="paymentMethods.paypal"
                    type="checkbox"
                    checked={tipSettings.paymentMethods.paypal}
                    onChange={handleChange}
                    className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary" />

                    <label
                    htmlFor="paymentMethods.paypal"
                    className="ml-2 text-sm text-gray-700">

                      PayPal
                    </label>
                  </div>
                  {tipSettings.paymentMethods.paypal &&
                <div className="ml-6 mt-2">
                      <label
                    htmlFor="paypalEmail"
                    className="block text-xs font-medium text-gray-700 mb-1">

                        Your PayPal Email
                      </label>
                      <input
                    type="email"
                    id="paypalEmail"
                    name="paypalEmail"
                    value={tipSettings.paypalEmail}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-news-primary focus:border-news-primary sm:text-sm" />

                    </div>
                }
                  <div className="flex items-center">
                    <input
                    id="paymentMethods.creditCard"
                    name="paymentMethods.creditCard"
                    type="checkbox"
                    checked={tipSettings.paymentMethods.creditCard}
                    onChange={handleChange}
                    className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary" />

                    <label
                    htmlFor="paymentMethods.creditCard"
                    className="ml-2 text-sm text-gray-700">

                      Credit Card (via Stripe)
                    </label>
                  </div>
                </div>
              </div>
              {/* Tip Button Settings */}
              <div>
                <div className="flex items-start mb-3">
                  <div className="flex items-center h-5">
                    <input
                    id="showTipButton"
                    name="showTipButton"
                    type="checkbox"
                    checked={tipSettings.showTipButton}
                    onChange={handleChange}
                    className="h-4 w-4 text-news-primary border-gray-300 rounded focus:ring-news-primary" />

                  </div>
                  <div className="ml-3 text-sm">
                    <label
                    htmlFor="showTipButton"
                    className="font-medium text-gray-700">

                      Show tip button on your profile
                    </label>
                    <p className="text-gray-500">
                      Display a button on your profile for easy tipping
                    </p>
                  </div>
                </div>
                {tipSettings.showTipButton &&
              <div>
                    <label
                  htmlFor="tipButtonText"
                  className="block text-sm font-medium text-gray-700 mb-1">

                      Button Text
                    </label>
                    <input
                  type="text"
                  id="tipButtonText"
                  name="tipButtonText"
                  value={tipSettings.tipButtonText}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-news-primary focus:ring-news-primary" />

                  </div>
              }
              </div>
              {/* Thank You Message */}
              <div>
                <label
                htmlFor="thankYouMessage"
                className="block text-sm font-medium text-gray-700 mb-1">

                  Thank You Message
                </label>
                <textarea
                id="thankYouMessage"
                name="thankYouMessage"
                rows={3}
                value={tipSettings.thankYouMessage}
                onChange={(e) =>
                setTipSettings({
                  ...tipSettings,
                  thankYouMessage: e.target.value
                })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-news-primary focus:ring-news-primary">
              </textarea>
                <p className="mt-1 text-xs text-gray-500">
                  This message will be shown to users after they tip you
                </p>
              </div>
              {/* Preview */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Preview</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <button className="w-full bg-news-primary hover:bg-news-primary-dark text-white font-medium py-2 px-4 rounded-md flex items-center justify-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {tipSettings.tipButtonText}
                  </button>
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {tipSettings.suggestedAmounts.map((amount, index) =>
                  <button
                    key={index}
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-1.5 px-3 rounded">

                        ${amount}
                      </button>
                  )}
                  </div>
                  {tipSettings.customAmount &&
                <div className="mt-3 flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        $
                      </span>
                      <input
                    type="text"
                    placeholder="Other amount"
                    className="flex-1 min-w-0 block w-full px-3 py-1.5 rounded-none rounded-r-md border border-gray-300 focus:ring-news-primary focus:border-news-primary sm:text-sm" />

                    </div>
                }
                </div>
              </div>
            </>
          }
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">

            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-news-primary hover:bg-news-primary-dark border border-transparent rounded-md text-sm font-medium text-white">

            Save Settings
          </button>
        </div>
      </div>
    </div>);

};
export default CreatorDashboard;