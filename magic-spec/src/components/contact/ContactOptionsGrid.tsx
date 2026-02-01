import React from 'react';
import { Mail, MessageCircle, Phone, MapPin, Clock } from 'lucide-react';
export const ContactOptionsGrid = ({ onStartChat }) => {
  return (
    <section>
      <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
        Get in Touch
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Option */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-gray-900">Email Us</h3>
              <p className="text-gray-600 mb-3">
                Send us a message and we'll respond within 24 hours
              </p>
              <a
                href="mailto:contact@day.news"
                className="text-news-primary font-medium hover:underline">

                contact@day.news
              </a>
              <div className="mt-3 flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>Response time: 24 hours</span>
              </div>
            </div>
          </div>
        </div>
        {/* Live Chat Option */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-gray-900">Live Chat</h3>
              <p className="text-gray-600 mb-3">
                Chat with our support team in real-time
              </p>
              <button
                onClick={onStartChat}
                className="bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700 transition-colors">

                Start Chat
              </button>
              <div className="mt-3 flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>Available: 8am-8pm ET, Mon-Fri</span>
              </div>
            </div>
          </div>
        </div>
        {/* Phone Option */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Phone className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-gray-900">Call Us</h3>
              <p className="text-gray-600 mb-3">
                Speak directly with our support team
              </p>
              <a
                href="tel:+18005551234"
                className="text-news-primary font-medium hover:underline">

                (800) 555-1234
              </a>
              <div className="mt-3 flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>Hours: 9am-5pm ET, Mon-Fri</span>
              </div>
            </div>
          </div>
        </div>
        {/* Visit Option */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <MapPin className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-bold text-gray-900">
                Visit Our Office
              </h3>
              <p className="text-gray-600 mb-3">
                Schedule an in-person meeting at our local office
              </p>
              <button className="bg-news-primary text-white px-4 py-2 rounded-md font-medium hover:bg-news-primary-dark transition-colors">
                Schedule a Visit
              </button>
              <div className="mt-3 flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>Office hours: 9am-5pm ET, Mon-Fri</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>);

};