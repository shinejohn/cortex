import React, { useEffect, useState, memo } from 'react';
// ISRCSR=CSR
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Grid,
  Layout,
  FileText,
  User,
  ShoppingBag,
  Calendar,
  MessageSquare,
  Tag,
  AlertTriangle,
  Briefcase,
  Scissors,
  Heart,
  Gavel,
  Archive,
  Newspaper,
  Settings,
  Edit,
  CheckSquare,
  ChevronRight,
  X,
  Eye,
  MapPin,
  ThermometerIcon,
  Globe,
  DollarSign,
  Shield,
  Bot,
  BarChart,
  Building,
  Rocket,
  Mic,
  Video,
  Upload,
  CreditCard,
  UserPlus,
  Headphones } from
'lucide-react';
// Define page categories and their icons
const categories = {
  main: {
    name: 'Main Pages',
    icon: <Layout />
  },
  user: {
    name: 'User Pages',
    icon: <User />
  },
  content: {
    name: 'Content Creation',
    icon: <Edit />
  },
  business: {
    name: 'Business',
    icon: <Briefcase />
  },
  advertising: {
    name: 'Advertising',
    icon: <Globe />
  },
  community: {
    name: 'Community',
    icon: <MessageSquare />
  },
  marketplace: {
    name: 'Marketplace',
    icon: <ShoppingBag />
  },
  events: {
    name: 'Events',
    icon: <Calendar />
  },
  legal: {
    name: 'Legal',
    icon: <Gavel />
  },
  utility: {
    name: 'Utility',
    icon: <Settings />
  },
  review: {
    name: 'Review',
    icon: <CheckSquare />
  },
  admin: {
    name: 'Admin Dashboard',
    icon: <Grid />
  },
  localVoices: {
    name: 'Local Voices',
    icon: <Mic />
  }
};
// Define all pages with metadata
const allPages = [
// Main Pages
{
  path: '/',
  name: 'Home Page',
  description: 'Main landing page with news and community content',
  category: 'main'
},
{
  path: '/home',
  name: 'Home Page (Alternate)',
  description: 'Alternate route to the main landing page',
  category: 'main'
},
{
  path: '/search',
  name: 'Search Results',
  description: 'Search results page for site-wide search',
  category: 'main'
},
{
  path: '/trending',
  name: 'Trending',
  description: 'Currently trending news and topics',
  category: 'main'
},
{
  path: '/tag',
  name: 'Tag Page',
  description: 'Content filtered by specific tags',
  category: 'main'
},
{
  path: '/about',
  name: 'About Us',
  description: 'Information about the organization',
  category: 'main'
},
{
  path: '/contact',
  name: 'Contact Us',
  description: 'Contact information and form',
  category: 'main'
},
{
  path: '/citySelection',
  name: 'City Selection',
  description: 'Select your city or location',
  category: 'main'
},
{
  path: '/archive',
  name: 'Archive Browser',
  description: 'Browse archived content',
  category: 'main'
},
// User Pages
{
  path: '/profile',
  name: 'User Profile',
  description: 'View and edit your profile information',
  category: 'user'
},
{
  path: '/register',
  name: 'User Registration',
  description: 'Register a new user account',
  category: 'user'
},
{
  path: '/author/:authorId',
  name: 'Author Profile',
  description: 'View author details, metrics, and articles',
  category: 'user',
  paramValue: '123' // Example author ID
},
{
  path: '/author/profile-creator',
  name: 'Author Profile Creator',
  description: 'Create and manage your author profile',
  category: 'user'
},
// Content Creation
{
  path: '/createNews',
  name: 'Create News',
  description: 'Legacy news creation page',
  category: 'content'
},
{
  path: '/create-article',
  name: 'Create Article (AI)',
  description: 'Create an article with AI assistance',
  category: 'content'
},
{
  path: '/create-article/metadata',
  name: 'Article Metadata',
  description: 'Edit article metadata and settings',
  category: 'content'
},
{
  path: '/create-article/review',
  name: 'Article Review',
  description: 'Review article before publishing',
  category: 'content'
},
{
  path: '/publish',
  name: 'Publish & Promote',
  description: 'Options for publishing and promotion',
  category: 'content'
},
// Business Pages
{
  path: '/business/:slug',
  name: 'Business Profile',
  description: 'View details about a specific business',
  category: 'business',
  paramValue: '1' // Example business ID
},
{
  path: '/business/create',
  name: 'Business Profile Creator',
  description: 'Create a new business profile',
  category: 'business'
},
{
  path: '/business/premium-enrollment',
  name: 'Premium Business Enrollment',
  description: 'Enroll a business in premium services',
  category: 'business'
},
{
  path: '/business/premium-success',
  name: 'Premium Enrollment Success',
  description: 'Confirmation page for successful premium enrollment',
  category: 'business'
},
{
  path: '/business-dashboard',
  name: 'Business Dashboard',
  description: 'Dashboard for business owners to manage their listings',
  category: 'business'
},
// Business
{
  path: '/businessDirectory',
  name: 'Business Directory',
  description: 'Directory of local businesses',
  category: 'business'
},
{
  path: '/advertisingDetail',
  name: 'Advertising Detail',
  description: 'Detailed view of an advertisement',
  category: 'business'
},
// Advertising
{
  path: '/community-ads',
  name: 'Community Ads Platform',
  description: 'Create and manage targeted community ad campaigns',
  category: 'advertising'
},
// Community
{
  path: '/announcements',
  name: 'Announcements',
  description: 'Community announcements and updates',
  category: 'community'
},
{
  path: '/announcementCreator',
  name: 'Announcement Creator',
  description: 'Create a new announcement',
  category: 'community'
},
{
  path: '/announcementDetail',
  name: 'Announcement Detail',
  description: 'Detailed view of an announcement',
  category: 'community'
},
{
  path: '/memorials',
  name: 'Memorials',
  description: 'Memorial notices and tributes',
  category: 'community'
},
{
  path: '/memorialDetail',
  name: 'Memorial Detail',
  description: 'Detailed view of a memorial',
  category: 'community'
},
// Marketplace
{
  path: '/classifieds',
  name: 'Classifieds',
  description: 'Classified advertisements',
  category: 'marketplace'
},
{
  path: '/postListing',
  name: 'Post Listing',
  description: 'Create a new classified listing',
  category: 'marketplace'
},
{
  path: '/coupons',
  name: 'Coupons',
  description: 'Browse available coupons and deals',
  category: 'marketplace'
},
{
  path: '/couponCreator',
  name: 'Coupon Creator',
  description: 'Create a new coupon',
  category: 'marketplace'
},
{
  path: '/couponDetail',
  name: 'Coupon Detail',
  description: 'Detailed view of a coupon',
  category: 'marketplace'
},
// Events
{
  path: '/eventsCalendar',
  name: 'Events Calendar',
  description: 'Calendar of upcoming events',
  category: 'events'
},
{
  path: '/eventDetail',
  name: 'Event Detail',
  description: 'Detailed view of an event',
  category: 'events'
},
// Legal
{
  path: '/legalNoticeCreator',
  name: 'Legal Notice Creator',
  description: 'Create a new legal notice',
  category: 'legal'
},
{
  path: '/legalNoticesList',
  name: 'Legal Notices List',
  description: 'List of all legal notices',
  category: 'legal'
},
{
  path: '/legalNoticeDetail',
  name: 'Legal Notice Detail',
  description: 'Detailed view of a legal notice',
  category: 'legal'
},
// Review
{
  path: '/review/queue',
  name: 'Community Review Queue',
  description: 'Queue of content waiting for community review',
  category: 'review'
},
// Admin/Utility
{
  path: '/journalists',
  name: 'Journalists Admin',
  description: 'Manage AI journalists and settings',
  category: 'utility'
},
{
  path: '/page-directory',
  name: 'Page Directory',
  description: 'Directory of all available pages',
  category: 'utility'
},
// Admin Dashboard Pages
{
  path: '/admin-dashboard',
  name: 'Admin Dashboard',
  description: 'Main administration dashboard with overview metrics',
  category: 'admin'
},
{
  path: '/content-management',
  name: 'Content Management',
  description: 'Manage all content across communities',
  category: 'admin'
},
{
  path: '/revenue-analytics',
  name: 'Revenue Analytics',
  description: 'Financial reporting and revenue tracking',
  category: 'admin'
},
{
  path: '/ai-agent-control',
  name: 'AI Agent Control',
  description: 'Configure and monitor AI journalist agents',
  category: 'admin'
},
{
  path: '/moderation-queue',
  name: 'Moderation Queue',
  description: 'Review and moderate flagged content',
  category: 'admin'
},
{
  path: '/community-deployment',
  name: 'Community Deployment',
  description: 'Set up and deploy new community instances',
  category: 'admin'
},
// Local Voices Pages
{
  path: '/local-voices',
  name: 'Local Voices Home',
  description: 'Main page for local podcasts and video content',
  category: 'localVoices'
},
{
  path: '/local-voices/pricing',
  name: 'Local Voices Pricing',
  description: 'Subscription plans and pricing for content creators',
  category: 'localVoices'
},
{
  path: '/local-voices/checkout',
  name: 'Local Voices Checkout',
  description: 'Payment processing for creator subscriptions',
  category: 'localVoices'
},
{
  path: '/local-voices/register',
  name: 'Creator Registration',
  description: 'Register as a Local Voices content creator',
  category: 'localVoices'
},
{
  path: '/local-voices/become-creator',
  name: 'Become a Creator',
  description: 'Alternative path to creator registration',
  category: 'localVoices'
},
{
  path: '/local-voices/dashboard',
  name: 'Creator Dashboard',
  description: 'Main dashboard for Local Voices creators',
  category: 'localVoices'
},
{
  path: '/local-voices/dashboard/edit-profile',
  name: 'Edit Creator Profile',
  description: 'Edit your Local Voices creator profile information',
  category: 'localVoices'
},
{
  path: '/local-voices/dashboard/podcast',
  name: 'Podcast Management',
  description: 'Manage your podcasts and video shows',
  category: 'localVoices'
},
{
  path: '/local-voices/dashboard/subscription',
  name: 'Subscription Management',
  description: 'Manage your Local Voices creator subscription',
  category: 'localVoices'
},
{
  path: '/local-voices/upload',
  name: 'Episode Upload',
  description: 'Upload new podcast or video episodes',
  category: 'localVoices'
},
{
  path: '/local-voices/creator/:creator_slug',
  name: 'Creator Profile',
  description: 'Public profile page for Local Voices creators',
  category: 'localVoices',
  paramValue: 'john-doe'
},
{
  name: 'Episode Marketplace',
  description: 'Browse and discover episodes from local creators',
  path: '/local-voices/episodes',
  category: 'localVoices',
  icon: <Headphones className="h-5 w-5" />
}];

