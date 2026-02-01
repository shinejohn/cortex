import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronDown,
  Star,
  FileText,
  Eye,
  ThumbsUp,
  Award,
  Check,
  MapPin,
  X,
  Users,
  User,
  Calendar,
  Newspaper,
  BarChart2,
  Clock,
  Zap,
  ExternalLink } from
'lucide-react';
import { CommunitySelector } from '../components/location/CommunitySelector';
const AuthorsReportPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [authors, setAuthors] = useState([]);
  const [filteredAuthors, setFilteredAuthors] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState('Clearwater, FL');
  const [sortField, setSortField] = useState('trustScore');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterRole, setFilterRole] = useState('All');
  const [filterTrustTier, setFilterTrustTier] = useState('All');
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [showTrustTierFilter, setShowTrustTierFilter] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Mock author data - in a real app this would come from an API
  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setAuthors(mockAuthors);
      setFilteredAuthors(mockAuthors);
      setIsLoading(false);
    }, 800);
  }, []);
  // Filter and sort authors when filters, sort options, or search query change
  useEffect(() => {
    let result = [...authors];
    // Filter by role
    if (filterRole !== 'All') {
      result = result.filter((author) => author.role === filterRole);
    }
    // Filter by trust tier
    if (filterTrustTier !== 'All') {
      result = result.filter((author) => author.trustTier === filterTrustTier);
    }
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (author) =>
        author.name.toLowerCase().includes(query) ||
        author.recentArticles.some((article) =>
        article.title.toLowerCase().includes(query)
        )
      );
    }
    // Sort authors
    result.sort((a, b) => {
      let valueA, valueB;
      switch (sortField) {
        case 'name':
          valueA = a.name;
          valueB = b.name;
          break;
        case 'articles':
          valueA = a.articleCount;
          valueB = b.articleCount;
          break;
        case 'views':
          valueA = a.totalViews;
          valueB = b.totalViews;
          break;
        case 'engagement':
          valueA = a.engagement;
          valueB = b.engagement;
          break;
        case 'trustScore':
        default:
          valueA = a.trustScore;
          valueB = b.trustScore;
          break;
      }
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    setFilteredAuthors(result);
  }, [
  authors,
  filterRole,
  filterTrustTier,
  searchQuery,
  sortField,
  sortDirection]
  );
  // Handle author selection - navigate to author detail page
  const handleAuthorSelect = (authorId) => {
    navigate(`/author/${authorId}`);
  };
  // Handle sort change
  const handleSortChange = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setShowSortOptions(false);
  };
  // Get trust tier badge color
  const getTrustTierColor = (tier) => {
    switch (tier) {
      case 'Platinum':
        return 'bg-indigo-100 text-indigo-800';
      case 'Gold':
        return 'bg-yellow-100 text-yellow-800';
      case 'Silver':
        return 'bg-gray-200 text-gray-800';
      case 'Bronze':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Authors Report</h1>
            <div className="flex items-center">
              <div className="mr-4">
                <CommunitySelector />
              </div>
              <button
                onClick={() => navigate('/author/profile-creator')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors">

                Register as Author
              </button>
            </div>
          </div>
          <p className="text-gray-600 mt-1">
            Browse and discover community journalists and contributors
          </p>
        </div>
      </div>
      {/* Filters and Search */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search authors or articles..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} />

                {searchQuery &&
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchQuery('')}>

                    <X className="h-4 w-4" />
                  </button>
                }
              </div>
              {/* Role Filter */}
              <div className="relative">
                <button
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowRoleFilter(!showRoleFilter)}>

                  <Filter className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">Role: {filterRole}</span>
                  <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
                </button>
                {showRoleFilter &&
                <div className="absolute mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-40">
                    <div className="py-1">
                      {[
                    'All',
                    'Community Journalist',
                    'Editor',
                    'Contributor',
                    'Specialist'].
                    map((role) =>
                    <button
                      key={role}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setFilterRole(role);
                        setShowRoleFilter(false);
                      }}>

                          {role}
                        </button>
                    )}
                    </div>
                  </div>
                }
              </div>
              {/* Trust Tier Filter */}
              <div className="relative">
                <button
                  className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowTrustTierFilter(!showTrustTierFilter)}>

                  <Award className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm">Tier: {filterTrustTier}</span>
                  <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
                </button>
                {showTrustTierFilter &&
                <div className="absolute mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-40">
                    <div className="py-1">
                      {['All', 'Platinum', 'Gold', 'Silver', 'Bronze'].map(
                      (tier) =>
                      <button
                        key={tier}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                          setFilterTrustTier(tier);
                          setShowTrustTierFilter(false);
                        }}>

                            {tier}
                          </button>

                    )}
                    </div>
                  </div>
                }
              </div>
            </div>
            {/* Sort Options */}
            <div className="relative">
              <button
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                onClick={() => setShowSortOptions(!showSortOptions)}>

                <ArrowUpDown className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm">
                  Sort by:{' '}
                  {sortField.charAt(0).toUpperCase() + sortField.slice(1)}
                </span>
                <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
              </button>
              {showSortOptions &&
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-40">
                  <div className="py-1">
                    <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleSortChange('trustScore')}>

                      Trust Score
                    </button>
                    <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleSortChange('name')}>

                      Name
                    </button>
                    <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleSortChange('articles')}>

                      Articles Count
                    </button>
                    <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleSortChange('views')}>

                      Total Views
                    </button>
                    <button
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleSortChange('engagement')}>

                      Engagement
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
      {/* Results Summary */}
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Showing {filteredAuthors.length} authors in {selectedCommunity}
          </div>
          <div className="text-sm text-gray-600">
            {sortDirection === 'desc' ? 'Highest' : 'Lowest'} {sortField} first
          </div>
        </div>
      </div>
      {/* Authors Grid */}
      <div className="container mx-auto px-4 pb-12 max-w-7xl">
        {isLoading ?
        // Loading state
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) =>
          <div
            key={i}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">

                <div className="flex items-center space-x-4">
                  <div className="rounded-full bg-gray-200 h-16 w-16"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
                <div className="mt-4 flex justify-between">
                  <div className="h-8 bg-gray-200 rounded w-28"></div>
                  <div className="h-8 bg-gray-200 rounded w-28"></div>
                </div>
              </div>
          )}
          </div> :
        filteredAuthors.length > 0 ?
        // Authors grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuthors.map((author) =>
          <div
            key={author.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">

                <div className="p-6">
                  <div className="flex items-start">
                    {/* Author Avatar and Basic Info */}
                    <div className="flex-shrink-0 mr-4">
                      <div className="relative">
                        <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-16 h-16 rounded-full object-cover" />

                        {author.verified &&
                    <div className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 shadow-md">
                            <Check className="h-3 w-3" />
                          </div>
                    }
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-lg text-gray-900 hover:text-blue-600">
                        <button onClick={() => handleAuthorSelect(author.id)}>
                          {author.name}
                        </button>
                      </h3>
                      <p className="text-gray-600 text-sm">{author.role}</p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{author.location}</span>
                        <span className="mx-1.5">•</span>
                        <span>Since {author.memberSince}</span>
                      </div>
                    </div>
                  </div>
                  {/* Trust Score and Metrics */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-2xl font-bold text-blue-600 mr-2">
                        {author.trustScore}
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) =>
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= Math.round(author.trustScore) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />

                    )}
                      </div>
                    </div>
                    <div
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTrustTierColor(author.trustTier)}`}>

                      <Award className="h-3 w-3 mr-1" />
                      {author.trustTier}
                    </div>
                  </div>
                  {/* Activity Metrics */}
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-lg font-semibold text-gray-800">
                        {author.articleCount}
                      </div>
                      <div className="text-xs text-gray-500">Articles</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-lg font-semibold text-gray-800">
                        {author.totalViews.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">Views</div>
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <div className="text-lg font-semibold text-gray-800">
                        {author.engagement}%
                      </div>
                      <div className="text-xs text-gray-500">Engagement</div>
                    </div>
                  </div>
                  {/* Recent Article */}
                  {author.recentArticles.length > 0 &&
              <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="text-xs font-medium text-gray-500 mb-2">
                        RECENT ARTICLE
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-1">
                        <a href="#">{author.recentArticles[0].title}</a>
                      </h4>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{author.recentArticles[0].date}</span>
                        <span className="mx-1.5">•</span>
                        <Eye className="h-3 w-3 mr-1" />
                        <span>
                          {author.recentArticles[0].views.toLocaleString()}{' '}
                          views
                        </span>
                      </div>
                    </div>
              }
                  {/* Action Buttons */}
                  <div className="mt-4 flex space-x-3">
                    <button
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
                  onClick={() => handleAuthorSelect(author.id)}>

                      <User className="h-4 w-4 mr-1.5" />
                      View Profile
                    </button>
                    <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                      <Newspaper className="h-4 w-4 mr-1.5" />
                      See Articles
                    </button>
                  </div>
                </div>
              </div>
          )}
          </div> :

        // No results
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No authors found
            </h3>
            <p className="text-gray-600 mb-6">
              No authors match your current search criteria. Try adjusting your
              filters or search query.
            </p>
            <button
            onClick={() => {
              setSearchQuery('');
              setFilterRole('All');
              setFilterTrustTier('All');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors">

              Reset Filters
            </button>
          </div>
        }
      </div>
    </div>);

};
// Mock data for authors
const mockAuthors = [
{
  id: '123',
  name: 'Sarah Johnson',
  role: 'Community Journalist',
  location: 'Clearwater, FL',
  memberSince: 'May 2022',
  verified: true,
  avatar:
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
  trustScore: 4.8,
  trustTier: 'Gold',
  articleCount: 142,
  totalViews: 287450,
  engagement: 91,
  recentArticles: [
  {
    title: 'Clearwater Community Center Reopens After $3.2M Renovation',
    date: 'August 2, 2024',
    views: 4523
  }]

},
{
  id: '124',
  name: 'Michael Chen',
  role: 'Editor',
  location: 'Clearwater, FL',
  memberSince: 'January 2021',
  verified: true,
  avatar:
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
  trustScore: 4.9,
  trustTier: 'Platinum',
  articleCount: 218,
  totalViews: 542680,
  engagement: 94,
  recentArticles: [
  {
    title:
    'City Council Approves Funding for New Public Transportation Initiative',
    date: 'July 28, 2024',
    views: 6752
  }]

},
{
  id: '125',
  name: 'Emily Rodriguez',
  role: 'Specialist',
  location: 'Clearwater, FL',
  memberSince: 'March 2023',
  verified: true,
  avatar:
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
  trustScore: 4.6,
  trustTier: 'Gold',
  articleCount: 87,
  totalViews: 156320,
  engagement: 88,
  recentArticles: [
  {
    title:
    'Environmental Impact Study Reveals Positive Changes in Local Marine Life',
    date: 'August 1, 2024',
    views: 3245
  }]

},
{
  id: '126',
  name: 'David Wilson',
  role: 'Community Journalist',
  location: 'Clearwater, FL',
  memberSince: 'November 2022',
  verified: false,
  avatar:
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
  trustScore: 4.2,
  trustTier: 'Silver',
  articleCount: 65,
  totalViews: 98750,
  engagement: 83,
  recentArticles: [
  {
    title: 'Local Business Spotlight: The Rise of Artisanal Coffee Shops',
    date: 'July 25, 2024',
    views: 2187
  }]

},
{
  id: '127',
  name: 'Jennifer Lee',
  role: 'Contributor',
  location: 'Clearwater, FL',
  memberSince: 'February 2024',
  verified: false,
  avatar:
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
  trustScore: 3.8,
  trustTier: 'Bronze',
  articleCount: 12,
  totalViews: 18430,
  engagement: 76,
  recentArticles: [
  {
    title: 'Clearwater Youth Orchestra Prepares for Summer Concert Series',
    date: 'July 20, 2024',
    views: 1245
  }]

},
{
  id: '128',
  name: 'Robert Martinez',
  role: 'Specialist',
  location: 'Clearwater, FL',
  memberSince: 'April 2021',
  verified: true,
  avatar:
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
  trustScore: 4.7,
  trustTier: 'Gold',
  articleCount: 104,
  totalViews: 234890,
  engagement: 89,
  recentArticles: [
  {
    title: "Analysis: How Clearwater's Housing Market Is Evolving in 2024",
    date: "July 31, 2024'",
    views: 5678
  }]

},
{
  id: '129',
  name: 'Lisa Thompson',
  role: 'Editor',
  location: 'Clearwater, FL',
  memberSince: 'June 2020',
  verified: true,
  avatar:
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
  trustScore: 4.9,
  trustTier: 'Platinum',
  articleCount: 256,
  totalViews: 612340,
  engagement: 95,
  recentArticles: [
  {
    title:
    'Editorial: The Future of Community Journalism in the Digital Age',
    date: 'August 3, 2024',
    views: 7823
  }]

},
{
  id: '130',
  name: 'James Parker',
  role: 'Community Journalist',
  location: 'Clearwater, FL',
  memberSince: 'September 2022',
  verified: true,
  avatar:
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
  trustScore: 4.5,
  trustTier: 'Silver',
  articleCount: 78,
  totalViews: 124560,
  engagement: 87,
  recentArticles: [
  {
    title: 'Clearwater Beach Tourism Reaches Record High This Summer',
    date: 'July 29, 2024',
    views: 4231
  }]

},
{
  id: '131',
  name: 'Maria Gonzalez',
  role: 'Contributor',
  location: 'Clearwater, FL',
  memberSince: 'January 2023',
  verified: false,
  avatar:
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
  trustScore: 4.0,
  trustTier: 'Bronze',
  articleCount: 24,
  totalViews: 34780,
  engagement: 79,
  recentArticles: [
  {
    title:
    'Local Artist Spotlight: Transforming Clearwater Through Public Murals',
    date: 'July 22, 2024',
    views: 1876
  }]

}];

export default AuthorsReportPage;