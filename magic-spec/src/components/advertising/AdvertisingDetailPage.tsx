import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Share2,
  Heart,
  MessageCircle,
  Award,
  ThumbsUp,
  Gift,
  Send } from
'lucide-react';
export const AdvertisingDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adType, setAdType] = useState('general');
  const [adId, setAdId] = useState(null);
  const [adData, setAdData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Parse query parameters
    const params = new URLSearchParams(location.search);
    const type = params.get('type');
    const id = params.get('id');
    setAdType(type || 'general');
    setAdId(id ? parseInt(id) : null);
    // Simulate loading ad data
    setLoading(true);
    setTimeout(() => {
      if (type === 'announcement' && id) {
        // Mock data for announcement detail
        setAdData({
          id: parseInt(id),
          type: 'graduation',
          title: 'Sarah Johnson Graduates Summa Cum Laude',
          content:
          'We are proud to announce that our daughter, Sarah Johnson, has graduated from the University of Florida with a Bachelor of Science in Computer Engineering, Summa Cum Laude. Sarah has accepted a position at Microsoft and will be moving to Seattle next month.',
          image:
          'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          date: 'August 1, 2023',
          location: 'Clearwater, FL',
          author: 'John and Mary Johnson',
          reactions: {
            likes: 42,
            comments: 8
          },
          extraInfo:
          'Bachelor of Science in Computer Engineering, Summa Cum Laude',
          school: 'University of Florida, Class of 2023'
        });
      } else {
        // Default ad data
        setAdData({
          id: 1,
          title: 'Advertise with Clearwater Day News',
          content:
          'Reach thousands of local readers with our targeted advertising solutions. Our platform offers various options to showcase your business or announcement to the Clearwater community.',
          image:
          'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
          options: [
          {
            name: 'Business Directory Listing',
            price: '$99/month'
          },
          {
            name: 'Featured Announcement',
            price: '$49'
          },
          {
            name: 'Banner Advertisement',
            price: '$199/week'
          },
          {
            name: 'Newsletter Inclusion',
            price: '$149/edition'
          }]

        });
      }
      setLoading(false);
    }, 500);
  }, [location]);
  const goBack = () => {
    navigate(-1);
  };
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-news-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>);

  }
  // Render announcement detail
  if (adType === 'announcement' && adData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={goBack}
          className="flex items-center text-news-primary mb-6 hover:underline">

          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Announcements
        </button>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div
            className={`px-4 py-3 flex items-center bg-blue-50 border-l-4 border-blue-400`}>

            <span className="mr-2 text-xl">🎓</span>
            <span className={`text-sm font-medium text-blue-700`}>
              Graduation Announcement
            </span>
          </div>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {adData.title}
            </h1>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-2/5">
                <img
                  src={adData.image}
                  alt={adData.title}
                  className="w-full h-auto rounded-lg shadow-sm" />

              </div>
              <div className="w-full md:w-3/5">
                <div className="flex items-center text-sm text-gray-500 mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{adData.location}</span>
                  <span className="mx-2">•</span>
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{adData.date}</span>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-100">
                  <div className="flex items-center">
                    <Award className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">
                      {adData.extraInfo}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-blue-700">
                    {adData.school}
                  </div>
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  {adData.content}
                </p>
                <div className="text-sm text-gray-600 mb-4">
                  Posted by:{' '}
                  <span className="font-medium">{adData.author}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <div className="flex items-center space-x-4">
                    <button className="flex items-center text-gray-500 hover:text-blue-600">
                      <Heart className="h-5 w-5 mr-1" />
                      <span>{adData.reactions.likes}</span>
                    </button>
                    <button className="flex items-center text-gray-500 hover:text-news-primary">
                      <MessageCircle className="h-5 w-5 mr-1" />
                      <span>{adData.reactions.comments}</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center text-gray-500 hover:text-blue-600 px-3 py-1.5 rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200">
                      <Share2 className="h-5 w-5 mr-1.5" />
                      <span>Share</span>
                    </button>
                    <button className="flex items-center text-green-600 hover:text-green-700 px-3 py-1.5 rounded-md hover:bg-green-50 border border-transparent hover:border-green-200">
                      <ThumbsUp className="h-5 w-5 mr-1.5" />
                      <span>Congratulate</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>);

  }
  // Render general advertising page
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Advertising Opportunities
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {adData.title}
            </h2>
            <img
              src={adData.image}
              alt="Advertising"
              className="w-full h-64 object-cover rounded-lg mb-6" />

            <p className="text-gray-700 mb-6 leading-relaxed">
              {adData.content}
            </p>
            <h3 className="text-xl font-bold mb-4 text-gray-900">
              Our Advertising Options
            </h3>
            <div className="space-y-4">
              {adData.options.map((option, index) =>
              <div
                key={index}
                className="flex justify-between items-center border-b border-gray-100 pb-3">

                  <div>
                    <h4 className="font-medium text-gray-900">{option.name}</h4>
                    <p className="text-sm text-gray-600">
                      Starting at {option.price}
                    </p>
                  </div>
                  <button className="bg-news-primary text-white px-4 py-2 rounded-md text-sm hover:bg-news-primary-dark transition-colors">
                    Learn More
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Why Advertise With Us?
            </h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-news-primary mr-2 font-bold">•</span>
                <span>
                  Reach over 50,000 local readers in the Clearwater area
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-news-primary mr-2 font-bold">•</span>
                <span>
                  Targeted advertising to specific demographics and interests
                </span>
              </li>
              <li className="flex items-start">
                <span className="text-news-primary mr-2 font-bold">•</span>
                <span>Multiple format options to suit your business needs</span>
              </li>
              <li className="flex items-start">
                <span className="text-news-primary mr-2 font-bold">•</span>
                <span>Affordable rates with flexible payment options</span>
              </li>
              <li className="flex items-start">
                <span className="text-news-primary mr-2 font-bold">•</span>
                <span>Professional design assistance available</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Contact Our Ad Team
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary"
                  placeholder="Enter your name" />

              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary"
                  placeholder="Enter your email" />

              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary"
                  placeholder="Enter your phone number" />

              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  I'm interested in:
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary">
                  <option>Business Directory Listing</option>
                  <option>Featured Announcement</option>
                  <option>Banner Advertisement</option>
                  <option>Newsletter Inclusion</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary h-32"
                  placeholder="Tell us about your advertising needs">
                </textarea>
              </div>
              <button className="w-full bg-news-primary text-white py-2 rounded-md hover:bg-news-primary-dark transition-colors">
                Submit Inquiry
              </button>
            </form>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Questions? Call our ad team directly:
            </p>
            <p className="text-xl font-bold text-news-primary">
              (727) 555-0123
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Monday-Friday, 9am-5pm ET
            </p>
          </div>
        </div>
      </div>
    </div>);

};