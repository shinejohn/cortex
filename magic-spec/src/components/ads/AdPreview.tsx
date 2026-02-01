import React from 'react';
import { ExternalLink } from 'lucide-react';
interface AdPreviewProps {
  adFormat: string;
  adData: {
    title: string;
    image: any;
    bodyText: string;
    callToAction: string;
    destinationUrl: string;
  };
  device: 'desktop' | 'mobile';
}
export const AdPreview: React.FC<AdPreviewProps> = ({
  adFormat,
  adData,
  device
}) => {
  const formatDimensions = {
    compact: {
      width: '300px',
      height: '100px'
    },
    standard: {
      width: '300px',
      height: '250px'
    },
    banner: {
      width: device === 'desktop' ? '728px' : '320px',
      height: device === 'desktop' ? '90px' : '50px'
    },
    premium: {
      width: '300px',
      height: '600px'
    }
  };
  return (
    <div
      className="bg-white border border-gray-300 rounded-lg overflow-hidden mx-auto"
      style={{
        width: formatDimensions[adFormat]?.width || '300px',
        height: formatDimensions[adFormat]?.height || '250px',
        maxWidth: '100%'
      }}>

      <div className="h-full flex flex-col">
        {adData.image &&
        <div
          className="relative"
          style={{
            height: adFormat === 'premium' ? '60%' : '50%'
          }}>

            <img
            src={adData.image}
            alt="Ad preview"
            className="w-full h-full object-cover" />

            <div className="absolute top-1 left-1 bg-gray-900 bg-opacity-70 text-white text-xs px-1 rounded">
              Ad
            </div>
          </div>
        }
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm mb-1 line-clamp-2">
              {adData.title || 'Ad Title'}
            </h3>
            {adFormat !== 'compact' && adFormat !== 'banner' &&
            <p className="text-xs text-gray-600 mb-2 line-clamp-3">
                {adData.bodyText || 'Ad description text goes here.'}
              </p>
            }
          </div>
          <div className="flex items-center justify-between mt-auto">
            <button className="text-xs bg-news-primary text-white px-3 py-1 rounded">
              {adData.callToAction || 'Learn More'}
            </button>
            <ExternalLink className="h-3 w-3 text-gray-400" />
          </div>
        </div>
      </div>
    </div>);

};