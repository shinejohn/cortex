import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  Eye,
  Edit2,
  Settings,
  ChevronDown } from
'lucide-react';
export const EditorHeader = ({
  title,
  onTitleChange,
  onBackClick,
  onSave,
  onPreviewToggle,
  isPreview,
  isDirty
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [showSettings, setShowSettings] = useState(false);
  const titleInputRef = useRef(null);
  const settingsRef = useRef(null);
  useEffect(() => {
    setTempTitle(title);
  }, [title]);
  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditing]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const handleTitleClick = () => {
    setIsEditing(true);
  };
  const handleTitleBlur = () => {
    setIsEditing(false);
    if (tempTitle.trim() !== '') {
      onTitleChange(tempTitle);
    } else {
      setTempTitle(title);
    }
  };
  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setTempTitle(title);
      setIsEditing(false);
    }
  };
  const handleSettingsOption = (option) => {
    // Handle settings options
    alert(
      `${option} setting selected - this would open the settings panel in a real app`
    );
    setShowSettings(false);
  };
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-full mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackClick}
              className="text-gray-600 hover:text-gray-900 p-1 rounded transition-colors flex items-center"
              title="Back to article">

              <ArrowLeft className="h-5 w-5" />
              <span className="ml-1 hidden sm:inline">Back</span>
            </button>
            <div className="h-6 border-l border-gray-300 mx-2"></div>
            {isEditing ?
            <input
              ref={titleInputRef}
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="text-lg font-medium text-gray-900 border-b-2 border-blue-500 focus:outline-none px-1 py-0.5 w-full max-w-md"
              placeholder="Enter article title..." /> :


            <h1
              onClick={handleTitleClick}
              className="text-lg font-medium text-gray-900 cursor-text hover:bg-gray-100 px-2 py-0.5 rounded transition-colors truncate max-w-md"
              title={title}>

                {title || 'Untitled Article'}
              </h1>
            }
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onPreviewToggle}
              className={`p-1.5 rounded-md flex items-center text-sm font-medium ${isPreview ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
              title={
              isPreview ? 'Switch to edit mode' : 'Switch to preview mode'
              }>

              {isPreview ?
              <>
                  <Edit2 className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Edit</span>
                </> :

              <>
                  <Eye className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">Preview</span>
                </>
              }
            </button>
            <button
              onClick={onSave}
              className={`p-1.5 rounded-md flex items-center text-sm font-medium ${isDirty ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              title="Save and return">

              <Save className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Save</span>
            </button>
            <div className="relative" ref={settingsRef}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 rounded-md text-gray-700 hover:bg-gray-100 flex items-center text-sm font-medium"
                title="Editor settings">

                <Settings className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Settings</span>
                <ChevronDown className="h-3 w-3 ml-1" />
              </button>
              {showSettings &&
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-20">
                  <div className="py-1">
                    <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleSettingsOption('Font Size')}>

                      Font Size: Normal
                    </button>
                    <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleSettingsOption('Theme')}>

                      Theme: Light
                    </button>
                    <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() =>
                    handleSettingsOption('Distraction Free Mode')
                    }>

                      Distraction Free Mode
                    </button>
                    <button
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => handleSettingsOption('Keyboard Shortcuts')}>

                      Keyboard Shortcuts
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </header>);

};