import React, { useState, memo } from 'react';
import { MapPin, Calendar, Heart, Flower, Gift, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export const MemorialSection = () => {
  const navigate = useNavigate();
  const handleViewAllMemorials = () => {
    // Navigate to a dedicated memorials page
    navigate('/memorials');
  };
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center">
          <Flower className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-bold text-gray-900">In Memoriam</h3>
        </div>
      </div>
      <div className="p-4">
        <div className="space-y-4">
          <MemorialCard
            id="1"
            name="Margaret Lee Wilson"
            years="1932 - 2023"
            location="Clearwater, FL"
            date="July 25, 2023"
            image="https://images.unsplash.com/photo-1551837818-f52fc6991b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" />

          <MemorialCard
            id="2"
            name="Robert James Thompson"
            years="1945 - 2023"
            location="Dunedin, FL"
            date="July 18, 2023"
            image="https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" />

          <MemorialCard
            id="3"
            name="Elizabeth Anne Parker"
            years="1958 - 2023"
            location="Palm Harbor, FL"
            date="July 10, 2023"
            image="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" />

        </div>
        <div className="mt-6 text-center">
          <button
            onClick={handleViewAllMemorials}
            className="text-news-primary text-sm font-medium hover:underline">

            View all memorials
          </button>
        </div>
      </div>
    </div>);

};
const MemorialCard = ({ id, name, years, location, date, image }) => {
  const [expanded, setExpanded] = useState(false);
  const [memoryText, setMemoryText] = useState('');
  const navigate = useNavigate();
  const handleCardClick = (e) => {
    // Prevent navigation if clicking on the heart button or within the expanded section
    if (
    e.target.closest('button.heart-button') ||
    e.target.closest('div.expanded-section'))
    {
      return;
    }
    // Navigate to memorial detail page
    navigate(`/memorial/${id}`);
  };
  return (
    <div
      className="border-b border-gray-100 pb-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-md"
      onClick={handleCardClick}>

      <div className="flex items-center p-2">
        <div className="h-14 w-14 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover grayscale" />

        </div>
        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium text-gray-900">{name}</h4>
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <span>{years}</span>
            <span className="mx-1">•</span>
            <MapPin className="h-3 w-3 mr-1" />
            <span>{location}</span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            <Calendar className="inline h-3 w-3 mr-1" />
            <span>Service: {date}</span>
          </div>
        </div>
        <button
          className="ml-2 text-gray-400 hover:text-red-400 heart-button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}>

          <Heart className="h-4 w-4" />
        </button>
      </div>
      {expanded &&
      <div
        className="mt-2 px-2 animate-fade-in expanded-section"
        onClick={(e) => e.stopPropagation()}>

          <div className="bg-gray-50 rounded-md p-3 text-xs text-gray-600 italic">
            "May the memories of your loved one bring you comfort during this
            difficult time."
          </div>
          <div className="mt-3 flex space-x-2">
            <button className="flex-1 text-xs py-1.5 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-700">
              <Flower className="h-3 w-3 mr-1" />
              Send Flowers
            </button>
            <button className="flex-1 text-xs py-1.5 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 flex items-center justify-center text-gray-700">
              <Gift className="h-3 w-3 mr-1" />
              Memorial Fund
            </button>
          </div>
          <div className="mt-3">
            <textarea
            placeholder="Share a memory or condolence..."
            className="w-full text-xs p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
            rows={2}
            value={memoryText}
            onChange={(e) => setMemoryText(e.target.value)}>
          </textarea>
            <div className="flex justify-end mt-2">
              <button
              className={`text-xs py-1 px-3 rounded flex items-center ${memoryText ? 'bg-news-primary text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              disabled={!memoryText}>

                <Send className="h-3 w-3 mr-1" />
                Send
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

};