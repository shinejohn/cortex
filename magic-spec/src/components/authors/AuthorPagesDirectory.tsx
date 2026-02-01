import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Users,
  User,
  FileText,
  Edit,
  BarChart2,
  PlusCircle,
  ChevronRight,
  Search,
  Filter,
  Award,
  Star,
  CheckCircle,
  Clock,
  Settings,
  BookOpen,
  Eye } from
'lucide-react';
export const AuthorPagesDirectory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // List of all author-related pages
  const authorPages = [
  {
    path: '/authors',
    name: 'Authors Directory',
    description: 'Browse and discover all authors on the platform',
    icon: <Users className="h-6 w-6 text-blue-500" />,
    primaryAction: 'View Directory',
    category: 'main'
  },
  {
    path: '/author/profile-creator',
    name: 'Author Profile Creator',
    description: 'Create or update your author profile information',
    icon: <Edit className="h-6 w-6 text-green-500" />,
    primaryAction: 'Create Profile',
    category: 'profile'
  },
  {
    path: '/authors-report',
    name: 'Authors Analytics',
    description:
    'View detailed performance metrics and analytics for all authors',
    icon: <BarChart2 className="h-6 w-6 text-purple-500" />,
    primaryAction: 'View Analytics',
    category: 'analytics'
  },
  {
    path: '/author/123',
    name: 'Author Profile Page',
    description:
    'Public-facing profile page showing author information and articles',
    icon: <User className="h-6 w-6 text-indigo-500" />,
    primaryAction: 'View Sample Profile',
    category: 'profile'
  }];

  // Group pages by category
  const categories = {
    main: {
      name: 'Main Pages',
      description: 'Primary author directory pages'
    },
    profile: {
      name: 'Profile Pages',
      description: 'Author profile creation and management'
    },
    analytics: {
      name: 'Analytics & Reporting',
      description: 'Author performance metrics and statistics'
    }
  };
  const groupedPages = authorPages.reduce((acc, page) => {
    if (!acc[page.category]) {
      acc[page.category] = [];
    }
    acc[page.category].push(page);
    return acc;
  }, {});
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Users className="h-8 w-8 mr-3 text-blue-600" />
            Author Pages Directory
          </h1>
          <p className="text-gray-600 mt-1">
            Navigate to all author-related pages and functionality in the system
          </p>
        </div>
      </header>
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Current location indicator */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <p className="text-blue-800 flex items-center text-sm">
            <Clock className="h-4 w-4 mr-2" />
            <span>
              <strong>Current location:</strong> {location.pathname}
            </span>
          </p>
        </div>
        {/* Key actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/authors')}
              className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-blue-50 hover:border-blue-200 transition-colors">

              <Users className="h-6 w-6 text-blue-500 mr-3" />
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Browse Authors</h3>
                <p className="text-sm text-gray-500">
                  View all authors on the platform
                </p>
              </div>
            </button>
            <button
              onClick={() => navigate('/author/profile-creator')}
              className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-green-50 hover:border-green-200 transition-colors">

              <PlusCircle className="h-6 w-6 text-green-500 mr-3" />
              <div className="text-left">
                <h3 className="font-medium text-gray-900">Become an Author</h3>
                <p className="text-sm text-gray-500">
                  Create your author profile
                </p>
              </div>
            </button>
            <button
              onClick={() => navigate('/authors-report')}
              className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-purple-50 hover:border-purple-200 transition-colors">

              <BarChart2 className="h-6 w-6 text-purple-500 mr-3" />
              <div className="text-left">
                <h3 className="font-medium text-gray-900">View Analytics</h3>
                <p className="text-sm text-gray-500">
                  See author performance metrics
                </p>
              </div>
            </button>
          </div>
        </div>
        {/* All pages by category */}
        <div className="space-y-8">
          {Object.keys(groupedPages).map((category) =>
          <div
            key={category}
            className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">

              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {categories[category].name}
                </h2>
                <p className="text-sm text-gray-600">
                  {categories[category].description}
                </p>
              </div>
              <div className="divide-y divide-gray-100">
                {groupedPages[category].map((page) =>
              <div
                key={page.path}
                className={`p-6 hover:bg-gray-50 transition-colors ${location.pathname === page.path ? 'bg-blue-50' : ''}`}>

                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-4">{page.icon}</div>
                      <div className="flex-1">
                        <h3 className="font-medium text-lg text-gray-900">
                          {page.name}
                        </h3>
                        <p className="text-gray-600 mt-1">{page.description}</p>
                        <p className="text-sm text-gray-500 font-mono mt-1">
                          {page.path}
                        </p>
                        <button
                      onClick={() => navigate(page.path)}
                      className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">

                          {page.primaryAction}
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
              )}
              </div>
            </div>
          )}
        </div>
        {/* Features section */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Author Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-500 mr-3" />
                <h3 className="font-medium text-gray-900">
                  Author Verification
                </h3>
              </div>
              <p className="text-gray-600">
                Verified authors receive a badge on their profile and content,
                increasing credibility and trust with readers.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Star className="h-6 w-6 text-yellow-500 mr-3" />
                <h3 className="font-medium text-gray-900">Trust Tiers</h3>
              </div>
              <p className="text-gray-600">
                Authors progress through Bronze, Silver, Gold, and Platinum
                tiers based on content quality, engagement, and community
                feedback.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <BookOpen className="h-6 w-6 text-indigo-500 mr-3" />
                <h3 className="font-medium text-gray-900">
                  Article Publishing
                </h3>
              </div>
              <p className="text-gray-600">
                Authors can create, edit, and publish articles with our
                integrated content management system and AI-assisted tools.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <Eye className="h-6 w-6 text-purple-500 mr-3" />
                <h3 className="font-medium text-gray-900">
                  Performance Analytics
                </h3>
              </div>
              <p className="text-gray-600">
                Track article views, engagement metrics, and reader demographics
                to understand your audience and improve content strategy.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>);

};
export default AuthorPagesDirectory;