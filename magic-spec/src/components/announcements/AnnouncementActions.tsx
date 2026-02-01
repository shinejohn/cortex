import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageCircle,
  Share2,
  ThumbsUp,
  Gift,
  Send,
  Bell,
  ExternalLink } from
'lucide-react';
export interface AnnouncementActionsProps {
  id: number;
  type: string;
  reactions: {
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
  onLike?: (e: React.MouseEvent) => void;
  onComment?: (e: React.MouseEvent) => void;
  onShare?: (e: React.MouseEvent) => void;
  onTypeAction?: (e: React.MouseEvent) => void;
  size?: 'sm' | 'md' | 'lg';
  showReadMore?: boolean;
  className?: string;
}
export const AnnouncementActions: React.FC<AnnouncementActionsProps> = ({
  id,
  type,
  reactions,
  isLiked = false,
  onLike,
  onComment,
  onShare,
  onTypeAction,
  size = 'md',
  showReadMore = false,
  className = ''
}) => {
  const navigate = useNavigate();
  const typeStyles = getTypeStyles(type);
  // Default handlers if none provided
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onLike) onLike(e);
  };
  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onComment) {
      onComment(e);
    } else {
      // Default behavior: navigate to detail page with focus on comments
      navigate(`/announcementDetail?id=${id}&focusComments=true`);
    }
  };
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onShare) {
      onShare(e);
    } else {
      // Default behavior could be implemented here
      alert('Share functionality will be implemented soon');
    }
  };
  const handleTypeAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTypeAction) {
      onTypeAction(e);
    } else {
      // Default type-specific action
      alert(`${getTypeActionLabel(type)} sent!`);
    }
  };
  const handleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/announcementDetail?id=${id}`);
  };
  // Size-based classes
  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3 mr-1';
      case 'lg':
        return 'h-5 w-5 mr-1.5';
      case 'md':
      default:
        return 'h-4 w-4 mr-1';
    }
  };
  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-base';
      case 'md':
      default:
        return 'text-sm';
    }
  };
  const getButtonPadding = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1';
      case 'lg':
        return 'px-4 py-2';
      case 'md':
      default:
        return 'px-3 py-1.5';
    }
  };
  const iconSize = getIconSize();
  const textSize = getTextSize();
  const buttonPadding = getButtonPadding();
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-4">
        <button
          className={`flex items-center ${isLiked ? typeStyles.accentText : 'text-gray-500'} hover:${typeStyles.accentText}`}
          onClick={handleLike}
          aria-label="Like">

          <Heart className={`${iconSize} ${isLiked ? 'fill-current' : ''}`} />
          <span className={textSize}>{reactions.likes}</span>
        </button>
        <button
          className="flex items-center text-gray-500 hover:text-news-primary"
          onClick={handleComment}
          aria-label="Comment">

          <MessageCircle className={iconSize} />
          <span className={textSize}>{reactions.comments}</span>
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <button
          className={`flex items-center text-gray-500 hover:${typeStyles.accentText} ${buttonPadding} rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200`}
          onClick={handleShare}
          aria-label="Share">

          <Share2 className={iconSize} />
          <span className={textSize}>Share</span>
        </button>
        {showReadMore ?
        <button
          className={`flex items-center ${typeStyles.accentText} ${buttonPadding} rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200`}
          onClick={handleReadMore}
          aria-label="Read More">

            <span className={textSize}>Read More</span>
          </button> :

        getTypeActionButton(
          type,
          handleTypeAction,
          iconSize,
          textSize,
          buttonPadding,
          typeStyles
        )
        }
      </div>
    </div>);

};
// Helper function to get type-specific action button
const getTypeActionButton = (
type: string,
handleAction: (e: React.MouseEvent) => void,
iconSize: string,
textSize: string,
buttonPadding: string,
typeStyles: any) =>
{
  switch (type) {
    case 'birth':
      return (
        <button
          className={`flex items-center text-blue-600 hover:text-blue-700 ${buttonPadding} rounded-md hover:bg-blue-50 border border-transparent hover:border-blue-200`}
          onClick={handleAction}
          aria-label="Send Congratulations">

          <Gift className={iconSize} />
          <span className={textSize}>Congratulate</span>
        </button>);

    case 'wedding':
    case 'engagement':
      return (
        <button
          className={`flex items-center text-purple-600 hover:text-purple-700 ${buttonPadding} rounded-md hover:bg-purple-50 border border-transparent hover:border-purple-200`}
          onClick={handleAction}
          aria-label="Send Wishes">

          <Gift className={iconSize} />
          <span className={textSize}>Send Wishes</span>
        </button>);

    case 'graduation':
      return (
        <button
          className={`flex items-center text-green-600 hover:text-green-700 ${buttonPadding} rounded-md hover:bg-green-50 border border-transparent hover:border-green-200`}
          onClick={handleAction}
          aria-label="Congratulate">

          <ThumbsUp className={iconSize} />
          <span className={textSize}>Congratulate</span>
        </button>);

    case 'obituary':
      return (
        <button
          className={`flex items-center text-gray-600 hover:text-gray-700 ${buttonPadding} rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200`}
          onClick={handleAction}
          aria-label="Send Condolences">

          <Send className={iconSize} />
          <span className={textSize}>Send Condolences</span>
        </button>);

    case 'celebration':
      return (
        <button
          className={`flex items-center text-yellow-600 hover:text-yellow-700 ${buttonPadding} rounded-md hover:bg-yellow-50 border border-transparent hover:border-yellow-200`}
          onClick={handleAction}
          aria-label="Send Wishes">

          <Bell className={iconSize} />
          <span className={textSize}>Send Wishes</span>
        </button>);

    default:
      return (
        <button
          className={`flex items-center ${typeStyles.accentText} ${buttonPadding} rounded-md hover:bg-gray-50 border border-transparent hover:border-gray-200`}
          onClick={handleAction}
          aria-label="View Details">

          <ExternalLink className={iconSize} />
          <span className={textSize}>View Details</span>
        </button>);

  }
};
// Helper function to get type-specific action label
const getTypeActionLabel = (type: string) => {
  switch (type) {
    case 'birth':
      return 'Congratulations';
    case 'wedding':
    case 'engagement':
    case 'celebration':
      return 'Best wishes';
    case 'graduation':
      return 'Congratulations';
    case 'obituary':
      return 'Condolences';
    default:
      return 'Acknowledgment';
  }
};
// Helper functions for type-specific styling and icons
export const getTypeStyles = (type: string) => {
  switch (type) {
    case 'birth':
      return {
        headerBg: 'bg-blue-50 border-l-4 border-blue-400',
        headerText: 'text-blue-700',
        accentText: 'text-blue-600',
        accentBg: 'bg-blue-50',
        accentBorder: 'border-blue-100'
      };
    case 'engagement':
      return {
        headerBg: 'bg-pink-50 border-l-4 border-pink-400',
        headerText: 'text-pink-700',
        accentText: 'text-pink-600',
        accentBg: 'bg-pink-50',
        accentBorder: 'border-pink-100'
      };
    case 'wedding':
      return {
        headerBg: 'bg-purple-50 border-l-4 border-purple-400',
        headerText: 'text-purple-700',
        accentText: 'text-purple-600',
        accentBg: 'bg-purple-50',
        accentBorder: 'border-purple-100'
      };
    case 'graduation':
      return {
        headerBg: 'bg-green-50 border-l-4 border-green-400',
        headerText: 'text-green-700',
        accentText: 'text-green-600',
        accentBg: 'bg-green-50',
        accentBorder: 'border-green-100'
      };
    case 'celebration':
      return {
        headerBg: 'bg-yellow-50 border-l-4 border-yellow-400',
        headerText: 'text-yellow-700',
        accentText: 'text-yellow-600',
        accentBg: 'bg-yellow-50',
        accentBorder: 'border-yellow-100'
      };
    case 'obituary':
      return {
        headerBg: 'bg-gray-100 border-l-4 border-gray-400',
        headerText: 'text-gray-700',
        accentText: 'text-gray-600',
        accentBg: 'bg-gray-100',
        accentBorder: 'border-gray-200'
      };
    case 'general':
    default:
      return {
        headerBg: 'bg-orange-50 border-l-4 border-orange-400',
        headerText: 'text-orange-700',
        accentText: 'text-orange-600',
        accentBg: 'bg-orange-50',
        accentBorder: 'border-orange-100'
      };
  }
};