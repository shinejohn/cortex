import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  ThermometerIcon,
  Home,
  Mail,
  Share2,
  MessageSquare,
  Bookmark,
  ThumbsUp,
  Heart,
  AlertCircle,
  ChevronRight,
  X,
  Copy,
  Clock,
  Calendar,
  Award,
  Check,
  Shield,
  BarChart2,
  Eye,
  Star,
  AlertTriangle,
  Zap,
  FileText,
  ExternalLink,
  ChevronDown } from
'lucide-react';
import { NewspaperMasthead } from '../navigation/NewspaperMasthead';
import { HeroSection } from '../hero/HeroSection';
import { ArticleSidebar } from './ArticleSidebar';
import { ArticleNavigation } from './ArticleNavigation';
import { ArticleComments } from './ArticleComments';
import { ArticleRelated } from './ArticleRelated';
import { MobileArticleBar } from './MobileArticleBar';
import { SaveModal } from '../modals/SaveModal';
import { ShareModal } from '../modals/ShareModal';
import { useLocationDetection } from '../location/LocationDetector';
export const ArticleDetailPage = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showNextArticle, setShowNextArticle] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reactions, setReactions] = useState({
    helpful: 127,
    love: 45,
    surprising: 23
  });
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [activeReaders, setActiveReaders] = useState(247);
  const [showAIDetails, setShowAIDetails] = useState(false);
  const [showAuthorDetails, setShowAuthorDetails] = useState(false);
  const [showAIMetrics, setShowAIMetrics] = useState(false);
  const [articleRatings] = useState({
    factual: 4.5,
    likeable: 4.2,
    bias: 3.8,
    objective: 4.1
  });
  const { locationData } = useLocationDetection();
  const articleRef = useRef(null);
  const commentCount = 47;
  // Mock AI moderation scores
  const aiScores = {
    overall: 92,
    factAccuracy: 96,
    bias: 88,
    readability: 94,
    objectivity: 90,
    sourceQuality: 93,
    communityRelevance: 95
  };
  // Mock author data (similar to what's in AuthorProfilePage)
  const author = {
    id: '123',
    name: 'Sarah Johnson',
    title: 'Senior Community Journalist',
    location: 'Clearwater, FL',
    bio: 'Award-winning journalist with over 10 years of experience covering local news, government affairs, and community events.',
    avatar:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
    verified: true,
    trustScore: 4.8,
    trustPercentile: 92,
    trustTier: 'Gold',
    metrics: {
      totalArticles: 142,
      totalViews: 287450,
      aiAssistedPercentage: 15
    },
    qualityMetrics: {
      factAccuracy: 96,
      writingQuality: 92,
      objectivity: 88,
      sourceCitations: 94,
      communityTrust: 91
    }
  };
  // Handle scroll for header behavior and reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
      // Calculate reading progress
      if (articleRef.current) {
        const totalHeight = articleRef.current.clientHeight;
        const windowHeight = window.innerHeight;
        const scrolled = window.scrollY;
        const scrollableHeight = totalHeight - windowHeight;
        const progress = Math.min(scrolled / scrollableHeight, 1);
        setReadingProgress(progress);
        // Show next article preview when near bottom
        if (progress > 0.85) {
          setShowNextArticle(true);
        } else {
          setShowNextArticle(false);
        }
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
  // Function to handle ad clicks
  const handleAdClick = () => {
    // This would normally navigate to the ad detail page
    // For now, we'll just show an alert
    alert('This would navigate to the ad detail page');
    // In a real implementation, this would change the page:
    // setCurrentPage('advertisingDetail');
  };
  const handleReaction = (type) => {
    setReactions((prev) => ({
      ...prev,
      [type]: prev[type] + 1
    }));
  };
  const handleSave = () => {
    setSaved(!saved);
    setShowSaveModal(true);
  };
  const handleShare = () => {
    setShowShareModal(true);
  };
  const dismissNextArticle = () => {
    setShowNextArticle(false);
  };
  const navigateToAuthorProfile = () => {
    navigate(`/author/${author.id}`);
  };
  // Dummy functions needed for StickyNav
  const handleMainNavChange = (tab) => {

    // Handle navigation changes if needed
  };const handleMainSectionChange = (section) => {

    // Handle section changes if needed
  };const toggleAIDetails = () => {
    setShowAIDetails(!showAIDetails);
  };
  const toggleAuthorDetails = () => {
    setShowAuthorDetails(!showAuthorDetails);
  };
  const toggleAIMetrics = () => {
    setShowAIMetrics(!showAIMetrics);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Reading progress indicator */}
      <div className="fixed top-80 left-0 right-0 z-50 h-1 bg-gray-200">
        <div
          className="h-full bg-community-green transition-all duration-300"
          style={{
            width: `${readingProgress * 100}%`
          }}>
        </div>
      </div>
      <main className="pt-28 pb-16">
        <HeroSection
          greeting={greeting}
          location={locationData?.city || 'Clearwater'}
          activeReaders={activeReaders} />

        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <a href="#" className="hover:underline flex items-center">
              <Home className="h-3 w-3 mr-1" />
              <span>Home</span>
            </a>
            <ChevronRight className="h-3 w-3 mx-1" />
            <a href="#" className="hover:underline">
              News
            </a>
            <ChevronRight className="h-3 w-3 mx-1" />
            <a href="#" className="hover:underline">
              Local News
            </a>
            <ChevronRight className="h-3 w-3 mx-1" />
            <span className="text-gray-700">Current Article</span>
          </div>
          {/* Article header metadata */}
          <div className="mb-4 flex items-center text-sm">
            <span className="bg-news-primary text-white px-2 py-0.5 rounded text-xs font-medium">
              LOCAL NEWS
            </span>
            <span className="mx-2">•</span>
            <div className="flex items-center text-gray-500">
              <Clock className="h-3 w-3 mr-1" />
              <span>5 min read</span>
            </div>
            <span className="mx-2">•</span>
            <div className="flex items-center text-gray-500">
              <Calendar className="h-3 w-3 mr-1" />
              <span>Updated Aug 2, 2024</span>
            </div>
          </div>
          {/* Article headline and subheadline */}
          <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 mb-3 leading-tight">
            Clearwater City Council Approves $89.2M Budget for 2025 Fiscal Year
          </h1>
          <h2 className="font-display text-xl md:text-2xl text-gray-700 mb-6">
            New budget maintains current millage rate while increasing funding
            for infrastructure and public safety
          </h2>

          {/* AI Moderation Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="font-medium text-gray-900">
                  AI Quality Assessment
                </h3>
              </div>
              <div className="flex items-center">
                <div className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-sm font-medium flex items-center mr-2">
                  <Shield className="h-3.5 w-3.5 mr-1" />
                  <span>AI Score: {aiScores.overall}/100</span>
                </div>
                <button
                  onClick={toggleAIMetrics}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none">

                  <ChevronDown
                    className={`h-5 w-5 transition-transform duration-200 ${showAIMetrics ? 'transform rotate-180' : ''}`} />

                </button>
              </div>
            </div>
            {showAIMetrics &&
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Fact Accuracy</span>
                    <span className="text-xs font-medium text-gray-700">
                      {aiScores.factAccuracy}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                    className="bg-green-500 h-1.5 rounded-full"
                    style={{
                      width: `${aiScores.factAccuracy}%`
                    }}>
                  </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Bias Level</span>
                    <span className="text-xs font-medium text-gray-700">
                      {aiScores.bias}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{
                      width: `${aiScores.bias}%`
                    }}>
                  </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Readability</span>
                    <span className="text-xs font-medium text-gray-700">
                      {aiScores.readability}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                    className="bg-purple-500 h-1.5 rounded-full"
                    style={{
                      width: `${aiScores.readability}%`
                    }}>
                  </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Objectivity</span>
                    <span className="text-xs font-medium text-gray-700">
                      {aiScores.objectivity}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                    className="bg-yellow-500 h-1.5 rounded-full"
                    style={{
                      width: `${aiScores.objectivity}%`
                    }}>
                  </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">
                      Source Quality
                    </span>
                    <span className="text-xs font-medium text-gray-700">
                      {aiScores.sourceQuality}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                    className="bg-orange-500 h-1.5 rounded-full"
                    style={{
                      width: `${aiScores.sourceQuality}%`
                    }}>
                  </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">
                      Community Relevance
                    </span>
                    <span className="text-xs font-medium text-gray-700">
                      {aiScores.communityRelevance}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                    className="bg-green-500 h-1.5 rounded-full"
                    style={{
                      width: `${aiScores.communityRelevance}%`
                    }}>
                  </div>
                  </div>
                </div>
              </div>
            }
          </div>

          {/* Enhanced Author section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              {/* Author image and basic info */}
              <div className="flex flex-col md:flex-row items-center mb-4 md:mb-0 md:mr-6">
                <div
                  className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 cursor-pointer"
                  onClick={navigateToAuthorProfile}>

                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="h-full w-full object-cover" />

                </div>
                <div className="text-center md:text-left md:ml-4 mt-3 md:mt-0">
                  <div className="flex items-center justify-center md:justify-start">
                    <h3
                      className="font-display text-lg font-bold text-gray-900 hover:text-blue-600 cursor-pointer"
                      onClick={navigateToAuthorProfile}>

                      {author.name}
                    </h3>
                    {author.verified &&
                    <div className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </div>
                    }
                  </div>
                  <p className="text-gray-600 text-sm">{author.title}</p>
                  <div className="flex items-center justify-center md:justify-start mt-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{author.location}</span>
                  </div>
                </div>
              </div>
              {/* Author metrics and trust score */}
              <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {author.trustScore}
                  </div>
                  <div className="text-xs text-gray-600">Trust Score</div>
                  <div className="flex justify-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) =>
                    <Star
                      key={star}
                      className={`h-3 w-3 ${star <= Math.round(author.trustScore) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />

                    )}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {author.metrics.totalArticles}
                  </div>
                  <div className="text-xs text-gray-600">Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {(author.metrics.totalViews / 1000).toFixed(1)}K
                  </div>
                  <div className="text-xs text-gray-600">Total Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {author.qualityMetrics.factAccuracy}%
                  </div>
                  <div className="text-xs text-gray-600">Fact Accuracy</div>
                </div>
              </div>
              {/* View profile button */}
              <div className="mt-4 md:mt-0 md:ml-4 flex-shrink-0">
                <button
                  onClick={navigateToAuthorProfile}
                  className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors flex items-center">

                  <FileText className="h-4 w-4 mr-1.5" />
                  View Profile
                </button>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-600 line-clamp-2">{author.bio}</p>
            </div>
          </div>

          {/* Hero image */}
          <div className="mb-6">
            <div className="rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&h=720&q=80"
                alt="Clearwater City Hall during budget meeting"
                className="w-full h-auto object-cover" />

            </div>
            <p className="text-sm text-gray-500 mt-2">
              Clearwater City Hall during the final budget meeting on Tuesday.
              Photo credit: James Wilson
            </p>
          </div>

          {/* Native ad with click handler */}
          <div
            className="my-8 border border-gray-200 rounded-lg p-4 bg-gray-50 cursor-pointer"
            onClick={handleAdClick}>

            <div className="text-xs text-gray-500 mb-2">
              SPONSORED CONTENT BY CLEARWATER BUSINESS ALLIANCE
            </div>
            <div className="flex">
              <div className="w-1/4 mr-4">
                <img
                  src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                  alt="Office building"
                  className="w-full h-auto rounded" />

              </div>
              <div className="w-3/4">
                <h4 className="font-display text-lg font-bold mb-1">
                  Local Businesses Driving Clearwater's Economic Growth
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  How small businesses are contributing to the city's rising
                  property values and tax base...
                </p>
                <a
                  href="#"
                  className="text-news-primary font-medium text-sm hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAdClick();
                  }}>

                  Learn More
                </a>
              </div>
            </div>
          </div>

          {/* Advertisement banner with click handler */}
          <div className="mb-8">
            <div className="text-xs text-gray-400 text-center mb-1">
              ADVERTISEMENT
            </div>
            <div
              className="bg-gray-200 h-24 rounded flex items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-300 transition-colors"
              onClick={handleAdClick}>

              728x90 Leaderboard Ad
            </div>
          </div>

          {/* Three column layout */}
          <div
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            ref={articleRef}>

            {/* Left rail - Navigation helpers */}
            <aside className="hidden lg:block lg:col-span-2">
              <ArticleNavigation commentCount={commentCount} />
            </aside>

            {/* Main content */}
            <article className="lg:col-span-7">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-800 leading-relaxed">
                  <span className="float-left font-display text-7xl leading-[0.8] mr-2 mt-1 text-gray-900">
                    T
                  </span>
                  he Clearwater City Council has unanimously approved an $89.2
                  million budget for the 2025 fiscal year during Tuesday night's
                  meeting, maintaining the current millage rate while increasing
                  funding for key infrastructure projects and public safety
                  initiatives.
                </p>
                <p className="text-gray-800 leading-relaxed">
                  The approved budget, which goes into effect on October 1,
                  represents a 3.7% increase from the previous fiscal year,
                  reflecting the city's continued growth and rising property
                  values throughout the Pinellas County municipality.
                </p>
                <p className="text-gray-800 leading-relaxed">
                  "This budget strikes the right balance between fiscal
                  responsibility and meeting the needs of our growing
                  community," said Mayor Frank Hibbard during the council
                  meeting. "We're maintaining the same tax rate while still
                  investing in the services and infrastructure our residents
                  expect."
                </p>
                <h3 className="font-display text-2xl font-bold text-gray-900 mt-8 mb-4">
                  Property Tax Rate Remains Stable
                </h3>
                <p className="text-gray-800 leading-relaxed">
                  The council voted to keep the millage rate at 4.1345 mills,
                  the same rate as the previous year. This means property owners
                  will continue to pay approximately $4.13 for every $1,000 of
                  assessed property value.
                </p>
                <p className="text-gray-800 leading-relaxed">
                  Despite maintaining the same rate, the city expects to collect
                  approximately $2.3 million more in property tax revenue
                  compared to last year due to increased property values and new
                  construction throughout Clearwater.
                </p>
                {/* Native ad */}
                <div className="my-8 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="text-xs text-gray-500 mb-2">
                    SPONSORED CONTENT BY CLEARWATER BUSINESS ALLIANCE
                  </div>
                  <div className="flex">
                    <div className="w-1/4 mr-4">
                      <img
                        src="https://images.unsplash.com/photo-1560179707-f14e90ef3623?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                        alt="Office building"
                        className="w-full h-auto rounded" />

                    </div>
                    <div className="w-3/4">
                      <h4 className="font-display text-lg font-bold mb-1">
                        Local Businesses Driving Clearwater's Economic Growth
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        How small businesses are contributing to the city's
                        rising property values and tax base...
                      </p>
                      <a
                        href="#"
                        className="text-news-primary font-medium text-sm hover:underline">

                        Learn More
                      </a>
                    </div>
                  </div>
                </div>
                <h3 className="font-display text-2xl font-bold text-gray-900 mt-8 mb-4">
                  Infrastructure Investment Takes Priority
                </h3>
                <p className="text-gray-800 leading-relaxed">
                  The largest portion of the budget—approximately $27.6
                  million—is allocated to infrastructure improvements, including
                  road repairs, stormwater management, and public facility
                  maintenance.
                </p>
                <p className="text-gray-800 leading-relaxed">
                  Notable projects include $4.2 million for the Cleveland Street
                  redesign, $3.8 million for stormwater improvements in the
                  South Greenwood area, and $2.1 million for repairs to the
                  Clearwater Beach Marina.
                </p>
                <div className="my-8 bg-news-primary bg-opacity-5 border-l-4 border-news-primary p-6 text-center">
                  <blockquote className="font-display text-xl text-news-primary italic">
                    "We're focusing on projects that will enhance quality of
                    life for residents while also preparing for future growth.
                    This isn't just about fixing what's broken—it's about
                    building a more resilient Clearwater."
                  </blockquote>
                  <cite className="text-sm text-gray-600 mt-2 block">
                    — Amanda Thompson, Public Works Director
                  </cite>
                </div>
                <p className="text-gray-800 leading-relaxed">
                  Public safety also received a significant boost, with the
                  police department budget increasing by 5.2% to $36.4 million
                  and the fire department seeing a 4.8% increase to $28.7
                  million. These increases will fund new equipment purchases,
                  facility upgrades, and additional personnel.
                </p>
                <p className="text-gray-800 leading-relaxed">
                  The budget also includes $5.3 million for parks and recreation
                  improvements, including renovations to Crest Lake Park and
                  expanded programming at the Long Center.
                </p>
                <h3 className="font-display text-2xl font-bold text-gray-900 mt-8 mb-4">
                  Community Response
                </h3>
                <p className="text-gray-800 leading-relaxed">
                  During the public comment portion of the meeting, residents
                  expressed mixed reactions to the budget. While many supported
                  the infrastructure investments, some voiced concerns about the
                  increasing cost of living in Clearwater.
                </p>
                <p className="text-gray-800 leading-relaxed">
                  "Property values keep going up, which means even with the same
                  millage rate, we're paying more in taxes each year," said
                  longtime resident Maria Sanchez. "At some point, the council
                  needs to consider lowering the rate to give homeowners some
                  relief."
                </p>
                <p className="text-gray-800 leading-relaxed">
                  Others praised the council's approach. "The investments in
                  infrastructure are long overdue," said business owner David
                  Chen. "These improvements will benefit everyone and help
                  attract more businesses to our downtown area."
                </p>
                <h3 className="font-display text-2xl font-bold text-gray-900 mt-8 mb-4">
                  Looking Ahead
                </h3>
                <p className="text-gray-800 leading-relaxed">
                  City Manager Jon Jennings indicated that future budgets would
                  likely need to address several long-term challenges, including
                  climate resilience, affordable housing, and transportation
                  improvements.
                </p>
                <p className="text-gray-800 leading-relaxed">
                  "We're in a strong financial position today, but we need to be
                  thinking about the Clearwater of tomorrow," Jennings said.
                  "The decisions we make now will shape our city for decades to
                  come."
                </p>
                <p className="text-gray-800 leading-relaxed">
                  The full budget document is available on the city's website,
                  and a town hall meeting to explain the budget in detail is
                  scheduled for August 15 at the Main Library.
                </p>
              </div>
              {/* Advertisement section */}
              <div className="mt-8 bg-gray-100 p-4 text-center">
                <div className="text-xs text-gray-400 mb-2">ADVERTISEMENT</div>
                <div className="bg-gray-200 h-[250px] flex items-center justify-center text-gray-400">
                  300x250 Ad Unit
                </div>
              </div>
              {/* Article tags - moved to this position */}
              <div className="mt-8 pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500 mb-2">
                  Related Topics:
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="#"
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200">

                    Clearwater
                  </a>
                  <a
                    href="#"
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200">

                    City Council
                  </a>
                  <a
                    href="#"
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200">

                    Budget
                  </a>
                  <a
                    href="#"
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200">

                    Property Taxes
                  </a>
                  <a
                    href="#"
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm hover:bg-gray-200">

                    Infrastructure
                  </a>
                </div>
              </div>
              {/* Article Ratings */}
              <div className="mt-6 pt-4 border-t border-gray-200 mb-6">
                <div className="text-sm font-medium text-gray-700 mb-3">
                  Article Ratings:
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {/* Factual Rating */}
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 w-20">Factual:</span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) =>
                      <Star
                        key={`factual-${star}`}
                        className={`h-4 w-4 ${star <= Math.floor(articleRatings.factual) ? 'text-yellow-400 fill-current' : star <= articleRatings.factual ? 'text-yellow-400 fill-current opacity-50' : 'text-gray-300'}`} />

                      )}
                      <span className="ml-2 text-sm text-gray-700">
                        {articleRatings.factual.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  {/* Likeable Rating */}
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 w-20">
                      Likeable:
                    </span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) =>
                      <Star
                        key={`likeable-${star}`}
                        className={`h-4 w-4 ${star <= Math.floor(articleRatings.likeable) ? 'text-yellow-400 fill-current' : star <= articleRatings.likeable ? 'text-yellow-400 fill-current opacity-50' : 'text-gray-300'}`} />

                      )}
                      <span className="ml-2 text-sm text-gray-700">
                        {articleRatings.likeable.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  {/* Bias Rating */}
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 w-20">Bias:</span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) =>
                      <Star
                        key={`bias-${star}`}
                        className={`h-4 w-4 ${star <= Math.floor(articleRatings.bias) ? 'text-yellow-400 fill-current' : star <= articleRatings.bias ? 'text-yellow-400 fill-current opacity-50' : 'text-gray-300'}`} />

                      )}
                      <span className="ml-2 text-sm text-gray-700">
                        {articleRatings.bias.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  {/* Objective Rating */}
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 w-20">
                      Objective:
                    </span>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) =>
                      <Star
                        key={`objective-${star}`}
                        className={`h-4 w-4 ${star <= Math.floor(articleRatings.objective) ? 'text-yellow-400 fill-current' : star <= articleRatings.objective ? 'text-yellow-400 fill-current opacity-50' : 'text-gray-300'}`} />

                      )}
                      <span className="ml-2 text-sm text-gray-700">
                        {articleRatings.objective.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reaction bar */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-3">
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200"
                    onClick={() => handleReaction('helpful')}>

                    <ThumbsUp className="h-4 w-4" />
                    <span>Helpful</span>
                    <span className="text-gray-500">{reactions.helpful}</span>
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200"
                    onClick={() => handleReaction('love')}>

                    <Heart className="h-4 w-4" />
                    <span>Love</span>
                    <span className="text-gray-500">{reactions.love}</span>
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200"
                    onClick={() => handleReaction('surprising')}>

                    <AlertCircle className="h-4 w-4" />
                    <span>Surprising</span>
                    <span className="text-gray-500">
                      {reactions.surprising}
                    </span>
                  </button>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 ml-auto"
                    onClick={handleShare}>

                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                  <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-200 ${saved ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'}`}
                    onClick={handleSave}>

                    <Bookmark
                      className="h-4 w-4"
                      fill={saved ? 'currentColor' : 'none'} />

                    <span>Save</span>
                  </button>
                </div>
              </div>

              {/* Comments section */}
              <div id="comments" className="mt-12">
                <ArticleComments commentCount={commentCount} />
              </div>
            </article>

            {/* Right rail - Sidebar */}
            <aside className="lg:col-span-3">
              <ArticleSidebar />
            </aside>
          </div>

          {/* Related content */}
          <div className="mt-16 border-t border-gray-200 pt-12">
            <ArticleRelated />
          </div>
        </div>
      </main>

      {/* Next article preview - shows at 85% scroll */}
      {showNextArticle &&
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 transition-all duration-300 transform translate-y-0 z-20">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden mr-3">
                <img
                src="https://images.unsplash.com/photo-1517433670267-08bbd4be890f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"
                alt="Next article thumbnail"
                className="w-full h-full object-cover" />

              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">READ NEXT</div>
                <h3 className="font-display font-bold text-gray-900">
                  Clearwater Beach Named Top 10 Destination for Fall Travel
                </h3>
              </div>
            </div>
            <div className="flex items-center">
              <button className="bg-news-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-news-primary-dark mr-2">
                Read Article
              </button>
              <button
              className="p-2 rounded-full hover:bg-gray-100"
              onClick={dismissNextArticle}>

                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      }

      {/* Mobile sticky bar */}
      <div className="lg:hidden">
        <MobileArticleBar
          commentCount={commentCount}
          reactions={reactions}
          handleReaction={handleReaction}
          handleShare={handleShare}
          saved={saved}
          handleSave={handleSave} />

      </div>

      {/* Save Modal */}
      {showSaveModal &&
      <SaveModal
        onClose={() => setShowSaveModal(false)}
        article={{
          title:
          'Clearwater City Council Approves $89.2M Budget for 2025 Fiscal Year',
          category: 'LOCAL NEWS',
          image:
          'https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&h=720&q=80'
        }} />

      }

      {/* Share Modal */}
      {showShareModal &&
      <ShareModal
        onClose={() => setShowShareModal(false)}
        article={{
          title:
          'Clearwater City Council Approves $89.2M Budget for 2025 Fiscal Year'
        }} />

      }
    </div>);

};