import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, X, Edit, Maximize2, FileText } from 'lucide-react';
export const PageDirectoryButton = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const menuRef = useRef(null);
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  const handleEditorOpen = () => {
    // Navigate to the editor with a mock article ID
    navigate('/editor/123');
    setIsOpen(false);
  };
  return (
    <div className="fixed bottom-24 right-4 z-50" ref={menuRef}>
      {isOpen &&
      <div className="bg-white rounded-lg shadow-lg mb-2 overflow-hidden">
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-medium text-gray-800">Page Directory</h3>
          </div>
          <div className="p-2">
            <button
            onClick={() => {
              navigate('/page-directory');
              setIsOpen(false);
            }}
            className="flex items-center w-full p-2 text-left hover:bg-gray-100 rounded-md">

              <Grid className="w-4 h-4 mr-2 text-gray-600" />
              <span>View All Pages</span>
            </button>
            <button
            onClick={handleEditorOpen}
            className="flex items-center w-full p-2 text-left hover:bg-gray-100 rounded-md">

              <Maximize2 className="w-4 h-4 mr-2 text-blue-600" />
              <span>Full-Screen Editor</span>
            </button>
            <button
            className="flex items-center w-full p-2 text-left hover:bg-gray-100 rounded-md"
            onClick={() => {
              navigate('/create-article');
              setIsOpen(false);
            }}>

              <FileText className="w-4 h-4 mr-2 text-green-600" />
              <span>New Article</span>
            </button>
          </div>
        </div>
      }
      <button
        onClick={toggleMenu}
        onMouseEnter={() => {
          setShowTooltip(true);
        }}
        onMouseLeave={() => {
          setTimeout(() => setShowTooltip(false), 300);
        }}
        className="bg-news-primary hover:bg-news-primary-dark text-white rounded-full p-3 shadow-lg flex items-center justify-center transition-all"
        aria-label="Page Directory">

        {isOpen ? <X className="h-6 w-6" /> : <Grid className="h-6 w-6" />}
      </button>
      {showTooltip && !isOpen &&
      <div className="absolute bottom-full right-0 mb-2 bg-gray-800 text-white text-sm py-1 px-2 rounded shadow-lg whitespace-nowrap">
          Page Directory & Tools
        </div>
      }
    </div>);

};
export default PageDirectoryButton;