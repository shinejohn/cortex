import React, { useEffect, useState, memo } from 'react';
// ssr-csr=ssr
// mockdata=yes
// mockdataon=yes

import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Share2,
  Heart,
  MessageCircle,
  Calendar,
  PlusCircle,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ExternalLink,
  TrendingUp,
  Users } from
'lucide-react';
import { useLocationDetection } from '../location/LocationDetector';
export const TrendingPage = () => {
  const navigate = useNavigate();
  const { locationData } = useLocationDetection();
  const [scrolled, setScrolled] = useState(false);
  const [activeReaders, setActiveReaders] = useState(247);
  const [timePeriod, setTimePeriod] = useState('now');
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [trendingStories, setTrendingStories] = useState([]);
  const [trendingCategories, setTrendingCategories] = useState([]);
  const [communityPulseData, setCommunityPulseData] = useState({});
  const [trendingPeople, setTrendingPeople] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Trending');
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
  // Simulate fetching trending data
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call delay
    const timer = setTimeout(() => {
      // Generate mock data based on time period
      const data = generateMockTrendingData(timePeriod);
      setTrendingTopics(data.topics || []);
      setTrendingStories(data.stories || []);
      setTrendingCategories(data.categories || []);
      setCommunityPulseData(data.communityPulse || {});
      setTrendingPeople(data.people || []);
      setActiveReaders(data.activeUsers || 0);
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [timePeriod]);
  // Handle time period change
  const handleTimePeriodChange = (period) => {
    setTimePeriod(period);
  };
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
  };
  const handleMainSectionChange = (section) => {

    // Handle section changes
  }; // Placeholder components for the missing components
  const TrendingNowLive = ({ topics, timePeriod }) =>
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-4">Trending Topics</h2>
      <div className="space-y-2">
        {topics?.map((topic, index) =>
      <div
        key={index}
        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">

            <span>{topic.name}</span>
            <span className="text-sm text-gray-500">
              {topic.count} mentions
            </span>
          </div>
      )}
      </div>
    </div>;

  const TrendingStoriesGrid = ({ stories, timePeriod }) =>
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-4">Trending Stories</h2>
      <div className="space-y-4">
        {stories?.map((story, index) =>
      <div key={index} className="p-2 hover:bg-gray-50 rounded">
            <h3 className="font-medium">{story.title}</h3>
            <p className="text-sm text-gray-500">{story.snippet}</p>
          </div>
      )}
      </div>
    </div>;

  const CommunityPulse = ({ data, timePeriod }) =>
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-4">Community Pulse</h2>
      <div className="text-sm text-gray-500">
        Community activity visualization
      </div>
    </div>;

  const TrendingCategories = ({ categories, timePeriod }) =>
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-4">Trending Categories</h2>
      <div className="space-y-2">
        {categories?.map((category, index) =>
      <div
        key={index}
        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">

            <span>{category.name}</span>
            <span className="text-sm text-gray-500">
              {category.count} views
            </span>
          </div>
      )}
      </div>
    </div>;

  const TrendingPeople = ({ people, timePeriod }) =>
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold mb-4">Trending People</h2>
      <div className="space-y-2">
        {people?.map((person, index) =>
      <div
        key={index}
        className="flex items-center p-2 hover:bg-gray-50 rounded">

            <div className="w-8 h-8 rounded-full bg-gray-200 mr-2"></div>
            <div>
              <div className="font-medium">{person.name}</div>
              <div className="text-xs text-gray-500">{person.role}</div>
            </div>
          </div>
      )}
      </div>
    </div>;

  // Helper functions for engagement metrics
  const getCommentCount = (timePeriod) => {
    switch (timePeriod) {
      case 'now':
        return '342 this hour';
      case 'today':
        return '1,287 today';
      case 'week':
        return '3,654 this week';
      case 'month':
        return '12,876 this month';
      default:
        return '342 this hour';
    }
  };
  const getShareCount = (timePeriod) => {
    switch (timePeriod) {
      case 'now':
        return '198 this hour';
      case 'today':
        return '876 today';
      case 'week':
        return '2,543 this week';
      case 'month':
        return '8,765 this month';
      default:
        return '198 this hour';
    }
  };
  const getReactionCount = (timePeriod) => {
    switch (timePeriod) {
      case 'now':
        return '765 this hour';
      case 'today':
        return '2,876 today';
      case 'week':
        return '8,765 this week';
      case 'month':
        return '24,321 this month';
      default:
        return '765 this hour';
    }
  };
  const getContributorCount = (timePeriod) => {
    switch (timePeriod) {
      case 'now':
        return '8 this hour';
      case 'today':
        return '32 today';
      case 'week':
        return '87 this week';
      case 'month':
        return '243 this month';
      default:
        return '8 this hour';
    }
  };
  const getPeakTime = (timePeriod) => {
    switch (timePeriod) {
      case 'now':
        return 'Currently active';
      case 'today':
        return '8:00 - 9:00 AM';
      case 'week':
        return 'Weekdays 8-9 AM';
      case 'month':
        return 'Weekday mornings';
      default:
        return 'Currently active';
    }
  };
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      <main className="pt-4 overflow-auto">
        <div className="mx-auto max-w-7xl px-4 py-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  <TrendingUp className="h-8 w-8 mr-2 text-news-primary" />
                  Trending in {locationData?.city || 'Clearwater'}
                </h1>
                <p className="text-gray-600">
                  What your neighbors are talking about right now
                </p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center">
                <div className="flex items-center text-sm text-gray-600 mr-6">
                  <Users className="h-4 w-4 mr-1.5" />
                  <span>{activeReaders} people exploring trends</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-1.5" />
                  <span>Updated just now</span>
                </div>
              </div>
            </div>
          </div>

          {/* Time Period Toggle */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1.5 inline-flex">
              <button
                onClick={() => handleTimePeriodChange('now')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${timePeriod === 'now' ? 'bg-news-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>

                Now
              </button>
              <button
                onClick={() => handleTimePeriodChange('today')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${timePeriod === 'today' ? 'bg-news-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>

                Today
              </button>
              <button
                onClick={() => handleTimePeriodChange('week')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${timePeriod === 'week' ? 'bg-news-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>

                This Week
              </button>
              <button
                onClick={() => handleTimePeriodChange('month')}
                className={`px-4 py-2 text-sm font-medium rounded-md ${timePeriod === 'month' ? 'bg-news-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>

                This Month
              </button>
            </div>
          </div>

          {isLoading ?
          // Loading state
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-64 animate-pulse"></div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-96 animate-pulse"></div>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-64 animate-pulse"></div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-64 animate-pulse"></div>
              </div>
            </div> :

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main content - 2 columns */}
              <div className="lg:col-span-2 space-y-6">
                {/* Trending Now - Live */}
                <TrendingNowLive
                topics={trendingTopics}
                timePeriod={timePeriod} />

                {/* Trending Stories Grid */}
                <TrendingStoriesGrid
                stories={trendingStories}
                timePeriod={timePeriod} />

                {/* Community Pulse */}
                <CommunityPulse
                data={communityPulseData}
                timePeriod={timePeriod} />

              </div>
              {/* Sidebar - 1 column */}
              <div className="space-y-6">
                {/* Trending Categories */}
                <TrendingCategories
                categories={trendingCategories}
                timePeriod={timePeriod} />

                {/* Trending People */}
                <TrendingPeople
                people={trendingPeople}
                timePeriod={timePeriod} />

                {/* Engagement Summary */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-900 flex items-center">
                      <Share2 className="h-5 w-5 mr-2 text-news-primary" />
                      Community Engagement
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">
                            Comments
                          </span>
                          <span className="text-sm font-medium">
                            {getCommentCount(timePeriod)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: '78%'
                          }}>
                        </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">Shares</span>
                          <span className="text-sm font-medium">
                            {getShareCount(timePeriod)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: '65%'
                          }}>
                        </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">
                            Reactions
                          </span>
                          <span className="text-sm font-medium">
                            {getReactionCount(timePeriod)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div
                          className="h-full bg-yellow-500 rounded-full"
                          style={{
                            width: '82%'
                          }}>
                        </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">
                            New Contributors
                          </span>
                          <span className="text-sm font-medium">
                            {getContributorCount(timePeriod)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full">
                          <div
                          className="h-full bg-purple-500 rounded-full"
                          style={{
                            width: '42%'
                          }}>
                        </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          Peak Activity Time
                        </div>
                        <div className="text-sm font-medium">
                          {getPeakTime(timePeriod)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </main>
    </div>);

};
// Helper function to generate mock trending data
const generateMockTrendingData = (timePeriod) => {
  // Generate topics based on time period
  const topics = [
  {
    id: 1,
    name: 'Downtown Development',
    count:
    timePeriod === 'now' ?
    68 :
    timePeriod === 'today' ?
    245 :
    timePeriod === 'week' ?
    876 :
    2341,
    momentum: 0.8,
    direction: 'up',
    velocity: 12
  },
  {
    id: 2,
    name: 'School Board Meeting',
    count:
    timePeriod === 'now' ?
    52 :
    timePeriod === 'today' ?
    187 :
    timePeriod === 'week' ?
    542 :
    1654,
    momentum: 0.6,
    direction: 'up',
    velocity: 8
  }
  // More topics...
  ];
  // Return a simplified dataset for the mock
  return {
    topics,
    stories: [],
    categories: [],
    communityPulse: {},
    people: [],
    activeUsers: 200
  };
};