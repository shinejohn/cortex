import React from 'react';
import { Check } from 'lucide-react';
interface AdFormat {
  id: string;
  name: string;
  description: string;
  price: string;
  size: string;
  recommended: boolean;
  previewImage: React.ReactNode;
}
interface AdFormatSelectorProps {
  selectedFormat: string | null;
  onFormatSelect: (formatId: string) => void;
}
export const AdFormatSelector: React.FC<AdFormatSelectorProps> = ({
  selectedFormat,
  onFormatSelect
}) => {
  const adFormats: AdFormat[] = [
  {
    id: 'compact',
    name: 'Compact Text Ad',
    description: 'Perfect for community feeds',
    price: '$5/day per community',
    size: 'Small (300x100px)',
    recommended: false,
    previewImage:
    <div className="w-full h-24 bg-gray-100 rounded border border-gray-300 p-3 flex flex-col justify-center">
          <div className="text-sm font-medium text-gray-800">
            Your text ad title goes here
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Brief description of your product or service
          </div>
        </div>

  },
  {
    id: 'standard',
    name: 'Standard Card',
    description: 'Best engagement rates',
    price: '$15/day per community',
    size: 'Medium (300x250px)',
    recommended: true,
    previewImage:
    <div className="w-full h-60 bg-gray-100 rounded border border-gray-300 overflow-hidden flex flex-col">
          <div className="h-32 bg-blue-100 flex items-center justify-center text-blue-400">
            <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">

              <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />

            </svg>
          </div>
          <div className="p-3">
            <div className="text-sm font-medium text-gray-800">
              Your card ad title goes here
            </div>
            <div className="text-xs text-gray-600 mt-1">
              A more detailed description of your product or service with room
              for additional information about features and benefits.
            </div>
          </div>
        </div>

  },
  {
    id: 'banner',
    name: 'Featured Banner',
    description: 'Maximum visibility at top of community',
    price: '$30/day per community',
    size: 'Large (728x90px desktop, 320x50px mobile)',
    recommended: false,
    previewImage:
    <div className="w-full h-20 bg-gray-100 rounded border border-gray-300 p-3 flex items-center">
          <div className="h-12 w-12 bg-blue-100 rounded flex items-center justify-center text-blue-400 mr-3">
            <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">

              <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />

            </svg>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-800">
              Your banner ad title goes here
            </div>
            <div className="text-xs text-gray-600">
              Brief description of your product or service
            </div>
          </div>
          <button className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
            Learn More
          </button>
        </div>

  },
  {
    id: 'premium',
    name: 'Premium Showcase',
    description: 'Sidebar placement with rich media',
    price: '$50/day per community',
    size: 'Extra Large (300x600px)',
    recommended: false,
    previewImage:
    <div className="w-full h-96 bg-gray-100 rounded border border-gray-300 overflow-hidden flex flex-col">
          <div className="h-48 bg-blue-100 flex items-center justify-center text-blue-400">
            <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-16 w-16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">

              <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />

            </svg>
          </div>
          <div className="p-4 flex-1">
            <div className="text-lg font-medium text-gray-800 mb-2">
              Your premium ad title goes here
            </div>
            <div className="text-sm text-gray-600 mb-3">
              A comprehensive description of your product or service with ample
              room for details about features, benefits, and value proposition.
            </div>
            <div className="text-sm text-gray-600 mb-3">
              • Feature point one about your offering
              <br />
              • Feature point two about your offering
              <br />• Feature point three about your offering
            </div>
            <div className="mt-auto">
              <button className="bg-blue-600 text-white w-full py-2 rounded font-medium">
                Learn More
              </button>
            </div>
          </div>
        </div>

  }];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {adFormats.map((format) =>
      <div
        key={format.id}
        onClick={() => onFormatSelect(format.id)}
        className={`
            border-2 rounded-lg p-5 cursor-pointer transition-all relative
            ${selectedFormat === format.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
          `}>

          {format.recommended &&
        <div className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-bl-lg rounded-tr-lg">
              RECOMMENDED
            </div>
        }
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {format.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{format.description}</p>
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <span className="font-medium mr-1">Size:</span> {format.size}
              </div>
              <div className="text-blue-600 font-medium">{format.price}</div>
            </div>
            <div className="ml-4 h-6 w-6 rounded-full border-2 flex items-center justify-center">
              {selectedFormat === format.id &&
            <Check className="h-4 w-4 text-blue-600" />
            }
            </div>
          </div>
          <div className="mt-4 max-w-xs mx-auto">{format.previewImage}</div>
        </div>
      )}
    </div>);

};