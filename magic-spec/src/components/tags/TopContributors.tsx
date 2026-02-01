import React from 'react';
import { User, Users, FileText } from 'lucide-react';
export const TopContributors = ({ contributors }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-800">Top Contributors</h3>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {contributors.map((contributor) =>
          <div
            key={contributor.id}
            className="flex items-center justify-between">

              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full overflow-hidden mr-3">
                  <img
                  src={contributor.avatar}
                  alt={contributor.name}
                  className="w-full h-full object-cover" />

                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {contributor.name}
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <FileText className="h-3 w-3 mr-1" />
                    <span>{contributor.articles} articles</span>
                    <span className="mx-1">•</span>
                    <Users className="h-3 w-3 mr-1" />
                    <span>{contributor.followers} followers</span>
                  </div>
                </div>
              </div>
              <button className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full">
                Follow
              </button>
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-md text-sm font-medium">
            View All Contributors
          </button>
        </div>
      </div>
    </div>);

};