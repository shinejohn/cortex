import React, { useState } from 'react';
import {
  ChevronLeft,
  Calendar,
  MapPin,
  Copy,
  Scissors,
  Share2,
  Bookmark,
  ExternalLink,
  AlertCircle,
  Check,
  Mail,
  Phone,
  Globe,
  Tag,
  Clock,
  Info } from
'lucide-react';
import { PageHeader } from '../PageHeader';
import { useLocationDetection } from '../location/LocationDetector';
export const CouponDetailPage = () => {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const { locationData } = useLocationDetection();
  const city = locationData?.city || 'Clearwater';
  // Sample coupon data - in a real app, this would come from an API or props
  const coupon = {
    id: 1,
    code: 'SUMMER25',
    discount: '25% OFF',
    title: '25% Off Your Entire Purchase',
    business: 'Clearwater Grill & Bar',
    category: 'Restaurant',
    description:
    'Enjoy 25% off your entire purchase at Clearwater Grill & Bar. Valid for dine-in only. Cannot be combined with other offers or promotions.',
    expiryDate: 'September 30, 2025',
    startDate: 'July 1, 2025',
    location: 'Downtown Clearwater',
    address: '123 Beach Drive, Clearwater, FL 33755',
    phone: '(727) 555-1234',
    website: 'www.clearwatergrill.com',
    email: 'info@clearwatergrill.com',
    hours: 'Mon-Sat: 11am-10pm, Sun: 12pm-9pm',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    image:
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    terms: [
    'Valid for dine-in only',
    'Cannot be combined with other offers or promotions',
    'Not valid on holidays',
    'Tax and gratuity not included',
    'One coupon per table',
    'Management reserves the right to modify or cancel promotion at any time'],

    relatedCoupons: [
    {
      id: 2,
      business: 'Beach Boutique',
      discount: '$10 OFF',
      title: '$10 off any purchase of $50 or more',
      expiryDate: 'August 15, 2025',
      logo: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 3,
      business: 'Sunshine Auto Repair',
      discount: 'FREE',
      title: 'Free oil check and tire pressure adjustment',
      expiryDate: 'Ongoing',
      logo: 'https://images.unsplash.com/photo-1498887960847-2a5e46312788?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 4,
      business: 'Coastal Spa',
      discount: '15% OFF',
      title: '15% off any spa service',
      expiryDate: 'December 31, 2025',
      logo: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    }]

  };
  // Handle copy coupon code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  // Handle save coupon
  const handleSave = () => {
    setSaved(!saved);
  };
  // Add navigation function to go back to coupons
  const handleBackToCoupons = () => {
    navigate('/coupons');
  };
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <PageHeader />
      {/* Hero Section */}
      <div className="relative h-64 md:h-80">
        <img
          src={coupon.image}
          alt={coupon.title}
          className="w-full h-full object-cover" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
          <div className="container mx-auto">
            <div className="flex items-center mb-2">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs font-medium">
                {coupon.category.toUpperCase()}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {coupon.title}
            </h1>
            <div className="flex items-center text-white">
              <span className="text-lg">{coupon.business}</span>
              <span className="mx-2">•</span>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  {coupon.location}, {city}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <button
            onClick={() => navigate('/')}
            className="hover:text-news-primary">

            Home
          </button>
          <ChevronLeft className="h-4 w-4 mx-1" />
          <button
            onClick={handleBackToCoupons}
            className="hover:text-news-primary">

            Coupons
          </button>
          <ChevronLeft className="h-4 w-4 mx-1" />
          <span className="text-gray-700">{coupon.title}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Coupon Details */}
          <div className="lg:col-span-2">
            {/* Coupon Code Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full overflow-hidden mr-3">
                    <img
                      src={coupon.logo}
                      alt={coupon.business}
                      className="h-full w-full object-cover" />

                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {coupon.business}
                    </h2>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>
                        {coupon.location}, {city}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-100 text-yellow-800 font-bold px-3 py-1 rounded-md text-lg">
                  {coupon.discount}
                </div>
              </div>
              <div className="mb-6">
                <p className="text-gray-700 mb-4">{coupon.description}</p>
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Valid until {coupon.expiryDate}</span>
                </div>
              </div>
              {/* Coupon Code Box */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-500 mb-2">
                  Use this code at checkout:
                </div>
                <div className="flex">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={coupon.code}
                      readOnly
                      className="w-full border border-gray-300 rounded-l-md py-3 px-4 text-gray-900 font-medium bg-white" />

                  </div>
                  <button
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-r-md font-medium transition-colors ${copied ? 'bg-green-600 text-white' : 'bg-news-primary text-white hover:bg-news-primary-dark'}`}
                    onClick={handleCopyCode}>

                    {copied ?
                    <>
                        <Check className="h-5 w-5" />
                        <span>Copied!</span>
                      </> :

                    <>
                        <Copy className="h-5 w-5" />
                        <span>Copy</span>
                      </>
                    }
                  </button>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button className="flex-1 bg-news-primary text-white py-3 px-4 rounded-md font-medium hover:bg-news-primary-dark transition-colors">
                  Visit Website
                </button>
                <button
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium transition-colors ${saved ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  onClick={handleSave}>

                  <Bookmark
                    className="h-5 w-5"
                    fill={saved ? 'currentColor' : 'none'} />

                  <span>{saved ? 'Saved' : 'Save'}</span>
                </button>
                <button className="flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <Share2 className="h-5 w-5" />
                  <span>Share</span>
                </button>
              </div>
            </div>
            {/* Terms and Conditions */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Terms & Conditions
              </h2>
              <ul className="space-y-2 mb-4">
                {coupon.terms.map((term, index) =>
                <li key={index} className="flex items-start">
                    <div className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0">
                      •
                    </div>
                    <span className="text-gray-700">{term}</span>
                  </li>
                )}
              </ul>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Present this coupon at time of purchase. Management
                      reserves the right to modify or cancel this promotion at
                      any time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Related Coupons */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                You May Also Like
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {coupon.relatedCoupons.map((relatedCoupon) =>
                <div
                  key={relatedCoupon.id}
                  className="border border-gray-200 rounded-lg overflow-hidden">

                    <div className="p-4">
                      <div className="flex items-center mb-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden mr-2">
                          <img
                          src={relatedCoupon.logo}
                          alt={relatedCoupon.business}
                          className="h-full w-full object-cover" />

                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {relatedCoupon.business}
                          </div>
                          <div className="text-xs text-yellow-600 font-medium">
                            {relatedCoupon.discount}
                          </div>
                        </div>
                      </div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                        {relatedCoupon.title}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Expires: {relatedCoupon.expiryDate}</span>
                      </div>
                      <a
                      href="#"
                      className="text-news-primary text-sm font-medium hover:underline flex items-center">

                        View Coupon
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            {/* Business Info Card */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Business Information
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">Address</div>
                      <div className="text-gray-600 text-sm">
                        {coupon.address}
                      </div>
                      <a
                        href="#map"
                        className="text-news-primary text-sm font-medium hover:underline mt-1 inline-block">

                        View Map
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">Phone</div>
                      <a
                        href={`tel:${coupon.phone}`}
                        className="text-news-primary hover:underline text-sm">

                        {coupon.phone}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">Email</div>
                      <a
                        href={`mailto:${coupon.email}`}
                        className="text-news-primary hover:underline text-sm">

                        {coupon.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Globe className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">Website</div>
                      <a
                        href={`https://${coupon.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-news-primary hover:underline text-sm">

                        {coupon.website}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">
                        Business Hours
                      </div>
                      <div className="text-gray-600 text-sm">
                        {coupon.hours}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Map Placeholder */}
              <div id="map" className="h-48 bg-gray-200 relative">
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  Interactive Map Would Appear Here
                </div>
              </div>
            </div>
            {/* Coupon Details Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Coupon Details
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Tag className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">Discount</div>
                    <div className="text-gray-600 text-sm">
                      {coupon.discount} your entire purchase
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">
                      Valid Period
                    </div>
                    <div className="text-gray-600 text-sm">
                      {coupon.startDate} - {coupon.expiryDate}
                    </div>
                  </div>
                </div>
                <div className="flex items-start">
                  <Scissors className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">Redemption</div>
                    <div className="text-gray-600 text-sm">
                      Show coupon or mention code at checkout
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Share Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Share This Coupon
              </h2>
              <div className="flex space-x-3">
                <button
                  onClick={() => alert('Shared on Facebook')}
                  className="bg-[#1877F2] text-white p-2 rounded-full hover:bg-opacity-90">

                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor">

                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button
                  onClick={() => alert('Shared on Twitter')}
                  className="bg-[#1DA1F2] text-white p-2 rounded-full hover:bg-opacity-90">

                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor">

                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    window.location.href = `mailto:?subject=Check out this coupon&body=Use code ${coupon.code}`;
                  }}
                  className="bg-gray-800 text-white p-2 rounded-full hover:bg-opacity-90">

                  <Mail className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                  }}
                  className="bg-news-primary text-white p-2 rounded-full hover:bg-opacity-90">

                  <Share2 className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4">
                <button
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  onClick={handleCopyCode}>

                  <Copy className="h-5 w-5" />
                  <span>Copy Coupon Code</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Report Section */}
        <div className="mt-8 text-center">
          <button
            onClick={() =>
            alert(
              'Thank you for reporting this coupon. Our team will review it.'
            )
            }
            className="flex items-center justify-center mx-auto text-gray-500 hover:text-gray-700">

            <AlertCircle className="h-4 w-4 mr-1" />
            <span className="text-sm">Report this coupon</span>
          </button>
        </div>
      </div>
    </div>);

};