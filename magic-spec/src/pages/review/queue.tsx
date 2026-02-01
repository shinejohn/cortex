import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  MapPin,
  ThermometerIcon,
  Home,
  ChevronDown,
  User,
  Star,
  Flag,
  ThumbsUp,
  ThumbsDown,
  Filter,
  ArrowUpDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle } from
'lucide-react';
const CommunityReviewQueuePage = () => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('All Articles');
  const [sortType, setSortType] = useState('Newest');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  // Mock data for articles
  const articles = [
  {
    id: 1,
    title: 'Clearwater Community Center Reopens After $3.2M Renovation',
    aiScore: 74,
    communityScore: 4.2,
    reviewCount: 12,
    author: 'Sarah Johnson',
    authorTrustScore: 4.8,
    preview:
    'The Clearwater Community Center officially reopened its doors yesterday following an extensive $3.2 million renovation project. The updated facility now features improved accessibility, modernized meeting spaces, and expanded recreational areas.',
    flagCount: 0,
    upvotes: 28,
    downvotes: 3,
    status: 'pending'
  },
  {
    id: 2,
    title: 'City Council Approves New Downtown Development Plan',
    aiScore: 82,
    communityScore: 3.7,
    reviewCount: 8,
    author: 'Michael Chen',
    authorTrustScore: 3.9,
    preview:
    'In a 4-1 vote Tuesday night, the Clearwater City Council approved a controversial new development plan for the downtown area. The plan includes provisions for mixed-use buildings, expanded parking, and pedestrian-friendly walkways.',
    flagCount: 2,
    upvotes: 15,
    downvotes: 7,
    status: 'flagged'
  },
  {
    id: 3,
    title: 'Local School District Announces New STEM Program',
    aiScore: 91,
    communityScore: 4.9,
    reviewCount: 18,
    author: 'Emily Rodriguez',
    authorTrustScore: 4.7,
    preview:
    'Clearwater School District has secured a $1.5 million grant to implement a comprehensive STEM program across all elementary schools. The initiative will provide students with hands-on experience in science, technology, engineering, and mathematics.',
    flagCount: 0,
    upvotes: 42,
    downvotes: 1,
    status: 'approved'
  },
  {
    id: 4,
    title: 'Annual Beach Cleanup Event Draws Record Participation',
    aiScore: 88,
    communityScore: 4.6,
    reviewCount: 14,
    author: 'David Wilson',
    authorTrustScore: 4.2,
    preview:
    'More than 500 volunteers gathered at Clearwater Beach this Saturday for the annual coastal cleanup event, setting a new record for participation. Volunteers collected over 2,000 pounds of trash and recyclable materials.',
    flagCount: 0,
    upvotes: 36,
    downvotes: 2,
    status: 'approved'
  },
  {
    id: 5,
    title: 'Opinion: Why We Need More Public Transportation Options',
    aiScore: 68,
    communityScore: 3.1,
    reviewCount: 22,
    author: 'James Thompson',
    authorTrustScore: 3.5,
    preview:
    'As Clearwater continues to grow, our public transportation system is failing to keep pace with our needs. This opinion piece argues for expanded bus routes, dedicated bike lanes, and the exploration of light rail options.',
    flagCount: 5,
    upvotes: 19,
    downvotes: 14,
    status: 'flagged'
  }];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <div className="h-2 w-2 bg-yellow-400 rounded-full mr-2" />;
      case 'flagged':
        return <AlertTriangle className="h-4 w-4 text-red-500 mr-1.5" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500 mr-1.5" />;
      default:
        return null;
    }
  };
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending Review';
      case 'flagged':
        return 'Flagged';
      case 'approved':
        return 'Approved';
      default:
        return '';
    }
  };
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'flagged':
        return 'bg-red-100 text-red-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const filterOptions = [
  'All Articles',
  'Pending Review',
  'Flagged',
  'Approved'];

  const sortOptions = ['Newest', 'AI Score', 'Community Score', 'Most Flagged'];
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
      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 py-8">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <h1 className="font-display text-4xl font-black uppercase tracking-tight text-news-primary">
            DAY.NEWS CLEARWATER
          </h1>
          <p className="text-gray-600 italic mt-1">
            "Your Community, Your News"
          </p>
        </div>
      </header>
      {/* Navigation Bar */}
      <nav className="bg-gray-100 border-b border-gray-200 py-3 sticky top-10 z-40">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center space-x-6 overflow-x-auto">
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

              Legal Notices
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-news-primary font-medium">

              Business
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-news-primary font-medium">

              Events
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-news-primary font-medium">

              Government
            </a>
            <a
              href="#"
              className="text-news-primary font-semibold border-b-2 border-news-primary pb-1">

              Community Review
            </a>
          </div>
        </div>
      </nav>
      {/* Main Content */}
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Page Title */}
          <div className="flex items-center mb-8">
            <Users className="h-8 w-8 text-news-primary mr-3" />
            <h1 className="text-3xl font-display font-bold text-gray-900">
              Community Review Queue
            </h1>
          </div>
          {/* Filters Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="flex flex-col sm:flex-row gap-3 mb-3 sm:mb-0">
                {/* Filter Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
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
                Showing {articles.length} articles
              </div>
            </div>
          </div>
          {/* Article Cards List */}
          <div className="space-y-4">
            {articles.map((article) =>
            <div
              key={article.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">

                {/* Header Section */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <div className="flex items-center mb-1">
                        {getStatusIcon(article.status)}
                        <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusClass(article.status)}`}>

                          {getStatusText(article.status)}
                        </span>
                      </div>
                      <h3 className="text-xl font-display font-semibold text-gray-900">
                        {article.title}
                      </h3>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center mb-1">
                        <span className="text-sm text-gray-600 mr-2">
                          AI Score:
                        </span>
                        <span
                        className={`text-xl font-bold ${article.aiScore >= 80 ? 'text-green-600' : article.aiScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>

                          {article.aiScore}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600 mr-2">
                          Community:
                        </span>
                        <div className="flex items-center">
                          <span className="text-lg font-bold text-blue-600">
                            {article.communityScore}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({article.reviewCount} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Author Info Bar */}
                <div className="px-4 py-2 bg-gray-50 flex items-center">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-500 mr-1.5" />
                    <span className="text-sm text-gray-700">
                      {article.author}
                    </span>
                  </div>
                  <span className="mx-3 text-gray-300">|</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1.5" />
                    <span className="text-sm text-gray-700">
                      Trust Score: {article.authorTrustScore}/5
                    </span>
                  </div>
                </div>
                {/* Preview Text */}
                <div className="p-4">
                  <p className="text-gray-700 line-clamp-2">
                    {article.preview}
                  </p>
                </div>
                {/* Footer Section */}
                <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Flag
                      className={`h-4 w-4 ${article.flagCount > 0 ? 'text-red-500' : 'text-gray-400'} mr-1`} />

                      <span
                      className={`text-sm ${article.flagCount > 0 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>

                        {article.flagCount}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <ThumbsUp className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">
                        {article.upvotes}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <ThumbsDown className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">
                        {article.downvotes}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1.5 bg-white border border-red-500 text-red-600 rounded text-sm font-medium hover:bg-red-50">
                      Flag Issue
                    </button>
                    <button className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50">
                      Quick Review
                    </button>
                    <button className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700">
                      Read Full
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Load More Section */}
          <div className="mt-8 flex justify-center">
            <button className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
              Load More Articles
            </button>
          </div>
        </div>
      </main>
    </div>);

};
export default CommunityReviewQueuePage;