import React, { useEffect, useState } from 'react';
import {
  MapPin,
  Share2,
  Heart,
  MessageCircle,
  Calendar,
  PlusCircle } from
'lucide-react';
import { StickyNav } from './navigation/StickyNav';
import { HeroSection } from './hero/HeroSection';
import { AnnouncementTypesTabs } from './announcements/AnnouncementTypesTabs';
import { CreateAnnouncementCTA } from './announcements/CreateAnnouncementCTA';
import { AnnouncementCard } from './announcements/AnnouncementCard';
import { FeaturedAnnouncement } from './announcements/FeaturedAnnouncement';
import { MemorialSection } from './announcements/MemorialSection';
import { useLocationDetection } from './location/LocationDetector';
export const AnnouncementsPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Announcements');
  const [activeType, setActiveType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [greeting, setGreeting] = useState('');
  const [activeReaders, setActiveReaders] = useState(247);
  const { locationData } = useLocationDetection();
  // Handle scroll for nav transparency
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  // Set time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Good Morning');
    } else if (hour >= 12 && hour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
    // Simulate fluctuating reader count
    const interval = setInterval(() => {
      setActiveReaders((prev) => Math.floor(Math.random() * 20) - 10 + prev);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };
  const handleMainSectionChange = (section) => {

    // Handle navigation to different main sections
  };const handleTypeChange = (type) => {
    setActiveType(type);
  };
  // Get the city name safely with a default fallback
  const cityName = locationData?.city || 'Clearwater';
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <StickyNav
        scrolled={scrolled}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onMainSectionChange={handleMainSectionChange} />

      <main className="pt-28 overflow-auto">
        <HeroSection
          greeting={greeting}
          location={cityName}
          activeReaders={activeReaders} />

        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Community Announcements
            </h1>
            <div className="relative">
              <input
                type="text"
                placeholder="Search announcements..."
                className="w-64 rounded-full border border-gray-300 bg-white py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-news-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} />

              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor">

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />

                </svg>
              </div>
            </div>
          </div>
          {/* Announcement Types Tabs */}
          <AnnouncementTypesTabs
            activeType={activeType}
            onTypeChange={handleTypeChange} />

          {/* Create Announcement CTA */}
          <CreateAnnouncementCTA />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Main Announcements Feed - 2 columns */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Recent Announcements
              </h2>
              {/* Featured Announcements */}
              <div className="space-y-6 mb-8">
                <FeaturedAnnouncement
                  type="graduation"
                  title="Sarah Johnson Graduates Summa Cum Laude"
                  content="We are proud to announce that our daughter, Sarah Johnson, has graduated from the University of Florida with a Bachelor of Science in Computer Engineering, Summa Cum Laude. Sarah has accepted a position at Microsoft and will be moving to Seattle next month."
                  image="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                  date="August 1, 2023"
                  location={cityName}
                  reactions={{
                    likes: 42,
                    comments: 8
                  }} />

              </div>
              {/* Regular Announcements */}
              <div className="space-y-6">
                <AnnouncementCard
                  type="wedding"
                  title="Mark & Jennifer's Wedding"
                  content="We are thrilled to announce the marriage of Mark Smith and Jennifer Davis on June 15, 2023 at Clearwater Beach. The couple will reside in Dunedin."
                  image="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  date="June 20, 2023"
                  location={cityName}
                  reactions={{
                    likes: 87,
                    comments: 24
                  }} />

                <AnnouncementCard
                  type="birth"
                  title="Welcome Baby Emma!"
                  content="James and Lisa Wilson are pleased to announce the birth of their daughter, Emma Grace Wilson. Born on July 10, 2023, weighing 7lbs 6oz. Mother and baby are doing well."
                  image="https://images.unsplash.com/photo-1519689680058-324335c77eba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  date="July 12, 2023"
                  location="Dunedin, FL"
                  reactions={{
                    likes: 112,
                    comments: 36
                  }} />

                <AnnouncementCard
                  type="engagement"
                  title="Michael & Ashley Engaged"
                  content="Mr. and Mrs. Thomas Brown are pleased to announce the engagement of their daughter, Ashley, to Michael Johnson, son of Mr. and Mrs. Robert Johnson. A fall wedding is planned."
                  image="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  date="May 5, 2023"
                  location="Palm Harbor, FL"
                  reactions={{
                    likes: 65,
                    comments: 18
                  }} />

                <AnnouncementCard
                  type="celebration"
                  title="Jones Family 50th Anniversary"
                  content="The children of Robert and Patricia Jones invite you to celebrate their parents' 50th wedding anniversary on August 20, 2023, at the Dunedin Community Center from 2-5 PM. No gifts please."
                  image="https://images.unsplash.com/photo-1464349153735-7db50ed83c84?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  date="August 1, 2023"
                  location="Dunedin, FL"
                  reactions={{
                    likes: 43,
                    comments: 7
                  }} />

                <AnnouncementCard
                  type="general"
                  title="New Business Opening"
                  content="Coastal Café will be opening its doors on September 1, 2023, at 123 Main Street. Join us for our grand opening celebration with free coffee and pastries from 7-10 AM."
                  image="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  date="August 15, 2023"
                  location={cityName}
                  reactions={{
                    likes: 29,
                    comments: 5
                  }} />

              </div>
              {/* Load More Button */}
              <div className="flex justify-center mt-8">
                <button className="px-6 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark transition-colors">
                  Load More
                </button>
              </div>
            </div>
            {/* Sidebar - 1 column */}
            <div className="space-y-8">
              {/* Memorial Section */}
              <MemorialSection />
              {/* Community Guidelines */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Community Guidelines
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-news-primary mr-2">•</span>
                    <span>
                      Be respectful and considerate in all announcements
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-news-primary mr-2">•</span>
                    <span>Verify information before posting</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-news-primary mr-2">•</span>
                    <span>Obtain permission before posting about others</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-news-primary mr-2">•</span>
                    <span>
                      No promotional content in personal announcements
                    </span>
                  </li>
                </ul>
                <a
                  href="#"
                  className="text-news-primary text-sm font-medium mt-3 inline-block hover:underline">

                  Read full guidelines
                </a>
              </div>
              {/* Calendar of Events */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Upcoming Events
                  </h3>
                  <Calendar className="h-5 w-5 text-news-primary" />
                </div>
                <div className="space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{cityName}</span>
                      <span className="mx-1">•</span>
                      <span>Aug 25</span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Community Cleanup Day
                    </h4>
                  </div>
                  <div className="border-b border-gray-100 pb-3">
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>Dunedin</span>
                      <span className="mx-1">•</span>
                      <span>Sep 3</span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Farmers Market Opening
                    </h4>
                  </div>
                  <div>
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>Palm Harbor</span>
                      <span className="mx-1">•</span>
                      <span>Sep 10</span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Annual Craft Fair
                    </h4>
                  </div>
                </div>
                <a
                  href="#"
                  className="text-news-primary text-sm font-medium mt-4 inline-block hover:underline">

                  View all events
                </a>
              </div>
              {/* Advertisement */}
              <div className="bg-gray-100 rounded-lg p-4 text-center border border-dashed border-gray-300">
                <p className="text-xs text-gray-500 mb-2">Advertisement</p>
                <div className="h-48 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-400">Ad Space</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>);

};