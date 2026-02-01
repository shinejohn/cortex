import React, { useState } from 'react';
import {
  Flag,
  AlertTriangle,
  User,
  Clock,
  Calendar,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  MoreHorizontal,
  Filter,
  Search,
  ChevronDown,
  X,
  Calendar as CalendarIcon,
  Ban,
  AlertCircle,
  ThumbsDown,
  FileText,
  ArrowUpDown } from
'lucide-react';
// Types
interface AuthorComplaint {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorRole: string;
  reportReason: string;
  reportDetails: string;
  reporterName: string;
  reporterEmail: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  dateReported: string;
  lastUpdated: string;
  actionTaken?: string;
  banDuration?: string;
  notes?: string;
}
export const AuthorComplaintsManagement = () => {
  const [complaints, setComplaints] =
  useState<AuthorComplaint[]>(mockComplaints);
  const [selectedComplaint, setSelectedComplaint] =
  useState<AuthorComplaint | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [sortField, setSortField] = useState('dateReported');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [banDuration, setBanDuration] = useState('7days');
  const [actionNotes, setActionNotes] = useState('');
  // Filter complaints based on status and search query
  const filteredComplaints = complaints.filter((complaint) => {
    const matchesStatus =
    filterStatus === 'all' || complaint.status === filterStatus;
    const matchesSearch =
    complaint.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    complaint.reportReason.
    toLowerCase().
    includes(searchQuery.toLowerCase()) ||
    complaint.reporterName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });
  // Sort complaints
  const sortedComplaints = [...filteredComplaints].sort((a, b) => {
    let valueA, valueB;
    switch (sortField) {
      case 'authorName':
        valueA = a.authorName;
        valueB = b.authorName;
        break;
      case 'reportReason':
        valueA = a.reportReason;
        valueB = b.reportReason;
        break;
      case 'status':
        valueA = a.status;
        valueB = b.status;
        break;
      case 'dateReported':
      default:
        valueA = new Date(a.dateReported).getTime();
        valueB = new Date(b.dateReported).getTime();
        break;
    }
    if (sortDirection === 'asc') {
      return valueA > valueB ? 1 : -1;
    } else {
      return valueA < valueB ? 1 : -1;
    }
  });
  // Handle taking action on a complaint
  const handleTakeAction = (complaint: AuthorComplaint) => {
    setSelectedComplaint(complaint);
    setShowActionModal(true);
  };
  // Handle viewing complaint details
  const handleViewDetails = (complaint: AuthorComplaint) => {
    setSelectedComplaint(complaint);
    setShowDetailsModal(true);
  };
  // Handle submitting action
  const handleSubmitAction = (
  action: 'dismiss' | 'warning' | 'tempban' | 'permban') =>
  {
    if (!selectedComplaint) return;
    // In a real app, this would call an API to update the complaint status
    const updatedComplaints = complaints.map((complaint) => {
      if (complaint.id === selectedComplaint.id) {
        return {
          ...complaint,
          status: 'resolved',
          actionTaken: action,
          banDuration: action === 'tempban' ? banDuration : undefined,
          notes: actionNotes,
          lastUpdated: new Date().toISOString()
        };
      }
      return complaint;
    });
    setComplaints(updatedComplaints);
    setShowActionModal(false);
    setSelectedComplaint(null);
    setBanDuration('7days');
    setActionNotes('');
  };
  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Author Complaints</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {filteredComplaints.length} complaints
          </span>
        </div>
      </div>
      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="relative">
            <button
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}>

              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm">
                Status:{' '}
                {filterStatus === 'all' ?
                'All' :
                filterStatus.charAt(0).toUpperCase() +
                filterStatus.slice(1)}
              </span>
              <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
            </button>
            {showStatusDropdown &&
            <div className="absolute mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-40">
                <div className="py-1">
                  {['all', 'pending', 'reviewing', 'resolved', 'dismissed'].map(
                  (status) =>
                  <button
                    key={status}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => {
                      setFilterStatus(status);
                      setShowStatusDropdown(false);
                    }}>

                        {status === 'all' ?
                    'All' :
                    status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>

                )}
                </div>
              </div>
            }
          </div>
          {/* Sort Options */}
          <div className="relative">
            <button
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
              onClick={() => setShowSortDropdown(!showSortDropdown)}>

              <ArrowUpDown className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm">
                Sort:{' '}
                {sortField === 'dateReported' ?
                'Date' :
                sortField === 'authorName' ?
                'Author' :
                sortField === 'reportReason' ?
                'Reason' :
                'Status'}
              </span>
              <ChevronDown className="h-4 w-4 ml-2 text-gray-500" />
            </button>
            {showSortDropdown &&
            <div className="absolute mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-40">
                <div className="py-1">
                  <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setSortField('dateReported');
                    setSortDirection(
                      sortField === 'dateReported' ?
                      sortDirection === 'desc' ?
                      'asc' :
                      'desc' :
                      'desc'
                    );
                    setShowSortDropdown(false);
                  }}>

                    Date{' '}
                    {sortField === 'dateReported' && (
                  sortDirection === 'desc' ? '(Newest)' : '(Oldest)')}
                  </button>
                  <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setSortField('authorName');
                    setSortDirection(
                      sortField === 'authorName' ?
                      sortDirection === 'desc' ?
                      'asc' :
                      'desc' :
                      'asc'
                    );
                    setShowSortDropdown(false);
                  }}>

                    Author Name
                  </button>
                  <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setSortField('reportReason');
                    setSortDirection(
                      sortField === 'reportReason' ?
                      sortDirection === 'desc' ?
                      'asc' :
                      'desc' :
                      'asc'
                    );
                    setShowSortDropdown(false);
                  }}>

                    Report Reason
                  </button>
                  <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    setSortField('status');
                    setSortDirection(
                      sortField === 'status' ?
                      sortDirection === 'desc' ?
                      'asc' :
                      'desc' :
                      'asc'
                    );
                    setShowSortDropdown(false);
                  }}>

                    Status
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search complaints..."
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
      </div>
      {/* Complaints List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {sortedComplaints.length > 0 ?
        <div className="divide-y divide-gray-200">
            {sortedComplaints.map((complaint) =>
          <div key={complaint.id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <img
                    src={complaint.authorAvatar}
                    alt={complaint.authorName}
                    className="w-12 h-12 rounded-full" />

                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-900">
                          {complaint.authorName}
                        </h3>
                        <span className="ml-2 text-xs text-gray-500">
                          {complaint.authorRole}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Flag className="h-3.5 w-3.5 mr-1 text-red-500" />
                        <span>{complaint.reportReason}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                        <span className="flex items-center">
                          <User className="h-3.5 w-3.5 mr-1" />
                          Reported by: {complaint.reporterName}
                        </span>
                        <span className="flex items-center">
                          <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                          {new Date(
                        complaint.dateReported
                      ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center mt-3 md:mt-0 space-x-2">
                    <div
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(complaint.status)}`}>

                      {complaint.status.charAt(0).toUpperCase() +
                  complaint.status.slice(1)}
                    </div>
                    <button
                  onClick={() => handleViewDetails(complaint)}
                  className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50">

                      View Details
                    </button>
                    {(complaint.status === 'pending' ||
                complaint.status === 'reviewing') &&
                <button
                  onClick={() => handleTakeAction(complaint)}
                  className="px-2 py-1 text-xs bg-blue-600 rounded text-white hover:bg-blue-700">

                        Take Action
                      </button>
                }
                  </div>
                </div>
              </div>
          )}
          </div> :

        <div className="p-8 text-center">
            <Flag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No complaints found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterStatus !== 'all' ?
            'No complaints match your current filters. Try adjusting your search or filter criteria.' :
            'There are no author complaints at this time.'}
            </p>
            {(searchQuery || filterStatus !== 'all') &&
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('all');
            }}
            className="text-blue-600 font-medium text-sm hover:text-blue-800">

                Clear all filters
              </button>
          }
          </div>
        }
      </div>
      {/* Complaint Details Modal */}
      {showDetailsModal && selectedComplaint &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Complaint Details
                </h2>
                <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500">

                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center">
                <img
                src={selectedComplaint.authorAvatar}
                alt={selectedComplaint.authorName}
                className="w-12 h-12 rounded-full mr-4" />

                <div>
                  <p className="font-medium text-gray-900">
                    {selectedComplaint.authorName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedComplaint.authorRole}
                  </p>
                </div>
                <div
                className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedComplaint.status)}`}>

                  {selectedComplaint.status.charAt(0).toUpperCase() +
                selectedComplaint.status.slice(1)}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Report Information
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
                    <div className="px-4 py-3">
                      <div className="text-xs text-gray-500">Reported by</div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedComplaint.reporterName}
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      <div className="text-xs text-gray-500">
                        Reporter Email
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedComplaint.reporterEmail}
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      <div className="text-xs text-gray-500">Date Reported</div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(
                        selectedComplaint.dateReported
                      ).toLocaleString()}
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      <div className="text-xs text-gray-500">Last Updated</div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(
                        selectedComplaint.lastUpdated
                      ).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Complaint Details
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
                    <div className="px-4 py-3">
                      <div className="text-xs text-gray-500">Reason</div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedComplaint.reportReason}
                      </div>
                    </div>
                    <div className="px-4 py-3">
                      <div className="text-xs text-gray-500">Details</div>
                      <div className="text-sm text-gray-900 whitespace-pre-line">
                        {selectedComplaint.reportDetails}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Action Taken (if resolved) */}
              {selectedComplaint.status === 'resolved' &&
            <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Action Taken
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-200">
                    <div className="px-4 py-3">
                      <div className="text-xs text-gray-500">Action</div>
                      <div className="text-sm font-medium text-gray-900">
                        {selectedComplaint.actionTaken === 'dismiss' &&
                    'Dismissed - No action needed'}
                        {selectedComplaint.actionTaken === 'warning' &&
                    'Warning issued to author'}
                        {selectedComplaint.actionTaken === 'tempban' &&
                    `Temporary ban (${selectedComplaint.banDuration})`}
                        {selectedComplaint.actionTaken === 'permban' &&
                    'Permanent ban from publishing'}
                      </div>
                    </div>
                    {selectedComplaint.notes &&
                <div className="px-4 py-3">
                        <div className="text-xs text-gray-500">Admin Notes</div>
                        <div className="text-sm text-gray-900 whitespace-pre-line">
                          {selectedComplaint.notes}
                        </div>
                      </div>
                }
                  </div>
                </div>
            }
              <div className="flex justify-between pt-4 border-t border-gray-200">
                {(selectedComplaint.status === 'pending' ||
              selectedComplaint.status === 'reviewing') &&
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  handleTakeAction(selectedComplaint);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors">

                    Take Action
                  </button>
              }
                <button
                onClick={() => setShowDetailsModal(false)}
                className={`px-4 py-2 ${selectedComplaint.status === 'pending' || selectedComplaint.status === 'reviewing' ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700'} rounded-md font-medium transition-colors ml-auto`}>

                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      }
      {/* Take Action Modal */}
      {showActionModal && selectedComplaint &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Take Action
                </h2>
                <button
                onClick={() => setShowActionModal(false)}
                className="text-gray-400 hover:text-gray-500">

                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg flex items-center">
                <img
                src={selectedComplaint.authorAvatar}
                alt={selectedComplaint.authorName}
                className="w-12 h-12 rounded-full mr-4" />

                <div>
                  <p className="font-medium text-gray-900">
                    {selectedComplaint.authorName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedComplaint.authorRole}
                  </p>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Select action to take:
                </h3>
                <div className="space-y-3">
                  <button
                  onClick={() => handleSubmitAction('dismiss')}
                  className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">

                    <div className="flex items-center">
                      <div className="bg-gray-100 p-2 rounded-full mr-3">
                        <CheckCircle className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">
                          Dismiss complaint
                        </div>
                        <div className="text-sm text-gray-500">
                          No action needed
                        </div>
                      </div>
                    </div>
                  </button>
                  <button
                  onClick={() => handleSubmitAction('warning')}
                  className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">

                    <div className="flex items-center">
                      <div className="bg-yellow-100 p-2 rounded-full mr-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">
                          Issue warning
                        </div>
                        <div className="text-sm text-gray-500">
                          Send a warning to the author
                        </div>
                      </div>
                    </div>
                  </button>
                  <div className="w-full border border-gray-300 rounded-lg overflow-hidden">
                    <button
                    onClick={() => handleSubmitAction('tempban')}
                    className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">

                      <div className="flex items-center">
                        <div className="bg-orange-100 p-2 rounded-full mr-3">
                          <Clock className="h-5 w-5 text-orange-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900">
                            Temporary ban
                          </div>
                          <div className="text-sm text-gray-500">
                            Prevent publishing for a period
                          </div>
                        </div>
                      </div>
                    </button>
                    <div className="border-t border-gray-200 p-3 bg-gray-50">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ban duration
                      </label>
                      <select
                      value={banDuration}
                      onChange={(e) => setBanDuration(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm">

                        <option value="1day">1 day</option>
                        <option value="3days">3 days</option>
                        <option value="7days">7 days</option>
                        <option value="14days">14 days</option>
                        <option value="30days">30 days</option>
                        <option value="90days">90 days</option>
                      </select>
                    </div>
                  </div>
                  <button
                  onClick={() => handleSubmitAction('permban')}
                  className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">

                    <div className="flex items-center">
                      <div className="bg-red-100 p-2 rounded-full mr-3">
                        <Ban className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">
                          Permanent ban
                        </div>
                        <div className="text-sm text-gray-500">
                          Permanently prevent publishing
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Add any additional notes about this action...">
              </textarea>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                onClick={() => setShowActionModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50">

                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>);

};
// Mock data for author complaints
const mockComplaints: AuthorComplaint[] = [
{
  id: '1',
  authorId: '123',
  authorName: 'Sarah Johnson',
  authorAvatar:
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
  authorRole: 'Senior Community Journalist',
  reportReason: 'Biased reporting',
  reportDetails:
  'In her recent article about the downtown development plan, Sarah showed clear bias in favor of the developers and failed to present opposing viewpoints from community members who are concerned about the project.',
  reporterName: 'Michael Chen',
  reporterEmail: 'mchen@example.com',
  status: 'pending',
  dateReported: '2024-08-03T14:32:00Z',
  lastUpdated: '2024-08-03T14:32:00Z'
},
{
  id: '2',
  authorId: '456',
  authorName: 'David Wilson',
  authorAvatar:
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
  authorRole: 'Community Journalist',
  reportReason: 'Spreading misinformation',
  reportDetails:
  "David's article about the local school board contained several factual errors regarding the budget allocation. The figures he quoted were from last year's budget, not the current one, which is misleading readers.",
  reporterName: 'Emily Rodriguez',
  reporterEmail: 'erodriguez@example.com',
  status: 'reviewing',
  dateReported: '2024-08-02T09:15:00Z',
  lastUpdated: '2024-08-02T15:45:00Z'
},
{
  id: '3',
  authorId: '789',
  authorName: 'Jennifer Lee',
  authorAvatar:
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
  authorRole: 'Contributor',
  reportReason: 'Plagiarism',
  reportDetails:
  "Jennifer's article about environmental conservation appears to have substantial portions copied directly from a National Geographic article published three months ago. I've included links to both articles in this report.",
  reporterName: 'Robert Martinez',
  reporterEmail: 'rmartinez@example.com',
  status: 'resolved',
  dateReported: '2024-07-29T11:20:00Z',
  lastUpdated: '2024-08-01T10:30:00Z',
  actionTaken: 'tempban',
  banDuration: '14days',
  notes:
  'After reviewing both articles, we confirmed several paragraphs were copied without attribution. Temporary ban issued and author required to take ethics training before reinstatement.'
},
{
  id: '4',
  authorId: '101',
  authorName: 'James Parker',
  authorAvatar:
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
  authorRole: 'Community Journalist',
  reportReason: 'Conflict of interest',
  reportDetails:
  'James wrote a positive article about the new shopping center without disclosing that his brother is one of the investors in the project. This is a clear conflict of interest that should have been disclosed.',
  reporterName: 'Lisa Thompson',
  reporterEmail: 'lthompson@example.com',
  status: 'resolved',
  dateReported: '2024-07-25T16:40:00Z',
  lastUpdated: '2024-07-27T09:15:00Z',
  actionTaken: 'warning',
  notes:
  'Author acknowledged the relationship should have been disclosed. Article updated with disclosure notice. Warning issued regarding future conflicts of interest.'
},
{
  id: '5',
  authorId: '202',
  authorName: 'Maria Gonzalez',
  authorAvatar:
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
  authorRole: 'Contributor',
  reportReason: 'Inappropriate content',
  reportDetails:
  "Maria's article about the local festival included inappropriate language and references that aren't suitable for a community newspaper that's accessible to readers of all ages.",
  reporterName: 'Anonymous',
  reporterEmail: 'anonymous@example.com',
  status: 'dismissed',
  dateReported: '2024-07-20T13:10:00Z',
  lastUpdated: '2024-07-21T14:25:00Z',
  actionTaken: 'dismiss',
  notes:
  'Reviewed the article and found no language that violates our community standards. The terminology used is appropriate for the context of the cultural event being described.'
}];