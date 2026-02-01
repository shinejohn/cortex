import React from 'react';
import { Globe } from 'lucide-react';
export const HeroSection = ({ locationName }) => {
  return (
    <section className="relative bg-news-primary text-white">
      {/* Background collage with overlay */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="grid grid-cols-6 grid-rows-3 h-full">
          {Array.from({
            length: 18
          }).map((_, i) =>
          <div key={i} className="overflow-hidden">
              <img
              src={`https://images.unsplash.com/photo-${1500000000000 + i * 10000}?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80`}
              alt="Community"
              className="w-full h-full object-cover" />

            </div>
          )}
        </div>
      </div>
      {/* Content overlay */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center">
        <Globe className="h-16 w-16 mx-auto mb-6 text-white opacity-80" />
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-6">
          Powered by Community,
          <br />
          Enhanced by AI
        </h1>
        <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
        <p className="text-xl sm:text-2xl max-w-3xl mx-auto font-light mb-10 text-gray-100">
          We're reimagining local news for {locationName} by combining the power
          of community voices with cutting-edge AI technology to keep you
          informed about what matters most.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-white text-news-primary px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">
            Our Mission
          </button>
          <button className="bg-transparent border border-white text-white px-6 py-3 rounded-md font-medium hover:bg-white/10 transition-colors">
            Meet Our Team
          </button>
        </div>
      </div>
      {/* Wave decoration at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 100"
          className="w-full h-auto fill-gray-50">

          <path d="M0,96L80,80C160,64,320,32,480,32C640,32,800,64,960,69.3C1120,75,1280,53,1360,42.7L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
        </svg>
      </div>
    </section>);

};