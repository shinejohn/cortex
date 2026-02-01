import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
export const AddEventButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };
  const handleCreateEvent = () => {
    navigate('/eventCreator');
    setIsOpen(false);
  };
  return (
    <div className="fixed bottom-20 right-6 z-40">
      {/* Quick actions panel */}
      {isOpen &&
      <div className="bg-white rounded-lg shadow-lg mb-4 overflow-hidden border border-gray-200 w-64">
          <div className="p-3 border-b border-gray-200 bg-news-primary text-white">
            <h3 className="text-sm font-medium">Add Event</h3>
          </div>
          <div className="p-4 space-y-3">
            <button
            onClick={handleCreateEvent}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm">

              📅 Submit Community Event
            </button>
            <button
            onClick={handleCreateEvent}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm">

              🎭 List Arts & Culture Event
            </button>
            <button
            onClick={handleCreateEvent}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm">

              🏆 Add Sports Event
            </button>
            <button
            onClick={handleCreateEvent}
            className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-sm">

              🍽️ Post Food & Drink Event
            </button>
            <div className="pt-2 border-t border-gray-200">
              <button
              onClick={handleCreateEvent}
              className="w-full bg-news-primary text-white py-2 rounded-md text-sm">

                Create New Event
              </button>
            </div>
          </div>
        </div>
      }
      {/* FAB button */}
      <button
        onClick={toggleOpen}
        className={`p-3 rounded-full shadow-lg focus:outline-none ${isOpen ? 'bg-gray-700 text-white' : 'bg-news-primary text-white'}`}>

        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>
    </div>);

};