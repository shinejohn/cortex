import React from 'react';
import { Instagram, Twitter, Facebook, Youtube, Globe } from 'lucide-react';
interface SocialLinksStepProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  errors: Record<string, string>;
}
export const SocialLinksStep: React.FC<SocialLinksStepProps> = ({
  formData,
  updateFormData,
  errors
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Connect Your Social Media
      </h1>
      <p className="text-gray-600 mb-6">
        Help your audience find you across platforms. All fields are optional.
      </p>
      <div className="space-y-6">
        {/* Instagram URL */}
        <div>
          <label
            htmlFor="instagramUrl"
            className="block text-sm font-medium text-gray-700 mb-1">

            Instagram URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Instagram className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              id="instagramUrl"
              value={formData.instagramUrl}
              onChange={(e) => updateFormData('instagramUrl', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border ${errors.instagramUrl ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary`}
              placeholder="https://instagram.com/yourusername" />

          </div>
          {errors.instagramUrl &&
          <p className="mt-1 text-sm text-red-500">{errors.instagramUrl}</p>
          }
        </div>
        {/* Twitter/X URL */}
        <div>
          <label
            htmlFor="twitterUrl"
            className="block text-sm font-medium text-gray-700 mb-1">

            Twitter/X URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Twitter className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              id="twitterUrl"
              value={formData.twitterUrl}
              onChange={(e) => updateFormData('twitterUrl', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border ${errors.twitterUrl ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary`}
              placeholder="https://twitter.com/yourusername" />

          </div>
          {errors.twitterUrl &&
          <p className="mt-1 text-sm text-red-500">{errors.twitterUrl}</p>
          }
        </div>
        {/* Facebook URL */}
        <div>
          <label
            htmlFor="facebookUrl"
            className="block text-sm font-medium text-gray-700 mb-1">

            Facebook URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Facebook className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              id="facebookUrl"
              value={formData.facebookUrl}
              onChange={(e) => updateFormData('facebookUrl', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border ${errors.facebookUrl ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary`}
              placeholder="https://facebook.com/yourpage" />

          </div>
          {errors.facebookUrl &&
          <p className="mt-1 text-sm text-red-500">{errors.facebookUrl}</p>
          }
        </div>
        {/* YouTube URL */}
        <div>
          <label
            htmlFor="youtubeUrl"
            className="block text-sm font-medium text-gray-700 mb-1">

            YouTube URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Youtube className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              id="youtubeUrl"
              value={formData.youtubeUrl}
              onChange={(e) => updateFormData('youtubeUrl', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border ${errors.youtubeUrl ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary`}
              placeholder="https://youtube.com/c/yourchannel" />

          </div>
          {errors.youtubeUrl &&
          <p className="mt-1 text-sm text-red-500">{errors.youtubeUrl}</p>
          }
        </div>
        {/* Website URL */}
        <div>
          <label
            htmlFor="websiteUrl"
            className="block text-sm font-medium text-gray-700 mb-1">

            Website URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              id="websiteUrl"
              value={formData.websiteUrl}
              onChange={(e) => updateFormData('websiteUrl', e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border ${errors.websiteUrl ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-news-primary`}
              placeholder="https://yourwebsite.com" />

          </div>
          {errors.websiteUrl &&
          <p className="mt-1 text-sm text-red-500">{errors.websiteUrl}</p>
          }
        </div>
        {/* Preview Card */}
        <div className="mt-8 border border-gray-200 rounded-lg p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Social Links Preview
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {formData.instagramUrl &&
            <a
              href={formData.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
              aria-label="Instagram">

                <Instagram className="h-5 w-5" />
              </a>
            }
            {formData.twitterUrl &&
            <a
              href={formData.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
              aria-label="Twitter">

                <Twitter className="h-5 w-5" />
              </a>
            }
            {formData.facebookUrl &&
            <a
              href={formData.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
              aria-label="Facebook">

                <Facebook className="h-5 w-5" />
              </a>
            }
            {formData.youtubeUrl &&
            <a
              href={formData.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
              aria-label="YouTube">

                <Youtube className="h-5 w-5" />
              </a>
            }
            {formData.websiteUrl &&
            <a
              href={formData.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700"
              aria-label="Website">

                <Globe className="h-5 w-5" />
              </a>
            }
            {!formData.instagramUrl &&
            !formData.twitterUrl &&
            !formData.facebookUrl &&
            !formData.youtubeUrl &&
            !formData.websiteUrl &&
            <p className="text-sm text-gray-500 italic">
                  No social links added yet
                </p>
            }
          </div>
          <p className="mt-3 text-xs text-gray-500 text-center">
            These icons will appear on your creator profile
          </p>
        </div>
      </div>
    </div>);

};