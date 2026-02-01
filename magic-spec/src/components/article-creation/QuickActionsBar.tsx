import React from 'react';
import { Target, Ruler, RefreshCw, Edit } from 'lucide-react';
export const QuickActionsBar = ({
  onSetTone,
  onAdjustLength,
  onRegenerate,
  onEditManually
}) => {
  return (
    <div className="mt-6 bg-white rounded-lg shadow-md p-4">
      <div className="flex flex-wrap gap-3">
        <button
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
          onClick={onSetTone}>

          <Target className="w-4 h-4 text-news-primary" />
          <span className="font-medium">Set Tone</span>
        </button>
        <button
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
          onClick={onAdjustLength}>

          <Ruler className="w-4 h-4 text-news-primary" />
          <span className="font-medium">Adjust Length</span>
        </button>
        <button
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
          onClick={onRegenerate}>

          <RefreshCw className="w-4 h-4 text-news-primary" />
          <span className="font-medium">Regenerate</span>
        </button>
        <button
          className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
          onClick={onEditManually}>

          <Edit className="w-4 h-4 text-news-primary" />
          <span className="font-medium">Edit Manually</span>
        </button>
      </div>
    </div>);

};