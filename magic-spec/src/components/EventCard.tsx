import React, { useState } from 'react';
import { MapPin, ChevronRight, Heart, ThumbsUp, Share2 } from 'lucide-react';
import { ShareModal } from './modals/ShareModal';
export const EventCard = ({ location, title, image, customImage }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 20));
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(
    Math.floor(Math.random() * 15)
  );
  const [showShareModal, setShowShareModal] = useState(false);
  const handleLike = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikeCount((prevCount) => isLiked ? prevCount - 1 : prevCount + 1);
  };
  const handleHelpful = (e) => {
    e.stopPropagation();
    setIsHelpful(!isHelpful);
    setHelpfulCount((prevCount) => isHelpful ? prevCount - 1 : prevCount + 1);
  };
  const handleShare = (e) => {
    e.stopPropagation();
    setShowShareModal(true);
  };
  return (
    <div className="min-w-[240px] max-w-[240px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="relative h-32">
        {customImage ?
        <img
          src={customImage}
          alt={title}
          className="h-full w-full object-contain" /> :


        <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <svg
            className="h-16 w-16 text-gray-300"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">

              <rect
              x="3"
              y="4"
              width="18"
              height="18"
              rx="2"
              stroke="currentColor"
              strokeWidth="2" />

              <path
              d="M16 2V6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round" />

              <path
              d="M8 2V6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round" />

              <path d="M3 10H21" stroke="currentColor" strokeWidth="2" />
              <rect x="6" y="14" width="4" height="4" fill="currentColor" />
            </svg>
          </div>
        }
      </div>
      <div className="p-3">
        <div className="mb-1 flex items-center text-xs text-gray-500">
          <MapPin className="mr-1 h-3 w-3" />
          <span>{location}</span>
        </div>
        <h3 className="line-clamp-2 text-sm font-medium text-gray-900">
          {title}
        </h3>
      </div>
      <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
        <div className="flex items-center space-x-3">
          <button
            className="flex items-center text-gray-500 hover:text-red-500"
            onClick={handleLike}
            aria-label="Like event">

            <Heart
              className={`h-4 w-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />

            <span className="ml-1 text-xs">{likeCount}</span>
          </button>
          <button
            className="flex items-center text-gray-500 hover:text-blue-500"
            onClick={handleHelpful}
            aria-label="Mark as helpful">

            <ThumbsUp
              className={`h-4 w-4 ${isHelpful ? 'fill-current text-blue-500' : ''}`} />

            <span className="ml-1 text-xs">{helpfulCount}</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="text-gray-500 hover:text-news-primary"
            onClick={handleShare}
            aria-label="Share event">

            <Share2 className="h-4 w-4" />
          </button>
          <ChevronRight className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      {/* Share Modal */}
      {showShareModal &&
      <ShareModal
        onClose={() => setShowShareModal(false)}
        article={{
          title: title || 'Event'
        }} />

      }
    </div>);

};