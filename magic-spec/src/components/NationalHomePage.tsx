import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from './hero/HeroSection';
import { CategoryTabs } from './CategoryTabs';
import { MarketplaceSection } from './MarketplaceSection';
import { AnnouncementsSection } from './AnnouncementsSection';
import { AdvertisingColumn } from './AdvertisingColumn';
import { ScrollableNewspaper } from './content/ScrollableNewspaper';
import { HeroStory } from './content/HeroStory';
import { EssentialReads } from './content/EssentialReads';
import { FeaturedStories } from './content/FeaturedStories';
import { PhotoGallerySection } from './content/PhotoGallerySection';
import { TrendingSection } from './content/TrendingSection';
import { CommunityVoices } from './content/CommunityVoices';
import { LocalEventsSection } from './content/LocalEventsSection';
import { OpinionSection } from './content/OpinionSection';
import { MoreNewsSection } from './content/MoreNewsSection';
import { ArticleDetailPage } from './article/ArticleDetailPage';
import { MarketplacePreview } from './previews/MarketplacePreview';
import { CouponsPreview } from './previews/CouponsPreview';
import { EventsPreview } from './previews/EventsPreview';
import { LegalNoticesPreview } from './previews/LegalNoticesPreview';
import { useLocationDetection } from './location/LocationDetector';
import { NationalNewsMasthead } from './navigation/NationalNewsMasthead';
export const NationalHomePage = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [activeReaders, setActiveReaders] = useState(1247);
  const [activeTab, setActiveTab] = useState('News');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showNewspaperView, setShowNewspaperView] = useState(false);
  const [showArticleDetail, setShowArticleDetail] = useState(false);
  const { locationData } = useLocationDetection();
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
  // Function to handle category selection
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    // Ensure we're in the News tab when selecting a category
    setActiveTab('News');
    setShowArticleDetail(false);
  };
  // Function to handle ad clicks
  const handleAdClick = (page) => {
    if (page) {
      navigate(`/${page}`);
    }
  };
  // Toggle between regular view and newspaper view
  const toggleNewspaperView = () => {
    setShowNewspaperView(!showNewspaperView);
    setShowArticleDetail(false);
    // Scroll to top when toggling view
    window.scrollTo(0, 0);
  };
  // Function to show article detail page
  const handleShowArticleDetail = () => {
    setShowArticleDetail(true);
    // Scroll to top when showing article detail
    window.scrollTo(0, 0);
  };
  // Override the default categories for national news
  const nationalNewsCategories = ['Politics', 'Economy', 'Health', 'Technology'];
  const additionalNationalCategories = [
  'International',
  'Science',
  'Education',
  'Entertainment',
  'Environment',
  'Sports',
  'Defense',
  'Justice'];

  return (
    <div className="min-h-screen bg-bg-primary w-full overflow-x-hidden">
      {/* Custom National News Masthead */}
      <NationalNewsMasthead />
      <main className="overflow-auto">
        {!showArticleDetail &&
        <HeroSection
          greeting={greeting}
          location="National"
          activeReaders={activeReaders}
          isNational={true} />

        }
        <div className="container mx-auto px-4 py-4">
          {showArticleDetail ?
          <ArticleDetailPage isNational={true} /> :

          <>
              <div className="flex items-center justify-between mb-6">
                <div className="border-b border-gray-200">
                  <CategoryTabs
                  activeCategory={selectedCategory}
                  onCategorySelect={handleCategorySelect}
                  showAllCategories={showAllCategories}
                  toggleAllCategories={() =>
                  setShowAllCategories(!showAllCategories)
                  }
                  categories={nationalNewsCategories}
                  additionalCategories={additionalNationalCategories} />

                </div>
                <div className="flex space-x-3">
                  <button
                  onClick={handleShowArticleDetail}
                  className="bg-news-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-news-primary-dark transition-colors">

                    View Article
                  </button>
                  <button
                  onClick={toggleNewspaperView}
                  className="bg-news-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-news-primary-dark transition-colors">

                    {showNewspaperView ? 'Regular View' : 'Newspaper View'}
                  </button>
                </div>
              </div>
              {showNewspaperView ?
            <ScrollableNewspaper
              category={selectedCategory}
              isNational={true} /> :


            <>
                  <div className="grid grid-cols-12 gap-4 md:gap-8">
                    {/* Left news column - 5 columns */}
                    <div className="col-span-12 md:col-span-5 space-y-8">
                      <HeroStory
                    category={selectedCategory}
                    onArticleClick={handleShowArticleDetail}
                    isNational={true} />

                      <section>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="font-display text-xl font-bold text-news-primary border-b-2 border-news-primary inline-block">
                            Today's Essential Reads
                          </h2>
                        </div>
                        <EssentialReads
                      category={selectedCategory}
                      onArticleClick={handleShowArticleDetail}
                      isNational={true} />

                      </section>
                      <section>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="font-display text-xl font-bold text-news-primary border-b-2 border-news-primary inline-block">
                            Featured Stories
                          </h2>
                        </div>
                        <FeaturedStories
                      category={selectedCategory}
                      onArticleClick={handleShowArticleDetail}
                      isNational={true} />

                      </section>
                      <section>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="font-display text-xl font-bold text-news-primary border-b-2 border-news-primary inline-block">
                            Photo Gallery
                          </h2>
                          <p className="text-sm text-gray-500">
                            From {locationData?.city || 'Clearwater'}
                          </p>
                        </div>
                        <PhotoGallerySection />
                      </section>
                    </div>
                    {/* Right news column - 5 columns */}
                    <div className="col-span-12 md:col-span-5 space-y-8">
                      <section>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="font-display text-xl font-bold text-news-primary border-b-2 border-news-primary inline-block">
                            Trending Nationally
                          </h2>
                        </div>
                        <TrendingSection
                      category={selectedCategory}
                      onArticleClick={handleShowArticleDetail}
                      isNational={true} />

                      </section>
                      <section>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="font-display text-xl font-bold text-news-primary border-b-2 border-news-primary inline-block">
                            Voices & Opinions
                          </h2>
                        </div>
                        <CommunityVoices
                      category={selectedCategory}
                      onArticleClick={handleShowArticleDetail}
                      isNational={true} />

                      </section>
                      <section>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="font-display text-xl font-bold text-news-primary border-b-2 border-news-primary inline-block">
                            Local Events
                          </h2>
                          <p className="text-sm text-gray-500">
                            In {locationData?.city || 'Clearwater'}
                          </p>
                        </div>
                        <LocalEventsSection />
                      </section>
                      <section>
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="font-display text-xl font-bold text-news-primary border-b-2 border-news-primary inline-block">
                            Opinion
                          </h2>
                        </div>
                        <OpinionSection
                      onArticleClick={handleShowArticleDetail}
                      isNational={true} />

                      </section>
                    </div>
                    {/* Advertising column - 2 columns */}
                    <div className="col-span-12 md:col-span-2 space-y-8">
                      <AdvertisingColumn onAdClick={handleAdClick} />
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-display text-sm font-bold text-news-primary">
                            Local Marketplace
                          </h3>
                          <p className="text-xs text-gray-500">
                            {locationData?.city || 'Clearwater'}
                          </p>
                        </div>
                        <MarketplaceSection />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-display text-sm font-bold text-news-primary">
                            Local Announcements
                          </h3>
                          <p className="text-xs text-gray-500">
                            {locationData?.city || 'Clearwater'}
                          </p>
                        </div>
                        <AnnouncementsSection />
                      </div>
                    </div>
                  </div>
                  {/* Full width "More News" section */}
                  <section className="mt-12 mb-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-display text-2xl font-bold text-news-primary">
                        More National News
                      </h2>
                      <a
                    href="#"
                    className="text-sm text-news-primary font-medium">

                        View All
                      </a>
                    </div>
                    <MoreNewsSection
                  category={selectedCategory}
                  onArticleClick={handleShowArticleDetail}
                  isNational={true} />

                  </section>
                  {/* Preview Sections */}
                  <div className="mt-16 space-y-16">
                    {/* Marketplace Preview */}
                    <section>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="font-display text-2xl font-bold text-news-primary">
                          {locationData?.city || 'Clearwater'} Marketplace
                        </h2>
                        <button
                      className="text-sm text-news-primary font-medium flex items-center"
                      onClick={() => handleAdClick('marketplace')}>

                          View All
                        </button>
                      </div>
                      <MarketplacePreview
                    onViewAll={() => handleAdClick('marketplace')}
                    onAdClick={handleAdClick} />

                    </section>
                    {/* Coupons Preview */}
                    <section>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="font-display text-2xl font-bold text-news-primary">
                          Local Coupons & Deals
                        </h2>
                        <button
                      className="text-sm text-news-primary font-medium flex items-center"
                      onClick={() => handleAdClick('coupons')}>

                          View All
                        </button>
                      </div>
                      <CouponsPreview
                    onViewAll={() => handleAdClick('coupons')} />

                    </section>
                    {/* Events Preview */}
                    <section>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="font-display text-2xl font-bold text-news-primary">
                          {locationData?.city || 'Clearwater'} Upcoming Events
                        </h2>
                        <button
                      className="text-sm text-news-primary font-medium flex items-center"
                      onClick={() => handleAdClick('eventsCalendar')}>

                          View All
                        </button>
                      </div>
                      <EventsPreview
                    onViewAll={() => handleAdClick('eventsCalendar')} />

                    </section>
                    {/* Legal Notices Preview */}
                    <section>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="font-display text-2xl font-bold text-news-primary">
                          Local Legal Notices
                        </h2>
                        <button
                      className="text-sm text-news-primary font-medium flex items-center"
                      onClick={() => handleAdClick('legalNoticesList')}>

                          View All
                        </button>
                      </div>
                      <LegalNoticesPreview
                    onViewAll={() => handleAdClick('legalNoticesList')}
                    onNoticeClick={(noticeId) =>
                    navigate('/legalNoticeDetail')
                    } />

                    </section>
                  </div>
                  {/* Newsletter subscription */}
                  <section className="my-16 bg-news-primary-light bg-opacity-10 rounded-lg p-8">
                    <div className="max-w-3xl mx-auto text-center">
                      <h2 className="font-display text-2xl font-bold text-news-primary mb-3">
                        Stay Updated with National Day News
                      </h2>
                      <p className="text-gray-600 mb-6">
                        Get the latest national news, politics, and updates
                        delivered straight to your inbox.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                        <input
                      type="email"
                      placeholder="Your email address"
                      className="flex-1 px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-news-primary" />

                        <button
                      onClick={() => {
                        alert('Thank you for subscribing!');
                        // In a real app, this would submit the form
                      }}
                      className="bg-news-primary text-white px-6 py-3 rounded-md font-medium hover:bg-news-primary-dark transition-colors">

                          Subscribe
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-4">
                        By subscribing, you agree to our Privacy Policy and
                        Terms of Service.
                      </p>
                    </div>
                  </section>
                </>
            }
            </>
          }
        </div>
      </main>
    </div>);

};