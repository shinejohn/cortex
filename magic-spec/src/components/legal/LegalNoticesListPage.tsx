import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Calendar,
  FileText,
  ChevronDown,
  Gavel,
  ChevronRight,
  X,
  Scale,
  BookOpen,
  MapPin,
  Clock,
  AlertCircle,
  Plus,
  Download,
  Printer,
  RefreshCw } from
'lucide-react';
export const LegalNoticesListPage = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dateRange: 'all',
    location: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Simulate fetching notices
  useEffect(() => {
    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      // Generate mock notices
      const mockNotices = Array(20).
      fill(null).
      map((_, index) => {
        const types = [
        'FORECLOSURE NOTICE',
        'PROBATE NOTICE',
        'NAME CHANGE NOTICE',
        'BUSINESS FORMATION NOTICE',
        'PUBLIC HEARING NOTICE'];

        const statuses = ['ACTIVE', 'EXPIRES SOON', 'EXPIRED'];
        const statusColors = {
          ACTIVE: 'green',
          'EXPIRES SOON': 'amber',
          EXPIRED: 'red'
        };
        const typeColors = {
          'FORECLOSURE NOTICE': 'indigo-700',
          'PROBATE NOTICE': 'green-700',
          'NAME CHANGE NOTICE': 'amber-700',
          'BUSINESS FORMATION NOTICE': 'blue-700',
          'PUBLIC HEARING NOTICE': 'purple-700'
        };
        const type = types[Math.floor(Math.random() * types.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const today = new Date();
        const publishDate = new Date(
          today.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000
        );
        const expiryDate = new Date(
          publishDate.getTime() + 30 * 24 * 60 * 60 * 1000
        );
        return {
          id: `ln-2024-${100000 + index}`,
          type,
          typeColor: typeColors[type],
          status,
          statusColor: statusColors[status],
          caseNumber: `2024-${type.includes('PROBATE') ? 'CP' : type.includes('NAME') ? 'DR' : 'CA'}-${100000 + index}`,
          publishDate: publishDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          expiryDate: expiryDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          preview: type.includes('FORECLOSURE') ?
          `Property: ${Math.floor(Math.random() * 999) + 100} ${['Main', 'Oak', 'Pine', 'Maple', 'Cedar'][Math.floor(Math.random() * 5)]} ${['Street', 'Avenue', 'Boulevard', 'Drive', 'Road'][Math.floor(Math.random() * 5)]}, Clearwater, FL ${33755 + Math.floor(Math.random() * 10)}` :
          type.includes('PROBATE') ?
          `Estate of: ${['John', 'Jane', 'Robert', 'Mary', 'William'][Math.floor(Math.random() * 5)]} ${['Smith', 'Johnson', 'Williams', 'Jones', 'Brown'][Math.floor(Math.random() * 5)]}` :
          type.includes('NAME') ?
          `Petitioner: ${['Michael', 'Sarah', 'David', 'Jennifer', 'Christopher'][Math.floor(Math.random() * 5)]} ${['Miller', 'Davis', 'Garcia', 'Rodriguez', 'Wilson'][Math.floor(Math.random() * 5)]}` :
          type.includes('BUSINESS') ?
          `Company: ${['Clearwater', 'Gulf Coast', 'Sunshine', 'Bayshore', 'Pinellas'][Math.floor(Math.random() * 5)]} ${['Innovations', 'Solutions', 'Enterprises', 'Services', 'Technologies'][Math.floor(Math.random() * 5)]} LLC` :
          `Regarding: ${['Zoning Change', 'Infrastructure Project', 'Budget Approval', 'Ordinance Amendment', 'Development Proposal'][Math.floor(Math.random() * 5)]}`,
          court: 'Circuit Court, Pinellas County, Florida'
        };
      });
      setNotices(mockNotices);
      setTotalPages(5); // Mock 5 pages total
      setLoading(false);
    }, 1000);
  }, [currentPage, filters, sortBy]);
  const handleSearch = (e) => {
    e.preventDefault();
    // In a real app, this would trigger a search API call
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };
  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value
    }));
  };
  const clearFilters = () => {
    setFilters({
      type: '',
      status: '',
      dateRange: 'all',
      location: ''
    });
  };
  const handleViewNotice = (noticeId) => {
    navigate('/legalNoticeDetail');
  };
  const handleCreateNotice = () => {
    navigate('/legalNoticeCreator');
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Gavel className="h-6 w-6 text-indigo-700 mr-2" />
                Legal Notices
              </h1>
              <p className="text-gray-600 mt-1">
                Browse, search, and publish legal notices for Clearwater and
                surrounding areas
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCreateNotice}
                className="bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-800 transition-colors flex items-center">

                <Plus className="h-4 w-4 mr-1.5" />
                Create Notice
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex items-center">

                  <Filter className="h-4 w-4 mr-1.5" />
                  Filters
                  <ChevronDown className="h-4 w-4 ml-1.5" />
                </button>
              </div>
            </div>
          </div>
          {/* Search bar */}
          <div className="mt-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by case number, address, name, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />

              </div>
              <button
                type="submit"
                className="bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-800 transition-colors">

                Search
              </button>
            </form>
          </div>
          {/* Filters panel */}
          {showFilters &&
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900">Filter Notices</h3>
                <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-gray-700">

                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notice Type
                  </label>
                  <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">

                    <option value="">All Types</option>
                    <option value="foreclosure">Foreclosure</option>
                    <option value="probate">Probate</option>
                    <option value="nameChange">Name Change</option>
                    <option value="business">Business Formation</option>
                    <option value="publicHearing">Public Hearing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                  value={filters.status}
                  onChange={(e) =>
                  handleFilterChange('status', e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">

                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="expiresSoon">Expires Soon</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <select
                  value={filters.dateRange}
                  onChange={(e) =>
                  handleFilterChange('dateRange', e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">

                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                  type="text"
                  placeholder="City, zip code, or address"
                  value={filters.location}
                  onChange={(e) =>
                  handleFilterChange('location', e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />

                </div>
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <button
                onClick={clearFilters}
                className="text-gray-700 hover:text-indigo-700 text-sm font-medium">

                  Clear Filters
                </button>
                <button
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    setLoading(false);
                  }, 500);
                }}
                className="bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-800 transition-colors">

                  Apply Filters
                </button>
              </div>
            </div>
          }
          {/* Sort and view options */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">

                <option value="date">Date (Newest First)</option>
                <option value="dateAsc">Date (Oldest First)</option>
                <option value="type">Notice Type</option>
                <option value="status">Status</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50">
                <Printer className="h-4 w-4" />
              </button>
              <button className="p-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50">
                <Download className="h-4 w-4" />
              </button>
              <button
                className="p-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50"
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => {
                    setLoading(false);
                  }, 500);
                }}>

                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        {/* Notices list */}
        {loading ?
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map((i) =>
            <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            )}
            </div>
          </div> :

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              {notices.map((notice) =>
            <div
              key={notice.id}
              className="border border-gray-200 hover:border-indigo-300 rounded-lg p-4 transition-colors cursor-pointer"
              onClick={() => handleViewNotice(notice.id)}>

                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-1">
                        <span
                      className={`text-xs font-medium text-${notice.typeColor} bg-${notice.typeColor.split('-')[0]}-100 px-2 py-0.5 rounded-full`}>

                          {notice.type}
                        </span>
                        <span
                      className={`text-xs font-medium text-${notice.statusColor}-700 bg-${notice.statusColor}-100 px-2 py-0.5 rounded-full`}>

                          {notice.status}
                        </span>
                      </div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        {notice.preview}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          <span>Case #{notice.caseNumber}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Published: {notice.publishDate}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>Expires: {notice.expiryDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center mt-2 md:mt-0">
                      <button className="text-indigo-700 hover:underline text-sm flex items-center">
                        View Notice <ChevronRight className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
            )}
            </div>
            {/* Pagination */}
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * 20 + 1}-
                {Math.min(currentPage * 20, 100)} of 100 results
              </div>
              <div className="flex items-center space-x-1">
                <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-md border ${currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>

                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) =>
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`w-8 h-8 rounded-md ${currentPage === i + 1 ? 'bg-indigo-700 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}>

                    {i + 1}
                  </button>
              )}
                <button
                onClick={() =>
                handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md border ${currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>

                  Next
                </button>
              </div>
            </div>
          </div>
        }
        {/* Information section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <div className="flex items-start">
            <Scale className="h-6 w-6 text-indigo-700 mt-1 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                About Legal Notices
              </h2>
              <p className="text-gray-600 mb-4">
                Legal notices are official communications required by law to
                inform the public about certain actions, proceedings, or events.
                They are an essential part of maintaining transparency and
                providing due process.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <BookOpen className="h-5 w-5 text-indigo-700 mr-2" />
                    <h3 className="font-medium text-gray-900">
                      Types of Notices
                    </h3>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Foreclosure Notices</li>
                    <li>• Probate Notices</li>
                    <li>• Name Change Petitions</li>
                    <li>• Business Formation Notices</li>
                    <li>• Public Hearing Notices</li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <AlertCircle className="h-5 w-5 text-indigo-700 mr-2" />
                    <h3 className="font-medium text-gray-900">
                      Why They Matter
                    </h3>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Legal requirement for many proceedings</li>
                    <li>• Ensures public transparency</li>
                    <li>• Protects rights of interested parties</li>
                    <li>• Creates an official public record</li>
                    <li>• Allows for public participation</li>
                  </ul>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 text-indigo-700 mr-2" />
                    <h3 className="font-medium text-gray-900">
                      Publishing a Notice
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Need to publish a legal notice? Our platform makes it easy
                    to create, submit, and manage your legal notices.
                  </p>
                  <button
                    onClick={handleCreateNotice}
                    className="bg-indigo-700 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-indigo-800 transition-colors w-full">

                    Create a Notice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};