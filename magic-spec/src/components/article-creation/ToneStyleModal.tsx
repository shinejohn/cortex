import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
export const ToneStyleModal = ({
  isOpen,
  onClose,
  onApply,
  currentTone,
  currentStyle
}) => {
  const [selectedTone, setSelectedTone] = useState(
    currentTone || 'Objective News'
  );
  const [selectedStyle, setSelectedStyle] = useState(
    currentStyle || 'Professional'
  );
  useEffect(() => {
    if (isOpen) {
      // Reset selections to current values when modal opens
      setSelectedTone(currentTone || 'Objective News');
      setSelectedStyle(currentStyle || 'Professional');
    }
  }, [isOpen, currentTone, currentStyle]);
  if (!isOpen) return null;
  const tones = [
  'Objective News',
  'Feature Story',
  'Opinion/Editorial',
  'Investigative',
  'Human Interest',
  'Educational'];

  const styles = ['Professional', 'Conversational', 'Academic'];
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Select Article Tone & Style
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700">

            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Article Tone
            </label>
            <div className="grid grid-cols-2 gap-3">
              {tones.map((tone) =>
              <label
                key={tone}
                className="flex items-center space-x-2 cursor-pointer">

                  <input
                  type="radio"
                  name="tone"
                  value={tone}
                  checked={selectedTone === tone}
                  onChange={() => setSelectedTone(tone)}
                  className="text-news-primary focus:ring-news-primary" />

                  <span className="text-sm text-gray-700">{tone}</span>
                </label>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Writing Style
            </label>
            <div className="flex space-x-6">
              {styles.map((style) =>
              <label
                key={style}
                className="flex items-center space-x-2 cursor-pointer">

                  <input
                  type="radio"
                  name="style"
                  value={style}
                  checked={selectedStyle === style}
                  onChange={() => setSelectedStyle(style)}
                  className="text-news-primary focus:ring-news-primary" />

                  <span className="text-sm text-gray-700">{style}</span>
                </label>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium">

            Cancel
          </button>
          <button
            onClick={() => onApply(selectedTone, selectedStyle)}
            className="px-4 py-2 bg-news-primary text-white rounded-md hover:bg-news-primary-dark font-medium">

            Apply
          </button>
        </div>
      </div>
    </div>);

};