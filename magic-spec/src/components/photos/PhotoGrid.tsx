import React from 'react';
import { Heart, MessageSquare, Calendar, MapPin } from 'lucide-react';
export const PhotoGrid = ({ photos, onPhotoClick }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) =>
      <div
        key={photo.id}
        className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => onPhotoClick(photo.id)}>

          <div className="aspect-square overflow-hidden">
            <img
            src={photo.imageUrl}
            alt={photo.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />

          </div>
          <div className="p-3">
            <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
              {photo.title}
            </h3>
            <p className="text-gray-500 text-xs mb-2 line-clamp-2">
              {photo.description}
            </p>
            <div className="flex items-center text-xs text-gray-500 mb-2">
              <Calendar className="h-3 w-3 mr-1" />
              <span>
                {new Date(photo.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
              </span>
              <span className="mx-1">•</span>
              <MapPin className="h-3 w-3 mr-1" />
              <span>{photo.community}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center mr-3">
                  <Heart className="h-3 w-3 mr-1 text-red-500" />
                  <span className="text-xs">{photo.likes}</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-3 w-3 mr-1 text-blue-500" />
                  <span className="text-xs">{photo.comments}</span>
                </div>
              </div>
              <div className="text-xs text-gray-500">By {photo.author}</div>
            </div>
          </div>
        </div>
      )}
    </div>);

};