import React from 'react';
import { MapPin, ThermometerIcon, Home } from 'lucide-react';
export const ArticleHeader = ({ scrolled, readingProgress }) => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* Reading progress indicator */}
      <div className="h-1 bg-gray-200 w-full">
        <div
          className="h-full bg-community-green transition-all duration-300"
          style={{
            width: `${readingProgress * 100}%`
          }}>
        </div>
      </div>
      {/* Community bar - dark navy background */}
      <div
        className={`bg-news-primary text-white py-1 transition-all duration-300 ${scrolled ? 'h-0 overflow-hidden opacity-0' : 'h-auto opacity-100'}`}>

        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center">
              <MapPin className="h-3 w-3 mr-1" />
              <span>Clearwater, FL</span>
              <span className="mx-2">•</span>
              <div className="flex items-center">
                <ThermometerIcon className="h-3 w-3 mr-1" />
                <span>78°F Sunny</span>
              </div>
            </div>
            <div>Saturday, August 2, 2024</div>
          </div>
        </div>
      </div>
      {/* Main header - white background */}
      <div
        className={`bg-white border-b border-gray-200 transition-all duration-300 ${scrolled ? 'h-0 overflow-hidden opacity-0' : 'h-auto opacity-100 py-4'}`}>

        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight text-news-primary">
            Day.News Clearwater
          </h1>
          <p className="text-sm text-gray-600 italic">
            "Your Community, Your News"
          </p>
        </div>
      </div>
      {/* Navigation bar - light gray background */}
      <div className="bg-gray-100 border-b border-gray-200 py-2">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-6 overflow-x-auto scrollbar-hide">
            <a
              href="#"
              className="flex items-center text-news-primary font-medium whitespace-nowrap hover:text-news-primary-dark">

              <Home className="h-4 w-4 mr-1" />
              <span>Home</span>
            </a>
            <a
              href="#"
              className="text-gray-700 font-medium whitespace-nowrap hover:text-news-primary">

              News
            </a>
            <a
              href="#"
              className="text-gray-700 font-medium whitespace-nowrap hover:text-news-primary">

              Business
            </a>
            <a
              href="#"
              className="text-gray-700 font-medium whitespace-nowrap hover:text-news-primary">

              Events
            </a>
            <a
              href="#"
              className="text-gray-700 font-medium whitespace-nowrap hover:text-news-primary">

              Government
            </a>
            <a
              href="#"
              className="text-gray-700 font-medium whitespace-nowrap hover:text-news-primary">

              Sports
            </a>
            <a
              href="#"
              className="text-gray-700 font-medium whitespace-nowrap hover:text-news-primary">

              Opinion
            </a>
            <a
              href="#"
              className="text-gray-700 font-medium whitespace-nowrap hover:text-news-primary">

              Life
            </a>
          </nav>
        </div>
      </div>
    </header>);

};