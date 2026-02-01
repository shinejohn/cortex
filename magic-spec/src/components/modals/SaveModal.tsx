import React from 'react';
import { X, Bookmark } from 'lucide-react';
interface SaveModalProps {
  onClose: () => void;
  article: {
    title: string;
    category?: string;
    image?: string;
  };
}
export const SaveModal: React.FC<SaveModalProps> = ({ onClose, article }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">

          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center mb-4">
          <Bookmark className="h-6 w-6 text-news-primary mr-2" />
          <h2 className="text-xl font-bold">Save to Collection</h2>
        </div>
        <div className="mb-4">
          <div className="flex items-start mb-4">
            {article.image &&
            <div className="w-16 h-16 bg-gray-200 rounded overflow-hidden mr-3 flex-shrink-0">
                <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover" />

              </div>
            }
            <div>
              {article.category &&
              <div className="text-xs text-gray-500 mb-1">
                  {article.category}
                </div>
              }
              <div className="font-medium">{article.title}</div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md mr-2 hover:bg-gray-300">

            Cancel
          </button>
          <button
            onClick={onClose}
            className="bg-news-primary text-white px-4 py-2 rounded-md hover:bg-news-primary-dark">

            Save
          </button>
        </div>
      </div>
    </div>);

};