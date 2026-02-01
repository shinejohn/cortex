import React from 'react';
import { MapPin, Clock } from 'lucide-react';
export const ArticleRelated = ({ onAdClick }) => {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-news-primary mb-6 flex items-center">
        <svg
          className="h-5 w-5 mr-2 text-news-primary"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2">

          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        MORE FROM CLEARWATER
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Related Story */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-48 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              alt="Clearwater Beach"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />

          </div>
          <div className="p-4">
            <div className="text-xs text-news-primary font-medium mb-2">
              RELATED STORY
            </div>
            <h3 className="font-display font-bold text-gray-900 mb-2 line-clamp-2">
              Clearwater Receives $3.2M Federal Grant for Beach Restoration
              Project
            </h3>
            <div className="flex items-center text-xs text-gray-500 mb-3">
              <MapPin className="h-3 w-3 mr-1" />
              <span>Clearwater Beach</span>
              <span className="mx-2">•</span>
              <Clock className="h-3 w-3 mr-1" />
              <span>3 min read</span>
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
              The City of Clearwater has been awarded a $3.2 million federal
              grant to fund a major beach restoration project aimed at combating
              erosion and protecting coastal infrastructure.
            </p>
            <div className="flex items-center">
              <div className="h-6 w-6 bg-gray-200 rounded-full overflow-hidden mr-2">
                <img
                  src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80"
                  alt="Author"
                  className="h-full w-full object-cover" />

              </div>
              <span className="text-xs text-gray-700">By Robert Taylor</span>
            </div>
          </div>
        </div>
        {/* Popular Today */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-48 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1504173010664-32509aeebb62?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              alt="School Classroom"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />

          </div>
          <div className="p-4">
            <div className="text-xs text-breaking-red font-medium mb-2">
              POPULAR TODAY
            </div>
            <h3 className="font-display font-bold text-gray-900 mb-2 line-clamp-2">
              Pinellas County Schools Announce New Start Times for 2025 Academic
              Year
            </h3>
            <div className="flex items-center text-xs text-gray-500 mb-3">
              <MapPin className="h-3 w-3 mr-1" />
              <span>Pinellas County</span>
              <span className="mx-2">•</span>
              <Clock className="h-3 w-3 mr-1" />
              <span>4 min read</span>
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
              The Pinellas County School Board has approved changes to school
              start times for the 2025-2026 academic year, citing research on
              adolescent sleep patterns and academic performance.
            </p>
            <div className="flex items-center">
              <div className="h-6 w-6 bg-gray-200 rounded-full overflow-hidden mr-2">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80"
                  alt="Author"
                  className="h-full w-full object-cover" />

              </div>
              <span className="text-xs text-gray-700">By Jennifer Adams</span>
            </div>
          </div>
        </div>
        {/* Latest News */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-48 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
              alt="Festival"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />

          </div>
          <div className="p-4">
            <div className="text-xs text-community-green font-medium mb-2">
              LATEST NEWS
            </div>
            <h3 className="font-display font-bold text-gray-900 mb-2 line-clamp-2">
              Downtown Art Festival Returns This Weekend With Over 200 Artists
            </h3>
            <div className="flex items-center text-xs text-gray-500 mb-3">
              <MapPin className="h-3 w-3 mr-1" />
              <span>Downtown</span>
              <span className="mx-2">•</span>
              <Clock className="h-3 w-3 mr-1" />
              <span>2 min read</span>
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
              The annual Clearwater Downtown Art Festival returns this weekend,
              featuring works from more than 200 artists, live music, food
              vendors, and interactive exhibits for all ages.
            </p>
            <div className="flex items-center">
              <div className="h-6 w-6 bg-gray-200 rounded-full overflow-hidden mr-2">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=80&q=80"
                  alt="Author"
                  className="h-full w-full object-cover" />

              </div>
              <span className="text-xs text-gray-700">
                By Michael Rodriguez
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Newsletter Signup */}
      <div className="bg-gray-100 rounded-lg p-8 mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="font-display text-xl font-bold text-gray-900 mb-3">
            Get Clearwater's top stories delivered daily
          </h3>
          <p className="text-gray-600 mb-6">
            Stay informed with the latest news, events, and updates from your
            community.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-news-primary" />

            <button className="bg-news-primary text-white px-6 py-3 rounded-md font-medium hover:bg-news-primary-dark transition-colors">
              Subscribe
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            By subscribing, you agree to our Privacy Policy and Terms of
            Service.
          </p>
        </div>
      </div>
      {/* Full Width Advertisement */}
      <div className="mb-12">
        <div className="text-xs text-gray-400 text-center mb-1">
          ADVERTISEMENT
        </div>
        <div
          className="bg-gray-200 h-24 rounded flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-300 transition-colors"
          onClick={() => onAdClick && onAdClick('advertisingDetail')}>

          728x90 Leaderboard Ad
        </div>
      </div>
    </div>);

};