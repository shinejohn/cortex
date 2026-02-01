import React, { useState } from 'react';
import { Upload, Image, Edit, Sparkles, Tag, X } from 'lucide-react';
export const MediaManager = ({ mediaItems, handleAddMedia }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const demoImages = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    caption: 'Clearwater City Hall during budget meeting',
    alt: 'Exterior view of Clearwater City Hall with people entering the building'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80',
    caption: 'Downtown Clearwater street view',
    alt: 'Street view of downtown Clearwater showing shops and pedestrians'
  }];

  const handleUploadClick = () => {
    setShowUploadModal(true);
  };
  const handleSelectDemoImage = (image) => {
    handleAddMedia(image);
    setShowUploadModal(false);
  };
  return (
    <div className="bg-white rounded-lg border border-border-light shadow-sm">
      <div className="p-4 border-b border-border-light flex items-center justify-between">
        <div className="flex items-center">
          <Image className="h-5 w-5 mr-2 text-news-primary" />
          <h2 className="font-display text-lg font-bold text-text-primary">
            Add Media
          </h2>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start space-x-3 overflow-x-auto pb-2">
          <div
            className="flex-shrink-0 w-24 h-24 border-2 border-dashed border-border-medium rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-bg-secondary"
            onClick={handleUploadClick}>

            <Upload className="h-6 w-6 text-text-tertiary mb-1" />
            <span className="text-xs text-text-tertiary">Upload</span>
          </div>
          {mediaItems.length > 0 ?
          mediaItems.map((item) =>
          <div key={item.id} className="flex-shrink-0 w-36 relative">
                <div className="rounded-lg overflow-hidden border border-border-light">
                  <img
                src={item.url}
                alt={item.alt}
                className="w-full h-24 object-cover" />

                </div>
                <div className="mt-1 flex justify-between items-center">
                  <button className="text-xs text-news-primary hover:underline flex items-center">
                    <Edit className="h-3 w-3 mr-0.5" />
                    Caption
                  </button>
                  <button className="text-xs text-breaking-red hover:underline flex items-center">
                    <X className="h-3 w-3 mr-0.5" />
                    Remove
                  </button>
                </div>
              </div>
          ) :

          <div className="flex-1 py-6 text-center">
              <p className="text-sm text-text-tertiary">
                No media added yet. Upload images or videos to enhance your
                story.
              </p>
            </div>
          }
        </div>
        <div className="mt-3 pt-3 border-t border-border-light">
          <div className="flex justify-between items-center">
            <div className="text-xs text-text-tertiary">
              ⚠️ Remember: Always credit photographers and get permission for
              images
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1.5 bg-bg-secondary text-text-secondary hover:bg-bg-tertiary rounded-md text-xs font-medium flex items-center">
                <Sparkles className="h-3 w-3 mr-1" />
                Auto-Caption
              </button>
              <button className="px-3 py-1.5 bg-bg-secondary text-text-secondary hover:bg-bg-tertiary rounded-md text-xs font-medium flex items-center">
                <Tag className="h-3 w-3 mr-1" />
                Generate Alt Text
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Upload Modal */}
      {showUploadModal &&
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg">
            <div className="p-4 border-b border-border-light flex items-center justify-between">
              <h3 className="font-medium text-text-primary">Add Media</h3>
              <button
              className="text-text-tertiary hover:text-text-secondary"
              onClick={() => setShowUploadModal(false)}>

                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="border-2 border-dashed border-border-medium rounded-lg p-8 text-center mb-4">
                <Upload className="h-8 w-8 text-text-tertiary mx-auto mb-2" />
                <p className="text-sm text-text-secondary mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-text-tertiary">
                  Supported formats: JPG, PNG, GIF, MP4
                </p>
                <button className="mt-4 px-4 py-2 bg-news-primary text-white rounded-md text-sm font-medium hover:bg-news-primary-dark">
                  Browse Files
                </button>
              </div>
              <div className="mt-6">
                <h4 className="text-sm font-medium text-text-secondary mb-3">
                  Or choose from demo images:
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {demoImages.map((image) =>
                <div
                  key={image.id}
                  className="border border-border-light rounded-lg overflow-hidden cursor-pointer hover:border-news-primary"
                  onClick={() => handleSelectDemoImage(image)}>

                      <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-32 object-cover" />

                      <div className="p-2">
                        <p className="text-xs text-text-secondary truncate">
                          {image.caption}
                        </p>
                      </div>
                    </div>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>);

};