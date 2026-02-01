import React, { useState, Component } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  ThermometerIcon,
  Home,
  ChevronDown,
  MessageSquare,
  Star,
  Check,
  MoreHorizontal,
  Eye,
  ThumbsUp,
  Calendar,
  Clock,
  Award,
  ExternalLink,
  Flag,
  X,
  AlertTriangle,
  Mail,
  Phone,
  Globe,
  Twitter,
  Facebook,
  Linkedin,
  CheckCircle,
  Shield,
  Zap,
  Filter,
  ArrowUpDown,
  Share2,
  User,
  AlertCircle,
  UserPlus,
  UserMinus,
  Copy,
  Link,
  Send,
  Info,
  HelpCircle } from
'lucide-react';
const AuthorProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportConfirmation, setShowReportConfirmation] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [rating, setRating] = useState(0);
  const [filterType, setFilterType] = useState('All Articles');
  const [sortType, setSortType] = useState('Newest');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showMoreOptionsDropdown, setShowMoreOptionsDropdown] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  // Mock author data
  const author = {
    id: '123',
    name: 'Sarah Johnson',
    title: 'Senior Community Journalist',
    location: 'Clearwater, FL',
    memberSince: 'May 2022',
    verified: true,
    avatar:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
    coverImage:
    'https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-1.2.1&auto=format&fit=crop&w=1280&q=80',
    trustScore: 4.8,
    trustPercentile: 92,
    trustTier: 'Gold',
    bio: 'Award-winning journalist with over 10 years of experience covering local news, government affairs, and community events. Passionate about bringing accurate and meaningful stories to Clearwater residents.',
    credentials: [
    'BA in Journalism, University of Florida',
    'Certificate in Digital Media, Stanford University',
    'Former Editor, Clearwater Chronicle',
    'Winner, Florida Press Association Award (2021)'],

    coverageAreas: [
    'Local Government',
    'Community Events',
    'Education',
    'Business',
    'Environment'],

    verifications: [
    'Identity Verified',
    'Professional Credentials Verified',
    'Local Residence Verified'],

    contact: {
      email: 'sarah.johnson@daynews.com',
      phone: '(727) 555-0123',
      website: 'sarahjohnson.com',
      twitter: '@sarahjreports',
      facebook: 'sarahjohnsonreports',
      linkedin: 'sarahjohnson'
    },
    metrics: {
      totalArticles: 142,
      totalViews: 287450,
      totalComments: 3218,
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
  // Mock articles data
  const articles = [
  {
    id: 1,
    title: 'Clearwater Community Center Reopens After $3.2M Renovation',
    date: 'August 2, 2024',
    aiScore: 92,
    views: 4523,
    approvalRate: 98,
    category: 'Community',
    excerpt:
    'The Clearwater Community Center officially reopened its doors yesterday following an extensive $3.2 million renovation project that began in January...'
  },
  {
    id: 2,
    title: 'City Council Approves New Downtown Development Plan',
    date: 'July 28, 2024',
    aiScore: 88,
    views: 3782,
    approvalRate: 92,
    category: 'Local Government',
    excerpt:
    'In a 4-1 vote Tuesday night, the Clearwater City Council approved a controversial new development plan for the downtown area...'
  },
  {
    id: 3,
    title: 'Local School District Announces New STEM Program',
    date: 'July 15, 2024',
    aiScore: 95,
    views: 5214,
    approvalRate: 97,
    category: 'Education',
    excerpt:
    'Clearwater School District has secured a $1.5 million grant to implement a comprehensive STEM program across all elementary schools...'
  },
  {
    id: 4,
    title: 'Annual Beach Cleanup Event Draws Record Participation',
    date: 'July 8, 2024',
    aiScore: 91,
    views: 3127,
    approvalRate: 99,
    category: 'Environment',
    excerpt:
    'More than 500 volunteers gathered at Clearwater Beach this Saturday for the annual coastal cleanup event, setting a new record for participation...'
  },
  {
    id: 5,
    title: 'New Business Incubator Opens to Support Local Entrepreneurs',
    date: 'June 30, 2024',
    aiScore: 89,
    views: 2845,
    approvalRate: 94,
    category: 'Business',
    excerpt:
    'The Clearwater Economic Development Agency has opened a new business incubator aimed at supporting local entrepreneurs and startups...'
  }];

  // Mock reviews data
  const reviews = [
  {
    id: 1,
    reviewer: 'Michael Chen',
    rating: 5,
    date: 'August 1, 2024',
    articleTitle:
    'Clearwater Community Center Reopens After $3.2M Renovation',
    comment:
    "Sarah's reporting is always thorough and accurate. This article provided excellent context about the renovation and its impact on the community.",
    trustworthy: true,
    expertise: true,
    wouldReadMore: true,
    helpfulCount: 12,
    flags: 0
  },
  {
    id: 2,
    reviewer: 'Emily Rodriguez',
    rating: 4,
    date: 'July 27, 2024',
    articleTitle: 'City Council Approves New Downtown Development Plan',
    comment:
    'Good coverage of a complex issue. I appreciated the balanced reporting, though I would have liked to see more perspectives from local business owners.',
    trustworthy: true,
    expertise: true,
    wouldReadMore: true,
    helpfulCount: 8,
    flags: 0
  },
  {
    id: 3,
    reviewer: 'David Wilson',
    rating: 5,
    date: 'July 16, 2024',
    articleTitle: 'Local School District Announces New STEM Program',
    comment:
    'Excellent reporting on an important educational initiative. Sarah clearly understands the education system and the significance of this program.',
    trustworthy: true,
    expertise: true,
    wouldReadMore: true,
    helpfulCount: 15,
    flags: 0
  },
  {
    id: 4,
    reviewer: 'Anonymous',
    rating: 3,
    date: 'July 10, 2024',
    articleTitle: 'Annual Beach Cleanup Event Draws Record Participation',
    comment:
    "The article was informative but didn't address some of the ongoing environmental concerns that weren't solved by the cleanup.",
    trustworthy: true,
    expertise: false,
    wouldReadMore: true,
    helpfulCount: 3,
    flags: 1
  }];

  // Calculate review statistics
  const reviewStats = {
    averageRating: 4.25,
    totalReviews: reviews.length,
    distribution: {
      5: 2,
      4: 1,
      3: 1,
      2: 0,
      1: 0
    },
    percentTrustworthy: 100,
    percentExpertise: 75,
    percentWouldReadMore: 100
  };
  const filterOptions = [
  'All Articles',
  'Community',
  'Local Government',
  'Education',
  'Environment',
  'Business'];

  const sortOptions = [
  'Newest',
  'Most Viewed',
  'Highest Rated',
  'Most Commented'];

  // Report reasons
  const reportReasons = [
  'Spreading misinformation',
  'Biased reporting',
  'Plagiarism',
  'Inappropriate content',
  'Conflict of interest',
  'Harassment or bullying',
  'Other violation of community standards'];

  // Handle share link copy
  const handleCopyLink = () => {
    const profileUrl = `${window.location.origin}/author/${author.id}`;
    navigator.clipboard.writeText(profileUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };
  // Handle share via email
  const handleShareViaEmail = () => {
    const profileUrl = `${window.location.origin}/author/${author.id}`;
    const subject = `Check out ${author.name}'s profile on Day.news`;
    const body = `I thought you might be interested in following ${author.name}, a journalist on Day.news: ${profileUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setShowShareModal(false);
  };
  // Handle report submission
  const handleReportSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send the report to an API
    console.log('Report submitted:', {
      reportReason,
      reportDetails,
      authorId: author.id
    });
    setShowReportModal(false);
    setShowReportConfirmation(true);
    // Reset form
    setReportReason('');
    setReportDetails('');
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Community Bar */}
      <div className="bg-news-primary text-white py-2 sticky top-0 z-50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-1" />
              <span>Clearwater, FL</span>
              <span className="mx-2">•</span>
              <div className="flex items-center">
                <ThermometerIcon className="h-3.5 w-3.5 mr-1" />
                <span>78°F Sunny</span>
              </div>
              <span className="mx-2">•</span>
              <span>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Navigation Bar */}
      <nav className="bg-gray-100 border-b border-gray-200 py-3 sticky top-10 z-40">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <div className="flex items-center justify-center space-x-6 overflow-x-auto">
            <a
              href="/"
              className="flex items-center text-gray-600 hover:text-news-primary">

              <Home className="h-4 w-4 mr-1.5" />
              <span className="font-medium">Home</span>
            </a>
            <span className="text-gray-300">|</span>
            <a
              href="#"
              className="text-gray-600 hover:text-news-primary font-medium">

              News
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-news-primary font-medium">

              Authors
            </a>
            <a
              href="#"
              className="text-news-primary font-semibold border-b-2 border-news-primary pb-1">

              Author Profile
            </a>
          </div>
        </div>
      </nav>
      {/* Author Profile Header */}
      <div className="relative">
        {/* Cover Image */}
        <div
          className="h-48 w-full bg-gradient-to-r from-blue-400 to-blue-600 relative overflow-hidden"
          style={{
            backgroundImage: author.coverImage ?
            `url(${author.coverImage})` :
            undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>

          {/* Overlay gradient for better text visibility */}
          <div className="absolute inset-0 bg-blue-900 bg-opacity-30"></div>
        </div>
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Profile Info Section */}
          <div className="bg-white rounded-lg shadow-sm -mt-16 relative z-10 p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between">
              {/* Avatar and Author Info */}
              <div className="flex flex-col md:flex-row items-center md:items-start mb-6 md:mb-0">
                {/* Avatar */}
                <div className="relative -mt-16 mb-4 md:mb-0 md:mr-6">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden">
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-full h-full object-cover" />

                  </div>
                  {author.verified &&
                  <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1.5 shadow-md">
                      <Check className="h-4 w-4" />
                    </div>
                  }
                </div>
                {/* Author Info */}
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start">
                    <h1 className="text-3xl font-display font-bold text-gray-900">
                      {author.name}
                    </h1>
                    {author.verified &&
                    <div className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </div>
                    }
                  </div>
                  <p className="text-gray-600 mt-1">{author.title}</p>
                  <div className="flex items-center justify-center md:justify-start mt-2 text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{author.location}</span>
                    <span className="mx-2">•</span>
                    <span>Member since {author.memberSince}</span>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center">
                  <Star className="h-4 w-4 mr-1.5" />
                  Follow
                </button>
                <button
                  onClick={() => setShowMessageModal(true)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors flex items-center">

                  <MessageSquare className="h-4 w-4 mr-1.5" />
                  Message
                </button>
                <div className="relative">
                  <button
                    onClick={() =>
                    setShowMoreOptionsDropdown(!showMoreOptionsDropdown)
                    }
                    className="p-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">

                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                  {/* More Options Dropdown */}
                  {showMoreOptionsDropdown &&
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                      <div className="py-1">
                        <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setShowMoreOptionsDropdown(false);
                          setShowShareModal(true);
                        }}>

                          <Share2 className="h-4 w-4 mr-2 text-gray-500" />
                          Share Profile
                        </button>
                        <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setShowMoreOptionsDropdown(false);
                          setShowReportModal(true);
                        }}>

                          <Flag className="h-4 w-4 mr-2 text-gray-500" />
                          Report Author
                        </button>
                        <button
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setShowMoreOptionsDropdown(false);
                          // Block functionality would go here
                        }}>

                          <UserMinus className="h-4 w-4 mr-2 text-gray-500" />
                          Block Author
                        </button>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-24 z-30">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <div className="flex justify-center overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'overview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>

              Overview
            </button>
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'articles' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>

              Articles ({author.metrics.totalArticles})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'reviews' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>

              Reviews ({reviewStats.totalReviews})
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${activeTab === 'about' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>

              About
            </button>
          </div>
        </div>
      </div>
      {/* Tab Content */}
      <div className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Overview Tab */}
          {activeTab === 'overview' &&
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Trust Score Card - 1 column */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Trust Score
                  </h2>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-blue-600 mb-2">
                      {author.trustScore}
                    </div>
                    <div className="flex justify-center mb-3">
                      {[1, 2, 3, 4, 5].map((star) =>
                    <Star
                      key={star}
                      className={`h-5 w-5 ${star <= Math.round(author.trustScore) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />

                    )}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      Top {author.trustPercentile}% of Authors
                    </div>
                    <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${author.trustTier === 'Platinum' ? 'bg-indigo-100 text-indigo-800' : author.trustTier === 'Gold' ? 'bg-yellow-100 text-yellow-800' : author.trustTier === 'Silver' ? 'bg-gray-200 text-gray-800' : 'bg-amber-100 text-amber-800'}`}>

                      <Award className="h-4 w-4 mr-1.5" />
                      {author.trustTier} Tier
                    </div>
                  </div>
                </div>
              </div>
              {/* Right Area - 4 columns */}
              <div className="lg:col-span-4 space-y-6">
                {/* Performance Metrics Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Performance Metrics
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {author.metrics.totalArticles}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Articles
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {author.metrics.totalViews.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">Total Views</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {author.metrics.totalComments.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Comments
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {author.metrics.aiAssistedPercentage}%
                      </div>
                      <div className="text-sm text-gray-600">AI-Assisted</div>
                    </div>
                  </div>
                </div>
                {/* Quality Breakdown Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Quality Breakdown
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          Fact Accuracy
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {author.qualityMetrics.factAccuracy}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{
                          width: `${author.qualityMetrics.factAccuracy}%`
                        }}>
                      </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          Writing Quality
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {author.qualityMetrics.writingQuality}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                        className="bg-blue-500 h-2.5 rounded-full"
                        style={{
                          width: `${author.qualityMetrics.writingQuality}%`
                        }}>
                      </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          Objectivity
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {author.qualityMetrics.objectivity}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                        className="bg-purple-500 h-2.5 rounded-full"
                        style={{
                          width: `${author.qualityMetrics.objectivity}%`
                        }}>
                      </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          Source Citations
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {author.qualityMetrics.sourceCitations}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                        className="bg-yellow-500 h-2.5 rounded-full"
                        style={{
                          width: `${author.qualityMetrics.sourceCitations}%`
                        }}>
                      </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          Community Trust
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {author.qualityMetrics.communityTrust}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                        className="bg-orange-500 h-2.5 rounded-full"
                        style={{
                          width: `${author.qualityMetrics.communityTrust}%`
                        }}>
                      </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Recent Articles Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Recent Articles
                    </h2>
                    <button
                    onClick={() => setActiveTab('articles')}
                    className="text-sm text-blue-600 font-medium hover:underline">

                      View All
                    </button>
                  </div>
                  <div className="space-y-4">
                    {articles.slice(0, 3).map((article) =>
                  <div
                    key={article.id}
                    className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">

                        <h3 className="font-medium text-gray-900 hover:text-blue-600 mb-1">
                          <a href="#">{article.title}</a>
                        </h3>
                        <div className="flex flex-wrap items-center text-sm text-gray-500 mb-2 gap-x-4 gap-y-1">
                          <span className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            {article.date}
                          </span>
                          <span className="flex items-center">
                            <Zap className="h-3.5 w-3.5 mr-1 text-blue-500" />
                            AI Score: {article.aiScore}
                          </span>
                          <span className="flex items-center">
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            {article.views.toLocaleString()} views
                          </span>
                          <span className="flex items-center">
                            <ThumbsUp className="h-3.5 w-3.5 mr-1 text-green-500" />
                            {article.approvalRate}% approval
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {article.excerpt}
                        </p>
                      </div>
                  )}
                  </div>
                  <div className="mt-4 text-center">
                    <button
                    onClick={() => setActiveTab('articles')}
                    className="text-blue-600 font-medium text-sm hover:underline flex items-center justify-center mx-auto">

                      View All Articles
                      <ExternalLink className="h-3.5 w-3.5 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
          {/* Articles Tab */}
          {activeTab === 'articles' &&
          <div>
              {/* Filters Bar */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                  <div className="flex flex-col sm:flex-row gap-3 mb-3 sm:mb-0">
                    {/* Filter Dropdown */}
                    <div className="relative">
                      <button
                      onClick={() =>
                      setShowFilterDropdown(!showFilterDropdown)
                      }
                      className="flex items-center justify-between w-48 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm">

                        <div className="flex items-center">
                          <Filter className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{filterType}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </button>
                      {showFilterDropdown &&
                    <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                          {filterOptions.map((option) =>
                      <button
                        key={option}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setFilterType(option);
                          setShowFilterDropdown(false);
                        }}>

                              {option}
                            </button>
                      )}
                        </div>
                    }
                    </div>
                    {/* Sort Dropdown */}
                    <div className="relative">
                      <button
                      onClick={() => setShowSortDropdown(!showSortDropdown)}
                      className="flex items-center justify-between w-48 px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm">

                        <div className="flex items-center">
                          <ArrowUpDown className="h-4 w-4 mr-2 text-gray-500" />
                          <span>Sort by: {sortType}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </button>
                      {showSortDropdown &&
                    <div className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                          {sortOptions.map((option) =>
                      <button
                        key={option}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setSortType(option);
                          setShowSortDropdown(false);
                        }}>

                              {option}
                            </button>
                      )}
                        </div>
                    }
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Showing {articles.length} of {author.metrics.totalArticles}{' '}
                    articles
                  </div>
                </div>
              </div>
              {/* Articles List */}
              <div className="space-y-4">
                {articles.map((article) =>
              <div
                key={article.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center mb-2">
                            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {article.category}
                            </span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-sm text-gray-500">
                              {article.date}
                            </span>
                          </div>
                          <h3 className="text-xl font-display font-semibold text-gray-900 hover:text-blue-600">
                            <a href="#">{article.title}</a>
                          </h3>
                        </div>
                        <div className="flex items-center">
                          <div className="flex items-center px-2.5 py-1 bg-blue-50 rounded-md mr-2">
                            <Zap className="h-4 w-4 text-blue-500 mr-1" />
                            <span className="text-sm font-medium text-blue-700">
                              {article.aiScore}
                            </span>
                          </div>
                          <div
                        className={`flex items-center px-2.5 py-1 rounded-md ${article.approvalRate >= 95 ? 'bg-green-50 text-green-700' : article.approvalRate >= 80 ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>

                            <ThumbsUp className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">
                              {article.approvalRate}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{article.excerpt}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {article.views.toLocaleString()} views
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {Math.floor(article.views * 0.02)} comments
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button
                        onClick={() => setShowReviewModal(true)}
                        className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50">

                            Review Article
                          </button>
                          <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">
                            Read Full
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
              )}
              </div>
              {/* Load More Button */}
              <div className="mt-8 flex justify-center">
                <button className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
                  Load More Articles
                </button>
              </div>
            </div>
          }
          {/* Reviews Tab */}
          {activeTab === 'reviews' &&
          <div>
              {/* Reviews Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Rating Distribution */}
                  <div className="lg:col-span-1">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Rating Distribution
                    </h2>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) =>
                    <div key={rating} className="flex items-center">
                          <div className="w-12 text-sm text-gray-700 font-medium">
                            {rating} {rating === 1 ? 'star' : 'stars'}
                          </div>
                          <div className="flex-1 mx-3">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                            className={`h-2.5 rounded-full ${rating >= 4 ? 'bg-green-500' : rating === 3 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{
                              width: `${reviewStats.distribution[rating] / reviewStats.totalReviews * 100}%`
                            }}>
                          </div>
                            </div>
                          </div>
                          <div className="w-8 text-sm text-gray-700 text-right">
                            {reviewStats.distribution[rating]}
                          </div>
                        </div>
                    )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Average Rating
                        </span>
                        <div className="flex items-center">
                          <span className="text-lg font-bold text-gray-900 mr-2">
                            {reviewStats.averageRating.toFixed(1)}
                          </span>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) =>
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= Math.floor(reviewStats.averageRating) ? 'text-yellow-400 fill-current' : star <= reviewStats.averageRating ? 'text-yellow-400 fill-current opacity-50' : 'text-gray-300'}`} />

                          )}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Based on {reviewStats.totalReviews} reviews
                      </div>
                    </div>
                  </div>
                  {/* Trust Indicators */}
                  <div className="lg:col-span-2">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      Reader Trust Indicators
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {reviewStats.percentTrustworthy}%
                        </div>
                        <div className="text-sm text-gray-700">
                          Find this author trustworthy
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {reviewStats.percentExpertise}%
                        </div>
                        <div className="text-sm text-gray-700">
                          Recognize expertise
                        </div>
                      </div>
                      <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-1">
                          {reviewStats.percentWouldReadMore}%
                        </div>
                        <div className="text-sm text-gray-700">
                          Would read more from this author
                        </div>
                      </div>
                    </div>
                    <div className="mt-6">
                      <button
                      onClick={() => setShowReviewModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors">

                        Write a Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((review) =>
              <div
                key={review.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center mb-1">
                          <div className="flex mr-2">
                            {[1, 2, 3, 4, 5].map((star) =>
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />

                        )}
                          </div>
                          <span className="text-gray-700 font-medium">
                            {review.reviewer}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {review.date} • Reviewed "{review.articleTitle}"
                        </div>
                      </div>
                      {review.flags > 0 &&
                  <div className="flex items-center text-red-600 text-sm font-medium">
                          <Flag className="h-4 w-4 mr-1" />
                          Flagged ({review.flags})
                        </div>
                  }
                    </div>
                    <p className="text-gray-700 mb-4">{review.comment}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {review.trustworthy &&
                  <div className="flex items-center bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                          <Check className="h-3 w-3 mr-1" />
                          Trustworthy
                        </div>
                  }
                      {review.expertise &&
                  <div className="flex items-center bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full">
                          <Check className="h-3 w-3 mr-1" />
                          Shows Expertise
                        </div>
                  }
                      {review.wouldReadMore &&
                  <div className="flex items-center bg-purple-50 text-purple-700 text-xs font-medium px-2.5 py-1 rounded-full">
                          <Check className="h-3 w-3 mr-1" />
                          Would Read More
                        </div>
                  }
                    </div>
                    <div className="flex justify-between items-center">
                      <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful ({review.helpfulCount})
                      </button>
                      <button className="text-sm text-gray-500 hover:text-gray-700">
                        Report
                      </button>
                    </div>
                  </div>
              )}
              </div>
            </div>
          }
          {/* About Tab */}
          {activeTab === 'about' &&
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Bio and Credentials */}
              <div className="lg:col-span-2 space-y-6">
                {/* Bio Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Biography
                  </h2>
                  <div className="bg-gray-50 p-4 rounded-lg text-gray-700">
                    <p>{author.bio}</p>
                  </div>
                </div>
                {/* Credentials Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Credentials
                  </h2>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    {author.credentials.map((credential, index) =>
                  <li key={index}>{credential}</li>
                  )}
                  </ul>
                </div>
                {/* Coverage Areas */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Coverage Areas
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {author.coverageAreas.map((area, index) =>
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">

                        {area}
                      </span>
                  )}
                  </div>
                </div>
              </div>
              {/* Right Column - Verification and Contact */}
              <div className="lg:col-span-1 space-y-6">
                {/* Verification Status */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Verification Status
                  </h2>
                  <div className="space-y-3">
                    {author.verifications.map((verification, index) =>
                  <div
                    key={index}
                    className="flex items-center text-green-700">

                        <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                        <span>{verification}</span>
                      </div>
                  )}
                  </div>
                </div>
                {/* Contact Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <Mail className="h-5 w-5 mr-2 text-gray-500" />
                      <a
                      href={`mailto:${author.contact.email}`}
                      className="hover:text-blue-600">

                        {author.contact.email}
                      </a>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Phone className="h-5 w-5 mr-2 text-gray-500" />
                      <a
                      href={`tel:${author.contact.phone}`}
                      className="hover:text-blue-600">

                        {author.contact.phone}
                      </a>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Globe className="h-5 w-5 mr-2 text-gray-500" />
                      <a
                      href={`https://${author.contact.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600">

                        {author.contact.website}
                      </a>
                    </div>
                  </div>
                </div>
                {/* Social Media */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Social Media
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <Twitter className="h-5 w-5 mr-2 text-blue-400" />
                      <a
                      href={`https://twitter.com/${author.contact.twitter.substring(1)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600">

                        {author.contact.twitter}
                      </a>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Facebook className="h-5 w-5 mr-2 text-blue-600" />
                      <a
                      href={`https://facebook.com/${author.contact.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600">

                        {author.contact.facebook}
                      </a>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Linkedin className="h-5 w-5 mr-2 text-blue-700" />
                      <a
                      href={`https://linkedin.com/in/${author.contact.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600">

                        {author.contact.linkedin}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
      {/* Share Profile Modal */}
      {showShareModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Share {author.name}'s Profile
                </h2>
                <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-500">

                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center">
                <img
                src={author.avatar}
                alt={author.name}
                className="w-12 h-12 rounded-full mr-4" />

                <div>
                  <p className="font-medium text-gray-900">{author.name}</p>
                  <p className="text-sm text-gray-500">{author.title}</p>
                </div>
              </div>
              <div className="space-y-4">
                {/* Copy Link */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Share with link
                  </p>
                  <div className="flex">
                    <div className="flex-1 bg-gray-50 border border-gray-300 rounded-l-md px-3 py-2 text-gray-700 text-sm truncate">
                      {`${window.location.origin}/author/${author.id}`}
                    </div>
                    <button
                    onClick={handleCopyLink}
                    className={`px-4 py-2 rounded-r-md font-medium text-sm flex items-center ${linkCopied ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>

                      {linkCopied ?
                    <>
                          <Check className="h-4 w-4 mr-1.5" />
                          Copied
                        </> :

                    <>
                          <Copy className="h-4 w-4 mr-1.5" />
                          Copy
                        </>
                    }
                    </button>
                  </div>
                </div>
                {/* Share via Social Media */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Share via social media
                  </p>
                  <div className="flex space-x-2">
                    <button
                    className="flex-1 py-2 bg-[#1DA1F2] text-white rounded-md font-medium hover:bg-[#1a94df] transition-colors flex items-center justify-center"
                    onClick={() => {
                      window.open(
                        `https://twitter.com/intent/tweet?text=Check out ${author.name}'s journalism on Day.news&url=${window.location.href}`,
                        '_blank'
                      );
                    }}>

                      <Twitter className="h-4 w-4 mr-1.5" />
                      Twitter
                    </button>
                    <button
                    className="flex-1 py-2 bg-[#1877F2] text-white rounded-md font-medium hover:bg-[#166fe5] transition-colors flex items-center justify-center"
                    onClick={() => {
                      window.open(
                        `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`,
                        '_blank'
                      );
                    }}>

                      <Facebook className="h-4 w-4 mr-1.5" />
                      Facebook
                    </button>
                    <button
                    className="flex-1 py-2 bg-[#0A66C2] text-white rounded-md font-medium hover:bg-[#095fb8] transition-colors flex items-center justify-center"
                    onClick={() => {
                      window.open(
                        `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`,
                        '_blank'
                      );
                    }}>

                      <Linkedin className="h-4 w-4 mr-1.5" />
                      LinkedIn
                    </button>
                  </div>
                </div>
                {/* Share via Email */}
                <div>
                  <button
                  onClick={handleShareViaEmail}
                  className="w-full py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors flex items-center justify-center">

                    <Mail className="h-4 w-4 mr-1.5" />
                    Share via Email
                  </button>
                </div>
              </div>
              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors">

                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      {/* Report Author Modal */}
      {showReportModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Report Author
                </h2>
                <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-500">

                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center">
                <img
                src={author.avatar}
                alt={author.name}
                className="w-12 h-12 rounded-full mr-4" />

                <div>
                  <p className="font-medium text-gray-900">{author.name}</p>
                  <p className="text-sm text-gray-500">{author.title}</p>
                </div>
              </div>
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 flex items-start">
                <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                <p>
                  Our team reviews all reports to ensure our community standards
                  are maintained. Please provide as much detail as possible.
                </p>
              </div>
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <div>
                  <label
                  htmlFor="report-reason"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Reason for reporting
                  </label>
                  <select
                  id="report-reason"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  required>

                    <option value="">Select a reason</option>
                    {reportReasons.map((reason) =>
                  <option key={reason} value={reason}>
                        {reason}
                      </option>
                  )}
                  </select>
                </div>
                <div>
                  <label
                  htmlFor="report-details"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Additional details
                  </label>
                  <textarea
                  id="report-details"
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Please provide specific examples and details about your concern..."
                  required>
                </textarea>
                </div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                    id="report-terms"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    required />

                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="report-terms" className="text-gray-700">
                      I confirm this report is truthful and made in good faith
                    </label>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50">

                    Cancel
                  </button>
                  <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!reportReason || !reportDetails}>

                    Submit Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }
      {/* Report Confirmation Modal */}
      {showReportConfirmation &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Report Submitted
            </h3>
            <p className="text-gray-600 mb-6">
              Thank you for your report. Our moderation team will review it and
              take appropriate action if necessary.
            </p>
            <button
            onClick={() => setShowReportConfirmation(false)}
            className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors">

              Close
            </button>
          </div>
        </div>
      }
      {/* Message Modal */}
      {showMessageModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Message to {author.name}
                </h2>
                <button
                onClick={() => setShowMessageModal(false)}
                className="text-gray-400 hover:text-gray-500">

                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center">
                <img
                src={author.avatar}
                alt={author.name}
                className="w-10 h-10 rounded-full mr-3" />

                <div>
                  <p className="font-medium text-gray-900">{author.name}</p>
                  <p className="text-sm text-gray-500">{author.title}</p>
                </div>
              </div>
              <form className="space-y-4">
                <div>
                  <label
                  htmlFor="message-subject"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Subject
                  </label>
                  <input
                  type="text"
                  id="message-subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter a subject" />

                </div>
                <div>
                  <label
                  htmlFor="message-content"
                  className="block text-sm font-medium text-gray-700 mb-1">

                    Message
                  </label>
                  <textarea
                  id="message-content"
                  rows={5}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Write your message here...">
                </textarea>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50">

                    Cancel
                  </button>
                  <button
                  type="button"
                  onClick={() => {
                    alert('Message sent!');
                    setShowMessageModal(false);
                    setMessageText('');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">

                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }
      {/* Review Author Modal */}
      {showReviewModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Review Author
                </h2>
                <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-gray-500">

                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-6 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                <p>
                  You are reviewing{' '}
                  <span className="font-medium">{author.name}</span> based on
                  their article:
                </p>
                <p className="font-medium mt-1">"{articles[0].title}"</p>
              </div>
              <form className="space-y-6">
                {/* Star Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) =>
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none">

                        <Star
                      className={`h-8 w-8 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />

                      </button>
                  )}
                  </div>
                </div>
                {/* Trust Questions */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Please answer the following:
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                      id="trustworthy"
                      name="trustworthy"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded" />

                      <label
                      htmlFor="trustworthy"
                      className="ml-2 block text-sm text-gray-700">

                        I find this author trustworthy
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                      id="expertise"
                      name="expertise"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded" />

                      <label
                      htmlFor="expertise"
                      className="ml-2 block text-sm text-gray-700">

                        This author demonstrates expertise in their field
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                      id="readMore"
                      name="readMore"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded" />

                      <label
                      htmlFor="readMore"
                      className="ml-2 block text-sm text-gray-700">

                        I would read more content from this author
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                      id="aiDetected"
                      name="aiDetected"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded" />

                      <label
                      htmlFor="aiDetected"
                      className="ml-2 block text-sm text-gray-700">

                        I suspect this content was primarily AI-generated
                      </label>
                    </div>
                  </div>
                </div>
                {/* Flag Concerns */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Flag any concerns (optional):
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                      id="inaccurate"
                      name="inaccurate"
                      type="checkbox"
                      className="h-4 w-4 text-red-600 border-gray-300 rounded" />

                      <label
                      htmlFor="inaccurate"
                      className="ml-2 block text-sm text-gray-700">

                        Contains inaccurate information
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                      id="biased"
                      name="biased"
                      type="checkbox"
                      className="h-4 w-4 text-red-600 border-gray-300 rounded" />

                      <label
                      htmlFor="biased"
                      className="ml-2 block text-sm text-gray-700">

                        Shows significant bias
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                      id="poorSources"
                      name="poorSources"
                      type="checkbox"
                      className="h-4 w-4 text-red-600 border-gray-300 rounded" />

                      <label
                      htmlFor="poorSources"
                      className="ml-2 block text-sm text-gray-700">

                        Poor or missing sources
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                      id="misleading"
                      name="misleading"
                      type="checkbox"
                      className="h-4 w-4 text-red-600 border-gray-300 rounded" />

                      <label
                      htmlFor="misleading"
                      className="ml-2 block text-sm text-gray-700">

                        Misleading content
                      </label>
                    </div>
                  </div>
                </div>
                {/* Comments */}
                <div>
                  <label
                  htmlFor="comments"
                  className="block text-sm font-medium text-gray-700 mb-2">

                    Comments (optional):
                  </label>
                  <textarea
                  id="comments"
                  name="comments"
                  rows={3}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Share your thoughts about this author's work..." />

                </div>
                {/* Post Anonymously */}
                <div className="flex items-center">
                  <input
                  id="anonymous"
                  name="anonymous"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded" />

                  <label
                  htmlFor="anonymous"
                  className="ml-2 block text-sm text-gray-700">

                    Post anonymously
                  </label>
                </div>
                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50">

                    Cancel
                  </button>
                  <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={rating === 0}>

                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }
    </div>);

};
export default AuthorProfilePage;