import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Camera, User, Calendar, MapPin } from 'lucide-react';
export const PhotoGallerySection = () => {
  const navigate = useNavigate();
  // Mock photo gallery data
  const photos = [
  {
    id: '1',
    imageUrl:
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    title: 'Clearwater Beach Sunset',
    photographer: 'John Shine',
    date: 'July 28, 2025',
    location: 'Clearwater Beach'
  },
  {
    id: '2',
    imageUrl:
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    title: 'Downtown Farmers Market',
    photographer: 'Sarah Johnson',
    date: 'July 25, 2025',
    location: 'Downtown Clearwater'
  },
  {
    id: '3',
    imageUrl:
    'https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    title: 'Pier 60 Fishing',
    photographer: 'Mike Peterson',
    date: 'July 22, 2025',
    location: 'Pier 60'
  },
  {
    id: '4',
    imageUrl:
    'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    title: 'Beach Cleanup Event',
    photographer: 'Lisa Wong',
    date: 'July 20, 2025',
    location: 'Honeymoon Island'
  }];

  const handleViewAllPhotos = () => {
    navigate('/photos');
  };
  const handlePhotoClick = (photoId) => {
    navigate(`/photos/${photoId}`);
  };
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {photos.map((photo, index) =>
        <div
          key={photo.id}
          className="relative aspect-square rounded-md overflow-hidden group cursor-pointer"
          onClick={() => handlePhotoClick(photo.id)}>

            <img
            src={photo.imageUrl}
            alt={photo.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
              <h4 className="text-white text-sm font-medium truncate">
                {photo.title}
              </h4>
              <div className="flex items-center text-white text-xs mt-1">
                <User className="h-3 w-3 mr-1" />
                <span>{photo.photographer}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between items-center pt-4">
        <div className="text-xs text-gray-500 flex items-center">
          <Camera className="h-3.5 w-3.5 mr-1" />
          <span>Community Photos</span>
        </div>
        <button
          className="inline-flex items-center px-4 py-2 bg-news-primary text-white rounded-md text-sm font-medium hover:bg-news-primary-dark transition-colors"
          onClick={handleViewAllPhotos}>

          View All Photos
          <ChevronRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>);

};