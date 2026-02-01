import React, { useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { HeroStory } from './HeroStory';
import { EssentialReads } from './EssentialReads';
import { TrendingSection } from './TrendingSection';
import { FeaturedStories } from './FeaturedStories';
import { CommunityVoices } from './CommunityVoices';
import { LocalEventsSection } from './LocalEventsSection';
import { OpinionSection } from './OpinionSection';
import { PhotoGallerySection } from './PhotoGallerySection';
import { MoreNewsSection } from './MoreNewsSection';
export const ScrollableNewspaper = ({ category = null }) => {
  const newspaperRef = useRef(null);
  const scrollToTop = () => {
    newspaperRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  const scrollDown = () => {
    if (newspaperRef.current) {
      newspaperRef.current.scrollBy({
        top: 500,
        behavior: 'smooth'
      });
    }
  };
  return (
    <div className="relative flex flex-col h-full w-full">
      {/* Newspaper container with scrollbar styling */}
      <div
        ref={newspaperRef}
        className="newspaper-container flex-1 bg-gray-100 border border-gray-300 rounded-md overflow-y-auto max-h-[calc(100vh-220px)] md:max-h-[calc(100vh-200px)]"
        style={{
          overflowY: 'auto'
        }}>

        <div className="newspaper-content bg-white p-6 md:p-10">
          {/* Newspaper Header */}
          <div className="text-center mb-8 pb-4 border-b-2 border-news-primary">
            <p className="text-sm text-gray-500 mb-1">Volume 98 • Issue 245</p>
            <h1 className="font-display text-4xl md:text-5xl font-black uppercase mb-2 tracking-tight">
              Today's Newspaper
            </h1>
            <p className="text-sm text-gray-600">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
          {/* Front Page - Top Story */}
          <div className="mb-10">
            <h2 className="font-display text-2xl font-bold text-news-primary border-b-2 border-news-primary inline-block mb-4">
              Front Page
            </h2>
            <HeroStory category={category} fullWidth={true} />
          </div>
          {/* Main Content - Multiple Columns */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
            {/* Left Column */}
            <div className="md:col-span-4 space-y-8">
              <div>
                <h2 className="font-display text-xl font-bold text-news-primary border-b-2 border-news-primary inline-block mb-4">
                  Today's Essential
                </h2>
                <EssentialReads category={category} />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-news-primary border-b-2 border-news-primary inline-block mb-4">
                  Opinion
                </h2>
                <OpinionSection />
              </div>
            </div>
            {/* Middle Column */}
            <div className="md:col-span-4 space-y-8">
              <div>
                <h2 className="font-display text-xl font-bold text-news-primary border-b-2 border-news-primary inline-block mb-4">
                  Trending
                </h2>
                <TrendingSection category={category} />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-news-primary border-b-2 border-news-primary inline-block mb-4">
                  Community Voices
                </h2>
                <CommunityVoices category={category} />
              </div>
            </div>
            {/* Right Column */}
            <div className="md:col-span-4 space-y-8">
              <div>
                <h2 className="font-display text-xl font-bold text-news-primary border-b-2 border-news-primary inline-block mb-4">
                  Featured Stories
                </h2>
                <FeaturedStories category={category} />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-news-primary border-b-2 border-news-primary inline-block mb-4">
                  Local Events
                </h2>
                <LocalEventsSection />
              </div>
            </div>
          </div>
          {/* Photo Gallery Section */}
          <div className="mb-10">
            <h2 className="font-display text-2xl font-bold text-news-primary border-b-2 border-news-primary inline-block mb-4">
              Photo Gallery
            </h2>
            <PhotoGallerySection />
          </div>
          {/* More News Section */}
          <div className="mb-10">
            <h2 className="font-display text-2xl font-bold text-news-primary border-b-2 border-news-primary inline-block mb-4">
              More News
            </h2>
            <MoreNewsSection category={category} />
          </div>
          {/* Newspaper Footer */}
          <div className="text-center mt-16 pt-4 border-t border-gray-300">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Clearwater Day News. All Rights
              Reserved.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              The content of this newspaper is protected by copyright law.
              Reproduction or distribution without permission is prohibited.
            </p>
          </div>
        </div>
      </div>
      {/* Scroll controls */}
      <div className="flex justify-center mt-4 space-x-4">
        <button
          onClick={scrollToTop}
          className="bg-news-primary text-white rounded-full p-2 hover:bg-news-primary-dark transition-colors"
          aria-label="Scroll to top">

          <ChevronUp className="h-5 w-5" />
        </button>
        <button
          onClick={scrollDown}
          className="bg-news-primary text-white rounded-full p-2 hover:bg-news-primary-dark transition-colors"
          aria-label="Scroll down">

          <ChevronDown className="h-5 w-5" />
        </button>
      </div>
    </div>);

};