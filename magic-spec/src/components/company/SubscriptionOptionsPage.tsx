import React from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  X,
  HelpCircle,
  Shield,
  Zap,
  Newspaper,
  Bell,
  Gift,
  Coffee } from
'lucide-react';
export const SubscriptionOptionsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2 text-center">
            Subscription Options
          </h1>
          <p className="text-xl text-gray-600 mb-8 text-center">
            Support local journalism and get unlimited access to Day.News
          </p>
          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Basic Tier */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Basic Digital
                </h2>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    $4.99
                  </span>
                  <span className="text-gray-600 ml-1">/month</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Essential access to local news and information
                </p>
                <button
                  className="w-full bg-news-primary text-white py-2 px-4 rounded-md hover:bg-news-primary-dark transition-colors"
                  aria-label="Subscribe to Basic Digital plan">

                  Subscribe Now
                </button>
              </div>
              <div className="p-6">
                <h3 className="font-medium text-gray-900 mb-4">
                  What's included:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Unlimited access to all articles
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Breaking news alerts</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Daily newsletter</span>
                  </li>
                  <li className="flex items-start">
                    <X className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-500">Ad-free experience</span>
                  </li>
                  <li className="flex items-start">
                    <X className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-500">Premium content</span>
                  </li>
                  <li className="flex items-start">
                    <X className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-500">
                      Community events access
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            {/* Premium Tier */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-news-primary relative transform md:scale-105 z-10">
              <div className="absolute top-0 right-0 bg-news-primary text-white text-xs font-bold px-3 py-1 uppercase">
                Most Popular
              </div>
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Premium Digital
                </h2>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    $9.99
                  </span>
                  <span className="text-gray-600 ml-1">/month</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Enhanced experience with exclusive content
                </p>
                <button
                  className="w-full bg-news-primary text-white py-2 px-4 rounded-md hover:bg-news-primary-dark transition-colors"
                  aria-label="Subscribe to Premium Digital plan">

                  Subscribe Now
                </button>
              </div>
              <div className="p-6">
                <h3 className="font-medium text-gray-900 mb-4">
                  What's included:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Unlimited access to all articles
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Breaking news alerts</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Daily newsletter</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Ad-free experience</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Premium content & analysis
                    </span>
                  </li>
                  <li className="flex items-start">
                    <X className="h-5 w-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-500">
                      Community events access
                    </span>
                  </li>
                </ul>
              </div>
            </div>
            {/* Complete Tier */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Complete Access
                </h2>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    $14.99
                  </span>
                  <span className="text-gray-600 ml-1">/month</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Full experience for the dedicated community member
                </p>
                <button
                  className="w-full bg-news-primary text-white py-2 px-4 rounded-md hover:bg-news-primary-dark transition-colors"
                  aria-label="Subscribe to Complete Access plan">

                  Subscribe Now
                </button>
              </div>
              <div className="p-6">
                <h3 className="font-medium text-gray-900 mb-4">
                  What's included:
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Unlimited access to all articles
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Breaking news alerts</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Daily newsletter</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Ad-free experience</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Premium content & analysis
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Community events access
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          {/* Annual Discount Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="font-bold text-gray-900 mb-1">
                  Save with annual billing
                </h3>
                <p className="text-gray-700">
                  Get 2 months free when you subscribe annually
                </p>
              </div>
              <button
                className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
                aria-label="View annual subscription plans">

                View Annual Plans
              </button>
            </div>
          </div>
          {/* Benefits Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Why Subscribe to Day.News?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Newspaper className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Support Local Journalism
                </h3>
                <p className="text-gray-600">
                  Your subscription directly funds our newsroom, allowing us to
                  provide in-depth coverage of the issues that matter to our
                  community.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Stay Informed</h3>
                <p className="text-gray-600">
                  Get unlimited access to breaking news, investigative
                  reporting, and analysis that helps you understand what's
                  happening in Clearwater.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Trusted Source</h3>
                <p className="text-gray-600">
                  In an era of misinformation, we provide fact-based, verified
                  reporting you can trust, with transparency about our sources
                  and methods.
                </p>
              </div>
            </div>
          </div>
          {/* Feature Comparison Table */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Detailed Feature Comparison
            </h2>
            <div className="overflow-x-auto">
              <table
                className="w-full border-collapse"
                aria-label="Subscription plan feature comparison">

                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-4 px-6 text-left text-gray-900 font-bold">
                      Feature
                    </th>
                    <th className="py-4 px-6 text-center text-gray-900 font-bold">
                      Basic Digital
                    </th>
                    <th className="py-4 px-6 text-center text-gray-900 font-bold">
                      Premium Digital
                    </th>
                    <th className="py-4 px-6 text-center text-gray-900 font-bold">
                      Complete Access
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-6 text-gray-700">
                      Unlimited Articles
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check
                        className="h-5 w-5 text-green-500 mx-auto"
                        aria-label="Included" />

                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check
                        className="h-5 w-5 text-green-500 mx-auto"
                        aria-label="Included" />

                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check
                        className="h-5 w-5 text-green-500 mx-auto"
                        aria-label="Included" />

                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-6 text-gray-700">
                      Mobile App Access
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check
                        className="h-5 w-5 text-green-500 mx-auto"
                        aria-label="Included" />

                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check
                        className="h-5 w-5 text-green-500 mx-auto"
                        aria-label="Included" />

                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check
                        className="h-5 w-5 text-green-500 mx-auto"
                        aria-label="Included" />

                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-6 text-gray-700">
                      Daily Newsletter
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check
                        className="h-5 w-5 text-green-500 mx-auto"
                        aria-label="Included" />

                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check
                        className="h-5 w-5 text-green-500 mx-auto"
                        aria-label="Included" />

                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check
                        className="h-5 w-5 text-green-500 mx-auto"
                        aria-label="Included" />

                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-6 text-gray-700">
                      Breaking News Alerts
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check
                        className="h-5 w-5 text-green-500 mx-auto"
                        aria-label="Included" />

                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check
                        className="h-5 w-5 text-green-500 mx-auto"
                        aria-label="Included" />

                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check
                        className="h-5 w-5 text-green-500 mx-auto"
                        aria-label="Included" />

                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-6 text-gray-700">
                      Ad-Free Experience
                    </td>
                    <td className="py-4 px-6 text-center">
                      <X
                        className="h-5 w-5 text-gray-400 mx-auto"
                        aria-label="Not included" />

                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check
                        className="h-5 w-5 text-green-500 mx-auto"
                        aria-label="Included" />

                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check
                        className="h-5 w-5 text-green-500 mx-auto"
                        aria-label="Included" />

                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-6 text-gray-700">
                      Premium Articles & Analysis
                    </td>
                    <td className="py-4 px-6 text-center">
                      <X
                        className="h-5 w-5 text-gray-400 mx-auto"
                        aria-label="Not included" />

                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check
                        className="h-5 w-5 text-green-500 mx-auto"
                        aria-label="Included" />

                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check
                        className="h-5 w-5 text-green-500 mx-auto"
                        aria-label="Included" />

                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-6 text-gray-700">
                      Special Topic Newsletters
                    </td>
                    <td className="py-4 px-6 text-center">
                      <X
                        className="h-5 w-5 text-gray-400 mx-auto"
                        aria-label="Not included" />

                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check
                        className="h-5 w-5 text-green-500 mx-auto"
                        aria-label="Included" />

                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check
                        className="h-5 w-5 text-green-500 mx-auto"
                        aria-label="Included" />

                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-6 text-gray-700">
                      Community Events Access
                    </td>
                    <td className="py-4 px-6 text-center">
                      <X
                        className="h-5 w-5 text-gray-400 mx-auto"
                        aria-label="Not included" />

                    </td>
                    <td className="py-4 px-6 text-center">
                      <X
                        className="h-5 w-5 text-gray-400 mx-auto"
                        aria-label="Not included" />

                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check
                        className="h-5 w-5 text-green-500 mx-auto"
                        aria-label="Included" />

                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-4 px-6 text-gray-700">
                      Digital Archive Access
                    </td>
                    <td className="py-4 px-6 text-center">
                      <X
                        className="h-5 w-5 text-gray-400 mx-auto"
                        aria-label="Not included" />

                    </td>
                    <td className="py-4 px-6 text-center">
                      <X
                        className="h-5 w-5 text-gray-400 mx-auto"
                        aria-label="Not included" />

                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check
                        className="h-5 w-5 text-green-500 mx-auto"
                        aria-label="Included" />

                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-gray-700">
                      Subscriber-Only Webinars
                    </td>
                    <td className="py-4 px-6 text-center">
                      <X
                        className="h-5 w-5 text-gray-400 mx-auto"
                        aria-label="Not included" />

                    </td>
                    <td className="py-4 px-6 text-center">
                      <X
                        className="h-5 w-5 text-gray-400 mx-auto"
                        aria-label="Not included" />

                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check
                        className="h-5 w-5 text-green-500 mx-auto"
                        aria-label="Included" />

                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* Gift Subscriptions */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="md:w-2/3 mb-6 md:mb-0 md:pr-8">
                <div className="flex items-center mb-4">
                  <Gift className="h-8 w-8 text-news-primary mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Gift a Subscription
                  </h2>
                </div>
                <p className="text-gray-700 mb-4">
                  Share the gift of quality local journalism with friends and
                  family. Gift subscriptions are available for all plans and can
                  be sent immediately or scheduled for a future date.
                </p>
                <button
                  className="bg-news-primary text-white py-2 px-6 rounded-md hover:bg-news-primary-dark transition-colors"
                  aria-label="Purchase a gift subscription">

                  Purchase a Gift Subscription
                </button>
              </div>
              <div className="md:w-1/3">
                <img
                  src="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                  alt="Gift box with a newspaper subscription card"
                  className="w-full h-auto rounded-lg" />

              </div>
            </div>
          </div>
          {/* Education & Non-profit Discount */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
            <div className="flex flex-col md:flex-row md:items-center">
              <div className="md:w-1/3 mb-6 md:mb-0">
                <img
                  src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                  alt="Student reading news on a tablet"
                  className="w-full h-auto rounded-lg" />

              </div>
              <div className="md:w-2/3 md:pl-8">
                <div className="flex items-center mb-4">
                  <Coffee className="h-8 w-8 text-news-primary mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Special Discounts
                  </h2>
                </div>
                <p className="text-gray-700 mb-4">
                  We offer special rates for students, educators, and non-profit
                  organizations. Contact our subscription team to learn more
                  about our discount programs.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-700">
                      Student discount: 50% off any plan
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-700">
                      Educator discount: 30% off any plan
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-700">
                      Non-profit discount: 25% off any plan
                    </span>
                  </div>
                </div>
                <button
                  className="mt-4 bg-news-primary text-white py-2 px-6 rounded-md hover:bg-news-primary-dark transition-colors"
                  aria-label="Apply for special subscription rate">

                  Apply for Special Rate
                </button>
              </div>
            </div>
          </div>
          {/* FAQ Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  How do I cancel my subscription?
                </h3>
                <p className="text-gray-700">
                  You can cancel your subscription at any time by logging into
                  your account and going to the Subscription Management page.
                  Your access will continue until the end of your current
                  billing period.
                </p>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Can I switch between subscription plans?
                </h3>
                <p className="text-gray-700">
                  Yes, you can upgrade or downgrade your subscription at any
                  time. If you upgrade, the new rate will be prorated for your
                  current billing period. If you downgrade, the new rate will
                  take effect at your next billing date.
                </p>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Do you offer a free trial?
                </h3>
                <p className="text-gray-700">
                  Yes, new subscribers can enjoy a 7-day free trial of our
                  Premium Digital plan. You can cancel anytime during the trial
                  period and won't be charged.
                </p>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  How many devices can I use with my subscription?
                </h3>
                <p className="text-gray-700">
                  You can access Day.News on up to 5 devices with a single
                  subscription. This allows you to read on your phone, tablet,
                  and computer without any additional fees.
                </p>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-2">
                  Is there a discount for annual subscriptions?
                </h3>
                <p className="text-gray-700">
                  Yes, you can save approximately 15% by choosing annual billing
                  for any of our subscription plans. This gives you two months
                  free compared to monthly billing.
                </p>
              </div>
            </div>
          </div>
          {/* Customer Support */}
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Our subscription team is available to answer any questions you may
              have about our subscription options or to help with your account.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/contact"
                className="bg-white text-news-primary border border-news-primary px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
                aria-label="Contact customer support">

                Contact Support
              </Link>
              <a
                href="tel:+18005551234"
                className="bg-news-primary text-white px-6 py-3 rounded-md font-medium hover:bg-news-primary-dark transition-colors"
                aria-label="Call customer support at (800) 555-1234">

                Call (800) 555-1234
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>);

};