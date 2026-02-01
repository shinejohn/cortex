import React from 'react';
import { MapPin, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export const AnnouncementsSection = () => {
  const navigate = useNavigate();
  const handleAnnouncementClick = (id) => {
    navigate(`/announcementDetail?id=${id}`);
  };
  return (
    <div className="rounded-md border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-center mb-3">
        <div className="bg-yellow-100 p-1 rounded-md mr-2">
          <Bell className="h-4 w-4 text-yellow-600" />
        </div>
        <h2 className="font-display text-sm font-bold text-news-primary">
          Announcements
        </h2>
      </div>
      <div className="space-y-3">
        <div
          className="flex border-b border-gray-100 pb-2 cursor-pointer hover:bg-gray-50 transition-colors rounded-md p-1"
          onClick={() => handleAnnouncementClick(1)}>

          <img
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            alt="Graduate announcement"
            className="h-12 w-12 rounded-md object-cover" />

          <div className="ml-2">
            <div className="mb-1 flex items-center text-xs text-gray-500">
              <MapPin className="mr-1 h-2 w-2" />
              <span className="text-xs">Clearwater</span>
            </div>
            <h3 className="text-xs font-medium text-news-primary line-clamp-2">
              Local Student Graduates with Honors
            </h3>
          </div>
        </div>
        <div
          className="flex cursor-pointer hover:bg-gray-50 transition-colors rounded-md p-1"
          onClick={() => handleAnnouncementClick(2)}>

          <img
            src="https://images.unsplash.com/photo-1511988617509-a57c8a288659?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            alt="Community event"
            className="h-12 w-12 rounded-md object-cover" />

          <div className="ml-2">
            <div className="mb-1 flex items-center text-xs text-gray-500">
              <MapPin className="mr-1 h-2 w-2" />
              <span className="text-xs">Dunedin</span>
            </div>
            <h3 className="text-xs font-medium text-news-primary line-clamp-2">
              Dunedin Downtown Market Returns
            </h3>
          </div>
        </div>
      </div>
    </div>);

};