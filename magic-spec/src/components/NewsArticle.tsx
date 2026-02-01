import React, { useState } from 'react';
import {
  MapPin,
  Heart,
  MessageSquare,
  BookmarkIcon,
  Share2Icon } from
'lucide-react';
import { SaveModal } from './modals/SaveModal';
import { ShareModal } from './modals/ShareModal';
export const NewsArticle = ({
  location,
  title,
  category,
  date,
  description,
  author,
  image
}) => {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const handleSave = () => {
    setShowSaveModal(true);
  };
  const handleShare = () => {
    setShowShareModal(true);
  };
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex">
        <div className="flex-1 p-4">
          <div className="mb-2 flex items-center text-xs text-gray-500">
            <MapPin className="mr-1 h-3 w-3" />
            <span>{location}</span>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">{title}</h2>
          <div className="mb-2 text-xs text-gray-500">
            <span className="font-medium text-gray-700">{category}</span>
            <span className="mx-2">•</span>
            <span>{date}</span>
          </div>
          <p className="mb-4 text-sm text-gray-600">{description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                <span className="text-xs font-medium">
                  {author.
                  split(' ').
                  map((n) => n[0]).
                  join('')}
                </span>
              </div>
              <div className="ml-2 text-xs">
                <div className="font-medium">Author</div>
                <div>{author}</div>
              </div>
            </div>
            <button
              className="rounded-md bg-gray-800 px-3 py-1 text-xs font-medium text-white"
              onClick={handleSave}>

              Save News
            </button>
          </div>
        </div>
        <div className="w-1/3">
          <img src={image} alt={title} className="h-full w-full object-cover" />
        </div>
      </div>
      <div className="flex border-t border-gray-100 bg-gray-50 px-4 py-2 text-xs text-gray-500">
        <div className="flex items-center mr-4">
          <Heart className="mr-1 h-3 w-3" />
          <span>0</span>
        </div>
        <div className="flex items-center mr-4">
          <MessageSquare className="mr-1 h-3 w-3" />
          <span>0</span>
        </div>
        <div
          className="flex items-center ml-auto cursor-pointer"
          onClick={handleShare}>

          <Share2Icon className="mr-1 h-3 w-3" />
          <span>Share</span>
        </div>
      </div>
      {/* Save Modal */}
      {showSaveModal &&
      <SaveModal
        onClose={() => setShowSaveModal(false)}
        article={{
          title,
          category,
          image
        }} />

      }
      {/* Share Modal */}
      {showShareModal &&
      <ShareModal
        onClose={() => setShowShareModal(false)}
        article={{
          title
        }} />

      }
    </div>);

};