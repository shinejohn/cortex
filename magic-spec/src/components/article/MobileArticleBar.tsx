import React, { useState } from 'react';
import {
  ThumbsUp,
  Heart,
  AlertCircle,
  MessageSquare,
  Share2,
  Bookmark } from
'lucide-react';
import { ShareModal } from '../modals/ShareModal';
import { SaveModal } from '../modals/SaveModal';
export const MobileArticleBar = ({
  commentCount,
  reactions,
  handleReaction,
  handleShare,
  saved,
  handleSave
}) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const openShareModal = () => {
    setShowShareModal(true);
  };
  const openSaveModal = () => {
    setShowSaveModal(true);
  };
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-4">
            <button
              className="flex flex-col items-center"
              onClick={() => handleReaction('helpful')}>

              <ThumbsUp className="h-5 w-5 text-gray-600" />
              <span className="text-xs text-gray-600">{reactions.helpful}</span>
            </button>
            <button
              className="flex flex-col items-center"
              onClick={() => handleReaction('love')}>

              <Heart className="h-5 w-5 text-gray-600" />
              <span className="text-xs text-gray-600">{reactions.love}</span>
            </button>
            <button
              className="flex flex-col items-center"
              onClick={() => handleReaction('surprising')}>

              <AlertCircle className="h-5 w-5 text-gray-600" />
              <span className="text-xs text-gray-600">
                {reactions.surprising}
              </span>
            </button>
          </div>
          <div className="h-6 w-px bg-gray-300 mx-2"></div>
          <button
            className="flex items-center"
            onClick={() =>
            document.getElementById('comments').scrollIntoView({
              behavior: 'smooth'
            })
            }>

            <MessageSquare className="h-5 w-5 text-gray-600 mr-1" />
            <span className="text-sm text-gray-600">{commentCount}</span>
          </button>
          <div className="h-6 w-px bg-gray-300 mx-2"></div>
          <button className="p-2" onClick={openShareModal}>
            <Share2 className="h-5 w-5 text-gray-600" />
          </button>
          <div className="h-6 w-px bg-gray-300 mx-2"></div>
          <button className="p-2" onClick={openSaveModal}>
            <Bookmark
              className="h-5 w-5 text-gray-600"
              fill={saved ? 'currentColor' : 'none'} />

          </button>
        </div>
      </div>
      {/* Share Modal */}
      {showShareModal &&
      <ShareModal
        onClose={() => setShowShareModal(false)}
        article={{
          title:
          'Clearwater City Council Approves $89.2M Budget for 2025 Fiscal Year'
        }} />

      }
      {/* Save Modal */}
      {showSaveModal &&
      <SaveModal
        onClose={() => setShowSaveModal(false)}
        article={{
          title:
          'Clearwater City Council Approves $89.2M Budget for 2025 Fiscal Year',
          category: 'LOCAL NEWS',
          image:
          'https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&h=720&q=80'
        }} />

      }
    </>);

};