import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
export const BreakingNewsBar = ({ scope = 'local' }) => {
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const localBreakingNews = [
  'City Council approves new waterfront development plan',
  'Tropical storm warning issued for coastal areas',
  'Local high school wins state championship'];

  const nationalBreakingNews = [
  'Senate passes major infrastructure bill with bipartisan support',
  'FDA approves new breakthrough cancer treatment',
  'Supreme Court to hear landmark case on digital privacy',
  'White House announces new climate initiative',
  'Major tech companies agree to AI safety standards'];

  const breakingNews =
  scope === 'local' ? localBreakingNews : nationalBreakingNews;
  useEffect(() => {
    // Reset index when scope changes
    setCurrentNewsIndex(0);
    const interval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % breakingNews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [scope, breakingNews.length]);
  return (
    <div className="bg-breaking-red text-white rounded-md p-2 flex items-center overflow-hidden flex-1">
      <div className="flex-shrink-0 flex items-center mr-3">
        <AlertTriangle className="h-4 w-4" />
        <span className="ml-2 font-bold">BREAKING NEWS</span>
      </div>
      <div className="overflow-hidden relative h-5">
        {breakingNews.map((news, index) =>
        <div
          key={index}
          className="absolute whitespace-nowrap transition-all duration-500 ease-in-out text-sm"
          style={{
            transform: `translateY(${(index - currentNewsIndex) * 100}%)`,
            opacity: index === currentNewsIndex ? 1 : 0
          }}>

            {news}
          </div>
        )}
      </div>
    </div>);

};