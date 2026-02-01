import React from 'react';
import { Clock, AlignJustify, ZoomIn, Sidebar } from 'lucide-react';
export const StatusBar = ({
  wordCount,
  characterCount,
  readingTime,
  lastSaved,
  onToggleSidebar,
  sidebarOpen
}) => {
  // Format the last saved time
  const formatLastSaved = (date) => {
    if (!date) return 'Not saved yet';
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    if (diffSec < 60) return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-1.5 px-4 text-xs text-gray-600 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <AlignJustify className="h-3 w-3 mr-1.5" />
          <span>Words: {wordCount}</span>
        </div>
        <div>Characters: {characterCount}</div>
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1.5" />
          <span>Reading time: {readingTime} min</span>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div>Last saved: {formatLastSaved(lastSaved)}</div>
        <button
          onClick={onToggleSidebar}
          className={`p-1 rounded ${sidebarOpen ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
          title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}>

          <Sidebar className="h-3 w-3" />
        </button>
        <div className="flex items-center">
          <span>Zoom: 100%</span>
          <button className="ml-1 p-1 rounded hover:bg-gray-200">
            <ZoomIn className="h-3 w-3" />
          </button>
        </div>
      </div>
    </footer>);

};