import React from 'react';
import { Eye, Heart } from 'lucide-react';
interface PhotoCardProps {
  title: string;
  image: string;
  date: string;
  views?: number;
  likes?: number;
  onClick?: () => void;
  className?: string;
}
export const PhotoCard = ({
  title,
  image,
  date,
  views,
  likes,
  onClick,
  className = ''
}: PhotoCardProps) => {
  return (
    <div
      className={`group relative aspect-square rounded-lg overflow-hidden shadow-sm border border-gray-200 ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}>

      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-medium text-sm line-clamp-2">
            {title}
          </h3>
          <div className="flex items-center justify-between mt-1 text-xs text-white/80">
            <span>{date}</span>
            {(views !== undefined || likes !== undefined) &&
            <div className="flex items-center space-x-2">
                {views !== undefined &&
              <div className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    <span>{views}</span>
                  </div>
              }
                {likes !== undefined &&
              <div className="flex items-center">
                    <Heart className="h-3 w-3 mr-1" />
                    <span>{likes}</span>
                  </div>
              }
              </div>
            }
          </div>
        </div>
      </div>
    </div>);

};