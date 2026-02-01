import React, { useEffect, useState } from 'react';
import { MapPin, Users, ThermometerIcon, Globe } from 'lucide-react';
import { WeatherWidget } from './WeatherWidget';
import { BreakingNewsBar } from './BreakingNewsBar';
import { CommunitySelector } from '../location/CommunitySelector';
import { useLocationDetection } from '../location/LocationDetector';
import { useNavigate, useLocation } from 'react-router-dom';
export const HeroSection = ({
  greeting,
  activeReaders,
  isNational = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLocalNews, setIsLocalNews] = useState(!isNational);
  const { locationData } = useLocationDetection();
  const cityName = locationData?.city || 'Clearwater';
  // Update toggle state based on current route
  useEffect(() => {
    setIsLocalNews(!isNational);
  }, [isNational]);
  const toggleNewsScope = () => {
    const newValue = !isLocalNews;
    setIsLocalNews(newValue);
    // Navigate to appropriate page based on toggle
    if (newValue) {
      // Navigate to local news
      navigate('/');
    } else {
      // Navigate to national news
      navigate('/national');
    }
  };
  return (
    <div className="relative bg-white border-b border-gray-300">
      {/* Secondary header with location and weather */}
      <div className="container mx-auto px-4 py-3 border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <CommunitySelector />
            <span className="mx-2 text-gray-400">|</span>
            <div className="flex items-center text-gray-700">
              <ThermometerIcon className="h-4 w-4 mr-1 text-news-primary" />
              <span>82°F</span>
            </div>
            {/* News scope toggle */}
            <div className="ml-4 flex items-center">
              <button
                className={`text-sm mr-2 flex items-center cursor-pointer ${isLocalNews ? 'text-news-primary font-medium' : 'text-gray-500'}`}
                onClick={() => {
                  if (!isLocalNews) toggleNewsScope();
                }}>

                Local
              </button>
              <div className="flex items-center space-x-1">
                <button
                  className={`w-4 h-4 rounded-full border ${isLocalNews ? 'bg-news-primary border-news-primary' : 'border-gray-400'} cursor-pointer`}
                  onClick={() => {
                    if (!isLocalNews) toggleNewsScope();
                  }}>
                </button>
                <button
                  className={`w-4 h-4 rounded-full border ${!isLocalNews ? 'bg-news-primary border-news-primary' : 'border-gray-400'} cursor-pointer`}
                  onClick={() => {
                    if (isLocalNews) toggleNewsScope();
                  }}>
                </button>
              </div>
              <button
                className={`text-sm ml-2 flex items-center cursor-pointer ${!isLocalNews ? 'text-news-primary font-medium' : 'text-gray-500'}`}
                onClick={() => {
                  if (isLocalNews) toggleNewsScope();
                }}>

                <Globe className="h-3 w-3 mr-0.5" />
                National
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <WeatherWidget />
            <div className="flex items-center ml-auto">
              <Users className="h-4 w-4 mr-2 text-community-green" />
              <span className="font-medium text-community-green">
                {activeReaders} {isLocalNews ? 'neighbors' : 'readers'} reading
                now
              </span>
            </div>
          </div>
        </div>
      </div>
      {/* Breaking news bar without personal greeting */}
      <div className="container mx-auto px-4 py-2">
        <BreakingNewsBar scope={isLocalNews ? 'local' : 'national'} />
      </div>
    </div>);

};