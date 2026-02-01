import React from 'react';
import {
  Clock,
  BookOpen,
  Bookmark,
  Quote,
  FileText,
  History } from
'lucide-react';
export const HistoricalFeatures = ({ sepiaMode, selectedDate }) => {
  // Format the selected date for display
  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return (
    <div
      className={`rounded-lg shadow-md p-4 ${sepiaMode ? 'bg-amber-100 border border-amber-200' : 'bg-white border border-gray-200'}`}>

      <h3 className="font-bold text-gray-900 mb-4">Historical Features</h3>
      <div className="space-y-4">
        {/* Time Machine */}
        <div>
          <button
            className={`w-full flex items-center p-3 rounded-md ${sepiaMode ? 'bg-amber-50 hover:bg-amber-200' : 'bg-gray-50 hover:bg-gray-100'}`}>

            <div
              className={`p-2 rounded-full mr-3 ${sepiaMode ? 'bg-amber-200 text-amber-800' : 'bg-blue-100 text-blue-700'}`}>

              <Clock className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Time Machine</div>
              <div className="text-xs text-gray-600">
                See the site as it appeared on {formattedDate}
              </div>
            </div>
          </button>
        </div>
        {/* Historical Context */}
        <div>
          <button
            className={`w-full flex items-center p-3 rounded-md ${sepiaMode ? 'bg-amber-50 hover:bg-amber-200' : 'bg-gray-50 hover:bg-gray-100'}`}>

            <div
              className={`p-2 rounded-full mr-3 ${sepiaMode ? 'bg-amber-200 text-amber-800' : 'bg-green-100 text-green-700'}`}>

              <History className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">
                Historical Context
              </div>
              <div className="text-xs text-gray-600">
                Background information about this period
              </div>
            </div>
          </button>
        </div>
        {/* Print View */}
        <div>
          <button
            className={`w-full flex items-center p-3 rounded-md ${sepiaMode ? 'bg-amber-50 hover:bg-amber-200' : 'bg-gray-50 hover:bg-gray-100'}`}>

            <div
              className={`p-2 rounded-full mr-3 ${sepiaMode ? 'bg-amber-200 text-amber-800' : 'bg-purple-100 text-purple-700'}`}>

              <FileText className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Print View</div>
              <div className="text-xs text-gray-600">
                View in newspaper format
              </div>
            </div>
          </button>
        </div>
        {/* Citation Tools */}
        <div>
          <button
            className={`w-full flex items-center p-3 rounded-md ${sepiaMode ? 'bg-amber-50 hover:bg-amber-200' : 'bg-gray-50 hover:bg-gray-100'}`}>

            <div
              className={`p-2 rounded-full mr-3 ${sepiaMode ? 'bg-amber-200 text-amber-800' : 'bg-red-100 text-red-700'}`}>

              <Quote className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">Citation Tools</div>
              <div className="text-xs text-gray-600">
                Generate academic citations
              </div>
            </div>
          </button>
        </div>
      </div>
      {/* Saved Collections */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700">
            My Saved Collections
          </h4>
          <button
            className={`text-xs ${sepiaMode ? 'text-amber-800' : 'text-news-primary'} font-medium`}>

            View All
          </button>
        </div>
        <div className="space-y-2">
          <div
            className={`p-2 rounded-md ${sepiaMode ? 'bg-amber-50' : 'bg-gray-50'}`}>

            <div className="flex items-center">
              <Bookmark
                className={`h-4 w-4 mr-2 ${sepiaMode ? 'text-amber-800' : 'text-news-primary'}`} />

              <div className="text-sm font-medium">Local Election History</div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              12 items • Last updated 2 days ago
            </div>
          </div>
          <div
            className={`p-2 rounded-md ${sepiaMode ? 'bg-amber-50' : 'bg-gray-50'}`}>

            <div className="flex items-center">
              <Bookmark
                className={`h-4 w-4 mr-2 ${sepiaMode ? 'text-amber-800' : 'text-news-primary'}`} />

              <div className="text-sm font-medium">Downtown Redevelopment</div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              8 items • Last updated 1 week ago
            </div>
          </div>
          <div
            className={`p-2 rounded-md ${sepiaMode ? 'bg-amber-50' : 'bg-gray-50'}`}>

            <div className="flex items-center">
              <Bookmark
                className={`h-4 w-4 mr-2 ${sepiaMode ? 'text-amber-800' : 'text-news-primary'}`} />

              <div className="text-sm font-medium">Research Project</div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              15 items • Last updated 3 weeks ago
            </div>
          </div>
        </div>
      </div>
    </div>);

};