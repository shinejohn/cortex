import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Smartphone,
  Monitor,
  X,
  Info } from
'lucide-react';
import { AdPreview } from './AdPreview';
interface AdCreationFormProps {
  adFormat: string;
  adData: {
    title: string;
    image: any;
    bodyText: string;
    callToAction: string;
    destinationUrl: string;
  };
  onAdDataChange: (field: string, value: any) => void;
}
export const AdCreationForm: React.FC<AdCreationFormProps> = ({
  adFormat,
  adData,
  onAdDataChange
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>(
    'desktop'
  );
  const [showUrlPreview, setShowUrlPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formatLabels: Record<string, string> = {
    compact: 'Compact Text Ad',
    standard: 'Standard Card',
    banner: 'Featured Banner',
    premium: 'Premium Showcase'
  };
  const formatSpecs: Record<
    string,
    {
      dimensions: string;
      maxChars: {
        title: number;
        body: number;
      };
    }> =
  {
    compact: {
      dimensions: '300x100px',
      maxChars: {
        title: 40,
        body: 80
      }
    },
    standard: {
      dimensions: '300x250px',
      maxChars: {
        title: 60,
        body: 120
      }
    },
    banner: {
      dimensions: '728x90px (desktop), 320x50px (mobile)',
      maxChars: {
        title: 30,
        body: 60
      }
    },
    premium: {
      dimensions: '300x600px',
      maxChars: {
        title: 80,
        body: 200
      }
    }
  };
  const callToActionOptions = [
  'Learn More',
  'Join Now',
  'Shop Now',
  'Sign Up',
  'Visit Site',
  'Download',
  'Get Started',
  'Contact Us'];

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= formatSpecs[adFormat].maxChars.title) {
      onAdDataChange('title', value);
    }
  };
  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= formatSpecs[adFormat].maxChars.body) {
      onAdDataChange('bodyText', value);
    }
  };
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  const handleFile = (file: File) => {
    // Check file type
    if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
      alert('Please upload a JPG or PNG image');
      return;
    }
    // Check file size (500KB max)
    if (file.size > 500 * 1024) {
      alert('File size exceeds 500KB limit');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target) {
        onAdDataChange('image', e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };
  const removeImage = () => {
    onAdDataChange('image', null);
  };
  const stockImages = [
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Create your {formatLabels[adFormat]} ad
        </h1>
        <p className="text-gray-600 mb-6">
          Design an engaging ad that resonates with your target community
        </p>
        {/* Ad Title */}
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <label
              htmlFor="ad-title"
              className="block text-sm font-medium text-gray-700">

              Ad Title
            </label>
            <span className="text-xs text-gray-500">
              {adData.title.length}/{formatSpecs[adFormat].maxChars.title} chars
            </span>
          </div>
          <input
            type="text"
            id="ad-title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Announcing our community meetup"
            value={adData.title}
            onChange={handleTitleChange} />

        </div>
        {/* Ad Image */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ad Image
          </label>
          <div className="text-xs text-gray-500 mb-2 flex items-center">
            <Info className="h-3 w-3 mr-1" />
            <span>
              Requirements: {formatSpecs[adFormat].dimensions}, JPG/PNG, Max
              500KB
            </span>
          </div>
          {!adData.image ?
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}>

              <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-1">
                Drag and drop your image here, or click to browse
              </p>
              <p className="text-xs text-gray-500">JPG or PNG, max 500KB</p>
              <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg, image/png"
              className="hidden"
              onChange={handleFileInput} />

            </div> :

          <div className="relative">
              <img
              src={adData.image}
              alt="Ad preview"
              className="w-full h-auto rounded-lg max-h-64 object-contain border border-gray-200" />

              <button
              onClick={removeImage}
              className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white rounded-full p-1 hover:bg-opacity-90">

                <X className="h-4 w-4" />
              </button>
            </div>
          }
          {/* Stock image library */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Or choose from stock images
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {stockImages.map((image, index) =>
              <div
                key={index}
                className="border rounded-md overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => onAdDataChange('image', image)}>

                  <img
                  src={image}
                  alt={`Stock ${index + 1}`}
                  className="w-full h-16 object-cover" />

                </div>
              )}
            </div>
          </div>
        </div>
        {/* Body Text */}
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <label
              htmlFor="body-text"
              className="block text-sm font-medium text-gray-700">

              Body Text
            </label>
            <span className="text-xs text-gray-500">
              {adData.bodyText.length}/{formatSpecs[adFormat].maxChars.body}{' '}
              chars
            </span>
          </div>
          <textarea
            id="body-text"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Join fellow developers for our monthly..."
            value={adData.bodyText}
            onChange={handleBodyChange}>
          </textarea>
        </div>
        {/* Call to Action */}
        <div className="mb-6">
          <label
            htmlFor="call-to-action"
            className="block text-sm font-medium text-gray-700 mb-1">

            Call to Action
          </label>
          <select
            id="call-to-action"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={adData.callToAction}
            onChange={(e) => onAdDataChange('callToAction', e.target.value)}>

            {callToActionOptions.map((option) =>
            <option key={option} value={option}>
                {option}
              </option>
            )}
          </select>
        </div>
        {/* Destination URL */}
        <div className="mb-6">
          <label
            htmlFor="destination-url"
            className="block text-sm font-medium text-gray-700 mb-1">

            Destination URL
          </label>
          <div className="relative">
            <input
              type="url"
              id="destination-url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              placeholder="https://your-website.com/landing-page"
              value={adData.destinationUrl}
              onChange={(e) => onAdDataChange('destinationUrl', e.target.value)}
              onFocus={() => setShowUrlPreview(true)}
              onBlur={() => setTimeout(() => setShowUrlPreview(false), 200)} />

            <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          {/* URL Preview */}
          {showUrlPreview && adData.destinationUrl &&
          <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
              <div className="text-xs text-gray-500 mb-1">
                Users will be directed to:
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-800 truncate">
                  {adData.destinationUrl}
                </span>
              </div>
            </div>
          }
        </div>
      </div>
      {/* Right side - Preview */}
      <div className="w-full lg:w-1/2 bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Live Preview</h2>
          <div className="flex bg-gray-200 rounded-md p-1">
            <button
              className={`px-3 py-1 rounded text-sm ${previewDevice === 'desktop' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              onClick={() => setPreviewDevice('desktop')}>

              <Monitor className="h-4 w-4 inline mr-1" />
              Desktop
            </button>
            <button
              className={`px-3 py-1 rounded text-sm ${previewDevice === 'mobile' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              onClick={() => setPreviewDevice('mobile')}>

              <Smartphone className="h-4 w-4 inline mr-1" />
              Mobile
            </button>
          </div>
        </div>
        <AdPreview adFormat={adFormat} adData={adData} device={previewDevice} />
      </div>
    </div>);

};