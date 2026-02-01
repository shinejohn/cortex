import React, { useState } from 'react';
import { X } from 'lucide-react';
interface ToneSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (tone: string, style: string) => void;
}
export const ToneSelectorModal: React.FC<ToneSelectorModalProps> = ({
  isOpen,
  onClose,
  onApply
}) => {
  const [selectedTone, setSelectedTone] = useState('Objective News');
  const [selectedStyle, setSelectedStyle] = useState('Professional');
  if (!isOpen) return null;
  const handleApply = () => {
    onApply(selectedTone, selectedStyle);
    onClose();
  };
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
          <h3 className="text-lg font-semibold">Select Article Tone & Style</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700">

            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Article Tone
            </label>
            <div className="grid grid-cols-2 gap-2">
              {tones.map((tone) =>
              <label key={tone} className="flex items-center">
                  <input
                  type="radio"
                  name="tone"
                  value={tone}
                  checked={selectedTone === tone}
                  onChange={() => setSelectedTone(tone)}
                  className="mr-2" />

                  <span className="text-sm">{tone}</span>
                </label>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Writing Style
            </label>
            <div className="flex gap-4">
              {styles.map((style) =>
              <label key={style} className="flex items-center">
                  <input
                  type="radio"
                  name="style"
                  value={style}
                  checked={selectedStyle === style}
                  onChange={() => setSelectedStyle(style)}
                  className="mr-2" />

                  <span className="text-sm">{style}</span>
                </label>
              )}
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50">

            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">

            Apply
          </button>
        </div>
      </div>
    </div>);

};