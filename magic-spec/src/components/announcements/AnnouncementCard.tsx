import React, { useState } from 'react';
import { MapPin, Calendar } from 'lucide-react';
import { AnnouncementActions } from './AnnouncementActions';
export const AnnouncementCard = ({
  type,
  title,
  content,
  image,
  date,
  location,
  reactions,
  id = 0,
  onClick
}) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reactions.likes);
  const [commentsCount, setCommentsCount] = useState(reactions.comments);
  const handleLike = (e) => {
    e.stopPropagation(); // Prevent the click from bubbling up to the parent
    if (liked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }
    setLiked(!liked);
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div
        className={`px-4 py-3 flex items-center ${getTypeStyles(type).headerBg}`}>

        <span className="mr-2 text-xl">{getTypeEmoji(type)}</span>
        <span
          className={`text-sm font-medium ${getTypeStyles(type).headerText}`}>

          {getTypeLabel(type)}
        </span>
      </div>
      <div className="p-4">
        <div className="flex flex-col md:flex-row">
          {image &&
          <div className="w-full md:w-1/3 mb-4 md:mb-0 md:mr-4">
              <img
              src={image}
              alt={title}
              className="w-full h-40 md:h-32 object-cover rounded-md shadow-sm hover:opacity-90 transition-opacity" />

            </div>
          }
          <div className={`${image ? 'w-full md:w-2/3' : 'w-full'}`}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{location}</span>
              <span className="mx-1">•</span>
              <Calendar className="h-3 w-3 mr-1" />
              <span>{date}</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">{content}</p>
            {/* Using the new AnnouncementActions component */}
            <AnnouncementActions
              id={id}
              type={type}
              reactions={{
                likes: likesCount,
                comments: commentsCount
              }}
              isLiked={liked}
              onLike={handleLike}
              size="sm" />

          </div>
        </div>
      </div>
    </div>);

};
// Helper functions for type-specific styling and icons
const getTypeEmoji = (type) => {
  switch (type) {
    case 'birth':
      return '🎂';
    case 'engagement':
      return '💑';
    case 'wedding':
      return '💒';
    case 'graduation':
      return '🎓';
    case 'celebration':
      return '🎉';
    case 'obituary':
      return '💔';
    case 'general':
    default:
      return '📢';
  }
};
const getTypeLabel = (type) => {
  switch (type) {
    case 'birth':
      return 'Birth Announcement';
    case 'engagement':
      return 'Engagement';
    case 'wedding':
      return 'Wedding';
    case 'graduation':
      return 'Graduation';
    case 'celebration':
      return 'Celebration';
    case 'obituary':
      return 'Obituary';
    case 'general':
    default:
      return 'Announcement';
  }
};
const getTypeStyles = (type) => {
  switch (type) {
    case 'birth':
      return {
        headerBg: 'bg-blue-50 border-l-4 border-blue-400',
        headerText: 'text-blue-700',
        accentText: 'text-blue-600'
      };
    case 'engagement':
      return {
        headerBg: 'bg-pink-50 border-l-4 border-pink-400',
        headerText: 'text-pink-700',
        accentText: 'text-pink-600'
      };
    case 'wedding':
      return {
        headerBg: 'bg-purple-50 border-l-4 border-purple-400',
        headerText: 'text-purple-700',
        accentText: 'text-purple-600'
      };
    case 'graduation':
      return {
        headerBg: 'bg-green-50 border-l-4 border-green-400',
        headerText: 'text-green-700',
        accentText: 'text-green-600'
      };
    case 'celebration':
      return {
        headerBg: 'bg-yellow-50 border-l-4 border-yellow-400',
        headerText: 'text-yellow-700',
        accentText: 'text-yellow-600'
      };
    case 'obituary':
      return {
        headerBg: 'bg-gray-100 border-l-4 border-gray-400',
        headerText: 'text-gray-700',
        accentText: 'text-gray-600'
      };
    case 'general':
    default:
      return {
        headerBg: 'bg-orange-50 border-l-4 border-orange-400',
        headerText: 'text-orange-700',
        accentText: 'text-orange-600'
      };
  }
};