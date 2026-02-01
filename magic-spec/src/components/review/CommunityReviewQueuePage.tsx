import React from 'react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
const CommunityReviewQueuePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Community Review Queue
          </h1>
          <div className="text-center py-12">
            <Clock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Articles in Review Queue
            </h2>
            <p className="text-gray-600">
              All submitted articles have been processed. Check back later for
              new submissions.
            </p>
          </div>
        </div>
      </div>
    </div>);

};
export default CommunityReviewQueuePage;