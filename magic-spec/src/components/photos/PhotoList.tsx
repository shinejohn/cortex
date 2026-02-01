import React from 'react';
import { Heart, MessageSquare, Calendar, MapPin, User } from 'lucide-react';
export const PhotoList = ({ photos, onPhotoClick }) => {
  return (
    <div className="space-y-4">
      {photos.map((photo) =>
      <div
        key={photo.id}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onPhotoClick(photo.id)}>

          <div className="flex flex-col md:flex-row">
            <div className="md:w-48 h-48 flex-shrink-0">
              <img
              src={photo.imageUrl}
              alt={photo.title}
              className="w-full h-full object-cover" />

            </div>
            <div className="p-4 flex-1">
              <h3 className="font-medium text-gray-900 text-lg mb-2">
                {photo.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{photo.description}</p>
              <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4">
                <div className="flex items-center mr-4">
                  <User className="h-4 w-4 mr-1" />
                  <span>{photo.author}</span>
                </div>
                <div className="flex items-center mr-4">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {new Date(photo.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{photo.community}</span>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex items-center mr-4">
                  <Heart className="h-4 w-4 mr-1 text-red-500" />
                  <span>{photo.likes} likes</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-4 w-4 mr-1 text-blue-500" />
                  <span>{photo.comments} comments</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>);

};