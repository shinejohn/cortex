import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Search,
  User,
  TrendingUp,
  DollarSign,
  Eye,
  ThumbsUp,
  MessageSquare,
  Flag,
  AlertTriangle,
  Shield,
  Calendar,
  Clock,
  BookOpen,
  PenTool,
  Mail,
  HelpCircle,
  LifeBuoy,
  Zap,
  Home } from
'lucide-react';
export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-white shadow-md fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-auto md:h-screen`}>

        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="ml-3 text-lg font-semibold text-gray-900">
              Admin Portal
            </span>
          </div>
          <button
            className="md:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setShowMobileMenu(false)}>

            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>

              <LayoutDashboard
                className={`mr-3 h-5 w-5 ${activeTab === 'overview' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />

              Dashboard Overview
            </button>
            <button
              onClick={() => setActiveTab('content')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'content' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>

              <FileText
                className={`mr-3 h-5 w-5 ${activeTab === 'content' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />

              Content Management
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'users' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>

              <Users
                className={`mr-3 h-5 w-5 ${activeTab === 'users' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />

              User Management
            </button>
            <button
              onClick={() => setActiveTab('complaints')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'complaints' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>

              <Flag
                className={`mr-3 h-5 w-5 ${activeTab === 'complaints' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />

              Author Complaints
              <span className="ml-auto bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                2
              </span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'analytics' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>

              <BarChart2
                className={`mr-3 h-5 w-5 ${activeTab === 'analytics' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />

              Analytics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${activeTab === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>

              <Settings
                className={`mr-3 h-5 w-5 ${activeTab === 'settings' ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />

              Settings
            </button>
          </nav>
          <div className="pt-4 mt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">

              <Home className="mr-3 h-5 w-5 text-gray-400" />
              Return to Site
            </button>
            <button className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100">
              <LogOut className="mr-3 h-5 w-5 text-gray-400" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  className="md:hidden text-gray-500 hover:text-gray-700"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}>

                  <Menu className="h-6 w-6" />
                </button>
                <div className="ml-4 md:ml-0">
                  <h1 className="text-lg font-semibold text-gray-900">
                    {activeTab === 'overview' && 'Dashboard Overview'}
                    {activeTab === 'content' && 'Content Management'}
                    {activeTab === 'users' && 'User Management'}
                    {activeTab === 'complaints' && 'Author Complaints'}
                    {activeTab === 'analytics' && 'Analytics'}
                    {activeTab === 'settings' && 'Settings'}
                  </h1>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-48" />

                </div>
                <button className="text-gray-500 hover:text-gray-700 relative">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
                <div className="relative">
                  <button className="flex items-center text-gray-700 hover:text-gray-900">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <span className="ml-2 text-sm font-medium hidden md:block">
                      Admin User
                    </span>
                    <ChevronDown className="ml-1 h-4 w-4 hidden md:block" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
          {/* Dashboard Overview */}
          {activeTab === 'overview' &&
          <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Eye className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        Total Views
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        2.4M
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1.5" />
                    <span className="text-green-600 font-medium">12%</span>
                    <span className="text-gray-500 ml-1.5">
                      from last month
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full">
                      <FileText className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        Published Articles
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        1,429
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1.5" />
                    <span className="text-green-600 font-medium">8%</span>
                    <span className="text-gray-500 ml-1.5">
                      from last month
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        Active Authors
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">87</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1.5" />
                    <span className="text-green-600 font-medium">4%</span>
                    <span className="text-gray-500 ml-1.5">
                      from last month
                    </span>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <DollarSign className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        Ad Revenue
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        $32,594
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1.5" />
                    <span className="text-green-600 font-medium">6%</span>
                    <span className="text-gray-500 ml-1.5">
                      from last month
                    </span>
                  </div>
                </div>
              </div>
              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-5 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    Recent Activity
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            New article published
                          </p>
                          <p className="text-xs text-gray-500">
                            "City Council Approves New Downtown Development
                            Plan"
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-full">
                          <User className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            New author registered
                          </p>
                          <p className="text-xs text-gray-500">
                            James Parker joined as Community Journalist
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">5 hours ago</p>
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-red-100 p-2 rounded-full">
                          <Flag className="h-5 w-5 text-red-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            New author complaint
                          </p>
                          <p className="text-xs text-gray-500">
                            Report against Sarah Johnson for biased reporting
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">8 hours ago</p>
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded-full">
                          <MessageSquare className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            High engagement article
                          </p>
                          <p className="text-xs text-gray-500">
                            "Local School District Announces New STEM Program"
                            reached 100+ comments
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">Yesterday</p>
                    </div>
                  </div>
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-yellow-100 p-2 rounded-full">
                          <ThumbsUp className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            Popular article
                          </p>
                          <p className="text-xs text-gray-500">
                            "Annual Beach Cleanup Event" reached 5,000+ views
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">Yesterday</p>
                    </div>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200">
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    View all activity
                  </button>
                </div>
              </div>
            </div>
          }
          {/* Content Management */}
          {activeTab === 'content' &&
          <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Content Management
              </h2>
              <p className="text-gray-600">
                Manage all content including articles, announcements, events,
                and more.
              </p>
              {/* Content management components would go here */}
            </div>
          }
          {/* User Management */}
          {activeTab === 'users' &&
          <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                User Management
              </h2>
              <p className="text-gray-600">
                Manage users, roles, and permissions.
              </p>
              {/* User management components would go here */}
            </div>
          }
          {/* Author Complaints */}
          {activeTab === 'complaints' &&
          <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">
                  Author Complaints
                </h2>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    2 pending complaints
                  </span>
                </div>
              </div>
              {/* Filters and Search */}
              <div className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Filter */}
                  <div className="relative">
                    <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">
                      <Flag className="h-4 w-4 mr-2 text-gray-500" />
                      <span className="text-sm">Status: All</span>
                      <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
                    </button>
                  </div>
                </div>
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                  type="text"
                  placeholder="Search complaints..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" />

                </div>
              </div>
              {/* Complaints List */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {/* Sample complaint item */}
                  <div className="p-4 hover:bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <img
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
                          alt="Sarah Johnson"
                          className="w-12 h-12 rounded-full" />

                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium text-gray-900">
                              Sarah Johnson
                            </h3>
                            <span className="ml-2 text-xs text-gray-500">
                              Senior Community Journalist
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Flag className="h-3.5 w-3.5 mr-1 text-red-500" />
                            <span>Biased reporting</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                            <span className="flex items-center">
                              <User className="h-3.5 w-3.5 mr-1" />
                              Reported by: Michael Chen
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              August 3, 2024
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center mt-3 md:mt-0 space-x-2">
                        <div className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </div>
                        <button className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
                          View Details
                        </button>
                        <button className="px-2 py-1 text-xs bg-blue-600 rounded text-white hover:bg-blue-700">
                          Take Action
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Sample complaint item 2 */}
                  <div className="p-4 hover:bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <img
                          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80"
                          alt="David Wilson"
                          className="w-12 h-12 rounded-full" />

                        </div>
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium text-gray-900">
                              David Wilson
                            </h3>
                            <span className="ml-2 text-xs text-gray-500">
                              Community Journalist
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Flag className="h-3.5 w-3.5 mr-1 text-red-500" />
                            <span>Spreading misinformation</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                            <span className="flex items-center">
                              <User className="h-3.5 w-3.5 mr-1" />
                              Reported by: Emily Rodriguez
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              August 2, 2024
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center mt-3 md:mt-0 space-x-2">
                        <div className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Reviewing
                        </div>
                        <button className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
                          View Details
                        </button>
                        <button className="px-2 py-1 text-xs bg-blue-600 rounded text-white hover:bg-blue-700">
                          Take Action
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
          {/* Analytics */}
          {activeTab === 'analytics' &&
          <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
              <p className="text-gray-600">
                View detailed analytics and reports.
              </p>
              {/* Analytics components would go here */}
            </div>
          }
          {/* Settings */}
          {activeTab === 'settings' &&
          <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <p className="text-gray-600">
                Configure system settings and preferences.
              </p>
              {/* Settings components would go here */}
            </div>
          }
        </main>
      </div>
    </div>);

};