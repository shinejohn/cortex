import React from 'react';
import { X, ShoppingCart, AlertCircle } from 'lucide-react';
import { Community } from './TargetCommunities';
interface SelectedCommunitiesSidebarProps {
  selectedCommunities: Community[];
  onRemove: (id: string) => void;
}
export const SelectedCommunitiesSidebar: React.FC<
  SelectedCommunitiesSidebarProps> =
({ selectedCommunities, onRemove }) => {
  const calculateTotal = () => {
    return selectedCommunities.reduce(
      (sum, community) => sum + community.price,
      0
    );
  };
  const totalPrice = calculateTotal();
  const estimatedReach = selectedCommunities.reduce(
    (sum, community) => sum + community.dailyActive,
    0
  );
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm sticky top-4">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Selected Communities</h3>
      </div>
      {selectedCommunities.length === 0 ?
      <div className="p-6 text-center">
          <ShoppingCart className="h-10 w-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 mb-1">No communities selected</p>
          <p className="text-sm text-gray-400">
            Select communities from the list to add them here
          </p>
        </div> :

      <>
          <div className="max-h-96 overflow-y-auto p-4 space-y-3">
            {selectedCommunities.map((community) =>
          <div
            key={community.id}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-md">

                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full overflow-hidden mr-2 bg-gray-100">
                    {community.avatar ?
                <img
                  src={community.avatar}
                  alt={community.name}
                  className="h-full w-full object-cover" /> :


                <div className="h-full w-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">
                        {community.name.charAt(1)}
                      </div>
                }
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900">
                      {community.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatNumber(community.members)} members
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-900 mr-3">
                    ${community.price}/day
                  </div>
                  <button
                onClick={() => onRemove(community.id)}
                className="text-gray-400 hover:text-gray-600">

                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
          )}
          </div>
          <div className="p-4 border-t border-gray-200">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-600">Communities:</span>
              <span className="font-medium text-gray-900">
                {selectedCommunities.length}
              </span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-600">Est. Daily Reach:</span>
              <span className="font-medium text-gray-900">
                {formatNumber(estimatedReach)}
              </span>
            </div>
            <div className="flex justify-between mb-4 text-base font-medium">
              <span className="text-gray-900">Total Daily Cost:</span>
              <span className="text-blue-600">${totalPrice}/day</span>
            </div>
            {selectedCommunities.length === 0 ?
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-yellow-500" />
                <p>Please select at least one community to continue</p>
              </div> :

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-blue-500" />
                <p>
                  Your ad will run on {selectedCommunities.length} communities
                  for a total of ${totalPrice} per day
                </p>
              </div>
          }
          </div>
        </>
      }
    </div>);

};