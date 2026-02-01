import React from 'react';
import { Tag } from '../../services/tagService';
import {
  Hash,
  Users,
  TrendingUp,
  Calendar,
  Star,
  ChevronRight,
  Bookmark,
  Share2,
  AlertCircle } from
'lucide-react';
interface TagHeaderProps {
  tag: Tag;
  isFollowing: boolean;
  onFollowToggle: () => void;
  isFollowLoading?: boolean;
}
export const TagHeader = ({
  tag,
  isFollowing,
  onFollowToggle,
  isFollowLoading = false
}: TagHeaderProps) => {
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Tag Header */}
      <div className="p-6">
        <div className="flex items-center mb-2">
          <div className="flex items-center text-sm text-gray-500">
            <Hash className="h-4 w-4 mr-1" />
            <span>Tag</span>
          </div>
          {tag.isTrending &&
          <div className="ml-3 flex items-center text-sm text-orange-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>Trending</span>
            </div>
          }
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{tag.name}</h1>
        <p className="text-gray-600 mb-4">{tag.description}</p>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center text-gray-700">
            <Users className="h-5 w-5 mr-1.5 text-gray-500" />
            <span>
              <span className="font-medium">
                {tag.followers.toLocaleString()}
              </span>{' '}
              followers
            </span>
          </div>
          <div className="flex items-center text-gray-700">
            <Calendar className="h-5 w-5 mr-1.5 text-gray-500" />
            <span>
              Created on{' '}
              <span className="font-medium">{formatDate(tag.createdAt)}</span>
            </span>
          </div>
          <div className="flex items-center text-gray-700">
            <Star className="h-5 w-5 mr-1.5 text-gray-500" />
            <span>
              <span className="font-medium">{tag.articleCount}</span> articles
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onFollowToggle}
            disabled={isFollowLoading}
            className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${isFollowing ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 'bg-blue-600 text-white hover:bg-blue-700'} ${isFollowLoading ? 'opacity-75 cursor-not-allowed' : ''}`}>

            <Bookmark className="h-4 w-4 mr-2" />
            {isFollowLoading ?
            <span className="flex items-center">
                <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24">

                  <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4">
                </circle>
                  <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
                </svg>
                {isFollowing ? 'Unfollowing...' : 'Following...'}
              </span> :

            <span>{isFollowing ? 'Following' : 'Follow'}</span>
            }
          </button>
          <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
          <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md font-medium hover:bg-gray-200 transition-colors">
            <AlertCircle className="h-4 w-4 mr-2" />
            Report
          </button>
        </div>
      </div>
      {/* Tag Stats */}
      {tag.isTrending &&
      <div className="bg-orange-50 border-t border-orange-100 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-orange-500 mr-2" />
              <span className="text-orange-800 font-medium">
                This tag is trending with a score of {tag.trendingScore}/100
              </span>
            </div>
            <button className="text-orange-600 text-sm flex items-center hover:underline">
              View trend analysis
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      }
    </div>);

};