export const PageDirectory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredPages, setFilteredPages] = useState(allPages);
  // Filter pages based on search query and selected category
  useEffect(() => {
    let result = allPages;
    // Filter by category if not 'all'
    if (selectedCategory !== 'all') {
      result = result.filter((page) => page.category === selectedCategory);
    }
    // Filter by search query if present
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (page) =>
        page.name.toLowerCase().includes(query) ||
        page.description.toLowerCase().includes(query) ||
        page.path.toLowerCase().includes(query)
      );
    }
    setFilteredPages(result);
  }, [searchQuery, selectedCategory]);
  // Navigate to a page
  const handleNavigate = (path) => {
    // Handle paths with parameters
    if (path.includes(':')) {
      const page = allPages.find((p) => p.path === path);
      if (page && page.paramValue) {
        const finalPath = path.replace(/:([^/]+)/g, page.paramValue);
        navigate(finalPath);
      } else {
        console.error('Cannot navigate to page with parameters without a value');
      }
    } else {
      navigate(path);
    }
  };
  // Count pages by category
  const countByCategory = Object.keys(categories).reduce((acc, category) => {
    acc[category] = allPages.filter((page) => page.category === category).length;
    return acc;
  }, {});
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

      {/* Page Content */}
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <Grid className="mr-2 h-6 w-6 text-news-primary" />
              Page Directory
            </h1>
            <p className="text-gray-600 mb-6">
              Browse and navigate to all available pages in the application
            </p>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search pages by name, description or path..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-news-primary focus:border-news-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)} />

                {searchQuery &&
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">

                    <X className="h-5 w-5" />
                  </button>
                }
              </div>
              <div className="flex-shrink-0">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full md:w-60 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-news-primary focus:border-news-primary">

                  <option value="all">
                    All Categories ({allPages.length})
                  </option>
                  {Object.entries(categories).map(([key, { name }]) =>
                  <option key={key} value={key}>
                      {name} ({countByCategory[key] || 0})
                    </option>
                  )}
                </select>
              </div>
            </div>

            {/* Current Page Indicator */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-800 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span>
                  <strong>Current page:</strong> {location.pathname}
                </span>
              </p>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {Object.entries(categories).
              filter(
                ([key]) =>
                selectedCategory === 'all' || key === selectedCategory
              ).
              filter(([key]) => {
                const pagesInCategory = filteredPages.filter(
                  (p) => p.category === key
                );
                return pagesInCategory.length > 0;
              }).
              map(([key, { name, icon }]) => {
                const pagesInCategory = filteredPages.filter(
                  (p) => p.category === key
                );
                return (
                  <div
                    key={key}
                    className="border border-gray-200 rounded-lg overflow-hidden">

                      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center">
                        <div className="mr-2 text-news-primary">{icon}</div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {name}
                        </h2>
                        <span className="ml-2 text-sm text-gray-500">
                          ({pagesInCategory.length}{' '}
                          {pagesInCategory.length === 1 ? 'page' : 'pages'})
                        </span>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {pagesInCategory.map((page) =>
                      <div
                        key={page.path}
                        className={`px-6 py-4 hover:bg-gray-50 transition-colors ${location.pathname === page.path ? 'bg-blue-50' : ''}`}>

                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {page.name}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {page.description}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 font-mono">
                                  {page.path}
                                </p>
                              </div>
                              <button
                            onClick={() => handleNavigate(page.path)}
                            className="flex items-center text-news-primary hover:text-news-primary-dark text-sm font-medium ml-4">

                                <Eye className="h-4 w-4 mr-1" />
                                Visit
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </button>
                            </div>
                          </div>
                      )}
                      </div>
                    </div>);

              })}
              {filteredPages.length === 0 &&
              <div className="text-center py-12">
                  <p className="text-gray-500">
                    No pages found matching your criteria
                  </p>
                </div>
              }
            </div>
          </div>
        </div>
      </main>
    </div>);

};
export default PageDirectory;