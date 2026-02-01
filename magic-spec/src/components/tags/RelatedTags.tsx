import React from 'react';
import { Hash, ArrowRight } from 'lucide-react';
export const RelatedTags = ({ tags }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-800">Related Topics</h3>
      </div>
      <div className="p-4">
        {/* Visual tag map */}
        <div className="mb-4 bg-gray-50 rounded-lg p-4 h-48 relative">
          {tags.map((tag, index) => {
            // Calculate position based on tag weight
            const size = 14 + tag.weight * 10;
            const opacity = 0.6 + tag.weight * 0.4;
            // Distribute tags across the container
            const positions = [
            {
              top: '20%',
              left: '30%'
            },
            {
              top: '60%',
              left: '70%'
            },
            {
              top: '40%',
              left: '50%'
            },
            {
              top: '70%',
              left: '30%'
            },
            {
              top: '30%',
              left: '70%'
            },
            {
              top: '50%',
              left: '20%'
            },
            {
              top: '10%',
              left: '60%'
            }];

            const position = positions[index % positions.length];
            return (
              <div
                key={tag.id}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-sm border border-gray-200 px-3 py-1 hover:shadow-md transition-all"
                style={{
                  top: position.top,
                  left: position.left,
                  fontSize: `${size}px`,
                  opacity: opacity,
                  zIndex: Math.floor(tag.weight * 10)
                }}>

                <div className="flex items-center whitespace-nowrap">
                  <Hash className="h-3 w-3 mr-1" />
                  <span>{tag.name}</span>
                </div>
              </div>);

          })}
        </div>
        {/* Tag list */}
        <div className="space-y-2">
          {tags.map((tag) =>
          <a
            key={tag.id}
            href={`/tags/${tag.id}`}
            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md">

              <div className="flex items-center">
                <Hash className="h-4 w-4 mr-1.5 text-gray-500" />
                <span className="text-gray-700">{tag.name}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </a>
          )}
        </div>
      </div>
    </div>);

};