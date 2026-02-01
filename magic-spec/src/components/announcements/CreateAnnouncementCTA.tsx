import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
export const CreateAnnouncementCTA = () => {
  const navigate = useNavigate();
  const handleCreateAnnouncement = () => {
    navigate('/announcementCreator');
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0 md:mr-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Share Your News with the Community
          </h3>
          <p className="text-gray-600 max-w-xl">
            Celebrate life's moments, big and small. Create an announcement to
            share births, engagements, weddings, graduations, and other special
            occasions.
          </p>
        </div>
        <button
          onClick={handleCreateAnnouncement}
          className="px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center">

          <PlusCircle className="h-5 w-5 mr-2" />
          Create Announcement
        </button>
      </div>
    </div>);

};