import React from 'react';
import { Star, Plus, Check } from 'lucide-react';
import { Community } from './TargetCommunities';
interface CommunityCardProps {
  community: Community;
  isSelected: boolean;
  onToggle: () => void;
}
export const CommunityCard: React.FC<CommunityCardProps> = ({
  community,
  isSelected,
  onToggle
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  const renderStars = (rating: number) => {
    return Array(5).
    fill(0).
    map((_, i) =>
    <Star
      key={i}
      className={`h-3.5 w-3.5 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />

    );
  };
  return (
    <div
      className={`bg-white rounded-lg border ${isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'} p-4 hover:shadow-md transition-shadow`}>

      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full overflow-hidden mr-3 bg-gray-100">
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
            <h3 className="font-semibold text-gray-900">{community.name}</h3>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`flex items-center justify-center h-8 w-8 rounded-full ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>

          {isSelected ?
          <Check className="h-5 w-5" /> :

          <Plus className="h-5 w-5" />
          }
        </button>
      </div>
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Members:</span>
          <span className="font-medium text-gray-900">
            {formatNumber(community.members)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Daily Active:</span>
          <span className="font-medium text-gray-900">
            {formatNumber(community.dailyActive)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Engagement Rate:</span>
          <div className="flex items-center">
            <div className="flex mr-1.5">
              {renderStars(community.engagementRate)}
            </div>
            <span className="font-medium text-gray-900">
              {community.engagementText}
            </span>
          </div>
        </div>
      </div>
      <div className="mb-3">
        <div className="text-xs text-gray-600 mb-1">Topics:</div>
        <div className="flex flex-wrap gap-1">
          {community.topics.map((topic, index) =>
          <span
            key={index}
            className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">

              {topic}
            </span>
          )}
        </div>
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        <div>
          <div className="text-sm font-medium text-gray-900">
            ${community.price}/day
          </div>
          <div className="text-xs text-gray-500">for Standard Card</div>
        </div>
        <div className="text-xs text-gray-600">Avg CTR: {community.ctr}%</div>
      </div>
    </div>);

};