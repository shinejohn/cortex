import React from 'react';
import { useLocationDetection } from '../location/LocationDetector';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Rss,
  Mail,
  Phone,
  MapPin } from
'lucide-react';
import { Link } from 'react-router-dom';
export const Footer = ({ currentPage = '' }) => {
  const { locationData } = useLocationDetection();
  const city = locationData?.city || 'Clearwater';
  const state = locationData?.state || 'Florida';
  return (
    <footer className="bg-white text-gray-900">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div>
            <h3 className="font-display text-xl font-bold mb-4">
              {city} Day News
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              {state} County's Trusted News Source Since 2025
            </p>
            <div className="flex flex-col space-y-2 text-sm text-gray-700">
              <div className="flex items-start">
                <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  123 Main Street, {city}, {state} 33755
                </span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                <a
                  href="tel:+17275551234"
                  className="hover:text-gray-900 transition-colors">

                  (727) 555-1234
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                <a
                  href="mailto:contact@day.news"
                  className="hover:text-gray-900 transition-colors">

                  contact@day.news
                </a>
              </div>
            </div>
          </div>
          {/* Column 2: Sections */}
          <div>
            <h4 className="font-bold mb-4">Sections</h4>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li>
                <Link to="/" className="hover:text-gray-900 transition-colors">
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
                  to="/sports"
                  className="hover:text-gray-900 transition-colors">

                  Sports
                </Link>
              </li>
              <li>
                <Link
                  to="/life"
                  className="hover:text-gray-900 transition-colors">

                  Life
                </Link>
              </li>
              <li>
                <Link
                  to="/opinion"
                  className="hover:text-gray-900 transition-colors">

                  Opinion
                </Link>
              </li>
              <li>
                <Link
                  to="/eventsCalendar"
                  className="hover:text-gray-900 transition-colors">

                  Events
                </Link>
              </li>
              <li>
                <Link
                  to="/classifieds"
                  className="hover:text-gray-900 transition-colors">

                  Classifieds
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
              <li>
                <Link
                  to="/advertisingDetail"
                  className="hover:text-gray-900 transition-colors">

                  Advertise
                </Link>
              </li>
              <li>
                <Link
                  to="/ethics-policy"
                  className="hover:text-gray-900 transition-colors">

                  Ethics Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/subscription-options"
                  className="hover:text-gray-900 transition-colors">

                  Subscription Options
                </Link>
              </li>
              <li>
                <Link
                  to="/newsroom"
                  className="hover:text-gray-900 transition-colors">

                  Newsroom
                </Link>
              </li>
            </ul>
          </div>
          {/* Column 4: Connect & Subscribe */}
          <div>
            <h4 className="font-bold mb-4">Connect</h4>
            <div className="flex space-x-3 mb-6">
              <a
                href="https://facebook.com/daynews"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-200 hover:bg-gray-300 transition-colors p-2 rounded-full"
                aria-label="Facebook">

                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/daynews"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-200 hover:bg-gray-300 transition-colors p-2 rounded-full"
                aria-label="Twitter">

                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/daynews"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-200 hover:bg-gray-300 transition-colors p-2 rounded-full"
                aria-label="Instagram">

                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com/daynews"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-200 hover:bg-gray-300 transition-colors p-2 rounded-full"
                aria-label="YouTube">

                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="/rss"
                className="bg-gray-200 hover:bg-gray-300 transition-colors p-2 rounded-full"
                aria-label="RSS Feed">

                <Rss className="h-5 w-5" />
              </a>
            </div>
            <h4 className="font-bold mb-3">Newsletter</h4>
            <p className="text-sm text-gray-700 mb-3">
              Stay updated with local news, events, and more.
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-news-primary text-gray-900 placeholder-gray-500" />

              <button className="bg-news-primary text-white px-3 py-2 text-sm font-medium rounded-r-md hover:bg-news-primary-dark transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Bottom footer bar */}
      <div className="border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Fibonacco, Inc. All Rights Reserved.
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
              <Link
                to="/cookie-policy"
                className="hover:text-gray-900 transition-colors">

                Cookie Policy
              </Link>
              <Link
                to="/accessibility"
                className="hover:text-gray-900 transition-colors">

                Accessibility
              </Link>
              <Link
                to="/do-not-sell-my-information"
                className="hover:text-gray-900 transition-colors">

                Do Not Sell My Information
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>);

};