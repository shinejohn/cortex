import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Check,
  X,
  ChevronDown,
  Bell,
  MapPin,
  CheckCircle,
  Info,
  HelpCircle,
  ArrowRight } from
'lucide-react';
export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>(
    'monthly'
  );
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  // Calculate annual price (monthly price * 10 for 17% discount)
  const getPrice = (monthlyPrice: number) => {
    return billingCycle === 'monthly' ?
    monthlyPrice.toFixed(2) :
    (monthlyPrice * 10).toFixed(2);
  };
  const toggleBillingCycle = () => {
    setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly');
  };
  // Handle tooltip display
  const handleTooltipToggle = (tooltipId: string) => {
    if (showTooltip === tooltipId) {
      setShowTooltip(null);
    } else {
      setShowTooltip(tooltipId);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 py-3">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                className="font-display text-2xl font-bold text-news-primary">

                Day.News
              </Link>
            </div>
            {/* Main Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className="text-gray-600 hover:text-news-primary font-medium">

                Home
              </Link>
              <Link
                to="/news"
                className="text-gray-600 hover:text-news-primary font-medium">

                News
              </Link>
              <Link
                to="/business"
                className="text-gray-600 hover:text-news-primary font-medium">

                Business
              </Link>
              <Link
                to="/events"
                className="text-gray-600 hover:text-news-primary font-medium">

                Events
              </Link>
              <Link
                to="/local-voices"
                className="text-news-primary font-semibold">

                Local Voices
              </Link>
              <Link
                to="/government"
                className="text-gray-600 hover:text-news-primary font-medium">

                Government
              </Link>
              <Link
                to="/sports"
                className="text-gray-600 hover:text-news-primary font-medium">

                Sports
              </Link>
            </nav>
            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-news-primary relative">
                <Bell className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="flex items-center">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  alt="User profile"
                  className="h-8 w-8 rounded-full object-cover" />

                <ChevronDown className="h-4 w-4 ml-1 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </header>
      {/* Progress Indicator */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-center">
            <div className="flex items-center w-full max-w-3xl justify-between">
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-news-primary text-white flex items-center justify-center font-medium">
                  1
                </div>
                <span className="text-xs font-medium text-news-primary mt-1">
                  Choose Plan
                </span>
              </div>
              <div className="w-full h-1 bg-gray-200 mx-2">
                <div className="h-full bg-news-primary w-0"></div>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-medium">
                  2
                </div>
                <span className="text-xs font-medium text-gray-500 mt-1">
                  Add-ons
                </span>
              </div>
              <div className="w-full h-1 bg-gray-200 mx-2"></div>
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-medium">
                  3
                </div>
                <span className="text-xs font-medium text-gray-500 mt-1">
                  Payment
                </span>
              </div>
              <div className="w-full h-1 bg-gray-200 mx-2"></div>
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-medium">
                  4
                </div>
                <span className="text-xs font-medium text-gray-500 mt-1">
                  Confirm
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Hero Section */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Share Your Voice with Your Community
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your podcast or video show
          </p>
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-12">
            <span
              className={`mr-3 text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>

              Monthly
            </span>
            <button
              onClick={toggleBillingCycle}
              className="relative inline-flex h-6 w-11 items-center rounded-full"
              aria-pressed={billingCycle === 'annual'}>

              <span className="sr-only">Toggle billing cycle</span>
              <span
                className={`inline-block h-6 w-11 rounded-full transition ${billingCycle === 'annual' ? 'bg-news-primary' : 'bg-gray-300'}`} />

              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'}`} />

            </button>
            <span
              className={`ml-3 text-sm font-medium ${billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>

              Annual{' '}
              <span className="text-green-600 font-semibold">(Save 17%)</span>
            </span>
          </div>
        </div>
      </section>
      {/* Pricing Cards */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 - Local Creator */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow flex flex-col">
              <div className="p-6 border-b border-gray-200 bg-blue-50">
                <div className="text-sm font-medium text-blue-600 mb-2">
                  Perfect for getting started
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Local Creator
                </h2>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    ${getPrice(19.99)}
                  </span>
                  <span className="text-gray-500 ml-1">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors">
                  Start with Local
                </button>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      Up to 10 communities
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 ml-6">
                    50,000-250,000 local readers
                  </div>
                </div>
                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      5,000 downloads/month included
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">2 shows/podcasts</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">10 hours storage</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      2-hour max episode duration
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Basic analytics</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Day.News player embed</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Mobile app distribution
                    </span>
                  </li>
                </ul>
                <div className="text-sm text-gray-500 pt-4 border-t border-gray-100">
                  <span className="font-medium">Overage:</span> $8 per
                  additional 1,000 downloads
                </div>
              </div>
            </div>
            {/* Card 2 - Professional Broadcaster */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-news-primary transform lg:scale-105 z-10 flex flex-col">
              <div className="absolute top-0 right-0 bg-news-primary text-white text-xs font-bold px-3 py-1 uppercase">
                Most Popular
              </div>
              <div className="p-6 border-b border-gray-200 bg-indigo-50">
                <div className="text-sm font-medium text-indigo-600 mb-2">
                  For serious content creators
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  Professional Broadcaster
                </h2>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    ${getPrice(39.99)}
                  </span>
                  <span className="text-gray-500 ml-1">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                <button className="w-full bg-news-primary hover:bg-news-primary-dark text-white font-medium py-2 rounded-lg transition-colors">
                  Go Professional
                </button>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      Up to 50 communities
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 ml-6">
                    250,000-1.25M local readers
                  </div>
                </div>
                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      25,000 downloads/month included
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">5 shows/podcasts</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">50 hours storage</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Unlimited episode duration
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Video podcast support (1080p)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Advanced analytics</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Custom branding</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">API access</span>
                  </li>
                </ul>
                <div className="text-sm pt-4 border-t border-gray-100">
                  <div className="text-gray-500 mb-2">
                    <span className="font-medium">Overage:</span> $6 per
                    additional 1,000 downloads
                  </div>
                  <div className="text-news-primary font-medium">
                    Earn credits after 50K downloads
                  </div>
                </div>
              </div>
            </div>
            {/* Card 3 - County Broadcaster */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow flex flex-col">
              <div className="p-6 border-b border-gray-200 bg-purple-50">
                <div className="text-sm font-medium text-purple-600 mb-2">
                  Maximum local impact
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  County Broadcaster
                </h2>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    ${getPrice(69)}
                  </span>
                  <span className="text-gray-500 ml-1">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded-lg transition-colors">
                  Cover the County
                </button>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      Entire county coverage
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 ml-6">
                    500,000-5M depending on county
                  </div>
                </div>
                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      50,000 downloads/month included
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">10 shows/podcasts</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">100 hours storage</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Live streaming capability
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">4K video support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Team collaboration (5 users)
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">White-label player</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Dedicated support</span>
                  </li>
                </ul>
                <div className="text-sm pt-4 border-t border-gray-100">
                  <div className="text-gray-500 mb-2">
                    <span className="font-medium">Overage:</span> $5 per
                    additional 1,000 downloads
                  </div>
                  <div className="text-purple-600 font-medium">
                    Earn $0.003 per download over 100K
                  </div>
                </div>
              </div>
            </div>
            {/* Card 4 - National Distribution */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow flex flex-col">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="text-sm font-medium text-gray-600 mb-2">
                  Enterprise solution
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  National Distribution
                </h2>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    ${getPrice(299)}
                  </span>
                  <span className="text-gray-500 ml-1">
                    /{billingCycle === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
                <button className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 rounded-lg transition-colors">
                  Go National
                </button>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  <div className="flex items-center mb-1">
                    <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      All 8,500+ Day.News communities
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 ml-6">
                    40M+ Americans
                  </div>
                </div>
                <ul className="space-y-3 mb-6 flex-1">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      200,000 downloads/month included
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Unlimited shows</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">500 hours storage</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Unlimited team members
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Custom AI training</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Dedicated account manager
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">SLA guarantee</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Geographic heat maps</span>
                  </li>
                </ul>
                <div className="text-sm pt-4 border-t border-gray-100">
                  <div className="text-gray-500 mb-2">
                    <span className="font-medium">Overage:</span> $4 per
                    additional 1,000 downloads
                  </div>
                  <div className="text-gray-800 font-medium">
                    Earn $0.004 per download over 500K
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Comparison Table */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Detailed Feature Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-4 px-6 text-left text-gray-900 font-bold">
                    Feature
                  </th>
                  <th className="py-4 px-6 text-center text-gray-900 font-bold">
                    Local Creator
                  </th>
                  <th className="py-4 px-6 text-center text-gray-900 font-bold bg-indigo-50 border-b-2 border-t-2 border-news-primary">
                    Professional Broadcaster
                  </th>
                  <th className="py-4 px-6 text-center text-gray-900 font-bold">
                    County Broadcaster
                  </th>
                  <th className="py-4 px-6 text-center text-gray-900 font-bold">
                    National Distribution
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Distribution Section */}
                <tr className="bg-gray-50">
                  <td
                    colSpan={5}
                    className="py-2 px-6 font-semibold text-gray-700">

                    Distribution
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-gray-700">
                    Communities Covered
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700">
                    Up to 10
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700 bg-indigo-50 border-l-2 border-r-2 border-news-primary">
                    Up to 50
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700">
                    Full County
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700">
                    All 8,500+
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-gray-700">
                    Potential Audience Reach
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700">
                    50K-250K
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700 bg-indigo-50 border-l-2 border-r-2 border-news-primary">
                    250K-1.25M
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700">
                    500K-5M
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700">40M+</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-gray-700">
                    Mobile App Distribution
                  </td>
                  <td className="py-3 px-6 text-center">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                  <td className="py-3 px-6 text-center bg-indigo-50 border-l-2 border-r-2 border-news-primary">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                  <td className="py-3 px-6 text-center">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                  <td className="py-3 px-6 text-center">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-gray-700">
                    Featured Placement
                  </td>
                  <td className="py-3 px-6 text-center">
                    <X
                      className="h-5 w-5 text-gray-400 mx-auto"
                      aria-label="Not included" />

                  </td>
                  <td className="py-3 px-6 text-center bg-indigo-50 border-l-2 border-r-2 border-news-primary">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                  <td className="py-3 px-6 text-center">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                  <td className="py-3 px-6 text-center">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                </tr>
                {/* Storage & Bandwidth */}
                <tr className="bg-gray-50">
                  <td
                    colSpan={5}
                    className="py-2 px-6 font-semibold text-gray-700">

                    Storage & Bandwidth
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-gray-700">
                    Monthly Downloads Included
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700">5,000</td>
                  <td className="py-3 px-6 text-center text-gray-700 bg-indigo-50 border-l-2 border-r-2 border-news-primary">
                    25,000
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700">
                    50,000
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700">
                    200,000
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-gray-700">
                    Overage Cost (per 1,000)
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700">$8</td>
                  <td className="py-3 px-6 text-center text-gray-700 bg-indigo-50 border-l-2 border-r-2 border-news-primary">
                    $6
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700">$5</td>
                  <td className="py-3 px-6 text-center text-gray-700">$4</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-gray-700">Storage Space</td>
                  <td className="py-3 px-6 text-center text-gray-700">
                    10 hours
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700 bg-indigo-50 border-l-2 border-r-2 border-news-primary">
                    50 hours
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700">
                    100 hours
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700">
                    500 hours
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-gray-700">
                    Max Episode Duration
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700">
                    2 hours
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700 bg-indigo-50 border-l-2 border-r-2 border-news-primary">
                    Unlimited
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700">
                    Unlimited
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700">
                    Unlimited
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-gray-700">Number of Shows</td>
                  <td className="py-3 px-6 text-center text-gray-700">2</td>
                  <td className="py-3 px-6 text-center text-gray-700 bg-indigo-50 border-l-2 border-r-2 border-news-primary">
                    5
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700">10</td>
                  <td className="py-3 px-6 text-center text-gray-700">
                    Unlimited
                  </td>
                </tr>
                {/* Content Features */}
                <tr className="bg-gray-50">
                  <td
                    colSpan={5}
                    className="py-2 px-6 font-semibold text-gray-700">

                    Content Features
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-gray-700">Video Support</td>
                  <td className="py-3 px-6 text-center">
                    <X
                      className="h-5 w-5 text-gray-400 mx-auto"
                      aria-label="Not included" />

                  </td>
                  <td className="py-3 px-6 text-center bg-indigo-50 border-l-2 border-r-2 border-news-primary">
                    <div className="text-sm text-gray-700">1080p</div>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="text-sm text-gray-700">4K</div>
                  </td>
                  <td className="py-3 px-6 text-center">
                    <div className="text-sm text-gray-700">4K</div>
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-gray-700">Live Streaming</td>
                  <td className="py-3 px-6 text-center">
                    <X
                      className="h-5 w-5 text-gray-400 mx-auto"
                      aria-label="Not included" />

                  </td>
                  <td className="py-3 px-6 text-center bg-indigo-50 border-l-2 border-r-2 border-news-primary">
                    <X
                      className="h-5 w-5 text-gray-400 mx-auto"
                      aria-label="Not included" />

                  </td>
                  <td className="py-3 px-6 text-center">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                  <td className="py-3 px-6 text-center">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-gray-700">Custom Branding</td>
                  <td className="py-3 px-6 text-center">
                    <X
                      className="h-5 w-5 text-gray-400 mx-auto"
                      aria-label="Not included" />

                  </td>
                  <td className="py-3 px-6 text-center bg-indigo-50 border-l-2 border-r-2 border-news-primary">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                  <td className="py-3 px-6 text-center">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                  <td className="py-3 px-6 text-center">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-gray-700">
                    White-Label Player
                  </td>
                  <td className="py-3 px-6 text-center">
                    <X
                      className="h-5 w-5 text-gray-400 mx-auto"
                      aria-label="Not included" />

                  </td>
                  <td className="py-3 px-6 text-center bg-indigo-50 border-l-2 border-r-2 border-news-primary">
                    <X
                      className="h-5 w-5 text-gray-400 mx-auto"
                      aria-label="Not included" />

                  </td>
                  <td className="py-3 px-6 text-center">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                  <td className="py-3 px-6 text-center">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                </tr>
                {/* Analytics */}
                <tr className="bg-gray-50">
                  <td
                    colSpan={5}
                    className="py-2 px-6 font-semibold text-gray-700">

                    Analytics & Reporting
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-gray-700">Analytics Level</td>
                  <td className="py-3 px-6 text-center text-gray-700">Basic</td>
                  <td className="py-3 px-6 text-center text-gray-700 bg-indigo-50 border-l-2 border-r-2 border-news-primary">
                    Advanced
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700">
                    Advanced
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700">
                    Enterprise
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-gray-700">
                    Geographic Heat Maps
                  </td>
                  <td className="py-3 px-6 text-center">
                    <X
                      className="h-5 w-5 text-gray-400 mx-auto"
                      aria-label="Not included" />

                  </td>
                  <td className="py-3 px-6 text-center bg-indigo-50 border-l-2 border-r-2 border-news-primary">
                    <X
                      className="h-5 w-5 text-gray-400 mx-auto"
                      aria-label="Not included" />

                  </td>
                  <td className="py-3 px-6 text-center">
                    <X
                      className="h-5 w-5 text-gray-400 mx-auto"
                      aria-label="Not included" />

                  </td>
                  <td className="py-3 px-6 text-center">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-gray-700">API Access</td>
                  <td className="py-3 px-6 text-center">
                    <X
                      className="h-5 w-5 text-gray-400 mx-auto"
                      aria-label="Not included" />

                  </td>
                  <td className="py-3 px-6 text-center bg-indigo-50 border-l-2 border-r-2 border-news-primary">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                  <td className="py-3 px-6 text-center">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                  <td className="py-3 px-6 text-center">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-gray-700">
                    Audience Demographics
                  </td>
                  <td className="py-3 px-6 text-center">
                    <X
                      className="h-5 w-5 text-gray-400 mx-auto"
                      aria-label="Not included" />

                  </td>
                  <td className="py-3 px-6 text-center bg-indigo-50 border-l-2 border-r-2 border-news-primary">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                  <td className="py-3 px-6 text-center">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                  <td className="py-3 px-6 text-center">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                </tr>
                {/* Support */}
                <tr className="bg-gray-50">
                  <td
                    colSpan={5}
                    className="py-2 px-6 font-semibold text-gray-700">

                    Team & Support
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-gray-700">Team Members</td>
                  <td className="py-3 px-6 text-center text-gray-700">1</td>
                  <td className="py-3 px-6 text-center text-gray-700 bg-indigo-50 border-l-2 border-r-2 border-news-primary">
                    3
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700">5</td>
                  <td className="py-3 px-6 text-center text-gray-700">
                    Unlimited
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-gray-700">Support Level</td>
                  <td className="py-3 px-6 text-center text-gray-700">Email</td>
                  <td className="py-3 px-6 text-center text-gray-700 bg-indigo-50 border-l-2 border-r-2 border-news-primary">
                    Priority Email
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700">
                    Dedicated Support
                  </td>
                  <td className="py-3 px-6 text-center text-gray-700">
                    Account Manager
                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-gray-700">SLA Guarantee</td>
                  <td className="py-3 px-6 text-center">
                    <X
                      className="h-5 w-5 text-gray-400 mx-auto"
                      aria-label="Not included" />

                  </td>
                  <td className="py-3 px-6 text-center bg-indigo-50 border-l-2 border-r-2 border-news-primary">
                    <X
                      className="h-5 w-5 text-gray-400 mx-auto"
                      aria-label="Not included" />

                  </td>
                  <td className="py-3 px-6 text-center">
                    <X
                      className="h-5 w-5 text-gray-400 mx-auto"
                      aria-label="Not included" />

                  </td>
                  <td className="py-3 px-6 text-center">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="py-3 px-6 text-gray-700">
                    Custom AI Training
                  </td>
                  <td className="py-3 px-6 text-center">
                    <X
                      className="h-5 w-5 text-gray-400 mx-auto"
                      aria-label="Not included" />

                  </td>
                  <td className="py-3 px-6 text-center bg-indigo-50 border-l-2 border-r-2 border-news-primary">
                    <X
                      className="h-5 w-5 text-gray-400 mx-auto"
                      aria-label="Not included" />

                  </td>
                  <td className="py-3 px-6 text-center">
                    <X
                      className="h-5 w-5 text-gray-400 mx-auto"
                      aria-label="Not included" />

                  </td>
                  <td className="py-3 px-6 text-center">
                    <Check
                      className="h-5 w-5 text-green-500 mx-auto"
                      aria-label="Included" />

                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* CTA */}
          <div className="mt-12 text-center">
            <button
              onClick={() => navigate('/local-voices/addons')}
              className="bg-news-primary hover:bg-news-primary-dark text-white font-medium py-3 px-8 rounded-lg inline-flex items-center">

              Continue to Add-ons
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-2">
                How are downloads counted?
              </h3>
              <p className="text-gray-700">
                A download is counted when a unique user requests your content
                within a 24-hour period. Multiple requests from the same user
                within this timeframe count as a single download.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-2">
                Can I change my plan later?
              </h3>
              <p className="text-gray-700">
                Yes, you can upgrade or downgrade your plan at any time.
                Upgrades take effect immediately with prorated billing, while
                downgrades take effect at the end of your current billing cycle.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-2">
                What happens if I exceed my download limit?
              </h3>
              <p className="text-gray-700">
                Your content will continue to be available, and you'll be billed
                for the additional downloads at the overage rate specified in
                your plan. You can set download caps in your account settings to
                prevent unexpected charges.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-2">
                How do I earn from performance bonuses?
              </h3>
              <p className="text-gray-700">
                Performance bonuses are automatically calculated based on
                downloads exceeding the threshold for your plan. Credits are
                applied to your account monthly and can be used toward future
                billing or withdrawn once they reach $100.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-white text-gray-900">
        {/* Main footer content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: About */}
            <div>
              <h3 className="font-display text-xl font-bold mb-4">Day.News</h3>
              <p className="text-gray-700 text-sm mb-4">
                Florida County's Trusted News Source Since 2025
              </p>
              <div className="flex flex-col space-y-2 text-sm text-gray-700">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>123 Main Street, Clearwater, Florida 33755</span>
                </div>
              </div>
            </div>
            {/* Column 2: Sections */}
            <div>
              <h4 className="font-bold mb-4">Sections</h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>
                  <Link
                    to="/"
                    className="hover:text-gray-900 transition-colors">

                    News
                  </Link>
                </li>
                <li>
                  <Link
                    to="/business"
                    className="hover:text-gray-900 transition-colors">

                    Business
                  </Link>
                </li>
                <li>
                  <Link
                    to="/local-voices"
                    className="hover:text-gray-900 transition-colors">

                    Local Voices
                  </Link>
                </li>
                <li>
                  <Link
                    to="/eventsCalendar"
                    className="hover:text-gray-900 transition-colors">

                    Events
                  </Link>
                </li>
              </ul>
            </div>
            {/* Column 3: Company */}
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-gray-900 transition-colors">

                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-gray-900 transition-colors">

                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/careers"
                    className="hover:text-gray-900 transition-colors">

                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            {/* Column 4: Connect & Subscribe */}
            <div>
              <h4 className="font-bold mb-4">Connect</h4>
              <div className="flex space-x-3 mb-6">
                <a
                  href="#"
                  className="bg-gray-200 hover:bg-gray-300 transition-colors p-2 rounded-full"
                  aria-label="Facebook">

                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24">

                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-gray-200 hover:bg-gray-300 transition-colors p-2 rounded-full"
                  aria-label="Twitter">

                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24">

                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="bg-gray-200 hover:bg-gray-300 transition-colors p-2 rounded-full"
                  aria-label="Instagram">

                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24">

                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd" />

                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom footer bar */}
        <div className="border-t border-gray-200 py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-600 text-sm mb-4 md:mb-0">
                © {new Date().getFullYear()} Fibonacco, Inc. All Rights
                Reserved.
              </div>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-600">
                <Link
                  to="/privacy-policy"
                  className="hover:text-gray-900 transition-colors">

                  Privacy Policy
                </Link>
                <Link
                  to="/terms-of-service"
                  className="hover:text-gray-900 transition-colors">

                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>);

};